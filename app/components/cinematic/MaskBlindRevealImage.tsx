'use client';

import { memo, useLayoutEffect, useRef } from 'react';
import { useLenis } from '@/app/components/cinematic/LenisProvider';
import { OptimizedImage } from '@/app/components/ui/OptimizedImage';
import { usePrefersReducedMotion } from '@/app/hooks/usePrefersReducedMotion';
import { ensureGsapScroll, gsap, refreshScrollLayout } from '@/app/lib/gsap-scroll';
import { cn } from '@/app/lib/utils';

export type MaskBlindRevealImageProps = {
  src: string;
  alt?: string;
  aspectClassName?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  scrub?: number;
  start?: string;
  end?: string;
  enabled?: boolean;
};

/**
 * Window-blind reveal: only the mask clip-path opens on scroll; the image stays fixed.
 */
export const MaskBlindRevealImage = memo(function MaskBlindRevealImage({
  src,
  alt = '',
  aspectClassName = 'aspect-[3/4]',
  className,
  sizes = '(max-width: 1024px) 90vw, 28vw',
  priority = false,
  scrub = 1.1,
  start = 'top 85%',
  end = 'center center',
  enabled = true,
}: MaskBlindRevealImageProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const { lenis } = useLenis();

  useLayoutEffect(() => {
    const trigger = wrapperRef.current;
    const mask = maskRef.current;
    if (!enabled || !trigger || !mask || !src) return;
    if (!reducedMotion && !lenis) return;

    ensureGsapScroll();

    if (reducedMotion) {
      gsap.set(mask, {
        clipPath: 'inset(0% 0% 0% 0%)',
        WebkitClipPath: 'inset(0% 0% 0% 0%)',
      });
      return;
    }

    gsap.set(mask, {
      clipPath: 'inset(100% 0% 0% 0%)',
      WebkitClipPath: 'inset(100% 0% 0% 0%)',
      force3D: true,
    });

    const scroller = typeof document !== 'undefined' ? document.documentElement : undefined;

    const ctx = gsap.context(() => {
      gsap.to(mask, {
        clipPath: 'inset(0% 0% 0% 0%)',
        WebkitClipPath: 'inset(0% 0% 0% 0%)',
        ease: 'none',
        scrollTrigger: {
          trigger,
          scroller,
          start,
          end,
          scrub,
          invalidateOnRefresh: true,
        },
      });
    }, trigger);

    const refresh = () => refreshScrollLayout();
    refresh();
    const t = window.setTimeout(refresh, 200);

    return () => {
      window.clearTimeout(t);
      ctx.revert();
    };
  }, [enabled, reducedMotion, lenis, src, start, end, scrub]);

  if (!src) return null;

  return (
    <div ref={wrapperRef} className={cn('relative w-full', className)}>
      <div
        ref={maskRef}
        className={cn(
          'mask-blind-reveal relative w-full overflow-hidden bg-black/10',
          aspectClassName,
        )}
      >
        <OptimizedImage
          src={src}
          alt={alt}
          fill
          priority={priority}
          className="object-cover object-center"
          sizes={sizes}
          onLoad={() => refreshScrollLayout()}
        />
      </div>
    </div>
  );
});

export default MaskBlindRevealImage;
