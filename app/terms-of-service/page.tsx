"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { theme } from '@/lib/theme';

export default function TermsOfServicePage() {
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
          <h1 className="text-xl font-bold text-gray-900">Terms of Service</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="px-4 sm:px-6 py-6 max-w-4xl mx-auto">
        <div className="mb-8 p-5 bg-gray-50 rounded-xl border-l-4" style={{ borderLeftColor: theme.colors.success }}>
          <p className="text-base text-gray-700 leading-relaxed mb-4">
            Welcome to JobMeter! These Terms of Service ("Terms") govern your use of our smart job matching platform and services. By accessing or using JobMeter, you agree to be bound by these Terms.
          </p>
          <p className="text-sm text-gray-600 italic">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-8 mb-8">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              By creating an account, accessing, or using JobMeter's services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these Terms, you may not use our services.
            </p>

            <h3 className="text-base font-semibold text-gray-700 mt-4 mb-2">1.1 Eligibility</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              To use JobMeter, you must:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 mb-3 ml-4">
              <li>Be at least 16 years of age (or the age of majority in your jurisdiction)</li>
              <li>Have the legal capacity to enter into binding agreements</li>
              <li>Provide accurate and complete information during registration</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>

            <h3 className="text-base font-semibold text-gray-700 mt-4 mb-2">1.2 Account Registration</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              When creating an account, you agree to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 mb-3 ml-4">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your information as necessary</li>
              <li>Keep your login credentials secure and confidential</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">2. Description of Services</h2>
            
            <h3 className="text-base font-semibold text-gray-700 mt-4 mb-2">2.1 Core Services</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              JobMeter provides a smart platform that:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 mb-3 ml-4">
              <li>Analyzes CVs and professional profiles using advanced technology</li>
              <li>Match job seekers with relevant employment opportunities</li>
              <li>Provides personalized career insights and recommendations</li>
              <li>Facilitates connections between job seekers and employers</li>
              <li>Offers job search tools and career development resources</li>
            </ul>

            <h3 className="text-base font-semibold text-gray-700 mt-4 mb-2">2.2 Technology</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              Our platform utilizes advanced algorithms to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 mb-3 ml-4">
              <li>Parse and analyze CV content and structure</li>
              <li>Extract skills, experience, and qualifications</li>
              <li>Calculate job match scores and compatibility</li>
              <li>Provide personalized job recommendations</li>
              <li>Generate career insights and market analysis</li>
            </ul>

            <h3 className="text-base font-semibold text-gray-700 mt-4 mb-2">2.3 Service Availability</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              While we strive to maintain continuous service availability, JobMeter is provided "as is" and we do not guarantee uninterrupted access. We may suspend or modify services for maintenance, updates, or other operational reasons.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">3. User Responsibilities and Conduct</h2>
            
            <h3 className="text-base font-semibold text-gray-700 mt-4 mb-2">3.1 Acceptable Use</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              You agree to use JobMeter only for lawful purposes and in accordance with these Terms. You may not:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 mb-3 ml-4">
              <li>Violate any applicable laws, regulations, or third-party rights</li>
              <li>Provide false, misleading, or fraudulent information</li>
              <li>Impersonate another person or entity</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use automated tools to scrape or extract data</li>
              <li>Interfere with or disrupt our services</li>
              <li>Transmit viruses, malware, or other harmful code</li>
            </ul>

            <h3 className="text-base font-semibold text-gray-700 mt-4 mb-2">3.2 Content Standards</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              All content you submit must:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 mb-3 ml-4">
              <li>Be accurate, truthful, and up-to-date</li>
              <li>Not infringe on intellectual property rights</li>
              <li>Not contain offensive, discriminatory, or inappropriate material</li>
              <li>Comply with professional standards and ethics</li>
              <li>Not violate any confidentiality agreements</li>
            </ul>

            <h3 className="text-base font-semibold text-gray-700 mt-4 mb-2">3.3 CV and Profile Information</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              When uploading your CV or creating your profile, you represent and warrant that:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 mb-3 ml-4">
              <li>All information is accurate and complete</li>
              <li>You have the right to share such information</li>
              <li>The content does not violate any third-party rights</li>
              <li>You will update information as it changes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">4. Intellectual Property Rights</h2>
            
            <h3 className="text-base font-semibold text-gray-700 mt-4 mb-2">4.1 JobMeter's Intellectual Property</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              JobMeter and its licensors own all rights, title, and interest in and to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 mb-3 ml-4">
              <li>The JobMeter platform, software, and technology</li>
              <li>Algorithms, data processing methods, and platform technology</li>
              <li>Trademarks, logos, and brand elements</li>
              <li>Documentation, user guides, and training materials</li>
              <li>Aggregated and anonymized data and analytics</li>
            </ul>

            <h3 className="text-base font-semibold text-gray-700 mt-4 mb-2">4.2 User Content</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              You retain ownership of your personal information and content. However, by using our services, you grant JobMeter a non-exclusive, royalty-free license to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 mb-3 ml-4">
              <li>Use, process, and analyze your information to provide our services</li>
              <li>Share your information with potential employers (with your consent)</li>
              <li>Improve our matching capabilities and platform features</li>
              <li>Generate aggregated and anonymized insights</li>
            </ul>

            <h3 className="text-base font-semibold text-gray-700 mt-4 mb-2">4.3 Third-Party Content</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              Our platform may contain content from third parties, including job postings, company information, and other materials. Such content is owned by the respective third parties and subject to their terms and conditions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">5. Privacy and Data Protection</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              Your privacy is important to us. Our collection, use, and protection of your personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference. By using our services, you consent to the collection and use of your information as described in our Privacy Policy.
            </p>

            <h3 className="text-base font-semibold text-gray-700 mt-4 mb-2">5.1 Data Processing</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              We process your personal data to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 mb-3 ml-4">
              <li>Provide and improve our job matching services</li>
              <li>Analyze your CV and professional background</li>
              <li>Generate personalized job recommendations</li>
              <li>Communicate with you about opportunities and updates</li>
              <li>Ensure platform security and prevent fraud</li>
            </ul>

            <h3 className="text-base font-semibold text-gray-700 mt-4 mb-2">5.2 Data Sharing</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              We may share your information with:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 mb-3 ml-4">
              <li>Potential employers and recruiters (with your consent)</li>
              <li>Service providers who assist in platform operations</li>
              <li>Legal authorities when required by law</li>
              <li>Business partners in connection with service delivery</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">6. Job Matching and Recommendations</h2>
            
            <h3 className="text-base font-semibold text-gray-700 mt-4 mb-2">6.1 Matching Algorithm</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              Our smart matching system considers various factors including:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 mb-3 ml-4">
              <li>Skills, experience, and qualifications</li>
              <li>Location preferences and remote work options</li>
              <li>Salary expectations and compensation requirements</li>
              <li>Career goals and professional interests</li>
              <li>Industry experience and specialization</li>
            </ul>

            <h3 className="text-base font-semibold text-gray-700 mt-4 mb-2">6.2 No Guarantee of Employment</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              JobMeter is a job matching platform and does not guarantee:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 mb-3 ml-4">
              <li>Job placement or employment opportunities</li>
              <li>Specific salary levels or compensation packages</li>
              <li>Interview invitations or hiring decisions</li>
              <li>Success in job applications or career advancement</li>
            </ul>

            <h3 className="text-base font-semibold text-gray-700 mt-4 mb-2">6.3 Third-Party Job Postings</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              Job postings on our platform are provided by third-party employers and recruiters. We do not verify the accuracy of job postings or guarantee the legitimacy of employers. Users are responsible for:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 mb-3 ml-4">
              <li>Verifying employer credentials and job authenticity</li>
              <li>Conducting due diligence before applying</li>
              <li>Protecting personal information during the application process</li>
              <li>Reporting suspicious or fraudulent job postings</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">7. Payment Terms and Billing</h2>
            
            <h3 className="text-base font-semibold text-gray-700 mt-4 mb-2">7.1 Free Services</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              JobMeter offers free access to basic job matching services. Premium features may be available for a fee, and any paid services will be clearly disclosed before purchase.
            </p>

            <h3 className="text-base font-semibold text-gray-700 mt-4 mb-2">7.2 Premium Services</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              If you subscribe to premium services:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 mb-3 ml-4">
              <li>Fees are charged in advance and are non-refundable</li>
              <li>Subscriptions automatically renew unless cancelled</li>
              <li>You can cancel your subscription at any time</li>
              <li>Refunds are provided only as required by law</li>
            </ul>

            <h3 className="text-base font-semibold text-gray-700 mt-4 mb-2">7.3 Price Changes</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              We reserve the right to modify pricing for our services. Changes will be communicated in advance, and existing subscribers will be notified of any price increases.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">8. Disclaimers and Limitations of Liability</h2>
            
            <h3 className="text-base font-semibold text-gray-700 mt-4 mb-2">8.1 Service Disclaimers</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              JobMeter is provided "as is" and "as available" without warranties of any kind. We disclaim all warranties, express or implied, including:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 mb-3 ml-4">
              <li>Warranties of merchantability and fitness for a particular purpose</li>
              <li>Warranties regarding accuracy, reliability, or completeness</li>
              <li>Warranties of non-infringement or security</li>
              <li>Warranties regarding uninterrupted or error-free service</li>
            </ul>

            <h3 className="text-base font-semibold text-gray-700 mt-4 mb-2">8.2 Limitation of Liability</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              To the maximum extent permitted by law, JobMeter shall not be liable for:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 mb-3 ml-4">
              <li>Indirect, incidental, special, or consequential damages</li>
              <li>Loss of profits, data, or business opportunities</li>
              <li>Damages resulting from job applications or employment decisions</li>
              <li>Third-party actions or content</li>
              <li>System failures, security breaches, or data loss</li>
            </ul>

            <h3 className="text-base font-semibold text-gray-700 mt-4 mb-2">8.3 Maximum Liability</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              Our total liability to you for any claims arising from these Terms or your use of our services shall not exceed the amount you paid us in the 12 months preceding the claim, or $100, whichever is greater.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">9. Indemnification</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              You agree to indemnify, defend, and hold harmless JobMeter and its officers, directors, employees, and agents from any claims, damages, losses, or expenses (including reasonable attorneys' fees) arising from:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 mb-3 ml-4">
              <li>Your use of our services</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any third-party rights</li>
              <li>Content you submit or transmit through our platform</li>
              <li>Your violation of applicable laws or regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">10. Termination</h2>
            
            <h3 className="text-base font-semibold text-gray-700 mt-4 mb-2">10.1 Termination by You</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              You may terminate your account at any time by:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 mb-3 ml-4">
              <li>Using the account deletion feature in your settings</li>
              <li>Contacting our support team</li>
              <li>Ceasing to use our services</li>
            </ul>

            <h3 className="text-base font-semibold text-gray-700 mt-4 mb-2">10.2 Termination by JobMeter</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              We may suspend or terminate your account if you:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 mb-3 ml-4">
              <li>Violate these Terms or our policies</li>
              <li>Engage in fraudulent or illegal activities</li>
              <li>Misuse our services or platform</li>
              <li>Fail to pay required fees (if applicable)</li>
            </ul>

            <h3 className="text-base font-semibold text-gray-700 mt-4 mb-2">10.3 Effect of Termination</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              Upon termination:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 mb-3 ml-4">
              <li>Your access to our services will cease immediately</li>
              <li>We will delete or anonymize your personal information</li>
              <li>Certain provisions of these Terms will survive termination</li>
              <li>You remain liable for any outstanding obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">11. Dispute Resolution</h2>
            
            <h3 className="text-base font-semibold text-gray-700 mt-4 mb-2">11.1 Governing Law</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              These Terms are governed by and construed in accordance with the laws of Nigeria, without regard to conflict of law principles.
            </p>

            <h3 className="text-base font-semibold text-gray-700 mt-4 mb-2">11.2 Dispute Resolution Process</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              Before pursuing legal action, you agree to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 mb-3 ml-4">
              <li>Contact us directly to attempt to resolve the dispute</li>
              <li>Participate in good faith negotiations</li>
              <li>Consider alternative dispute resolution methods</li>
            </ul>

            <h3 className="text-base font-semibold text-gray-700 mt-4 mb-2">11.3 Jurisdiction</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              Any legal action arising from these Terms or your use of our services shall be brought in the courts of Nigeria, and you consent to the jurisdiction of such courts.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">12. General Provisions</h2>
            
            <h3 className="text-base font-semibold text-gray-700 mt-4 mb-2">12.1 Entire Agreement</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and JobMeter regarding your use of our services.
            </p>

            <h3 className="text-base font-semibold text-gray-700 mt-4 mb-2">12.2 Severability</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full force and effect.
            </p>

            <h3 className="text-base font-semibold text-gray-700 mt-4 mb-2">12.3 Waiver</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              Our failure to enforce any provision of these Terms does not constitute a waiver of that provision or any other provision.
            </p>

            <h3 className="text-base font-semibold text-gray-700 mt-4 mb-2">12.4 Assignment</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              You may not assign or transfer your rights or obligations under these Terms without our prior written consent. We may assign these Terms in connection with a merger, acquisition, or sale of assets.
            </p>

            <h3 className="text-base font-semibold text-gray-700 mt-4 mb-2">12.5 Force Majeure</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              We shall not be liable for any failure or delay in performance due to circumstances beyond our reasonable control, including natural disasters, war, terrorism, or government actions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">13. Contact Information</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200 mb-3">
              <p className="text-sm text-gray-700 leading-relaxed">
                <span className="font-semibold text-green-700">Email:</span> help.jobmeter@gmail.com<br />
                <span className="font-semibold text-green-700">WhatsApp:</span> +234 705 692 8186<br />
                <span className="font-semibold text-green-700">Response Time:</span> We aim to respond to all inquiries within 24-48 hours
              </p>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">
              For legal matters or formal notices, please use the email address above with "Legal Notice" in the subject line.
            </p>
          </section>
        </div>

        <div className="mt-10 mb-8 p-5 bg-gray-50 rounded-xl text-center">
          <p className="text-xs text-gray-600 leading-relaxed">
            These Terms of Service are effective as of {new Date().toLocaleDateString()} and apply to all users of the JobMeter platform. By continuing to use our services, you acknowledge that you have read and agree to be bound by these Terms.
          </p>
        </div>
      </div>
    </div>
  );
}