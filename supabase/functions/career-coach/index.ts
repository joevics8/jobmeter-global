// Supabase Edge Function: Career Coach
// Analyzes user profile and generates personalized career guidance

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

interface RequestBody {
  userId: string;
}

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Call Gemini API with retry logic and model fallback
async function callGeminiAPI(prompt: string, apiKey: string): Promise<any> {
  const models = ['gemini-2.0-flash-lite', 'gemini-2.0-flash', 'gemini-1.5-flash'];
  
  for (const model of models) {
    try {
      const url = `${GEMINI_API_URL}/${model}:generateContent?key=${apiKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Model ${model} failed:`, errorText);
        if (response.status === 429 || response.status >= 500) {
          continue;
        }
        throw new Error(`Gemini API error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      if (text) {
        return text;
      }
    } catch (error) {
      console.error(`Error with model ${model}:`, error);
      if (model === models[models.length - 1]) {
        throw error;
      }
    }
  }

  throw new Error('All Gemini models failed');
}

const CAREER_COACH_SYSTEM_PROMPT = `You are an expert career coach and professional development advisor. Analyze the user's profile and provide comprehensive career guidance.

Your response must be valid JSON only, matching this exact structure:

{
  "personalizedPaths": [
    {
      "title": "Career path title",
      "description": "Brief description of this career path",
      "timeframe": "e.g., '6-12 months' or '2-3 years'",
      "steps": [
        "Step 1 description",
        "Step 2 description",
        "Step 3 description"
      ],
      "requiredSkills": ["skill1", "skill2", "skill3"],
      "potentialRoles": ["Role 1", "Role 2"],
      "salaryRange": "e.g., '$60,000 - $90,000'"
    }
  ],
  "skillGaps": [
    {
      "skill": "Skill name",
      "priority": "high" | "medium" | "low",
      "currentLevel": "Description of current level",
      "targetLevel": "Description of target level",
      "resources": [
        "Resource 1 (e.g., specific course, book, certification)",
        "Resource 2"
      ],
      "learningPath": [
        "Step 1 to learn this skill",
        "Step 2 to learn this skill"
      ],
      "estimatedTime": "e.g., '2-3 months'"
    }
  ],
  "insights": {
    "opportunities": [
      "Opportunity 1",
      "Opportunity 2"
    ],
    "warnings": [
      "Warning or risk 1",
      "Warning or risk 2"
    ],
    "tips": [
      "Tip 1",
      "Tip 2"
    ]
  },
  "marketInsights": {
    "industryTrends": [
      "Trend 1",
      "Trend 2"
    ],
    "jobGrowth": "Description of job growth in relevant fields",
    "salaryExpectations": "Description of salary expectations and ranges",
    "demandSkills": ["Skill 1", "Skill 2", "Skill 3"]
  }
}

Important:
- Return ONLY valid JSON, no markdown formatting, no code blocks
- Provide 2-3 personalized career paths based on the user's profile
- Identify 5-8 skill gaps with priorities
- Give actionable, specific insights
- Base market insights on current industry data
- Make recommendations realistic and achievable`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Use service role for database access from Edge Functions
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { userId }: RequestBody = await req.json();
    console.log('Received userId:', userId);

    if (!userId) {
      console.error('userId is required');
      return new Response(
        JSON.stringify({ error: 'userId is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Fetch user onboarding data
    console.log('Fetching onboarding data for user:', userId);
    const { data: onboardingData, error: onboardingError } = await supabaseClient
      .from('onboarding_data')
      .select('*')
      .eq('user_id', userId)
      .single();

    console.log('Onboarding data fetch result:', { data: !!onboardingData, error: onboardingError });

    if (onboardingError || !onboardingData) {
      return new Response(
        JSON.stringify({ error: 'User profile not found. Please complete your profile first.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Fetch user profile data
    const { data: profileData, error: profileError } = await supabaseClient
      .from('profiles')
      .select('full_name, email')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching profile data:', profileError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user profile data.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Build user profile summary
    const userProfileSummary = `
User Profile Summary:
- Name: ${profileData?.full_name || 'Not provided'}
- Target Roles: ${Array.isArray(onboardingData.target_roles) ? onboardingData.target_roles.join(', ') : onboardingData.target_roles || 'Not specified'}
- Experience Level: ${onboardingData.experience_level || 'Not specified'}
- Current Skills: ${Array.isArray(onboardingData.cv_skills) ? onboardingData.cv_skills.join(', ') : onboardingData.cv_skills || 'Not specified'}
- Preferred Locations: ${Array.isArray(onboardingData.preferred_locations) ? onboardingData.preferred_locations.join(', ') : onboardingData.preferred_locations || 'Not specified'}
- Salary Range: ${onboardingData.salary_min ? `$${onboardingData.salary_min}` : ''}${onboardingData.salary_min && onboardingData.salary_max ? ' - ' : ''}${onboardingData.salary_max ? `$${onboardingData.salary_max}` : 'Not specified'}
- Job Type: ${onboardingData.job_type || 'Not specified'}
- Sector: ${onboardingData.sector || 'Not specified'}

${onboardingData.cv_roles ? `Work Experience Roles: ${Array.isArray(onboardingData.cv_roles) ? onboardingData.cv_roles.join(', ') : onboardingData.cv_roles}` : ''}
${onboardingData.cv_summary ? `Professional Summary: ${onboardingData.cv_summary}` : ''}
${onboardingData.cv_work_experience ? `Work Experience: ${typeof onboardingData.cv_work_experience === 'string' ? onboardingData.cv_work_experience : JSON.stringify(onboardingData.cv_work_experience)}` : ''}
${onboardingData.cv_education ? `Education: ${typeof onboardingData.cv_education === 'string' ? onboardingData.cv_education : JSON.stringify(onboardingData.cv_education)}` : ''}
`;

    // Construct prompt
    const prompt = `${CAREER_COACH_SYSTEM_PROMPT}

${userProfileSummary}

Analyze this user's profile and provide comprehensive career guidance.`;

    // Get API key
    const apiKey = Deno.env.get('GEMINI_API_KEY_CV') || Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Call Gemini
    console.log('Calling Gemini API for career coach analysis...');
    console.log('API Key available:', !!apiKey);
    console.log('Prompt length:', prompt.length);

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'AI service configuration error.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const responseText = await callGeminiAPI(prompt, apiKey);

    // Parse JSON response
    let analysisResult;
    try {
      // Extract JSON from response (handle potential markdown formatting)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        analysisResult = JSON.parse(responseText);
      }
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      console.error('Response text:', responseText);
      throw new Error('Failed to parse career analysis response');
    }

    // Validate structure
    if (!analysisResult.personalizedPaths || !analysisResult.skillGaps || !analysisResult.insights || !analysisResult.marketInsights) {
      console.error('Invalid response structure:', analysisResult);
      throw new Error('Invalid career analysis structure received');
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: analysisResult,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error in career coach function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to generate career analysis',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});



