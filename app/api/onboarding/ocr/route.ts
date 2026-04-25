import { NextResponse } from 'next/server';

export const maxDuration = 120; // Increased to 120 seconds for file processing

// Get API keys at runtime (not module load time) to ensure they're available in Vercel
function getGeminiApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  return key;
}

function getOcrApiKey(): string {
  return process.env.OCR_SPACE_API_KEY || 'helloworld';
}

// Simple Gemini extraction - try models in order
async function extractWithGemini(base64Data: string, mimeType: string): Promise<string> {
  const GEMINI_API_KEY = getGeminiApiKey();
  const models = ['gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-2.5-pro'];

  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: 'Extract all text from this document verbatim. Preserve formatting and structure.' },
              { inlineData: { mimeType, data: base64Data } }
            ]
          }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 8192 }
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
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      if (!text || text.trim().length < 10) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`❌ Model ${model} returned insufficient text`);
        }
        continue; // Try next model
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Model ${model} extracted ${text.length} characters`);
      }
      return text.trim();
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

  throw new Error('All Gemini models failed to extract text');
}

// OCR.space fallback
async function extractWithOCR(base64Data: string, mimeType: string, fileName: string): Promise<string> {
  const OCR_API_KEY = getOcrApiKey();
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const formData = new FormData();
  formData.append('file', new Blob([bytes], { type: mimeType }), fileName);
  formData.append('apikey', OCR_API_KEY);
  formData.append('language', 'eng');
  formData.append('OCREngine', '2');

  const response = await fetch('https://api.ocr.space/parse/image', {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();
  
  if (result.IsErroredOnProcessing) {
    throw new Error(`OCR failed: ${result.ErrorMessage}`);
  }

  const text = result.ParsedResults?.[0]?.ParsedText || '';
  if (!text) {
    throw new Error('No text found');
  }

  return text;
}

export async function POST(req: Request) {
  try {
    // Validate API key at runtime
    let geminiKey: string;
    try {
      geminiKey = getGeminiApiKey();
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

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB' },
        { status: 400 }
      );
    }

    const contentType = file.type || '';
    const fileName = file.name || '';

    // Handle DOCX
    if (contentType.includes('wordprocessingml') || fileName.endsWith('.docx')) {
        const mammoth = await import('mammoth');
        const arrayBuffer = await file.arrayBuffer();
        const { value } = await mammoth.extractRawText({ buffer: Buffer.from(arrayBuffer) });
        return NextResponse.json({ text: value || '' });
    }

    // Handle PDF/Images
    const isPDF = contentType === 'application/pdf';
    const isImage = contentType.startsWith('image/');

    if (!isPDF && !isImage) {
      return NextResponse.json(
        { error: 'Unsupported file type. Only PDF, images, and DOCX are supported.' },
        { status: 400 }
      );
    }

    // Convert to base64
        const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');

    // Try Gemini models first (with fallback to OCR.space)
    try {
      const text = await extractWithGemini(base64Data, contentType);
      return NextResponse.json({ text });
    } catch (geminiError) {
      // All 3 Gemini models failed, try OCR.space as 4th fallback
      try {
        const text = await extractWithOCR(base64Data, contentType, fileName);
        return NextResponse.json({ text });
      } catch (ocrError) {
        // All methods failed - return error for retry modal
        return NextResponse.json({ 
          error: 'EXTRACTION_FAILED',
          message: 'Text extraction failed. Please try again or upload a different file.',
          details: `All extraction methods failed. Gemini: ${geminiError instanceof Error ? geminiError.message : 'Unknown'}. OCR: ${ocrError instanceof Error ? ocrError.message : 'Unknown'}`
        }, { status: 500 });
      }
    }
  } catch (error: any) {
    console.error('OCR route error:', error);
    const errorMessage = error?.message || 'Unexpected error';
    const errorStack = error?.stack;
    
    // Log more details in production for debugging
    console.error('Error details:', {
      message: errorMessage,
      stack: errorStack,
      name: error?.name,
      type: typeof error
    });
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorStack : undefined
      },
      { status: 500 }
    );
  }
}
