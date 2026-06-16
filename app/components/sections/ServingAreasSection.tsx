'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import type { Page, Service, ServiceAreaPage } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { getBusinessTagline } from '@/app/lib/siteContent';
import { cn } from '@/app/lib/utils';
import { tiptapToText } from '@/app/lib/seo';
import {
  getAreaCity,
  getAreaRegion,
  getServiceAreaPageHref,
  getServiceSlugFromAreaPage,
  normalizeSlug,
  resolveServiceSlug,
} from '@/app/lib/serviceAreaSlugs';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';
import { SectionHeading } from '@/app/components/ui/SectionHeading';
import {
  CraftReveal,
  CraftSection,
  CRAFT_DESC_CLASS,
  CRAFT_TITLE_CLASS,
  useCraftTheme,
} from '@/app/components/sections/CraftSection';

interface ServingAreasSectionProps {
  servingAreasSection?: Page['servingAreasSection'];
  className?: string;
}

type DisplayArea = {
  city: string;
  region: string;
  label: string;
  href?: string;
};

function resolveAreaCity(area: unknown): string {
  const fromHelper = getAreaCity(area);
  if (fromHelper) return fromHelper;

  if (area && typeof area === 'object') {
    const record = area as Record<string, unknown>;
    for (const key of ['area', 'location', 'label', 'title', 'name']) {
      const value = record[key];
      if (typeof value === 'string' && value.trim()) return value.trim();
    }
  }

  return '';
}

function formatAreaLabel(city: string, region: string): string {
  if (!region) return city;
  if (city.toLowerCase().includes(region.toLowerCase())) return city;
  return `${city}, ${region}`;
}

function normalizeServiceArea(area: unknown): Omit<DisplayArea, 'href' | 'label'> | null {
  const city = resolveAreaCity(area);
  if (!city) return null;

  const region = getAreaRegion(area);
  return { city, region };
}

function isVisibleService(service: Service): boolean {
  return service.status !== 'draft' && service.status !== 'archived';
}

function areaKey(area: Pick<DisplayArea, 'city' | 'region'>): string {
  return `${area.city.toLowerCase()}|${area.region.toLowerCase()}`;
}

function enrichArea(
  area: Omit<DisplayArea, 'href' | 'label'>,
  serviceSlug: string,
  serviceAreaPages: ServiceAreaPage[] | undefined
): DisplayArea {
  const href = getServiceAreaPageHref(serviceSlug, area, serviceAreaPages);
  return {
    ...area,
    label: formatAreaLabel(area.city, area.region),
    href: href || undefined,
  };
}

function LocationIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="h-8 w-8 shrink-0 sm:h-9 sm:w-9" aria-hidden>
      <path
        d="M16 4c-4.4 0-8 3.4-8 7.6 0 5.7 8 16.4 8 16.4s8-10.7 8-16.4C24 7.4 20.4 4 16 4z"
        stroke={color}
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="11.5" r="2.5" stroke={color} strokeWidth="1.25" />
    </svg>
  );
}

function AreaListItem({
  area,
  index,
  fonts,
  colors,
  accentColor,
  visible,
}: {
  area: DisplayArea;
  index: number;
  fonts: ReturnType<typeof useCraftTheme>['fonts'];
  colors: ReturnType<typeof useCraftTheme>['colors'];
  accentColor: string;
  visible: boolean;
}) {
  const row = (
    <div
      className={cn(
        'flex gap-5 py-8 transition-all duration-700 sm:gap-6 sm:py-9',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
        area.href && 'group'
      )}
      style={{ transitionDelay: `${index * 70}ms` }}
    >
      <LocationIcon color={`color-mix(in srgb, ${accentColor} 65%, ${colors.mainText})`} />

      <div className="min-w-0 flex-1">
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.32em]"
          style={{ color: accentColor, fontFamily: fonts.body }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>

        <p
          className={cn(
            'mt-2 text-xl font-semibold tracking-tight sm:text-2xl',
            area.href && 'transition-opacity group-hover:opacity-75'
          )}
          style={{ fontFamily: fonts.heading, color: colors.mainText }}
        >
          {area.city}
        </p>

        {area.region && area.region !== area.city && (
          <p
            className="mt-1 text-sm sm:text-[15px]"
            style={{ color: colors.secondaryText, fontFamily: fonts.body }}
          >
            {area.region}
          </p>
        )}
      </div>

      {area.href && (
        <span
          className="hidden shrink-0 self-center text-[11px] font-semibold uppercase tracking-[0.2em] opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100 sm:inline-flex"
          style={{ color: colors.mainText, fontFamily: fonts.body }}
        >
          View
        </span>
      )}
    </div>
  );

  if (area.href) {
    return (
      <li>
        <Link href={area.href} className="block no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2">
          {row}
        </Link>
      </li>
    );
  }

  return <li>{row}</li>;
}

