# Conectando o app ao seu projeto Supabase

Passo a passo para apontar o Wissen Cars para um projeto Supabase já existente.
Ao final, `npm run check` confirma item por item se está tudo no lugar.

---

## 1. Rodar a migração

No painel do Supabase, abra **SQL Editor › New query**, cole todo o conteúdo de
`supabase/migrations/0001_wissen_cars.sql` e execute.

Isso cria:

- as tabelas `tenants`, `tenant_channels`, `tenant_settings`, `tenant_google_credentials`,
  `salespeople`, `cars` e `car_photos`;
- as políticas de RLS que isolam uma loja da outra (cada lojista só enxerga o que é dele);
- o bucket `car-photos` com permissão de escrita apenas na pasta da própria loja;
- as funções `tenant_context(account_id, inbox_id)` e `api_cars(tenant, model, status)`,
  usadas pelo agente no N8N.

O script pode ser executado mais de uma vez sem quebrar nada.

## 2. Ativar o login com Google

1. **Authentication › Providers › Google**: habilite e cole o Client ID e o Client Secret
   de um OAuth Client do tipo *Aplicativo da Web* criado no
   [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. No Google Cloud, em **URIs de redirecionamento autorizados**, cadastre a URL que o próprio
   Supabase mostra nessa tela (`https://SEU-PROJETO.supabase.co/auth/v1/callback`).
3. **Authentication › URL Configuration**: em *Site URL* coloque o endereço do app
   (`http://localhost:5173` em desenvolvimento, o domínio final em produção) e repita em
   *Redirect URLs*.

## 3. Apontar o app para o projeto

```bash
cp .env.example .env
```

Preencha com os valores de **Project Settings › API**:

```
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

> A `anon key` é pública por natureza — quem protege os dados é a RLS. A **service_role key**
> nunca entra aqui: ela vai só em `server/.env`, que não é versionado.

## 4. Conferir

```bash
npm run check
```

Saída esperada:

```
  ✓  Conexão com o projeto            seu-projeto.supabase.co
  ✓  Tabela tenants                   existe e responde
  ...
  ✓  Bucket car-photos                criado e público para leitura
  ✓  Login com Google                 provedor habilitado
```

Depois:

```bash
npm run dev
```

Entre com a conta Google do lojista — a loja é criada sozinha no primeiro acesso.

---

## 5. Integrações da implementação (etapas 2, 3 e 4)

Essas etapas passam pelo servidor (`npm run server`), que guarda as chaves privilegiadas.
Copie `server/.env.example` para `server/.env` e preencha conforme for ativando cada uma:

| Etapa | Variáveis | Onde conseguir |
| --- | --- | --- |
| Base | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `APP_URL` | Project Settings › API |
| 2 — Google Agenda | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` | Google Cloud Console (pode ser o mesmo OAuth Client do login, adicionando `APP_URL/api/google/callback` como redirect) |
| 3 — Chatwoot | `CHATWOOT_BASE_URL`, `CHATWOOT_PLATFORM_TOKEN` | Chatwoot › Super Admin › Platform Apps |
| 4 — WhatsApp | `EVOLUTION_API_URL`, `EVOLUTION_API_KEY` | Painel da sua Evolution API |
| Final | `N8N_PROVISIONING_WEBHOOK_URL` | URL do nó Webhook do fluxo de provisionamento |

Enquanto uma chave não existir, a etapa correspondente mostra na tela exatamente qual variável
falta — o estoque e o dashboard seguem funcionando normalmente.

Para testar a etapa 4 (QR Code e a comemoração) sem WhatsApp real, use `WISSEN_SIMULATE=true`
em `server/.env`: o servidor devolve um QR de simulação e reporta a conexão em ~12 segundos.

## 6. Conferindo o que o N8N vai ler

Com a loja cadastrada e o WhatsApp conectado, no SQL Editor:

```sql
-- contexto da loja pelo par conta/inbox do Chatwoot
select tenant_context(1, 42);

-- estoque com ficha técnica e fotos ordenadas (aceita o slug ou o UUID da loja)
select api_cars('auto-wissen-motors', null, 'ativo');
```
