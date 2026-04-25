// ATS CV Review Service
// Builds prompts locally and calls Supabase Edge Function (AI proxy only)

import { supabase } from '@/lib/supabase';

export interface ATSReviewResult {
  overallScore: number;
  overallExplanation?: string;
  scoreBreakdown?: {
    keywordMatch: { score: number; details: string; examples: string; recommendation: string };
    experienceMatch: { score: number; details: string; examples: string; recommendation: string };
    skillsAlignment: { score: number; details: string; examples: string; recommendation: string };
    atsCompatibility: { score: number; details: string; examples: string; recommendation: string };
    formattingConsistency: { score: number; details: string; examples: string; recommendation: string };
    profileSummaryStrength: { score: number; details: string; examples: string; recommendation: string };
    structureFlow: { score: number; details: string; examples: string; recommendation: string };
    visualBalanceReadability: { score: number; details: string; examples: string; recommendation: string };
  };
  summary?: string;
  finalRecommendations?: string[];
}

export interface ATSReviewRequest {
  cvContent: string;
  jobDescription?: string;
  jobTitle?: string;
  jobCompany?: string;
  reviewType: 'cv-only' | 'cv-job';
}

export interface ATSReviewSession {
  id: string;
  timestamp: number;
  cvName: string;
  jobTitle?: string;
  jobCompany?: string;
  overallScore: number;
  reviewType: 'cv-only' | 'cv-job';
  lastMessage: string;
  fullAnalysis: ATSReviewResult;
}

export class ATSReviewService {
  /**
   * Extract text from HTML CV content
   */
  static extractTextFromHTML(html: string): string {
    if (!html || typeof html !== 'string') return '';
    
    // Remove HTML tags
    const textWithoutTags = html.replace(/<[^>]*>/g, ' ');
    
    // Remove CSS styles and JavaScript
    const textWithoutStyles = textWithoutTags
      .replace(/\{[^}]*\}/g, '') // Remove CSS rules
      .replace(/@[^;]*;/g, '') // Remove CSS at-rules
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove CSS comments
      .replace(/\/\/.*$/gm, '') // Remove JS single-line comments
      .replace(/\/\*[\s\S]*?\*\//g, ''); // Remove JS multi-line comments

    // Clean up whitespace
    const cleanText = textWithoutStyles
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n\s*\n/g, '\n') // Remove empty lines
      .trim();

