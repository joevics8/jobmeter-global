import type { Metadata } from 'next';

const siteUrl = 'https://www.global.jobmeter.app';

export const metadata: Metadata = {
  title: 'Welcome to JobMeter — Extension Installed',
  description: 'JobMeter now sits quietly in your browser, automatically highlighting salary, skills, experience, and work mode on every job page you visit.',
  openGraph: {
    title: 'Welcome to JobMeter — Extension Installed',
    description: 'Automatically highlight salary, skills, experience, and work mode on every job page you visit.',
    url: `${siteUrl}/extension-welcome`,
    type: 'website',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        secureUrl: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'JobMeter - Browser Extension',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Welcome to JobMeter — Extension Installed',
    description: 'Automatically highlight salary, skills, experience, and work mode on every job page you visit.',
    images: [`${siteUrl}/og-image.png`],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
