// Cover Letter Data Types

export interface StructuredCoverLetter {
  personalInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    location?: string;
  };
  recipientInfo?: {
    name?: string;
    title?: string;
    company?: string;
    address?: string;
  };
  subject?: string; // For email format
  opening?: string;
  body1?: string;
  body2?: string;
  body3?: string;
  highlights?: string[]; // Optional bullet points (2-3)
  closing?: string;
  signoff?: string; // e.g., "Sincerely"
  meta?: {
    jobTitle?: string;
    company?: string;
    date?: string; // preformatted date string
  };
}

export interface CoverLetterTemplate {
  id: string;
  name: string;
  description: string;
}

// Cover Letter Templates (5 templates)
export const COVER_LETTER_TEMPLATES: CoverLetterTemplate[] = [
  {
    id: 'template-1',
    name: 'Classic',
    description: 'Traditional formal layout with centered header'
  },
  {
    id: 'template-2',
    name: 'Teal Accent',
    description: 'Modern design with teal accent line'
  },
  {
    id: 'template-3',
    name: 'Blue Header',
    description: 'Professional blue header with contact info'
  },
  {
    id: 'template-4',
    name: 'Blue Accent',
    description: 'Left blue accent stripe with clean layout'
  },
  {
    id: 'template-5',
    name: 'Minimal Modern',
    description: 'Clean, minimal design with subtle styling'
  }
];




