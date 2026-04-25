import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

const GEMINI_MODELS = [
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.5-flash-preview-09-2025",
  "gemini-2.5-flash-lite-preview-09-2025",
  "gemini-2.5-pro",
  "gemini-3-flash-preview"
];

interface RoleResult {
  role: string;
  seniority: string;
  description: string;
  requiredSkills: string[];
  skillGaps: string[];
  certifications: string[];
  salaryRange: string;
  matchScore: number;
}

interface RoleFinderResult {
  roles: RoleResult[];
  summary: string;
  totalSkillsMatched: number;
}

async function callGemini(prompt: string, model: string): Promise<any> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 8000,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!content) {
    throw new Error("No content returned from Gemini");
  }

  // Extract JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No valid JSON in Gemini response");
  }

  return JSON.parse(jsonMatch[0]);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { skills, tools, yearsOfExperience, userId } = await req.json();

    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "At least one skill is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const experienceText = yearsOfExperience 
      ? `with ${yearsOfExperience} years of professional experience` 
      : "with varying levels of experience";

    const toolsText = tools && tools.length > 0 
      ? `\n- Tools/Software they use: ${tools.join(", ")}` 
      : "";

    const prompt = `
You are a career advisor and job matching expert. Based on the user's skills and experience, find 8-12 job roles they qualify for.

User Profile:
- Skills: ${skills.join(", ")}
${toolsText}
- Experience: ${experienceText}

IMPORTANT: Consider that some skills may be variations of the same technology (e.g., "React.js" and "React" are the same, "JavaScript" and "JS" are the same).

Return a JSON object with this exact structure:
{
  "roles": [
    {
      "role": "Job title (e.g., 'Senior Software Engineer')",
      "seniority": "Entry/Mid/Junior/Senior/Lead/Principal",
      "description": "Brief description of what this person would do in this role",
      "requiredSkills": ["skill1", "skill2"],
      "skillGaps": ["skill they don't have but would help"],
      "certifications": ["relevant certifications that would help"],
      "salaryRange": "e.g., ₦500,000 - ₦1,200,000 per month or $80,000 - $120,000 per year",
      "matchScore": 85
    }
  ],
  "summary": "A brief 2-3 sentence summary of the user's career direction",
  "totalSkillsMatched": 8
}

Rules:
1. Only suggest roles where matchScore is 50 or higher
2. Include both technical and non-technical roles where applicable
3. skillGaps should be realistic - not everything they lack
4. Focus on the Nigerian/African job market where relevant
5. Consider the combination of skills, not just individual skills
6. For salary, use Naira (₦) for Nigerian roles or USD ($) for international remote roles
7. Return exactly 8-12 roles
`;

    let result: any = null;
    let lastError: Error | null = null;

    for (const model of GEMINI_MODELS) {
      try {
        console.log(`Trying model: ${model}`);
        result = await callGemini(prompt, model);
        
        // Validate result structure
        if (result.roles && Array.isArray(result.roles) && result.roles.length > 0) {
          console.log(`Success with model: ${model}`);
          break;
        }
      } catch (error) {
        console.log(`Model ${model} failed:`, error);
        lastError = error as Error;
        continue;
      }
    }

    if (!result || !result.roles) {
      throw lastError || new Error("All Gemini models failed");
    }

    // Save to database if userId provided
    if (userId) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        await supabase.from("role_finder_results").insert({
          user_id: userId,
          skills: skills,
          tools: tools || [],
          years_of_experience: yearsOfExperience,
          result: result,
          created_at: new Date().toISOString()
        });
      } catch (dbError) {
        console.log("Failed to save to database:", dbError);
        // Don't fail the request if DB save fails
      }
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in role-finder:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
