// CV Data Types - Structured data format for CV storage and rendering

export interface CVData {
  personalDetails: {
    name: string;
    title: string; // Professional title tailored to the job
    email: string;
    phone: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
    location: string;
  };
  summary: string; // Professional summary (3-4 sentences, tailored to job)
  roles?: string[]; // Professional roles (rewritten slightly to match job)
  experience?: Array<{
    role: string;
    company: string;
    years: string; // e.g., "2020 - Present"
    bullets: string[]; // Responsibilities and achievements
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    years: string;
  }>;
  skills: string[]; // Up to 15 skills, most relevant to job
  projects?: Array<{
    title: string;
    description: string;
  }>;
  accomplishments?: string[];
  awards?: Array<{
    title: string;
    issuer?: string;
    year?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer?: string;
    year?: string;
  }>;
  languages?: string[];
  interests?: string[];
  publications?: Array<{
    title: string;
    journal?: string;
    year?: string;
  }>;
  volunteerWork?: Array<{
    organization: string;
    role?: string;
    duration?: string;
    description?: string;
  }>;
  additionalSections?: Array<{
    sectionName: string;
    content: string;
  }>;
}

export interface CVTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
}

// CV Templates (6 templates)
export const CV_TEMPLATES: CVTemplate[] = [
  {
    id: 'template-1',
    name: 'Purple Classic',
    description: 'Traditional professional layout with clean typography',
    category: 'Professional'
  },
  {
    id: 'template-2',
    name: 'Burgundy Elegant',
    description: 'Bold colors and contemporary design',
    category: 'Creative'
  },
  {
    id: 'template-3',
    name: 'Purple Modern',
    description: 'Simple, elegant design focusing on content',
    category: 'Minimal'
  },
  {
    id: 'template-5',
    name: 'Blue Professional',
    description: 'Sophisticated layout for senior leadership',
    category: 'Executive'
  },
  {
    id: 'template-6',
    name: 'Clean Professional',
    description: 'Academic-focused design',
    category: 'Academic'
  }
];




