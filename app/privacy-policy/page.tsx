"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Shield, Eye, Lock, Database, Globe, UserCheck } from 'lucide-react';
import { theme } from '@/lib/theme';

export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 pt-12">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-900" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Privacy Policy</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="px-4 sm:px-6 py-6 max-w-4xl mx-auto">
        {/* Last Updated */}
        <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Last Updated:</span> January 28, 2026
          </p>
        </div>

        {/* Introduction */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield size={24} style={{ color: theme.colors.primary.DEFAULT }} />
            <h2 className="text-xl font-bold text-gray-900">Our Commitment to Your Privacy</h2>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            At JobMeter, we are committed to protecting your personal information and respecting your privacy. 
            This Privacy Policy explains how we collect, use, store, and protect your information when you use our 
            job search platform and related services.
          </p>
        </div>

        {/* Information We Collect */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Database size={24} style={{ color: theme.colors.primary.DEFAULT }} />
            <h2 className="text-xl font-bold text-gray-900">Information We Collect</h2>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-xl border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Personal Information</h3>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Full name, email address, and phone number</li>
                <li>Professional information (CV, work experience, skills)</li>
                <li>Education and qualification details</li>
                <li>Location preferences and work authorization</li>
              </ul>
            </div>

            <div className="p-4 bg-white rounded-xl border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Usage Information</h3>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Pages visited and time spent on our platform</li>
                <li>Job searches and applications submitted</li>
                <li>Device information and IP address</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </div>

            <div className="p-4 bg-white rounded-xl border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Communication Data</h3>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Messages sent to employers or support</li>
                <li>Email communications and responses</li>
                <li>Customer support interactions</li>
                <li>Feedback and survey responses</li>
              </ul>
            </div>
          </div>
        </div>

        {/* How We Use Your Information */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Eye size={24} style={{ color: theme.colors.primary.DEFAULT }} />
            <h2 className="text-xl font-bold text-gray-900">How We Use Your Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <h3 className="font-semibold text-blue-800 mb-2">Core Services</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Create and manage your profile</li>
                <li>• Match you with relevant jobs</li>
                <li>• Process job applications</li>
                <li>• Provide career tools and insights</li>
              </ul>
            </div>

            <div className="p-4 bg-green-50 rounded-xl border border-green-100">
              <h3 className="font-semibold text-green-800 mb-2">Platform Improvement</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Enhance user experience</li>
                <li>• Develop new features</li>
                <li>• Analyze platform usage</li>
                <li>• Prevent fraudulent activities</li>
              </ul>
            </div>

            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
              <h3 className="font-semibold text-purple-800 mb-2">Communication</h3>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Send job recommendations</li>
                <li>• Provide support responses</li>
                <li>• Share platform updates</li>
                <li>• Send important notifications</li>
              </ul>
            </div>

            <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
              <h3 className="font-semibold text-orange-800 mb-2">Legal Compliance</h3>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• Meet legal obligations</li>
                <li>• Protect user safety</li>
                <li>• Enforce our terms</li>
                <li>• Respond to legal requests</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Information Sharing */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Globe size={24} style={{ color: theme.colors.primary.DEFAULT }} />
            <h2 className="text-xl font-bold text-gray-900">Information Sharing & Disclosure</h2>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-xl border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">With Your Consent</h3>
              <p className="text-sm text-gray-600">
                We share your information with employers only when you explicitly apply for their positions 
                or when you choose to make your profile visible to recruiters.
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Service Providers</h3>
              <p className="text-sm text-gray-600 mb-3">
                We work with trusted third-party services for hosting, analytics, communication, and advertising. 
                These providers are contractually bound to protect your information.
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Key Partners:</span> Supabase (database hosting), 
                Google Analytics (website analytics), and other communication/service providers.
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Legal Requirements</h3>
              <p className="text-sm text-gray-600">
                We may disclose information when required by law, court order, or to protect our rights, 
                property, or safety, or that of our users or the public.
              </p>
            </div>
          </div>
        </div>

        {/* Data Security */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Lock size={24} style={{ color: theme.colors.primary.DEFAULT }} />
            <h2 className="text-xl font-bold text-gray-900">Data Security & Protection</h2>
          </div>
          
          <div className="p-5 bg-green-50 rounded-xl border border-green-200">
            <h3 className="font-semibold text-green-800 mb-3">Our Security Measures Include:</h3>
            <ul className="space-y-2 text-sm text-green-700">
              <li className="flex items-start gap-2">
                <span className="font-bold text-green-600">✓</span>
                <span>SSL encryption for all data transmissions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-green-600">✓</span>
                <span>Secure data centers with restricted access</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-green-600">✓</span>
                <span>Regular security audits and penetration testing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-green-600">✓</span>
                <span>Employee background checks and training</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-green-600">✓</span>
                <span>Compliance with international data protection laws</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Your Rights */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <UserCheck size={24} style={{ color: theme.colors.primary.DEFAULT }} />
            <h2 className="text-xl font-bold text-gray-900">Your Privacy Rights</h2>
          </div>
          
          <div className="space-y-3">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-1">Access & Correction</h4>
              <p className="text-sm text-gray-600">You can access, update, or correct your personal information at any time through your account settings.</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-1">Data Deletion</h4>
              <p className="text-sm text-gray-600">You can request deletion of your account and personal data, subject to legal retention requirements.</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-1">Marketing Preferences</h4>
              <p className="text-sm text-gray-600">You can opt out of marketing communications while maintaining access to essential platform services.</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-1">Data Portability</h4>
              <p className="text-sm text-gray-600">You can request a copy of your personal data in a machine-readable format.</p>
            </div>
          </div>
        </div>



        {/* Cookies & Advertising Policy */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield size={24} style={{ color: theme.colors.primary.DEFAULT }} />
            <h2 className="text-xl font-bold text-gray-900">Cookies, Advertising & Third-Party Services</h2>
          </div>
          
          {/* Google AdSense */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Google AdSense & Advertising</h3>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              We use Google AdSense and other advertising partners to display advertisements on our platform. 
              These services help us keep JobMeter free for users while generating revenue to maintain and improve our services.
            </p>
            
            <div className="p-4 bg-white rounded-xl border border-gray-200 mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">How Google AdSense Works</h4>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Google AdSense uses cookies to serve ads based on your prior visits to our website and other websites</li>
                <li>Google may use the DoubleClick cookie to enable interest-based advertising</li>
                <li>Third-party vendors, including Google, may display ads on our platform</li>
                <li>Google's use of advertising cookies enables it and its partners to serve ads based on your visit to our site and/or other sites on the Internet</li>
              </ul>
            </div>
          </div>

          {/* Personalized Advertising */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Personalized Advertising</h3>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              We participate in personalized advertising programs that deliver ads based on your interests, 
              demographics, and online behavior. This includes:
            </p>
            
            <ul className="space-y-2 text-sm text-gray-700 mb-4 ml-4">
              <li className="flex items-start gap-2">
                <span className="font-bold text-gray-900">•</span>
                <span><span className="font-semibold">Interest-Based Ads:</span> Ads tailored to your interests based on your browsing history and profile information</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-gray-900">•</span>
                <span><span className="font-semibold">Demographic Targeting:</span> Ads selected based on general demographic information such as location, age range, or career interests</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-gray-900">•</span>
                <span><span className="font-semibold">Contextual Ads:</span> Ads relevant to the content you are viewing on our platform</span>
              </li>
            </ul>

            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 mb-4">
              <h4 className="font-semibold text-blue-800 mb-2">Opting Out of Personalized Ads</h4>
              <p className="text-sm text-blue-700 leading-relaxed mb-3">
                You can opt out of personalized advertising from Google and other participating vendors by:
              </p>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>Visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">Google Ads Settings</a></li>
                <li>Visiting <a href="http://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">About Ads Consumer Choice Page</a></li>
                <li>Visiting <a href="http://www.youronlinechoices.eu/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">Your Online Choices (EU)</a></li>
                <li>Installing the <a href="https://tools.google.com/dlpage/gaoptout/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">Google Analytics Opt-out Browser Add-on</a></li>
              </ul>
            </div>
          </div>

          {/* Cookies */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Cookies & Tracking Technologies</h3>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              We use cookies and similar tracking technologies to enhance your experience, analyze traffic, 
              personalize content, and serve advertisements. Here's how we use different types of cookies:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <h4 className="font-semibold text-blue-800 mb-2">Essential Cookies</h4>
                <p className="text-sm text-blue-700">
                  Required for basic platform functionality such as user authentication, security, and session management. These cannot be disabled.
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                <h4 className="font-semibold text-green-800 mb-2">Analytics Cookies</h4>
                <p className="text-sm text-green-700">
                  Help us understand how visitors interact with our website by collecting and reporting information anonymously.
                </p>
              </div>

              <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                <h4 className="font-semibold text-purple-800 mb-2">Advertising Cookies</h4>
                <p className="text-sm text-purple-700">
                  Used by us and our advertising partners (including Google) to deliver relevant ads and track ad performance.
                </p>
              </div>

              <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                <h4 className="font-semibold text-orange-800 mb-2">Third-Party Cookies</h4>
                <p className="text-sm text-orange-700">
                  Set by our partners and service providers to enable features like social sharing and embedded content.
                </p>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <span className="font-semibold">Note:</span> You can control cookie settings through your browser preferences. However, disabling certain cookies may affect some features and functionality of our platform, including the delivery of personalized advertisements.
              </p>
            </div>
          </div>

          {/* Third-Party Vendors */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Third-Party Vendors & Service Providers</h3>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              We work with trusted third-party vendors and service providers who may use cookies and collect 
              information to provide services on our behalf. These include:
            </p>

            <div className="space-y-4">
              <div className="p-4 bg-white rounded-xl border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">Advertising Partners</h4>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li><span className="font-medium">Google AdSense:</span> Displays advertisements and uses cookies for personalized ads</li>
                  <li><span className="font-medium">Other Ad Networks:</span> Various advertising partners who may display ads on our platform</li>
                </ul>
              </div>

              <div className="p-4 bg-white rounded-xl border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">Analytics & Tracking</h4>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li><span className="font-medium">Google Analytics:</span> Analyzes website traffic and user behavior</li>
                  <li><span className="font-medium">Supabase:</span> Provides database hosting and user authentication</li>
                </ul>
              </div>

              <div className="p-4 bg-white rounded-xl border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">Communication & Services</h4>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>Email service providers</li>
                  <li>Hosting and infrastructure providers</li>
                  <li>Customer support tools</li>
                </ul>
              </div>
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-sm text-gray-700 leading-relaxed">
                <span className="font-semibold">Important:</span> Third-party vendors and partners have their own privacy policies and may use cookies independently. We encourage you to review their privacy policies to understand how they collect and use your information.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Us About Privacy</h2>
          <p className="text-sm text-gray-700 leading-relaxed mb-4">
            If you have questions, concerns, or requests regarding this Privacy Policy or your personal information, 
            please contact our Data Protection Officer:
          </p>
          
          <div className="p-5 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-blue-700">Email:</span> help.jobmeter@gmail.com<br />
              <span className="font-semibold text-blue-700">WhatsApp:</span> +234 705 692 8186<br />
              <span className="font-semibold text-blue-700">Response Time:</span> We respond to privacy inquiries within 30 days
            </p>
          </div>
        </div>

        {/* Policy Updates */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Policy Updates</h2>
          <p className="text-sm text-gray-700 leading-relaxed mb-4">
            We may update this Privacy Policy from time to time to reflect changes in our practices, 
            applicable laws, or our operations. We will notify you of significant changes by:
          </p>
          
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="font-bold" style={{ color: theme.colors.primary.DEFAULT }}>•</span>
              <span>Posting the updated policy on our platform</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold" style={{ color: theme.colors.primary.DEFAULT }}>•</span>
              <span>Sending email notifications for material changes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold" style={{ color: theme.colors.primary.DEFAULT }}>•</span>
              <span>Displaying prominent notices on our platform</span>
            </li>
          </ul>
        </div>

        {/* Bottom note */}
        <div className="mt-10 p-6 bg-gradient-to-br from-blue-50 to-green-50 rounded-xl text-center border border-blue-100">
          <h3 className="text-lg font-bold text-gray-900 mb-3">
            Your Privacy Matters to Us
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            We are committed to protecting your privacy and earning your trust every day. 
            By using JobMeter, you agree to the collection and use of information as described in this policy.
          </p>
        </div>
      </div>
    </div>
  );
}