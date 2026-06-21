'use client';

import Link from 'next/link';
import { LANDING } from './landingStyles';

const VARIANTS = {
  primary: LANDING.btnPrimary,
  secondary: LANDING.btnSecondary,
  accent: LANDING.btnAccent,
  white: 'inline-flex items-center justify-center gap-2 rounded-md bg-white px-6 py-3 text-[15px] font-semibold text-[#111827] hover:bg-[#F8FAFC] transition-colors duration-200',
};

export default function EnterpriseButton({
  href,
  onClick,
  children,
  variant = 'primary',
  className = '',
  type = 'button',
}) {
  const classes = `${VARIANTS[variant] || VARIANTS.primary} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
