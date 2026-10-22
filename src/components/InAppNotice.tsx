import { useState } from 'react';
import { copyLink, openInBrowser, type InApp } from '../lib/inapp';
import { Button, Icon } from './ui';

/**
 * Aviso para quem abriu o link dentro do Instagram, WhatsApp, Facebook etc.:
 * lá o app funciona pela metade (login, câmera e download são bloqueados).
 */
export default function InAppNotice({
  inApp,
  reason,
  className = 'max-w-[360px]',
}: {
  inApp: InApp;
  reason: string;
  className?: string;
}) {
  const [copied, setCopied] = useState<boolean | null>(null);
  const where = inApp.os === 'ios' ? 'Abrir no Safari' : 'Abrir no navegador';
  return (
    <div
      role="note"
      className={`w-full rounded-2xl bg-white p-4 text-left shadow-soft ring-2 ring-orchid-400 ${className}`}
    >
      <p className="flex items-center gap-2 font-extrabold text-plum-900">
        <Icon name="alert" size={20} className="shrink-0 text-orchid-500" /> Abra no navegador
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
        {reason} {inApp.app ? `dentro do ${inApp.app}` : 'dentro deste aplicativo'}. Toque em <b>⋯</b> (ou <b>⋮</b>) no
        canto da tela e escolha <b>{where}</b>.
      </p>
      <div className="mt-3 grid gap-2">
        {inApp.os === 'android' && (
          <Button size="md" icon="external" onClick={openInBrowser}>
            Abrir no navegador
          </Button>
        )}
        <Button
          size="md"
          variant="secondary"
          icon={copied ? 'check' : 'link'}
          onClick={() => copyLink().then(setCopied)}
        >
          {copied ? 'Link copiado! Cole no navegador' : 'Copiar o link'}
        </Button>
        {copied === false && (
          <p className="text-sm text-ink-soft">
            Não consegui copiar. O endereço é <b>{window.location.host}</b>
          </p>
        )}
      </div>
    </div>
  );
}
