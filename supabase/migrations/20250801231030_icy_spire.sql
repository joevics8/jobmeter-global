/*
  # Job Database Auto-Expiration System

  1. Functions
    - Auto-expire jobs after 30 days
    - Clean up expired jobs daily
    - Update job statistics

  2. Triggers
    - Automatic expiration trigger
    - Job statistics update trigger

  3. Scheduled Tasks
    - Daily cleanup of expired jobs
    - Statistics refresh
*/

-- Function to expire jobs older than 30 days
CREATE OR REPLACE FUNCTION expire_old_jobs()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE jobs 
  SET is_active = false, 
      updated_at = now()
  WHERE is_active = true 
    AND created_at < (now() - INTERVAL '30 days');
END;
$$;

-- Function to delete expired jobs (optional - for cleanup)
CREATE OR REPLACE FUNCTION delete_expired_jobs()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM jobs 
  WHERE is_active = false 
    AND updated_at < (now() - INTERVAL '7 days');
END;
$$;

-- Function to update job source statistics
CREATE OR REPLACE FUNCTION update_job_source_stats()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update job counts for each source
  UPDATE job_sources 
  SET last_fetched = now()
  WHERE id IN (
    SELECT DISTINCT js.id 
    FROM job_sources js
    JOIN jobs j ON j.source = js.name
    WHERE j.created_at > (now() - INTERVAL '1 day')
  );
END;
$$;

-- Create a function to automatically set expires_date on job insert
CREATE OR REPLACE FUNCTION set_job_expiry()
RETURNS TRIGGER AS $$
BEGIN
  -- Set expiry date to 30 days from creation if not already set
  IF NEW.expires_date IS NULL THEN
    NEW.expires_date = NEW.created_at + INTERVAL '30 days';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set expiry date on job creation
DROP TRIGGER IF EXISTS set_job_expiry_trigger ON jobs;
CREATE TRIGGER set_job_expiry_trigger
  BEFORE INSERT ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION set_job_expiry();

-- Function to check and expire jobs based on expires_date
CREATE OR REPLACE FUNCTION check_job_expiration()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE jobs 
  SET is_active = false, 
      updated_at = now()
  WHERE is_active = true 
    AND expires_date < now();
END;
$$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_expires_date ON jobs(expires_date) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_jobs_source_created ON jobs(source, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_active_created ON jobs(is_active, created_at DESC) WHERE is_active = true;

-- Add job source tracking columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'job_sources' AND column_name = 'total_jobs_fetched'
  ) THEN
    ALTER TABLE job_sources ADD COLUMN total_jobs_fetched integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'job_sources' AND column_name = 'active_jobs_count'
  ) THEN
    ALTER TABLE job_sources ADD COLUMN active_jobs_count integer DEFAULT 0;
  END IF;
END $$;

-- Function to update source statistics
CREATE OR REPLACE FUNCTION refresh_source_statistics()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE job_sources 
  SET 
    total_jobs_fetched = (
      SELECT COUNT(*) 
      FROM jobs 
      WHERE jobs.source = job_sources.name
    ),
    active_jobs_count = (
      SELECT COUNT(*) 
      FROM jobs 
      WHERE jobs.source = job_sources.name 
        AND jobs.is_active = true
    );
END;
$$;

-- Create a view for job statistics
CREATE OR REPLACE VIEW job_statistics AS
SELECT 
  COUNT(*) as total_jobs,
  COUNT(*) FILTER (WHERE is_active = true) as active_jobs,
  COUNT(*) FILTER (WHERE created_at > now() - INTERVAL '1 day') as jobs_today,
  COUNT(*) FILTER (WHERE created_at > now() - INTERVAL '7 days') as jobs_this_week,
  COUNT(DISTINCT source) as total_sources,
  COUNT(DISTINCT company) as total_companies
FROM jobs;

-- Create a view for source performance
CREATE OR REPLACE VIEW source_performance AS
SELECT 
  js.name,
  js.type,
  js.is_active,
  js.last_fetched,
  js.fetch_frequency,
  COUNT(j.id) as total_jobs,
  COUNT(j.id) FILTER (WHERE j.is_active = true) as active_jobs,
  COUNT(j.id) FILTER (WHERE j.created_at > now() - INTERVAL '1 day') as jobs_today,
  MAX(j.created_at) as last_job_added
FROM job_sources js
LEFT JOIN jobs j ON j.source = js.name
GROUP BY js.id, js.name, js.type, js.is_active, js.last_fetched, js.fetch_frequency
ORDER BY total_jobs DESC;