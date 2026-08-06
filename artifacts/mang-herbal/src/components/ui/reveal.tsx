import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Fades + slides its content in the first time it enters the viewport
 * (scroll-triggered, runs once). Styles live in index.css (.reveal).
 *
 * - Direction-neutral (translateY only) so it is RTL-safe.
 * - Falls back to instantly-visible when IntersectionObserver is missing;
 *   prefers-reduced-motion is handled in CSS.
 * - `delay` (ms) staggers items that enter the viewport together.
 */
export function Reveal({
  delay = 0,
  className,
  style,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { delay?: number }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [shown, setShown] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -24px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn('reveal', shown && 'reveal-shown', className)}
      style={{ ...(delay ? { transitionDelay: `${delay}ms` } : null), ...style }}
      {...props}
    >
      {children}
    </div>
  );
}
