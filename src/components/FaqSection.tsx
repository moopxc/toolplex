"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FaqItem {
  question: string;
  answer: string;
}

export function FaqSection({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="mt-12" aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="text-xl font-bold text-gray-900 mb-4">
        Frequently Asked Questions
      </h2>
      <div className="space-y-2">
        {items.map((item, i) => {
          const panelId = `faq-panel-${i}`;
          const buttonId = `faq-btn-${i}`;
          const isOpen = openIndex === i;
          return (
            <div key={item.question} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <button
                id={buttonId}
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left font-medium text-gray-900 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
                aria-expanded={isOpen}
                aria-controls={panelId}
              >
                <span>{item.question}</span>
                <ChevronDown
                  className={cn(
                    "w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-200",
                    isOpen && "rotate-180"
                  )}
                  aria-hidden="true"
                />
              </button>
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                hidden={!isOpen}
                className={cn(
                  "overflow-hidden transition-all duration-200",
                  isOpen ? "max-h-96" : "max-h-0"
                )}
              >
                <p className="px-5 pb-4 text-gray-600 text-sm leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
