'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import type { Page } from '@/app/lib/types';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';
import { CraftReveal, useCraftTheme } from '@/app/components/sections/CraftSection';
import { cn } from '@/app/lib/utils';
import { tiptapToText } from '@/app/lib/seo';

interface WhyChooseUsSectionProps {
  whyChooseUsSection?: Page['whyChooseUsSection'];
  className?: string;
}

function FeatureIcon({ variant, color }: { variant: number; color: string }) {
  const className = 'h-8 w-8 shrink-0 sm:h-9 sm:w-9';

  if (variant % 3 === 1) {
    return (
      <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
        <path
          d="M16 4 L19 13 L28 16 L19 19 L16 28 L13 19 L4 16 L13 13 Z"
          stroke={color}
          strokeWidth="1.25"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (variant % 3 === 2) {
    return (
      <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
        <path d="M8 9 L16 5 L24 9 L16 13 Z" stroke={color} strokeWidth="1.25" strokeLinejoin="round" />
        <path d="M8 17 L16 13 L24 17 L16 21 Z" stroke={color} strokeWidth="1.25" strokeLinejoin="round" />
        <path d="M8 25 L16 21 L24 25 L16 29 Z" stroke={color} strokeWidth="1.25" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <circle cx="13" cy="16" r="7" stroke={color} strokeWidth="1.25" />
      <circle cx="19" cy="16" r="7" stroke={color} strokeWidth="1.25" />
      <circle cx="16" cy="11" r="7" stroke={color} strokeWidth="1.25" />
    </svg>
  );
}

export function WhyChooseUsSection({ whyChooseUsSection, className }: WhyChooseUsSectionProps) {
  const { colors, fonts, accentColor, borderColor } = useCraftTheme();

  const title = useMemo(() => tiptapToText(whyChooseUsSection?.title), [whyChooseUsSection?.title]);
  const description = useMemo(
    () => tiptapToText(whyChooseUsSection?.description),
    [whyChooseUsSection?.description]
  );
  const sectionsData = useMemo(
    () =>
      (whyChooseUsSection?.items ?? [])
        .map((item) => ({
          heading: tiptapToText(item.title),
          description: tiptapToText(item.description),
        }))
        .filter((item) => item.heading || item.description),
    [whyChooseUsSection?.items]
  );

  const { ref: sectionRef, isVisible } = useScrollAnimation<HTMLElement>({ threshold: 0.08 });

  const sectionBg = `color-mix(in srgb, ${colors.sectionBackgroundLight} 88%, #f3e8e4)`;
  const iconColor = `color-mix(in srgb, ${accentColor} 65%, #6b3a2e)`;

  if (!whyChooseUsSection || whyChooseUsSection.enabled === false) return null;
  if (!title && !description && sectionsData.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      id="why-choose-us"
      className={cn('border-t py-14 sm:py-16 lg:py-20', className)}
      style={{ backgroundColor: sectionBg, borderColor, color: colors.mainText }}
    >
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14 xl:gap-20">
          {/* sticky left column */}
          <CraftReveal
            visible={isVisible}
            className="lg:col-span-5 lg:sticky lg:top-24 lg:self-start xl:col-span-4"
          >
            <div className="mx-auto max-w-md text-center lg:mx-0 lg:max-w-sm lg:text-left">
              {title && (
                <h2
                  className="text-balance text-[clamp(2rem,4.5vw,3.25rem)] font-semibold leading-[1.08] tracking-tight"
                  style={{ fontFamily: fonts.heading, color: colors.mainText }}
                >
                  {title}
                </h2>
              )}

              {description && (
                <p
                  className={cn('text-sm leading-relaxed sm:text-[15px]', title ? 'mt-5' : '')}
                  style={{ color: colors.secondaryText, fontFamily: fonts.body }}
                >
                  {description}
                </p>
              )}

              <Link
                href="/services"
                className="mt-7 inline-flex min-h-[44px] items-center justify-center border bg-white px-8 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] transition-opacity hover:opacity-85"
                style={{
                  borderColor: `color-mix(in srgb, ${colors.mainText} 35%, transparent)`,
                  color: colors.mainText,
                  fontFamily: fonts.body,
                }}
              >
                All Services
              </Link>
            </div>
          </CraftReveal>

          {/* scrollable right column */}
          {sectionsData.length > 0 && (
            <div className="lg:col-span-7 xl:col-span-8">
              <ul className="divide-y" style={{ borderColor: `color-mix(in srgb, ${colors.mainText} 14%, transparent)` }}>
                {sectionsData.map((section, index) => (
                  <li
                    key={`${section.heading}-${index}`}
                    className={cn(
                      'flex gap-5 py-9 transition-all duration-700 first:pt-0 sm:gap-6 sm:py-10',
                      isVisible ? 'opacity-100' : 'opacity-0'
                    )}
                    style={{ transitionDelay: `${index * 80}ms` }}
                  >
                    <FeatureIcon variant={index} color={iconColor} />

                    <div className="min-w-0 flex-1">
                      {section.heading && (
                        <h3
                          className="text-xl font-semibold tracking-tight sm:text-2xl"
                          style={{ fontFamily: fonts.heading, color: colors.mainText }}
                        >
                          {section.heading}
                        </h3>
                      )}

                      {section.description && (
                        <p
                          className={cn(
                            'text-sm leading-relaxed sm:text-[15px]',
                            section.heading ? 'mt-3' : ''
                          )}
                          style={{ color: colors.secondaryText, fontFamily: fonts.body }}
                        >
                          {section.description}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUsSection;
