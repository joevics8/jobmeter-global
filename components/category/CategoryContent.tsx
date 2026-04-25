// components/category/CategoryContent.tsx

"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, Info, Users, Target, CheckCircle, HelpCircle, MapPin, Briefcase } from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
}

interface CategoryContentProps {
  page: {
    about_role: string | null;
    who_should_apply: string | null;
    how_to_stand_out: string | null;
    key_responsibilities: string[] | null;
    faqs: FAQ[] | any;
    related_categories: string[] | null;
    related_locations: string[] | null;
  };
}

export default function CategoryContent({ page }: CategoryContentProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    about: true,
    who: false,
    stand_out: false,
    responsibilities: false,
    faqs: false,
    related: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const faqs: FAQ[] = Array.isArray(page.faqs) ? page.faqs : [];

  return (
    <div className="space-y-4 sticky top-4">
      {/* About This Role */}
      {page.about_role && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection('about')}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Info size={20} className="text-blue-600" />
              <h3 className="font-semibold text-gray-900">About This Role</h3>
            </div>
            {expandedSections.about ? (
              <ChevronUp size={20} className="text-gray-400" />
            ) : (
              <ChevronDown size={20} className="text-gray-400" />
            )}
          </button>
          {expandedSections.about && (
            <div className="px-6 pb-4 text-sm text-gray-600 leading-relaxed">
              {page.about_role}
            </div>
          )}
        </div>
      )}

      {/* Who Should Apply */}
      {page.who_should_apply && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection('who')}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Users size={20} className="text-blue-600" />
              <h3 className="font-semibold text-gray-900">Who Should Apply</h3>
            </div>
            {expandedSections.who ? (
              <ChevronUp size={20} className="text-gray-400" />
            ) : (
              <ChevronDown size={20} className="text-gray-400" />
            )}
          </button>
          {expandedSections.who && (
            <div className="px-6 pb-4 text-sm text-gray-600 leading-relaxed">
              {page.who_should_apply}
            </div>
          )}
        </div>
      )}

      {/* How to Stand Out */}
      {page.how_to_stand_out && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection('stand_out')}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Target size={20} className="text-blue-600" />
              <h3 className="font-semibold text-gray-900">How to Stand Out</h3>
            </div>
            {expandedSections.stand_out ? (
              <ChevronUp size={20} className="text-gray-400" />
            ) : (
              <ChevronDown size={20} className="text-gray-400" />
            )}
          </button>
          {expandedSections.stand_out && (
            <div className="px-6 pb-4 text-sm text-gray-600 leading-relaxed">
              {page.how_to_stand_out}
            </div>
          )}
        </div>
      )}

      {/* Key Responsibilities */}
      {page.key_responsibilities && page.key_responsibilities.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection('responsibilities')}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <CheckCircle size={20} className="text-blue-600" />
              <h3 className="font-semibold text-gray-900">Key Responsibilities</h3>
            </div>
            {expandedSections.responsibilities ? (
              <ChevronUp size={20} className="text-gray-400" />
            ) : (
              <ChevronDown size={20} className="text-gray-400" />
            )}
          </button>
          {expandedSections.responsibilities && (
            <div className="px-6 pb-4">
              <ul className="space-y-2">
                {page.key_responsibilities.map((responsibility, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-blue-600 mt-1">•</span>
                    <span className="flex-1">{responsibility}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* FAQs */}
      {faqs.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection('faqs')}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <HelpCircle size={20} className="text-blue-600" />
              <h3 className="font-semibold text-gray-900">Frequently Asked Questions</h3>
            </div>
            {expandedSections.faqs ? (
              <ChevronUp size={20} className="text-gray-400" />
            ) : (
              <ChevronDown size={20} className="text-gray-400" />
            )}
          </button>
          {expandedSections.faqs && (
            <div className="px-6 pb-4 space-y-4">
              {faqs.map((faq, index) => (
                <div key={index}>
                  <h4 className="font-medium text-gray-900 text-sm mb-2">
                    {faq.question}
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Related Categories & Locations */}
      {((page.related_categories && page.related_categories.length > 0) ||
        (page.related_locations && page.related_locations.length > 0)) && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleSection('related')}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Briefcase size={20} className="text-blue-600" />
              <h3 className="font-semibold text-gray-900">Related Categories</h3>
            </div>
            {expandedSections.related ? (
              <ChevronUp size={20} className="text-gray-400" />
            ) : (
              <ChevronDown size={20} className="text-gray-400" />
            )}
          </button>
          {expandedSections.related && (
            <div className="px-6 pb-4 space-y-4">
              {page.related_categories && page.related_categories.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    Similar Job Categories
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {page.related_categories.map((slug, index) => (
                      <Link
                        key={index}
                        href={`/resources/${slug}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
                      >
                        <Briefcase size={14} />
                        {slug.replace(/-/g, ' ')}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {page.related_locations && page.related_locations.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    Other Locations
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {page.related_locations.map((slug, index) => (
                      <Link
                        key={index}
                        href={`/resources/${slug}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded-full hover:bg-green-100 transition-colors"
                      >
                        <MapPin size={14} />
                        {slug.replace(/-/g, ' ')}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}