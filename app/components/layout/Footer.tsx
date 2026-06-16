'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo } from 'react';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { useSectionTheme } from '@/app/hooks/useSectionTheme';
import {
  getBrandName,
  getCopyrightContent,
  getFooterDescriptionContent,
  getFooterNavLinks,
  isLegalNavHref,
} from '@/app/lib/siteContent';
import { tiptapToText } from '@/app/lib/seo';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { cn, getImageSrc } from '@/app/lib/utils';

const WHITE = '#ffffff';
const BORDER = 'rgba(255,255,255,0.14)';

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone.trim();
}

function formatAddressLine(address?: {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}): string {
  if (!address) return '';

  const street = address.street?.trim() || '';
  const city = address.city?.trim() || '';
  const state = address.state?.trim() || '';
  const zip = address.zipCode?.trim() || '';
  const cityStateZip = [city, state].filter(Boolean).join(', ') + (zip ? ` ${zip}` : '');

  if (street) {
    const streetLower = street.toLowerCase();
    if (city && streetLower.includes(city.toLowerCase())) return street;
    return cityStateZip ? `${street} ${cityStateZip}`.trim() : street;
  }

  return cityStateZip.trim();
}

function formatPlatformLabel(platform: string): string {
  if (platform === 'X') return 'X';
  return platform.charAt(0).toUpperCase() + platform.slice(1);
}

function BrandMark({ name }: { name: string }) {
  const text = (name || 'Brand').toUpperCase();
  const oIndex = text.indexOf('O');

  if (oIndex === -1) return <span>{text}</span>;

  return (
    <span>
      {text.slice(0, oIndex)}
      <span className="relative inline-block">
        O
        <span className="absolute inset-x-0 -bottom-0.5 mx-auto h-[2px] w-[85%] bg-current" aria-hidden />
      </span>
      {text.slice(oIndex + 1)}
    </span>
  );
}

function FooterColumnTitle({ children, fonts }: { children: string; fonts: ReturnType<typeof useSectionTheme>['fonts'] }) {
  return (
    <p
      className="mb-5 text-[10px] font-semibold uppercase tracking-[0.32em]"
      style={{ color: WHITE, fontFamily: fonts.body, opacity: 0.55 }}
    >
      {children}
    </p>
  );
}

