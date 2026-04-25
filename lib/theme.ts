/**
 * JobMeter Theme Configuration
 * Centralized theme colors for easy customization across the application
 */

export const theme = {
  colors: {
    // Primary brand colors - Blue from old homepage
    primary: {
      DEFAULT: '#2563EB', // Blue-600 - main brand color from old homepage
      light: '#3B82F6',   // Blue-500 - lighter shade
      dark: '#1D4ED8',    // Blue-700 - darker shade
      foreground: '#FFFFFF',
    },
    
    // Secondary colors
    secondary: {
      DEFAULT: '#F5F5F5',
      foreground: '#1E293B',
    },
    
    // Background colors
    background: {
      DEFAULT: '#FFFFFF',
      muted: '#F8FAFC',
      dark: '#1E293B',
    },
    
    // Text colors
    text: {
      primary: '#1E293B',
      secondary: '#64748B',
      muted: '#94A3B8',
      light: '#FFFFFF',
    },
    
    // Border colors
    border: {
      DEFAULT: '#E2E8F0',
      light: '#F1F5F9',
      dark: '#CBD5E1',
    },
    
    // Match score colors
    match: {
      good: '#10B981',      // Green for 50%+ match
      average: '#F59E0B',   // Amber/Gold for 31-49% match
      bad: '#EF4444',       // Red for 0-30% match
    },
    
    // Accent colors
    accent: {
      red: '#EF4444',
      gold: '#F59E0B',
      blue: '#3B82F6',
      green: '#10B981',
    },
    
    // Status colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    
    // UI element colors
    card: {
      DEFAULT: '#FFFFFF',
      hover: '#F8FAFC',
    },
    
    // Button colors
    button: {
      primary: '#2563EB',
      primaryHover: '#1D4ED8',
      secondary: '#F5F5F5',
      secondaryHover: '#E0E0E0',
    },

    // Overlay colors
    overlay: {
      header: 'rgba(255, 255, 255, 0.2)',
      headerText: 'rgba(255, 255, 255, 0.8)',
    },
  },
  
  // Spacing scale
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
  },
  
  // Border radius
  borderRadius: {
    sm: '0.375rem',  // 6px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px',
  },
  
  // Typography
  fontSize: {
    xs: '0.75rem',   // 12px
    sm: '0.875rem',  // 14px
    base: '1rem',    // 16px
    lg: '1.125rem',  // 18px
    xl: '1.25rem',   // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
  },
  
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  
  // Z-index scale
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
} as const;

export type Theme = typeof theme;


