import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Only validate and warn on client-side to avoid breaking server-side imports
if (typeof window !== 'undefined') {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      '❌ Missing Supabase environment variables.\n' +
      `URL: ${supabaseUrl ? '✅' : '❌ Missing'}\n` +
      `Anon Key: ${supabaseAnonKey ? '✅' : '❌ Missing'}\n` +
      'Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file and restart your dev server.'
    )
  }
}

// Create Supabase client
// flowType: 'implicit' is required because the server-side callback (createServerClient)
// reads from cookies, while 'pkce' stores the verifier in localStorage — they never match.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: true,
    detectSessionInUrl: true, // Must be true so the client picks up the session from the URL hash on redirect
    flowType: 'implicit',     // ✅ Fixed: was 'pkce' which caused AuthPKCECodeVerifierMissingError
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'supabase.auth.token',
    debug: false
  },
  global: {
    headers: {
      'x-client-info': 'jobmeter-web'
    }
  }
})

// Create Supabase admin client for server-side operations (only available server-side)
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
export const supabaseAdmin = typeof window === 'undefined' && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase // Fallback to regular client on client-side

// Suppress console errors for failed token refresh attempts
if (typeof window !== 'undefined') {
  const originalError = console.error
  console.error = (...args: any[]) => {
    const errorString = args.join(' ')
    if (
      errorString.includes('refresh_token') ||
      errorString.includes('ERR_NAME_NOT_RESOLVED') ||
      errorString.includes('Failed to fetch') ||
      (errorString.includes('auth/v1/token') && errorString.includes('grant_type=refresh_token'))
    ) {
      return
    }
    originalError.apply(console, args)
  }
}

// Types for our database tables
export interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  phone?: string
  location?: string
  created_at: string
  updated_at: string
}

export interface OnboardingData {
  id: string
  user_id: string
  cv_name?: string
  cv_email?: string
  cv_phone?: string
  cv_location?: string
  cv_summary?: string
  cv_roles?: string[]
  cv_skills?: string[]
  cv_experience?: string
  cv_work_experience?: any
  cv_education?: any
  cv_projects?: any
  cv_accomplishments?: string[]
  cv_awards?: string[]
  cv_certifications?: string[]
  cv_languages?: string[]
  cv_interests?: string[]
  cv_linkedin?: string
  cv_github?: string
  cv_portfolio?: string
  cv_publications?: string[]
  cv_volunteer_work?: any
  cv_additional_sections?: any
  cv_ai_suggested_roles?: string[]
  preferred_locations?: string[]
  salary_min?: number
  salary_max?: number
  experience_level?: string
  job_type?: string
  remote_preference?: string
  cv_text?: string
  cv_file_name?: string
  cv_file_type?: string
  cv_file_size?: number
  completed_at: string
  created_at: string
  updated_at: string
}

export interface JobApplication {
  id: string
  user_id: string
  job_title: string
  company_name: string
  job_description?: string
  application_status: 'applied' | 'interviewing' | 'offered' | 'rejected' | 'withdrawn'
  applied_date: string
  interview_date?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface JobPreferences {
  id: string
  user_id: string
  target_roles?: string[]
  preferred_locations?: string[]
  salary_min?: number
  salary_max?: number
  experience_level?: string
  job_type?: string
  remote_preference?: string
  industry_preferences?: string[]
  company_size_preferences?: string[]
  created_at: string
  updated_at: string
}

export interface Job {
  id: string
  title: string
  company: string
  location?: string
  salary_min?: number
  salary_max?: number
  salary_currency?: string
  job_type?: string
  remote?: boolean
  description?: string
  requirements?: string[]
  skills?: string[]
  experience_level?: string
  source?: string
  source_url?: string
  posted_date?: string
  expires_date?: string
  status?: 'active' | 'expired' | 'cancelled'
  duplicate_hash?: string
  created_at?: string
  updated_at?: string
}

export interface JobSource {
  id: string
  name: string
  type: 'rss' | 'grounding' | 'scraping' | 'manual'
  url?: string
  is_active?: boolean
  last_fetched?: string
  fetch_frequency?: number
  total_jobs_fetched?: number
  active_jobs_count?: number
  created_at: string
}

export interface GroundingSearch {
  id: string
  query: string
  role_category?: string
  location?: string
  jobs_found?: number
  status?: 'pending' | 'completed' | 'failed'
  error_message?: string
  created_at: string
  completed_at?: string
}