'use client';

import Link from 'next/link';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import type { Page } from '@/app/lib/types';
import { OptimizedImage } from '@/app/components/ui/OptimizedImage';
import { usePrefersReducedMotion } from '@/app/hooks/usePrefersReducedMotion';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';
import { SectionHeading } from '@/app/components/ui/SectionHeading';
import {
  CraftReveal,
  CraftSection,
  CRAFT_DESC_CLASS,
  CRAFT_TITLE_CLASS,
  useCraftTheme,
} from '@/app/components/sections/CraftSection';
import { ensureGsapScroll, gsap, refreshScrollLayout, ScrollTrigger } from '@/app/lib/gsap-scroll';
import { tiptapToText } from '@/app/lib/seo';
import { cn, getImageSrc } from '@/app/lib/utils';

interface CompanyDetailSectionProps {
  companyDetailSection?: Page['companyDetailSection'];
  className?: string;
}

type StoryDetail = {
  heading: string;
  description: string;
  imageUrl: string;
  imageAlt?: string;
};

const STAGGER = 0.2;
const IMAGE_DURATION = 1.1;
const COPY_DURATION = 0.95;

function CompanyStoryBlock({
  detail,
  index,
  colors,
  fonts,
  accentColor,
  borderColor,
}: {
  detail: StoryDetail;
  index: number;
  colors: ReturnType<typeof useCraftTheme>['colors'];
  fonts: ReturnType<typeof useCraftTheme>['fonts'];
  accentColor: string;
  borderColor: string;
}) {
  const blockRef = useRef<HTMLElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const imageLeft = index % 2 === 0;

  const hiddenClip = imageLeft
    ? 'inset(100% 0% 0% 0%)'
    : 'inset(0% 100% 0% 0%)';

  const copyHiddenClass = reducedMotion
    ? ''
    : 'opacity-0 translate-y-7 motion-reduce:opacity-100 motion-reduce:translate-y-0';

  useGSAP(
    () => {
      const block = blockRef.current;
      const mask = maskRef.current;
      const image = imageRef.current;
      if (!block || !mask || !image) return;

      ensureGsapScroll();

      const copyTargets = ['.story-headline', '.story-desc', '.story-cta'].filter((sel) =>
        block.querySelector(sel)
      );

      if (reducedMotion) {
        gsap.set([mask, image, ...copyTargets], { clearProps: 'all' });
        return;
      }

      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: 'power3.out' },
      });

      tl.fromTo(
        mask,
        { clipPath: hiddenClip, WebkitClipPath: hiddenClip },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          WebkitClipPath: 'inset(0% 0% 0% 0%)',
          duration: IMAGE_DURATION,
          ease: 'power3.inOut',
        }
      ).fromTo(image, { scale: 1.1 }, { scale: 1, duration: IMAGE_DURATION }, 0);

      if (copyTargets.length > 0) {
        tl.fromTo(
          copyTargets[0],
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, duration: COPY_DURATION },
          `+=${STAGGER}`
        );

        for (let i = 1; i < copyTargets.length; i += 1) {
          tl.fromTo(
            copyTargets[i],
            { opacity: 0, y: 28 },
            { opacity: 1, y: 0, duration: COPY_DURATION },
            `+=${STAGGER}`
          );
        }
      }

      ScrollTrigger.create({
        trigger: block,
        start: 'top 80%',
        once: true,
        animation: tl,
        invalidateOnRefresh: true,
      });

      gsap.fromTo(
        image,
        { yPercent: imageLeft ? -3 : 3 },
        {
          yPercent: imageLeft ? 5 : -5,
          ease: 'none',
          scrollTrigger: {
            trigger: block,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
            invalidateOnRefresh: true,
          },
        }
      );

      requestAnimationFrame(() => ScrollTrigger.refresh());
    },
    {
      scope: blockRef,
      dependencies: [reducedMotion, index, hiddenClip, detail.heading, detail.description],
      revertOnUpdate: true,
    }
  );

  return (
    <article
      ref={blockRef}
      className="grid items-center gap-10 sm:gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-24"
    >
      <div className={cn('relative w-full', imageLeft ? 'lg:order-1' : 'lg:order-2')}>
        <div
          ref={maskRef}
          className="relative aspect-[5/4] overflow-hidden sm:aspect-[4/3] lg:aspect-[5/4]"
          style={{
            backgroundColor: `color-mix(in srgb, ${accentColor} 8%, ${colors.sectionBackgroundLight})`,
            clipPath: reducedMotion ? 'inset(0% 0% 0% 0%)' : hiddenClip,
            WebkitClipPath: reducedMotion ? 'inset(0% 0% 0% 0%)' : hiddenClip,
          }}
        >
          <div ref={imageRef} className="absolute inset-0 will-change-transform">
            {detail.imageUrl ? (
              <OptimizedImage
                src={detail.imageUrl}
                alt={detail.imageAlt || detail.heading}
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 48vw"
                priority={index === 0}
              />
            ) : (
              <div
                className="h-full w-full"
                style={{
                  backgroundColor: `color-mix(in srgb, ${accentColor} 12%, ${colors.sectionBackgroundLight})`,
                }}
              />
            )}
          </div>
        </div>

        <div
          className="pointer-events-none absolute inset-3 border sm:inset-4"
          style={{ borderColor }}
          aria-hidden
        />

        <span
          className={cn(
            'pointer-events-none absolute -bottom-4 hidden text-[clamp(4rem,10vw,7rem)] font-light tracking-tighter opacity-[0.06] lg:block',
            imageLeft ? 'right-0' : 'left-0'
          )}
          style={{ color: colors.mainText, fontFamily: fonts.heading }}
          aria-hidden
        >
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      <div
        className={cn(
          'flex w-full flex-col justify-center lg:py-6',
          imageLeft ? 'lg:order-2 lg:pl-4 xl:pl-8' : 'lg:order-1 lg:pr-4 xl:pr-8'
        )}
      >
        <span
          className="mb-4 text-[10px] font-semibold uppercase tracking-[0.35em]"
          style={{ color: accentColor, fontFamily: fonts.body }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>

        {detail.heading && (
          <h3
            className={cn(
              'story-headline text-balance text-[clamp(1.625rem,3.5vw,2.75rem)] font-semibold leading-[1.1] tracking-tight',
              copyHiddenClass
            )}
            style={{ fontFamily: fonts.heading, color: colors.mainText }}
          >
            {detail.heading}
          </h3>
        )}

        {detail.description && (
          <p
            className={cn(
              'story-desc mt-5 max-w-md text-sm leading-relaxed sm:mt-6 sm:text-base sm:leading-[1.8]',
              copyHiddenClass
            )}
            style={{ color: colors.secondaryText, fontFamily: fonts.body }}
          >
            {detail.description}
          </p>
        )}

        <div className={cn('story-cta mt-8 sm:mt-10', copyHiddenClass)}>
          <Link
            href="/contact-us"
            className="group inline-flex items-center gap-3 border-b pb-1 text-[11px] font-semibold uppercase tracking-[0.24em] transition-[gap,opacity] duration-500 hover:gap-5 hover:opacity-80"
            style={{
              color: colors.mainText,
              fontFamily: fonts.body,
              borderColor: `color-mix(in srgb, ${accentColor} 45%, transparent)`,
            }}
          >
            Discover More
            <svg
              className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path d="M5 12h14M13 6l6 6-6 6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}

export function CompanyDetailSection({ companyDetailSection, className }: CompanyDetailSectionProps) {
  const { colors, fonts, accentColor, borderColor } = useCraftTheme();

  const heading = useMemo(
    () => tiptapToText(companyDetailSection?.title),
    [companyDetailSection?.title]
  );
  const description = useMemo(
    () => tiptapToText(companyDetailSection?.description),
    [companyDetailSection?.description]
  );
  const sections = useMemo(
    () =>
      companyDetailSection?.details
        ?.map((detail) => ({
          heading: tiptapToText(detail.title) || detail.label?.trim() || '',
          description: tiptapToText(detail.description) || tiptapToText(detail.value),
          imageUrl: detail.image?.url ? getImageSrc(detail.image.url) : '',
          imageAlt: detail.image?.altText?.trim(),
        }))
        .filter((detail) => detail.heading || detail.description) ?? [],
    [companyDetailSection?.details]
  );

  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation<HTMLDivElement>({
    threshold: 0.2,
  });

  useLayoutEffect(() => {
    refreshScrollLayout();
  }, [sections]);

  if (!companyDetailSection || companyDetailSection.enabled === false) return null;
  if (!heading && !description && sections.length === 0) return null;

  return (
    <CraftSection
      id="company-details"
      surface="muted"
      accentLine
      className={cn('overflow-visible', className)}
    >
      {(heading || description) && (
        <CraftReveal visible={titleVisible} className="mb-14 max-w-3xl lg:mb-20">
          <div ref={titleRef}>
            <SectionHeading
              eyebrow="Our Story"
              title={heading}
              description={description}
              titleClassName={CRAFT_TITLE_CLASS}
              descriptionClassName={CRAFT_DESC_CLASS}
            />
          </div>
        </CraftReveal>
      )}

      <div className="flex flex-col gap-20 sm:gap-28 lg:gap-36 xl:gap-40">
        {sections.map((section, index) => (
          <CompanyStoryBlock
            key={`${section.heading}-${index}`}
            detail={section}
            index={index}
            colors={colors}
            fonts={fonts}
            accentColor={accentColor}
            borderColor={borderColor}
          />
        ))}
      </div>
    </CraftSection>
  );
}

export default CompanyDetailSection;
