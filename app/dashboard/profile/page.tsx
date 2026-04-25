'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { cleanText, cleanArray } from '@/lib/clean';

export default function JobseekerProfileTest() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    loadProfile(supabase);
  }, []);

  const loadProfile = async (supabase: any) => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError) {
        console.error('Auth error:', authError);
        setError('Authentication error: ' + authError.message);
        setLoading(false);
        return;
      }

      if (!user) {
        setError("You are not signed in.\n\nPlease go to the login page and sign in first.");
        setLoading(false);
        return;
      }

      setUserId(user.id);
      console.log('✅ Logged in user ID:', user.id);

      const { data, error: fetchError } = await supabase
        .from('jobseeker_dashboard_profile')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          setError("No onboarding data found for this user.\n\nPlease complete your onboarding first.");
        } else {
          setError("Failed to load profile: " + fetchError.message);
        }
        setLoading(false);
        return;
      }

      const cleaned = {
        ...data,
        cv_summary: cleanText(data?.cv_summary),
        cv_roles: cleanArray(data?.cv_roles),
        cv_skills: cleanArray(data?.cv_skills),
        target_roles: cleanArray(data?.target_roles),
        preferred_locations: cleanArray(data?.preferred_locations),
        cv_name: cleanText(data?.cv_name || data?.full_name),
      };

      setProfile(cleaned);
      console.log('✅ Profile loaded successfully');

    } catch (err: any) {
      console.error('Unexpected error:', err);
      setError(err.message || "Unexpected error loading profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-lg">Loading your profile...</div>;
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Not Ready Yet</h2>
        <pre className="whitespace-pre-wrap text-left bg-gray-100 p-6 rounded-lg text-sm mb-6">
          {error}
        </pre>
        <button 
          onClick={() => window.location.href = '/login'} 
          className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
        >
          Go to Login Page
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">Jobseeker Dashboard</h1>
      <p className="text-gray-600 mb-8">Welcome back, {profile.cv_name || 'User'}</p>

      {/* Rest of your nice display UI here (same as before) */}
      <div className="bg-white shadow rounded-2xl p-8 space-y-10">
        {/* ... your previous success UI ... */}
        <div>
          <h2 className="text-2xl font-semibold mb-2">{profile.cv_name}</h2>
          <p className="text-gray-600">{profile.email}</p>
        </div>

        {profile.cv_summary && (
          <div>
            <h3 className="font-semibold mb-3">Professional Summary</h3>
            <p className="text-gray-700 leading-relaxed">{profile.cv_summary}</p>
          </div>
        )}

        {/* Skills and Target Roles sections ... */}
      </div>
    </div>
  );
}