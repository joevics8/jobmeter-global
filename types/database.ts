// Database Types for JobPilot Onboarding
// These types match the Supabase database schema

export type ExperienceLevel = '0-1 years' | '1-3 years' | '3-5 years' | '5-8 years' | '8+ years';
export type JobType = 'Full-time' | 'Part-time' | 'Contract' | 'Freelance';
export type RemotePreference = 'Remote only' | 'Remote OK' | 'Hybrid' | 'On-site only';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CVData {
  id: string;
  user_id: string;
  cv_text?: string;
  extracted_name?: string;
  extracted_email?: string;
  extracted_phone?: string;
  extracted_location?: string;
  extracted_summary?: string;
  extracted_skills?: string[];
  extracted_work_experience?: WorkExperience[];
  extracted_education?: Education[];
  extracted_projects?: Project[];
  extracted_accomplishments?: string[];
  extracted_awards?: string[];
  extracted_certifications?: string[];
  extracted_languages?: string[];
  extracted_interests?: string[];
  extracted_linkedin?: string;
  extracted_github?: string;
  extracted_portfolio?: string;
  extracted_publications?: Publication[];
  extracted_volunteer_work?: VolunteerWork[];
  extracted_additional_sections?: AdditionalSection[];
  ai_suggested_roles?: string[];
  cv_file_url?: string;
  cv_file_name?: string;
  cv_file_size?: number;
  cv_file_type?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkExperience {
  title: string;
  company: string;
  duration: string;
  description: string;
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  url?: string;
}

export interface Publication {
  title: string;
  journal?: string;
  year?: string;
  url?: string;
}

export interface VolunteerWork {
  organization: string;
  role: string;
  duration: string;
  description: string;
}

export interface AdditionalSection {
  sectionName: string;
  content: string;
}

export interface RoleSelection {
  id: string;
  user_id: string;
  cv_role_id?: string;
  role_name: string;
  is_cv_role: boolean;
  is_selected: boolean;
  created_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  preferred_locations?: string[];
  salary_min?: number;
  salary_max?: number;
  experience_level?: ExperienceLevel;
  job_type?: JobType;
  remote_preference?: RemotePreference;
  created_at: string;
  updated_at: string;
}

export interface OnboardingProgress {
  id: string;
  user_id: string;
  step_1_completed: boolean;
  step_2_completed: boolean;
  step_3_completed: boolean;
  step_4_completed: boolean;
  current_step: number;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

// Combined onboarding data for the frontend
export interface OnboardingData {
  cvData: Partial<CVData>;
  selectedRoles: string[];
  preferences: Partial<UserPreferences>;
}

// Database table names
export const TABLES = {
  USER_PROFILES: 'user_profiles',
  CV_DATA: 'cv_data',
  ROLE_SELECTIONS: 'role_selections',
  USER_PREFERENCES: 'user_preferences',
  ONBOARDING_PROGRESS: 'onboarding_progress'
} as const;

// Row Level Security (RLS) policies
export const RLS_POLICIES = {
  USER_PROFILES: {
    SELECT: 'Users can view own profile',
    UPDATE: 'Users can update own profile',
    INSERT: 'Users can insert own profile'
  },
  CV_DATA: {
    SELECT: 'Users can view own CV data',
    UPDATE: 'Users can update own CV data',
    INSERT: 'Users can insert own CV data',
    DELETE: 'Users can delete own CV data'
  },
  ROLE_SELECTIONS: {
    SELECT: 'Users can view own role selections',
    UPDATE: 'Users can update own role selections',
    INSERT: 'Users can insert own role selections',
    DELETE: 'Users can delete own role selections'
  },
  USER_PREFERENCES: {
    SELECT: 'Users can view own preferences',
    UPDATE: 'Users can update own preferences',
    INSERT: 'Users can insert own preferences',
    DELETE: 'Users can delete own preferences'
  },
  ONBOARDING_PROGRESS: {
    SELECT: 'Users can view own onboarding progress',
    UPDATE: 'Users can update own onboarding progress',
    INSERT: 'Users can insert own onboarding progress',
    DELETE: 'Users can delete own onboarding progress'
  }
} as const;













