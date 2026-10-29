import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Button, Spinner } from '../components/ui';
import { ApiError, getJson } from '../lib/api';
import { PANEL_PATH } from '../lib/role';

/** Carrega dados de uma rota do painel, com estado de carregando/erro. */
export function useAdminData<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getJson<T>(path));
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        window.location.href = PANEL_PATH;
        return;
      }
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [path]);
  useEffect(() => {
    load();
  }, [load]);
  return { data, error, loading, reload: load, setData };
}

export function Loading({ error, onRetry }: { error?: string | null; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      {error ? (
        <>
          <p className="font-bold text-red-700">{error}</p>
          {onRetry && (
            <Button size="md" icon="refresh" onClick={onRetry}>
              Tentar de novo
            </Button>
          )}
        </>
      ) : (
        <Spinner />
      )}
    </div>
  );
}

export function Card({ title, children, right }: { title?: string; children: ReactNode; right?: ReactNode }) {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-plum-100">
      {(title || right) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-lg font-extrabold text-plum-950">{title}</h2>}
          {right}
        </div>
      )}
      {children}
    </section>
  );
}
