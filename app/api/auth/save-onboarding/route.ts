import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { user, onboardingData } = await request.json()

    if (!user || !onboardingData) {
      return NextResponse.json(
        { error: 'Missing user or onboarding data' },
        { status: 400 }
      )
    }

    // First, create or update the user profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        full_name: onboardingData.cv_name || user.user_metadata?.full_name,
        phone: onboardingData.cv_phone,
        location: onboardingData.cv_location,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (profileError) {
      console.error('Profile creation error:', profileError)
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      )
    }

    // Save onboarding data
    const { data: onboardingResult, error: onboardingError } = await supabase
      .from('onboarding_data')
      .insert({
        user_id: user.id,
        cv_name: onboardingData.cv_name,
        cv_email: onboardingData.cv_email,
        cv_phone: onboardingData.cv_phone,
        cv_location: onboardingData.cv_location,
        cv_summary: onboardingData.cv_summary,
        cv_roles: onboardingData.cv_roles,
        cv_skills: onboardingData.cv_skills,
        cv_experience: onboardingData.cv_experience,
        cv_work_experience: onboardingData.cv_work_experience,
        cv_education: onboardingData.cv_education,
        cv_projects: onboardingData.cv_projects,
        cv_accomplishments: onboardingData.cv_accomplishments,
        cv_awards: onboardingData.cv_awards,
        cv_certifications: onboardingData.cv_certifications,
        cv_languages: onboardingData.cv_languages,
        cv_interests: onboardingData.cv_interests,
        cv_linkedin: onboardingData.cv_linkedin,
        cv_github: onboardingData.cv_github,
        cv_portfolio: onboardingData.cv_portfolio,
        cv_publications: onboardingData.cv_publications,
        cv_volunteer_work: onboardingData.cv_volunteer_work,
        cv_additional_sections: onboardingData.cv_additional_sections,
        cv_ai_suggested_roles: onboardingData.cv_ai_suggested_roles,
        target_roles: onboardingData.target_roles, // Added to match mobile app and table schema
        preferred_locations: onboardingData.preferred_locations,
        salary_min: onboardingData.salary_min ? parseInt(onboardingData.salary_min) : null,
        salary_max: onboardingData.salary_max ? parseInt(onboardingData.salary_max) : null,
        experience_level: onboardingData.experience_level,
        job_type: onboardingData.job_type,
        remote_preference: onboardingData.remote_preference,
        sector: onboardingData.sector || null, // Added to match mobile app and table schema
        cv_text: onboardingData.cv_text,
        cv_file_name: onboardingData.cv_file_name,
        cv_file_type: onboardingData.cv_file_type,
        cv_file_size: onboardingData.cv_file_size ? parseInt(onboardingData.cv_file_size) : null,
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (onboardingError) {
      console.error('Onboarding data save error:', onboardingError)
      return NextResponse.json(
        { error: 'Failed to save onboarding data' },
        { status: 500 }
      )
    }

    // Save job preferences
    const { data: preferencesResult, error: preferencesError } = await supabase
      .from('job_preferences')
      .insert({
        user_id: user.id,
        target_roles: onboardingData.target_roles || onboardingData.cv_roles, // Use target_roles if available
        preferred_locations: onboardingData.preferred_locations,
        salary_min: onboardingData.salary_min ? parseInt(onboardingData.salary_min) : null,
        salary_max: onboardingData.salary_max ? parseInt(onboardingData.salary_max) : null,
        experience_level: onboardingData.experience_level,
        job_type: onboardingData.job_type,
        remote_preference: onboardingData.remote_preference,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (preferencesError) {
      console.error('Job preferences save error:', preferencesError)
      // Don't fail the entire request if preferences fail
      console.warn('Job preferences could not be saved, but onboarding data was saved')
    }

    return NextResponse.json({
      success: true,
      message: 'Onboarding data saved successfully',
      data: {
        profile: profileData,
        onboarding: onboardingResult,
        preferences: preferencesResult
      }
    })

  } catch (error) {
    console.error('Save onboarding error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
