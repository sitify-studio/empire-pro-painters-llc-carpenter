'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Service, ServiceAreaPage } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { useSectionTheme } from '@/app/hooks/useSectionTheme';
import {
  getBrandName,
  buildHeaderNavEntries,
  type HomeHeaderNavEntry,
} from '@/app/lib/siteContent';
import {
  getAreaCity,
  getAreaRegion,
  getServiceAreaPageHref,
  getServiceSlugFromAreaPage,
  normalizeSlug,
  resolveServiceSlug,
} from '@/app/lib/serviceAreaSlugs';
import { cn } from '@/app/lib/utils';

type ServiceArea = { city: string; region: string };

type ServingAreaGroup = {
  label: string;
  href: string;
  serviceSlug: string;
  areas: ServiceArea[];
};

function isVisibleService(service: Service): boolean {
  return service.status === 'published';
}

function buildServingAreaGroups(
  services: Service[],
  serviceAreaPages: ServiceAreaPage[],
  siteAreas: string[] | undefined
): ServingAreaGroup[] {
  const visibleServices = services.filter(isVisibleService);
  const groups: ServingAreaGroup[] = [];

  const resolveSlugForPage = (page: ServiceAreaPage): string => {
    const fromPage = getServiceSlugFromAreaPage(page);
    if (fromPage) return fromPage;

    const serviceRef = page.serviceId as string | { slug?: string } | undefined;
    if (serviceRef && typeof serviceRef === 'object' && serviceRef.slug) {
      return resolveServiceSlug({ slug: serviceRef.slug });
    }
    if (typeof serviceRef === 'string') {
      const svc = services.find((s) => s._id === serviceRef);
      if (svc) return resolveServiceSlug(svc);
    }
    return '';
  };

  for (const service of visibleServices) {
    const serviceSlug = resolveServiceSlug(service);
    const seen = new Set<string>();
    const areas: ServiceArea[] = [];

    const addArea = (area: unknown) => {
      const city = getAreaCity(area);
      if (!city) return;
      const region = getAreaRegion(area);
      const key = `${city}|${region}`.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      areas.push({ city, region });
    };

    serviceAreaPages.forEach((page) => {
      if (page.status !== 'published' || !page.city?.trim()) return;
      const pageSlug = resolveSlugForPage(page);
      if (normalizeSlug(pageSlug) !== normalizeSlug(serviceSlug)) return;
      addArea({ city: page.city, region: page.region });
    });

    if (areas.length === 0) {
      (service.serviceAreas ?? []).forEach((area) => addArea(area));
    }

    if (areas.length > 0) {
      groups.push({
        label: service.name,
        href: `/service/${serviceSlug}`,
        serviceSlug,
        areas,
      });
    }
  }

  if (groups.length === 0 && siteAreas?.length) {
    const fallbackSlug = visibleServices[0] ? resolveServiceSlug(visibleServices[0]) : 'service';
    const areas: ServiceArea[] = [];
    const seen = new Set<string>();

    siteAreas.forEach((area) => {
      const city = getAreaCity(area);
      if (!city) return;
      const region = getAreaRegion(area);
      const key = `${city}|${region}`.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      areas.push({ city, region });
    });

    if (areas.length > 0) {
      groups.push({
        label: 'Serving Areas',
        href: `/service/${fallbackSlug}`,
        serviceSlug: fallbackSlug,
        areas,
      });
    }
  }

  return groups;
}

function toTitleCase(label: string): string {
  return label
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function BrandMark({ name, className }: { name: string; className?: string }) {
  const text = (name || 'Brand').toUpperCase();
  const oIndex = text.indexOf('O');

  if (oIndex === -1) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      {text.slice(0, oIndex)}
      <span className="relative inline-block">
        O
        <span className="absolute inset-x-0 -bottom-0.5 mx-auto h-[2px] w-[85%] bg-current" aria-hidden />
      </span>
      {text.slice(oIndex + 1)}
    </span>
  );
}

