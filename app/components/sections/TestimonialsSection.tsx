'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useGSAP } from '@gsap/react';
import type { Page } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { usePrefersReducedMotion } from '@/app/hooks/usePrefersReducedMotion';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';
import { OptimizedImage } from '@/app/components/ui/OptimizedImage';
import { ensureGsapScroll, gsap } from '@/app/lib/gsap-scroll';
import { tiptapToText } from '@/app/lib/seo';
import { SectionHeading } from '@/app/components/ui/SectionHeading';
import {
  CraftReveal,
  CraftSection,
  CRAFT_DESC_CLASS,
  CRAFT_TITLE_CLASS,
  useCraftTheme,
} from '@/app/components/sections/CraftSection';
import { cn, getImageSrc } from '@/app/lib/utils';

interface TestimonialsSectionProps {
  testimonialsSection?: Page['testimonialsSection'];
  className?: string;
}

type DisplayTestimonial = {
  name: string;
  role: string;
  text: string;
  company: string;
  rating: number;
  avatar: string;
};

const AUTOPLAY_MS = 5000;

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function splitQuoteLines(text: string): string[] {
  if (!text.trim()) return [];
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g);
  if (!sentences || sentences.length <= 1) return [text.trim()];
  return sentences.map((s) => s.trim()).filter(Boolean);
}

function FloatingShape({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={cn('testimonial-float pointer-events-none absolute rounded-full blur-3xl', className)}
      style={style}
      aria-hidden
    />
  );
}

