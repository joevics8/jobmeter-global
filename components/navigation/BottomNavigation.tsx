"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase, Bookmark, BookOpen, Wrench, Settings } from 'lucide-react';
import { theme } from '@/lib/theme';

export default function BottomNavigation() {
  const pathname = usePathname();

  // Pages that should show bottom menu
  const allowedPaths = ['/jobs', '/saved', '/tools', '/resource', '/settings'];

  // Check if current page is EXACTLY one of the bottom menu pages
  const shouldShow = allowedPaths.includes(pathname);

  if (!shouldShow) return null;

  const navItems = [
    { label: 'Jobs', href: '/jobs', icon: Briefcase },
    { label: 'Saved', href: '/saved', icon: Bookmark },
    { label: 'Tools', href: '/tools', icon: Wrench },
    { label: 'Resources', href: '/resource', icon: BookOpen },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t"
      style={{
        borderColor: theme.colors.border.DEFAULT,
        backgroundColor: theme.colors.background.DEFAULT,
      }}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center justify-center 
                flex-1 h-full transition-colors duration-200
                ${active ? '' : 'hover:bg-gray-50'}
              `}
            >
              <Icon
                size={24}
                className="mb-1 transition-colors duration-200"
                style={{
                  color: active
                    ? theme.colors.primary.DEFAULT
                    : theme.colors.text.secondary,
                }}
              />

              <span
                className="text-xs font-medium transition-colors duration-200"
                style={{
                  color: active
                    ? theme.colors.primary.DEFAULT
                    : theme.colors.text.secondary,
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
