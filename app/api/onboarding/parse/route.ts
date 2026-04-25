import { NextResponse } from 'next/server';

export const maxDuration = 120; // Increased to 120 seconds for parsing

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

// Get API key at runtime (not module load time) to ensure it's available in Vercel
function getGeminiApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  return key;
}

async function parseCVWithGemini(cvText: string): Promise<any> {
  const GEMINI_API_KEY = getGeminiApiKey();

  const models = ['gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-2.5-pro'];

  const prompt = `Extract CV information into JSON. Return ONLY valid JSON, no markdown:

{
  "fullName": "Name from CV",
  "email": "Email address",
  "phone": "Phone number",
  "location": "City, Country",
  "summary": "Professional summary",
  "skills": ["skill1", "skill2"],
  "workExperience": [{"title": "Job Title", "company": "Company", "duration": "Period", "description": "Details"}],
  "education": [{"degree": "Degree", "institution": "School", "year": "Year"}],
  "suggestedRoles": ["Role1", "Role2", "Role3", "Role4", "Role5", "Role6", "Role7", "Role8", "Role9", "Role10", "Role11", "Role12", "Role13", "Role14", "Role15"],
  "projects": [],
  "accomplishments": [],
  "awards": [],
  "certifications": [],
  "languages": [],
  "interests": [],
  "linkedin": "",
  "github": "",
  "portfolio": "",
  "publications": [],
  "volunteerWork": [],
  "additionalSections": []
}

IMPORTANT FOR suggestedRoles:
- Suggest 10-15 job roles (not just 5)
- Use COMMON job titles that appear frequently in job adverts
- Examples: "Software Engineer", "Product Manager", "Data Analyst", "Marketing Manager", "Sales Representative", "Project Manager", "Business Analyst", "UX Designer", "Accountant", "HR Manager", "Operations Manager", "Customer Success Manager", "Content Writer", "Graphic Designer", "Financial Analyst"
- Base suggestions on the person's skills, experience, and education
- Include both entry-level and mid-level roles that match their profile
- Use standard, widely-recognized job titles (not company-specific titles)

CV Text:
${cvText}`;

  for (const model of models) {
    const url = `${GEMINI_BASE_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`;
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000); // 20 second timeout

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 20000 }
        }),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const error = await response.text();
        if (process.env.NODE_ENV === 'development') {
          console.log(`❌ Model ${model} failed: ${response.status}`);
        }
        continue; // Try next model
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      if (!content) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`❌ Model ${model} returned no content`);
        }
        continue; // Try next model
      }

      // Extract JSON from response
      let cleanContent = content.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`❌ Model ${model} returned invalid JSON`);
        }
        continue; // Try next model
      }

      let parsed;
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`❌ Model ${model} JSON parse failed`);
        }
        continue; // Try next model
      }

      // Validate required fields
      if (!parsed.fullName || !parsed.email) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`❌ Model ${model} missing required fields`);
        }
        continue; // Try next model
      }

      // Ensure arrays are arrays
      const arrayFields = ['skills', 'workExperience', 'education', 'suggestedRoles', 'projects',
                          'accomplishments', 'awards', 'certifications', 'languages', 'interests',
                          'publications', 'volunteerWork', 'additionalSections'];
      for (const field of arrayFields) {
        if (!Array.isArray(parsed[field])) {
          parsed[field] = [];
        }
      }

      // Ensure strings are strings
      const stringFields = ['fullName', 'email', 'phone', 'location', 'summary', 'linkedin', 'github', 'portfolio'];
      for (const field of stringFields) {
        if (parsed[field] === null || parsed[field] === undefined) {
          parsed[field] = '';
        } else {
          parsed[field] = String(parsed[field]);
        }
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Model ${model} parsed successfully`);
      }
      return parsed;
    } catch (error: any) {
      clearTimeout(timeout);
      if (error.name === 'AbortError') {
        if (process.env.NODE_ENV === 'development') {
          console.log(`⏱️ Model ${model} timed out`);
        }
        continue; // Try next model
      }
      if (process.env.NODE_ENV === 'development') {
        console.log(`❌ Model ${model} error:`, error.message);
      }
      continue; // Try next model
    }
  }

  throw new Error('All Gemini models failed to parse CV');
}

export async function POST(req: Request) {
  try {
    // Validate API key at runtime
    try {
      getGeminiApiKey();
    } catch (keyError) {
      console.error('GEMINI_API_KEY validation error:', keyError);
      return NextResponse.json(
        { 
          error: 'GEMINI_API_KEY not configured',
          details: process.env.NODE_ENV === 'development' ? (keyError instanceof Error ? keyError.message : 'Unknown error') : undefined
        },
        { status: 500 }
      );
    }

    const { text } = await req.json();

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'Missing or invalid text' }, { status: 400 });
    }

    const parsed = await parseCVWithGemini(text);
    return NextResponse.json({ parsed });
  } catch (error: any) {
    console.error('Parse error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to parse CV text' },
      { status: 500 }
    );
  }
}
