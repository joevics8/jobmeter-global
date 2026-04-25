"use client";

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import Header from '@/components/navigation/Header';
import Footer from '@/components/navigation/Footer';
import CookieModal from '@/components/CookieModal';
import { theme } from '@/lib/theme';
import WhatsAppFloatButton from '@/components/WhatsAppFloatButton';
import ExitIntentPopup from '@/components/ExitIntentPopup';
export default function RootLayoutClient({
  children,
}: {
    children: React.ReactNode;
  }) {
  const pathname = usePathname();
  
  // Bottom nav pages that show bottom navigation
  const bottomNavPages = ['/jobs', '/saved', '/cv', '/tools', '/settings'];
  
  // Hide bottom nav on job details pages and auth/onboarding pages
  const hideBottomNav = 
    (pathname?.startsWith('/jobs/') && pathname !== '/jobs') ||
    pathname?.startsWith('/auth') ||
    pathname?.startsWith('/onboarding') ||
    pathname?.startsWith('/dashboard') ||
    (pathname?.startsWith('/tools/interview/') && pathname !== '/tools/interview');

  // Hide header on bottom nav pages (mobile-style pages)
  const hideHeader = bottomNavPages.includes(pathname || '');

  // Show footer on pages that don't have bottom nav
  const showFooter = !bottomNavPages.includes(pathname || '') && !hideBottomNav;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: theme.colors.background.DEFAULT }}>
      {/* Header - hidden on bottom nav pages */}
      {!hideHeader && <Header />}

      {/* Main content with bottom padding for nav (unless hidden) */}
      <main 
        className="flex-1" 
        style={{ 
          backgroundColor: theme.colors.background.muted,
          paddingBottom: hideBottomNav && !showFooter ? '0' : '80px',
          paddingTop: hideHeader ? '0px' : undefined
        }}
      >
        {children}
      </main>
      
      {/* Bottom Navigation - hidden on job details and auth pages */}
      {!hideBottomNav && <BottomNavigation />}
      
      {/* Footer - shown on pages without bottom nav */}
      {showFooter && <Footer />}
      
       {/* Cookie Modal */}
      <CookieModal />
      
      {/* WhatsApp Floating Button - Global */}
      <WhatsAppFloatButton />
      
      {/* Exit Intent Popup */}
      <ExitIntentPopup />
    </div>
  );
}