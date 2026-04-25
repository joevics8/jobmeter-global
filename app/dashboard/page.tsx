"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, User, Briefcase, MapPin, DollarSign, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { theme } from '@/lib/theme';
import Link from 'next/link';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/');
        return;
      }

      setUser(user);
      
      // Fetch onboarding data
      const { data: onboarding } = await supabase
        .from('onboarding_data')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (onboarding) {
        setOnboardingData(onboarding);
      }

    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Link href="/jobs" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div className="p-2 rounded-lg" style={{ backgroundColor: theme.colors.primary.DEFAULT }}>
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">JobMeter</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.user_metadata?.full_name || user?.email}</span>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
          </div>
        </div>
        
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Your Dashboard!</h2>
          <p className="text-gray-600">Your onboarding is complete and your profile is ready.</p>
          </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Profile Summary */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Profile Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {onboardingData?.cv_name && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{onboardingData.cv_name}</span>
          </div>
              )}
              {onboardingData?.cv_location && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">{onboardingData.cv_location}</span>
          </div>
          )}
              {onboardingData?.cv_experience && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Experience:</span>
                  <span className="font-medium">{onboardingData.cv_experience}</span>
        </div>
              )}
            </CardContent>
          </Card>

          {/* Target Roles */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-green-600" />
                Target Roles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {onboardingData?.cv_ai_suggested_roles?.slice(0, 3).map((role: string, index: number) => (
                  <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                    {role}
            </Badge>
          ))}
                {onboardingData?.cv_ai_suggested_roles?.length > 3 && (
                  <Badge variant="outline">+{onboardingData.cv_ai_suggested_roles.length - 3} more</Badge>
                )}
        </div>
      </CardContent>
    </Card>

          {/* Job Preferences */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                Job Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {onboardingData?.preferred_locations && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Locations:</span>
                  <span className="font-medium">{onboardingData.preferred_locations.join(', ')}</span>
              </div>
              )}
              {onboardingData?.salary_min && onboardingData?.salary_max && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Salary Range:</span>
                  <span className="font-medium">${onboardingData.salary_min.toLocaleString()} - ${onboardingData.salary_max.toLocaleString()}</span>
              </div>
              )}
              {onboardingData?.job_type && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Job Type:</span>
                  <span className="font-medium">{onboardingData.job_type}</span>
            </div>
              )}
            </CardContent>
              </Card>
            </div>
            
        {/* Success Message */}
        <div className="mt-8">
          <Card className="border-0 shadow-lg bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                  <h3 className="text-lg font-semibold text-green-800">Onboarding Complete!</h3>
                  <p className="text-green-700">
                    Your profile has been successfully created and all your information has been saved. 
                    You&apos;re now ready to start your job search journey with JobMeter!
                  </p>
                  </div>
                </div>
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}