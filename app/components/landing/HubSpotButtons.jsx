'use client';

/** HubSpot-style primary / outline CTAs */

export function HubSpotPrimaryButton({ children, onClick, href, className = '' }) {
  const cls = `inline-flex items-center justify-center rounded-[3px] bg-[#FF5C35] px-6 py-2.5 text-[15px] font-semibold text-white hover:bg-[#E84E2A] transition-colors ${className}`;
  if (href) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

export function HubSpotOutlineButton({ children, onClick, href, light = false, className = '' }) {
  const cls = light
    ? `inline-flex items-center justify-center rounded-[3px] border border-white px-6 py-2.5 text-[15px] font-semibold text-white hover:bg-white/10 transition-colors ${className}`
    : `inline-flex items-center justify-center rounded-[3px] border border-[#FF5C35] bg-white px-6 py-2.5 text-[15px] font-semibold text-[#FF5C35] hover:bg-[#FFF5F2] transition-colors ${className}`;
  if (href) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {children}
    </button>
  );
}
