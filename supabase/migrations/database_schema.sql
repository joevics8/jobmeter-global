-- JobPilot Onboarding Database Schema
-- Run this SQL in your Supabase SQL editor

-- Enable Row Level Security (RLS)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret-here';

-- Create custom types
CREATE TYPE experience_level AS ENUM ('0-1 years', '1-3 years', '3-5 years', '5-8 years', '8+ years');
CREATE TYPE job_type AS ENUM ('Full-time', 'Part-time', 'Contract', 'Freelance');
CREATE TYPE remote_preference AS ENUM ('Remote only', 'Remote OK', 'Hybrid', 'On-site only');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CV Data table
CREATE TABLE public.cv_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    cv_text TEXT,
    extracted_name TEXT,
    extracted_email TEXT,
    extracted_phone TEXT,
    extracted_location TEXT,
    extracted_summary TEXT,
    extracted_skills TEXT[],
    extracted_work_experience JSONB,
    extracted_education JSONB,
    extracted_projects JSONB,
    extracted_accomplishments TEXT[],
    extracted_awards TEXT[],
    extracted_certifications TEXT[],
    extracted_languages TEXT[],
    extracted_interests TEXT[],
    extracted_linkedin TEXT,
    extracted_github TEXT,
    extracted_portfolio TEXT,
    extracted_publications JSONB,
    extracted_volunteer_work JSONB,
    extracted_additional_sections JSONB,
    ai_suggested_roles TEXT[],
    cv_file_url TEXT,
    cv_file_name TEXT,
    cv_file_size BIGINT,
    cv_file_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Role Selections table
CREATE TABLE public.role_selections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    cv_role_id UUID REFERENCES public.cv_data(id) ON DELETE CASCADE,
    role_name TEXT NOT NULL,
    is_cv_role BOOLEAN DEFAULT false, -- true if from CV, false if AI suggested
    is_selected BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Preferences table
CREATE TABLE public.user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    preferred_locations TEXT[],
    salary_min INTEGER,
    salary_max INTEGER,
    experience_level experience_level,
    job_type job_type,
    remote_preference remote_preference,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Onboarding Progress table
CREATE TABLE public.onboarding_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    step_1_completed BOOLEAN DEFAULT false, -- CV Upload & Analysis
    step_2_completed BOOLEAN DEFAULT false, -- Role Selection
    step_3_completed BOOLEAN DEFAULT false, -- Preferences
    step_4_completed BOOLEAN DEFAULT false, -- Authentication
    current_step INTEGER DEFAULT 1,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_cv_data_user_id ON public.cv_data(user_id);
CREATE INDEX idx_role_selections_user_id ON public.role_selections(user_id);
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX idx_onboarding_progress_user_id ON public.onboarding_progress(user_id);
CREATE INDEX idx_cv_data_created_at ON public.cv_data(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- CV Data policies
CREATE POLICY "Users can view own CV data" ON public.cv_data
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own CV data" ON public.cv_data
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own CV data" ON public.cv_data
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own CV data" ON public.cv_data
    FOR DELETE USING (auth.uid() = user_id);

-- Role Selections policies
CREATE POLICY "Users can view own role selections" ON public.role_selections
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own role selections" ON public.role_selections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own role selections" ON public.role_selections
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own role selections" ON public.role_selections
    FOR DELETE USING (auth.uid() = user_id);

-- User Preferences policies
CREATE POLICY "Users can view own preferences" ON public.user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON public.user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON public.user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences" ON public.user_preferences
    FOR DELETE USING (auth.uid() = user_id);

-- Onboarding Progress policies
CREATE POLICY "Users can view own onboarding progress" ON public.onboarding_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding progress" ON public.onboarding_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding progress" ON public.onboarding_progress
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own onboarding progress" ON public.onboarding_progress
    FOR DELETE USING (auth.uid() = user_id);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON public.user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cv_data_updated_at 
    BEFORE UPDATE ON public.cv_data 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at 
    BEFORE UPDATE ON public.user_preferences 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_progress_updated_at 
    BEFORE UPDATE ON public.onboarding_progress 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional - for testing)
-- INSERT INTO public.user_profiles (id, email, full_name) VALUES 
-- (gen_random_uuid(), 'test@example.com', 'Test User');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;





