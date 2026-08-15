# Onde pegar cada chave

As quatro chaves que faltam vão em `server/.env` (copiado de `server/.env.example`,
que já vem com todas as URLs preenchidas). Nenhuma delas entra no front-end nem no git.

Depois de preencher, confira tudo de uma vez:

```bash
npm run check:server
```

O script testa cada chave contra a API de verdade e diz qual está errada — sem
imprimir segredo nenhum na tela.

---

## 1. Supabase — `SUPABASE_SERVICE_ROLE_KEY`

Painel do Supabase → projeto **wissen-cars-multitenant** → **Project Settings › API** →
seção *Project API keys* → copie a **`service_role`** (não a `anon`).

Essa chave ignora RLS. Ela existe só no servidor, para provisionar Chatwoot, Evolution e
Google em nome do lojista depois de conferir que ele é o dono da loja.

> Aproveite para colar essa mesma chave na credencial **"Supabase account"** do n8n
> (host `https://bhffexojdowetruhbpxs.supabase.co`) — hoje ela responde `401 Invalid API key`,
> o que derruba também os nós `Contexto do Tenant` e `Detalhes do carro` do agente.

---

## 2. Google Agenda — `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`

1. [console.cloud.google.com](https://console.cloud.google.com) → selecione (ou crie) o projeto.
2. **APIs e serviços › Biblioteca** → habilite a **Google Calendar API**.
3. **APIs e serviços › Tela de permissão OAuth** → tipo *Externo*, preencha nome e e-mail de
   suporte. Enquanto estiver em *Teste*, adicione seu e-mail em *Usuários de teste*.
4. **APIs e serviços › Credenciais › Criar credenciais › ID do cliente OAuth** →
   tipo **Aplicativo da Web**.
5. Em **URIs de redirecionamento autorizados**, cadastre exatamente:

   ```
   http://localhost:5173/api/google/callback
   ```

   Em produção, troque pelo seu domínio (`https://SEU-DOMINIO/api/google/callback`) e ajuste
   `APP_URL` e `GOOGLE_REDIRECT_URI` no `server/.env`. Os dois precisam bater com o que está
   cadastrado no Google, caractere por caractere.
6. Copie o **ID do cliente** e a **Chave secreta do cliente**.

Escopos pedidos pelo app: `calendar`, `calendar.events` e `userinfo.email` — ler horários
ocupados, criar/remarcar/cancelar visitas e identificar a conta conectada.

> Se você já tem um OAuth Client para o login do Google no Supabase, pode reaproveitar o
> mesmo: basta **adicionar** o redirect URI acima à lista existente.

---

## 3. Chatwoot — `CHATWOOT_PLATFORM_TOKEN`

Sua instalação: **https://wissen-chatwoot.2kk4lp.easypanel.host** (Chatwoot 4.13).

> **Atenção ao tipo do token.** O Chatwoot tem três tokens diferentes e só um serve aqui:
>
> | Token | Serve para | Como reconhecer |
> | --- | --- | --- |
> | **Platform App** | criar contas e usuários — é o que o painel precisa | `/super_admin` › Platform Apps |
> | Agent Bot | o agente responder mensagens (é o que o n8n usa) | responde `Access to this endpoint is not authorized for bots` na API de usuário |
> | Usuário | operar a própria conta | Perfil › Access Token |

1. Entre com a conta de **Super Admin** → `/super_admin`.
2. Menu **Platform Apps** → **New Platform App** (nome: `wissen-cars-painel`).
3. Copie o **Access Token** gerado.

É esse token que cria a sub-conta da loja e os usuários dos vendedores. Um token de usuário
comum (Perfil › Access Token) **não** serve — a API de plataforma recusa com 401.

> No `server/.env` use a URL **pública**. O `http://wissen_chatwoot:3000` que está no banco é
> o nome interno do Docker: continua certo para o n8n e a Evolution, que rodam na mesma rede,
> e por isso o app não sobrescreve esse valor.

---

## 4. Evolution API — `EVOLUTION_API_KEY`

Sua instalação: **https://wissen-evolution-api.2kk4lp.easypanel.host** (Evolution 2.3.7).

A chave é a **`AUTHENTICATION_API_KEY`** global, definida nas variáveis de ambiente do
container da Evolution (no EasyPanel: serviço da Evolution → *Environment*). É a mesma que
você usa para entrar no **manager** em `/manager`.

Confira se está certa:

```bash
curl -s -H "apikey: SUA_CHAVE" \
  https://wissen-evolution-api.2kk4lp.easypanel.host/instance/fetchInstances
```

Deve devolver a lista de instâncias (`[]` se não houver nenhuma). Se vier `401`, a chave está
errada.

---

## Situação atual (conferida em 15/08)

| Chave | Estado |
| --- | --- |
| `SUPABASE_SERVICE_ROLE_KEY` | ✓ válida |
| `EVOLUTION_API_KEY` | ✓ válida — 1 instância (`hftea5`, conectada) |
| `GOOGLE_CLIENT_ID` / `SECRET` | ✓ aceitos pelo Google (falta cadastrar o redirect URI) |
| `CHATWOOT_PLATFORM_TOKEN` | ✗ o token informado é de **Agent Bot**, não de Platform App |

A loja **já tem WhatsApp conectado**: instância `hftea5`, número 5541995096228, integrada à
inbox `Júlia - WhatsApp Wise Multimarcas` (conta 1, inbox 1) do Chatwoot. Esses dados foram
gravados em `tenant_channels`, então `tenant_context(1, 1)` já resolve a loja com os três
prompts — e a etapa 4 do painel reconhece a conexão existente em vez de pedir um QR novo.

## Ordem recomendada

1. Supabase — sem ela nada do servidor funciona (as outras rotas respondem 501).
2. Chatwoot — a etapa 3 cria a central; a etapa 4 depende dela para vincular a inbox.
3. Evolution — a etapa 4 gera o QR Code.
4. Google — pode ficar por último; a etapa 2 é a única que pode ser pulada sem travar o resto.

Enquanto uma chave não existir, a etapa correspondente mostra na tela exatamente qual
variável falta. Estoque e dashboard funcionam normalmente o tempo todo.
