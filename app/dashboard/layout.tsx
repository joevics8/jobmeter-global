"use client";

import { ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { theme } from '@/lib/theme';
import {
  LayoutDashboard,
  CheckCircle,
  GraduationCap,
  FileText,
  MessageSquare,
  Linkedin,
  Heart,
  LogOut,
  Briefcase,
  User
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Get the current active tab based on pathname
  const getActiveTab = () => {
    if (pathname === '/dashboard') return 'overview';
    if (pathname.includes('/applied-jobs')) return 'applied-jobs';
    if (pathname.includes('/career-coach')) return 'career-coach';
    if (pathname.includes('/cv-review')) return 'cv-review';
    if (pathname.includes('/interview-prep')) return 'interview-prep';
    if (pathname.includes('/linkedin-insights')) return 'linkedin-insights';
    if (pathname.includes('/saved-jobs')) return 'saved-jobs';
    return 'overview';
  };

  const handleTabChange = (tab: string) => {
    switch (tab) {
      case 'overview':
        router.push('/dashboard');
        break;
      case 'applied-jobs':
        router.push('/dashboard/applied-jobs');
        break;
      case 'career-coach':
        router.push('/dashboard/career-coach');
        break;
      case 'cv-review':
        router.push('/dashboard/cv-review');
        break;
      case 'interview-prep':
        router.push('/dashboard/interview-prep');
        break;
      case 'linkedin-insights':
        router.push('/dashboard/linkedin-insights');
        break;
      case 'saved-jobs':
        router.push('/dashboard/saved-jobs');
        break;
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: theme.colors.primary.DEFAULT }}>
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">JobMeter</h1>
            </div>
            <Button variant="outline" onClick={handleSignOut} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={getActiveTab()} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-7 h-auto p-1 bg-transparent">
              <TabsTrigger 
                value="overview" 
                className="flex flex-col items-center gap-1 py-3 px-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="text-xs">Overview</span>
              </TabsTrigger>
              <TabsTrigger 
                value="applied-jobs" 
                className="flex flex-col items-center gap-1 py-3 px-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
              >
                <CheckCircle className="h-4 w-4" />
                <span className="text-xs">Applied Jobs</span>
              </TabsTrigger>
              <TabsTrigger 
                value="career-coach" 
                className="flex flex-col items-center gap-1 py-3 px-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
              >
                <GraduationCap className="h-4 w-4" />
                <span className="text-xs">Career Coach</span>
              </TabsTrigger>
              <TabsTrigger 
                value="cv-review" 
                className="flex flex-col items-center gap-1 py-3 px-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
              >
                <FileText className="h-4 w-4" />
                <span className="text-xs">CV Review</span>
              </TabsTrigger>
              <TabsTrigger 
                value="interview-prep" 
                className="flex flex-col items-center gap-1 py-3 px-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="text-xs">Interview Prep</span>
              </TabsTrigger>
              <TabsTrigger 
                value="linkedin-insights" 
                className="flex flex-col items-center gap-1 py-3 px-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
              >
                <Linkedin className="h-4 w-4" />
                <span className="text-xs">LinkedIn</span>
              </TabsTrigger>
              <TabsTrigger 
                value="saved-jobs" 
                className="flex flex-col items-center gap-1 py-3 px-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
              >
                <Heart className="h-4 w-4" />
                <span className="text-xs">Saved Jobs</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}