function PremiumTestimonialCard({
  item,
  isActive,
  shouldAnimate,
  colors,
  fonts,
  accentColor,
}: {
  item: DisplayTestimonial;
  isActive: boolean;
  shouldAnimate: boolean;
  colors: ReturnType<typeof useCraftTheme>['colors'];
  fonts: ReturnType<typeof useCraftTheme>['fonts'];
  accentColor: string;
}) {
  const cardRef = useRef<HTMLElement>(null);
  const avatarMaskRef = useRef<HTMLDivElement>(null);
  const avatarImageRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const lines = useMemo(() => splitQuoteLines(item.text), [item.text]);

  const location = item.company;
  const serviceType = item.role;

  useGSAP(
    () => {
      const card = cardRef.current;
      const mask = avatarMaskRef.current;
      const avatar = avatarImageRef.current;
      if (!card || !mask || !avatar || !shouldAnimate || !isActive) return;

      ensureGsapScroll();

      const quoteIcon = card.querySelector('.testimonial-quote-icon');
      const quoteLines = card.querySelectorAll('.testimonial-line');
      const metaItems = card.querySelectorAll('.testimonial-meta > *');
      const decor = card.querySelector('.testimonial-decor');

      if (reducedMotion) {
        gsap.set(card, { opacity: 1, y: 0 });
        gsap.set(mask, { clipPath: 'inset(0% 0% 0% 0%)', WebkitClipPath: 'inset(0% 0% 0% 0%)' });
        gsap.set(avatar, { scale: 1 });
        gsap.set([quoteIcon, ...quoteLines, ...metaItems, decor], { opacity: 1, y: 0, scale: 1 });
        return;
      }

      gsap.set(card, { opacity: 0, y: 48 });
      gsap.set(mask, { clipPath: 'inset(100% 0% 0% 0%)', WebkitClipPath: 'inset(100% 0% 0% 0%)' });
      gsap.set(avatar, { scale: 1.12 });
      gsap.set(quoteIcon, { opacity: 0, scale: 0.88 });
      gsap.set(quoteLines, { opacity: 0, y: 22 });
      gsap.set(metaItems, { opacity: 0, y: 18 });
      gsap.set(decor, { opacity: 0, y: 12 });

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.to(card, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' })
        .to(
          mask,
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            WebkitClipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.05,
            ease: 'power3.inOut',
          },
          0.08
        )
        .to(avatar, { scale: 1, duration: 1.05, ease: 'power3.out' }, 0.08)
        .to(quoteIcon, { opacity: 1, scale: 1, duration: 0.9, ease: 'power3.out' }, 0.42)
        .to(quoteLines, { opacity: 1, y: 0, duration: 0.85, stagger: 0.18, ease: 'power3.out' }, 0.55)
        .to(metaItems, { opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: 'power3.out' }, '-=0.35')
        .to(decor, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, '-=0.55');

      gsap.to(decor, {
        yPercent: -8,
        ease: 'none',
        scrollTrigger: {
          trigger: card,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.6,
        },
      });
    },
    { scope: cardRef, dependencies: [shouldAnimate, isActive, item.text, reducedMotion] }
  );

  return (
    <article
      ref={cardRef}
      className={cn(
        'group relative mx-auto flex w-full max-w-3xl flex-col items-center rounded-3xl border bg-white/90 px-6 py-10 text-center shadow-[0_28px_80px_rgba(15,15,15,0.08)] backdrop-blur-md transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:px-10 sm:py-12 lg:px-14 lg:py-14',
        'hover:-translate-y-1.5 hover:shadow-[0_36px_100px_rgba(15,15,15,0.12)]',
        isActive ? 'opacity-100' : 'pointer-events-none opacity-40'
      )}
      style={{
        borderColor: `color-mix(in srgb, ${colors.mainText} 7%, transparent)`,
      }}
      aria-hidden={!isActive}
    >
      <div
        className="testimonial-decor pointer-events-none absolute -left-6 top-8 h-28 w-28 rounded-full opacity-60 blur-2xl sm:h-36 sm:w-36"
        style={{ backgroundColor: `color-mix(in srgb, ${accentColor} 18%, transparent)` }}
        aria-hidden
      />

      <div
        className="testimonial-quote-icon pointer-events-none absolute right-6 top-6 select-none text-[clamp(5rem,14vw,9rem)] font-serif leading-none opacity-[0.07] sm:right-10 sm:top-8"
        style={{ color: accentColor, fontFamily: fonts.heading }}
        aria-hidden
      >
        &ldquo;
      </div>

      <div className="relative z-10 mb-8 sm:mb-10">
        <div
          ref={avatarMaskRef}
          className="relative mx-auto h-24 w-24 overflow-hidden rounded-full shadow-[0_16px_40px_rgba(15,15,15,0.14)] ring-4 ring-white sm:h-28 sm:w-28 lg:h-32 lg:w-32"
        >
          <div
            ref={avatarImageRef}
            className="relative h-full w-full transition-transform duration-700 ease-out group-hover:scale-105"
          >
            {item.avatar ? (
              <OptimizedImage
                src={item.avatar}
                alt={item.name}
                fill
                className="object-cover"
                sizes="128px"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center text-xl font-semibold sm:text-2xl"
                style={{
                  backgroundColor: `color-mix(in srgb, ${accentColor} 16%, ${colors.pageBackground})`,
                  color: colors.mainText,
                  fontFamily: fonts.heading,
                }}
              >
                {initials(item.name)}
              </div>
            )}
          </div>
        </div>
      </div>

      <blockquote className="relative z-10 max-w-2xl">
        <div className="mb-6 flex justify-center gap-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full"
              style={{
                backgroundColor:
                  i < (item.rating || 5)
                    ? accentColor
                    : `color-mix(in srgb, ${accentColor} 22%, transparent)`,
              }}
              aria-hidden
            />
          ))}
        </div>

        {lines.map((line, i) => (
          <p
            key={`${line}-${i}`}
            className="testimonial-line text-[clamp(1.125rem,2.4vw,1.625rem)] font-medium leading-snug tracking-tight sm:leading-snug"
            style={{ fontFamily: fonts.heading, color: colors.mainText }}
          >
            {line}
          </p>
        ))}
      </blockquote>

      <footer className="testimonial-meta relative z-10 mt-8 flex w-full max-w-md flex-col items-center gap-1 sm:mt-10">
        {item.name && (
          <p
            className="text-base font-semibold sm:text-lg"
            style={{ fontFamily: fonts.heading, color: colors.mainText }}
          >
            {item.name}
          </p>
        )}
        {location && (
          <p
            className="text-xs uppercase tracking-[0.2em] sm:text-[13px]"
            style={{ color: colors.secondaryText, fontFamily: fonts.body }}
          >
            {location}
          </p>
        )}
        {serviceType && (
          <p
            className="mt-1 text-[11px] font-medium uppercase tracking-[0.24em]"
            style={{ color: accentColor, fontFamily: fonts.body }}
          >
            {serviceType}
          </p>
        )}
      </footer>
    </article>
  );
}

