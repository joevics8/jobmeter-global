export interface GroundingResult {
  title: string;
  company: string;
  location?: string;
  salary?: string;
  description?: string;
  url?: string;
  posted_date?: string;
  job_type?: string;
  remote?: boolean;
  requirements?: string[];
  skills?: string[];
  experience_level?: string;
}

export interface ParsedProfile {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  skills: string[];
  workExperience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  suggestedRoles: string[];
  projects: Array<{
    name: string;
    description: string;
    technologies?: string[];
    url?: string;
    duration?: string;
  }>;
  accomplishments: string[];
  awards: Array<{
    title: string;
    issuer: string;
    year?: string;
    description?: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    year?: string;
    expiryDate?: string;
  }>;
  languages: string[];
  interests: string[];
    linkedin?: string;
    github?: string;
    portfolio?: string;
  publications?: Array<{
    title: string;
    journal?: string;
    year?: string;
    url?: string;
  }>;
  volunteerWork?: Array<{
    organization: string;
    role: string;
    duration: string;
    description: string;
  }>;
  additionalSections?: Array<{
    sectionName: string;
    content: string;
  }>;
}

export class GeminiService {
  private apiKey: string | undefined;

  private getApiKey(): string {
    if (!this.apiKey) {
      this.apiKey = process.env.GEMINI_API_KEY;
    }
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    return this.apiKey;
  }

