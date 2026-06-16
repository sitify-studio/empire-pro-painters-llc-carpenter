'use client';

import { memo, useRef } from 'react';
import { OptimizedImage } from '@/app/components/ui/OptimizedImage';
import {
  useEditorialCinematicReveal,
  useEditorialImageHover,
} from '@/app/hooks/useEditorialCinematicReveal';
import { refreshScrollLayout } from '@/app/lib/gsap-scroll';
import { cn } from '@/app/lib/utils';

const GRAIN_SVG =
  'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27200%27 height=%27200%27 viewBox=%270 0 200 200%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.85%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27200%27 height=%27200%27 filter=%27url(%23n)%27 opacity=%271%27/%3E%3C/svg%3E")';

export type ParallaxRevealImageProps = {
  src: string;
  alt?: string;
  aspectClassName?: string;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  priority?: boolean;
  scrub?: number;
  start?: string;
  end?: string;
  enabled?: boolean;
  /** Fill parent (full-bleed backgrounds). */
  fill?: boolean;
  /** Subtle film grain overlay. */
  grain?: boolean;
  hover?: boolean;
  /** Mask clip-path scroll reveal. Disable for full-bleed backgrounds (CTA, hero). */
  reveal?: boolean;
  initialScale?: number;
  initialYPercent?: number;
  microParallaxYPercent?: number;
};

/**
 * Parallax reveal: mask clip-path opens on scroll while the image layer
 * drifts at a different rate — classic editorial depth effect.
 */
export const ParallaxRevealImage = memo(function ParallaxRevealImage({
  src,
  alt = '',
  aspectClassName = 'aspect-[4/5]',
  className,
  imageClassName,
  sizes = '(max-width: 1024px) 100vw, 55vw',
  priority = false,
  scrub = 1.4,
  start = 'top 92%',
  end = 'bottom 15%',
  enabled = true,
  fill = false,
  grain = true,
  hover = true,
  reveal = true,
  initialScale = 1.28,
  initialYPercent = -10,
  microParallaxYPercent = 10,
}: ParallaxRevealImageProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const floatRef = useRef<HTMLDivElement>(null);

  useEditorialCinematicReveal({
    enabled: enabled && Boolean(src),
    reveal,
    triggerRef: wrapperRef,
    maskRef,
    imageRef,
    floatRef,
    scrub,
    start,
    end,
    initialScale,
    initialYPercent,
    microParallaxYPercent,
  });

  useEditorialImageHover(maskRef, floatRef, hover && enabled && Boolean(src));

  if (!src) return null;

  return (
    <div
      ref={wrapperRef}
      className={cn(fill ? 'absolute inset-0 h-full w-full' : 'relative w-full', className)}
    >
      <div
        ref={maskRef}
        className={cn(
          'group relative w-full overflow-hidden',
          reveal ? 'editorial-reveal-mask bg-zinc-900/20' : 'editorial-reveal-mask--open',
          fill ? 'absolute inset-0 h-full' : aspectClassName,
          !fill && 'shadow-[0_24px_80px_rgba(0,0,0,0.08)]'
        )}
      >
        <div
          ref={imageRef}
          className={cn(
            'editorial-reveal-inner absolute inset-0 h-[125%] w-full -top-[12%] will-change-transform',
            !reveal && 'editorial-reveal-inner--static',
            imageClassName
          )}
        >
          <div
            ref={floatRef}
            className="editorial-reveal-float absolute inset-0 h-full w-full will-change-transform"
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

        {grain ? (
          <div
            className="pointer-events-none absolute inset-0 z-[1] opacity-[0.05] mix-blend-overlay"
            style={{ backgroundImage: GRAIN_SVG }}
            aria-hidden
          />
        ) : null}
      </div>
    </div>
  );
});

export default ParallaxRevealImage;
