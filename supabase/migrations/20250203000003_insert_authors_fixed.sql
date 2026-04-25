-- First, ensure the authors table exists (run this only if table doesn't exist)
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

-- Create index on slug
CREATE INDEX IF NOT EXISTS idx_authors_slug ON authors(slug);

-- Delete any existing data with these slugs first (to avoid conflicts)
DELETE FROM authors WHERE slug IN ('jobmeter-team', 'joshua-victor', 'everlyn-john');

-- Insert author profiles
INSERT INTO authors (slug, name, bio, image_url, email, twitter_url, linkedin_url, website_url)
VALUES 
  (
    'jobmeter-team',
    'JobMeter Team',
    'The JobMeter editorial team brings you the latest career insights, job search strategies, and industry trends to help you advance your professional journey. Our experts curate valuable content to empower job seekers and career professionals.',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  ),
  (
    'joshua-victor',
    'Joshua Victor',
    'Joshua Victor is an experienced recruiter with expertise in talent acquisition and hiring strategies. With years of experience matching candidates with their dream roles, he shares insider tips on what recruiters look for and how to stand out in the job market.',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  ),
  (
    'everlyn-john',
    'Everlyn John',
    'Everlyn John is a seasoned HR Professional specializing in workplace culture, employee development, and organizational growth. She provides practical advice on navigating workplace challenges, professional development, and building a fulfilling career.',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
  );

-- Verify the insert worked
SELECT * FROM authors;

-- Check if blogs table has author_id column, if not add it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'blogs' AND column_name = 'author_id'
  ) THEN
    ALTER TABLE blogs ADD COLUMN author_id UUID REFERENCES authors(id);
    CREATE INDEX idx_blogs_author_id ON blogs(author_id);
  END IF;
END $$;
