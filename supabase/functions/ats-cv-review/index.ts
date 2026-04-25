// Supabase Edge Function: ATS CV Review
// Simple AI proxy - just calls Gemini API with provided prompt

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface RequestBody {
  prompt: string;
  temperature?: number;
  maxTokens?: number;
}

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

// Call Gemini API with retry logic and model fallback
async function callGeminiAPI(prompt: string, apiKey: string, temperature: number = 0.2, maxTokens: number = 8192): Promise<any> {
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
            temperature,
            maxOutputTokens: maxTokens,
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Model ${model} failed:`, errorText);
        if (response.status === 429 || response.status >= 500) {
          // Rate limit or server error - try next model
          continue;
        }
        throw new Error(`Gemini API error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error(`Invalid response from model ${model}`);
      }

      return data;
    } catch (error: any) {
      console.error(`Error with model ${model}:`, error.message);
      if (model === models[models.length - 1]) {
        // Last model failed, throw error
        throw error;
      }
      // Try next model
      continue;
    }
  }
  
  throw new Error('All Gemini models failed');
}

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { prompt, temperature, maxTokens }: RequestBody = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Get API key from environment
    const apiKey = Deno.env.get('GEMINI_API_KEY_CV') || Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    console.log('Calling Gemini API for ATS CV Review...');
    const geminiResponse = await callGeminiAPI(prompt, apiKey, temperature || 0.2, maxTokens || 8192);
    
    // Return the raw text response
    const content = geminiResponse.candidates[0].content.parts[0].text;

    return new Response(
      JSON.stringify({
        success: true,
        data: content,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('Error in ATS CV Review function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An error occurred during CV analysis',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
