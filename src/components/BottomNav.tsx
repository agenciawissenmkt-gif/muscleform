import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';

const items = [
  {
    to: '/',
    label: 'Início',
    icon: (active: boolean) => (
      <path
        d="M4 11.5 12 5l8 6.5M6 10v8.5a1 1 0 0 0 1 1h3.5v-5a1.5 1.5 0 0 1 1.5-1.5v0a1.5 1.5 0 0 1 1.5 1.5v5H17a1 1 0 0 0 1-1V10"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    to: '/experimentar',
    label: 'Experimentar',
    isPrimary: true,
    icon: (_active: boolean) => (
      <>
        <path
          d="M7 8.5 8.6 6h6.8L17 8.5h2A1.5 1.5 0 0 1 20.5 10v7A1.5 1.5 0 0 1 19 18.5H5A1.5 1.5 0 0 1 3.5 17v-7A1.5 1.5 0 0 1 5 8.5h2Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="13" r="3" stroke="currentColor" strokeWidth="1.8" />
      </>
    ),
  },
  {
    to: '/explorar',
    label: 'Explorar',
    icon: (active: boolean) => (
      <>
        <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} />
        <path d="M20 20l-3.6-3.6" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" />
      </>
    ),
  },
];

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-blush-200/70 bg-white/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg">
      <div className="mx-auto flex max-w-md items-center justify-around px-4 py-2.5">
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'} className="relative flex flex-col items-center gap-1 px-3 py-1">
            {({ isActive }) => (
              <>
                {item.isPrimary ? (
                  <motion.span
                    whileTap={{ scale: 0.9 }}
                    className="flex h-12 w-12 -translate-y-3 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-gold-400 text-white shadow-lg shadow-rose-500/30"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      {item.icon(isActive)}
                    </svg>
                  </motion.span>
                ) : (
                  <span className={isActive ? 'text-rose-500' : 'text-ink-600/60'}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      {item.icon(isActive)}
                    </svg>
                  </span>
                )}
                <span
                  className={`text-[11px] font-medium ${item.isPrimary ? '-mt-1.5' : ''} ${
                    isActive ? 'text-rose-500' : 'text-ink-600/60'
                  }`}
                >
                  {item.label}
                </span>
                {isActive && !item.isPrimary && (
                  <motion.span
                    layoutId="nav-dot"
                    className="absolute -top-0.5 h-1 w-1 rounded-full bg-rose-500"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
