# Beauty and self

Provador virtual de **cortes e cores de cabelo** com IA, feito para salões de beleza.

A cliente tira uma foto (ou escolhe uma da galeria), o salão escolhe **só o corte**, **só a cor** ou **os dois juntos**, e em alguns segundos aparece o resultado. O rosto, a identidade e o cenário da foto são preservados. Depois é só **salvar na galeria**, **baixar em JPG ou PNG** ou **enviar pelo WhatsApp**.

- Feito primeiro para o celular, mas funciona também no computador e no tablet. Dá para "instalar" na tela inicial do celular.
- Login com conta Google (só o login: nenhum serviço pago do Google Cloud).
- IA: **Meta Muse Image** pelo [fal.ai](https://fal.ai), a ~US$0,01 por imagem.
- Catálogo com centenas de cortes femininos (brasileiros e internacionais) e de cores e técnicas de coloração, com uma única barra de pesquisa.
- Os prompts da IA (em inglês) ficam **somente no servidor**. A cliente nunca os vê.

---

## Como funciona

```
Celular / computador (app)            Servidor (sua VPS / EasyPanel)              fal.ai
──────────────────────────            ──────────────────────────────              ──────
foto + id do corte/cor   ───────────▶  confere o login e o limite de uso
                                       monta o prompt em inglês (secreto)  ─────▶  Muse Image
mostra o resultado       ◀───────────  devolve a imagem                    ◀─────  edita só o cabelo
```

- **`src/`**: o aplicativo (React + Vite + Tailwind). Telas: login → início → câmera → escolha → carregamento → resultado.
- **`src/catalog/data/`**: o catálogo público (nomes e descrições em português).
- **`server/`**: o servidor (Node + Express). Guarda a chave da IA, faz o login, limita o uso e chama o Muse. `server/app.js` tem as rotas; `server/index.js` liga o servidor na VPS/EasyPanel; `api/index.js` é a entrada na Vercel.
- **`server/prompts/`**: os prompts em inglês de cada corte e cor.
- **`server/prompts.js`**: o "prompt mestre", com as regras que valem para toda geração: mexer só no cabelo, não alterar rosto, pele, maquiagem, expressão, roupa, fundo, luz nem enquadramento, e resultado realista fio a fio.

A foto **não é salva** no servidor. A chamada ao fal.ai usa `sync_mode`, então a imagem também não fica no histórico do fal.

---

## 1. O que você precisa

| O quê | Para quê | Onde |
|---|---|---|
| **Chave do fal.ai** (`FAL_KEY`) | Gerar as imagens com o Muse | fal.ai → *Settings* → *API Keys* (coloque créditos em *Billing*) |
| **ID do cliente Google** (`GOOGLE_CLIENT_ID`) | Botão "Entrar com Google" | Passo a passo abaixo (é gratuito) |
| **Segredo da sessão** (`SESSION_SECRET`) | Manter as pessoas logadas com segurança | Qualquer texto longo e aleatório |

Todas as variáveis estão explicadas em [`server/.env.example`](server/.env.example).

### Como criar o ID do cliente Google

O botão "Entrar com Google" exige um cadastro gratuito no console do Google. **Não liga nenhum serviço pago e não pede cartão.** É só o registro do botão de login.

1. Acesse <https://console.cloud.google.com/> com sua conta Google e crie um projeto (ex.: "Beauty and self").
2. Menu **APIs e serviços → Tela de permissão OAuth** (ou **Google Auth Platform**):
   - Preencha o nome do app, o e-mail de suporte e escolha o público **Externo**.
   - Enquanto o app estiver em "Teste", só entram os e-mails que você adicionar em **Usuários de teste**. Para liberar qualquer conta, clique em **Publicar app**. Como o app só pede nome, e-mail e foto, isso não exige análise do Google.
3. **Credenciais / Clientes → Criar cliente → Aplicativo da Web**.
4. Em **Origens JavaScript autorizadas**, adicione:
   - `https://seu-dominio.com.br` (o endereço do app no EasyPanel);
   - para testar no computador: `http://localhost`, `http://localhost:5173` e `http://localhost:8787`.
5. Em **URIs de redirecionamento autorizados**, adicione `https://seu-dominio.com.br/api/auth/google/redirect` (usado quando o app está instalado na tela inicial do celular).
6. Clique em **Criar** e copie o **ID do cliente** (termina em `.apps.googleusercontent.com`). Esse é o seu `GOOGLE_CLIENT_ID`.

> Quer limitar quem pode entrar? Use `ALLOWED_EMAILS` (ex.: `ana@gmail.com,@meusalao.com.br`).

---

## 2. Publicar no EasyPanel (sua VPS)

O projeto já tem um `Dockerfile`: o mesmo servidor entrega o app e a API.

1. No EasyPanel: **Criar projeto → + Serviço → App**.
2. **Fonte**: GitHub → este repositório e a branch desejada.
3. **Build**: escolha **Dockerfile** (caminho `Dockerfile`).
4. **Environment**: cole as variáveis do `server/.env.example`, preenchidas:
   ```
   FAL_KEY=...
   GOOGLE_CLIENT_ID=...apps.googleusercontent.com
   SESSION_SECRET=um-texto-bem-longo-e-aleatorio
   AI_MODEL=muse
   DEMO_LOGIN=false
   ```
5. **Domains**: adicione seu domínio ou subdomínio apontando para a **porta 8787**, com **HTTPS ativado**. A câmera do celular **só funciona em HTTPS**.
6. Clique em **Deploy**. Para conferir, abra `https://seu-dominio/api/health`: deve aparecer `"ok": true` e `"ai": true`.
7. Volte ao console do Google e confirme que esse domínio está nas **Origens JavaScript autorizadas**.

**Dica:** no celular, abra o app e use **"Adicionar à tela inicial"**. Ele abre em tela cheia, como um aplicativo.

---

## 2b. Ou publicar na Vercel

O projeto também está pronto para a Vercel (`vercel.json` + `api/index.js`). O app vai para a CDN da Vercel e a API roda como uma função.

1. Na Vercel: **Add New → Project** → importe este repositório do GitHub. As configurações já vêm do `vercel.json`.
2. **Settings → Environment Variables**: adicione as mesmas variáveis (`FAL_KEY`, `GOOGLE_CLIENT_ID`, `SESSION_SECRET`, `ALLOWED_EMAILS`...).
3. Cada `git push` gera uma nova versão automaticamente.
4. No console do Google, adicione o endereço da Vercel (ex.: `https://beauty-and-self.vercel.app`) nas **Origens JavaScript autorizadas** e `https://…/api/auth/google/redirect` nos **URIs de redirecionamento**.

Diferenças em relação à VPS:
- Cada envio pode ter no máximo 4,5 MB. O app já reduz a foto, então fica bem abaixo disso.
- Os limites de uso por conta (`LIMIT_PER_HOUR` / `LIMIT_PER_DAY`) ficam na memória de cada instância da função. Na Vercel eles são aproximados.

---

## 3. Rodar no computador (para desenvolver)

```bash
npm install
cp server/.env.example server/.env   # preencha FAL_KEY e GOOGLE_CLIENT_ID (ou DEMO_LOGIN=true)

npm run server   # terminal 1 — API em http://localhost:8787
npm run dev      # terminal 2 — app em http://localhost:5173
```

Outros comandos:

| Comando | O que faz |
|---|---|
| `npm run check` | Confere o catálogo: todo corte/cor tem prompt no servidor e vice-versa |
| `npm run build` | Gera a versão de produção em `dist/` |
| `npm start` | Roda a versão de produção (app + API na mesma porta) |
| `npm run lint` | Verifica o código |

---

## 4. Personalizar

- **Adicionar ou editar um corte ou cor:**
  1. Edite o arquivo da categoria em `src/catalog/data/` (nome, apelidos para a busca, descrição e desenho).
  2. Edite o prompt com **o mesmo id** em `server/prompts/` (inglês, descrevendo só o cabelo).
  3. Rode `npm run check`.
- **Regras gerais da IA** (preservar rosto e fundo, realismo): `server/prompts.js`.
- **Trocar de modelo de IA no futuro:** adicione o modelo em `server/ai.js` (objeto `MODELS`) e mude `AI_MODEL`. O app não precisa mudar.
- **Limites de uso por conta:** `LIMIT_PER_HOUR` e `LIMIT_PER_DAY`. Só contam as imagens geradas com sucesso.
- **Cores e visual:** tokens no topo de `src/index.css` (roxos, orquídea e pétalas).

---

## 5. Custos e cuidados

- **Custo:** cada imagem custa ~US$0,01 no Muse (confira o valor atual no painel do fal.ai). Um salão com 900 imagens por mês gasta ~US$9–10.
- **LGPD:**
  - Peça autorização da cliente antes de fotografar (o app lembra disso na tela de login).
  - O app não guarda as fotos.
  - Menores de idade: autorização do responsável.
- **Resultado:** a imagem é uma simulação feita por IA. O app avisa isso na tela de resultado.
