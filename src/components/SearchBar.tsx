import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface SearchBarProps {
  defaultValue?: string;
  autoFocus?: boolean;
  onSubmitOverride?: (value: string) => void;
}

export default function SearchBar({ defaultValue = '', autoFocus, onSubmitOverride }: SearchBarProps) {
  const [value, setValue] = useState(defaultValue);
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (onSubmitOverride) {
      onSubmitOverride(value);
      return;
    }
    navigate(`/explorar${value ? `?q=${encodeURIComponent(value)}` : ''}`);
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex items-center gap-3 rounded-full border border-blush-200 bg-white/90 px-5 py-3.5 shadow-[0_8px_30px_-12px_rgba(180,99,109,0.35)] backdrop-blur"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0 text-rose-500">
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
        <path d="M21 21l-4.3-4.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoFocus={autoFocus}
        placeholder="Buscar corte ou cor de cabelo..."
        className="w-full bg-transparent text-[15px] text-ink-900 placeholder:text-ink-600/60 focus:outline-none"
      />
      {value && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          type="button"
          onClick={() => setValue('')}
          className="shrink-0 text-ink-600/50"
          aria-label="Limpar busca"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        </motion.button>
      )}
    </motion.form>
  );
}
