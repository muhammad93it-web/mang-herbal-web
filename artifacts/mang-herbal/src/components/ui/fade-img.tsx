import React from 'react';
import { cn } from '@/lib/utils';

/**
 * <img> that fades in smoothly once loaded instead of popping in.
 * Already-cached images (ref.complete) show instantly, so back/forward
 * navigation never flashes.
 */
export function FadeImg({
  className,
  onLoad,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  const ref = React.useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    if (ref.current?.complete) setLoaded(true);
  }, []);

  return (
    <img
      ref={ref}
      {...props}
      onLoad={(e) => {
        setLoaded(true);
        onLoad?.(e);
      }}
      className={cn(
        'transition-opacity duration-700 ease-out',
        !loaded && 'opacity-0',
        className
      )}
    />
  );
}