export function TestimonialsSection({ testimonialsSection, className }: TestimonialsSectionProps) {
  const { testimonials: globalTestimonials } = useWebBuilder();
  const { colors, fonts, accentColor } = useCraftTheme();
  const reducedMotion = usePrefersReducedMotion();
  const sectionAnimRef = useRef<HTMLDivElement>(null);

  const title = useMemo(() => {
    const pageTitle = tiptapToText(testimonialsSection?.title);
    return pageTitle || tiptapToText(globalTestimonials?.title) || '';
  }, [testimonialsSection?.title, globalTestimonials?.title]);

  const description = useMemo(() => {
    const pageDescription = tiptapToText(testimonialsSection?.description);
    return pageDescription || tiptapToText(globalTestimonials?.description) || '';
  }, [testimonialsSection?.description, globalTestimonials?.description]);

  const testimonials = useMemo<DisplayTestimonial[]>(() => {
    const pageItems = (testimonialsSection?.testimonials ?? [])
      .map((item) => ({
        name: item.name?.trim() || '',
        role: item.role?.trim() || '',
        text: tiptapToText(item.text),
        company: item.company?.trim() || '',
        rating: item.rating ?? 5,
        avatar: item.avatar ? getImageSrc(item.avatar) : '',
      }))
      .filter((item) => item.name || item.text);

    if (pageItems.length > 0) return pageItems;

    return (globalTestimonials?.testimonials ?? [])
      .map((item: Record<string, unknown>) => ({
        name: String(item.name ?? '').trim(),
        role: String(item.role ?? '').trim(),
        text: tiptapToText(item.text ?? item.content),
        company: String(item.company ?? '').trim(),
        rating: typeof item.rating === 'number' ? item.rating : 5,
        avatar: item.avatar ? getImageSrc(String(item.avatar)) : '',
      }))
      .filter((item) => item.name || item.text);
  }, [testimonialsSection?.testimonials, globalTestimonials?.testimonials]);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: testimonials.length > 1,
    align: 'center',
    containScroll: false,
    skipSnaps: false,
    dragFree: false,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const { ref: sectionRef, isVisible: sectionVisible } = useScrollAnimation<HTMLDivElement>({
    threshold: 0.2,
  });

  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    onSelect();
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi || testimonials.length <= 1 || isPaused || reducedMotion || !sectionVisible) return;
    const id = window.setInterval(() => emblaApi.scrollNext(), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [emblaApi, testimonials.length, isPaused, reducedMotion, sectionVisible, selectedIndex]);

  useGSAP(
    () => {
      const root = sectionAnimRef.current;
      if (!root || reducedMotion) return;
      ensureGsapScroll();

      gsap.to('.testimonial-float', {
        yPercent: (i) => (i % 2 === 0 ? -12 : 10),
        xPercent: (i) => (i % 2 === 0 ? 6 : -5),
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 2,
        },
      });
    },
    { scope: sectionAnimRef, dependencies: [reducedMotion] }
  );

  if (testimonialsSection?.enabled === false) return null;
  if (!title && !description && testimonials.length === 0) return null;

  return (
    <CraftSection id="testimonials" surface="page" accentLine className={className}>
      <div ref={sectionRef} className="relative overflow-hidden">
        <div ref={sectionAnimRef} className="pointer-events-none absolute inset-0" aria-hidden>
          <FloatingShape
            className="left-[8%] top-[12%] h-48 w-48 opacity-40"
            style={{ backgroundColor: `color-mix(in srgb, ${accentColor} 14%, transparent)` }}
          />
          <FloatingShape
            className="right-[6%] top-[28%] h-56 w-56 opacity-30"
            style={{ backgroundColor: `color-mix(in srgb, ${colors.mainText} 6%, transparent)` }}
          />
          <FloatingShape
            className="bottom-[10%] left-[22%] h-40 w-40 opacity-35"
            style={{ backgroundColor: `color-mix(in srgb, ${accentColor} 10%, transparent)` }}
          />
        </div>

        <CraftReveal visible={sectionVisible}>
          <div className="relative z-10 mx-auto mb-12 max-w-2xl text-center lg:mb-16">
            <SectionHeading
              eyebrow="Client Voices"
              title={title}
              description={description}
              titleClassName={CRAFT_TITLE_CLASS}
              descriptionClassName={cn(CRAFT_DESC_CLASS, 'mx-auto')}
            />
          </div>
        </CraftReveal>

        {testimonials.length > 0 && (
          <div
            className="relative z-10"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocusCapture={() => setIsPaused(true)}
            onBlurCapture={() => setIsPaused(false)}
          >
            <div className="overflow-hidden px-4 sm:px-8" ref={emblaRef}>
              <div className="flex touch-pan-y">
                {testimonials.map((item, index) => (
                  <div
                    key={`${item.name}-${index}`}
                    className="min-w-0 flex-[0_0_100%] px-2 sm:flex-[0_0_85%] sm:px-4 lg:flex-[0_0_72%]"
                  >
                    <div className="py-4 sm:py-6">
                      <PremiumTestimonialCard
                        item={item}
                        isActive={index === selectedIndex}
                        shouldAnimate={sectionVisible}
                        colors={colors}
                        fonts={fonts}
                        accentColor={accentColor}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {testimonials.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={scrollPrev}
                  aria-label="Previous testimonial"
                  className="absolute left-2 top-1/2 z-40 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border bg-white/90 shadow-lg backdrop-blur-sm transition-all hover:scale-105 hover:bg-white sm:left-4 sm:h-12 sm:w-12"
                  style={{ borderColor: `color-mix(in srgb, ${colors.mainText} 12%, transparent)` }}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path d="M15 19l-7-7 7-7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={scrollNext}
                  aria-label="Next testimonial"
                  className="absolute right-2 top-1/2 z-40 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border bg-white/90 shadow-lg backdrop-blur-sm transition-all hover:scale-105 hover:bg-white sm:right-4 sm:h-12 sm:w-12"
                  style={{ borderColor: `color-mix(in srgb, ${colors.mainText} 12%, transparent)` }}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path d="M9 5l7 7-7 7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                <div className="mt-8 flex items-center justify-center gap-2.5">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      aria-label={`Go to testimonial ${index + 1}`}
                      aria-current={index === selectedIndex ? 'true' : undefined}
                      onClick={() => scrollTo(index)}
                      className="group relative h-2 overflow-hidden rounded-full transition-all duration-500"
                      style={{
                        width: index === selectedIndex ? '2rem' : '0.5rem',
                        backgroundColor: `color-mix(in srgb, ${accentColor} ${index === selectedIndex ? 100 : 28}%, transparent)`,
                      }}
                    >
                      {index === selectedIndex && !reducedMotion && !isPaused && sectionVisible ? (
                        <span
                          key={`${selectedIndex}-${isPaused}`}
                          className="absolute inset-0 origin-left rounded-full bg-white/40"
                          style={{ animation: `testimonial-progress ${AUTOPLAY_MS}ms linear forwards` }}
                        />
                      ) : null}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes testimonial-progress {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }
      `}</style>
    </CraftSection>
  );
}

export default TestimonialsSection;