function useIsActivePath() {
  const pathname = usePathname();

  return (href: string) => {
    if (!href || href.startsWith('http') || href.startsWith('tel:') || href.startsWith('mailto:')) {
      return false;
    }
    const path = href.split(/[?#]/)[0] || '/';
    if (path === '/') return pathname === '/';
    return pathname === path || pathname.startsWith(`${path}/`);
  };
}

function HeaderNavLink({
  href,
  children,
  isActive,
  fonts,
  activeColor,
  textColor,
  onClick,
  className,
}: {
  href: string;
  children: ReactNode;
  isActive: boolean;
  fonts: ReturnType<typeof useSectionTheme>['fonts'];
  activeColor: string;
  textColor: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn('text-[15px] font-normal leading-none transition-colors duration-300', className)}
      style={{
        fontFamily: fonts.heading,
        color: isActive ? activeColor : textColor,
      }}
      aria-current={isActive ? 'page' : undefined}
    >
      {children}
    </Link>
  );
}

export function Header() {
  const { site, pages, services, serviceAreaPages, loading } = useWebBuilder();
  const { colors, fonts } = useSectionTheme();
  const isActivePath = useIsActivePath();

  const [isOpen, setIsOpen] = useState(false);
  const [activeServiceIndex, setActiveServiceIndex] = useState<number | null>(0);
  const [mobileAreasOpen, setMobileAreasOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const businessName = useMemo(() => getBrandName(site), [site]);
  const phoneNumber = site?.business?.phone?.trim() || site?.business?.emergencyPhone?.trim() || '';

  const servingAreaGroups = useMemo(
    () => buildServingAreaGroups(services, serviceAreaPages, site?.serviceAreas),
    [services, serviceAreaPages, site?.serviceAreas]
  );

  const homeNavEntries = useMemo<HomeHeaderNavEntry[]>(
    () =>
      buildHeaderNavEntries(pages, {
        includeServingAreas: servingAreaGroups.length > 0,
      }),
    [pages, servingAreaGroups.length]
  );

  const activeColor = colors.primaryButton;
  const textColor = colors.mainText;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (servingAreaGroups.length === 0) {
      setActiveServiceIndex(null);
      return;
    }
    setActiveServiceIndex((prev) =>
      prev === null || prev >= servingAreaGroups.length ? 0 : prev
    );
  }, [servingAreaGroups.length]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const closeMenu = () => {
    setIsOpen(false);
    setMobileAreasOpen(false);
  };

  const servingAreasDropdown = () =>
    servingAreaGroups.length > 0 ? (
      <div className="group relative">
        <button
          type="button"
          className="text-[15px] font-normal leading-none transition-colors duration-300"
          style={{ fontFamily: fonts.heading, color: textColor }}
        >
          Areas
        </button>

        <div className="invisible absolute right-0 top-full z-50 w-[min(100vw-2rem,520px)] pt-4 opacity-0 transition-all duration-300 group-hover:visible group-hover:opacity-100">
          <div className="flex overflow-hidden border bg-white shadow-[0_20px_60px_rgba(15,15,15,0.08)]" style={{ borderColor: `color-mix(in srgb, ${textColor} 12%, transparent)` }}>
            <div className="w-[38%] shrink-0 border-r py-2" style={{ borderColor: `color-mix(in srgb, ${textColor} 10%, transparent)` }}>
              {servingAreaGroups.map((group, idx) => (
                <button
                  key={group.serviceSlug}
                  type="button"
                  onMouseEnter={() => setActiveServiceIndex(idx)}
                  className={cn(
                    'w-full px-4 py-2.5 text-left text-sm transition-colors',
                    activeServiceIndex === idx ? 'opacity-100' : 'opacity-50 hover:opacity-80'
                  )}
                  style={{
                    fontFamily: fonts.heading,
                    color: textColor,
                  }}
                >
                  {group.label}
                </button>
              ))}
            </div>

            <div className="flex-1 px-4 py-3">
              {isMounted && activeServiceIndex !== null && (
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {servingAreaGroups[activeServiceIndex]?.areas.map((area, idx) => (
                    <Link
                      key={idx}
                      href={getServiceAreaPageHref(
                        servingAreaGroups[activeServiceIndex].serviceSlug,
                        area,
                        serviceAreaPages
                      )}
                      className="text-sm transition-opacity hover:opacity-70"
                      style={{ fontFamily: fonts.body, color: textColor }}
                    >
                      {area.city}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    ) : null;

  if (loading) return null;

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[100] border-b bg-white" style={{ borderColor: `color-mix(in srgb, ${textColor} 8%, transparent)` }}>
        <div className="container mx-auto flex h-16 items-center justify-between px-8 lg:h-[4.5rem] lg:px-12">
          <Link
            href="/"
            className="shrink-0 no-underline"
            style={{ color: textColor, fontFamily: fonts.heading }}
          >
            <BrandMark
              name={businessName}
              className="text-[1.05rem] font-normal tracking-[0.12em] sm:text-[1.15rem]"
            />
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {homeNavEntries.map((entry) =>
              entry.kind === 'anchor' ? (
                <HeaderNavLink
                  key={entry.id}
                  href={entry.href}
                  isActive={isActivePath(entry.href)}
                  fonts={fonts}
                  activeColor={activeColor}
                  textColor={textColor}
                >
                  {toTitleCase(entry.name)}
                </HeaderNavLink>
              ) : (
                <div key="serving-areas">{servingAreasDropdown()}</div>
              )
            )}
          </nav>

          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            className="relative z-[110] p-2 lg:hidden"
            style={{ color: textColor }}
          >
            <div className="flex w-6 flex-col items-end gap-1.5">
              <span className={cn('block h-px w-6 bg-current transition-all duration-300', isOpen && 'translate-y-[5px] rotate-45')} />
              <span className={cn('block h-px bg-current transition-all duration-300', isOpen ? 'w-0 opacity-0' : 'w-4')} />
              <span className={cn('block h-px bg-current transition-all duration-300', isOpen ? 'w-6 -translate-y-[5px] -rotate-45' : 'w-2.5')} />
            </div>
          </button>
        </div>
      </header>

      <div
        className={cn(
          'fixed inset-0 z-[105] bg-white transition-all duration-300 lg:hidden',
          isOpen ? 'visible opacity-100' : 'pointer-events-none invisible opacity-0'
        )}
      >
        <div className="flex h-full flex-col px-8 pb-10 pt-20">
          <nav className="flex flex-1 flex-col gap-5">
            {homeNavEntries.map((entry) =>
              entry.kind === 'anchor' ? (
                <HeaderNavLink
                  key={entry.id}
                  href={entry.href}
                  isActive={isActivePath(entry.href)}
                  fonts={fonts}
                  activeColor={activeColor}
                  textColor={textColor}
                  onClick={closeMenu}
                  className="text-2xl"
                >
                  {toTitleCase(entry.name)}
                </HeaderNavLink>
              ) : (
                servingAreaGroups.length > 0 && (
                  <div key="serving-areas">
                    <button
                      type="button"
                      onClick={() => setMobileAreasOpen((open) => !open)}
                      className="text-left text-2xl font-normal"
                      style={{ fontFamily: fonts.heading, color: textColor }}
                    >
                      Areas
                    </button>

                    {mobileAreasOpen && (
                      <div className="mt-4 space-y-5 border-t pt-4" style={{ borderColor: `color-mix(in srgb, ${textColor} 12%, transparent)` }}>
                        {servingAreaGroups.map((group) => (
                          <div key={group.serviceSlug}>
                            <Link
                              href={group.href}
                              onClick={closeMenu}
                              className="mb-2 block text-sm"
                              style={{ fontFamily: fonts.heading, color: textColor }}
                            >
                              {group.label}
                            </Link>
                            <div className="grid grid-cols-2 gap-2">
                              {group.areas.map((area, idx) => (
                                <Link
                                  key={idx}
                                  href={getServiceAreaPageHref(group.serviceSlug, area, serviceAreaPages)}
                                  onClick={closeMenu}
                                  className="text-sm opacity-70"
                                  style={{ fontFamily: fonts.body, color: textColor }}
                                >
                                  {area.city}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              )
            )}
          </nav>

          {phoneNumber && (
            <div className="border-t pt-6" style={{ borderColor: `color-mix(in srgb, ${textColor} 12%, transparent)` }}>
              <a
                href={`tel:${phoneNumber.replace(/\s/g, '')}`}
                className="text-lg"
                style={{ fontFamily: fonts.heading, color: textColor }}
              >
                {phoneNumber}
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Header;
