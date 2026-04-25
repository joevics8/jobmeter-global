/*
  # JobPilot Jobs Database Schema

  1. New Tables
    - `jobs`
      - `id` (uuid, primary key)
      - `title` (text, job title)
      - `company` (text, company name)
      - `location` (text, job location)
      - `salary_min` (integer, minimum salary)
      - `salary_max` (integer, maximum salary)
      - `salary_currency` (text, salary currency)
      - `job_type` (text, full-time/part-time/contract)
      - `remote` (boolean, remote work option)
      - `description` (text, job description)
      - `requirements` (jsonb, array of requirements)
      - `skills` (jsonb, array of required skills)
      - `experience_level` (text, experience level required)
      - `source` (text, where job was found)
      - `source_url` (text, original job posting URL)
      - `posted_date` (timestamptz, when job was posted)
      - `expires_date` (timestamptz, when job expires)
      - `is_active` (boolean, job is still available)
      - `duplicate_hash` (text, for duplicate detection)
      - `created_at` (timestamptz, when added to database)
      - `updated_at` (timestamptz, last updated)

    - `job_sources`
      - `id` (uuid, primary key)
      - `name` (text, source name)
      - `type` (text, rss/grounding/scraping/manual)
      - `url` (text, source URL)
      - `is_active` (boolean, source is active)
      - `last_fetched` (timestamptz, last fetch time)
      - `fetch_frequency` (integer, hours between fetches)
      - `created_at` (timestamptz)

    - `grounding_searches`
      - `id` (uuid, primary key)
      - `query` (text, search query)
      - `role_category` (text, job role category)
      - `location` (text, search location)
      - `jobs_found` (integer, number of jobs found)
      - `status` (text, pending/completed/failed)
      - `error_message` (text, error if failed)
      - `created_at` (timestamptz)
      - `completed_at` (timestamptz)

    - `user_job_interactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `job_id` (uuid, references jobs)
      - `interaction_type` (text, viewed/saved/applied)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users and admin access
    - Add indexes for performance

  3. Functions
    - Duplicate detection function
    - Job matching score calculation
*/

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  company text NOT NULL,
  location text,
  salary_min integer,
  salary_max integer,
  salary_currency text DEFAULT 'USD',
  job_type text DEFAULT 'Full-time',
  remote boolean DEFAULT false,
  description text,
  requirements jsonb DEFAULT '[]'::jsonb,
  skills jsonb DEFAULT '[]'::jsonb,
  experience_level text,
  source text NOT NULL,
  source_url text,
  posted_date timestamptz,
  expires_date timestamptz,
  is_active boolean DEFAULT true,
  duplicate_hash text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Job sources table
CREATE TABLE IF NOT EXISTS job_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('rss', 'grounding', 'scraping', 'manual')),
  url text,
  is_active boolean DEFAULT true,
  last_fetched timestamptz,
  fetch_frequency integer DEFAULT 24,
  created_at timestamptz DEFAULT now()
);

-- Grounding searches table
CREATE TABLE IF NOT EXISTS grounding_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query text NOT NULL,
  role_category text,
  location text,
  jobs_found integer DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  error_message text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- User job interactions table
CREATE TABLE IF NOT EXISTS user_job_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
  interaction_type text NOT NULL CHECK (interaction_type IN ('viewed', 'saved', 'applied')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, job_id, interaction_type)
);

-- Enable RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE grounding_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_job_interactions ENABLE ROW LEVEL SECURITY;

-- Jobs policies
CREATE POLICY "Jobs are viewable by authenticated users"
  ON jobs
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admin can manage jobs"
  ON jobs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email LIKE '%@jobpilot.com'
    )
  );

-- Job sources policies
CREATE POLICY "Admin can manage job sources"
  ON job_sources
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email LIKE '%@jobpilot.com'
    )
  );

-- Grounding searches policies
CREATE POLICY "Admin can manage grounding searches"
  ON grounding_searches
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email LIKE '%@jobpilot.com'
    )
  );

-- User interactions policies
CREATE POLICY "Users can manage their own interactions"
  ON user_job_interactions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_jobs_title ON jobs(title);
CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_source ON jobs(source);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_duplicate_hash ON jobs(duplicate_hash);
CREATE INDEX IF NOT EXISTS idx_jobs_active ON jobs(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_job ON user_job_interactions(user_id, job_id);

-- Function to generate duplicate hash
CREATE OR REPLACE FUNCTION generate_duplicate_hash(
  job_title text,
  company_name text,
  source_url text DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN md5(
    lower(trim(job_title)) || '|' || 
    lower(trim(company_name)) || '|' || 
    COALESCE(lower(trim(source_url)), '')
  );
END;
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_jobs_updated_at 
  BEFORE UPDATE ON jobs 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate job match score for a user
CREATE OR REPLACE FUNCTION calculate_job_match_score(
  job_id uuid,
  user_roles jsonb,
  user_skills jsonb,
  user_location text DEFAULT NULL,
  user_salary_min integer DEFAULT NULL,
  user_salary_max integer DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  job_record jobs%ROWTYPE;
  role_score integer := 0;
  skill_score integer := 0;
  location_score integer := 0;
  salary_score integer := 0;
  total_score integer := 0;
BEGIN
  -- Get job details
  SELECT * INTO job_record FROM jobs WHERE id = job_id;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Role matching (40% weight)
  IF user_roles IS NOT NULL AND jsonb_array_length(user_roles) > 0 THEN
    IF lower(job_record.title) LIKE ANY(
      SELECT '%' || lower(value::text) || '%' 
      FROM jsonb_array_elements_text(user_roles)
    ) THEN
      role_score := 40;
    END IF;
  END IF;
  
  -- Skill matching (35% weight)
  IF user_skills IS NOT NULL AND job_record.skills IS NOT NULL THEN
    SELECT COUNT(*) * 35 / GREATEST(jsonb_array_length(job_record.skills), 1)
    INTO skill_score
    FROM (
      SELECT value FROM jsonb_array_elements_text(user_skills)
      INTERSECT
      SELECT value FROM jsonb_array_elements_text(job_record.skills)
    ) AS matched_skills;
    
    skill_score := LEAST(skill_score, 35);
  END IF;
  
  -- Location matching (15% weight)
  IF user_location IS NOT NULL AND job_record.location IS NOT NULL THEN
    IF lower(job_record.location) LIKE '%' || lower(user_location) || '%' 
       OR job_record.remote = true 
       OR lower(job_record.location) LIKE '%remote%' THEN
      location_score := 15;
    END IF;
  END IF;
  
  -- Salary matching (10% weight)
  IF user_salary_min IS NOT NULL AND job_record.salary_max IS NOT NULL THEN
    IF job_record.salary_max >= user_salary_min THEN
      salary_score := 10;
    END IF;
  END IF;
  
  total_score := role_score + skill_score + location_score + salary_score;
  
  RETURN LEAST(total_score, 100);
END;
$$;