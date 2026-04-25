"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertTriangle, Info, FileText, Shield } from 'lucide-react';
import { theme } from '@/lib/theme';

export default function DisclaimerPage() {
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
          <h1 className="text-xl font-bold text-gray-900">Disclaimer</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="px-4 sm:px-6 py-6 max-w-4xl mx-auto">
        {/* Last Updated */}
        <div className="mb-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={20} className="text-yellow-600" />
            <p className="text-sm font-semibold text-yellow-800">Important Notice</p>
          </div>
          <p className="text-sm text-yellow-700">
            <span className="font-semibold">Last Updated:</span> February 2, 2026
          </p>
        </div>

        {/* Introduction */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Info size={24} style={{ color: theme.colors.primary.DEFAULT }} />
            <h2 className="text-xl font-bold text-gray-900">General Disclaimer</h2>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            The information provided on JobMeter is for general informational purposes only. 
            While we strive to keep the information accurate and up-to-date, we make no representations 
            or warranties of any kind, express or implied, about the completeness, accuracy, reliability, 
            suitability, or availability of the information, products, services, or related graphics 
            contained on the website for any purpose.
          </p>
        </div>

        {/* Job Listings Disclaimer */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FileText size={24} style={{ color: theme.colors.primary.DEFAULT }} />
            <h2 className="text-xl font-bold text-gray-900">Job Listings & Employer Information</h2>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-xl border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Third-Party Content</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Job listings, company information, and employer details on our platform are provided 
                by third parties. JobMeter does not verify, endorse, or guarantee the accuracy, 
                completeness, or authenticity of job postings or employer information. Users are 
                responsible for conducting their own due diligence before applying for positions 
                or engaging with employers.
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">No Employment Guarantee</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                JobMeter is a job matching and aggregation platform. We do not guarantee employment, 
                job placement, or specific outcomes from using our services. The platform facilitates 
                connections between job seekers and employers, but we are not involved in the hiring 
                process, interview decisions, or employment agreements.
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Application Process</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                When you apply for jobs through our platform, your application data is transmitted 
                directly to the employer or their designated application system. JobMeter is not 
                responsible for how employers handle, process, or respond to your applications.
              </p>
            </div>
          </div>
        </div>

        {/* Matching Algorithm Disclaimer */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield size={24} style={{ color: theme.colors.primary.DEFAULT }} />
            <h2 className="text-xl font-bold text-gray-900">Matching Algorithm & Recommendations</h2>
          </div>
          
          <div className="p-5 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              Our job matching algorithms and recommendations are generated using automated systems 
              that analyze your profile, skills, preferences, and job market data. These 
              recommendations:
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600">•</span>
                <span>Are provided for informational purposes only and should not be considered professional career advice</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600">•</span>
                <span>Do not guarantee suitability, compatibility, or success in any particular role</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600">•</span>
                <span>Are based on available data and may not reflect all relevant factors for job success</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-blue-600">•</span>
                <span>Should be supplemented with your own research and professional judgment</span>
              </li>
            </ul>
          </div>
        </div>

        {/* External Links */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">External Links</h2>
          <p className="text-sm text-gray-700 leading-relaxed mb-4">
            Our website may contain links to external websites that are not provided or maintained by 
            JobMeter. We do not guarantee the accuracy, relevance, timeliness, or completeness of any 
            information on these external websites. The inclusion of any links does not necessarily 
            imply a recommendation or endorsement of the views expressed within them.
          </p>
          <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
            <p className="text-sm text-orange-800">
              <span className="font-semibold">Note:</span> When you click on external links, you are 
              leaving our website and are subject to the terms and privacy policies of the destination 
              website.
            </p>
          </div>
        </div>

        {/* Career Tools & Resources */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Career Tools & Resources</h2>
          <p className="text-sm text-gray-700 leading-relaxed mb-4">
            JobMeter provides various career tools, resources, and guidance materials including but 
            not limited to CV builders, interview preparation guides, career advice articles, and 
            salary information. These resources are:
          </p>
          <ul className="space-y-2 text-sm text-gray-700 mb-4 ml-4">
            <li className="flex items-start gap-2">
              <span className="font-bold text-gray-900">•</span>
              <span>Provided for general informational and educational purposes only</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-gray-900">•</span>
              <span>Not a substitute for professional career counseling or legal advice</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-gray-900">•</span>
              <span>Based on general industry standards and may not apply to your specific situation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-gray-900">•</span>
              <span>Subject to change without notice as industry practices evolve</span>
            </li>
          </ul>
        </div>

        {/* Liability Limitation */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Limitation of Liability</h2>
          <p className="text-sm text-gray-700 leading-relaxed mb-4">
            In no event shall JobMeter, its affiliates, partners, employees, or agents be liable 
            for any direct, indirect, incidental, special, consequential, or punitive damages 
            arising out of or in connection with:
          </p>
          <ul className="space-y-2 text-sm text-gray-700 mb-4 ml-4">
            <li className="flex items-start gap-2">
              <span className="font-bold text-gray-900">•</span>
              <span>Your use of or inability to use our services</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-gray-900">•</span>
              <span>Any job applications, interviews, or employment decisions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-gray-900">•</span>
              <span>Interactions with employers or other users</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-gray-900">•</span>
              <span>Reliance on any information or recommendations provided through our platform</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-gray-900">•</span>
              <span>Unauthorized access to or alteration of your transmissions or data</span>
            </li>
          </ul>
        </div>

        {/* User Responsibility */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">User Responsibility</h2>
          <p className="text-sm text-gray-700 leading-relaxed mb-4">
            By using JobMeter, you acknowledge and agree that:
          </p>
          <div className="space-y-3">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-1">Due Diligence</h4>
              <p className="text-sm text-gray-600">You are solely responsible for verifying the legitimacy of employers, job postings, and opportunities before providing personal information or accepting employment.</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-1">Information Accuracy</h4>
              <p className="text-sm text-gray-600">You are responsible for ensuring the accuracy and truthfulness of all information you provide on our platform, including your profile, CV, and application materials.</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-1">Risk Awareness</h4>
              <p className="text-sm text-gray-600">You understand that job searching and career decisions involve risks, and you assume full responsibility for your career choices and outcomes.</p>
            </div>
          </div>
        </div>

        {/* Changes to Disclaimer */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Changes to This Disclaimer</h2>
          <p className="text-sm text-gray-700 leading-relaxed mb-4">
            We may update this Disclaimer from time to time to reflect changes in our services, 
            legal requirements, or industry practices. We encourage you to review this page 
            periodically for the latest information. Continued use of our platform after changes 
            constitutes acceptance of the updated Disclaimer.
          </p>
        </div>

        {/* Contact */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Us</h2>
          <p className="text-sm text-gray-700 leading-relaxed mb-4">
            If you have any questions about this Disclaimer or need clarification on any of the 
            points mentioned, please contact us:
          </p>
          <div className="p-5 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-blue-700">Email:</span> help.jobmeter@gmail.com<br />
              <span className="font-semibold text-blue-700">WhatsApp:</span> +234 705 692 8186
            </p>
          </div>
        </div>

        {/* Bottom note */}
        <div className="mt-10 p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl text-center border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-3">
            Use JobMeter Responsibly
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            By accessing and using JobMeter, you acknowledge that you have read, understood, and 
            agree to this Disclaimer. We are committed to providing a valuable job search platform 
            while maintaining transparency about our limitations and your responsibilities.
          </p>
        </div>
      </div>
    </div>
  );
}
