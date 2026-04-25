-- Role Finder Results table
CREATE TABLE IF NOT EXISTS role_finder_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  skills JSONB NOT NULL,
  tools JSONB DEFAULT '[]'::jsonb,
  years_of_experience INTEGER,
  result JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE role_finder_results ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for role finder)
CREATE POLICY "Allow insert for role finder" 
ON role_finder_results FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Allow users to view their own results
CREATE POLICY "Users can view own results"
ON role_finder_results FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow service role full access
CREATE POLICY "Service role full access"
ON role_finder_results
TO service_role
USING (true)
WITH CHECK (true);
