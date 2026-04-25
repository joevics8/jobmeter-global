-- Step 1: Create quiz_companies table (if not exists)
CREATE TABLE IF NOT EXISTS quiz_companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE quiz_companies ENABLE ROW LEVEL SECURITY;

-- Allow public read access
DROP POLICY IF EXISTS "Public read access" ON quiz_companies;
CREATE POLICY "Public read access" ON quiz_companies FOR SELECT USING (true);

-- Allow authenticated users to insert/update
DROP POLICY IF EXISTS "Authenticated users can manage" ON quiz_companies;
CREATE POLICY "Authenticated users can manage" ON quiz_companies FOR ALL USING (auth.role() = 'authenticated');
