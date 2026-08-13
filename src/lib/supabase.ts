import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Conexão com o Supabase — a fonte única de verdade do catálogo.
 *
 * As credenciais vêm de variáveis de ambiente, nunca escritas no código.
 * Aceitamos os dois prefixos para facilitar a vida de quem configura:
 *   VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY          (padrão do Vite)
 *   NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY
 *
 * A chave usada aqui é a *anônima* (pública). Ela só consegue ler produtos
 * ativos, porque as regras de segurança ficam no banco (RLS). A chave de
 * serviço (service_role) nunca deve aparecer no site.
 */
const ambiente = import.meta.env as Record<string, string | undefined>;

export const supabaseUrl = ambiente.VITE_SUPABASE_URL ?? ambiente.NEXT_PUBLIC_SUPABASE_URL ?? '';

export const supabaseChave =
  ambiente.VITE_SUPABASE_ANON_KEY ?? ambiente.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

/** true quando as duas variáveis de ambiente estão preenchidas. */
export const supabaseConfigurado = Boolean(supabaseUrl && supabaseChave);

/**
 * O cliente só é criado se houver credenciais — assim o site não quebra
 * em um ambiente sem configuração, apenas avisa que o catálogo está fora.
 */
export const supabase: SupabaseClient | null = supabaseConfigurado
  ? createClient(supabaseUrl, supabaseChave, {
      auth: { persistSession: false },
      global: { headers: { 'x-cliente': 'sonhos-de-brincar-loja' } },
    })
  : null;

/** Mensagem única para quando o catálogo não pode ser lido. */
export const RECADO_SEM_CONEXAO =
  'Não consegui carregar as bonecas agora. Pode ser a internet dando uma escapadinha — tente de novo em instantes.';

export const RECADO_SEM_CONFIGURACAO =
  'O catálogo ainda não está conectado ao painel. Configure as variáveis de ambiente do Supabase para as bonecas aparecerem.';
