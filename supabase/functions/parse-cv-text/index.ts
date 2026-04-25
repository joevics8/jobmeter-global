// Supabase Edge Function for parsing CV text
// Uses Gemini API to extract structured data from CV text

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  text: string;
}

interface ParsedProfile {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  skills: string[];
  workExperience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  suggestedRoles: string[];
  projects?: Array<{
    name: string;
    description: string;
    technologies?: string[];
    url?: string;
    duration?: string;
  }>;
  accomplishments?: string[];
  awards?: Array<{
    title: string;
    issuer: string;
    year?: string;
    description?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    year?: string;
    expiryDate?: string;
  }>;
  languages?: string[];
  interests?: string[];
  linkedin?: string;
  github?: string;
  portfolio?: string;
  publications?: Array<{
    title: string;
    journal?: string;
    year?: string;
    url?: string;
  }>;
  volunteerWork?: Array<{
    organization: string;
    role: string;
    duration: string;
    description: string;
  }>;
  additionalSections?: Array<{
    sectionName: string;
    content: string;
  }>;
}

async function parseCVWithGemini(cvText: string): Promise<ParsedProfile> {
  console.log('📄 Starting CV parsing with Gemini...');

  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  const models = [
    'gemini-2.5-flash',
    'gemini-2.0-flash-lite',
    'gemini-2.5-pro',
    'gemini-2.5-flash-lite',
    'gemini-1.5-flash',
    'gemini-1.5-pro'
  ];

  const prompt = `You are a professional CV parser. Analyze the CV text below and extract all information into a structured JSON format.

REQUIREMENTS:
- Extract ALL available information from the CV
- For missing fields, use empty strings for strings, empty arrays [] for arrays
- Ensure all required fields are present in the output
- Extract skills from BOTH explicit skills sections AND job responsibilities/descriptions
- Analyze work experience descriptions to infer technical skills, tools, and methodologies used

OUTPUT FORMAT (return valid JSON only, no markdown, no code blocks, no extra text):

{
  "fullName": "Full legal name as written in CV",
  "email": "Email address (extract from contact section)",
  "phone": "Phone number including country code if present",
  "location": "City, Country or State, Country format",
  "summary": "Professional summary or objective (2-3 sentences, extract from summary/objective section)",
  "skills": ["skill1", "skill2", "skill3"],
  "workExperience": [
    {
      "title": "Exact job title",
      "company": "Company name",
      "duration": "Employment period (e.g., 'Jan 2020 - Present' or '2020-2023')",
      "description": "Detailed role description including responsibilities and achievements"
    }
  ],
  "education": [
    {
      "degree": "Degree type and field (e.g., 'Bachelor of Science in Computer Science')",
      "institution": "School, College, or University name",
      "year": "Graduation year or date range"
    }
  ],
  "suggestedRoles": ["Role1", "Role2", "Role3", "Role4", "Role5"],
  "projects": [
    {
      "name": "Project name or title",
      "description": "Project description and key details",
      "technologies": ["tech1", "tech2"],
      "url": "Project URL if mentioned",
      "duration": "Project duration if specified"
    }
  ],
  "accomplishments": ["Achievement 1", "Achievement 2"],
  "awards": [
    {
      "title": "Award name or title",
      "issuer": "Organization or institution that gave the award",
      "year": "Year received",
      "description": "Additional details if available"
    }
  ],
  "certifications": [
    {
      "name": "Certification name (e.g., 'AWS Certified Solutions Architect')",
      "issuer": "Certifying body or organization",
      "year": "Year obtained or issued",
      "expiryDate": "Expiration date if mentioned"
    }
  ],
  "languages": ["Language name with proficiency if mentioned"],
  "interests": ["Interest or hobby"],
  "linkedin": "Full LinkedIn profile URL",
  "github": "Full GitHub profile URL",
  "portfolio": "Portfolio or personal website URL",
  "publications": [
    {
      "title": "Publication title",
      "journal": "Journal, conference, or platform name",
      "year": "Publication year",
      "url": "Link to publication if available"
    }
  ],
  "volunteerWork": [
    {
      "organization": "Organization or charity name",
      "role": "Volunteer position or role",
      "duration": "Time period of volunteer work",
      "description": "Description of volunteer activities"
    }
  ],
  "additionalSections": [
    {
      "sectionName": "Name of the section (e.g., 'Patents', 'Conferences', 'References')",
      "content": "Full content of that section"
    }
  ]
}

CRITICAL RULES:
1. Return ONLY the JSON object, no markdown code blocks, no explanations, no prefixes
2. suggestedRoles must be 5 NEW roles that represent logical career progression (NOT roles already held)
3. Extract skills comprehensively from all sections, especially work experience descriptions
4. For arrays, if no data found, return empty array []
5. For strings, if no data found, return empty string ""
6. Ensure all work experience entries have: title, company, duration, description
7. Ensure all education entries have: degree, institution, year
8. For certifications, use "name" field (not "title")

CV Text to analyze:
${cvText}`;

  for (const modelName of models) {
    try {
      console.log(`🔄 Trying model: ${modelName}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
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
            temperature: 0.1,
            maxOutputTokens: 20000,
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.log(`❌ Model ${modelName} failed with status: ${response.status}`);
        if (response.status === 429) {
          console.log(`Rate limited on ${modelName}, trying next model...`);
        }
        continue; // Try next model
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!content) {
        console.log(`❌ Model ${modelName} returned no content, trying next model...`);
        continue;
      }

      console.log(`✅ Model ${modelName} succeeded, parsing response...`);

      let cleanContent = content.trim();
      // Remove markdown code blocks if present
      cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Try to find JSON content more robustly
      let jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.log(`❌ Model ${modelName} returned no valid JSON structure, trying next model...`);
        continue;
      }

      try {
        let jsonString = jsonMatch[0];
        
        // First, try parsing directly
        let parsedProfile: ParsedProfile;
        try {
          parsedProfile = JSON.parse(jsonString);
        } catch (directParseError) {
          // If direct parse fails, try cleaning
          console.log(`Direct parse failed, attempting cleanup...`);
          jsonString = jsonString
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
            .trim();
          parsedProfile = JSON.parse(jsonString);
        }
        
        // Validate required fields
        if (!parsedProfile.fullName || !parsedProfile.email) {
          console.log(`❌ Model ${modelName} returned incomplete data (missing fullName or email), trying next model...`);
          continue;
        }

        // Ensure all array fields are arrays
        const arrayFields = ['skills', 'workExperience', 'education', 'suggestedRoles', 'projects', 
                            'accomplishments', 'awards', 'certifications', 'languages', 'interests',
                            'publications', 'volunteerWork', 'additionalSections'];
        for (const field of arrayFields) {
          if (!Array.isArray(parsedProfile[field as keyof ParsedProfile])) {
            (parsedProfile as any)[field] = [];
          }
        }

        // Ensure string fields are strings
        const stringFields = ['fullName', 'email', 'phone', 'location', 'summary', 'linkedin', 'github', 'portfolio'];
        for (const field of stringFields) {
          const value = parsedProfile[field as keyof ParsedProfile];
          if (value === null || value === undefined) {
            (parsedProfile as any)[field] = '';
          } else {
            (parsedProfile as any)[field] = String(value);
          }
        }

        console.log(`✅ CV analysis completed successfully with ${modelName}`);
        return parsedProfile;
        
      } catch (parseError) {
        console.log(`❌ Model ${modelName} JSON parsing failed:`, parseError);
        console.log(`First 500 chars of content:`, cleanContent.substring(0, 500));
        continue;
      }
      
    } catch (error) {
      console.log(`❌ Model ${modelName} error:`, error);
      continue;
    }
  }

  throw new Error('All Gemini models failed to parse CV. Please check your CV content and try again.');
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: RequestBody = await req.json();
    const { text } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid text' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('📄 Parsing CV text, length:', text.length);
    
    const parsed = await parseCVWithGemini(text);
    
    return new Response(
      JSON.stringify({ parsed }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error in parse-cv-text:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unexpected error';
    const errorStack = error instanceof Error ? error.stack : String(error);
    
    // Log full error for debugging
    console.error('Full error details:', {
      message: errorMessage,
      stack: errorStack,
      type: error instanceof Error ? error.constructor.name : typeof error
    });
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: process.env.DENO_ENV === 'development' ? errorStack : undefined
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});






