# Sonhos de Brincar — E-commerce do ateliê

Loja online do ateliê **Sonhos de Brincar** (bonecas de pano feitas à mão).
Site em rosa claro, com as fotos das peças, página de venda interativa e
checkout pelo WhatsApp.

O catálogo **vem todo do Supabase** — não existe produto escrito no código. Quem
manda no que aparece na loja é o painel administrativo.

Instagram do ateliê: [@sonhosdebrincar.atelie](https://www.instagram.com/sonhosdebrincar.atelie)

## Como rodar

```bash
npm install
npm run dev      # abre em http://localhost:5173
npm run build    # gera a versão de produção em dist/
npm run preview  # testa a versão de produção
npm run lint
```

### Preview em arquivo único

Para mandar o site por WhatsApp/e-mail ou abrir sem servidor nenhum:

```bash
npm run preview:arquivo
```

Gera `preview/sonhos-de-brincar.html` — um arquivo só, com CSS, JavaScript e
fontes embutidos. É só dar dois cliques que abre no navegador (usa endereços
com `#` para funcionar offline). As bonecas continuam vindo do Supabase, então o
arquivo precisa das variáveis de ambiente no momento em que é gerado, e de
internet para buscar o catálogo.

Feito com Vite + React + TypeScript + Tailwind CSS 4 + Framer Motion, com o
catálogo no Supabase. A loja continua sendo um site estático (Vercel, Netlify ou
qualquer hospedagem comum) — ela só precisa das duas variáveis de ambiente do
Supabase para ler os produtos.

## O que o site tem

- **Home** com a foto da boneca em destaque, vitrine automática, categorias,
  destaques, o passo a passo "como nasce uma boneca", segurança, seção para avós
  e depoimentos.
- **Catálogo** (`/bonecas`) com busca, filtro por categoria e ordenação animada.
- **Páginas de categoria** (`/categoria/:slug`) — 6 coleções, incluindo os bonecos.
- O ateliê **não trabalha com personalização**: cada peça é única e sai como está na foto.
- **Página de venda** (`/boneca/:slug`) com:
  - **foto real** da peça (URL cadastrada no painel), com **zoom** nos detalhes da
    costura;
  - selo de **segurança** em destaque: tecido antialérgico, não solta pelinho, nenhuma peça
    que possa soltar, costura dupla que não rasga e uso seguro desde o primeiro dia,
    inclusive para bebês prematuros;
  - recadinho **"presente de avó"**;
  - botão de compra **verde fluorescente "Realize seu sonho"** que abre o WhatsApp
    com o pedido já escrito;
  - história da boneca, materiais, medidas, cuidados, prazo e pagamento;
  - barra de compra fixa no celular, que sai da frente quando o botão principal aparece.
- **Sacolinha** lateral + página `/carrinho`, salvas no navegador, com fechamento no WhatsApp.
- **O Ateliê** (`/sobre`) e **Contato** (`/contato`) com FAQ e formulário que monta a
  mensagem do WhatsApp.
- Responsivo de verdade (menu lateral no celular), animações de entrada, transições
  entre páginas, barra de progresso de rolagem e respeito a `prefers-reduced-motion`.

## Conectar ao Supabase

O catálogo (produtos, categorias, fotos, textos) mora no Supabase. A loja só lê;
quem escreve é o painel, com login.

### 1. Criar as tabelas

No Supabase, abra **SQL Editor** e rode, nesta ordem:

1. `supabase/schema.sql` — cria as tabelas `produtos` e `categorias`, os índices,
   as regras de segurança (RLS) e o balde de fotos.
2. `supabase/seed.sql` — coloca o catálogo inicial (6 categorias e 29 peças).
   Rodar de novo não duplica nada: atualiza pelo `slug`.

### 2. Pegar as credenciais

Em **Project Settings → Data API**, copie:

- a **URL** do projeto (`https://xxxx.supabase.co`);
- a chave **anon / public**.

> A chave `service_role` **nunca** entra na loja. Ela dá acesso total ao banco.

### 3. Rodar na sua máquina

```bash
cp .env.example .env.local   # e preencha as duas variáveis
npm install
npm run dev
```

### 4. Configurar na Vercel

**Settings → Environment Variables**, marcando os três ambientes
(Production, Preview e Development):

| Nome | Valor |
| --- | --- |
| `VITE_SUPABASE_URL` | a URL do projeto |
| `VITE_SUPABASE_ANON_KEY` | a chave anon/public |

Depois **Redeploy** — variável de ambiente só entra em build novo.

> **Atenção ao prefixo:** este projeto é **Vite**, não Next.js. O padrão aqui é
> `VITE_`. Para facilitar, o build também aceita `NEXT_PUBLIC_SUPABASE_URL` e
> `NEXT_PUBLIC_SUPABASE_ANON_KEY` (veja `envPrefix` no `vite.config.ts`) — se você
> já cadastrou com esses nomes na Vercel, funciona do mesmo jeito.

### 5. Fotos das bonecas

O campo `foto` (e `foto_estudio`) guarda uma **URL pública**. Duas formas:

- **Storage do Supabase**: o `schema.sql` já cria o balde `produtos` como público.
  Envie a foto pelo painel e salve a URL pública no produto.
- **Imagem hospedada fora**: cole a URL direto no campo. Funciona igual.

Se o arquivo não abrir, entra um espaço reservado no tom do site ("foto a
caminho") — nunca aparece imagem quebrada.

### O que a loja consegue fazer

| Ação | Loja (chave anon) | Painel (usuário logado) |
| --- | --- | --- |
| Ler produtos e categorias **ativos** | ✅ | ✅ |
| Ler o que está inativo | ❌ | ✅ |
| Criar, editar, apagar | ❌ | ✅ |
| Enviar fotos | ❌ | ✅ |

## Mudar as informações da loja

Tudo o que é "dado do negócio" está separado do código:

| O que mudar | Arquivo |
| --- | --- |
| WhatsApp, Instagram, e-mail, cidade, slogan, prazo | `src/config/site.ts` |
| Produtos, preços, textos, categorias | painel administrativo (Supabase) |
| Cores do site (rosa, creme, verde neon) | `src/index.css` (bloco `@theme`) |

### WhatsApp

O número fica em `src/config/site.ts`:

```ts
whatsappExibicao: '+55 (41) 98500-1824',  // como aparece escrito no site
whatsappNumero: '5541985001824',          // usado no link wa.me (só números)
```

> `whatsappNumero` precisa do número completo, com DDI, DDD e o nono dígito, sem
> espaço nem traço — é assim que o link `wa.me` abre a conversa.

### Produtos

Cada boneca é uma linha da tabela `produtos`, editada pelo painel. Os campos
batem com as seções da página de venda:

| Campo no banco | Onde aparece na loja |
| --- | --- |
| `nome`, `resumo`, `preco`, `preco_de` | cartão e topo da página |
| `historia` | seção "A História Dela" |
| `presente_avo` | seção "Presente de Vó" (vazio = texto padrão) |
| `materiais` | "Materiais e acabamento" |
| `cuidados` | "Como cuidar" |
| `altura` | "Medidas" |
| `foto`, `foto_estudio`, `legenda_foto` | fotos do produto e do topo da home |
| `categoria_slug` | coleção a que pertence |
| `destaque`, `mais_vendida`, `novidade` | vitrines e etiquetas |
| `ordem`, `ativo` | posição na listagem e se aparece na loja |

A loja mostra **somente a foto** cadastrada no painel. Peça sem foto aparece com
um espaço reservado no tom do site ("foto a caminho") — nunca com imagem quebrada.
As colunas `spec_3d` e `capa_spec` continuam no banco por compatibilidade, mas a
loja não lê mais nenhuma das duas.

## Estrutura

```
src/
  config/site.ts          dados da loja (WhatsApp, redes, textos)
  lib/supabase.ts         conexão com o Supabase (lê as variáveis de ambiente)
  lib/formato.ts          preço e parcelas
  services/catalogo.ts    todas as consultas ao banco — único ponto de contato
  store/catalogo.tsx      carrega o catálogo uma vez e distribui para as páginas
  store/carrinho.tsx      sacolinha (salva no navegador)
  data/types.ts           tipos do catálogo
  components/             FotoBoneca, cards, cabeçalho, rodapé, sacolinha
  components/EstadoCatalogo.tsx  carregando e mensagens de erro
  pages/                  Início, Catálogo, Produto, Sobre, Contato, Carrinho, 404
supabase/
  schema.sql              tabelas, índices, RLS e balde de fotos
  seed.sql                catálogo inicial
```
