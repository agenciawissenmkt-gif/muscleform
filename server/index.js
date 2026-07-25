import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PORT = process.env.PORT || 8787;

const app = express();
app.use(cors());
app.use(express.json({ limit: '20mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, configured: Boolean(OPENAI_API_KEY) });
});

app.post('/api/transform', async (req, res) => {
  if (!OPENAI_API_KEY) {
    res.status(503).json({ error: 'O servidor ainda não tem uma chave da OpenAI configurada.' });
    return;
  }

  const { imageBase64, maskBase64, prompt } = req.body ?? {};
  if (typeof imageBase64 !== 'string' || typeof prompt !== 'string' || !prompt.trim()) {
    res.status(400).json({ error: 'imageBase64 e prompt são obrigatórios.' });
    return;
  }

  try {
    const toBlob = (dataUrl) => {
      const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
      return new Blob([Buffer.from(base64, 'base64')], { type: 'image/png' });
    };

    const form = new FormData();
    form.append('model', 'gpt-image-1');
    form.append('image', toBlob(imageBase64), 'photo.png');
    if (typeof maskBase64 === 'string') {
      form.append('mask', toBlob(maskBase64), 'mask.png');
    }
    form.append('prompt', prompt);
    form.append('size', '1024x1024');
    form.append('quality', 'medium');
    form.append('n', '1');

    const openaiRes = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: form,
    });

    const data = await openaiRes.json();
    if (!openaiRes.ok) {
      console.error('[openai] error', data);
      res.status(502).json({ error: data.error?.message || 'Falha ao gerar a transformação.' });
      return;
    }

    const b64 = data.data?.[0]?.b64_json;
    if (!b64) {
      res.status(502).json({ error: 'Resposta inesperada da IA.' });
      return;
    }
    res.json({ imageBase64: `data:image/png;base64,${b64}` });
  } catch (err) {
    console.error('[transform] error', err);
    res.status(500).json({ error: 'Erro interno ao processar a imagem.' });
  }
});

app.listen(PORT, () => {
  console.log(`Your Beauty AI server rodando em http://localhost:${PORT}`);
});
