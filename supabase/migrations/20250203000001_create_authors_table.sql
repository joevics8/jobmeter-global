-- Create authors table
CREATE TABLE IF NOT EXISTS authors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  email TEXT,
  twitter_url TEXT,
  linkedin_url TEXT,
  website_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index on slug for faster lookups
CREATE INDEX idx_authors_slug ON authors(slug);

-- Add author_id to blogs table
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES authors(id);

-- Create index on author_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_blogs_author_id ON blogs(author_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for authors table
CREATE TRIGGER update_authors_updated_at
  BEFORE UPDATE ON authors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies for authors table
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;

-- Allow public read access to authors
CREATE POLICY "Allow public read access" ON authors
  FOR SELECT USING (true);

-- Only allow authenticated users to insert/update (adjust as needed)
CREATE POLICY "Allow authenticated insert" ON authors
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update" ON authors
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
