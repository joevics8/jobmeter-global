// Supabase Edge Function for CV text extraction from PDF and Image files
// This function handles Gemini extraction with OCR.Space fallback

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  file: string; // base64 encoded file
  mimeType: string;
  fileName?: string;
}

async function extractTextWithGemini(fileBuffer: Uint8Array, mimeType: string, base64Data: string): Promise<string> {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  // Use the already-encoded base64 data passed from the request

  // Determine the file format based on mime type
  let fileFormat = 'application/pdf';
  if (mimeType.startsWith('image/')) {
    fileFormat = mimeType; // Use the actual image mime type (image/png, image/jpeg, etc.)
  } else if (mimeType === 'application/pdf') {
    fileFormat = 'application/pdf';
  }

  // Prepare the prompt for text extraction
  const prompt = `Extract all text from this ${fileFormat.includes('image') ? 'image' : 'PDF document'}. Return the complete text content exactly as it appears, preserving all structure, formatting, and layout. Include headers, paragraphs, lists, tables, and any other text elements. Do not summarize or modify the content - extract it verbatim.`;

  // Use specified Gemini models - prioritize faster models first
  // gemini-2.0-flash-exp is good for multimodal, gemini-1.5-flash is stable
  const models = [
    'gemini-2.0-flash-exp',  // Best for multimodal tasks
    'gemini-1.5-flash',      // Stable fallback
    'gemini-1.5-pro',        // More capable fallback
    'gemini-2.5-flash-lite', // Last resort
    'gemini-2.5-flash'       // Last resort
  ];

  for (const modelName of models) {
    try {
      const startTime = Date.now();
      console.log(`🔄 Trying Gemini model ${modelName} for file extraction...`);
      
      // Create AbortController for timeout - reduced to 45 seconds for faster failure
      const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 second timeout for multimodal
      
      try {
        const requestStartTime = Date.now();
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt
                  },
                  {
                    inlineData: {
                      mimeType: fileFormat,
                      data: base64Data
                    }
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 16384,
            }
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        const requestTime = Date.now() - requestStartTime;
        console.log(`⏱️ Gemini API request took ${requestTime}ms`);

        if (!response.ok) {
          const errorData = await response.text();
          console.log(`❌ Model ${modelName} failed with status: ${response.status}, error: ${errorData}`);
          if (response.status === 429) {
            console.log(`Rate limited on ${modelName}, trying next model...`);
          }
          continue; // Try next model
        }

        const parseStartTime = Date.now();
        const data = await response.json();

        console.log(`📄 Raw response for ${modelName}:`, JSON.stringify(data, null, 2));

        // Handle different response formats
        let extractedText = '';

        if (data.candidates && data.candidates[0]) {
          const candidate = data.candidates[0];
          if (candidate.content && candidate.content.parts) {
            extractedText = candidate.content.parts
              .filter((part: any) => part.text)
              .map((part: any) => part.text)
              .join('\n');
          }
        }

        const parseTime = Date.now() - parseStartTime;
        console.log(`⏱️ Response parsing took ${parseTime}ms`);
        console.log(`📝 Extracted text length: ${extractedText.length}`);

        if (!extractedText || extractedText.trim().length < 10) {
          console.log(`❌ Model ${modelName} returned insufficient text (${extractedText.length} chars), trying next model...`);
          continue;
        }

        const totalTime = Date.now() - startTime;
        console.log(`✅ Successfully extracted text using ${modelName}, length: ${extractedText.length}, total time: ${totalTime}ms`);
        console.log(`📄 First 500 chars: ${extractedText.substring(0, 500)}`);
        return extractedText.trim();
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        const totalTime = Date.now() - startTime;
        if (fetchError.name === 'AbortError') {
          console.log(`❌ Model ${modelName} request timed out after 45 seconds (total: ${totalTime}ms)`);
        } else {
          console.log(`❌ Model ${modelName} error after ${totalTime}ms:`, fetchError);
        }
        continue; // Try next model
      }
    } catch (error) {
      console.log(`❌ Model ${modelName} error:`, error);
      continue; // Try next model
    }
  }

  throw new Error('All Gemini models failed to extract text from file');
}

