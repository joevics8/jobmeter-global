import { NextRequest, NextResponse } from 'next/server';

const getGeminiApiKey = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  return key;
};

const GEMINI_MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.5-flash-preview-09-2025',
  'gemini-2.5-flash-lite-preview-09-2025',
  'gemini-2.5-pro',
  'gemini-3-flash-preview',
];

export async function POST(req: NextRequest) {
  let GEMINI_API_KEY: string;
  
  try {
    GEMINI_API_KEY = getGeminiApiKey();
  } catch (keyError) {
    console.error('GEMINI_API_KEY validation error:', keyError);
    return NextResponse.json(
      { error: 'Grading service is not configured. Please contact support.' },
      { status: 500 }
    );
  }

  try {
    const { question, userAnswer, customPrompt } = await req.json();

    if (!question || !userAnswer) {
      return NextResponse.json(
        { error: 'Question and answer are required' },
        { status: 400 }
      );
    }

    const gradingPrompt = customPrompt || `You are an expert evaluator. Evaluate the following answer to the question.
    
Question: ${question}

User's Answer: ${userAnswer}

Provide your evaluation in the following JSON format:
{
  "score": (a number from 0-100 representing the quality of the answer),
  "feedback": (constructive feedback explaining the score and areas for improvement)
}

Consider the following criteria:
- Relevance to the question
- Depth of understanding
- Clarity of expression
- Accuracy of information
- Completeness of the answer

Return ONLY valid JSON, no additional text.`;

    let lastError: Error | null = null;
    
    for (const model of GEMINI_MODELS) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: gradingPrompt
                }]
              }],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 2048,
              }
            })
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error(`Gemini API error with model ${model}:`, errorData);
          lastError = new Error(errorData.error?.message || 'API request failed');
          continue;
        }

        const data = await response.json();
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedText) {
          lastError = new Error('No response from grading service');
          continue;
        }

        // Parse the JSON response
        let parsedResult;
        try {
          const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsedResult = JSON.parse(jsonMatch[0]);
          } else {
            parsedResult = JSON.parse(generatedText);
          }
        } catch (parseError) {
          console.error('Failed to parse Gemini response:', generatedText);
          return NextResponse.json({
            score: 50,
            feedback: 'Unable to evaluate answer. Please review the question and provide a more detailed response.',
          });
        }

        // Ensure score is a number between 0-100
        const score = Math.min(100, Math.max(0, parseInt(parsedResult.score) || 50));
        
        // Pass/Fail threshold is 75%
        const passed = score >= 75;

        return NextResponse.json({
          score,
          passed,
          feedback: parsedResult.feedback || 'Good effort!',
        });
      } catch (modelError) {
        console.error(`Error with model ${model}:`, modelError);
        lastError = modelError as Error;
        continue;
      }
    }

    // All models failed
    console.error('All Gemini models failed:', lastError);
    return NextResponse.json(
      { error: lastError?.message || 'Failed to grade answer. Please try again.' },
      { status: 500 }
    );

  } catch (error) {
    console.error('Grading error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
