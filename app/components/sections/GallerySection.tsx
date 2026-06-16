'use client';

import Link from 'next/link';
import NextImage from 'next/image';
import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import type { Page } from '@/app/lib/types';
import { MaskBlindRevealImage } from '@/app/components/cinematic/MaskBlindRevealImage';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';
import { useSectionTheme } from '@/app/hooks/useSectionTheme';
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

interface GallerySectionProps {
  gallerySection?: Page['gallerySection'];
  className?: string;
  /** Max images on home; 0 = show all */
  imagesLimit?: number;
}

type GalleryImage = {
  id: string;
  imageUrl: string;
  altText: string;
  caption?: string;
};

function GalleryNavButton({
  direction,
  onClick,
  className,
  colors,
}: {
  direction: 'prev' | 'next';
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  colors: ReturnType<typeof useSectionTheme>['colors'];
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === 'prev' ? 'Previous image' : 'Next image'}
      className={cn(
        'flex h-11 w-11 items-center justify-center rounded-full border bg-white/90 shadow-lg backdrop-blur-sm transition-transform hover:scale-105',
        className
      )}
      style={{ borderColor: `color-mix(in srgb, ${colors.mainText} 12%, transparent)` }}
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        {direction === 'prev' ? (
          <path d="M15 19l-7-7 7-7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M9 5l7 7-7 7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </button>
  );
}

export function GallerySection({
  gallerySection,
  className,
  imagesLimit = 0,
}: GallerySectionProps) {
  const { pages } = useWebBuilder();
  const { colors, fonts, accentColor } = useCraftTheme();

  const sectionData = useMemo(() => {
    const fallbackPage =
      pages.find((p) => p.gallerySection?.enabled && (p.gallerySection?.images?.length ?? 0) > 0) ??
      pages.find((p) => (p.gallerySection?.images?.length ?? 0) > 0);

    const fallback = fallbackPage?.gallerySection;
    const current = gallerySection;

    if (!current && !fallback) return undefined;

    const images =
      (current?.images?.length ? current.images : undefined) ??
      fallback?.images ??
      [];

    return {
      enabled: current?.enabled ?? fallback?.enabled ?? images.length > 0,
      title: current?.title ?? fallback?.title,
      description: current?.description ?? fallback?.description,
      images,
    };
  }, [gallerySection, pages]);

  const title = useMemo(() => tiptapToText(sectionData?.title) || 'Our Gallery', [sectionData?.title]);
  const description = useMemo(() => tiptapToText(sectionData?.description), [sectionData?.description]);

  const galleryImages = useMemo<GalleryImage[]>(() => {
    const result: GalleryImage[] = [];

    for (const [index, image] of (sectionData?.images ?? []).entries()) {
      const url = image.url ? getImageSrc(image.url) : '';
      if (!url) continue;

      const caption = tiptapToText(image.caption);
      result.push({
        id: `gallery-${index}`,
        imageUrl: url,
        altText: image.altText?.trim() || caption || `Gallery image ${index + 1}`,
        caption: caption || undefined,
      });
    }

    return imagesLimit > 0 ? result.slice(0, imagesLimit) : result;
  }, [sectionData?.images, imagesLimit]);

  const { ref: sectionRef, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const selectedImage = selectedIndex !== null ? galleryImages[selectedIndex] ?? null : null;

  useEffect(() => {
    if (selectedIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedIndex(null);
      if (e.key === 'ArrowLeft' && galleryImages.length > 1) {
        setSelectedIndex((i) => (i === null ? null : (i - 1 + galleryImages.length) % galleryImages.length));
      }
      if (e.key === 'ArrowRight' && galleryImages.length > 1) {
        setSelectedIndex((i) => (i === null ? null : (i + 1) % galleryImages.length));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedIndex, galleryImages.length]);

  if (sectionData?.enabled === false) return null;
  if (!title && !description && galleryImages.length === 0) return null;

  const overlayBg = `color-mix(in srgb, ${colors.sectionBackgroundDark} 92%, transparent)`;

  return (
    <>
      <CraftSection
        id="gallery"
        surface="muted"
        accentLine
        className={cn('overflow-visible', className)}
      >
        <div ref={sectionRef} className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14 xl:gap-20">
          <CraftReveal
            visible={isVisible}
            className="lg:col-span-4 lg:sticky lg:top-24 lg:self-start xl:col-span-3"
          >
            <SectionHeading
              eyebrow="Gallery"
              title={title}
              description={description}
              titleClassName={CRAFT_TITLE_CLASS}
              descriptionClassName={CRAFT_DESC_CLASS}
            />

            <Link
              href="/gallery"
              className="mt-7 inline-flex min-h-[44px] items-center justify-center border bg-white px-8 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] transition-opacity hover:opacity-85"
              style={{
                borderColor: `color-mix(in srgb, ${colors.mainText} 35%, transparent)`,
                color: colors.mainText,
                fontFamily: fonts.body,
              }}
            >
              View Gallery
            </Link>
          </CraftReveal>

          {galleryImages.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:col-span-8 xl:col-span-9">
              {galleryImages.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  className={cn(
                    'group w-full text-left transition-opacity duration-700',
                    isVisible ? 'opacity-100' : 'opacity-0',
                    index % 3 === 1 ? 'sm:mt-8' : ''
                  )}
                  style={{ transitionDelay: `${index * 80}ms` }}
                >
                  <MaskBlindRevealImage
                    src={image.imageUrl}
                    alt={image.altText}
                    aspectClassName={index % 2 === 0 ? 'aspect-[4/3]' : 'aspect-[3/4]'}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    priority={index < 2}
                    start="top 88%"
                    end="center center"
                  />
                  {(image.caption || image.altText) && (
                    <p
                      className="mt-3 text-xs uppercase tracking-[0.18em] opacity-0 transition-opacity group-hover:opacity-100"
                      style={{ color: colors.secondaryText, fontFamily: fonts.body }}
                    >
                      {image.caption || image.altText}
                    </p>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="lg:col-span-8 xl:col-span-9">
              <p className="text-sm" style={{ color: colors.secondaryText }}>
                No gallery images yet. Add images in the builder to show them here.
              </p>
            </div>
          )}
        </div>
      </CraftSection>

      {selectedImage && selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
          style={{ backgroundColor: overlayBg }}
          onClick={() => setSelectedIndex(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Gallery preview"
        >
          <button
            type="button"
            onClick={() => setSelectedIndex(null)}
            className="absolute right-4 top-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80 hover:text-white sm:right-8 sm:top-8"
          >
            Close
          </button>

          {galleryImages.length > 1 && (
            <>
              <GalleryNavButton
                direction="prev"
                colors={colors}
                className="absolute left-3 top-1/2 -translate-y-1/2 sm:left-6"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex((selectedIndex - 1 + galleryImages.length) % galleryImages.length);
                }}
              />
              <GalleryNavButton
                direction="next"
                colors={colors}
                className="absolute right-3 top-1/2 -translate-y-1/2 sm:right-6"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex((selectedIndex + 1) % galleryImages.length);
                }}
              />
            </>
          )}

          <div className="relative h-[min(80vh,720px)] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <NextImage
              key={selectedImage.id}
              src={selectedImage.imageUrl}
              alt={selectedImage.altText}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>

          {galleryImages.length > 1 && (
            <span className="absolute bottom-4 rounded-full bg-black/40 px-3 py-1.5 text-[11px] text-white sm:bottom-8">
              {selectedIndex + 1} / {galleryImages.length}
            </span>
          )}
        </div>
      )}
    </>
  );
}

export default GallerySection;
