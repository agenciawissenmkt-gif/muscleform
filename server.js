const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Session Configuration
app.use(session({
  secret: 'muscleform-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Arquivo de dados
const productsFile = path.join(__dirname, 'products.json');
const categoriesFile = path.join(__dirname, 'categories.json');

// Inicializar arquivos se não existirem
function initializeFiles() {
  if (!fs.existsSync(productsFile)) {
    fs.writeFileSync(productsFile, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(categoriesFile)) {
    const defaultCategories = [
      { id: 1, name: 'Whey Protein', slug: 'whey-protein' },
      { id: 2, name: 'Creatina', slug: 'creatina' },
      { id: 3, name: 'Pré-treino', slug: 'pre-treino' },
      { id: 4, name: 'Hipercalórico', slug: 'hipercalorico' },
      { id: 5, name: 'BCAA / Aminoácidos', slug: 'bcaa-aminoacidos' },
      { id: 6, name: 'Vitaminas e Minerais', slug: 'vitaminas-minerais' },
      { id: 7, name: 'Ômega 3 / Saúde', slug: 'omega-3-saude' },
      { id: 8, name: 'Barras e Snacks', slug: 'barras-snacks' },
      { id: 9, name: 'Acessórios', slug: 'acessorios' }
    ];
    fs.writeFileSync(categoriesFile, JSON.stringify(defaultCategories, null, 2));
  }
}

initializeFiles();

// Funções auxiliares
function readProducts() {
  try {
    return JSON.parse(fs.readFileSync(productsFile, 'utf8')) || [];
  } catch (e) {
    return [];
  }
}

function writeProducts(products) {
  fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
}

function readCategories() {
  try {
    return JSON.parse(fs.readFileSync(categoriesFile, 'utf8')) || [];
  } catch (e) {
    return [];
  }
}

function writeCategories(categories) {
  fs.writeFileSync(categoriesFile, JSON.stringify(categories, null, 2));
}

// Middleware de autenticação
function isAuthenticated(req, res, next) {
  if (req.session && req.session.authenticated) {
    return next();
  }
  return res.status(401).json({ error: 'Não autenticado' });
}

// ============ ADMIN AUTHENTICATION ============
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  const adminUsername = process.env.ADMIN_USERNAME || '@muscleform';
  const adminPassword = process.env.ADMIN_PASSWORD || 'muscleform@2024';

  if (username === adminUsername && password === adminPassword) {
    req.session.authenticated = true;
    return res.json({ success: true, message: 'Login realizado' });
  }
  return res.status(401).json({ error: 'Credenciais inválidas' });
});

app.post('/api/admin/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/admin/check', (req, res) => {
  if (req.session && req.session.authenticated) {
    return res.json({ authenticated: true });
  }
  return res.json({ authenticated: false });
});

// ============ PRODUCTS API ============
app.get('/api/products', (req, res) => {
  const products = readProducts();
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const products = readProducts();
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ error: 'Produto não encontrado' });
  }
  res.json(product);
});

app.post('/api/products', isAuthenticated, (req, res) => {
  const products = readProducts();
  const newProduct = {
    id: Date.now(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  products.push(newProduct);
  writeProducts(products);
  res.json(newProduct);
});

app.put('/api/products/:id', isAuthenticated, (req, res) => {
  const products = readProducts();
  const index = products.findIndex(p => p.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'Produto não encontrado' });
  }
  products[index] = { ...products[index], ...req.body, updatedAt: new Date().toISOString() };
  writeProducts(products);
  res.json(products[index]);
});

app.delete('/api/products/:id', isAuthenticated, (req, res) => {
  const products = readProducts();
  const filtered = products.filter(p => p.id !== parseInt(req.params.id));
  writeProducts(filtered);
  res.json({ success: true });
});

// ============ CATEGORIES API ============
app.get('/api/categories', (req, res) => {
  const categories = readCategories();
  res.json(categories);
});

app.post('/api/categories', isAuthenticated, (req, res) => {
  const categories = readCategories();
  const newCategory = {
    id: Date.now(),
    ...req.body
  };
  categories.push(newCategory);
  writeCategories(categories);
  res.json(newCategory);
});

app.put('/api/categories/:id', isAuthenticated, (req, res) => {
  const categories = readCategories();
  const index = categories.findIndex(c => c.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'Categoria não encontrada' });
  }
  categories[index] = { ...categories[index], ...req.body };
  writeCategories(categories);
  res.json(categories[index]);
});

app.delete('/api/categories/:id', isAuthenticated, (req, res) => {
  const categories = readCategories();
  const filtered = categories.filter(c => c.id !== parseInt(req.params.id));
  writeCategories(filtered);
  res.json({ success: true });
});

// ============ STATIC PAGES ============
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Muscleform rodando em http://localhost:${PORT}`);
});