    return cleanText;
  }

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
        if (structuredData.personalDetails?.email) text += `Email: ${structuredData.personalDetails.email}\n`;
        if (structuredData.personalDetails?.phone) text += `Phone: ${structuredData.personalDetails.phone}\n`;
        if (structuredData.personalDetails?.location) text += `Location: ${structuredData.personalDetails.location}\n`;
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
        if (structuredData.education?.length) {
          text += '\nEducation:\n';
          structuredData.education.forEach((edu: any) => {
            text += `${edu.degree} from ${edu.institution} (${edu.years})\n`;
          });
        }
        return text;
      } catch (e) {
        // Not valid JSON, treat as plain text
      }
    }
    
    // If it contains HTML tags, extract text
    if (cvContent.includes('<')) {
      return this.extractTextFromHTML(cvContent);
    }
    
    // Otherwise return as-is (plain text)
    return cvContent;
  }

  /**
   * Build prompt for ATS CV Review
   */
  static buildPrompt(request: ATSReviewRequest): string {
    const cvTextContent = this.extractCVText(request.cvContent);
    
    // Build job context if provided
    const hasJobInfo = request.reviewType === 'cv-job' && (request.jobDescription || request.jobTitle);
    let jobContext = '';
    
    if (hasJobInfo) {
      jobContext = `
TARGET JOB INFORMATION:
${request.jobTitle ? `Job Title: ${request.jobTitle}` : ''}
${request.jobCompany ? `Company: ${request.jobCompany}` : ''}
${request.jobDescription ? `Job Description:\n${request.jobDescription}` : ''}

CRITICAL: This is a JOB-SPECIFIC review. The MOST IMPORTANT aspect is analyzing the CV's SUITABILITY for this specific position. You must:
1. Analyze overall job fit - how well does the candidate match this role?
2. Identify specific gaps between CV and job requirements
3. Assess experience level match (too junior, too senior, or just right)
4. Evaluate industry/field alignment
5. Check if required qualifications (education, certifications, licenses) are met
6. Assess skills match - both technical and soft skills
7. Determine if the candidate would be competitive for this role
8. Provide specific recommendations to improve job fit

The overallScore and all category scores MUST reflect job suitability. A well-written CV that doesn't match the job should score LOW. A CV that perfectly matches the job requirements should score HIGH.`;
    }

    // Build JSON example parts conditionally
    const overallExplanationExample = hasJobInfo 
      ? 'Brief explanation of CV quality AND job suitability. Include: (1) Overall job fit assessment, (2) Key strengths for this role, (3) Critical gaps that would prevent getting an interview, (4) Competitiveness level (strong candidate, average, weak, or not suitable).'
      : 'Brief explanation of overall performance and key strengths/weaknesses';

    const keywordMatchDetails = hasJobInfo
      ? 'Detailed analysis: (1) Percentage of job-required keywords found in CV, (2) Which critical job keywords are missing, (3) Which keywords are present but not emphasized enough, (4) Industry-specific terminology match'
      : 'Detailed analysis with percentage of keywords detected';

    const keywordMatchExamples = hasJobInfo
      ? 'Found job keywords: [list]. Missing critical keywords: [list from job description]. Weakly represented: [list].'
      : 'List of found keywords and missing ones as a single string';

    const keywordMatchRecommendation = hasJobInfo
      ? 'Add these EXACT keywords from the job description: [list specific missing keywords]. Emphasize these existing keywords more prominently: [list]. Replace generic terms with job-specific terminology.'
      : 'Add these specific keywords: [list exact keywords to include]. Replace generic terms like \'experienced\' with specific skills like \'Python, React, AWS\'.';

    const experienceMatchDetails = hasJobInfo
      ? 'Analysis: (1) Does experience match job requirements (same role, similar industry, related field)? (2) Years of experience vs. job requirements (too junior, too senior, or just right), (3) Relevance of past roles to target role, (4) Career progression alignment, (5) Specific achievements that demonstrate job-relevant capabilities'
      : 'Analysis of experience relevance and years';

    const experienceMatchExamples = hasJobInfo
      ? 'Job requires 5+ years in [field] - CV shows [X] years. Past roles: [list] - relevance: [high/moderate/low]. Key achievements relevant to job: [list]. Missing experience: [list].'
      : 'Specific feedback on roles and achievements';

    const experienceMatchRecommendation = hasJobInfo
      ? 'To improve job fit: (1) Emphasize roles/achievements most relevant to target job, (2) Add experience that demonstrates required capabilities, (3) Quantify achievements using job-relevant metrics, (4) Highlight transferable skills if changing industries, (5) Address experience gaps if underqualified'
      : 'Quantify achievements with numbers: \'Increased sales by 25%\' instead of \'Improved sales\'. Add specific technologies used in each role.';

    const skillsAlignmentDetails = hasJobInfo
      ? 'Analysis: (1) Required skills from job description that are present in CV, (2) Critical missing skills that would disqualify candidate, (3) Nice-to-have skills match, (4) Skill proficiency level match (entry/mid/senior), (5) Certifications/licenses required vs. present'
      : 'Skills detected and missing skills analysis';

    const skillsAlignmentExamples = hasJobInfo
      ? 'Required skills present: [list]. Critical missing: [list from job requirements]. Nice-to-have present: [list]. Certifications: [required vs. present].'
      : 'List of detected and missing skills';

    const skillsAlignmentRecommendation = hasJobInfo
      ? 'To match job requirements: (1) Add these critical missing skills: [list exact skills from job description], (2) Obtain required certifications/licenses: [list], (3) Emphasize job-relevant skills more prominently, (4) Remove irrelevant skills that clutter the CV, (5) If skills are transferable, explain how'
      : 'Add these missing skills: [list specific skills]. Group skills by category (Technical, Soft Skills, Certifications).';

    const summaryExample = hasJobInfo
      ? 'Overall summary: (1) Job suitability assessment (strong fit, moderate fit, weak fit, or not suitable), (2) Key strengths that make candidate competitive for this role, (3) Critical weaknesses that would prevent getting an interview, (4) Overall recommendation: Should candidate apply? What are their chances? What must be fixed first?'
      : 'Overall summary of CV strengths and areas for improvement';

    const finalRecommendationsExample = hasJobInfo
      ? `[
    "JOB SUITABILITY: [Assess overall fit - is this candidate suitable for this role? What are their chances?]",
    "CRITICAL GAPS: [List the top 3-5 things that would prevent getting an interview for this specific job]",
    "IMMEDIATE ACTIONS: [Top 3-5 specific actions to improve job fit before applying]",
    "Add these specific keywords from job description: [list exact missing keywords]",
    "Emphasize job-relevant experience: [specific roles/achievements to highlight]",
    "Address missing requirements: [list critical missing skills/qualifications]"
  ]`
      : `[
    "Add these specific keywords: [list exact keywords from job description]",
    "Quantify all achievements with specific numbers and percentages",
    "Remove tables and graphics, use simple bullet points for ATS compatibility",
    "Use consistent formatting: Arial font, uniform spacing, standard section headers",
    "Rewrite professional summary to include years of experience, key skills, and one quantified achievement"
  ]`;

    return `You are an expert ATS (Applicant Tracking System) analyst and career coach specializing in job-candidate matching. Analyze this CV${hasJobInfo ? ' for the target position' : ''} and return a comprehensive ATS CV Analysis Report in JSON format.

${hasJobInfo ? `PRIMARY OBJECTIVE: Determine if this CV is suitable for the target job. This is the MOST IMPORTANT analysis. Rate the candidate's fit for this specific role, not just CV quality in general.` : ''}

IMPORTANT: Ignore any HTML formatting in the CV content. The CV will be converted and submitted as a PDF, so focus on the actual text content and structure, not HTML tags or styling.

CV CONTENT:
${cvTextContent}

${jobContext ? `${jobContext}\n` : ''}

Return ONLY valid JSON in this exact format (no additional text, no markdown, no asterisks):

{
  "overallScore": 82,
  "overallExplanation": "${overallExplanationExample}",
  "scoreBreakdown": {
    "keywordMatch": {
      "score": 73,
      "details": "${keywordMatchDetails}",
      "examples": "${keywordMatchExamples}",
      "recommendation": "${keywordMatchRecommendation}"
    },
    "experienceMatch": {
      "score": 68,
      "details": "${experienceMatchDetails}",
      "examples": "${experienceMatchExamples}",
      "recommendation": "${experienceMatchRecommendation}"
    },
    "skillsAlignment": {
      "score": 78,
      "details": "${skillsAlignmentDetails}",
      "examples": "${skillsAlignmentExamples}",
      "recommendation": "${skillsAlignmentRecommendation}"
    },
    "atsCompatibility": {
      "score": 52,
      "details": "Analysis of ATS parsing compatibility and structure",
      "examples": "Specific ATS compatibility issues found",
      "recommendation": "Use standard section headers: 'Experience', 'Education', 'Skills'. Remove tables, graphics, and complex formatting. Use simple bullet points."
    },
    "formattingConsistency": {
      "score": 90,
      "details": "Analysis of font, spacing, and alignment consistency",
      "examples": "Inconsistencies found in formatting",
      "recommendation": "Use consistent font (Arial or Calibri), uniform bullet points, and consistent spacing between sections."
    },
    "profileSummaryStrength": {
      "score": 78,
      "details": "Analysis of opening section clarity and value proposition",
      "examples": "Strengths and weaknesses in summary",
      "recommendation": "Rewrite summary to include: [X] years of experience in [specific field], expertise in [3-4 key skills], and [one key achievement with numbers]."
    },
    "structureFlow": {
      "score": 78,
      "details": "Analysis of section order and recruiter scanning ease",
      "examples": "Issues with section organization",
      "recommendation": "Reorder sections to: Contact Info → Professional Summary → Experience → Education → Skills. Use reverse chronological order for experience."
    },
    "visualBalanceReadability": {
      "score": 55,
      "details": "Analysis of white space, margins, and layout clarity",
      "examples": "Visual balance issues found",
      "recommendation": "Add more white space between sections, use 1-inch margins, and ensure consistent line spacing (1.15 or 1.5)."
    }
  },
  "summary": "${summaryExample}",
  "finalRecommendations": ${finalRecommendationsExample}
}

CRITICAL SCORING INSTRUCTIONS - BE STRICT AND REALISTIC:

SCORING PHILOSOPHY: Most CVs are mediocre. Be harsh but fair. Use the FULL 0-100 range. Scores should vary WIDELY based on actual quality. Don't cluster scores around 65-75.

OVERALL SCORE GUIDELINES:
- 90-100: Exceptional CV - perfect job match, all keywords present, quantified achievements, flawless formatting, ATS-optimized. RARE - only give if truly outstanding.
- 80-89: Excellent CV - strong job match, most keywords present, good achievements, minor issues only. Give only if CV is genuinely strong.
- 70-79: Good CV - decent match, some keywords missing, achievements present but not all quantified, some formatting issues. Most "good" CVs should be here.
- 60-69: Average CV - partial job match, many keywords missing, vague achievements, formatting inconsistencies, structural issues. Most CVs fall here.
- 50-59: Below Average - weak job match, major keyword gaps, few quantified achievements, poor formatting, ATS issues. Common for unoptimized CVs.
- 40-49: Poor CV - minimal job relevance, missing critical keywords, no quantified achievements, major formatting/ATS problems. Penalize heavily.
- 30-39: Very Poor - almost no job match, missing most keywords, terrible structure, severe ATS issues. Apply severe penalties.
- 20-29: Extremely Poor - completely irrelevant or severely flawed. Major penalties required.
- 10-19: Critical Issues - CV is fundamentally broken or completely wrong for the job.
- 0-9: Unusable - CV cannot be parsed or is completely inappropriate.

CATEGORY-SPECIFIC SCORING (BE STRICT):

1. keywordMatch (0-100):
   - 90-100: 90%+ of job keywords present, industry terms included, no generic terms
   - 80-89: 75-89% keywords present, most industry terms included
   - 70-79: 60-74% keywords present, some industry terms missing
   - 60-69: 45-59% keywords present, many important keywords missing
   - 50-59: 30-44% keywords present, critical keywords missing
   - 40-49: 20-29% keywords present, most keywords missing
   - 30-39: 10-19% keywords present, almost no relevant keywords
   - 20-29: 5-9% keywords present, severely lacking
   - 10-19: <5% keywords present, essentially no match
   - 0-9: No relevant keywords at all
   PENALTY: -20 points if using generic terms like "experienced", "hardworking", "team player" instead of specific skills
   PENALTY: -30 points if job-specific keywords are completely absent

2. experienceMatch (0-100):
   - 90-100: Perfect match - exact role/industry, right years of experience, relevant achievements
   - 80-89: Strong match - similar role/industry, appropriate experience level
   - 70-79: Good match - related role/industry, some experience gaps
   - 60-69: Partial match - different but related field, experience level issues
   - 50-59: Weak match - different field, insufficient experience
   - 40-49: Poor match - wrong field, wrong experience level
   - 30-39: Very poor match - completely different field
   - 20-29: No relevant experience
   - 10-19: Experience is a liability
   - 0-9: Experience completely wrong for job
   PENALTY: -15 points if no quantified achievements (no numbers, percentages, metrics)
   PENALTY: -20 points if experience is in completely different industry
   PENALTY: -25 points if years of experience don't match job requirements

3. skillsAlignment (0-100):
   - 90-100: All required skills present, proper categorization, certifications included
   - 80-89: Most required skills present, good organization
   - 70-79: Many required skills present, some missing
   - 60-69: Some required skills present, many missing
   - 50-59: Few required skills present, most missing
   - 40-49: Very few relevant skills, mostly irrelevant skills listed
   - 30-39: Skills don't match job requirements
   - 20-29: Wrong skills entirely
   - 10-19: No relevant skills
   - 0-9: Skills are a negative factor
   PENALTY: -20 points if skills are generic (e.g., "Microsoft Office", "Communication")
   PENALTY: -25 points if critical job skills are completely absent

4. atsCompatibility (0-100):
   - 90-100: Perfect ATS format - standard headers, simple formatting, no tables/graphics, clean structure
   - 80-89: Good ATS format - minor issues only
   - 70-79: Mostly ATS-friendly - some formatting issues
   - 60-69: Partial ATS compatibility - tables or complex formatting present
   - 50-59: Poor ATS format - multiple compatibility issues
   - 40-49: Bad ATS format - tables, graphics, complex formatting
   - 30-39: Very poor - ATS will struggle to parse
   - 20-29: Severe ATS issues - likely to be rejected
   - 10-19: Critical ATS problems
   - 0-9: Unparseable by ATS
   PENALTY: -30 points if tables are used
   PENALTY: -25 points if graphics/images are present
   PENALTY: -20 points if non-standard section headers are used
   PENALTY: -15 points if complex formatting (columns, text boxes) is used

5. formattingConsistency (0-100):
   - 90-100: Perfect consistency - uniform fonts, spacing, alignment throughout
   - 80-89: Very consistent - minor inconsistencies
   - 70-79: Mostly consistent - some inconsistencies
   - 60-69: Inconsistent - multiple formatting issues
   - 50-59: Poor consistency - many formatting problems
   - 40-49: Very inconsistent - formatting is distracting
   - 30-39: Severely inconsistent
   - 20-29: Formatting is a major issue
   - 10-19: Formatting is unprofessional
   - 0-9: Formatting makes CV unreadable
   PENALTY: -15 points for mixed fonts
   PENALTY: -10 points for inconsistent spacing
   PENALTY: -10 points for inconsistent bullet points

6. profileSummaryStrength (0-100):
   - 90-100: Excellent summary - specific, quantified, value-driven, job-relevant
   - 80-89: Strong summary - good value proposition
   - 70-79: Decent summary - some specifics missing
   - 60-69: Weak summary - too generic, lacks specifics
   - 50-59: Poor summary - clichés, no value
   - 40-49: Very poor - generic statements only
   - 30-39: Summary is a liability
   - 20-29: No summary or terrible summary
   - 10-19: Summary hurts the CV
   - 0-9: Summary is completely wrong
   PENALTY: -20 points if summary is generic (e.g., "hardworking professional")
   PENALTY: -15 points if no quantified achievements in summary
   PENALTY: -10 points if summary doesn't mention years of experience

7. structureFlow (0-100):
   - 90-100: Perfect structure - logical order, easy to scan, optimal flow
   - 80-89: Excellent structure - minor improvements possible
   - 70-79: Good structure - some ordering issues
   - 60-69: Average structure - sections out of order
   - 50-59: Poor structure - confusing order
   - 40-49: Bad structure - hard to follow
   - 30-39: Very poor structure
   - 20-29: Structure is a major problem
   - 10-19: Structure makes CV unusable
   - 0-9: No structure
   PENALTY: -15 points if experience is not in reverse chronological order
   PENALTY: -10 points if sections are in wrong order

8. visualBalanceReadability (0-100):
   - 90-100: Perfect balance - excellent white space, margins, readability
   - 80-89: Very good balance - minor issues
   - 70-79: Good balance - some spacing issues
   - 60-69: Average balance - needs more white space
   - 50-59: Poor balance - cramped or too sparse
   - 40-49: Bad balance - hard to read
   - 30-39: Very poor balance
   - 20-29: Balance is a major issue
   - 10-19: Unreadable due to balance
   - 0-9: Completely unbalanced
   PENALTY: -15 points if margins are too small (<0.5 inch)
   PENALTY: -10 points if sections are cramped
   PENALTY: -10 points if line spacing is inconsistent

JOB SUITABILITY ANALYSIS (CRITICAL for cv-job reviews):
This is the MOST IMPORTANT aspect of the review. The CV must be evaluated for THIS SPECIFIC JOB, not just general quality.

JOB FIT ASSESSMENT REQUIREMENTS:
1. Overall Suitability Score: Rate 0-100 how suitable this candidate is for THIS specific role
   - 90-100: Perfect match - candidate exceeds requirements, highly competitive
   - 80-89: Strong match - candidate meets all requirements, competitive
   - 70-79: Good match - candidate meets most requirements, some gaps
   - 60-69: Moderate match - candidate partially qualified, significant gaps
   - 50-59: Weak match - candidate underqualified or overqualified, major gaps
   - 40-49: Poor match - candidate lacks critical requirements
   - 30-39: Very poor match - candidate unsuitable for role
   - 20-29: Extremely poor - candidate completely wrong for role
   - 10-19: Not suitable - candidate should not apply
   - 0-9: Completely unsuitable

2. Experience Level Match:
   - Too Junior: CV shows less experience than required → Penalize experienceMatch by 20-30 points
   - Too Senior: CV shows much more experience than required → May be overqualified, note in explanation
   - Just Right: Experience level matches requirements → Score normally
   - Different Field: Experience in unrelated field → Penalize experienceMatch by 30-40 points

3. Industry/Field Alignment:
   - Same Industry: Perfect match → Score normally
   - Related Industry: Some transferable skills → Apply 10-15 point penalty
   - Different Industry: Limited transferability → Apply 20-30 point penalty
   - Completely Different: No relevance → Apply 30-50 point penalty

4. Required Qualifications:
   - Education: If job requires specific degree/certification and CV lacks it → Penalize by 25-35 points
   - Licenses/Certifications: If required and missing → Penalize by 20-30 points
   - Skills: If critical skills are missing → Penalize skillsAlignment by 30-40 points

5. Job-Specific Penalties:
   - If CV is for completely different field/industry than target job:
    * keywordMatch: Maximum 30% (even if CV is well-written)
    * experienceMatch: Maximum 40% (even if experience is good)
    * skillsAlignment: Maximum 50% (even if skills are strong)
    * overallScore: Should be 30-50% for complete field mismatches, regardless of CV quality
   - If CV is somewhat related but not ideal:
    * Apply 10-20 point penalties to relevant categories
    * Overall score should reflect the mismatch
   - If candidate is underqualified (missing critical requirements):
    * Apply 20-30 point penalties to relevant categories
    * Note in overallExplanation that candidate may not meet minimum requirements

6. Competitiveness Assessment:
   - In overallExplanation, state: "This candidate is [highly competitive / competitive / moderately competitive / weak candidate / not suitable] for this role because [specific reasons]"
   - Consider: How many other candidates would be better qualified? What are this candidate's chances?

7. Critical Gaps Analysis:
   - Identify the top 3-5 things that would prevent this candidate from getting an interview
   - These should be specific to the job requirements, not just general CV issues
   - Prioritize: Missing critical skills > Missing required experience > Missing qualifications > Missing keywords

8. Recommendations Priority:
   - Job-specific recommendations should come FIRST
   - Focus on fixing critical gaps that prevent job suitability
   - General CV improvements come after job-specific fixes

SCORE VARIATION REQUIREMENTS:
- DO NOT give similar scores (e.g., don't give 75, 73, 76, 74 - vary more!)
- If one category is excellent (90+) and another is poor (40-), reflect that in scores
- If CV has major issues in one area, penalize that category heavily (30-50 range)
- If CV is mediocre overall, most categories should be 50-65, not 70-75
- Excellent CVs should have most categories 80+, average CVs should have most 50-70, poor CVs should have most 30-50

ADDITIONAL INSTRUCTIONS:
- For keywordMatch recommendations: List the EXACT keywords to add, not just general advice
- For all recommendations: Provide specific, actionable steps with exact examples
- For experienceMatch: Include specific numbers and metrics to add
- For skillsAlignment: List the exact missing skills to include
- Make all recommendations immediately actionable with specific examples
- IMPORTANT: All "examples" fields must be STRINGS, not objects. Format as: "Found: keyword1, keyword2. Missing: keyword3, keyword4"
- Do NOT return objects with "found" and "missing" keys in examples field

Analyze the actual CV content provided. Make all scores, feedback, examples, and recommendations specific to the CV content. Be detailed and professional. Give realistic, varied scores based on actual CV quality and job relevance.`;
  }

  /**
   * Parse JSON response from AI (handles markdown code blocks)
   */
  static parseAIResponse(responseText: string): ATSReviewResult {
    let jsonString = responseText.trim();
    
    // Extract JSON from response (handle markdown code blocks if present)
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.replace(/^```json\s*/g, '').replace(/```\s*$/g, '');
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```\s*/g, '').replace(/```\s*$/g, '');
    }
    
    // Parse JSON response
    let analysisResult: ATSReviewResult;
    try {
      analysisResult = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('Response content:', jsonString);
      throw new Error('Failed to parse AI response. Please try again.');
    }

    // Validate response structure
    if (!analysisResult.overallScore || !analysisResult.scoreBreakdown) {
      throw new Error('Invalid analysis result structure from AI');
    }

    return analysisResult;
  }

  /**
   * Generate ATS CV Review by calling Supabase Edge Function (AI proxy)
   */
  static async generateReview(request: ATSReviewRequest): Promise<ATSReviewResult> {
    try {
      // Build prompt locally
      const prompt = this.buildPrompt(request);

      // Call Supabase function (just passes prompt to Gemini API)
      const { data, error } = await supabase.functions.invoke('ats-cv-review', {
        body: {
          prompt,
          temperature: 0.2,
          maxTokens: 8192,
        },
      });

      if (error) {
        throw new Error(`Supabase function error: ${error.message}`);
      }

      if (!data || !data.success) {
        throw new Error(data?.error || 'Failed to generate ATS review');
      }

      // Parse response locally
      const analysisResult = this.parseAIResponse(data.data);

      return analysisResult;
    } catch (error: any) {
      console.error('Error generating ATS review:', error);
      throw new Error(error.message || 'Failed to generate ATS review. Please try again.');
    }
  }

  /**
   * Create a new ATS review session
   */
  static createSession(
    cvName: string,
    result: ATSReviewResult,
    reviewType: 'cv-only' | 'cv-job',
    jobTitle?: string,
    jobCompany?: string
  ): ATSReviewSession {
    return {
      id: `ats_review_${Date.now()}`,
      timestamp: Date.now(),
      cvName,
      jobTitle,
      jobCompany,
      overallScore: result.overallScore,
      reviewType,
      lastMessage: result.overallExplanation || result.summary || 'ATS CV Review completed',
      fullAnalysis: result,
    };
  }

  /**
   * Save session to localStorage
   */
  static saveSession(session: ATSReviewSession): void {
    try {
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
      localStorage.setItem('ats_cv_review_history', JSON.stringify(limitedHistory));
    } catch (error) {
      console.error('Error saving session:', error);
    }
  }

  /**
   * Get session history
   */
  static getHistory(): ATSReviewSession[] {
    try {
      const history = localStorage.getItem('ats_cv_review_history');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error reading history:', error);
      return [];
    }
  }

  /**
   * Get session by ID
   */
  static getSessionById(sessionId: string): ATSReviewSession | null {
    const history = this.getHistory();
    return history.find(s => s.id === sessionId) || null;
  }

  /**
   * Delete session from history
   */
  static deleteSession(sessionId: string): void {
    try {
      const history = this.getHistory();
      const filtered = history.filter(s => s.id !== sessionId);
      localStorage.setItem('ats_cv_review_history', JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  }
}
