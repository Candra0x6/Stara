"use client"
import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQs = [
  {
    question: "How do I specify my accommodation needs?",
    answer:
      "You can specify your accommodation needs directly in your profile settings under the 'Accessibility Requirements' section. This includes mobility, visual, hearing, cognitive, and other accommodations. Your needs are kept confidential and only shared with employers upon your consent during the application process.",
  },
  {
    question: "What types of flexible work arrangements are available?",
    answer:
      "Our platform features jobs with various flexible arrangements including remote work, hybrid schedules, flexible hours, job sharing, compressed work weeks, and part-time positions. Use our advanced filters to find opportunities that match your specific needs for work-life balance and accessibility.",
  },
  {
    question: "How do you ensure employer compliance with accessibility laws?",
    answer:
      "We partner only with employers who demonstrate commitment to ADA compliance and equal opportunity employment. Our team regularly audits job postings for compliance issues, provides resources to employers about accessibility requirements, and maintains a reporting system for any violations or concerns.",
  },
  {
    question: "Is the platform compatible with screen readers?",
    answer:
      "Yes, our platform is fully compatible with popular screen readers including JAWS, NVDA, and VoiceOver. We follow WCAG 2.1 AA standards and conduct regular accessibility testing. All interactive elements have proper ARIA labels, and keyboard navigation is fully supported throughout the site.",
  },
  {
    question: "What support is available during the job search process?",
    answer:
      "We provide comprehensive support including dedicated accessibility consultants, resume review services, interview preparation assistance, and workplace accommodation guidance. Our support team is available via phone, email, and live chat, with priority response times for accessibility-related inquiries.",
  },
  {
    question: "How do I report accessibility issues with job postings?",
    answer:
      "You can report accessibility issues using the 'Report Issue' button on any job posting, or contact our accessibility team directly at accessibility@platform.com. We investigate all reports within 24 hours and work with employers to resolve issues. You can also use our anonymous feedback form for systemic concerns.",
  },
];

export function FrequentlyAskedQuestionsAccordion() {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="bg-white mx-auto grid max-w-6xl grid-cols-1 gap-4 py-20 md:grid-cols-2 md:py-40">
      <h2 className="text-center text-4xl font-bold tracking-tight text-primary md:text-left md:text-6xl ">
        Frequently asked questions
      </h2>
      <div className="divide-y divide-border" role="region" aria-label="Frequently asked questions">
        {FAQs.map((faq, index) => (
          <FAQItem  
            key={index}
            question={faq.question}
            answer={faq.answer}
            open={open}
            setOpen={setOpen}
          />
        ))}
      </div>
    </div>
  );
}

const FAQItem = ({
  question,
  answer,
  setOpen,
  open,
}: {
  question: string;
  answer: string;
  open: string | null;
  setOpen: (open: string | null) => void;
}) => {
  const isOpen = open === question;
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    if (isOpen) {
      setOpen(null);
    } else {
      setOpen(question);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div className="py-4">
      <button
        ref={buttonRef}
        className="w-full text-left focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded-lg p-2 -m-2 transition-all duration-200"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${question.replace(/\s+/g, '-').toLowerCase()}`}
        type="button"
      >
        <div className="flex items-start">
          <div className="relative mr-4 mt-1 h-6 w-6 flex-shrink-0">
            <Plus
              className={cn(
                "absolute inset-0 h-6 w-6 transform text-white  transition-all duration-200",
                isOpen && "rotate-90 scale-0"
              )}
              aria-hidden="true"
            />
            <Minus
              className={cn(
                "absolute inset-0 h-6 w-6 rotate-90 scale-0 transform text-white transition-all duration-200",
                isOpen && "rotate-0 scale-100"
              )}
              aria-hidden="true"
            />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-white font-[var(--font-inter)] leading-relaxed">
              {question}
            </h3>
            <AnimatePresence mode="wait">
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="overflow-hidden"
                  id={`faq-answer-${question.replace(/\s+/g, '-').toLowerCase()}`}
                  role="region"
                  aria-labelledby={`faq-question-${question.replace(/\s+/g, '-').toLowerCase()}`}
                >
                  <div className="pt-3">
                    <p className="text-white/90 font-[var(--font-inter)] leading-relaxed text-base">
                      {answer}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </button>
    </div>
  );
};