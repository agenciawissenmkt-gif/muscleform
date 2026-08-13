# Sonhos de Brincar — E-commerce do ateliê

Loja online do ateliê **Sonhos de Brincar** (bonecas de pano feitas à mão).
Site em rosa claro, com bonecas ilustradas em SVG animadas em 3D, página de venda
interativa e checkout pelo WhatsApp.

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
com `#` para funcionar offline).

Feito com Vite + React + TypeScript + Tailwind CSS 4 + Framer Motion.
Não precisa de servidor nem banco de dados: é um site estático, pode ser publicado
na Vercel, Netlify, GitHub Pages ou em qualquer hospedagem comum.

## O que o site tem

- **Home** com boneca girando em 3D, vitrine automática, categorias, destaques,
  o passo a passo "como nasce uma boneca", segurança, seção para avós e depoimentos.
- **Catálogo** (`/bonecas`) com busca, filtro por categoria e ordenação animada.
- **Páginas de categoria** (`/categoria/:slug`) — 6 coleções, incluindo os bonecos.
- O ateliê **não trabalha com personalização**: cada peça é única e sai como está na foto.
- **Página de venda** (`/boneca/:slug`) com:
  - **foto real** da peça (quando o arquivo está em `public/produtos/`), com **giro em 3D**
    e **zoom** nos detalhes da costura como abas ao lado;
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

## Mudar as informações da loja

Tudo o que é "dado do negócio" está separado do código:

| O que mudar | Arquivo |
| --- | --- |
| WhatsApp, Instagram, e-mail, cidade, slogan, prazo | `src/config/site.ts` |
| Produtos, preços, textos, categorias | `src/data/produtos.ts` |
| Cores do site (rosa, creme, verde neon) | `src/index.css` (bloco `@theme`) |

### WhatsApp

O número fica em `src/config/site.ts`:

```ts
whatsappExibicao: '+55 41 9509-6228',  // como aparece escrito no site
whatsappNumero: '554195096228',        // usado no link wa.me (só números)
```

> Se o número tiver o nono dígito (41 **9** 9509-6228), troque `whatsappNumero`
> por `5541995096228` — o link do WhatsApp precisa do número completo para abrir a conversa.

### Fotos das bonecas

As fotos reais ficam em `public/produtos/` — veja `public/produtos/LEIA-ME.md` para os
nomes de arquivo esperados. Enquanto a foto não estiver lá, o site mostra a ilustração 3D
da peça; nunca aparece imagem quebrada.

### Produtos

Cada boneca em `src/data/produtos.ts` tem nome, preço, textos e uma `spec` —
a "receita" da ilustração (tipo, tom de pele, cor e estilo do cabelo, cor do
vestido, acessório). Copie um produto existente, troque as cores e já aparece no
site, no catálogo, na busca e nos relacionados.

As ilustrações são geradas em SVG por `src/components/DollArt.tsx`, separadas em
camadas (cabelo de trás, corpo, cabeça, rosto, franja, acessório). É isso que dá o
efeito 3D: cada camada fica em uma profundidade diferente e o conjunto gira junto.

> Quando tiver as fotos reais das bonecas, dá para trocar a ilustração pela foto
> na página de produto sem mexer no resto do site.

## Estrutura

```
src/
  config/site.ts          dados da loja (WhatsApp, redes, textos)
  data/produtos.ts        catálogo: categorias e produtos
  data/types.ts           tipos
  components/             DollArt (SVG), Doll3D, cards, cabeçalho, rodapé, sacolinha
  pages/                  Início, Catálogo, Produto, Sobre, Contato, Carrinho, 404
  store/carrinho.tsx      sacolinha (salva no navegador)
```
