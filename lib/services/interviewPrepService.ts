// Interview Prep Service
// Builds prompts locally and calls Supabase Edge Function (AI proxy only)

import { supabase } from '@/lib/supabase';

export interface InterviewQuestion {
  question: string;
  type: 'behavioral' | 'technical' | 'situational' | 'experience';
  category: string;
  expectedTopics: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface AnswerEvaluation {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  suggestedAnswer: string;
  tips: string[];
}

export interface ChatMessage {
  id: string;
  type: 'question' | 'answer' | 'feedback';
  content: string;
  timestamp: number;
  score?: number; // Score for feedback messages (0-100)
  evaluation?: {
    score: number;
    strengths: string[];
    improvements: string[];
    tips: string[];
  };
}

export interface InterviewSession {
  id: string;
  timestamp: number;
  jobTitle?: string;
  jobCompany?: string;
  jobDescription: string;
  cvUsed: boolean;
  chat: ChatMessage[];
  completed: boolean;
  currentPhase: 'introduction' | 'questioning' | 'completed';
}

export class InterviewPrepService {
  /**
   * Extract text from CV content (handles JSON or HTML)
   */
  static extractCVText(cvContent: string): string {
    // If it's JSON (structured data), try to parse and extract text
    if (cvContent.trim().startsWith('{')) {
      try {
        const structuredData = JSON.parse(cvContent);
        // Extract text from structured CV data
        let text = '';
        if (structuredData.personalDetails?.name) text += `Name: ${structuredData.personalDetails.name}\n`;
        if (structuredData.personalDetails?.title) text += `Title: ${structuredData.personalDetails.title}\n`;
        if (structuredData.summary) text += `\nSummary: ${structuredData.summary}\n`;
        if (structuredData.skills?.length) text += `\nSkills: ${structuredData.skills.join(', ')}\n`;
        if (structuredData.experience?.length) {
          text += '\nExperience:\n';
          structuredData.experience.forEach((exp: any) => {
            text += `${exp.role} at ${exp.company} (${exp.years})\n`;
            if (exp.bullets?.length) {
              exp.bullets.forEach((bullet: string) => text += `- ${bullet}\n`);
            }
          });
        }
        return text.substring(0, 2000); // Limit to 2000 chars for context
      } catch (e) {
        // Not valid JSON, treat as plain text
      }
    }
    
    // If it contains HTML tags, extract text (basic extraction)
    if (cvContent.includes('<')) {
      return cvContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 2000);
    }
    
    // Otherwise return as-is (plain text), limited
    return cvContent.substring(0, 2000);
  }

