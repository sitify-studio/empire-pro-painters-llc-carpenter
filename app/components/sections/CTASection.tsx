'use client';

import { useMemo } from 'react';
import type { Page } from '@/app/lib/types';
import { OptimizedImage } from '@/app/components/ui/OptimizedImage';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';
import { SectionHeading } from '@/app/components/ui/SectionHeading';
import {
  CraftButton,
  CraftReveal,
  CRAFT_DESC_CLASS,
  CRAFT_TITLE_CLASS,
  useCraftTheme,
} from '@/app/components/sections/CraftSection';
import { tiptapToText } from '@/app/lib/seo';
import { cn, getImageSrc } from '@/app/lib/utils';

type CtaSectionInput = Page['ctaSection'] & {
  subtitle?: unknown;
  label?: unknown;
  image?: { url?: string } | string;
  mediaItems?: Array<{ url?: string }>;
  ctaButton?: { text?: string; url?: string; label?: string; href?: string };
};

interface CTASectionProps {
  ctaSection?: Page['ctaSection'];
  className?: string;
}

function resolveCtaBackgroundImage(cta?: CtaSectionInput): string {
  if (!cta) return '';

  const raw =
    cta.backgroundImage ??
    (typeof cta.image === 'string' ? cta.image : cta.image?.url) ??
    cta.mediaItems?.[0]?.url;

  if (!raw) return '';
  if (typeof raw === 'string') return getImageSrc(raw);
  return '';
}

function resolveCtaButton(cta?: CtaSectionInput): { label: string; href: string } | null {
  if (!cta) return null;

  const primary = cta.primaryButton;
  if (primary?.label?.trim()) {
    return {
      label: primary.label.trim(),
      href: primary.href?.trim() || '/',
    };
  }

  const legacy = cta.ctaButton;
  const label = legacy?.text?.trim() || legacy?.label?.trim();
  if (label) {
    return {
      label,
      href: legacy?.url?.trim() || legacy?.href?.trim() || '/contact-us',
    };
  }

  return null;
}

export function CTASection({ ctaSection, className }: CTASectionProps) {
  const { colors, borderColor } = useCraftTheme();
  const cta = ctaSection as CtaSectionInput | undefined;

  const subHeading = useMemo(
    () => tiptapToText(cta?.subtitle) || tiptapToText(cta?.label) || 'Next Steps',
    [cta?.subtitle, cta?.label]
  );
  const heading = useMemo(() => tiptapToText(cta?.title), [cta?.title]);
  const description = useMemo(() => tiptapToText(cta?.description), [cta?.description]);
  const ctaButton = useMemo(() => resolveCtaButton(cta), [cta]);
  const ctaImage = useMemo(() => resolveCtaBackgroundImage(cta), [cta]);

  const { ref: contentRef, isVisible: contentVisible } = useScrollAnimation<HTMLDivElement>({
    threshold: 0.2,
  });

  if (!ctaSection || ctaSection.enabled === false) return null;
  if (!heading && !description && !ctaButton) return null;

  const overlayColor = colors.sectionBackgroundDark;

  return (
    <section
      id="cta"
      className={cn('relative overflow-hidden border-t', className)}
      style={{
        borderColor,
        color: colors.darkPrimaryText,
        backgroundColor: ctaImage ? 'transparent' : overlayColor,
      }}
    >
      {ctaImage && (
        <div className="pointer-events-none absolute inset-0 z-0">
          <OptimizedImage
            src={ctaImage}
            alt={heading || 'Call to action'}
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 z-[1]" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to right, color-mix(in srgb, ${overlayColor} 78%, transparent) 0%, color-mix(in srgb, ${overlayColor} 40%, transparent) 45%, color-mix(in srgb, ${overlayColor} 20%, transparent) 100%)`,
          }}
        />
      </div>

      <div className="container relative z-10 mx-auto flex min-h-[min(72vh,720px)] items-center px-6 py-14 sm:py-16 lg:px-12 lg:py-20">
        <CraftReveal visible={contentVisible} className="w-full">
          <div ref={contentRef} className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-8 lg:col-start-2">
              <SectionHeading
                eyebrow={subHeading}
                title={heading}
                description={description}
                variant="dark"
                titleClassName={CRAFT_TITLE_CLASS}
                descriptionClassName={cn(CRAFT_DESC_CLASS, 'mb-8')}
              />

              {ctaButton && (
                <div className="flex flex-col items-start gap-8 sm:flex-row">
                  <CraftButton href={ctaButton.href} label={ctaButton.label} />

                  <div className="flex flex-col">
                    <span
                      className="mb-1 text-[10px] uppercase tracking-widest"
                      style={{ color: colors.darkSecondaryText }}
                    >
                      Direct Inquiries
                    </span>
                    <span
                      className="text-lg font-light tracking-tight"
                      style={{ color: colors.darkPrimaryText }}
                    >
                      Available 24/7
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CraftReveal>
      </div>
    </section>
  );
}

export default CTASection;
