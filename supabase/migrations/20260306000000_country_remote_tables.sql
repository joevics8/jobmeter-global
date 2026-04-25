-- Remote Categories Table
CREATE TABLE IF NOT EXISTS remote_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  job_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Location Pages Table (for custom country landing pages)
CREATE TABLE IF NOT EXISTS location_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  hero_content TEXT,
  meta_title TEXT,
  meta_description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default remote categories
INSERT INTO remote_categories (slug, name, description, display_order) VALUES
('marketing', 'Marketing', 'Find remote marketing jobs including digital marketing, SEO, and content marketing positions', 1),
('graphic-design', 'Graphic Design', 'Remote graphic design jobs, UI/UX design, and creative positions', 2),
('business-analyst', 'Business Analyst', 'Remote business analysis positions and consulting roles', 3),
('administrative-assistant', 'Administrative Assistant', 'Remote administrative and virtual assistant jobs', 4),
('healthcare', 'Healthcare', 'Remote healthcare jobs, medical coding, and healthtech positions', 5),
('copywriting', 'Copywriting', 'Remote copywriting and content writing opportunities', 6),
('video-editing', 'Video Editing', 'Remote video editing and post-production jobs', 7),
('ai-prompt-engineering', 'AI Prompt Engineering', 'Remote AI and prompt engineering positions', 8),
('software-development', 'Software Development', 'Remote software developer, engineer, and programmer jobs', 9),
('customer-service', 'Customer Service', 'Remote customer support and service positions', 10),
('data-entry', 'Data Entry', 'Remote data entry and transcription jobs', 11),
('virtual-assistant', 'Virtual Assistant', 'Remote virtual assistant and admin support roles', 12)
ON CONFLICT (slug) DO NOTHING;

-- Insert default location pages
INSERT INTO location_pages (country, slug, title, description, is_active) VALUES
('United States', 'usa', 'Jobs in USA', 'Find employment opportunities in the United States', true),
('Canada', 'canada', 'Jobs in Canada', 'Find employment opportunities in Canada', true),
('Australia', 'australia', 'Jobs in Australia', 'Find employment opportunities in Australia', true),
('New Zealand', 'new-zealand', 'Jobs in New Zealand', 'Find employment opportunities in New Zealand', true),
('United Kingdom', 'united-kingdom', 'Jobs in UK', 'Find employment opportunities in the United Kingdom', true),
('France', 'france', 'Jobs in France', 'Find employment opportunities in France', true),
('Germany', 'germany', 'Jobs in Germany', 'Find employment opportunities in Germany', true),
('Spain', 'spain', 'Jobs in Spain', 'Find employment opportunities in Spain', true),
('United Arab Emirates', 'uae', 'Jobs in UAE', 'Find employment opportunities in UAE', true)
ON CONFLICT (slug) DO NOTHING;

-- Enable RLS
ALTER TABLE remote_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_pages ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public can read remote_categories" ON remote_categories FOR SELECT USING (true);
CREATE POLICY "Public can read location_pages" ON location_pages FOR SELECT USING (true);
