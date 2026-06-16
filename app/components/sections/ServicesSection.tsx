'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import type { Page } from '@/app/lib/types';
import { MaskBlindRevealImage } from '@/app/components/cinematic/MaskBlindRevealImage';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { useScrollAnimation, useStaggeredAnimation } from '@/app/hooks/useScrollAnimation';
import { useSectionTheme } from '@/app/hooks/useSectionTheme';
import type { ThemeColors } from '@/app/hooks/useTheme';
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

interface ServicesSectionProps {
  servicesSection?: Page['servicesSection'];
  companyDetailSection?: Page['companyDetailSection'];
  ctaSection?: Page['ctaSection'];
  page?: Page;
  className?: string;
}

type DisplayService = {
  name: string;
  description: string;
  slug: string;
  href: string;
  imageUrl: string;
};

function normalizeHref(href: string): string {
  const t = href.trim();
  if (t.startsWith('http') || t.startsWith('mailto:') || t.startsWith('tel:')) return t;
  return t.startsWith('/') ? t : `/${t}`;
}

function serviceHref(slug: string, name: string): string {
  return `/service/${slug || name.toLowerCase().replace(/\s+/g, '-')}`;
}

function resolveServiceHref(service: {
  slug: string;
  name: string;
  cta?: { buttonUrl?: string };
}): string {
  const customUrl = service.cta?.buttonUrl?.trim();
  return customUrl ? normalizeHref(customUrl) : serviceHref(service.slug, service.name);
}

function ServiceRow({
  service,
  index,
  textVisible,
  colors,
  fonts,
  accentColor,
}: {
  service: DisplayService;
  index: number;
  textVisible: boolean;
  colors: ThemeColors;
  fonts: ReturnType<typeof useSectionTheme>['fonts'];
  accentColor: string;
}) {
  const isEven = index % 2 === 0;
  const delay = index * 120;

  return (
    <article
      className="grid items-center gap-8 border-b py-10 sm:py-12 lg:grid-cols-2 lg:gap-14 lg:py-14"
      style={{ borderColor: `color-mix(in srgb, ${colors.mainText} 12%, transparent)` }}
    >
      <div className={cn('w-full', isEven ? 'lg:order-1' : 'lg:order-2')}>
        {service.imageUrl ? (
          <MaskBlindRevealImage
            src={service.imageUrl}
            alt={service.name}
            aspectClassName="aspect-[4/3]"
            sizes="(max-width: 1024px) 100vw, 45vw"
            scrub={1.1}
            start="top 88%"
            end="center center"
          />
        ) : (
          <div
            className="aspect-[4/3] w-full"
            style={{
              backgroundColor: `color-mix(in srgb, ${accentColor} 18%, ${colors.sectionBackgroundLight})`,
            }}
            aria-hidden
          />
        )}
      </div>

      <div
        className={cn(
          'flex flex-col justify-center gap-4 transition-all duration-1000',
          isEven ? 'lg:order-2' : 'lg:order-1',
          textVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
        )}
        style={{ transitionDelay: `${delay + 150}ms` }}
      >
        <span
          className="text-[10px] font-bold uppercase tracking-[0.35em]"
          style={{ color: accentColor, fontFamily: fonts.body }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>

        <h3
          className="text-[clamp(1.35rem,3vw,2.25rem)] font-semibold leading-[1.1] tracking-tight"
          style={{ fontFamily: fonts.heading, color: colors.mainText }}
        >
          {service.name}
        </h3>

        {service.description && (
          <p
            className="max-w-lg text-sm leading-relaxed sm:text-[15px]"
            style={{ color: colors.secondaryText, fontFamily: fonts.body }}
          >
            {service.description}
          </p>
        )}

        <div className="pt-2">
          <Link
            href={service.href}
            className="group/link inline-flex items-center gap-2 border-b pb-1 text-[11px] font-semibold uppercase tracking-[0.18em] transition-all duration-300 hover:gap-3"
            style={{
              borderColor: `color-mix(in srgb, ${colors.mainText} 35%, transparent)`,
              color: colors.mainText,
              fontFamily: fonts.body,
            }}
          >
            <span>Explore Service</span>
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}

export function ServicesSection({ servicesSection, className }: ServicesSectionProps) {
  const { services } = useWebBuilder();
  const { colors, fonts } = useSectionTheme();
  const { accentColor } = useCraftTheme();

  const title = useMemo(() => tiptapToText(servicesSection?.title), [servicesSection?.title]);
  const description = useMemo(
    () => tiptapToText(servicesSection?.description),
    [servicesSection?.description]
  );

  const displayServices = useMemo((): DisplayService[] => {
    const fromApi = (services ?? []).filter((service) =>
      servicesSection?.serviceIds?.length
        ? servicesSection.serviceIds.includes(service._id)
        : service.status === 'published'
    );

    return fromApi.map((service) => {
      const rawUrl =
        service.thumbnailImage?.url ||
        service.galleryImages?.[0]?.url ||
        service.cta?.image?.url ||
        service.seo?.ogImageUrl ||
        '';
      return {
        name: service.name,
        description: tiptapToText(service.shortDescription),
        slug: service.slug,
        href: resolveServiceHref(service),
        imageUrl: rawUrl ? getImageSrc(rawUrl) : '',
      };
    });
  }, [services, servicesSection?.serviceIds]);

  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation<HTMLDivElement>({
    threshold: 0.1,
  });
  const { ref: listRef, visibleItems } = useStaggeredAnimation(displayServices.length, 100);

  if (!servicesSection || servicesSection.enabled === false) return null;
  if (!title && !description && displayServices.length === 0) return null;

  return (
    <CraftSection id="services" surface="page" dotted accentLine className={className}>
      {(title || description) && (
        <CraftReveal visible={titleVisible} className="mb-10 max-w-3xl lg:mb-14">
          <div ref={titleRef}>
            <SectionHeading
              eyebrow="Capabilities"
              title={title}
              description={description}
              titleClassName={CRAFT_TITLE_CLASS}
              descriptionClassName={CRAFT_DESC_CLASS}
            />
          </div>
        </CraftReveal>
      )}

      {displayServices.length > 0 && (
        <div ref={listRef} className="mx-auto w-full max-w-6xl">
          {displayServices.map((service, index) => (
            <ServiceRow
              key={service.slug || index}
              service={service}
              index={index}
              textVisible={visibleItems.includes(index)}
              colors={colors}
              fonts={fonts}
              accentColor={accentColor}
            />
          ))}
        </div>
      )}
    </CraftSection>
  );
}

export default ServicesSection;
