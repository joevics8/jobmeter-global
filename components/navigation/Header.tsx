"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Briefcase, Bookmark, BookOpen, Wrench, Settings, ChevronRight } from 'lucide-react';
import { theme } from '@/lib/theme';

const navItems = [
  { label: 'Jobs', href: '/jobs', icon: Briefcase },
  { label: 'Saved', href: '/saved', icon: Bookmark },
  { label: 'Tools', href: '/tools', icon: Wrench },
  { label: 'Resources', href: '/resource', icon: BookOpen },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 bg-white border-b"
        style={{ borderColor: theme.colors.border.DEFAULT }}
      >
        <div className="flex items-center justify-between h-16 px-4 md:px-6">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl font-bold"
            style={{ color: theme.colors.primary.DEFAULT }}
          >
            JobMeter
          </Link>

          {/* Desktop Navigation - hidden on mobile */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg
                    transition-colors duration-200
                    ${active
                      ? ''
                      : 'hover:bg-gray-100'
                    }
                  `}
                  style={{
                    backgroundColor: active ? theme.colors.primary.DEFAULT : 'transparent',
                    color: active ? '#FFFFFF' : theme.colors.text.primary,
                  }}
                >
                  <Icon size={18} />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Button - visible only on mobile */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            aria-label="Open menu"
          >
            <Menu size={24} style={{ color: theme.colors.text.primary }} />
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer */}
          <div
            className="fixed top-0 right-0 h-full w-72 z-50 bg-white shadow-xl"
            style={{ animation: 'slideIn 0.2s ease-out' }}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between h-16 px-4 border-b">
              <span className="text-lg font-semibold" style={{ color: theme.colors.text.primary }}>
                Menu
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
                aria-label="Close menu"
              >
                <X size={24} style={{ color: theme.colors.text.primary }} />
              </button>
            </div>

            {/* Drawer Content */}
            <nav className="py-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex items-center justify-between px-4 py-4
                      transition-colors duration-200
                      ${active
                        ? ''
                        : 'hover:bg-gray-50'
                      }
                    `}
                    style={{
                      backgroundColor: active ? `${theme.colors.primary.DEFAULT}10` : 'transparent',
                      borderLeft: active ? `4px solid ${theme.colors.primary.DEFAULT}` : '4px solid transparent',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        size={22}
                        style={{
                          color: active
                            ? theme.colors.primary.DEFAULT
                            : theme.colors.text.secondary,
                        }}
                      />
                      <span
                        className="text-base font-medium"
                        style={{
                          color: active
                            ? theme.colors.primary.DEFAULT
                            : theme.colors.text.primary,
                        }}
                      >
                        {item.label}
                      </span>
                    </div>
                    <ChevronRight
                      size={20}
                      style={{ color: theme.colors.text.muted }}
                    />
                  </Link>
                );
              })}
            </nav>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>

      {/* Spacer to prevent content from being hidden behind fixed header */}
      <div className="h-16" />
    </>
  );
}
