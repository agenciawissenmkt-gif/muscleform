import type { ButtonHTMLAttributes, ReactNode, SVGProps } from 'react';

type IconName =
  | 'camera'
  | 'gallery'
  | 'scissors'
  | 'palette'
  | 'sparkles'
  | 'switch'
  | 'download'
  | 'share'
  | 'back'
  | 'close'
  | 'check'
  | 'search'
  | 'logout'
  | 'refresh'
  | 'sun'
  | 'face'
  | 'lock'
  | 'alert'
  | 'link'
  | 'external';

const PATHS: Record<IconName, ReactNode> = {
  camera: (
    <>
      <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.6l1.3-1.8A2 2 0 0 1 11 3.4h2a2 2 0 0 1 1.6.8L15.9 6h1.6A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5z" />
      <circle cx="12" cy="12.4" r="3.6" />
    </>
  ),
  gallery: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
      <circle cx="9" cy="10" r="1.8" />
      <path d="m20.5 16-4.8-4.6a1.5 1.5 0 0 0-2.1 0L5 19.5" />
    </>
  ),
  scissors: (
    <>
      <circle cx="6.5" cy="6.5" r="2.8" />
      <circle cx="6.5" cy="17.5" r="2.8" />
      <path d="M8.6 8.4 20 18.5M8.6 15.6 20 5.5" />
    </>
  ),
  palette: (
    <>
      <path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.3 0 2-.9 2-1.9 0-1.3-1-1.6-1-2.8 0-1 .8-1.8 1.8-1.8h2.1a3.6 3.6 0 0 0 3.6-3.6C20.5 6.6 16.7 3.5 12 3.5Z" />
      <circle cx="7.6" cy="11.4" r="1.2" fill="currentColor" />
      <circle cx="10" cy="7.6" r="1.2" fill="currentColor" />
      <circle cx="14.6" cy="7.6" r="1.2" fill="currentColor" />
    </>
  ),
  sparkles: (
    <>
      <path d="M11 3.5 12.6 8a3 3 0 0 0 1.9 1.9L19 11.5l-4.5 1.6a3 3 0 0 0-1.9 1.9L11 19.5 9.4 15a3 3 0 0 0-1.9-1.9L3 11.5l4.5-1.6A3 3 0 0 0 9.4 8z" />
      <path d="M18.5 3v3.5M16.8 4.8h3.5" />
    </>
  ),
  switch: (
    <>
      <path d="M4 9.5A8 8 0 0 1 18.4 6M20 14.5A8 8 0 0 1 5.6 18" />
      <path d="M18.6 2.5v3.8h-3.8M5.4 21.5v-3.8h3.8" />
    </>
  ),
  download: (
    <>
      <path d="M12 4v11M7.5 10.5 12 15l4.5-4.5" />
      <path d="M4.5 16.5v1.5A2 2 0 0 0 6.5 20h11a2 2 0 0 0 2-2v-1.5" />
    </>
  ),
  share: (
    <>
      <path d="M12 15V4M8 7.8 12 4l4 3.8" />
      <path d="M8 11H6.5A2 2 0 0 0 4.5 13v5A2 2 0 0 0 6.5 20h11a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H16" />
    </>
  ),
  back: <path d="M15 5 8 12l7 7" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.4-4.4" />
    </>
  ),
  logout: (
    <>
      <path d="M14 4.5h3.5a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H14" />
      <path d="M10 8 6 12l4 4M6 12h9.5" />
    </>
  ),
  refresh: (
    <>
      <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3" />
      <path d="M19.5 4.5v4h-4" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
    </>
  ),
  face: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9 10h.01M15 10h.01M8.8 14.6a4.5 4.5 0 0 0 6.4 0" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2.2" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </>
  ),
  alert: (
    <>
      <path d="M12 4 2.8 19.5h18.4z" />
      <path d="M12 10v4.2M12 17h.01" />
    </>
  ),
  link: (
    <>
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
      <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
    </>
  ),
  external: (
    <>
      <path d="M14 4h6v6M20 4l-9 9" />
      <path d="M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10" />
    </>
  ),
};

export function Icon({ name, size = 24, ...rest }: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}

type Variant = 'primary' | 'secondary' | 'ghost' | 'light';

const VARIANTS: Record<Variant, string> = {
  primary:
    'brand-gradient text-white shadow-lift hover:brightness-110 active:brightness-95 disabled:shadow-none disabled:hover:brightness-100',
  secondary:
    'bg-white text-plum-800 ring-2 ring-plum-200 shadow-soft hover:ring-plum-400 active:bg-plum-50 disabled:opacity-50',
  ghost: 'bg-transparent text-plum-700 hover:bg-plum-100 active:bg-plum-200 disabled:opacity-50',
  light:
    'bg-white/15 text-white ring-1 ring-white/40 backdrop-blur hover:bg-white/25 active:bg-white/30 disabled:opacity-50',
};

export function Button({
  variant = 'primary',
  icon,
  size = 'lg',
  className = '',
  children,
  ...rest
}: {
  variant?: Variant;
  icon?: IconName;
  size?: 'md' | 'lg' | 'xl';
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const sizes = {
    md: 'min-h-12 px-5 text-base gap-2',
    lg: 'min-h-14 px-6 text-[1.05rem] gap-2.5',
    xl: 'min-h-16 px-7 text-lg gap-3',
  };
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center rounded-2xl font-extrabold tracking-wide transition active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100 ${sizes[size]} ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {icon && <Icon name={icon} size={size === 'xl' ? 26 : 22} />}
      <span>{children}</span>
    </button>
  );
}

export function IconButton({
  icon,
  label,
  className = '',
  ...rest
}: { icon: IconName; label: string } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex size-12 shrink-0 items-center justify-center rounded-full transition active:scale-95 ${className}`}
      {...rest}
    >
      <Icon name={icon} />
    </button>
  );
}

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-block size-6 animate-spin rounded-full border-[3px] border-plum-200 border-t-plum-600 ${className}`}
      role="status"
      aria-label="Carregando"
    />
  );
}
