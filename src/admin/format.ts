// Formatação e tipos do painel empresarial
import { allColors, allCuts } from '../catalog';

export interface Tenant {
  id: string;
  name: string;
  owner_name: string | null;
  phone: string | null;
  city: string | null;
  notes: string | null;
  plan: '500' | '1000' | 'custom';
  monthly_limit: number;
  price_brl: number;
  status: 'active' | 'blocked' | 'deleted';
  effective_status: 'active' | 'blocked' | 'overdue' | 'deleted';
  status_reason: string | null;
  due_day: number | null;
  paid_until: string | null;
  auto_block: boolean;
  grace_days: number;
  created_at: string;
  updated_at: string;
  used_month: number;
  emails: { email: string; role: string; last_login_at: string | null }[];
}

export interface Overview {
  cost_per_image_usd: number;
  usd_brl: number;
  demo_limit: number;
  month_start: string;
  tenants_total: number;
  tenants_active: number;
  tenants_blocked: number;
  mrr_brl: number;
  images_month: number;
  images_today: number;
  demo_images_month: number;
  errors_month: number;
  ai_cost_month_usd: number;
  quota_month: number;
  avg_duration_ms: number;
  daily: { day: string; images: number; errors: number }[];
  months: { month: string; images: number; cost_usd: number }[];
}

const brlFmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const intFmt = new Intl.NumberFormat('pt-BR');

export const brl = (v: number) => brlFmt.format(Number(v) || 0);
export const int = (v: number) => intFmt.format(Number(v) || 0);
export const pct = (v: number) => `${Math.round((Number(v) || 0) * 100)}%`;

export function date(v: string | null | undefined, withTime = false) {
  if (!v) return '—';
  const d = new Date(v.length === 10 ? `${v}T12:00:00` : v);
  if (Number.isNaN(d.getTime())) return '—';
  return withTime
    ? d.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : d.toLocaleDateString('pt-BR');
}

export function monthLabel(ym: string) {
  const [y, m] = ym.split('-').map(Number);
  const names = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  return `${names[(m || 1) - 1]}/${String(y).slice(2)}`;
}

const cutNames = new Map(allCuts.map((c) => [c.id, c.name]));
const colorNames = new Map(allColors.map((c) => [c.id, c.name]));
export const cutName = (id: string | null) => (id ? cutNames.get(id) || id : '—');
export const colorName = (id: string | null) => (id ? colorNames.get(id) || id : '—');
export const cutPhoto = (id: string) => allCuts.find((c) => c.id === id)?.photo;
export const colorPhoto = (id: string) => allColors.find((c) => c.id === id)?.photo;

export const STATUS: Record<Tenant['effective_status'], { label: string; cls: string }> = {
  active: { label: 'Ativo', cls: 'bg-emerald-100 text-emerald-800' },
  blocked: { label: 'Bloqueado', cls: 'bg-red-100 text-red-700' },
  overdue: { label: 'Pagamento atrasado', cls: 'bg-amber-100 text-amber-800' },
  deleted: { label: 'Apagado', cls: 'bg-gray-200 text-gray-700' },
};

export const MODE_LABEL: Record<string, string> = { cut: 'Corte', color: 'Cor', both: 'Corte + cor' };

export const ACTION_LABEL: Record<string, string> = {
  tenant_create: 'Cadastrou cliente',
  tenant_update: 'Editou cliente',
  tenant_active: 'Desbloqueou cliente',
  tenant_blocked: 'Bloqueou cliente',
  tenant_deleted: 'Apagou cliente',
  tenant_paid: 'Registrou pagamento',
  settings_update: 'Mudou ajustes',
};

export const LOGIN_LABEL: Record<string, string> = {
  ok: 'Entrou (salão)',
  admin: 'Entrou (administrador)',
  denied: 'Bloqueado — e-mail não liberado',
};
