'use client';

import NextImage from 'next/image';
import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import type { Page } from '@/app/lib/types';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';
import { useSectionTheme } from '@/app/hooks/useSectionTheme';
import { tiptapToText } from '@/app/lib/seo';
import { SectionHeading } from '@/app/components/ui/SectionHeading';
import {
  CraftIndex,
  CraftReveal,
  CraftRule,
  CraftSection,
  CRAFT_DESC_CLASS,
  CRAFT_TITLE_CLASS,
  useCraftTheme,
} from '@/app/components/sections/CraftSection';
import { cn, getImageSrc } from '@/app/lib/utils';

interface GallerySectionProps {
  gallerySection?: Page['gallerySection'];
  className?: string;
}

type GalleryImage = {
  id: string;
  imageUrl: string;
  altText: string;
};

const IMAGES_PER_PAGE = 3;

function GalleryNavButton({
  direction,
  onClick,
  disabled,
  accentColor,
  colors,
  className,
}: {
  direction: 'prev' | 'next';
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  accentColor: string;
  colors?: ReturnType<typeof useSectionTheme>['colors'];
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === 'prev' ? 'Previous images' : 'Next images'}
      className={cn(
        'group flex h-10 w-10 items-center justify-center rounded-full border transition-all',
        'disabled:cursor-not-allowed disabled:opacity-30',
        className
      )}
      style={{
        borderColor: `${accentColor}40`,
        color: colors?.secondaryText ?? accentColor,
      }}
    >
      <svg
        className={cn(
          'h-4 w-4 transition-transform',
          direction === 'prev' ? 'group-hover:-translate-x-0.5' : 'group-hover:translate-x-0.5',
          disabled && 'group-hover:translate-x-0'
        )}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        {direction === 'prev' ? (
          <path d="M15 19l-7-7 7-7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M9 5l7 7-7 7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </button>
  );
}

function GalleryItem({
  image,
  index,
  accentColor,
  colors,
  borderColor,
  onSelect,
}: {
  image: GalleryImage;
  index: number;
  accentColor: string;
  colors: ReturnType<typeof useSectionTheme>['colors'];
  borderColor: string;
  onSelect: (image: GalleryImage) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(image)}
      className="group relative w-full cursor-pointer border-t pt-6 text-left"
      style={{ borderColor }}
    >
      <div className="mb-4 flex items-center gap-3">
        <CraftIndex index={index} />
        <CraftRule className="w-10" />
        <span
          className="ml-auto text-[10px] font-bold uppercase tracking-[0.3em] opacity-0 transition-opacity group-hover:opacity-100"
          style={{ color: colors.inactive }}
        >
          View
        </span>
      </div>

      <div className="relative">
        <div
          className="absolute -bottom-3 -right-3 hidden h-full w-full border sm:block"
          style={{ borderColor: `${accentColor}30` }}
        />

        <div
          className="relative aspect-[4/5] overflow-hidden"
          style={{ backgroundColor: colors.sectionBackgroundLight }}
        >
          <NextImage
            src={image.imageUrl}
            alt={image.altText}
            fill
            className="object-cover transition-all duration-[1.2s] ease-out grayscale-[15%] group-hover:scale-[1.04] group-hover:grayscale-0"
          />
          <div
            className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
            style={{
              background: `linear-gradient(160deg, transparent 40%, ${accentColor}25 100%)`,
            }}
          />
        </div>
      </div>
    </button>
  );
}

