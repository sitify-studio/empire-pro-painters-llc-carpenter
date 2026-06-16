'use client';

import Link from 'next/link';
import { useMemo, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import type { Page } from '@/app/lib/types';
import { HeroPaintBucket } from '@/app/components/cinematic/HeroPaintBucket';
import { useSectionTheme } from '@/app/hooks/useSectionTheme';
import { tiptapToText } from '@/app/lib/seo';
import { cn } from '@/app/lib/utils';
import { usePrefersReducedMotion } from '@/app/hooks/usePrefersReducedMotion';
import { useHeroIntro } from '@/app/providers/HeroIntroProvider';
import { gsap } from '@/app/lib/gsap-scroll';
import { useCraftTheme } from '@/app/components/sections/CraftSection';

interface HeroSectionProps {
  hero?: Page['hero'];
  page?: Page;
  className?: string;
}

function resolveCtaButton(hero?: Page['hero']): { label: string; href: string } | null {
  const primary = hero?.primaryCta;
  if (primary?.label?.trim()) {
    return { label: primary.label.trim(), href: primary.href?.trim() || '/' };
  }
  return null;
}

function splitDescriptionBullets(text: string, max = 3): string[] {
  if (!text.trim()) return [];
  const sentences = text.match(/[^.!?]+[.!?]+/g)?.map((s) => s.trim()) ?? [text.trim()];
  if (sentences.length <= max) return sentences;
  const chunk = Math.ceil(sentences.length / max);
  const bullets: string[] = [];
  for (let i = 0; i < sentences.length; i += chunk) {
    bullets.push(sentences.slice(i, i + chunk).join(' '));
    if (bullets.length === max) break;
  }
  return bullets;
}

export function HeroSection({ hero, className }: HeroSectionProps) {
  const { fonts, colors } = useSectionTheme();
  const { accentColor } = useCraftTheme();
  const reducedMotion = usePrefersReducedMotion();
  const { completeHeroIntro } = useHeroIntro();

  const sectionRef = useRef<HTMLElement>(null);

  const title = useMemo(() => tiptapToText(hero?.title), [hero?.title]);
  const subtitle = useMemo(
    () => tiptapToText(hero?.subtitle) || tiptapToText(hero?.eyebrow),
    [hero?.subtitle, hero?.eyebrow]
  );
  const description = useMemo(() => tiptapToText(hero?.description), [hero?.description]);
  const descriptionBullets = useMemo(() => splitDescriptionBullets(description), [description]);
  const primaryCta = useMemo(() => resolveCtaButton(hero), [hero]);
  const stats = useMemo(
    () => (hero?.editorialStats ?? []).filter((s) => s.label?.trim()),
    [hero?.editorialStats]
  );

  const bucketColor = accentColor || colors.primaryButton || '#4A7FD4';
  const heroBg = `color-mix(in srgb, ${colors.pageBackground} 88%, #f5f0ea)`;

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      if (reducedMotion) {
        gsap.set('.hero-intro', { clearProps: 'all', opacity: 1, y: 0 });
        gsap.set('.hero-bucket', { clearProps: 'all', opacity: 1, scale: 1 });
        completeHeroIntro();
        return;
      }

      gsap.set('.hero-bucket', { opacity: 0, scale: 0.94, transformOrigin: 'center center' });
      gsap.set('.hero-intro', { opacity: 0, y: 28 });

      const tl = gsap.timeline({ delay: 0.1, onComplete: completeHeroIntro });

      tl.to('.hero-bucket', { opacity: 1, scale: 1, duration: 1.1, ease: 'power3.out' }).to(
        '.hero-intro',
        { opacity: 1, y: 0, duration: 0.85, stagger: 0.1, ease: 'power3.out' },
        '-=0.65'
      );
    },
    { scope: sectionRef, dependencies: [reducedMotion, title] }
  );

  if (!hero || hero.enabled === false) return null;
  if (!title && !description && !subtitle) return null;

  return (
    <>
      <section
        ref={sectionRef}
        id="hero"
        className={cn('relative -mt-14 min-h-[100svh] overflow-hidden lg:h-[100svh] lg:max-h-[100svh]', className)}
        style={{ backgroundColor: heroBg, color: colors.mainText }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 30%, color-mix(in srgb, ${bucketColor} 6%, transparent) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, color-mix(in srgb, ${bucketColor} 4%, transparent) 0%, transparent 45%)`,
          }}
          aria-hidden
        />

        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col items-center justify-center gap-8 px-5 pb-10 pt-20 sm:px-8 lg:grid lg:grid-cols-12 lg:items-center lg:gap-6 lg:px-10 lg:pb-6 lg:pt-16 xl:gap-10">
          {/* left — headings + CTA (desktop) */}
          <div className="hero-intro order-1 flex w-full max-w-md flex-col items-center text-center lg:order-none lg:col-span-4 lg:items-start lg:text-left">
            {subtitle && (
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.32em] sm:text-[11px]"
                style={{ color: colors.secondaryText, fontFamily: fonts.body }}
              >
                {subtitle}
              </p>
            )}

            {title && (
              <h1
                className={cn(
                  'text-balance font-semibold leading-[1.08] tracking-tight',
                  subtitle ? 'mt-4' : '',
                  'text-[clamp(1.75rem,5vw,3.25rem)]'
                )}
                style={{ fontFamily: fonts.heading, color: colors.mainText }}
              >
                {title}
              </h1>
            )}

            {primaryCta && (
              <Link
                href={primaryCta.href}
                className="mt-7 hidden min-h-[46px] items-center justify-center px-7 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] transition-opacity hover:opacity-90 sm:text-[11px] lg:inline-flex"
                style={{
                  fontFamily: fonts.body,
                  backgroundColor: colors.primaryButton,
                  color: colors.darkPrimaryText,
                }}
              >
                {primaryCta.label}
              </Link>
            )}
          </div>

          {/* center — bucket only */}
          <div className="hero-bucket order-2 relative w-full max-w-[min(72vw,320px)] shrink-0 lg:order-none lg:col-span-4 lg:max-w-none lg:justify-self-center">
            <div className="relative w-full" style={{ aspectRatio: '480 / 520' }}>
              <HeroPaintBucket
                fillColor={bucketColor}
                reducedMotion={reducedMotion}
                className="absolute inset-0"
              />
            </div>
          </div>

          {/* right — description bullets */}
          <div className="hero-intro order-3 flex w-full max-w-md flex-col items-center lg:order-none lg:col-span-4 lg:items-end lg:text-right">
            {descriptionBullets.length > 0 ? (
              <ul className="flex w-full flex-col gap-4 sm:gap-5">
                {descriptionBullets.map((bullet, i) => (
                  <li
                    key={`${i}-${bullet.slice(0, 24)}`}
                    className="flex items-start gap-3 text-left lg:flex-row-reverse lg:items-start lg:gap-4 lg:text-right"
                  >
                    <span
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: bucketColor }}
                      aria-hidden
                    />
                    <p
                      className="text-sm leading-relaxed sm:text-[15px]"
                      style={{ color: colors.secondaryText, fontFamily: fonts.body }}
                    >
                      {bullet}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              description && (
                <p
                  className="text-sm leading-relaxed sm:text-[15px] lg:max-w-sm"
                  style={{ color: colors.secondaryText, fontFamily: fonts.body }}
                >
                  {description}
                </p>
              )
            )}
          </div>

          {primaryCta && (
            <Link
              href={primaryCta.href}
              className="hero-intro order-4 inline-flex min-h-[46px] items-center justify-center px-7 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] transition-opacity hover:opacity-90 sm:text-[11px] lg:hidden"
              style={{
                fontFamily: fonts.body,
                backgroundColor: colors.primaryButton,
                color: colors.darkPrimaryText,
              }}
            >
              {primaryCta.label}
            </Link>
          )}
        </div>
      </section>

      {stats.length > 0 && (
        <div
          className="border-b px-4 py-8 sm:px-6"
          style={{
            backgroundColor: heroBg,
            borderColor: `color-mix(in srgb, ${colors.mainText} 12%, transparent)`,
          }}
        >
          <div className="hero-intro mx-auto grid w-full max-w-2xl grid-cols-2 gap-6 sm:grid-cols-3 sm:gap-8">
            {stats.slice(0, 3).map((stat, i) => (
              <div key={`${stat.label}-${i}`} className="text-center">
                <p
                  className="text-xl font-semibold tabular-nums sm:text-2xl"
                  style={{ color: colors.mainText, fontFamily: fonts.heading }}
                >
                  {stat.value}
                  {stat.suffix}
                </p>
                <p
                  className="mt-1 text-[9px] font-medium uppercase tracking-[0.2em] sm:text-[10px]"
                  style={{ color: colors.secondaryText, fontFamily: fonts.body }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default HeroSection;
