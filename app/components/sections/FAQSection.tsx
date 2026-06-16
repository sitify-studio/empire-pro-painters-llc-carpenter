'use client';

import { useMemo, useState } from 'react';
import type { Page } from '@/app/lib/types';
import { useScrollAnimation, useStaggeredAnimation } from '@/app/hooks/useScrollAnimation';
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
import { cn } from '@/app/lib/utils';

interface FAQSectionProps {
  faqSection?: Page['faqSection'];
  className?: string;
}

function FaqItem({
  question,
  answer,
  index,
  isOpen,
  visible,
  accentColor,
  fonts,
  colors,
  borderColor,
  onToggle,
}: {
  question: string;
  answer: string;
  index: number;
  isOpen: boolean;
  visible: boolean;
  accentColor: string;
  fonts: ReturnType<typeof useSectionTheme>['fonts'];
  colors: ReturnType<typeof useSectionTheme>['colors'];
  borderColor: string;
  onToggle: () => void;
}) {
  return (
    <div
      className={cn(
        'border-t transition-all duration-700',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      )}
      style={{ transitionDelay: `${index * 60}ms`, borderColor }}
    >
      <button
        type="button"
        onClick={onToggle}
        className="group flex w-full items-start gap-5 py-6 text-left sm:gap-6 sm:py-7"
        aria-expanded={isOpen}
      >
        <div className="mt-1 flex shrink-0 items-center gap-3">
          <CraftIndex index={index} />
          <CraftRule className="hidden w-6 sm:block" />
        </div>

        <span className="min-w-0 flex-grow">
          {question && (
            <h3
              className="text-base font-normal tracking-tight transition-colors sm:text-lg"
              style={{ fontFamily: fonts.heading, color: colors.mainText }}
            >
              {question}
            </h3>
          )}

          {answer && (
            <div
              className={cn(
                'overflow-hidden transition-all duration-500 ease-in-out',
                isOpen ? 'mt-4 max-h-96 opacity-100' : 'max-h-0 opacity-0'
              )}
            >
              <p
                className="max-w-2xl text-sm font-light leading-relaxed sm:text-base"
                style={{ color: colors.secondaryText }}
              >
                {answer}
              </p>
            </div>
          )}
        </span>

        <span
          className="mt-1 shrink-0 text-lg font-light leading-none transition-colors duration-300"
          style={{ color: isOpen ? accentColor : colors.inactive }}
          aria-hidden
        >
          {isOpen ? '−' : '+'}
        </span>
      </button>
    </div>
  );
}

export function FAQSection({ faqSection, className }: FAQSectionProps) {
  const { colors, fonts, accentColor, borderColor } = useCraftTheme();

  const title = useMemo(() => tiptapToText(faqSection?.title), [faqSection?.title]);
  const description = useMemo(() => tiptapToText(faqSection?.description), [faqSection?.description]);
  const questions = useMemo(
    () =>
      faqSection?.items
        ?.map((item) => ({
          question: tiptapToText(item.question),
          answer: tiptapToText(item.answer),
        }))
        .filter((item) => item.question || item.answer) ?? [],
    [faqSection?.items]
  );

  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });
  const { ref: faqRef, visibleItems: faqVisible } = useStaggeredAnimation(questions.length, 80);

  if (!faqSection || faqSection.enabled === false) return null;
  if (!title && !description && questions.length === 0) return null;

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <CraftSection id="faq" surface="page" className={className}>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
        <CraftReveal visible={titleVisible} className="lg:col-span-4 lg:sticky lg:top-24 lg:self-start">
          <div ref={titleRef}>
            <SectionHeading
              eyebrow="Information"
              title={title}
              description={description}
              titleClassName={CRAFT_TITLE_CLASS}
              descriptionClassName={cn(CRAFT_DESC_CLASS, 'max-w-sm')}
            />
          </div>
        </CraftReveal>

        {questions.length > 0 && (
          <div ref={faqRef} className="lg:col-span-8">
            <div className="border-b" style={{ borderColor }}>
              {questions.map((faq, index) => (
                <FaqItem
                  key={index}
                  question={faq.question}
                  answer={faq.answer}
                  index={index}
                  isOpen={openIndex === index}
                  visible={faqVisible.includes(index)}
                  accentColor={accentColor}
                  fonts={fonts}
                  colors={colors}
                  borderColor={borderColor}
                  onToggle={() => toggleQuestion(index)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </CraftSection>
  );
}

export default FAQSection;
