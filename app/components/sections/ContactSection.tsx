'use client';

import { useMemo, useState } from 'react';
import type { Page, BusinessHours } from '@/app/lib/types';
import { useWebBuilder } from '@/app/providers/WebBuilderProvider';
import { cn } from '@/app/lib/utils';
import { useScrollAnimation } from '@/app/hooks/useScrollAnimation';
import { tiptapToText } from '@/app/lib/seo';
import { SectionHeading } from '@/app/components/ui/SectionHeading';
import {
  CraftReveal,
  CraftSection,
  CRAFT_DESC_CLASS,
  CRAFT_TITLE_CLASS,
  useCraftSurfaceContrast,
} from '@/app/components/sections/CraftSection';
import { ContactSideForm } from '@/app/components/ui/ContactSideForm';

const DAY_LABELS: Record<string, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

interface ContactSectionProps {
  contactSection?: Page['contactSection'];
  className?: string;
}

export function ContactSection({ contactSection, className }: ContactSectionProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { site } = useWebBuilder();
  const { accentColor, borderColor, textPrimary, isDark } = useCraftSurfaceContrast('muted');
  const textColor = textPrimary;

  const title = useMemo(() => tiptapToText(contactSection?.title), [contactSection?.title]);
  const description = useMemo(
    () => tiptapToText(contactSection?.description),
    [contactSection?.description]
  );

  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.2 });
  const { ref: contentRef, isVisible: contentVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });

  if (!contactSection?.enabled) return null;

  const business = site?.business;
  const address = business?.address;
  const businessHours = business?.businessHours;
  const showForm = contactSection.showForm !== false;
  const showMap = contactSection.showMap !== false;
  const showContactInfo = contactSection.showContactInfo !== false;

  const formatTime = (time: string) => {
    if (!time) return '';
    if (businessHours?.displayFormat === '12h') {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    }
    return time;
  };

  const formatDayHours = (dayHours: BusinessHours) => {
    if (!dayHours.isOpen) return 'Closed';
    if (dayHours.is24Hours) return '24h';
    if (dayHours.timeRanges?.length) {
      return dayHours.timeRanges
        .map((range) => `${formatTime(range.openTime)} – ${formatTime(range.closeTime)}`)
        .join(', ');
    }
    return '';
  };

  const addressLine = [address?.street, address?.city, address?.state, address?.zipCode]
    .filter(Boolean)
    .join(', ');

  const mapQuery = addressLine;
  const hasHours = businessHours?.isEnabled && businessHours.hours.length > 0;
  const hasRightColumn =
    showContactInfo && Boolean(business?.email || business?.phone || addressLine || hasHours);

  return (
    <CraftSection id="contact" surface="muted" className={className}>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
        <CraftReveal visible={headerVisible} className="lg:col-span-5">
          <div ref={headerRef}>
            <SectionHeading
              eyebrow="Contact"
              title={title || 'Get in touch'}
              description={description}
              variant={isDark ? 'dark' : 'light'}
              titleClassName={CRAFT_TITLE_CLASS}
              descriptionClassName={cn(CRAFT_DESC_CLASS, 'max-w-md')}
            />

            {showForm && (
              <button
                type="button"
                onClick={() => setIsFormOpen(true)}
                className="group mt-10 inline-flex items-center gap-4"
              >
                <span
                  className="text-[11px] font-bold uppercase tracking-[0.3em]"
                  style={{ color: textColor }}
                >
                  Send a Message
                </span>
                <div
                  className="h-px w-8 transition-all duration-500 group-hover:w-12"
                  style={{ backgroundColor: accentColor }}
                />
              </button>
            )}
          </div>
        </CraftReveal>

        {hasRightColumn && (
          <CraftReveal visible={contentVisible} className="lg:col-span-7" delayMs={150}>
            <div ref={contentRef} className="border-t pt-8" style={{ borderColor }}>
              {showContactInfo && business?.email && (
                <a
                  href={`mailto:${business.email}`}
                  className="text-sm font-light transition-colors"
                  style={{ color: textColor }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.8'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                >
                  {business.email}
                </a>
              )}

              {showContactInfo && business?.phone && (
                <a
                  href={`tel:${business.phone.replace(/\s/g, '')}`}
                  className={cn(
                    'block text-sm font-light transition-colors',
                    business?.email && 'mt-3'
                  )}
                  style={{ color: textColor }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.8'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                >
                  {business.phone}
                </a>
              )}

              {showContactInfo && addressLine && (
                <p
                  className={cn('text-sm font-light leading-relaxed', (business?.email || business?.phone) && 'mt-3')}
                  style={{ color: textColor }}
                >
                  {addressLine}
                </p>
              )}

              {hasHours && (
                <div
                  className={cn(
                    (business?.email || business?.phone || addressLine) && 'mt-8 border-t pt-8'
                  )}
                  style={{ borderColor }}
                >
                  <span
                    className="mb-6 block text-[10px] font-bold uppercase tracking-[0.35em]"
                    style={{ color: textColor }}
                  >
                    Hours
                  </span>
                  <div className="max-w-md space-y-3">
                    {businessHours.hours.map((day) => (
                      <div
                        key={day.day}
                        className="flex justify-between gap-8 text-sm font-light"
                        style={{ color: textColor }}
                      >
                        <span>{DAY_LABELS[day.day]}</span>
                        <span>{formatDayHours(day)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CraftReveal>
        )}
      </div>

      {showMap && (
        <CraftReveal
          visible={contentVisible}
          className="relative mt-12 lg:mt-16"
          delayMs={200}
        >
          <div
            className="h-[280px] w-full overflow-hidden border sm:h-[320px] lg:h-[360px]"
            style={{ borderColor }}
          >
            {site?.business?.coordinates?.latitude != null &&
            site?.business?.coordinates?.longitude != null ? (
              <iframe
                title="Office Location"
                width="100%"
                height="100%"
                className="h-full w-full border-0 grayscale opacity-90 transition-all duration-700 hover:grayscale-0"
                src={`https://maps.google.com/maps?q=${site.business.coordinates.latitude},${site.business.coordinates.longitude}&z=15&output=embed`}
                allowFullScreen
                loading="lazy"
              />
            ) : mapQuery ? (
              <iframe
                title="Office Location"
                width="100%"
                height="100%"
                className="h-full w-full border-0 grayscale opacity-90 transition-all duration-700 hover:grayscale-0"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=15&output=embed`}
                allowFullScreen
                loading="lazy"
              />
            ) : (
              <div
                className="flex h-full items-center justify-center text-sm font-light"
                style={{ color: textColor }}
              >
                Map coordinates not configured
              </div>
            )}
          </div>
        </CraftReveal>
      )}

      <ContactSideForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </CraftSection>
  );
}

export default ContactSection;