export function GallerySection({ gallerySection, className }: GallerySectionProps) {
  const { colors, accentColor, borderColor } = useCraftTheme();

  const title = useMemo(() => tiptapToText(gallerySection?.title), [gallerySection?.title]);
  const description = useMemo(
    () => tiptapToText(gallerySection?.description),
    [gallerySection?.description]
  );
  const galleryImages = useMemo<GalleryImage[]>(() => {
    return (gallerySection?.images ?? [])
      .map((image, index) => {
        const url = image.url ? getImageSrc(image.url) : '';
        if (!url) return null;
        return {
          id: `gallery-${index}`,
          imageUrl: url,
          altText: image.altText?.trim() || tiptapToText(image.caption) || `Gallery image ${index + 1}`,
        };
      })
      .filter((image): image is GalleryImage => image !== null);
  }, [gallerySection?.images]);

  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });
  const [page, setPage] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const totalPages = Math.max(1, Math.ceil(galleryImages.length / IMAGES_PER_PAGE));
  const canPaginate = galleryImages.length > IMAGES_PER_PAGE;

  const pageImages = useMemo(() => {
    const start = page * IMAGES_PER_PAGE;
    return galleryImages.slice(start, start + IMAGES_PER_PAGE);
  }, [galleryImages, page]);

  const selectedImage = selectedIndex !== null ? galleryImages[selectedIndex] ?? null : null;

  useEffect(() => {
    if (page >= totalPages) setPage(0);
  }, [page, totalPages]);

  const goToPrevPage = () => setPage((p) => (p - 1 + totalPages) % totalPages);
  const goToNextPage = () => setPage((p) => (p + 1) % totalPages);

  const goToPrevImage = () => {
    if (selectedIndex === null || galleryImages.length <= 1) return;
    setSelectedIndex((selectedIndex - 1 + galleryImages.length) % galleryImages.length);
  };

  const goToNextImage = () => {
    if (selectedIndex === null || galleryImages.length <= 1) return;
    setSelectedIndex((selectedIndex + 1) % galleryImages.length);
  };

  if (!gallerySection || gallerySection.enabled === false) return null;
  if (!title && !description && galleryImages.length === 0) return null;

  const overlayBg = `color-mix(in srgb, ${colors.sectionBackgroundDark} 90%, transparent)`;

  return (
    <>
    <CraftSection id="gallery" surface="page" className={className}>
      <CraftReveal visible={headerVisible} className="mb-8 max-w-4xl lg:mb-10">
        <div ref={headerRef}>
          <SectionHeading
            eyebrow="Our Gallery"
            title={title}
            description={description}
            titleClassName={CRAFT_TITLE_CLASS}
            descriptionClassName={CRAFT_DESC_CLASS}
          />
        </div>
      </CraftReveal>

      {galleryImages.length > 0 && (
        <div>
            <div
              key={page}
              className="grid grid-cols-1 gap-x-6 gap-y-10 transition-opacity duration-500 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-3 lg:gap-y-12"
            >
              {pageImages.map((image, index) => (
                <GalleryItem
                  key={image.id}
                  image={image}
                  index={page * IMAGES_PER_PAGE + index}
                  accentColor={accentColor}
                  colors={colors}
                  borderColor={borderColor}
                  onSelect={(img) => {
                    const idx = galleryImages.findIndex((g) => g.id === img.id);
                    setSelectedIndex(idx >= 0 ? idx : null);
                  }}
                />
              ))}
            </div>

            {canPaginate && (
              <div className="mt-8 flex items-center justify-end gap-4 sm:mt-10">
                <span className="text-[10px] font-mono font-medium" style={{ color: colors.secondaryText }}>
                  {String(page + 1).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
                </span>
                <GalleryNavButton
                  direction="prev"
                  onClick={() => goToPrevPage()}
                  accentColor={accentColor}
                  colors={colors}
                />
                <GalleryNavButton
                  direction="next"
                  onClick={() => goToNextPage()}
                  accentColor={accentColor}
                  colors={colors}
                />
              </div>
            )}
          </div>
        )}
    </CraftSection>

      {selectedImage && selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-sm md:p-12"
          style={{ backgroundColor: overlayBg }}
          onClick={() => setSelectedIndex(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Gallery image preview"
        >
          <button
            type="button"
            onClick={() => setSelectedIndex(null)}
            className="group absolute right-6 top-6 flex items-center gap-3 md:right-10 md:top-10"
          >
            <span
              className="text-[10px] font-bold uppercase tracking-[0.35em] transition-opacity group-hover:opacity-100"
              style={{ color: colors.darkSecondaryText }}
            >
              Close
            </span>
            <div
              className="h-px w-8 transition-all group-hover:w-12"
              style={{ backgroundColor: colors.darkSecondaryText }}
            />
          </button>

          {galleryImages.length > 1 && (
            <>
              <GalleryNavButton
                direction="prev"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevImage();
                }}
                accentColor={colors.darkPrimaryText}
                colors={colors}
                className="absolute left-4 top-1/2 z-10 -translate-y-1/2 md:left-8"
              />
              <GalleryNavButton
                direction="next"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNextImage();
                }}
                accentColor={colors.darkPrimaryText}
                colors={colors}
                className="absolute right-4 top-1/2 z-10 -translate-y-1/2 md:right-8"
              />
            </>
          )}

          <div
            className="relative h-[70vh] w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
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
            <span
              className="absolute bottom-6 rounded-full px-4 py-2 text-[10px] font-mono font-medium md:bottom-10"
              style={{ backgroundColor: overlayBg, color: colors.darkPrimaryText }}
            >
              {String(selectedIndex + 1).padStart(2, '0')} / {String(galleryImages.length).padStart(2, '0')}
            </span>
          )}
        </div>
      )}
    </>
  );
}

export default GallerySection;
