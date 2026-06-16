'use client';

import React from 'react';
import { TiptapRenderer } from '@/app/components/ui/TiptapRenderer';
import { useThemeColors, useThemeFonts } from '@/app/hooks/useTheme';
import { getImageSrc } from '@/app/lib/utils';

interface ServiceBannerProps {
    service: any;
}

// Utility function to get full image URL
const getFullImageUrl = (url?: string): string | undefined => {
    if (!url) return undefined;
    const resolved = getImageSrc(url);
    return resolved || undefined;
};

export const ServiceBanner: React.FC<ServiceBannerProps> = ({ service }) => {
    const themeFonts = useThemeFonts();
    const themeColors = useThemeColors();

    // Determine banner title
    const bannerTitle = service.banner?.useServiceNameAsTitle !== false
        ? service.name
        : service.banner?.customTitle || service.name;

    // Banner background image
    const bannerBgImage = service.banner?.backgroundImage?.url
        ? getFullImageUrl(service.banner.backgroundImage.url)
        : service.thumbnailImage?.url
            ? getFullImageUrl(service.thumbnailImage.url)
            : undefined;

    // Banner overlay opacity
    const overlayOpacity = service.banner?.overlayOpacity ?? 50;

    return (
        <section
            className="relative w-full min-h-[60vh] md:min-h-[70vh] lg:min-h-[80vh] flex items-center justify-center overflow-hidden"
            style={{
                backgroundImage: bannerBgImage ? `url(${bannerBgImage})` : undefined,
                backgroundColor: themeColors.sectionBackgroundDark,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <div
                className="absolute inset-0"
                style={{
                    background: bannerBgImage
                        ? `linear-gradient(to bottom, color-mix(in srgb, ${themeColors.sectionBackgroundDark} ${overlayOpacity}%, transparent) 0%, color-mix(in srgb, ${themeColors.sectionBackgroundDark} ${Math.round(overlayOpacity * 0.6)}%, transparent) 100%)`
                        : `linear-gradient(to bottom, color-mix(in srgb, ${themeColors.sectionBackgroundDark} 70%, transparent) 0%, color-mix(in srgb, ${themeColors.sectionBackgroundDark} 50%, transparent) 100%)`,
                }}
            />

            <div className="absolute inset-0 pointer-events-none opacity-10">
                <div className="absolute left-1/4 top-0 bottom-0 w-px" style={{ backgroundColor: `color-mix(in srgb, ${themeColors.darkPrimaryText} 30%, transparent)` }} />
                <div className="absolute left-1/2 top-0 bottom-0 w-px" style={{ backgroundColor: `color-mix(in srgb, ${themeColors.darkPrimaryText} 30%, transparent)` }} />
                <div className="absolute left-3/4 top-0 bottom-0 w-px" style={{ backgroundColor: `color-mix(in srgb, ${themeColors.darkPrimaryText} 30%, transparent)` }} />
            </div>

            {/* Banner Content */}
            <div className="relative z-10 text-center px-6 md:px-12 py-20 md:py-32 max-w-5xl mx-auto">
                {/* Label */}
                <div className="flex items-center justify-center gap-4 mb-8">
                    <div className="w-12 h-[1px]" style={{ backgroundColor: `color-mix(in srgb, ${themeColors.darkPrimaryText} 40%, transparent)` }} />
                    <span
                        className="text-[10px] md:text-xs tracking-[0.4em] uppercase font-bold"
                        style={{ fontFamily: themeFonts.body, color: themeColors.darkSecondaryText }}
                    >
                        Our Services
                    </span>
                    <div className="w-12 h-[1px]" style={{ backgroundColor: `color-mix(in srgb, ${themeColors.darkPrimaryText} 40%, transparent)` }} />
                </div>

                <h1
                    className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-light uppercase tracking-tight leading-[0.95] mb-6"
                    style={{
                        fontFamily: themeFonts.heading,
                        color: themeColors.darkPrimaryText,
                        textShadow: `0 4px 30px color-mix(in srgb, ${themeColors.sectionBackgroundDark} 30%, transparent)`,
                    }}
                >
                    {bannerTitle}
                </h1>
                
                {service.shortDescription && (
                    <div
                        className="text-base md:text-lg lg:text-xl max-w-2xl mx-auto font-light tracking-wide leading-relaxed"
                        style={{ fontFamily: themeFonts.body, color: themeColors.darkSecondaryText }}
                    >
                        {typeof service.shortDescription === 'string'
                            ? service.shortDescription
                            : <TiptapRenderer content={service.shortDescription} as="inline" />}
                    </div>
                )}

                {/* Scroll Indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60">
                    <span
                      className="text-[9px] tracking-[0.3em] uppercase"
                      style={{ color: themeColors.darkSecondaryText }}
                    >
                      Scroll
                    </span>
                    <div
                      className="w-px h-8"
                      style={{
                        background: `linear-gradient(to bottom, color-mix(in srgb, ${themeColors.darkPrimaryText} 60%, transparent), transparent)`,
                      }}
                    />
                </div>
            </div>
        </section>
    );
};
