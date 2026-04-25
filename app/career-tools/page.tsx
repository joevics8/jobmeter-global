"use client";

import React from 'react';
import { MessageCircle, FileCheck, GraduationCap, ArrowRight } from 'lucide-react';
import { theme } from '@/lib/theme';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Tool {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  route?: string;
}

export default function CareerToolsPage() {
  const router = useRouter();

  const tools: Tool[] = [
    {
      id: '1',
      title: 'Interview Prep',
      description: 'Practice with personalized questions based on job descriptions',
      icon: MessageCircle,
      color: theme.colors.accent.blue,
      route: '/tools/interview',
    },
    {
      id: '2',
      title: 'ATS CV Review',
      description: 'Optimize your CV for ATS systems and job matching',
      icon: FileCheck,
      color: theme.colors.accent.green,
      route: '/tools/ats-review',
    },
    {
      id: '3',
      title: 'Career Coach',
      description: 'Get personalized career guidance and skill recommendations',
      icon: GraduationCap,
      color: theme.colors.accent.blue,
      route: '/tools/career',
    },
  ];

  const handleToolClick = (tool: Tool) => {
    if (tool.route) {
      router.push(tool.route);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.colors.background.muted }}>
      {/* Header */}
      <div
        className="pt-12 pb-8 px-6"
        style={{
          backgroundColor: theme.colors.primary.DEFAULT,
        }}
      >
        <div className="flex flex-col gap-2">
          <Link href="/tools" className="text-sm text-white/80 hover:text-white transition-colors self-start">
            ← Back to Tools
          </Link>
          <h1
            className="text-2xl font-bold"
            style={{ color: theme.colors.text.light }}
          >
            Career Tools
          </h1>
          <p
            className="text-sm"
            style={{ color: theme.colors.text.light }}
          >
            Advanced tools for career development
          </p>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => handleToolClick(tool)}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 group"
                style={{
                  border: `1px solid ${theme.colors.border.DEFAULT}`,
                }}
              >
                {/* Icon Container */}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto"
                  style={{ backgroundColor: `${tool.color}15` }}
                >
                  <Icon size={28} style={{ color: tool.color }} />
                </div>

                {/* Tool Info */}
                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {tool.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    {tool.description}
                  </p>
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                  <ArrowRight
                    size={20}
                    className="text-gray-400 group-hover:text-gray-600 transition-colors"
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}