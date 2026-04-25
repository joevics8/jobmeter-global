"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Mail, Phone, MessageSquare, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { theme } from '@/lib/theme';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

// Form validation schema
const contactFormSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(255, "Name must be less than 255 characters"),
  email: z.string()
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters"),
  subject: z.string()
    .min(5, "Subject must be at least 5 characters")
    .max(500, "Subject must be less than 500 characters"),
  message: z.string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be less than 2000 characters"),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (values: ContactFormValues) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const { data, error } = await supabase
        .from('support_requests')
        .insert({
          name: values.name,
          email: values.email,
          subject: values.subject,
          message: values.message,
          status: 'pending',
        })
        .select();

      if (error) {
        console.error('Supabase error:', error);
        if (error.message.includes('row-level security') || error.code === '42501') {
          setErrorMessage('Unable to submit right now. Please email us directly at support@jobmeter.com');
        } else {
          throw error;
        }
        setSubmitStatus('error');
        return;
      }

      console.log('Support request created:', data);
      setSubmitStatus('success');
      
      // Reset form after successful submission
      form.reset();
      
      // Optionally redirect to success page after a delay
      setTimeout(() => {
        router.push('/');
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting support request:', error);
      setSubmitStatus('error');
      setErrorMessage('Failed to submit your request. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <h1 className="text-xl font-bold text-gray-900">Contact Us</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="px-4 sm:px-6 py-6 max-w-4xl mx-auto">
        {/* Success Message */}
        {submitStatus === 'success' && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-600" size={24} />
              <div>
                <h3 className="font-semibold text-green-800">Message Sent Successfully!</h3>
                <p className="text-sm text-green-700">Thank you for contacting us. We'll get back to you within 24-48 hours.</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {submitStatus === 'error' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-red-600" size={24} />
              <div>
                <h3 className="font-semibold text-red-800">Submission Failed</h3>
                <p className="text-sm text-red-700">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Contact Information Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Get in Touch</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <Mail size={24} style={{ color: theme.colors.primary.DEFAULT }} />
                <h3 className="font-semibold text-gray-900">Email Us</h3>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                <a 
                  href="mailto:help.jobmeter@gmail.com" 
                  className="font-medium text-blue-600 hover:text-blue-800 transition-colors"
                >
                  help.jobmeter@gmail.com
                </a>
              </p>
              <p className="text-xs text-gray-600">
                We respond to all emails within 24-48 hours
              </p>
            </div>

            <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <Phone size={24} style={{ color: theme.colors.success }} />
                <h3 className="font-semibold text-gray-900">WhatsApp</h3>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                <a 
                  href="https://wa.me/2347056928186" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-medium text-green-600 hover:text-green-800 transition-colors"
                >
                  +234 705 692 8186
                </a>
              </p>
              <p className="text-xs text-gray-600">
                Available for urgent inquiries during business hours
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare size={24} style={{ color: theme.colors.primary.DEFAULT }} />
            <h2 className="text-2xl font-bold text-gray-900">Send Us a Message</h2>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-900">
                          Full Name <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your full name"
                            {...field}
                            disabled={isSubmitting || submitStatus === 'success'}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-900">
                          Email Address <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="your.email@example.com"
                            type="email"
                            {...field}
                            disabled={isSubmitting || submitStatus === 'success'}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-900">
                        Subject <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="What is your message about?"
                          {...field}
                          disabled={isSubmitting || submitStatus === 'success'}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-gray-600">
                        Be specific about your inquiry to help us assist you better
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-900">
                        Message <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please describe your issue, question, or feedback in detail..."
                          className="min-h-[120px] w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                          {...field}
                          disabled={isSubmitting || submitStatus === 'success'}
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-gray-600">
                        Provide as much detail as possible to help us understand your needs
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between pt-4">
                  <p className="text-xs text-gray-500">
                    All fields marked with <span className="text-red-500">*</span> are required
                  </p>
                  
                  <Button
                    type="submit"
                    disabled={isSubmitting || submitStatus === 'success'}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    style={{ 
                      backgroundColor: isSubmitting || submitStatus === 'success' ? undefined : theme.colors.primary.DEFAULT,
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Sending...
                      </>
                    ) : submitStatus === 'success' ? (
                      <>
                        <CheckCircle size={18} />
                        Sent!
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Send Message
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">What are your support hours?</h3>
              <p className="text-sm text-gray-600">
                We're available Monday through Friday, 9 AM to 6 PM WAT. WhatsApp support is available during these hours, while email support is monitored 24/7.
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">How quickly will I receive a response?</h3>
              <p className="text-sm text-gray-600">
                We aim to respond to all inquiries within 24-48 hours. Urgent issues sent via WhatsApp during business hours typically receive faster responses.
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">What information should I include in my message?</h3>
              <p className="text-sm text-gray-600">
                Include your account email (if applicable), a clear subject line, and detailed description of your issue. For technical problems, mention your device and browser.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Note */}
        <div className="mt-10 p-6 bg-gradient-to-br from-blue-50 to-green-50 rounded-xl text-center border border-blue-100">
          <h3 className="text-lg font-bold text-gray-900 mb-3">
            We're Here to Help
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            Your feedback and questions help us improve JobMeter for everyone. 
            Whether you need technical support, have a feature suggestion, or just want to say hello, 
            we'd love to hear from you!
          </p>
        </div>
      </div>
    </div>
  );
}