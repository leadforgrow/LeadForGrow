'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function MagneticButton({ href, onClick, children, variant = 'primary', className = '' }) {
  const ref = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.15;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.15;
    setOffset({ x, y });
  };

  const handleLeave = () => setOffset({ x: 0, y: 0 });

  const base =
    variant === 'primary'
      ? 'bg-blue-600 text-white shadow-[0_8px_32px_rgba(37,99,235,0.35)] hover:bg-blue-700 hover:shadow-[0_12px_40px_rgba(37,99,235,0.45)]'
      : 'bg-white/80 dark:bg-slate-900/80 text-slate-900 dark:text-white border border-slate-200/80 dark:border-slate-700 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800';

  const inner = (
    <motion.span
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      animate={{ x: offset.x, y: offset.y }}
      transition={{ type: 'spring', stiffness: 350, damping: 22 }}
      className={`relative inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold transition-colors duration-300 ${base} ${className}`}
      whileTap={{ scale: 0.98 }}
    >
      {children}
      {variant === 'primary' && (
        <motion.span
          className="absolute inset-0 rounded-xl bg-white/20"
          initial={{ scale: 0, opacity: 0.5 }}
          whileTap={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.4 }}
        />
      )}
    </motion.span>
  );

  if (href) {
    return <Link href={href}>{inner}</Link>;
  }
  return (
    <button type="button" onClick={onClick} className="inline-block">
      {inner}
    </button>
  );
}
