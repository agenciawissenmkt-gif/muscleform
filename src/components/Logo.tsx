export default function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dim = size === 'lg' ? 44 : size === 'md' ? 34 : 26;
  const text = size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-xl' : 'text-base';
  return (
    <div className="flex items-center gap-2.5">
      <svg width={dim} height={dim} viewBox="0 0 48 48" className="shrink-0">
        <defs>
          <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--color-rose-400)" />
            <stop offset="1" stopColor="var(--color-gold-400)" />
          </linearGradient>
        </defs>
        <circle cx="24" cy="24" r="24" fill="url(#logo-g)" />
        <path
          d="M14 34c0-8 2-12 2-16 0-5.5 4-9 8-9s8 3.5 8 9c0 4 2 8 2 16"
          stroke="#fffaf5"
          strokeWidth="2.4"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M17 33c0-6.5 1.4-10 1.4-13.5 0-4 2.6-6.8 5.6-6.8s5.6 2.8 5.6 6.8c0 3.5 1.4 7 1.4 13.5"
          stroke="#fffaf5"
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
          opacity="0.7"
        />
      </svg>
      <span className={`font-display font-semibold tracking-tight text-ink-900 ${text}`}>
        Your Beauty
      </span>
    </div>
  );
}
