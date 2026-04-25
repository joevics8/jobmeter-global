import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Use service role key if available, otherwise fall back to anon key (less secure but works)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase configuration. Please check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) environment variables.');
}

// Create admin client for server-side operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

interface AIProcessedJob {
  title: string;
  role: string;
  related_roles: string[];
  ai_enhanced_roles: string[];
  sector: string;
  ai_enhanced_sectors: string[];
  company: {
    name: string;
    website?: string;
    industry?: string;
  };
  location: {
    city: string;
    state: string;
    country: string;
    remote: boolean;
  };
  employment_type: string;
  experience_level: string;
  skills_required: string[];
  ai_enhanced_skills: string[];
  description: string;
  responsibilities: string[];
  qualifications: string[];
  benefits: string[];
  salary_range?: {
    min: number;
    max: number;
    currency: string;
    period: string;
  };
  application: {
    method: string;
    url?: string;
    email?: string;
    phone?: string;
  };
  posted_date: string;
  deadline?: string;
  source: {
    platform: string;
    group_name: string;
  };
}

async function callGeminiAI(jobText: string): Promise<string> {
  const prompt = `You are an expert job parser and enhancer. Parse the following job posting text and extract structured information. If there are multiple jobs in the text, extract each one separately.

For each job, extract and enhance the following information:
1. Basic Information: title, role (primary job role), sector
2. Company: name, website (if mentioned), industry
3. Location: city, state, country, remote status
4. Employment type - MUST be one of: Full-time, Part-time, Contract, Freelance, Internship
5. Experience level - Calculate from years mentioned and use ONLY one of these exact values (without the years):
   Entry-level, Junior, Mid-Level, Senior, Lead, Executive
   Calculation guide: 0-1 years = Entry-level, 1-3 years = Junior, 3-5 years = Mid-Level, 5-8 years = Senior, 8-10 years = Lead, 10+ years = Executive
6. Sector - MUST be exactly one of these 25 sectors:
   Information Technology & Software, Engineering & Manufacturing, Finance & Banking, Healthcare & Medical, Education & Training, Sales & Marketing, Human Resources & Recruitment, Customer Service & Support, Media, Advertising & Communications, Design, Arts & Creative, Construction & Real Estate, Logistics, Transport & Supply Chain, Agriculture & Agribusiness, Energy & Utilities (Oil, Gas, Renewable Energy), Legal & Compliance, Government & Public Administration, Retail & E-commerce, Hospitality & Tourism, Science & Research, Security & Defense, Telecommunications, Nonprofit & NGO, Environment & Sustainability, Product Management & Operations, Data & Analytics
7. Skills required (extract and expand to include related skills)
8. Description (rewrite to be clear and professional)
9. Responsibilities (list of key duties)
10. Qualifications (required qualifications and nice-to-haves)
11. Benefits (perks and benefits mentioned)
12. Salary range (if mentioned)
13. Application details - format as: {"method": "Online Form", "url": "https://...", "email": "mailto:email@example.com", "phone": "tel:+1234567890"}
14. Posted date (today if not mentioned: ${new Date().toISOString().split('T')[0]})
15. Deadline (if mentioned)

CRITICAL COMPANY NAME EXTRACTION RULES:
- ONLY extract a company name if you are 90% confident it's the actual company name
- DO NOT use generic terms like "leading company", "our company", "the company", "prestigious firm", "established organization", "dynamic team", etc.
- If an application email is provided, check the domain (e.g., jobs@techcorp.com → company might be "TechCorp")
- If no clear company name is found, use null or empty string - this is perfectly acceptable
- Better to have no company name than a wrong/fake one
- Look for specific company names, not generic descriptions
- Avoid placeholder names like "Company Name", "ABC Corp", "XYZ Ltd"

IMPORTANT ENHANCEMENT INSTRUCTIONS:
- Expand "skills_required" to include related and complementary skills in "ai_enhanced_skills"
- Add "related_roles" - suggest 3-5 related job titles or alternative names for this role
- Add "ai_enhanced_sectors" - select 1-3 related sectors from the 25 sectors list above
- Leave "ai_enhanced_roles" as empty array
- For application, ensure URLs start with https://, emails with mailto:, and phones with tel:
- If information is missing, use reasonable defaults based on the job context
- Ensure all required fields are present

IMPORTANT: Return ONLY a valid JSON array, no markdown formatting, no code blocks, no explanations. Just the raw JSON array with this exact structure:
[
  {
    "title": "string",
    "role": "string",
    "related_roles": ["string", "string", "string"],
    "ai_enhanced_roles": [],
    "sector": "string (must be one of the 25 sectors)",
    "ai_enhanced_sectors": ["string", "string"],
    "company": {
      "name": "string or null if not confident",
      "website": "string or null",
      "industry": "string or null"
    },
    "location": {
      "city": "string",
      "state": "string",
      "country": "string",
      "remote": boolean
    },
    "employment_type": "string (Full-time, Part-time, Contract, Freelance, or Internship)",
    "experience_level": "string (Entry-level, Junior, Mid-Level, Senior, Lead, or Executive - NO YEARS)",
    "skills_required": ["string"],
    "ai_enhanced_skills": ["string"],
    "description": "string",
    "responsibilities": ["string"],
    "qualifications": ["string"],
    "benefits": ["string"],
    "salary_range": {
      "min": number,
      "max": number,
      "currency": "string",
      "period": "string"
    },
    "application": {
      "method": "string",
      "url": "https://...",
      "email": "mailto:email@example.com",
      "phone": "tel:+1234567890"
    },
    "posted_date": "YYYY-MM-DD",
    "deadline": "YYYY-MM-DD",
    "source": {
      "platform": "Text Parse",
      "group_name": "Manual Input"
    }
  }
]

Job text to parse:
${jobText}`;

  const models = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-2.5-flash-preview-09-2025',
    'gemini-2.5-flash-lite-preview-09-2025',
    'gemini-2.5-pro'
  ];

  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  let lastError: Error | null = null;

  // Try each model until one works
  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 8192,
            }
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const geminiResponse = data.candidates[0].content.parts[0].text;
        return geminiResponse;
      } else {
        throw new Error('Invalid response format from Gemini API');
      }
    } catch (error) {
      console.error(`Model ${model} failed:`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
      continue;
    }
  }

  throw new Error(`All Gemini models failed. Last error: ${lastError?.message || 'Unknown error'}`);
}

function generateHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).substring(0, 7);
}

async function enhanceFormData(submission: any): Promise<any> {
  const prompt = `You are an expert job enhancer. Given the following job information, enhance it by:

1. Expand "skills_required" to include related and complementary skills in "ai_enhanced_skills"
2. Add "related_roles" - suggest 3-5 related job titles or alternative names for this role
3. Add "ai_enhanced_sectors" - select 1-3 related sectors from the 25 sectors list

Job Information:
- Title: ${submission.title}
- Role: ${submission.role || submission.title}
- Sector: ${submission.sector}
- Skills: ${submission.skills_required?.join(', ') || 'None specified'}
- Description: ${submission.description}

Return ONLY a valid JSON object with this structure:
{
  "related_roles": ["string", "string", "string"],
  "ai_enhanced_skills": ["string", "string", "string"],
  "ai_enhanced_sectors": ["string", "string"]
}`;

  try {
    const aiResponse = await callGeminiAI(prompt);
    let jsonResponse = aiResponse.trim();
    
    // Remove markdown code blocks if present
    if (jsonResponse.includes('```json')) {
      const jsonMatch = jsonResponse.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonResponse = jsonMatch[1];
      }
    } else if (jsonResponse.includes('```')) {
      const jsonMatch = jsonResponse.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonResponse = jsonMatch[1];
      }
    }
    
    jsonResponse = jsonResponse.trim();
    
    // Try to extract JSON object from array if needed
    const jsonMatch = jsonResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return JSON.parse(jsonResponse);
  } catch (error) {
    console.error('Error enhancing form data:', error);
    // Return default enhancement if AI fails
    return {
      related_roles: [],
      ai_enhanced_skills: submission.skills_required || [],
      ai_enhanced_sectors: [submission.sector]
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { submissionId } = await request.json();

    if (!submissionId) {
      return NextResponse.json(
        { error: 'submissionId is required' },
        { status: 400 }
      );
    }

    // Get the submission
    const { data: submission, error: fetchError } = await supabaseAdmin
      .from('user_submitted_jobs')
      .select('*')
      .eq('id', submissionId)
      .single();

    if (fetchError || !submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Update status to processing
    await supabaseAdmin
      .from('user_submitted_jobs')
      .update({
        status: 'processing',
        updated_at: new Date().toISOString(),
      })
      .eq('id', submissionId);

    if (submission.submission_method === 'paste') {
      // Process pasted job using Gemini
      const aiResponse = await callGeminiAI(submission.raw_pasted_content);
      
      // Parse AI response
      let jsonResponse = aiResponse.trim();
      
      // Remove markdown code blocks if present
      if (jsonResponse.includes('```json')) {
        const jsonMatch = jsonResponse.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonResponse = jsonMatch[1];
        }
      } else if (jsonResponse.includes('```')) {
        const jsonMatch = jsonResponse.match(/```\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonResponse = jsonMatch[1];
        }
      }
      
      jsonResponse = jsonResponse.trim();
      
      // Parse JSON array
      let parsedJobs: AIProcessedJob[];
      const arrayMatch = jsonResponse.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        parsedJobs = JSON.parse(arrayMatch[0]);
      } else {
        parsedJobs = JSON.parse(jsonResponse);
      }
      
      if (!parsedJobs || parsedJobs.length === 0) {
        throw new Error('No jobs found in AI response');
      }

      const processedJob = parsedJobs[0];

      // Check for duplicates
      const duplicateCheck = {
        hash: generateHash(JSON.stringify({
          title: processedJob.title,
          company: processedJob.company.name,
          location: `${processedJob.location.city}_${processedJob.location.country}`,
        })),
        fingerprint: `${processedJob.title}_${processedJob.company.name}_${processedJob.location.city}`,
      };

      const [submittedJobs, existingJobs] = await Promise.all([
        supabaseAdmin
          .from('user_submitted_jobs')
          .select('id, title, company')
          .eq('duplicate_check->>hash', duplicateCheck.hash)
          .neq('id', submissionId),
        supabaseAdmin
          .from('jobs')
          .select('id, title, company')
          .eq('duplicate_check->>hash', duplicateCheck.hash)
      ]);

      if ((submittedJobs.data?.length ?? 0) > 0 || (existingJobs.data?.length ?? 0) > 0) {
        // Mark as duplicate/rejected
        await supabaseAdmin
          .from('user_submitted_jobs')
          .update({
            status: 'rejected',
            rejection_reason: `Duplicate job found: "${processedJob.title}" at ${processedJob.company.name} already exists in the system.`,
            ai_processing_error: 'Duplicate job detected',
            updated_at: new Date().toISOString()
          })
          .eq('id', submissionId);
        
        return NextResponse.json({ 
          success: true, 
          status: 'rejected',
          reason: 'duplicate'
        });
      }

      // Update submission with AI-processed data
      await supabaseAdmin
        .from('user_submitted_jobs')
        .update({
          title: processedJob.title,
          role: processedJob.role,
          related_roles: processedJob.related_roles,
          sector: processedJob.sector,
          company: processedJob.company,
          location: processedJob.location,
          employment_type: processedJob.employment_type,
          skills_required: processedJob.skills_required,
          experience_level: processedJob.experience_level,
          salary_range: processedJob.salary_range,
          description: processedJob.description,
          responsibilities: processedJob.responsibilities,
          qualifications: processedJob.qualifications,
          benefits: processedJob.benefits,
          application: processedJob.application,
          posted_date: processedJob.posted_date,
          deadline: processedJob.deadline,
          duplicate_check: duplicateCheck,
          ai_enhanced_skills: processedJob.ai_enhanced_skills,
          ai_enhanced_roles: processedJob.ai_enhanced_roles,
          ai_enhanced_sectors: processedJob.ai_enhanced_sectors,
          ai_processed: true,
          status: 'ai_processed',
          ai_processed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', submissionId);

    } else if (submission.submission_method === 'form') {
      // Enhance form submission with AI
      const enhancedData = await enhanceFormData(submission);
      
      await supabaseAdmin
        .from('user_submitted_jobs')
        .update({
          related_roles: enhancedData.related_roles,
          ai_enhanced_skills: enhancedData.ai_enhanced_skills,
          ai_enhanced_sectors: enhancedData.ai_enhanced_sectors,
          ai_processed: true,
          status: 'ai_processed',
          ai_processed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', submissionId);
    }

    return NextResponse.json({ success: true, status: 'processed' });

  } catch (error: any) {
    console.error('Job processing error:', error);
    
    // Update submission with error
    const submissionId = (await request.json()).submissionId;
    if (submissionId) {
      await supabaseAdmin
        .from('user_submitted_jobs')
        .update({
          status: 'pending',
          ai_processing_error: error.message || 'Processing failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', submissionId);
    }

    return NextResponse.json(
      { error: error.message || 'Processing failed' },
      { status: 500 }
    );
  }
}

