// Conexão com a IA de imagem (fal.ai). Para trocar de modelo no futuro basta
// adicionar uma entrada em MODELS e mudar AI_MODEL no .env — o app não muda.

export class AiError extends Error {
  constructor(message, status = 502) {
    super(message);
    this.status = status;
  }
}

const MODELS = {
  // Meta Muse Image — https://fal.ai/models/meta/muse-image/edit
  muse: {
    endpoint: 'meta/muse-image/edit',
    input: ({ prompt, image, aspectRatio }) => ({
      prompt,
      image_urls: [image],
      aspect_ratio: aspectRatio,
      num_images: 1,
      output_format: 'jpeg',
      // devolve a imagem direto na resposta e NÃO guarda no histórico do fal (LGPD)
      sync_mode: true,
    }),
  },
};

export function modelName() {
  return process.env.AI_MODEL && MODELS[process.env.AI_MODEL] ? process.env.AI_MODEL : 'muse';
}

export function aiReady() {
  return Boolean(process.env.FAL_KEY);
}

async function toDataUrl(url, signal) {
  if (url.startsWith('data:')) return url;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new AiError('A IA gerou a imagem, mas não consegui baixá-la. Tente de novo.');
  const type = res.headers.get('content-type') || 'image/jpeg';
  const buf = Buffer.from(await res.arrayBuffer());
  return `data:${type};base64,${buf.toString('base64')}`;
}

function friendlyError(status, body) {
  const detail = typeof body?.detail === 'string' ? body.detail : JSON.stringify(body?.detail ?? body ?? '');
  console.error(`[ai] fal respondeu ${status}: ${detail.slice(0, 500)}`);
  if (status === 401 || status === 403) {
    return new AiError('A chave da IA (FAL_KEY) é inválida ou não tem permissão. Confira no painel do fal.ai.', 502);
  }
  if (status === 402 || /balance|credit|billing|payment/i.test(detail)) {
    return new AiError('Os créditos da IA acabaram. Recarregue em fal.ai → Billing.', 502);
  }
  if (status === 422 || status === 400) {
    if (/nsfw|safety|content|policy|moderation/i.test(detail)) {
      return new AiError('A IA recusou esta foto. Tente outra foto, de frente e com boa luz.', 422);
    }
    return new AiError('A IA não aceitou esta foto. Tente outra foto, de frente e com boa luz.', 422);
  }
  if (status === 429) return new AiError('A IA está muito ocupada agora. Espere alguns segundos e tente de novo.', 503);
  return new AiError('A IA não conseguiu gerar a imagem agora. Tente de novo em instantes.', 502);
}

/**
 * Envia a foto + prompt para a IA e devolve a nova imagem como data URL.
 * Tenta de novo uma vez em caso de instabilidade (5xx / rede).
 */
export async function editImage({ prompt, image, aspectRatio, signal }) {
  if (!process.env.FAL_KEY) throw new AiError('A IA ainda não está conectada (falta FAL_KEY no servidor).', 503);
  const model = MODELS[modelName()];
  const base = (process.env.FAL_BASE_URL || 'https://fal.run').replace(/\/$/, '');
  const timeout = AbortSignal.timeout(Number(process.env.AI_TIMEOUT_MS) || 150_000);
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;

  for (let attempt = 1; attempt <= 2; attempt++) {
    let res;
    try {
      res = await fetch(`${base}/${model.endpoint}`, {
        method: 'POST',
        headers: { Authorization: `Key ${process.env.FAL_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(model.input({ prompt, image, aspectRatio })),
        signal: combined,
      });
    } catch (err) {
      if (signal?.aborted) throw err;
      if (timeout.aborted) throw new AiError('A IA demorou demais para responder. Tente de novo.', 504);
      if (attempt === 2) throw new AiError('Não consegui falar com a IA. Verifique a internet do servidor.', 502);
      continue;
    }
    const body = await res.json().catch(() => null);
    if (res.ok) {
      const url = body?.images?.[0]?.url;
      if (!url) {
        console.error('[ai] resposta sem imagem', JSON.stringify(body).slice(0, 300));
        throw new AiError('A IA não devolveu nenhuma imagem. Tente de novo.');
      }
      return toDataUrl(url, combined);
    }
    if (res.status >= 500 && attempt === 1) continue;
    throw friendlyError(res.status, body);
  }
  throw new AiError('A IA não conseguiu gerar a imagem agora. Tente de novo em instantes.');
}
