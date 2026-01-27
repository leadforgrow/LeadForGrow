'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Hook to detect when an element enters the viewport
 * Returns ref and inView state
 */
export function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setInView(true);
          setHasAnimated(true);
        }
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '0px',
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [hasAnimated, options.threshold, options.rootMargin]);

  return { ref, inView };
}

/**
 * Hook for scroll-based parallax effects
 */
export function useParallax(speed = 0.5) {
  const ref = useRef(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      
      const rect = ref.current.getBoundingClientRect();
      const scrolled = window.scrollY;
      const elementTop = rect.top + scrolled;
      const windowHeight = window.innerHeight;
      
      if (rect.top < windowHeight && rect.bottom > 0) {
        const parallaxOffset = (scrolled - elementTop) * speed;
        setOffset(parallaxOffset);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return { ref, offset };
}

/**
 * Hook for staggered animations
 */
export function useStaggerAnimation(itemCount, delay = 100) {
  const [visibleItems, setVisibleItems] = useState([]);
  const { ref, inView } = useInView({ threshold: 0.1 });

  useEffect(() => {
    if (inView && visibleItems.length === 0) {
      for (let i = 0; i < itemCount; i++) {
        setTimeout(() => {
          setVisibleItems(prev => [...prev, i]);
        }, i * delay);
      }
    }
  }, [inView, itemCount, delay, visibleItems.length]);

  return { ref, visibleItems };
}

/**
 * Hook for counting animation
 */
export function useCountUp(end, duration = 2000, start = 0) {
  const [count, setCount] = useState(start);
  const { ref, inView } = useInView({ threshold: 0.5 });

  useEffect(() => {
    if (!inView) return;

    let startTime = null;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(start + (end - start) * easeOutQuart));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [inView, end, duration, start]);

  return { ref, count };
}
