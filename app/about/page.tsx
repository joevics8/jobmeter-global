"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Globe, Shield } from 'lucide-react';
import { theme } from '@/lib/theme';

export default function AboutPage() {
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
          <h1 className="text-xl font-bold text-gray-900">About Us</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="px-4 sm:px-6 py-6 max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-green-50 rounded-xl border border-blue-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to JobMeter</h2>
          <p className="text-base text-gray-700 leading-relaxed mb-3">
            JobMeter was founded by Joevics, a tech expert with extensive experience helping people find their dream jobs through better tools, insights, and resources.
          </p>
          <p className="text-base text-gray-700 leading-relaxed">
            Our goal is to make job searching faster, fairer, and more effective by providing up-to-date job listings, original career tools, and well-researched articles with practical advice.
          </p>
        </div>

        {/* What We Offer */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Globe size={24} style={{ color: theme.colors.primary.DEFAULT }} />
            What We Offer
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-colors">
              <h3 className="font-semibold text-gray-900 mb-2">Up-to-date Job Listings</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                We curate the latest job opportunities from verified employers, helping you find positions that are actively hiring.
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-colors">
              <h3 className="font-semibold text-gray-900 mb-2">Original Career Tools</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                From CV builders to ATS reviews, salary calculators to interview practice—our tools are designed to give you a competitive edge in your job search.
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-colors">
              <h3 className="font-semibold text-gray-900 mb-2">Well-Researched Articles</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Practical career advice, salary guides, interview tips, and industry insights to help you navigate your career journey with confidence.
              </p>
            </div>
          </div>
        </div>

        {/* Our Passion */}
        <div className="mb-8 p-5 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-sm text-gray-700 leading-relaxed">
            We are passionate about empowering job seekers and continuously improving the platform based on real user needs.
          </p>
        </div>

        {/* Our Commitment */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Shield size={24} style={{ color: theme.colors.primary.DEFAULT }} />
            Our Commitment
          </h2>
          
          <div className="p-5 bg-blue-50 rounded-xl border border-blue-100">
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="font-bold" style={{ color: theme.colors.primary.DEFAULT }}>•</span>
                <span>Your personal information is protected with industry-leading security measures</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold" style={{ color: theme.colors.primary.DEFAULT }}>•</span>
                <span>Job listings are from verified and legitimate employers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold" style={{ color: theme.colors.primary.DEFAULT }}>•</span>
                <span>You receive responsive support whenever you need assistance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold" style={{ color: theme.colors.primary.DEFAULT }}>•</span>
                <span>The platform remains free and accessible to all job seekers</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Who We Serve */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Who We Serve</h2>
          <p className="text-sm text-gray-700 leading-relaxed mb-4">
            JobMeter is designed for anyone navigating their career journey:
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <p className="text-sm font-semibold text-gray-900 mb-1">Recent Graduates</p>
              <p className="text-xs text-gray-600">Finding your first professional opportunity</p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <p className="text-sm font-semibold text-gray-900 mb-1">Career Changers</p>
              <p className="text-xs text-gray-600">Transitioning to new industries or roles</p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <p className="text-sm font-semibold text-gray-900 mb-1">Experienced Professionals</p>
              <p className="text-xs text-gray-600">Seeking advancement or new challenges</p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <p className="text-sm font-semibold text-gray-900 mb-1">Specialized Talent</p>
              <p className="text-xs text-gray-600">Looking for niche or expert positions</p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Get In Touch</h2>
          <p className="text-sm text-gray-700 leading-relaxed mb-4">
            We're here to help you succeed in your career journey. If you have questions, feedback, or need support, don't hesitate to reach out:
          </p>
          
          <div className="p-5 bg-green-50 rounded-xl border border-green-200">
            <p className="text-sm text-gray-700 leading-relaxed">
              <span className="font-semibold text-green-700">Email:</span> help.jobmeter@gmail.com<br />
              <span className="font-semibold text-green-700">WhatsApp:</span> +234 705 692 8186<br />
              <span className="font-semibold text-green-700">Response Time:</span> We aim to respond to all inquiries within 24-48 hours
            </p>
          </div>
        </div>

        {/* Closing Statement */}
        <div className="mt-10 mb-8 p-6 bg-gradient-to-br from-blue-50 to-green-50 rounded-xl text-center border border-blue-100">
          <h3 className="text-lg font-bold text-gray-900 mb-3">
            Join Thousands of Job Seekers Finding Success with JobMeter
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            Whether you're looking for your first job, switching careers, or seeking specialized positions, JobMeter is your trusted partner in navigating the global job market. Start your journey today and discover opportunities that match your potential.
          </p>
        </div>
      </div>
    </div>
  );
}