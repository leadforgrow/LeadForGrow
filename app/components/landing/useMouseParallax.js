'use client';

import { useEffect, useState, useCallback } from 'react';

export function useMouseParallax(intensity = 1) {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const onMove = useCallback(
    (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      setPos({
        x: ((e.clientX - cx) / cx) * intensity,
        y: ((e.clientY - cy) / cy) * intensity,
      });
    },
    [intensity]
  );

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [onMove]);

  return pos;
}