export function ServingAreasSection({ servingAreasSection, className }: ServingAreasSectionProps) {
  const { colors, fonts, accentColor } = useCraftTheme();
  const { site, services, serviceAreaPages } = useWebBuilder();

  const serviceAreas = useMemo<DisplayArea[]>(() => {
    const result: DisplayArea[] = [];
    const seen = new Set<string>();

    const addArea = (area: unknown, serviceSlug: string) => {
      const normalized = normalizeServiceArea(area);
      if (!normalized) return;
      const key = areaKey(normalized);
      if (seen.has(key)) return;
      seen.add(key);
      result.push(enrichArea(normalized, serviceSlug, serviceAreaPages));
    };

    const resolveSlugForPage = (page: ServiceAreaPage): string => {
      const serviceRef = page.serviceId as string | { slug?: string } | undefined;
      if (serviceRef && typeof serviceRef === 'object' && serviceRef.slug) {
        return resolveServiceSlug({ slug: serviceRef.slug });
      }
      if (typeof serviceRef === 'string') {
        const svc = services.find((s) => s._id === serviceRef);
        if (svc) return resolveServiceSlug(svc);
      }
      return 'service';
    };

    const addAreasFromServiceAreaPages = (filterPublished = true) => {
      serviceAreaPages.forEach((page) => {
        if (filterPublished && page.status !== 'published') return;
        if (!page.city?.trim()) return;
        addArea({ city: page.city, region: page.region }, resolveSlugForPage(page));
      });
    };

    const addAreasFromServiceAreaPagesForSlug = (slug: string, filterPublished = true) => {
      const normSlug = normalizeSlug(slug);
      serviceAreaPages.forEach((page) => {
        if (filterPublished && page.status !== 'published') return;
        if (!page.city?.trim()) return;
        const pageSlug = getServiceSlugFromAreaPage(page) || resolveSlugForPage(page);
        if (normalizeSlug(pageSlug) !== normSlug) return;
        addArea({ city: page.city, region: page.region }, normSlug);
      });
    };

    const sectionSlug = servingAreasSection?.serviceSlug?.trim();
    if (sectionSlug) {
      const normSectionSlug = normalizeSlug(sectionSlug);
      const match = services.find((s: Service) => resolveServiceSlug(s) === normSectionSlug);
      const slug = match ? resolveServiceSlug(match) : normSectionSlug;

      addAreasFromServiceAreaPagesForSlug(slug, true);
      if (result.length === 0) {
        addAreasFromServiceAreaPagesForSlug(slug, false);
      }
      if (result.length === 0) {
        (match?.serviceAreas ?? []).forEach((area) => addArea(area, slug));
      }
      return result;
    }

    addAreasFromServiceAreaPages(true);
    if (result.length > 0) return result;

    const visibleServices = services.filter(isVisibleService);
    for (const service of visibleServices) {
      const slug = resolveServiceSlug(service);
      (service.serviceAreas ?? []).forEach((area) => addArea(area, slug));
    }
    if (result.length > 0) return result;

    const defaultSlug = visibleServices[0]
      ? resolveServiceSlug(visibleServices[0])
      : services[0]
        ? resolveServiceSlug(services[0])
        : 'service';
    (site?.serviceAreas ?? []).forEach((area) => addArea(area, defaultSlug));
    if (result.length > 0) return result;

    addAreasFromServiceAreaPages(false);

    return result;
  }, [servingAreasSection?.serviceSlug, services, site?.serviceAreas, serviceAreaPages]);

  const sectionTitle = useMemo(() => {
    const text = tiptapToText(servingAreasSection?.title);
    return text || 'Our Service Areas';
  }, [servingAreasSection?.title]);

  const sectionDescription = useMemo(() => {
    const text = tiptapToText(servingAreasSection?.description);
    return text || getBusinessTagline(site) || '';
  }, [servingAreasSection?.description, site]);

  const { ref: sectionRef, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.12 });

  if (servingAreasSection?.enabled === false) return null;
  if (serviceAreas.length === 0) return null;

  const dividerColor = `color-mix(in srgb, ${colors.mainText} 12%, transparent)`;

  return (
    <CraftSection
      id="serving-areas"
      surface="page"
      accentLine
      className={cn('overflow-visible', className)}
    >
      <div ref={sectionRef} className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14 xl:gap-20">
        <CraftReveal
          visible={isVisible}
          className="lg:col-span-5 lg:sticky lg:top-24 lg:self-start xl:col-span-4"
        >
          <SectionHeading
            eyebrow="Locations"
            title={sectionTitle}
            description={sectionDescription || undefined}
            titleClassName={CRAFT_TITLE_CLASS}
            descriptionClassName={CRAFT_DESC_CLASS}
          />

          <Link
            href="/contact-us"
            className="mt-7 inline-flex min-h-[44px] items-center justify-center border bg-white px-8 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] transition-opacity hover:opacity-85"
            style={{
              borderColor: `color-mix(in srgb, ${colors.mainText} 35%, transparent)`,
              color: colors.mainText,
              fontFamily: fonts.body,
            }}
          >
            Get In Touch
          </Link>
        </CraftReveal>

        <div className="lg:col-span-7 xl:col-span-8">
          <ul className="divide-y border-t" style={{ borderColor: dividerColor }}>
            {serviceAreas.map((area, index) => (
              <AreaListItem
                key={areaKey(area)}
                area={area}
                index={index}
                fonts={fonts}
                colors={colors}
                accentColor={accentColor}
                visible={isVisible}
              />
            ))}
          </ul>
        </div>
      </div>
    </CraftSection>
  );
}

export default ServingAreasSection;
