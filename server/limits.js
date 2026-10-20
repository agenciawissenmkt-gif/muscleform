// Limite de uso por conta (protege seus créditos de IA contra abuso ou
// cliques repetidos). Fica na memória: zera quando o servidor reinicia.

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const history = new Map(); // email -> timestamps
const running = new Set(); // emails com uma geração em andamento

const perHour = () => Number(process.env.LIMIT_PER_HOUR) || 60;
const perDay = () => Number(process.env.LIMIT_PER_DAY) || 400;

/** Retorna uma mensagem de erro se a conta não puder gerar agora, ou null. */
export function checkLimit(email) {
  if (running.has(email)) return 'Aguarde a imagem anterior terminar.';
  const now = Date.now();
  const list = (history.get(email) || []).filter((t) => now - t < DAY);
  history.set(email, list);
  if (list.filter((t) => now - t < HOUR).length >= perHour()) {
    return `Limite de ${perHour()} imagens por hora atingido. Tente de novo mais tarde.`;
  }
  if (list.length >= perDay()) return `Limite de ${perDay()} imagens por dia atingido. Tente de novo amanhã.`;
  return null;
}

export function startJob(email) {
  running.add(email);
}

/** Conta no limite as imagens geradas e as canceladas no meio (falhas da IA não contam). */
export function finishJob(email, counted) {
  running.delete(email);
  if (!counted) return;
  const list = history.get(email) || [];
  list.push(Date.now());
  history.set(email, list);
}
