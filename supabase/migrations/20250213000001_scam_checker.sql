-- Fake Job / Company Checker Database Schema

-- Table to store reported entities (companies, recruiters, agencies)
CREATE TABLE IF NOT EXISTS reported_entities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('company', 'recruiter', 'agency', 'individual')),
  company_name VARCHAR(255) NOT NULL,
  aliases JSONB DEFAULT '[]'::jsonb,
  address TEXT,
  phone_numbers JSONB DEFAULT '[]'::jsonb,
  emails JSONB DEFAULT '[]'::jsonb,
  website VARCHAR(500),
  report_count INTEGER DEFAULT 1,
  verification_status VARCHAR(50) DEFAULT 'reported' CHECK (verification_status IN ('reported', 'under_review', 'confirmed', 'cleared', 'invalid')),
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table to store individual reports
CREATE TABLE IF NOT EXISTS scam_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_id UUID REFERENCES reported_entities(id) ON DELETE CASCADE,
  report_type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  evidence_url VARCHAR(500),
  user_email VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved', 'rejected')),
  reviewed_by UUID,
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better search performance
CREATE INDEX idx_reported_entities_company_name ON reported_entities(company_name text_pattern_ops);
CREATE INDEX idx_reported_entities_verification_status ON reported_entities(verification_status);
CREATE INDEX idx_reported_entities_entity_type ON reported_entities(entity_type);
CREATE INDEX idx_scam_reports_entity_id ON scam_reports(entity_id);
CREATE INDEX idx_scam_reports_status ON scam_reports(status);

-- Enable RLS
ALTER TABLE reported_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE scam_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reported_entities
CREATE POLICY "Anyone can search entities" 
ON reported_entities FOR SELECT
TO anon, authenticated
USING (
  is_published = TRUE 
  OR verification_status IN ('confirmed', 'under_review')
);

CREATE POLICY "Anyone can insert new entity" 
ON reported_entities FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Service role full access entities"
ON reported_entities
TO service_role
USING (true)
WITH CHECK (true);

-- RLS Policies for scam_reports
CREATE POLICY "Anyone can submit report" 
ON scam_reports FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Anyone can view approved reports" 
ON scam_reports FOR SELECT
TO anon, authenticated
USING (status = 'approved');

CREATE POLICY "Service role full access reports"
ON scam_reports
TO service_role
USING (true)
WITH CHECK (true);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reported_entities_updated_at
  BEFORE UPDATE ON reported_entities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scam_reports_updated_at
  BEFORE UPDATE ON scam_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some seed data for testing (will need is_published = true to show)
INSERT INTO reported_entities (entity_type, company_name, website, report_count, verification_status, is_published) VALUES
('company', 'Example Scam Corp', 'examplescam.com', 5, 'confirmed', true),
('recruiter', 'John Doe', null, 3, 'confirmed', true);
