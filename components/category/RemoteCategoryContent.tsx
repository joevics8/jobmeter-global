"use client";

import { useState } from 'react';
import { ChevronDown, ChevronUp, DollarSign, Users, Star, BookOpen, HelpCircle, TrendingUp } from 'lucide-react';

interface RemoteCategory {
  about_role: string | null;
  who_should_apply: string | null;
  how_to_stand_out: string | null;
  key_responsibilities: string[] | null;
  faqs: any;
  typical_salary_range: {
    min: number;
    max: number;
    currency: string;
    period: string;
    note?: string;
  } | null;
  experience_levels: string[] | null;
}

interface Props {
  page: RemoteCategory;
}

function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={18} className="text-blue-600" />
        <h2 className="font-semibold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0 py-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-start justify-between w-full text-left gap-3"
      >
        <span className="text-sm font-medium text-gray-800">{question}</span>
        {open ? <ChevronUp size={16} className="text-gray-400 flex-shrink-0 mt-0.5" /> : <ChevronDown size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />}
      </button>
      {open && (
        <p className="mt-2 text-sm text-gray-600 leading-relaxed">{answer}</p>
      )}
    </div>
  );
}

export default function RemoteCategoryContent({ page }: Props) {
  return (
    <div>
      {/* Salary Range */}
      {page.typical_salary_range && (
        <Section title="Typical Salary Range" icon={DollarSign}>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-blue-700">
              {page.typical_salary_range.currency}{page.typical_salary_range.min.toLocaleString()}
              {' '}–{' '}
              {page.typical_salary_range.currency}{page.typical_salary_range.max.toLocaleString()}
            </p>
            <p className="text-sm text-blue-600 mt-1">per {page.typical_salary_range.period}</p>
            {page.typical_salary_range.note && (
              <p className="text-xs text-gray-500 mt-2">{page.typical_salary_range.note}</p>
            )}
          </div>
          {page.experience_levels && page.experience_levels.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Open to</p>
              <div className="flex flex-wrap gap-2">
                {page.experience_levels.map((level) => (
                  <span key={level} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                    {level}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Section>
      )}

      {/* About the Role */}
      {page.about_role && (
        <Section title="About the Role" icon={BookOpen}>
          <p className="text-sm text-gray-600 leading-relaxed">{page.about_role}</p>
        </Section>
      )}

      {/* Key Responsibilities */}
      {page.key_responsibilities && page.key_responsibilities.length > 0 && (
        <Section title="Key Responsibilities" icon={TrendingUp}>
          <ul className="space-y-2">
            {page.key_responsibilities.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Who Should Apply */}
      {page.who_should_apply && (
        <Section title="Who Should Apply" icon={Users}>
          <p className="text-sm text-gray-600 leading-relaxed">{page.who_should_apply}</p>
        </Section>
      )}

      {/* How to Stand Out */}
      {page.how_to_stand_out && (
        <Section title="How to Stand Out" icon={Star}>
          <p className="text-sm text-gray-600 leading-relaxed">{page.how_to_stand_out}</p>
        </Section>
      )}

      {/* FAQs */}
      {page.faqs && Array.isArray(page.faqs) && page.faqs.length > 0 && (
        <Section title="Frequently Asked Questions" icon={HelpCircle}>
          {page.faqs.map((faq: { question: string; answer: string }, i: number) => (
            <FAQItem key={i} question={faq.question} answer={faq.answer} />
          ))}
        </Section>
      )}
    </div>
  );
}