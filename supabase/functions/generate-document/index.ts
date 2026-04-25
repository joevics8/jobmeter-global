// Supabase Edge Function for CV and Cover Letter generation
// Handles data fetching, prompt construction, and Gemini API calls

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  type: 'cv' | 'cover-letter';
  userId: string;
  // Job selection - either jobId OR jobPastedText (not both)
  jobId?: string;
  jobPastedText?: string;
  // Cover letter specific - either cvId OR cvPastedText (not both)
  cvId?: string;
  cvPastedText?: string;
  // Template and format
  templateId?: string; // Defaults to 'template-1'
  coverLetterFormat?: 'document' | 'email';
}

const CV_SYSTEM_PROMPT = `You are an expert CV writer. Create a professional, tailored CV that:
1. Fits EXACTLY on ONE A4 page (210mm x 297mm) - this is CRITICAL
2. Is tailored specifically to the target job description
3. Uses ONLY real information from the user's profile data - NO fabricated data, NO placeholder text, NO "N/A" values
4. Has a compelling professional summary (3-4 sentences) that matches the job
5. Highlights relevant experience and skills for the target role
6. Uses clear, professional formatting

CRITICAL RULES:
- ONLY include sections/fields that have actual data in the user's profile. If a field is missing or empty in the profile, do NOT include it in the output.
- For cv_roles: Rewrite the existing roles slightly to better match the job requirements. Do NOT create new roles that don't exist in the user's profile.
- For work experience: Keep the SAME job titles, companies, and dates. Only REWRITE the bullet points/responsibilities to emphasize aspects that relate to the target job. Do NOT create new work experiences.
- For skills: Select the TOP 15 most relevant skills from the user's cv_skills array. Prioritize skills that match keywords and requirements in the job description.
- Include ALL available sections: projects, accomplishments, awards, certifications, languages, interests, publications, volunteer work, additional sections (only if data exists in profile).

CRITICAL PAGE LIMIT: The CV MUST fit on exactly ONE page. Be concise and selective with content.`;

const COVER_LETTER_SYSTEM_PROMPT = `You are an expert cover letter writer. Create a professional, tailored cover letter that:
1. Fits EXACTLY on ONE A4 page (210mm x 297mm) - this is CRITICAL
2. Is tailored specifically to the target job description
3. References specific experiences and achievements from the CV
4. Demonstrates genuine interest in the role and company
5. Uses professional, engaging language
6. Has a clear structure: opening, 3 body paragraphs, optional bullet highlights, closing
7. ALWAYS includes an opening paragraph
8. NO placeholder text, NO generic statements, NO "N/A" values

BULLET HIGHLIGHTS:
- Include a "highlights" array (2-3 bullet points) ONLY if the user has substantial relevant experience that benefits from bullet-point emphasis
- If the user has limited experience or the body paragraphs already cover everything well, omit the highlights array
- When included, highlight key achievements, relevant skills, or standout qualifications
- Keep bullet points concise and impactful

CRITICAL PAGE LIMIT: The cover letter MUST fit on exactly ONE page. Be concise and focused.`;

