"use client";

import React, { useState, useEffect } from 'react';
import { Building2, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function CompanyRegisterPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showMore, setShowMore] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    description: '',
    industry: '',
    company_size: '',
    headquarters_location: '',
    website_url: '',
    email: '',
    phone: '',
    linkedin_url: '',
    founded_year: '',
    twitter_url: '',
    facebook_url: '',
    instagram_url: '',
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login?redirect=/company/register');
        return;
      }
      setUser(user);
    };
    checkUser();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(null);
  };

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const slug = generateSlug(formData.name);
      
      // Check if slug already exists
      const { data: existingCompany } = await supabase
        .from('companies')
        .select('slug')
        .eq('slug', slug)
        .single();

      if (existingCompany) {
        setError('A company with this name already exists. Please use a different name.');
        setIsSubmitting(false);
        return;
      }

      // Prepare company data
      const companyData = {
        name: formData.name,
        slug,
        tagline: formData.tagline || null,
        description: formData.description,
        industry: formData.industry || null,
        company_size: formData.company_size || null,
        founded_year: formData.founded_year ? parseInt(formData.founded_year) : null,
        headquarters_location: formData.headquarters_location || null,
        website_url: formData.website_url || null,
        email: formData.email || null,
        phone: formData.phone || null,
        linkedin_url: formData.linkedin_url || null,
        twitter_url: formData.twitter_url || null,
        facebook_url: formData.facebook_url || null,
        instagram_url: formData.instagram_url || null,
        user_id: user?.id,
        meta_title: `${formData.name} Careers & Jobs in Nigeria | JobMeter`,
        meta_description: formData.tagline || `Join ${formData.name}. Explore career opportunities and company culture.`,
        h1_title: `Careers at ${formData.name}`,
        seo_keywords: [
          `${formData.name.toLowerCase()} careers`,
          `${formData.name.toLowerCase()} jobs`,
          formData.industry ? `${formData.industry.toLowerCase()} jobs` : null,
        ].filter(Boolean),
        is_published: false,
        is_verified: false,
      };

      const { data, error: insertError } = await supabase
        .from('companies')
        .insert([companyData])
        .select('id, name, slug')
        .single();

      if (insertError) {
        throw insertError;
      }

      setSuccess(true);
      
      // Redirect after 2 seconds to submit page
      setTimeout(() => {
        router.push('/submit');
      }, 2000);

    } catch (err: any) {
      console.error('Error submitting company:', err);
      setError(err.message || 'Failed to submit company. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle size={64} className="mx-auto text-green-600 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Company Registered!</h2>
          <p className="text-gray-600 mb-6">
            Your company has been registered. Redirecting you to post jobs...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div style={{ backgroundColor: '#2563EB' }} className="text-white pt-12 pb-8 px-6">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6"
          >
            <ArrowLeft size={20} />
            Back
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <Building2 size={32} />
            <h1 className="text-3xl font-bold">Register Your Company</h1>
          </div>
          <p className="text-lg text-white/90">
            Add your company to start posting jobs and reaching thousands of candidates.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Basic Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4 text-gray-900">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Company Name *</label>
                <Input
                  name="name"
                  placeholder="e.g., Acme Corporation"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Industry</label>
                <select
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className="w-full h-10 rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">Select</option>
                  <option value="Technology">Technology</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Finance & Banking">Finance & Banking</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-900 mb-1">Tagline</label>
              <Input
                name="tagline"
                placeholder="e.g., Building the future of tech in Africa"
                value={formData.tagline}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-900 mb-1">Description *</label>
              <Textarea
                name="description"
                placeholder="Tell us about your company..."
                value={formData.description}
                onChange={handleChange}
                required
                className="w-full"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Company Size</label>
                <select
                  name="company_size"
                  value={formData.company_size}
                  onChange={handleChange}
                  className="w-full h-10 rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">Select</option>
                  <option value="1-10">1-10</option>
                  <option value="11-50">11-50</option>
                  <option value="51-200">51-200</option>
                  <option value="201-500">201-500</option>
                  <option value="500+">500+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Website</label>
                <Input
                  name="website_url"
                  placeholder="https://example.com"
                  value={formData.website_url}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-4 text-gray-900">Contact Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Company Email</label>
                <Input
                  name="email"
                  type="email"
                  placeholder="hr@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Phone</label>
                <Input
                  name="phone"
                  placeholder="+234..."
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Show More Toggle */}
          <button
            type="button"
            onClick={() => setShowMore(!showMore)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {showMore ? 'Show Less' : 'Show More'}
          </button>

          {showMore && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-4 text-gray-900">Additional Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Founded Year</label>
                  <Input
                    name="founded_year"
                    type="number"
                    placeholder="e.g., 2010"
                    value={formData.founded_year}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Headquarters</label>
                  <Input
                    name="headquarters_location"
                    placeholder="e.g., Lagos, Nigeria"
                    value={formData.headquarters_location}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">LinkedIn URL</label>
                  <Input
                    name="linkedin_url"
                    placeholder="https://linkedin.com/company/..."
                    value={formData.linkedin_url}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Twitter</label>
                  <Input
                    name="twitter_url"
                    placeholder="https://twitter.com/..."
                    value={formData.twitter_url}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Facebook</label>
                  <Input
                    name="facebook_url"
                    placeholder="https://facebook.com/..."
                    value={formData.facebook_url}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Instagram</label>
                  <Input
                    name="instagram_url"
                    placeholder="https://instagram.com/..."
                    value={formData.instagram_url}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-bold text-lg"
          >
            {isSubmitting ? 'Registering...' : 'Register Company'}
          </button>
        </form>
      </div>
    </div>
  );
}
