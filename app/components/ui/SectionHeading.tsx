'use client';

import type { ReactNode } from 'react';
import { cn } from '@/app/lib/utils';
import { useSectionTheme } from '@/app/hooks/useSectionTheme';

type SectionHeadingProps = {
  eyebrow?: string;
  title?: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  variant?: 'light' | 'dark';
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  as?: 'h1' | 'h2';
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  variant = 'light',
  className,
  titleClassName,
  descriptionClassName,
  as: Tag = 'h2',
}: SectionHeadingProps) {
  const { colors, fonts } = useSectionTheme();
  const isDark = variant === 'dark';
  const accentColor = colors.primaryButton;

  if (!eyebrow && !title && !description) return null;

  return (
    <div
      className={cn(
        'flex flex-col',
        align === 'center' ? 'items-center text-center' : 'items-start text-left',
        className
      )}
    >
      {eyebrow && (
        <div
          className={cn(
            'flex items-center gap-3 mb-6',
            align === 'center' && 'justify-center'
          )}
        >
          <div className="h-px w-10 shrink-0" style={{ backgroundColor: accentColor }} />
          <span
            className="text-[10px] font-bold uppercase tracking-[0.5em]"
            style={{ color: isDark ? colors.darkPrimaryText : accentColor, fontFamily: fonts.body }}
          >
            {eyebrow}
          </span>
        </div>
      )}

      {title && (
        <Tag
          className={cn(
            'text-[clamp(1.65rem,3vw,2.5rem)] font-normal tracking-tight leading-[1.15] mb-4 sm:mb-5',
            titleClassName
          )}
          style={{
            fontFamily: fonts.heading,
            color: isDark ? colors.darkPrimaryText : colors.mainText,
          }}
        >
          {title}
        </Tag>
      )}

      {description && (
        <p
          className={cn(
            'max-w-xl text-base font-light leading-relaxed sm:text-lg',
            descriptionClassName
          )}
          style={{
            fontFamily: fonts.body,
            color: isDark ? colors.darkPrimaryText : colors.secondaryText,
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
}

export default SectionHeading;
