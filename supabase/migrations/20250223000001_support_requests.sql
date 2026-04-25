-- Support Requests table for contact form
CREATE TABLE IF NOT EXISTS public.support_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name character varying(255) NOT NULL,
  email character varying(255) NOT NULL,
  subject character varying(500) NOT NULL,
  message text NOT NULL,
  status character varying(50) NULL DEFAULT 'pending'::character varying,
  created_at timestamp without time zone NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_support_requests_status ON public.support_requests USING btree (status);
CREATE INDEX IF NOT EXISTS idx_support_requests_created_at ON public.support_requests USING btree (created_at);

-- Enable RLS
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert support requests (public form)
CREATE POLICY "Anyone can create support requests"
  ON public.support_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow admins to view and update support requests
CREATE POLICY "Admins can view support requests"
  ON public.support_requests
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can update support requests"
  ON public.support_requests
  FOR UPDATE
  TO authenticated
  USING (true);
