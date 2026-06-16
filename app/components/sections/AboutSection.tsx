'use client';

import { useMemo } from 'react';
import type { Page } from '@/app/lib/types';
import { MaskBlindRevealImage } from '@/app/components/cinematic/MaskBlindRevealImage';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';
import { useSectionTheme } from '@/app/hooks/useSectionTheme';
import { tiptapToText } from '@/app/lib/seo';
import { CraftButton, CraftReveal, useCraftTheme } from '@/app/components/sections/CraftSection';
import { cn, getImageSrc } from '@/app/lib/utils';

interface AboutSectionProps {
  aboutSection?: Page['aboutSection'];
  page?: Page;
  className?: string;
}

function normalizeHref(href: string): string {
  const t = href.trim();
  if (t.startsWith('http') || t.startsWith('mailto:') || t.startsWith('tel:')) return t;
  return t.startsWith('/') ? t : `/${t}`;
}

function resolveAboutCta(data: Record<string, unknown>): { label: string; href: string } | null {
  const primary = data.primaryCta as { label?: string; href?: string } | undefined;
  if (primary?.label?.trim()) {
    return { label: primary.label.trim(), href: normalizeHref(primary.href?.trim() || '/contact-us') };
  }
  const primaryButton = data.primaryButton as { label?: string; href?: string } | undefined;
  if (primaryButton?.label?.trim()) {
    return { label: primaryButton.label.trim(), href: normalizeHref(primaryButton.href?.trim() || '/contact-us') };
  }
  const legacy = data.ctaButton as { text?: string; url?: string; label?: string; href?: string };
  const label = legacy?.text?.trim() || legacy?.label?.trim();
  if (label) {
    return { label, href: normalizeHref(legacy?.url?.trim() || legacy?.href?.trim() || '/contact-us') };
  }
  const button = data.button as { label?: string; text?: string; href?: string; url?: string };
  const buttonLabel = button?.label?.trim() || button?.text?.trim();
  if (buttonLabel) {
    return { label: buttonLabel, href: normalizeHref(button?.href?.trim() || button?.url?.trim() || '/contact-us') };
  }
  return null;
}

export function AboutSection({ aboutSection, className }: AboutSectionProps) {
  const { fonts, colors } = useSectionTheme();
  const { accentColor, borderColor } = useCraftTheme();

  const title = useMemo(() => tiptapToText(aboutSection?.title), [aboutSection?.title]);
  const description = useMemo(
    () => tiptapToText(aboutSection?.description),
    [aboutSection?.description]
  );
  const aboutImage = useMemo(() => {
    const url = aboutSection?.image?.url;
    return url ? getImageSrc(url) : '';
  }, [aboutSection?.image?.url]);
  const ctaButton = useMemo(() => {
    if (!aboutSection || typeof aboutSection !== 'object') return null;
    return resolveAboutCta(aboutSection as Record<string, unknown>);
  }, [aboutSection]);

  const { ref: contentRef, isVisible: contentVisible } = useScrollAnimation<HTMLDivElement>({
    threshold: 0.15,
  });

  if (!aboutSection || aboutSection.enabled === false) return null;
  if (!title && !description && !aboutImage) return null;

  const panelAccent = `color-mix(in srgb, ${accentColor} 72%, #c45c26)`;

  return (
    <section
      id="about"
      className={cn('grid border-t lg:min-h-[min(78vh,680px)] lg:grid-cols-2', className)}
      style={{ borderColor }}
    >
      {/* left — heading + copy + CTA */}
      <div
        ref={contentRef}
        className="order-1 flex flex-col items-center justify-center px-8 py-12 text-center sm:px-12 sm:py-14 lg:order-none lg:px-16 lg:py-16 xl:px-20"
        style={{ backgroundColor: colors.pageBackground, color: colors.mainText }}
      >
        <CraftReveal visible={contentVisible} className="w-full max-w-md">
          <div className="flex flex-col items-center gap-5 sm:gap-6">
            {title && (
              <h2
                className="text-balance text-[clamp(1.75rem,4vw,3rem)] font-semibold leading-[1.12] tracking-tight"
                style={{ fontFamily: fonts.heading }}
              >
                {title}
              </h2>
            )}

            {description && (
              <p
                className="text-sm leading-relaxed sm:text-[15px] sm:leading-[1.7]"
                style={{ color: colors.secondaryText, fontFamily: fonts.body }}
              >
                {description}
              </p>
            )}

            {ctaButton && (
              <CraftButton href={ctaButton.href} label={ctaButton.label} className="mt-1" />
            )}
          </div>
        </CraftReveal>
      </div>

      {/* right — accent panel + blind reveal image */}
      {aboutImage && (
        <div
          className="order-2 flex min-h-[min(48vh,440px)] items-center justify-center px-10 py-12 sm:px-14 sm:py-14 lg:order-none lg:min-h-0 lg:px-16 lg:py-16 xl:px-20"
          style={{ backgroundColor: panelAccent }}
        >
          <div className="w-full max-w-[min(100%,300px)] sm:max-w-[320px] lg:max-w-[340px]">
            <MaskBlindRevealImage
              src={aboutImage}
              alt={aboutSection.image?.altText?.trim() || title || 'About Us'}
              aspectClassName="aspect-[3/4]"
              sizes="(max-width: 1024px) 90vw, 28vw"
              scrub={1.1}
              start="top 88%"
              end="center center"
              className="mx-auto"
            />
          </div>
        </div>
      )}
    </section>
  );
}

export default AboutSection;
