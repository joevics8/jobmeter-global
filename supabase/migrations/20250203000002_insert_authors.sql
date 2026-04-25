-- Insert author profiles
-- Author 1: JobMeter Team
INSERT INTO authors (slug, name, bio, image_url, email, twitter_url, linkedin_url, website_url)
VALUES (
  'jobmeter-team',
  'JobMeter Team',
  'The JobMeter editorial team brings you the latest career insights, job search strategies, and industry trends to help you advance your professional journey. Our experts curate valuable content to empower job seekers and career professionals.',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL
)
ON CONFLICT (slug) DO NOTHING;

-- Author 2: Joshua Victor (Recruiter)
INSERT INTO authors (slug, name, bio, image_url, email, twitter_url, linkedin_url, website_url)
VALUES (
  'joshua-victor',
  'Joshua Victor',
  'Joshua Victor is an experienced recruiter with expertise in talent acquisition and hiring strategies. With years of experience matching candidates with their dream roles, he shares insider tips on what recruiters look for and how to stand out in the job market.',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL
)
ON CONFLICT (slug) DO NOTHING;

-- Author 3: Everlyn John (HR Professional)
INSERT INTO authors (slug, name, bio, image_url, email, twitter_url, linkedin_url, website_url)
VALUES (
  'everlyn-john',
  'Everlyn John',
  'Everlyn John is a seasoned HR Professional specializing in workplace culture, employee development, and organizational growth. She provides practical advice on navigating workplace challenges, professional development, and building a fulfilling career.',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL
)
ON CONFLICT (slug) DO NOTHING;

-- Update existing blogs to link to authors (optional - run after populating authors table)
-- Example: Update posts to link to Joshua Victor
-- UPDATE blogs SET author_id = (SELECT id FROM authors WHERE slug = 'joshua-victor') WHERE author_name ILIKE '%joshua%';

-- Example: Update posts to link to Everlyn John
-- UPDATE blogs SET author_id = (SELECT id FROM authors WHERE slug = 'everlyn-john') WHERE author_name ILIKE '%everlyn%';

-- Example: Update remaining posts to link to JobMeter Team (default)
-- UPDATE blogs SET author_id = (SELECT id FROM authors WHERE slug = 'jobmeter-team') WHERE author_id IS NULL;
