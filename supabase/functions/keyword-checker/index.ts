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

interface KeywordResult {
  matchScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  recommendedKeywords: string[];
  hardSkills: string[];
  softSkills: string[];
  bulletImprovements: string[];
  summary: string;
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
          temperature: 0.2,
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
    const { cvText, jobDescription } = await req.json();

    if (!cvText || !jobDescription) {
      return new Response(
        JSON.stringify({ success: false, error: "CV text and job description are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = `
You are an expert CV analyzer and job matching specialist. Analyze the CV against the job description and provide keyword analysis.

CV TEXT:
${cvText}

JOB DESCRIPTION:
${jobDescription}

Return a JSON object with this exact structure:
{
  "matchScore": 85,
  "matchedKeywords": ["Python", "JavaScript", "React", "Team Leadership"],
  "missingKeywords": ["AWS", "Docker", "CI/CD"],
  "recommendedKeywords": ["AWS", "Docker", "Kubernetes", "CI/CD Pipeline"],
  "hardSkills": ["Python", "JavaScript", "React", "Node.js", "SQL"],
  "softSkills": ["Leadership", "Communication", "Problem Solving"],
  "bulletImprovements": [
    "Add quantified achievements (e.g., 'increased sales by 25%')",
    "Include AWS or cloud experience in skills section",
    "Highlight team leadership experience"
  ],
  "summary": "A brief summary of the match analysis"
}

Rules:
1. matchScore should be 0-100 based on keyword overlap
2. Include both hard skills and soft skills found
3. missingKeywords should be important skills from job that CV doesn't have
4. recommendedKeywords are suggestions for improvement
5. bulletImprovements are actionable CV improvements
6. Focus on skills, keywords, and qualifications that match
`;

    let result: any = null;
    let lastError: Error | null = null;

    for (const model of GEMINI_MODELS) {
      try {
        console.log(`Trying model: ${model}`);
        result = await callGemini(prompt, model);
        
        if (result && typeof result.matchScore === 'number') {
          console.log(`Success with model: ${model}`);
          break;
        }
      } catch (error) {
        console.log(`Model ${model} failed:`, error);
        lastError = error as Error;
        continue;
      }
    }

    if (!result) {
      throw lastError || new Error("All Gemini models failed");
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in keyword-checker:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