  /**
   * Parse JSON response from AI (handles markdown code blocks and various formats)
   */
  static parseAIResponse<T>(responseText: string): T {
    let jsonString = responseText.trim();

    console.log('Raw response:', jsonString.substring(0, 500));

    // Extract JSON from response (handle markdown code blocks if present)
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.replace(/^```json\s*/g, '').replace(/```\s*$/g, '');
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```\s*/g, '').replace(/```\s*$/g, '');
    }

    // Try to find JSON object in the response
    const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonString = jsonMatch[0];
    }

    console.log('Extracted JSON string:', jsonString.substring(0, 500));

    // Parse JSON response
    try {
      return JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('Final JSON string:', jsonString);

      // Try to fix common JSON issues
      let fixedJson = jsonString;

      // Fix trailing commas
      fixedJson = fixedJson.replace(/,(\s*[}\]])/g, '$1');

      // Fix unquoted keys
      fixedJson = fixedJson.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');

      try {
        return JSON.parse(fixedJson);
      } catch (secondError) {
        console.error('Failed to parse even with fixes:', secondError);
        throw new Error('Failed to parse AI response. Please try again.');
      }
    }
  }

  /**
   * Build prompt for generating interview questions
   */
  static buildQuestionsPrompt(
    jobDescription: string,
    jobTitle?: string,
    jobCompany?: string,
    cvContent?: string
  ): string {
    const QUESTION_GENERATION_PROMPT = `You are an expert interview coach. Generate personalized interview questions based on a job description and optionally a candidate's CV.

Your response must be valid JSON only, matching this exact structure:

{
  "questions": [
    {
      "question": "The interview question text",
      "type": "behavioral" | "technical" | "situational" | "experience",
      "category": "e.g., Problem Solving, Leadership, Technical Skills",
      "expectedTopics": ["topic1", "topic2"],
      "difficulty": "easy" | "medium" | "hard"
    }
  ]
}

Requirements:
- Generate 8-10 diverse interview questions
- Mix of behavioral, technical, and situational questions
- Questions should be specific to the job role and requirements
- If CV is provided, tailor questions to the candidate's experience
- Include questions about skills mentioned in the job description
- Vary difficulty levels appropriately
- Return ONLY valid JSON with no additional text, no markdown, no code blocks, no explanations`;

    let cvText = '';
    if (cvContent) {
      cvText = this.extractCVText(cvContent);
    }

    // Limit job description to prevent token limits
    const limitedJobDescription = jobDescription.length > 3000 ?
      jobDescription.substring(0, 3000) + '...' : jobDescription;

    return `${QUESTION_GENERATION_PROMPT}

Job Details:
- Title: ${jobTitle || 'Not specified'}
- Company: ${jobCompany || 'Not specified'}
- Description: ${limitedJobDescription}

${cvText ? `Candidate CV Summary:
${cvText}` : 'Note: No CV provided. Generate general questions based on the job description only.'}

Generate interview questions that are relevant, challenging, and help the candidate prepare for this role.`;
  }

  /**
   * Build prompt for evaluating an answer
   */
  static buildEvaluationPrompt(
    question: string,
    answer: string,
    jobDescription?: string,
    jobTitle?: string,
    cvContent?: string,
    questionNumber?: number,
    totalQuestions?: number,
    previousAnswers?: Array<{ question: string; answer: string; feedback: string }>
  ): string {
    const ANSWER_EVALUATION_PROMPT = `You are an expert interview coach providing concise feedback to help a candidate improve their interview performance. Your role is to COACH the candidate, not interview them.

CRITICAL: You are the AI COACH. Rate the answer on a scale of 0-100% and provide BRIEF coaching feedback (50-70 words maximum).

Your response must be valid JSON only, matching this exact structure:

{
  "score": 85,
  "feedback": "Brief coaching feedback (50-70 words max) - concise summary of what was good and what needs improvement",
  "strengths": [],
  "improvements": [],
  "suggestedAnswer": "",
  "tips": []
}

Requirements:
- Score should be 0-100 based on answer quality (be strict but fair)
- Feedback must be 50-70 words maximum - be concise and to the point
- Include all coaching information in the feedback field only
- The feedback should cover: what was good, what needs improvement, and how to improve
- Be encouraging but constructive - focus on helping them improve
- Rate answers strictly: excellent (80-100), good (60-79), average (40-59), needs work (20-39), poor (0-19)
- Return ONLY valid JSON, no markdown formatting, no code blocks
- Keep strengths, improvements, suggestedAnswer, and tips as empty arrays/strings (they are not used)`;

    let cvText = '';
    if (cvContent) {
      cvText = this.extractCVText(cvContent);
    }

    return `${ANSWER_EVALUATION_PROMPT}

Job Context:
- Title: ${jobTitle || 'Not specified'}
- Company: ${jobDescription ? 'See description below' : 'Not specified'}
${jobDescription ? `- Description: ${jobDescription.substring(0, 1000)}${jobDescription.length > 1000 ? '...' : ''}` : ''}

Interview Question (Question ${questionNumber || '?'} of ${totalQuestions || '?'}):
"${question}"

Candidate's Answer:
"${answer}"

${cvText ? `Candidate Background Context:
${cvText}` : ''}

${previousAnswers && previousAnswers.length > 0 ? `Previous Questions Context:
${previousAnswers.slice(-3).map((qa, i) => `Q${i + 1}: ${qa.question.substring(0, 100)}...`).join('\n')}` : ''}

Evaluate this answer and provide constructive feedback.`;
  }

  /**
   * Generate interview questions
   */
  static async generateQuestions(
    jobDescription: string,
    jobTitle?: string,
    jobCompany?: string,
    cvContent?: string
  ): Promise<InterviewQuestion[]> {
    try {
      console.log('Building interview questions prompt...');
      console.log('Job description length:', jobDescription?.length);
      console.log('Job title:', jobTitle);
      console.log('Job company:', jobCompany);
      console.log('CV content length:', cvContent?.length);

      // Build prompt locally
      const prompt = this.buildQuestionsPrompt(jobDescription, jobTitle, jobCompany, cvContent);
      console.log('Generated prompt length:', prompt.length);

      // Call Supabase function (just passes prompt to Gemini API)
      console.log('Calling Supabase interview-prep function...');
      const { data, error } = await supabase.functions.invoke('interview-prep', {
        body: {
          prompt,
          temperature: 0.7,
          maxTokens: 4096, // Reduce token limit to avoid truncation
        },
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(`Failed to generate questions: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned from interview prep service');
      }

      console.log('Supabase function response:', data);

      if (!data.success) {
        throw new Error(data?.error || 'Failed to generate interview questions');
      }

      // Parse response locally
      console.log('Parsing AI response:', data.data);
      const result = this.parseAIResponse<{ questions: InterviewQuestion[] }>(data.data);

      console.log('Parsed result:', result);

      if (!result.questions || !Array.isArray(result.questions)) {
        console.error('Invalid question generation structure:', result);
        throw new Error('Invalid question generation structure');
      }

      if (result.questions.length === 0) {
        throw new Error('No questions generated. Please try again.');
      }

      return result.questions;
    } catch (error: any) {
      console.error('Error generating questions:', error);

      // Provide more specific error messages
      if (error.message?.includes('non-2xx status code')) {
        throw new Error('AI service is currently unavailable. Please try again in a few moments.');
      } else if (error.message?.includes('API key')) {
        throw new Error('AI service configuration error. Please contact support.');
      } else if (error.message?.includes('parse')) {
        throw new Error('AI response format error. Please try again.');
      }

      throw new Error(error.message || 'Failed to generate interview questions. Please try again.');
    }
  }

  /**
   * Process user answer: get AI Coach feedback, then get next question from interviewer
   */
  static async processChatResponse(
    session: InterviewSession,
    userAnswer: string
  ): Promise<{ 
    coachFeedback: {
      score: number;
      feedback: string;
    };
    nextQuestion: string | null;
  }> {
    try {
      // Get the last question from the chat
      const chat = session.chat || [];
      const lastQuestion = chat.filter(msg => msg.type === 'question').pop();
      
      if (!lastQuestion) {
        throw new Error('No question found to evaluate answer against');
      }

      // Extract CV content if available
      let cvText = '';
      if (session.cvUsed) {
        try {
          const cvDocs = localStorage.getItem('cv_documents');
          if (cvDocs) {
            const docs = JSON.parse(cvDocs);
            const latestCV = docs.find((doc: any) => doc.type === 'cv');
            if (latestCV) {
              cvText = this.extractCVText(latestCV.content || latestCV.structured_data || '');
            }
          }
        } catch (e) {
          console.error('Error extracting CV:', e);
        }
      }

      // Step 1: Get AI Coach evaluation with score
      const evaluation = await this.evaluateAnswer(
        lastQuestion.content,
        userAnswer,
        session.jobDescription,
        session.jobTitle,
        cvText,
        chat.filter(msg => msg.type === 'question').length,
        10, // Assume ~10 questions total
        [] // Could extract previous Q&A pairs if needed
      );

      // Step 2: Get next question from interviewer
      const nextQuestion = await this.getNextQuestion(session, userAnswer);

      return {
        coachFeedback: {
          score: evaluation.score,
          feedback: evaluation.feedback,
        },
        nextQuestion,
      };
    } catch (error: any) {
      console.error('Error processing chat response:', error);
      throw new Error(error.message || 'Failed to process your answer. Please try again.');
    }
  }

  /**
   * Get next question from interviewer (separate from coaching)
   */
  static async getNextQuestion(
    session: InterviewSession,
    userAnswer: string
  ): Promise<string | null> {
    try {
      const prompt = this.buildNextQuestionPrompt(session, userAnswer);

      // Call Supabase function
      const { data, error } = await supabase.functions.invoke('interview-prep', {
        body: {
          prompt,
          temperature: 0.7,
          maxTokens: 500, // Shorter for just the question
        },
      });

      if (error) {
        throw new Error(`Failed to get next question: ${error.message}`);
      }

      if (!data || !data.success) {
        throw new Error(data?.error || 'Failed to get next question');
      }

      // Parse response
      const result = this.parseAIResponse<{ nextQuestion: string | null }>(data.data);

      return result.nextQuestion;
    } catch (error: any) {
      console.error('Error getting next question:', error);
      throw new Error(error.message || 'Failed to get next question');
    }
  }

  /**
   * Build prompt for getting next question from interviewer
   */
  static buildNextQuestionPrompt(session: InterviewSession, userAnswer: string): string {
    // Extract CV content if available
    let cvText = '';
    if (session.cvUsed) {
      // Try to get CV from session or localStorage
      try {
        const cvDocs = localStorage.getItem('cv_documents');
        if (cvDocs) {
          const docs = JSON.parse(cvDocs);
          const latestCV = docs.find((doc: any) => doc.type === 'cv');
          if (latestCV) {
            cvText = this.extractCVText(latestCV.content || latestCV.structured_data || '');
          }
        }
      } catch (e) {
        console.error('Error extracting CV:', e);
      }
    }

    const chat = session.chat || [];
    const questionsAsked = chat.filter(msg => msg.type === 'question').length;
    const shouldEnd = questionsAsked >= 10;

    const INTERVIEWER_PROMPT = `You are a recruiter at a company conducting a job interview over chat. You are professional, warm, and conversational — like a real recruiter, not a robot.

IMPORTANT: You are ONLY the RECRUITER. Ask the next interview question. Do NOT provide feedback, coaching, or commentary on the candidate's answer — just ask the next question naturally, as a recruiter would in a real interview.

Your response must be valid JSON only, matching this exact structure:

{
  "nextQuestion": "The next interview question as a string, or null if the interview is complete"
}

Current status: ${questionsAsked} questions have been asked so far (including the opening question).
${shouldEnd ? 'The interview has reached 10 questions. Return null to end the session.' : `Do NOT return null — the interview must continue. Ask question ${questionsAsked + 1}.`}

Guidelines:
- Sound like a real recruiter — natural, human, conversational
- Acknowledge the candidate's answer briefly before asking the next question (e.g. "Great, thanks for sharing that." or "That's helpful to know.")
- Ask about: experience, motivation, skills, teamwork, situational/behavioral scenarios, culture fit
- Vary question types across the interview — don't repeat similar questions
- Ask only ONE question per response
- Return ONLY valid JSON, no markdown, no explanations`;

    // Build conversation history (only questions and answers, not feedback)
    const recentMessages = chat
      .filter(msg => msg.type === 'question' || msg.type === 'answer')
      .slice(-8);
    const conversationHistory = recentMessages.map(msg =>
      `${msg.type === 'question' ? 'Recruiter' : 'Candidate'}: ${msg.content}`
    ).join('\n');

    const jobDesc = session.jobDescription.substring(0, 1500);
    const jobDescSuffix = session.jobDescription.length > 1500 ? '...' : '';

    return `${INTERVIEWER_PROMPT}

Job Details:
- Title: ${session.jobTitle || 'Not specified'}
- Company: ${session.jobCompany || 'Not specified'}
- Description: ${jobDesc}${jobDescSuffix}

${cvText ? `Candidate's CV/Resume:
${cvText.substring(0, 1500)}${cvText.length > 1500 ? '...' : ''}` : 'Note: No CV/resume provided. Ask general questions based on the job description.'}

Conversation so far:
${conversationHistory}

Candidate's latest answer: "${userAnswer}"

Ask the next interview question. Remember: ${shouldEnd ? 'return null to end the interview.' : `this is question ${questionsAsked + 1} — do NOT return null.`}`;
  }

  /**
   * Evaluate an answer
   */
  static async evaluateAnswer(
    question: string,
    answer: string,
    jobDescription?: string,
    jobTitle?: string,
    cvContent?: string,
    questionNumber?: number,
    totalQuestions?: number,
    previousAnswers?: Array<{ question: string; answer: string; feedback: string }>
  ): Promise<AnswerEvaluation> {
    try {
      // Build prompt locally
      const prompt = this.buildEvaluationPrompt(
        question,
        answer,
        jobDescription,
        jobTitle,
        cvContent,
        questionNumber,
        totalQuestions,
        previousAnswers
      );

      // Call Supabase function (just passes prompt to Gemini API)
      const { data, error } = await supabase.functions.invoke('interview-prep', {
        body: {
          prompt,
          temperature: 0.7,
          maxTokens: 8192,
        },
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(`Failed to evaluate answer: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned from interview prep service');
      }

      if (!data.success) {
        throw new Error(data?.error || 'Failed to evaluate answer');
      }

      // Parse response locally
      const result = this.parseAIResponse<AnswerEvaluation>(data.data);

      if (typeof result.score !== 'number' || !result.feedback) {
        throw new Error('Invalid evaluation structure');
      }

      return result;
    } catch (error: any) {
      console.error('Error evaluating answer:', error);
      throw new Error(error.message || 'Failed to evaluate answer. Please try again.');
    }
  }

  /**
   * Create a new chat-based interview session
   */
  static createSession(
    jobDescription: string,
    jobTitle?: string,
    jobCompany?: string,
    cvUsed: boolean = false
  ): InterviewSession {
    const session: InterviewSession = {
      id: `interview_${Date.now()}`,
      timestamp: Date.now(),
      jobTitle,
      jobCompany,
      jobDescription,
      cvUsed,
      chat: [],
      completed: false,
      currentPhase: 'introduction',
    };

    // Start with the introduction question (as recruiter)
    session.chat.push({
      id: 'intro',
      type: 'question',
      content: `Hi, thanks for making time for this! I'm glad we could connect. I've had a chance to look over your application for the ${jobTitle || 'role'}${jobCompany ? ` at ${jobCompany}` : ''} — looks like an interesting background. To kick things off, could you tell me about yourself? Walk me through your experience and what's drawing you to this opportunity?`,
      timestamp: Date.now(),
    });

    return session;
  }

  /**
   * Save session to localStorage
   */
  static saveSession(session: InterviewSession): void {
    try {
      // Save current session
      localStorage.setItem('interview_prep_current_session', JSON.stringify(session));

      // Add to history
      const history = this.getHistory();
      const existingIndex = history.findIndex(s => s.id === session.id);
      
      if (existingIndex >= 0) {
        history[existingIndex] = session;
      } else {
        history.unshift(session);
      }

      // Keep only last 20 sessions
      const limitedHistory = history.slice(0, 20);
      localStorage.setItem('interview_prep_history', JSON.stringify(limitedHistory));
    } catch (error) {
      console.error('Error saving session:', error);
    }
  }

  /**
   * Get current session
   */
  static getCurrentSession(): InterviewSession | null {
    try {
      const session = localStorage.getItem('interview_prep_current_session');
      return session ? JSON.parse(session) : null;
    } catch (error) {
      console.error('Error loading session:', error);
      return null;
    }
  }

  /**
   * Get session history
   */
  static getHistory(): InterviewSession[] {
    try {
      const history = localStorage.getItem('interview_prep_history');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error reading history:', error);
      return [];
    }
  }

  /**
   * Get session by ID
   */
  static getSessionById(sessionId: string): InterviewSession | null {
    const history = this.getHistory();
    return history.find(s => s.id === sessionId) || null;
  }

  /**
   * Clear current session
   */
  static clearCurrentSession(): void {
    localStorage.removeItem('interview_prep_current_session');
  }
}