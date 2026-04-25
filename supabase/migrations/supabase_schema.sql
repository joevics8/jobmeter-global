-- JobPilot Onboarding Schema
-- This file contains the essential tables for the onboarding functionality 

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Onboarding data table
CREATE TABLE IF NOT EXISTS public.onboarding_data (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- CV extracted data
    cv_name TEXT,
    cv_email TEXT,
    cv_phone TEXT,
    cv_location TEXT,
    cv_summary TEXT,
    cv_roles TEXT[],
    cv_skills TEXT[],
    cv_experience TEXT,
    cv_work_experience JSONB,
    cv_education JSONB,
    cv_projects JSONB,
    cv_accomplishments TEXT[],
    cv_awards TEXT[],
    cv_certifications TEXT[],
    cv_languages TEXT[],
    cv_interests TEXT[],
    cv_linkedin TEXT,
    cv_github TEXT,
    cv_portfolio TEXT,
    cv_publications TEXT[],
    cv_volunteer_work JSONB,
    cv_additional_sections JSONB,
    cv_ai_suggested_roles TEXT[],
    
    -- User preferences
    preferred_locations TEXT[],
    salary_min INTEGER,
    salary_max INTEGER,
    experience_level TEXT,
    job_type TEXT,
    remote_preference TEXT,
    
    -- Metadata
    cv_text TEXT,
    cv_file_name TEXT,
    cv_file_type TEXT,
    cv_file_size INTEGER,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job preferences table
CREATE TABLE IF NOT EXISTS public.job_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    target_roles TEXT[],
    preferred_locations TEXT[],
    salary_min INTEGER,
    salary_max INTEGER,
    experience_level TEXT,
    job_type TEXT,
    remote_preference TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_onboarding_data_user_id ON public.onboarding_data(user_id);
CREATE INDEX IF NOT EXISTS idx_job_preferences_user_id ON public.job_preferences(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_onboarding_data_updated_at BEFORE UPDATE ON public.onboarding_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_preferences_updated_at BEFORE UPDATE ON public.job_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Basic Row Level Security (RLS) - users can only access their own data
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_preferences ENABLE ROW LEVEL SECURITY;

-- Simple policies - users can only access their own data
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own onboarding data" ON public.onboarding_data FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own onboarding data" ON public.onboarding_data FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own onboarding data" ON public.onboarding_data FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own job preferences" ON public.job_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own job preferences" ON public.job_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own job preferences" ON public.job_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