async function callGeminiAPI(prompt: string, model: string = 'gemini-2.5-flash-lite'): Promise<string> {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  const models = [
    'gemini-2.5-flash-lite',
    'gemini-1.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-pro'
  ];

  for (const modelName of models) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 15000,
            }
          }),
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.text();
        console.log(`Model ${modelName} failed: ${response.status}, error: ${errorData}`);
        if (response.status === 429) {
          continue; // Try next model
        }
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      if (text) {
        return text;
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log(`Timeout on ${modelName}, trying next model...`);
        continue;
      }
      if (error.message.includes('429')) {
        console.log(`Rate limited on ${modelName}, trying next model...`);
        continue;
      }
      console.error(`Error with model ${modelName}:`, error);
      if (modelName === models[models.length - 1]) {
        throw error; // Re-throw if last model
      }
    }
  }

  throw new Error('All Gemini models failed');
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { type, userId, jobId, jobPastedText, cvId, cvPastedText, templateId, coverLetterFormat }: RequestBody = await req.json();

    // Validate inputs
    if (!type || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: type, userId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!jobId && !jobPastedText) {
      return new Response(
        JSON.stringify({ error: 'Either jobId or jobPastedText must be provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (type === 'cover-letter' && !cvId && !cvPastedText) {
      return new Response(
        JSON.stringify({ error: 'Cover letter requires either cvId or cvPastedText' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Fetch user onboarding data
    const { data: onboardingData, error: onboardingError } = await supabaseClient
      .from('onboarding_data')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (onboardingError && onboardingError.code !== 'PGRST116') {
      console.error('Error fetching onboarding data:', onboardingError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user profile data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!onboardingData) {
      return new Response(
        JSON.stringify({ error: 'User profile data not found. Please complete onboarding.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Fetch job details if jobId provided
    let jobDescription = jobPastedText || '';
    if (jobId && !jobPastedText) {
      const { data: jobData, error: jobError } = await supabaseClient
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (jobError) {
        console.error('Error fetching job:', jobError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch job details' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!jobData) {
        return new Response(
          JSON.stringify({ error: 'Job not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Construct job description from job data
      jobDescription = `Job Title: ${jobData.title || 'N/A'}
Company: ${typeof jobData.company === 'string' ? jobData.company : jobData.company?.name || 'N/A'}
Location: ${typeof jobData.location === 'string' ? jobData.location : JSON.stringify(jobData.location)}
Description: ${jobData.description || ''}
Requirements: ${jobData.requirements || ''}
Skills Required: ${Array.isArray(jobData.skills_required) ? jobData.skills_required.join(', ') : jobData.skills_required || ''}
Experience Level: ${jobData.experience_level || 'N/A'}
Employment Type: ${jobData.employment_type || 'N/A'}`;
    }

    // 3. Fetch CV data if needed for cover letter
    let cvData: any = null;
    if (type === 'cover-letter') {
      if (cvPastedText) {
        try {
          // Try to parse as JSON (structured CV data)
          cvData = JSON.parse(cvPastedText);
        } catch {
          // If not JSON, treat as plain text CV content
          cvData = { rawContent: cvPastedText };
        }
      } else if (cvId) {
        // If cvId is provided but no cvPastedText, this is an error
        // The client should pass cvPastedText with the structured data
        return new Response(
          JSON.stringify({ error: 'cvPastedText is required. Please provide CV structured data as JSON string.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // 4. Construct prompt based on type
    let prompt = '';
    
    if (type === 'cv') {
      prompt = `**TARGET JOB DESCRIPTION (PRIMARY REFERENCE - TAILOR ALL CONTENT TO THIS)**:
${jobDescription}

**USER PROFILE DATA**:
${JSON.stringify(onboardingData, null, 2)}

${CV_SYSTEM_PROMPT}

**OUTPUT FORMAT**:
Return ONLY a valid JSON object. IMPORTANT: Only include fields/sections that have actual data in the user's profile. Omit any fields that don't exist in the profile.

Example structure (include only fields that have data):
{
  "personalDetails": {
    "name": "string (from cv_name)",
    "title": "string (professional title tailored to job, based on cv_roles)",
    "email": "string (from cv_email)",
    "phone": "string (from cv_phone)",
    "location": "string (from cv_location)",
    "linkedin": "string (omit if cv_linkedin not in profile)",
    "github": "string (omit if cv_github not in profile)",
    "portfolio": "string (omit if cv_portfolio not in profile)"
  },
  "summary": "string (from cv_summary, 3-4 sentences, tailored to job)",
  "roles": ["string"] (include ONLY if cv_roles exists - rewrite slightly to match job, do NOT create new roles),
  "skills": ["string"] (top 15 most relevant from cv_skills, prioritized by job requirements),
  "experience": [
    {
      "role": "string (from cv_work_experience, keep same role)",
      "company": "string (from cv_work_experience, keep same company)",
      "years": "string (from cv_work_experience, keep same dates)",
      "bullets": ["string"] (rewrite responsibilities to relate to job, 2-4 bullets)
    }
  ] (include ONLY if cv_work_experience exists),
  "education": [
    {
      "degree": "string",
      "institution": "string",
      "years": "string"
    }
  ] (include ONLY if cv_education exists),
  "projects": [
    {
      "title": "string",
      "description": "string"
    }
  ] (include ONLY if cv_projects exists),
  "accomplishments": ["string"] (include ONLY if cv_accomplishments exists),
  "awards": ["string"] (include ONLY if cv_awards exists),
  "certifications": ["string"] (include ONLY if cv_certifications exists),
  "languages": ["string"] (include ONLY if cv_languages exists),
  "interests": ["string"] (include ONLY if cv_interests exists),
  "publications": [
    {
      "title": "string",
      "venue": "string"
    }
  ] (include ONLY if cv_publications exists),
  "volunteerWork": [
    {
      "organization": "string",
      "role": "string",
      "period": "string"
    }
  ] (include ONLY if cv_volunteer_work exists),
  "additionalSections": ["string"] or {} (include ONLY if cv_additional_sections exists)
}

CRITICAL RULES:
- ONLY include sections with actual data - do not create placeholder or empty arrays
- For roles: Rewrite existing cv_roles slightly to match job. Do NOT create new roles.
- For experience: Keep same roles/companies/dates from cv_work_experience. Only rewrite bullet points to relate to job.
- For skills: Select top 15 most relevant from cv_skills, prioritizing job-matching skills
- Keep content concise to fit ONE page
- Summary: 3-4 sentences maximum
- Experience bullets: 2-4 per role, concise and impactful

Return ONLY the JSON object, no markdown, no explanations.`;
    } else {
      // Cover letter
      const formatInstructions = coverLetterFormat === 'email' 
        ? 'Format as an EMAIL (no addresses, include subject line, email-style greeting and closing)'
        : 'Format as a DOCUMENT (include addresses, formal letter format)';

      prompt = `**TARGET JOB DESCRIPTION**:
${jobDescription}

**USER PROFILE DATA**:
${JSON.stringify(onboardingData, null, 2)}

**CV DATA** (for reference):
${cvData ? JSON.stringify(cvData, null, 2) : 'CV data not provided'}

${COVER_LETTER_SYSTEM_PROMPT}

${formatInstructions}

**OUTPUT FORMAT**:
Return ONLY a valid JSON object matching this exact structure:

{
  "personalInfo": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "address": "string (for document format only, omit for email)",
    "location": "string"
  },
  "recipientInfo": {
    "name": "string (omit if unknown)",
    "title": "string (omit if unknown)",
    "company": "string",
    "address": "string (for document format only, omit for email)"
  },
  "subject": "string (for email format only, omit for document format)",
  "opening": "string (REQUIRED - always include)",
  "body1": "string",
  "body2": "string",
  "body3": "string",
  "highlights": ["string"] (OPTIONAL - include 2-3 bullet points ONLY if user has substantial relevant experience that benefits from bullet emphasis. If not needed, omit this field entirely),
  "closing": "string",
  "signoff": "string",
  "meta": {
    "jobTitle": "string",
    "company": "string",
    "date": "string"
  }
}

CRITICAL INSTRUCTIONS:
- ALWAYS include an opening paragraph - this is REQUIRED
- Include exactly 3 body paragraphs (body1, body2, body3)
- For highlights field: 
  * Include 2-3 bullet points ONLY if the user has substantial relevant experience that would benefit from bullet-point emphasis
  * If body paragraphs already cover everything well, OMIT the highlights field entirely (do not include empty array)
  * When included, highlight key achievements, relevant skills, or standout qualifications
- Keep content concise to fit ONE page
- Reference specific experiences from CV
- Show genuine interest in the role
- For email format: include subject, use email greeting (Hi/Hello), no addresses, omit address fields
- For document format: include addresses, use formal greeting (Dear Mr./Ms.), include address fields

Return ONLY the JSON object, no markdown, no explanations.`;
    }

    // 5. Call Gemini API
    const responseText = await callGeminiAPI(prompt);

    // 6. Parse and clean response
    let jsonText = responseText
      .replace(/^```json\s*/g, '')
      .replace(/^```\s*/g, '')
      .replace(/```\s*$/g, '')
      .trim();

    // 7. Parse JSON
    let structuredData: any;
    try {
      structuredData = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Response text:', jsonText.substring(0, 500));
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI response as JSON' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 8. Return structured data
    return new Response(
      JSON.stringify({
        success: true,
        data: structuredData,
        type: type,
        templateId: templateId || 'template-1',
        format: coverLetterFormat || null,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in generate-document:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

