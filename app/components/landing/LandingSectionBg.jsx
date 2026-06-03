'use client';

import { forwardRef } from 'react';
import { LANDING_PAGE_BG } from './landingStyles';

/**
 * Landing section backgrounds — one light base color, optional subtle photo wash.
 */

const PHOTOS = {
  team: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=80',
  analytics: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1920&q=80',
  workspace: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80',
  support: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1920&q=80',
  contact: 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&w=1920&q=80',
};

/** Light frosted overlay — keeps photos visible while matching page tone */
const PHOTO_OVERLAY =
  'from-[#f4f8ff]/72 via-[#f4f8ff]/58 to-[#f4f8ff]/75 dark:from-[#070a12]/82 dark:via-[#070a12]/72 dark:to-[#070a12]/85';

const SHARED_LAYERS = [
  'bg-[radial-gradient(ellipse_at_12%_18%,rgba(37,99,235,0.05),transparent_55%)]',
  'bg-[radial-gradient(ellipse_at_88%_72%,rgba(14,165,233,0.04),transparent_50%)]',
];

const VARIANTS = {
  aurora: { pattern: 'dots' },
  sky: { pattern: 'grid' },
  slate: { pattern: 'dots' },
  warm: { pattern: 'dots' },
  premium: { pattern: 'grid' },
  'photo-team': { pattern: 'dots', image: PHOTOS.team },
  'photo-analytics': { pattern: 'grid', image: PHOTOS.analytics },
  'photo-workspace': { pattern: 'dots', image: PHOTOS.workspace },
  'photo-support': { pattern: 'dots', image: PHOTOS.support },
  'photo-contact': { pattern: 'grid', image: PHOTOS.contact },
};

const LandingSectionBg = forwardRef(function LandingSectionBg({
  variant = 'aurora',
  sectionClass = 'landing-section',
  className = '',
  id,
  children,
}, ref) {
  const preset = VARIANTS[variant] || VARIANTS.aurora;

  return (
    <section ref={ref} id={id} className={`relative overflow-hidden ${sectionClass} ${LANDING_PAGE_BG} ${className}`}>
      {preset.image && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-[1.02] opacity-[0.35] dark:opacity-[0.2] pointer-events-none"
            style={{ backgroundImage: `url(${preset.image})` }}
            aria-hidden
          />
          <div className={`absolute inset-0 bg-gradient-to-br ${PHOTO_OVERLAY} pointer-events-none`} aria-hidden />
        </>
      )}

      {!preset.image && SHARED_LAYERS.map((layer, i) => (
        <div key={i} className={`absolute inset-0 pointer-events-none ${layer}`} aria-hidden />
      ))}

      {preset.pattern === 'dots' && (
        <div className="landing-bg-dots absolute inset-0 pointer-events-none opacity-[0.28] dark:opacity-[0.12]" aria-hidden />
      )}
      {preset.pattern === 'grid' && (
        <div className="landing-bg-grid absolute inset-0 pointer-events-none opacity-[0.2] dark:opacity-[0.1]" aria-hidden />
      )}

      <div className="relative z-10">{children}</div>
    </section>
  );
});

export default LandingSectionBg;