export function Footer() {
  const { site, pages, currentPage } = useWebBuilder();
  const { colors, fonts } = useSectionTheme();

  const businessName = useMemo(() => getBrandName(site), [site]);
  const homePage = useMemo(() => pages.find((p) => p.pageType === 'home'), [pages]);
  const copyrightContent = useMemo(
    () => getCopyrightContent(site, currentPage ?? homePage),
    [site, currentPage, homePage]
  );
  const copyrightFallback = useMemo(() => {
    const year = new Date().getFullYear();
    return `${year} © ${businessName || 'Our Business'}. All Rights Reserved.`;
  }, [businessName]);
  const description = useMemo(() => tiptapToText(getFooterDescriptionContent(site)), [site]);

  const logoSrc = useMemo(() => {
    const url = site?.footer?.logo?.url || site?.theme?.logoUrl;
    return url ? getImageSrc(url) : '';
  }, [site?.footer?.logo?.url, site?.theme?.logoUrl]);

  const logoAlt = site?.footer?.logo?.altText?.trim() || businessName || 'Logo';

  const pageLinks = useMemo(() => getFooterNavLinks(pages), [pages]);

  const columnLinks = useMemo(() => {
    return (site?.footer?.columns ?? []).flatMap((column) =>
      (column.links ?? [])
        .map((link) => ({
          label: link.label?.trim() || '',
          href: link.url?.trim() || '',
          group: column.title?.trim() || '',
        }))
        .filter((link) => link.label && link.href)
    );
  }, [site?.footer?.columns]);

  const exploreLinks = useMemo(
    () => pageLinks.filter((link) => !isLegalNavHref(link.href)),
    [pageLinks]
  );

  const legalLinks = useMemo(() => {
    const seen = new Set<string>();
    const merged: Array<{ label: string; href: string }> = [];

    for (const link of pageLinks) {
      if (!isLegalNavHref(link.href) || seen.has(link.href)) continue;
      seen.add(link.href);
      merged.push({ label: link.label, href: link.href });
    }

    for (const link of columnLinks) {
      if (!isLegalNavHref(link.href) || seen.has(link.href)) continue;
      seen.add(link.href);
      merged.push({ label: link.label, href: link.href });
    }

    return merged;
  }, [pageLinks, columnLinks]);

  const socialLinks = useMemo(() => {
    if (site?.footer?.showSocialLinks === false) return [];
    return site?.socialLinks ?? [];
  }, [site?.footer?.showSocialLinks, site?.socialLinks]);

  const phone = site?.business?.phone?.trim() || '';
  const email = site?.business?.email?.trim() || '';
  const addressLine = formatAddressLine(site?.business?.address);

  const bg = colors.sectionBackgroundDark;
  const linkClass = 'text-sm transition-opacity hover:opacity-70';

  return (
    <footer id="contact" style={{ backgroundColor: bg, color: WHITE }}>
      <div className="container mx-auto px-8 py-16 lg:px-12 lg:py-20">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-12 xl:gap-16">
          <div className="lg:col-span-5">
            <Link href="/" className="inline-block no-underline" style={{ color: WHITE, fontFamily: fonts.heading }}>
              {logoSrc ? (
                <div className="relative mb-6 h-11 w-40 sm:h-12 sm:w-48">
                  <Image
                    src={logoSrc}
                    alt={logoAlt}
                    fill
                    className="object-contain object-left"
                  />
                </div>
              ) : (
                <p className="mb-6 text-[1.1rem] font-normal tracking-[0.1em] sm:text-[1.2rem]">
                  <BrandMark name={businessName} />
                </p>
              )}
            </Link>

            {description && (
              <p
                className="max-w-md text-sm leading-[1.8] sm:text-[15px]"
                style={{ color: WHITE, fontFamily: fonts.body, opacity: 0.82 }}
              >
                {description}
              </p>
            )}
          </div>

          <div className="lg:col-span-3">
            <FooterColumnTitle fonts={fonts}>Explore</FooterColumnTitle>
            <nav className="grid grid-cols-1 gap-y-3 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-1">
              {exploreLinks.map((link) => (
                <Link
                  key={`${link.href}-${link.label}`}
                  href={link.href}
                  className={linkClass}
                  style={{ color: WHITE, fontFamily: fonts.body }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="lg:col-span-4">
            <FooterColumnTitle fonts={fonts}>Contact</FooterColumnTitle>
            <div className="flex flex-col gap-3">
              {phone && (
                <a
                  href={`tel:${phone.replace(/\s/g, '')}`}
                  className={linkClass}
                  style={{ color: WHITE, fontFamily: fonts.body }}
                >
                  {formatPhone(phone)}
                </a>
              )}
              {email && (
                <a
                  href={`mailto:${email}`}
                  className={linkClass}
                  style={{ color: WHITE, fontFamily: fonts.body }}
                >
                  {email}
                </a>
              )}
              {addressLine && (
                <p className="text-sm leading-relaxed" style={{ color: WHITE, fontFamily: fonts.body, opacity: 0.82 }}>
                  {addressLine}
                </p>
              )}
            </div>

            {socialLinks.length > 0 && (
              <div className="mt-8">
                <FooterColumnTitle fonts={fonts}>Follow</FooterColumnTitle>
                <nav className="flex flex-wrap gap-x-6 gap-y-3">
                  {socialLinks.map((social, index) => (
                    <a
                      key={`${social.platform}-${index}`}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(linkClass, 'text-[13px]')}
                      style={{ color: WHITE, fontFamily: fonts.body }}
                    >
                      {formatPlatformLabel(social.platform)}
                    </a>
                  ))}
                </nav>
              </div>
            )}
          </div>
        </div>

        <div
          className="mt-14 flex flex-col gap-4 border-t pt-8 lg:flex-row lg:items-start lg:justify-between lg:gap-8"
          style={{ borderColor: BORDER }}
        >
          <div
            className="min-w-0 flex-1 text-center text-xs leading-relaxed sm:text-left sm:text-sm [&_a]:text-white [&_a]:underline [&_a]:underline-offset-2 [&_a]:transition-opacity [&_a:hover]:opacity-70"
            style={{ color: WHITE, fontFamily: fonts.body, opacity: 0.75 }}
          >
            {copyrightContent ? (
              <TiptapRenderer content={copyrightContent} as="inline" />
            ) : (
              copyrightFallback
            )}
          </div>

          {legalLinks.length > 0 && (
            <nav className="flex shrink-0 flex-wrap items-center justify-center gap-x-5 gap-y-2 lg:justify-end">
              {legalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[11px] uppercase tracking-[0.18em] transition-opacity hover:opacity-70"
                  style={{ color: WHITE, fontFamily: fonts.body, opacity: 0.75 }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
