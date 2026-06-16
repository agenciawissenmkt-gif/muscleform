# Muscleform - E-commerce de Suplementos

## Visão Geral
E-commerce responsivo, mobile-first, para a loja de suplementos Muscleform com visual moderno, integração WhatsApp e painel administrativo.

## Tecnologias
- **Frontend**: HTML5, CSS3, JavaScript Vanilla
- **Backend**: Node.js + Express
- **Armazenamento**: JSON (localStorage + servidor)
- **Autenticação**: Sessão com senha criptografada

## Instalação

```bash
git clone https://github.com/agenciawissenmkt-gif/muscleform.git
cd muscleform
npm install
cp .env.example .env
```

## Configuração

1. Edite `.env` com suas credenciais:
   ```
   ADMIN_PASSWORD=sua_senha_segura
   ```

2. Inicie o servidor:
   ```bash
   npm start
   ```

3. Acesse:
   - Site: http://localhost:3000
   - Admin: http://localhost:3000/admin (login: @muscleform)

## Estrutura do Projeto

```
muscleform/
├── public/
│   ├── index.html
│   ├── categoria.html
│   ├── produto.html
│   ├── carrinho.html
│   ├── videos.html
│   ├── admin.html
│   ├── css/
│   │   ├── style.css
│   │   └── admin.css
│   ├── js/
│   │   ├── app.js
│   │   ├── admin.js
│   │   └── utils.js
│   └── img/
│       └── logo.png
├── uploads/
├── server.js
├── products.json
├── .env
└── package.json
```

## Paleta de Cores
- **Roxo**: #6B2C91 (principal)
- **Branco**: #FFFFFF (fundo)
- **Laranja**: #FF9500 (promoções)
- **Cinza**: #F5F5F5 (fundo secundário)

## Funcionalidades

✅ Home com barra de pesquisa grande
✅ Categorias com filtros
✅ Página de produto com galeria
✅ Carrinho persistente
✅ Integração WhatsApp automatizada
✅ Painel Admin com CRUD completo
✅ Responsivo (mobile-first)
✅ Top bar animado "Frete Grátis"
✅ Avaliações e provas sociais
✅ Página de vídeos

## WhatsApp Integration

Número: +55 41 99200-6291

Mensagens pré-formatadas com:
- Nome do produto
- Variações (sabor, peso)
- Quantidade
- Preço total
- Dados do cliente

## Segurança

- Senha não fixada no código (variável de ambiente)
- Sessão com cookie seguro
- Bloqueio de acesso não autenticado
- Rate limiting simples

## Deploy

Recomendado: Vercel, Heroku ou AWS

## Licença
EPL-2.0
