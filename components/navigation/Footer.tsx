'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const footerLinks = [
  { href: '/', label: 'Home' },
  { href: '/jobs', label: 'Jobs' },
  { href: '/cv', label: 'CV' },
  { href: '/blog', label: 'Blog' },
  { href: '/company', label: 'Companies' },
  { href: '/submit', label: 'Post a job' },
];

export default function Footer() {
  const pathname = usePathname();

  return (
    <footer className="border-t border-gray-200 bg-white py-4">
      <nav className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-4 text-sm md:flex-row md:gap-6">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-gray-600 hover:text-blue-600 transition-colors ${
                pathname === link.href ? 'text-blue-600 font-medium' : ''
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </footer>
  );
}