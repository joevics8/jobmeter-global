// Supabase Edge Function: Interview Prep
// Simple AI proxy - just calls Gemini API with provided prompt

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface RequestBody {
  prompt: string;
  temperature?: number;
  maxTokens?: number;
}

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Call Gemini API with retry logic and model fallback
async function callGeminiAPI(prompt: string, apiKey: string, temperature: number = 0.7, maxTokens: number = 8192): Promise<any> {
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { prompt, temperature, maxTokens }: RequestBody = await req.json();

    console.log('Received request with prompt length:', prompt?.length);
    console.log('Temperature:', temperature);
    console.log('Max tokens:', maxTokens);

    if (!prompt || typeof prompt !== 'string') {
      console.error('Invalid prompt:', prompt);
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Get API key
    const apiKey = Deno.env.get('GEMINI_API_KEY_CV') || Deno.env.get('GEMINI_API_KEY');
    console.log('API key found:', !!apiKey);
    if (!apiKey) {
      console.error('No Gemini API key found');
      throw new Error('Gemini API key not configured');
    }

    console.log('Calling Gemini API for interview prep...');
    const responseText = await callGeminiAPI(prompt, apiKey, temperature || 0.7, maxTokens || 4096);
    console.log('Gemini API response length:', responseText?.length);
    console.log('Gemini API response preview:', responseText?.substring(0, 200));

    return new Response(
      JSON.stringify({
        success: true,
        data: responseText,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error in interview prep function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to process interview prep request',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
