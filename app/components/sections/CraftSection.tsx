'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { HomeDotGrid } from '@/app/components/ui/made';
import { useSectionTheme } from '@/app/hooks/useSectionTheme';
import { cn } from '@/app/lib/utils';

export type CraftSurface = 'page' | 'muted' | 'accent' | 'dark';

export function useCraftTheme() {
  const theme = useSectionTheme();
  const { colors, fonts } = theme;
  const accentColor = colors.primaryButton;
  const borderColor = `color-mix(in srgb, ${colors.mainText} 12%, transparent)`;

  return { colors, fonts, accentColor, borderColor };
}

export function craftSurfaceBg(surface: CraftSurface, colors: ReturnType<typeof useCraftTheme>['colors']) {
  switch (surface) {
    case 'muted':
      return colors.sectionBackgroundLight;
    case 'accent':
      return `color-mix(in srgb, ${colors.sectionBackgroundLight} 90%, ${colors.primaryButton} 10%)`;
    case 'dark':
      return colors.sectionBackgroundDark;
    default:
      return colors.pageBackground;
  }
}

export const CRAFT_TITLE_CLASS =
  '!text-[clamp(1.75rem,3.5vw,3rem)] !leading-[1.08] !mb-3 sm:!mb-4';
export const CRAFT_DESC_CLASS =
  'max-w-2xl !text-sm sm:!text-base !leading-relaxed mt-1';

export function CraftSection({
  id,
  children,
  className,
  surface = 'page',
  dotted = false,
  accentLine = false,
  bordered = true,
  containerClassName,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  surface?: CraftSurface;
  dotted?: boolean;
  accentLine?: boolean;
  bordered?: boolean;
  containerClassName?: string;
}) {
  const { colors, accentColor, borderColor } = useCraftTheme();

  return (
    <section
      id={id}
      className={cn(
        'relative overflow-hidden py-16 lg:py-24',
        bordered && 'border-t',
        className
      )}
      style={{
        backgroundColor: craftSurfaceBg(surface, colors),
        borderColor,
        color: colors.mainText,
        fontFamily: 'var(--wb-body-font, inherit)',
      }}
    >
      {dotted && <HomeDotGrid className="inset-0" />}
      {accentLine && (
        <div
          className="pointer-events-none absolute left-[12%] top-0 hidden h-full w-px lg:block"
          style={{ backgroundColor: `color-mix(in srgb, ${accentColor} 18%, transparent)` }}
        />
      )}
      <div className={cn('container relative z-10 mx-auto px-6 lg:px-12', containerClassName)}>
        {children}
      </div>
    </section>
  );
}

export function CraftReveal({
  children,
  visible,
  className,
  delayMs = 0,
}: {
  children: ReactNode;
  visible: boolean;
  className?: string;
  delayMs?: number;
}) {
  return (
    <div
      className={cn(
        'transition-all duration-1000',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
        className
      )}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      {children}
    </div>
  );
}

export function CraftIndex({
  index,
  className,
}: {
  index: number;
  className?: string;
}) {
  const { accentColor, fonts } = useCraftTheme();
  return (
    <span
      className={cn('text-[10px] font-bold uppercase tracking-[0.35em]', className)}
      style={{ color: accentColor, fontFamily: fonts.body }}
    >
      {String(index + 1).padStart(2, '0')}
    </span>
  );
}

export function CraftRule({ className }: { className?: string }) {
  const { accentColor } = useCraftTheme();
  return (
    <div
      className={cn('h-px', className)}
      style={{ backgroundColor: `color-mix(in srgb, ${accentColor} 40%, transparent)` }}
    />
  );
}

export function CraftButton({
  href,
  label,
  variant = 'primary',
  className,
}: {
  href: string;
  label: string;
  variant?: 'primary' | 'outline';
  className?: string;
}) {
  const { colors, fonts, borderColor } = useCraftTheme();

  if (variant === 'outline') {
    return (
      <Link
        href={href}
        className={cn(
          'inline-block border px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition-opacity hover:opacity-80',
          className
        )}
        style={{
          borderColor,
          color: colors.mainText,
          fontFamily: fonts.body,
        }}
      >
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        'inline-block px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] transition-opacity hover:opacity-90',
        className
      )}
      style={{
        backgroundColor: colors.primaryButton,
        color: colors.darkPrimaryText,
        fontFamily: fonts.body,
      }}
    >
      {label}
    </Link>
  );
}

export function CraftCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { borderColor, colors } = useCraftTheme();
  return (
    <div
      className={cn('border p-6 sm:p-8', className)}
      style={{
        borderColor,
        backgroundColor: `color-mix(in srgb, ${colors.pageBackground} 70%, transparent)`,
      }}
    >
      {children}
    </div>
  );
}
