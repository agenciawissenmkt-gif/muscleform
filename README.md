# Your Beauty

Provador virtual de cortes e cores de cabelo com IA, para salão de beleza. Câmera ao vivo com troca de cor real (100% no dispositivo), catálogo pesquisado de cortes e cores do Brasil e do mundo, e geração de transformação fotorrealista via IA generativa — sem nunca alterar o rosto da pessoa.

## Como funciona

- **Frontend** (`src/`): app React/Vite. A câmera ao vivo usa o modelo de segmentação multiclasse do MediaPipe (Google), rodando inteiramente no navegador, para identificar exatamente os pixels de cabelo (separado de rosto/pele/fundo) e trocar a cor em tempo real, e para gerar uma máscara de edição para a etapa de IA generativa.
- **Backend** (`server/`): um servidorzinho Express com um único endpoint (`/api/transform`) que repassa a foto + máscara + instrução para a API de edição de imagens da OpenAI (`gpt-image-1`) e devolve o resultado. Existe só para manter a chave de API em segurança — ela nunca é exposta ao navegador.

## Rodando localmente

```bash
npm install

# Terminal 1: frontend
npm run dev

# Terminal 2: backend (necessário para o botão "Gerar transformação realista com IA")
cp server/.env.example server/.env   # depois edite e cole sua OPENAI_API_KEY
npm run server
```

O Vite já está configurado para redirecionar `/api/*` para `http://localhost:8787` em desenvolvimento (veja `vite.config.ts`).

## Publicando (deploy)

O front-end (`npm run build`) é 100% estático e pode ser publicado em qualquer hospedagem (Vercel, Netlify, Cloudflare Pages etc).

O back-end (`server/`) precisa rodar em algum lugar com Node (Render, Railway, Fly.io, uma VPS...) com a variável de ambiente `OPENAI_API_KEY` configurada lá. Sem isso, tudo funciona normalmente exceto o botão de transformação fotorrealista, que mostra um aviso.

## Catálogo de cores e cortes

- **Cores** (`src/data/haircolors.ts`): geradas a partir do sistema profissional internacional de coloração (níveis 1–10 × reflexos), o mesmo usado por coloristas no Brasil e no mundo — veja `src/lib/colorLevelSystem.ts` — mais cores fantasia e técnicas (balayage, ombré etc).
- **Cortes** (`src/data/haircuts.ts`): cortes femininos reais, curtos, médios e longos, pesquisados no Brasil e internacionalmente.