  async parseCVWithFallback(cvText: string): Promise<ParsedProfile> {
    console.log('📄 Starting CV parsing with Gemini...');

    const models = [
      'gemini-2.5-flash',
      'gemini-2.0-flash-lite',
      'gemini-2.5-pro',
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
      'gemini-2.5-pro'
    ];

    const openaiModels = [
      'gpt-4o-mini',
      'gpt-3.5-turbo',
      'gpt-4.1-nano'
    ];

    // Enhanced prompt for comprehensive CV analysis - matches app's ParsedProfile structure
    const prompt = `You are a professional CV parser. Analyze the CV text below and extract all information into a structured JSON format.

REQUIREMENTS:
- Extract ALL available information from the CV
- For missing fields, use empty strings for strings, empty arrays [] for arrays
- Ensure all required fields are present in the output
- Extract skills from BOTH explicit skills sections AND job responsibilities/descriptions
- Analyze work experience descriptions to infer technical skills, tools, and methodologies used

OUTPUT FORMAT (return valid JSON only, no markdown, no code blocks, no extra text):

{
  "fullName": "Full legal name as written in CV",
  "email": "Email address (extract from contact section)",
  "phone": "Phone number including country code if present",
  "location": "City, Country or State, Country format",
  "summary": "Professional summary or objective (2-3 sentences, extract from summary/objective section)",
  "skills": ["skill1", "skill2", "skill3"],
  "workExperience": [
    {
      "title": "Exact job title",
      "company": "Company name",
      "duration": "Employment period (e.g., 'Jan 2020 - Present' or '2020-2023')",
      "description": "Detailed role description including responsibilities and achievements"
    }
  ],
  "education": [
    {
      "degree": "Degree type and field (e.g., 'Bachelor of Science in Computer Science')",
      "institution": "School, College, or University name",
      "year": "Graduation year or date range"
    }
  ],
  "suggestedRoles": ["Role1", "Role2", "Role3", "Role4", "Role5"],
  "projects": [
    {
      "name": "Project name or title",
      "description": "Project description and key details",
      "technologies": ["tech1", "tech2"],
      "url": "Project URL if mentioned",
      "duration": "Project duration if specified"
    }
  ],
  "accomplishments": ["Achievement 1", "Achievement 2"],
  "awards": [
    {
      "title": "Award name or title",
      "issuer": "Organization or institution that gave the award",
      "year": "Year received",
      "description": "Additional details if available"
    }
  ],
  "certifications": [
    {
      "name": "Certification name (e.g., 'AWS Certified Solutions Architect')",
      "issuer": "Certifying body or organization",
      "year": "Year obtained or issued",
      "expiryDate": "Expiration date if mentioned"
    }
  ],
  "languages": ["Language name with proficiency if mentioned"],
  "interests": ["Interest or hobby"],
  "linkedin": "Full LinkedIn profile URL",
  "github": "Full GitHub profile URL",
  "portfolio": "Portfolio or personal website URL",
  "publications": [
    {
      "title": "Publication title",
      "journal": "Journal, conference, or platform name",
      "year": "Publication year",
      "url": "Link to publication if available"
    }
  ],
  "volunteerWork": [
    {
      "organization": "Organization or charity name",
      "role": "Volunteer position or role",
      "duration": "Time period of volunteer work",
      "description": "Description of volunteer activities"
    }
  ],
  "additionalSections": [
    {
      "sectionName": "Name of the section (e.g., 'Patents', 'Conferences', 'References')",
      "content": "Full content of that section"
    }
  ]
}

CRITICAL RULES:
1. Return ONLY the JSON object, no markdown code blocks, no explanations, no prefixes
2. suggestedRoles must be 5 NEW roles that represent logical career progression (NOT roles already held)
3. Extract skills comprehensively from all sections, especially work experience descriptions
4. For arrays, if no data found, return empty array []
5. For strings, if no data found, return empty string ""
6. Ensure all work experience entries have: title, company, duration, description
7. Ensure all education entries have: degree, institution, year
8. For certifications, use "name" field (not "title")

CV Text to analyze:
${cvText}`;

    for (const modelName of models) {
      try {
        console.log(`🔄 Trying model: ${modelName}`);
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${this.getApiKey()}`, {
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
              temperature: 0.1,
              maxOutputTokens: 20000, // Increased to 20000 to handle longer CVs
            }
          })
        });

        if (!response.ok) {
          console.log(`❌ Model ${modelName} failed with status: ${response.status}`);
          if (response.status === 429) {
            console.log(`Rate limited on ${modelName}, trying next model...`);
          }
          continue; // Try next model
        }

        const data = await response.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!content) {
          console.log(`❌ Model ${modelName} returned no content, trying next model...`);
          continue;
        }

        console.log(`✅ Model ${modelName} succeeded, parsing response...`);

        let cleanContent = content.trim();
        // Remove markdown code blocks if present
        cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        // Try to find JSON content more robustly - look for opening and closing braces
        let jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.log(`❌ Model ${modelName} returned no valid JSON structure, trying next model...`);
          continue;
        }

        try {
          let jsonString = jsonMatch[0];
          
          // First, try parsing directly (most models return valid JSON)
          let parsedProfile;
          try {
            parsedProfile = JSON.parse(jsonString);
          } catch (directParseError) {
            // If direct parse fails, try cleaning while preserving JSON structure
            console.log(`Direct parse failed, attempting cleanup...`);
            
            // Remove control characters that might break JSON (but preserve newlines in strings)
            // Only remove control characters outside of string values
            jsonString = jsonString
              .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '') // Remove problematic control chars
              .trim();
            
            // Try parsing again after basic cleanup
            parsedProfile = JSON.parse(jsonString);
          }
          
          // Validate required fields exist and have values
          if (!parsedProfile.fullName || !parsedProfile.email) {
            console.log(`❌ Model ${modelName} returned incomplete data (missing fullName or email), trying next model...`);
            continue;
          }

          // Ensure all array fields are arrays (not null/undefined)
          const arrayFields = ['skills', 'workExperience', 'education', 'suggestedRoles', 'projects', 
                              'accomplishments', 'awards', 'certifications', 'languages', 'interests',
                              'publications', 'volunteerWork', 'additionalSections'];
          for (const field of arrayFields) {
            if (!Array.isArray(parsedProfile[field])) {
              parsedProfile[field] = [];
            }
          }

          // Ensure string fields are strings
          const stringFields = ['fullName', 'email', 'phone', 'location', 'summary', 'linkedin', 'github', 'portfolio'];
          for (const field of stringFields) {
            if (parsedProfile[field] === null || parsedProfile[field] === undefined) {
              parsedProfile[field] = '';
            } else {
              parsedProfile[field] = String(parsedProfile[field]);
            }
          }

          console.log(`✅ CV analysis completed successfully with ${modelName}`);
          return parsedProfile as ParsedProfile;
          
        } catch (parseError) {
          console.log(`❌ Model ${modelName} JSON parsing failed:`, parseError);
          console.log(`First 500 chars of content:`, cleanContent.substring(0, 500));
          
          // Try next model
          continue;
        }
        
      } catch (error) {
        console.log(`❌ Model ${modelName} error:`, error);
        // Continue to next model
        continue;
      }
    }

    // If all Gemini models fail, try OpenAI models
    console.log('🔄 All Gemini models failed, trying OpenAI models...');
    
    for (const modelName of openaiModels) {
      try {
        console.log(`🔄 Trying OpenAI model: ${modelName}`);
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: modelName,
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.1,
            max_tokens: 20000 // Increased from 2048 to handle longer CVs
          })
        });

        if (!response.ok) {
          console.log(`❌ OpenAI model ${modelName} failed with status: ${response.status}`);
          continue;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        
        if (!content) {
          console.log(`❌ OpenAI model ${modelName} returned no content, trying next model...`);
          continue;
        }

        console.log(`✅ OpenAI model ${modelName} succeeded, parsing response...`);

        let cleanContent = content.trim();
        // Remove markdown code blocks if present
        cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        // Try to find JSON content more robustly
        let jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.log(`❌ OpenAI model ${modelName} returned no valid JSON structure, trying next model...`);
          continue;
        }

        try {
          let jsonString = jsonMatch[0];
          
          // First, try parsing directly (most models return valid JSON)
          let parsedProfile;
          try {
            parsedProfile = JSON.parse(jsonString);
          } catch (directParseError) {
            // If direct parse fails, try cleaning while preserving JSON structure
            console.log(`Direct parse failed, attempting cleanup...`);
            
            // Remove control characters that might break JSON (but preserve newlines in strings)
            jsonString = jsonString
              .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '') // Remove problematic control chars
              .trim();
            
            // Try parsing again after basic cleanup
            parsedProfile = JSON.parse(jsonString);
          }
          
          // Validate required fields exist and have values
          if (!parsedProfile.fullName || !parsedProfile.email) {
            console.log(`❌ OpenAI model ${modelName} returned incomplete data (missing fullName or email), trying next model...`);
            continue;
          }

          // Ensure all array fields are arrays (not null/undefined)
          const arrayFields = ['skills', 'workExperience', 'education', 'suggestedRoles', 'projects', 
                              'accomplishments', 'awards', 'certifications', 'languages', 'interests',
                              'publications', 'volunteerWork', 'additionalSections'];
          for (const field of arrayFields) {
            if (!Array.isArray(parsedProfile[field])) {
              parsedProfile[field] = [];
            }
          }

          // Ensure string fields are strings
          const stringFields = ['fullName', 'email', 'phone', 'location', 'summary', 'linkedin', 'github', 'portfolio'];
          for (const field of stringFields) {
            if (parsedProfile[field] === null || parsedProfile[field] === undefined) {
              parsedProfile[field] = '';
            } else {
              parsedProfile[field] = String(parsedProfile[field]);
            }
          }

          console.log(`✅ CV analysis completed successfully with OpenAI ${modelName}`);
          return parsedProfile as ParsedProfile;
          
        } catch (parseError) {
          console.log(`❌ OpenAI model ${modelName} JSON parsing failed:`, parseError);
          console.log(`First 500 chars of content:`, cleanContent.substring(0, 500));
          
          // Try next model
          continue;
        }
        
      } catch (error) {
        console.log(`❌ OpenAI model ${modelName} error:`, error);
        // Continue to next model
        continue;
      }
    }

    // If all models fail, throw an error
    throw new Error('All Gemini and OpenAI models failed to parse CV. Please check your CV content and try again.');
  }

  // Extract text from images and PDFs using Gemini
  async extractTextFromFile(fileBuffer: Buffer, mimeType: string): Promise<string> {
    try {
      console.log('📄 Extracting text from file using Gemini, mime type:', mimeType);
      
      // Convert buffer to base64
      const base64Data = fileBuffer.toString('base64');
      
      // Determine the file format based on mime type
      let fileFormat = 'application/pdf';
      if (mimeType.startsWith('image/')) {
        fileFormat = mimeType; // Use the actual image mime type (image/png, image/jpeg, etc.)
      } else if (mimeType === 'application/pdf') {
        fileFormat = 'application/pdf';
      } else {
        // Default to PDF if unknown, but this shouldn't happen for our use case
        fileFormat = 'application/pdf';
      }

      // Prepare the prompt for text extraction
      const prompt = `Extract all text from this ${fileFormat.includes('image') ? 'image' : 'PDF document'}. Return only the extracted text content, preserving the structure and formatting as much as possible. Include all sections, headings, paragraphs, lists, and any other text elements.`;

      // Use Gemini 1.5 Flash or Pro which supports file inputs
      const models = [
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'gemini-2.0-flash-exp'
      ];

      for (const modelName of models) {
        try {
          console.log(`🔄 Trying Gemini model ${modelName} for file extraction...`);
          
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${this.getApiKey()}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
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
              }],
              generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 8192,
              }
            })
          });

          if (!response.ok) {
            const errorData = await response.text();
            console.log(`❌ Model ${modelName} failed with status: ${response.status}, error: ${errorData}`);
            if (response.status === 429) {
              console.log(`Rate limited on ${modelName}, trying next model...`);
            }
            continue; // Try next model
          }

          const data = await response.json();
          const extractedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          
          if (!extractedText) {
            console.log(`❌ Model ${modelName} returned no text, trying next model...`);
            continue;
          }

          console.log(`✅ Successfully extracted text using ${modelName}, length: ${extractedText.length}`);
          return extractedText.trim();
          
        } catch (error) {
          console.log(`❌ Model ${modelName} error:`, error);
          continue; // Try next model
        }
      }

      throw new Error('All Gemini models failed to extract text from file');
    } catch (error) {
      console.error('Gemini file extraction error:', error);
      throw new Error(`Text extraction failed: ${error}`);
    }
  }

  // Perform grounding search using Gemini
  async performGroundingSearch(
    query: string,
    location?: string,
    maxResults: number = 10
  ): Promise<GroundingResult[]> {
    try {
      const searchPrompt = `
        Search for recent job listings (posted within the last 24 hours) for: "${query}"
        ${location ? `in location: "${location}"` : ''}
        
        Find up to ${maxResults} job listings and return them in the following JSON format:
        {
          "jobs": [
            {
              "title": "Job Title",
              "company": "Company Name",
              "location": "Location (or Remote)",
              "salary": "Salary range if available",
              "description": "Brief job description",
              "url": "Job posting URL if available",
              "posted_date": "When posted (if available)",
              "job_type": "Full-time/Part-time/Contract",
              "remote": true/false,
              "requirements": ["requirement1", "requirement2"],
              "skills": ["skill1", "skill2", "skill3"]
            }
          ]
        }
        
        Focus on finding real, current job postings from job boards, company websites, and professional networks.
        Extract as much relevant information as possible for each job.
      `;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${this.getApiKey()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: searchPrompt }] }],
        })
      });

      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      try {
        const parsed = JSON.parse(text);
        return parsed.jobs || [];
      } catch (parseError) {
        // If JSON parsing fails, try to extract job information using regex
        console.warn('Failed to parse JSON response, attempting text extraction');
        return this.extractJobsFromText(text);
      }
    } catch (error) {
      console.error('Gemini grounding search error:', error);
      throw new Error(`Grounding search failed: ${error}`);
    }
  }

  async parseJobText(jobText: string): Promise<GroundingResult[]> {
    try {
      const parsePrompt = `
        Parse the following job listing text and extract structured job information.
        Return the data in JSON format with the following structure:
        
        {
          "jobs": [
            {
              "title": "Job Title",
              "company": "Company Name",
              "location": "Location",
              "salary": "Salary range if mentioned",
              "description": "Job description",
              "job_type": "Full-time/Part-time/Contract",
              "remote": true/false,
              "requirements": ["requirement1", "requirement2"],
              "skills": ["skill1", "skill2", "skill3"],
              "experience_level": "Entry/Mid/Senior level if mentioned"
            }
          ]
        }
        
        Job text to parse:
        ${jobText}
      `;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${this.getApiKey()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: parsePrompt }] }],
        })
      });

      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      try {
        const parsed = JSON.parse(text);
        return parsed.jobs || [];
      } catch (parseError) {
        return this.extractJobsFromText(text);
      }
    } catch (error) {
      console.error('Job text parsing error:', error);
      throw new Error(`Job parsing failed: ${error}`);
    }
  }

  async parseRSSFeed(rssContent: string): Promise<GroundingResult[]> {
    try {
      const parsePrompt = `
        Parse the following RSS feed content and extract job listings.
        Return structured job data in JSON format:
        
        {
          "jobs": [
            {
              "title": "Job Title",
              "company": "Company Name",
              "location": "Location",
              "description": "Job description",
              "url": "Job URL",
              "posted_date": "Publication date",
              "job_type": "Full-time/Part-time/Contract",
              "remote": true/false,
              "skills": ["extracted skills"]
            }
          ]
        }
        
        RSS content:
        ${rssContent}
      `;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${this.getApiKey()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: parsePrompt }] }],
        })
      });

      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      try {
        const parsed = JSON.parse(text);
        return parsed.jobs || [];
      } catch (parseError) {
        return this.extractJobsFromText(text);
      }
    } catch (error) {
      console.error('RSS parsing error:', error);
      throw new Error(`RSS parsing failed: ${error}`);
    }
  }

  private extractJobsFromText(text: string): GroundingResult[] {
    // Fallback method to extract job information from unstructured text
    const jobs: GroundingResult[] = [];
    
    // This is a simplified extraction - in production, you'd want more sophisticated parsing
    const lines = text.split('\n').filter(line => line.trim());
    let currentJob: Partial<GroundingResult> = {};
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.toLowerCase().includes('title:') || 
          trimmedLine.toLowerCase().includes('position:')) {
        if (currentJob.title) {
          jobs.push(currentJob as GroundingResult);
          currentJob = {};
        }
        currentJob.title = trimmedLine.split(':')[1]?.trim() || trimmedLine;
      } else if (trimmedLine.toLowerCase().includes('company:')) {
        currentJob.company = trimmedLine.split(':')[1]?.trim() || '';
      } else if (trimmedLine.toLowerCase().includes('location:')) {
        currentJob.location = trimmedLine.split(':')[1]?.trim() || '';
      } else if (trimmedLine.toLowerCase().includes('salary:')) {
        currentJob.salary = trimmedLine.split(':')[1]?.trim() || '';
      }
    }
    
    if (currentJob.title && currentJob.company) {
      jobs.push(currentJob as GroundingResult);
    }
    
    return jobs;
  }
}

export const geminiService = new GeminiService();