async function extractTextWithOCRSpace(fileBuffer: Uint8Array, mimeType: string, fileName: string = 'file'): Promise<string> {
  console.log('Using OCR.Space API as fallback for file:', fileName);
  
  // OCR.Space free tier has a 1MB (1024 KB) file size limit
  const fileSizeInKB = fileBuffer.length / 1024;
  const maxSizeKB = 1024;
  
  if (fileSizeInKB > maxSizeKB) {
    throw new Error(`File size (${Math.round(fileSizeInKB)} KB) exceeds OCR.Space limit of ${maxSizeKB} KB. Please try a smaller file or ensure Gemini extraction works for files over 1MB.`);
  }
  
  const ocrApiKey = Deno.env.get('OCR_SPACE_API_KEY') || 'helloworld'; // Fallback to free tier key if not set
  
  // Convert Uint8Array to Blob for FormData
  const blob = new Blob([fileBuffer], { type: mimeType });
  const formDataOCR = new FormData();
  formDataOCR.append('file', blob, fileName);
  formDataOCR.append('apikey', ocrApiKey);
  formDataOCR.append('language', 'eng');
  formDataOCR.append('isOverlayRequired', 'false');
  formDataOCR.append('detectOrientation', 'false');
  formDataOCR.append('scale', 'true');
  formDataOCR.append('OCREngine', '2');

  console.log('Sending to OCR.Space API...');
  const response = await fetch('https://api.ocr.space/parse/image', {
    method: 'POST',
    body: formDataOCR,
  });

  const result = await response.json();
  console.log('OCR API response:', result);
  
  if (result.IsErroredOnProcessing) {
    console.error('OCR processing error:', result.ErrorMessage);
    throw new Error(`OCR processing failed: ${result.ErrorMessage || 'Text extraction failed'}`);
  }

  if (result.ParsedResults && result.ParsedResults.length > 0) {
    const extractedText = result.ParsedResults[0].ParsedText || '';
    console.log('OCR extracted text length:', extractedText.length);
    return extractedText;
  }

  throw new Error('No text found in document');
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: RequestBody = await req.json();
    const { file, mimeType, fileName } = body;

    if (!file || !mimeType) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: file (base64) and mimeType' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate file type - only process PDF and images
    const isPDF = mimeType === 'application/pdf';
    const isImage = mimeType.startsWith('image/');

    if (!isPDF && !isImage) {
      return new Response(
        JSON.stringify({ error: 'Unsupported file type. Only PDF and image files are supported.' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Decode base64 to Uint8Array for size checking and OCR.Space
    let fileBuffer: Uint8Array;
    let base64Data: string;
    try {
      // Remove data URL prefix if present (e.g., "data:image/png;base64,")
      base64Data = file.includes(',') ? file.split(',')[1] : file;
      const binaryString = atob(base64Data);
      fileBuffer = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        fileBuffer[i] = binaryString.charCodeAt(i);
      }
    } catch (decodeError) {
      return new Response(
        JSON.stringify({ error: 'Failed to decode base64 file data' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Processing file: ${fileName || 'unknown'}, Type: ${mimeType}, Size: ${fileBuffer.length} bytes`);
    const functionStartTime = Date.now();

    // Try Gemini first, then fallback to OCR.Space
    try {
      console.log('Attempting to extract text with Gemini...');
      const extractedText = await extractTextWithGemini(fileBuffer, mimeType, base64Data);
      const totalFunctionTime = Date.now() - functionStartTime;
      console.log(`⏱️ Total function execution time: ${totalFunctionTime}ms`);
      return new Response(
        JSON.stringify({ text: extractedText }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    } catch (geminiError) {
      const geminiTime = Date.now() - functionStartTime;
      console.error(`Gemini extraction failed after ${geminiTime}ms, falling back to OCR.Space:`, geminiError);
      try {
        const ocrStartTime = Date.now();
        const extractedText = await extractTextWithOCRSpace(fileBuffer, mimeType, fileName || 'file');
        const ocrTime = Date.now() - ocrStartTime;
        const totalFunctionTime = Date.now() - functionStartTime;
        console.log(`⏱️ OCR.Space took ${ocrTime}ms, total function time: ${totalFunctionTime}ms`);
        return new Response(
          JSON.stringify({ text: extractedText }),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      } catch (ocrError) {
        console.error('OCR.Space fallback also failed:', ocrError);
        const errorMessage = ocrError instanceof Error ? ocrError.message : 'Unknown error';
        const geminiErrorMsg = geminiError instanceof Error ? geminiError.message : 'Unknown Gemini error';
        return new Response(
          JSON.stringify({ 
            error: 'Text extraction failed', 
            details: `Gemini extraction failed: ${geminiErrorMsg}. OCR.Space fallback also failed: ${errorMessage}. For files over 1MB, Gemini extraction must succeed as OCR.Space has a 1MB limit.` 
          }),
          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }
  } catch (error: any) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unexpected error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});


          { 
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }
  } catch (error: any) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unexpected error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

