// Carrega server/.env ANTES de qualquer outro módulo ler process.env
// (importado primeiro em app.js). Na Vercel/EasyPanel as variáveis vêm do painel.
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

dotenv.config({ path: fileURLToPath(new URL('./.env', import.meta.url)), quiet: true });
