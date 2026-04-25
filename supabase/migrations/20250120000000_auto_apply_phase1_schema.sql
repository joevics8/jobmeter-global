/*
  # Auto-Apply System - Phase 1: Database Schema & Foundation
  
  This migration creates all necessary tables and updates existing tables
  for the premium auto-apply functionality.
  
  1. New Tables:
    - premium_plans: Reference table for plan types (Pro, Max, Elite)
    - user_subscriptions: Tracks active premium subscriptions
    - job_applications: Records all job applications (auto and manual)
    - auto_apply_queue: Queue for managing auto-apply jobs (optional)
    - application_notifications: Notifications for application events
  
  2. Updates:
    - server_match_results: Add auto-apply tracking fields
  
  3. Indexes & RLS:
    - Performance indexes on all new tables
    - Row Level Security policies
*/

-- ============================================
-- 1. PREMIUM PLANS TABLE (Reference Table)
-- ============================================
CREATE TABLE IF NOT EXISTS public.premium_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE, -- 'Pro', 'Max', 'Elite'
  monthly_application_limit integer NOT NULL, -- 15, 30, 90
  price_naira integer NOT NULL, -- 3000, 5000, 10000
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT premium_plans_monthly_limit_check CHECK (monthly_application_limit > 0),
  CONSTRAINT premium_plans_price_check CHECK (price_naira > 0)
);

-- Insert the three premium plans
INSERT INTO public.premium_plans (name, monthly_application_limit, price_naira, is_active)
VALUES
  ('Pro', 15, 3000, true),
  ('Max', 30, 5000, true),
  ('Elite', 90, 10000, true)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 2. USER SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.premium_plans(id) ON DELETE RESTRICT,
  plan_type text NOT NULL, -- 'Pro', 'Max', 'Elite' (denormalized for quick access)
  applications_used_this_month integer NOT NULL DEFAULT 0,
  monthly_reset_date date NOT NULL, -- Date when counter resets (typically 1st of month)
  is_active boolean NOT NULL DEFAULT true,
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz, -- NULL for active subscriptions
  canceled_at timestamptz, -- NULL if not canceled
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_subscriptions_user_id_key UNIQUE (user_id), -- One active subscription per user
  CONSTRAINT user_subscriptions_applications_check CHECK (applications_used_this_month >= 0),
  CONSTRAINT user_subscriptions_plan_type_check CHECK (plan_type IN ('Pro', 'Max', 'Elite'))
);

-- ============================================
-- 3. JOB APPLICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  plan_type text, -- 'Pro', 'Max', 'Elite' (for auto-applied jobs)
  application_method text NOT NULL, -- 'auto', 'manual'
  application_email text, -- Recipient email address
  application_status text NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'retrying'
  cv_generated_at timestamptz,
  cover_letter_generated_at timestamptz,
  ses_message_id text, -- AWS SES message ID for tracking
  error_message text,
  retry_count integer NOT NULL DEFAULT 0,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT job_applications_user_job_key UNIQUE (user_id, job_id), -- Prevent duplicate applications
  CONSTRAINT job_applications_method_check CHECK (application_method IN ('auto', 'manual')),
  CONSTRAINT job_applications_status_check CHECK (application_status IN ('pending', 'sent', 'failed', 'retrying')),
  CONSTRAINT job_applications_plan_type_check CHECK (plan_type IN ('Pro', 'Max', 'Elite') OR plan_type IS NULL),
  CONSTRAINT job_applications_retry_count_check CHECK (retry_count >= 0)
);

-- ============================================
-- 4. UPDATE server_match_results TABLE
-- ============================================
-- Add auto-apply tracking columns
ALTER TABLE public.server_match_results
  ADD COLUMN IF NOT EXISTS is_auto_apply_eligible boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS auto_apply_rank integer, -- 1-20, based on match score ranking
  ADD COLUMN IF NOT EXISTS queued_for_auto_apply_at timestamptz,
  ADD COLUMN IF NOT EXISTS plan_type text, -- 'Pro', 'Max', 'Elite'
  ADD COLUMN IF NOT EXISTS notification_sent_at timestamptz; -- Track when notification was sent

-- Add constraints (using DO block since ADD CONSTRAINT IF NOT EXISTS doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'server_match_results_plan_type_check'
  ) THEN
    ALTER TABLE public.server_match_results
      ADD CONSTRAINT server_match_results_plan_type_check 
        CHECK (plan_type IN ('Pro', 'Max', 'Elite') OR plan_type IS NULL);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'server_match_results_rank_check'
  ) THEN
    ALTER TABLE public.server_match_results
      ADD CONSTRAINT server_match_results_rank_check 
        CHECK (auto_apply_rank IS NULL OR (auto_apply_rank >= 1 AND auto_apply_rank <= 20));
  END IF;
END $$;

-- ============================================
-- 5. AUTO-APPLY QUEUE TABLE (Optional, for better tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS public.auto_apply_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id uuid NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  match_result_id uuid REFERENCES public.server_match_results(id) ON DELETE SET NULL,
  plan_type text NOT NULL, -- 'Pro', 'Max', 'Elite'
  priority integer NOT NULL, -- 1-20, based on match score (lower = higher priority)
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  scheduled_for timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT auto_apply_queue_plan_type_check CHECK (plan_type IN ('Pro', 'Max', 'Elite')),
  CONSTRAINT auto_apply_queue_status_check CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  CONSTRAINT auto_apply_queue_priority_check CHECK (priority >= 1 AND priority <= 20)
);

-- ============================================
-- 6. APPLICATION NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.application_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id uuid REFERENCES public.jobs(id) ON DELETE CASCADE,
  application_id uuid REFERENCES public.job_applications(id) ON DELETE CASCADE,
  notification_type text NOT NULL, -- 'application_sent', 'application_failed', 'monthly_limit_reached'
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT application_notifications_type_check CHECK (
    notification_type IN ('application_sent', 'application_failed', 'monthly_limit_reached')
  )
);

-- ============================================
-- 7. INDEXES FOR PERFORMANCE
-- ============================================

-- Premium Plans indexes (small table, minimal indexes needed)
CREATE INDEX IF NOT EXISTS idx_premium_plans_active 
  ON public.premium_plans(is_active) WHERE is_active = true;

-- User Subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id 
  ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_active 
  ON public.user_subscriptions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_type 
  ON public.user_subscriptions(plan_type) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_reset_date 
  ON public.user_subscriptions(monthly_reset_date);

-- Job Applications indexes
CREATE INDEX IF NOT EXISTS idx_job_applications_user_id 
  ON public.job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id 
  ON public.job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status 
  ON public.job_applications(application_status);
CREATE INDEX IF NOT EXISTS idx_job_applications_method 
  ON public.job_applications(application_method);
CREATE INDEX IF NOT EXISTS idx_job_applications_created_at 
  ON public.job_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_applications_user_status 
  ON public.job_applications(user_id, application_status);
CREATE INDEX IF NOT EXISTS idx_job_applications_sent_at 
  ON public.job_applications(sent_at DESC) WHERE sent_at IS NOT NULL;

-- server_match_results new indexes for auto-apply
CREATE INDEX IF NOT EXISTS idx_server_match_results_auto_apply_eligible 
  ON public.server_match_results(is_auto_apply_eligible) 
  WHERE is_auto_apply_eligible = true;
CREATE INDEX IF NOT EXISTS idx_server_match_results_plan_type 
  ON public.server_match_results(plan_type) 
  WHERE is_auto_apply_eligible = true;
CREATE INDEX IF NOT EXISTS idx_server_match_results_queued_at 
  ON public.server_match_results(queued_for_auto_apply_at) 
  WHERE queued_for_auto_apply_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_server_match_results_user_plan_eligible 
  ON public.server_match_results(user_id, plan_type, is_auto_apply_eligible);

-- Auto-Apply Queue indexes
CREATE INDEX IF NOT EXISTS idx_auto_apply_queue_user_id 
  ON public.auto_apply_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_auto_apply_queue_status 
  ON public.auto_apply_queue(status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_auto_apply_queue_scheduled 
  ON public.auto_apply_queue(scheduled_for) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_auto_apply_queue_plan_type 
  ON public.auto_apply_queue(plan_type, status, scheduled_for);

-- Application Notifications indexes
CREATE INDEX IF NOT EXISTS idx_application_notifications_user_id 
  ON public.application_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_application_notifications_read 
  ON public.application_notifications(read) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_application_notifications_user_read 
  ON public.application_notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_application_notifications_created_at 
  ON public.application_notifications(created_at DESC);

-- ============================================
-- 8. UPDATED_AT TRIGGERS
-- ============================================

-- Create/ensure update_updated_at_column function exists (without schema qualification to match existing migrations)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables with updated_at
-- Note: Since these are new tables, triggers won't exist yet, so no DROP needed
CREATE TRIGGER update_premium_plans_updated_at 
  BEFORE UPDATE ON public.premium_plans 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at 
  BEFORE UPDATE ON public.user_subscriptions 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_applications_updated_at 
  BEFORE UPDATE ON public.job_applications 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 9. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all new tables
ALTER TABLE public.premium_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_apply_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_notifications ENABLE ROW LEVEL SECURITY;

-- Premium Plans: Read-only for authenticated users
-- Note: Since these are new tables, policies won't exist yet, so no DROP needed
CREATE POLICY "Premium plans are viewable by authenticated users"
  ON public.premium_plans
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- User Subscriptions: Users can view and update their own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON public.user_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON public.user_subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Job Applications: Users can view their own applications
CREATE POLICY "Users can view own applications"
  ON public.job_applications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications"
  ON public.job_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Auto-Apply Queue: Service role only (no user access)
CREATE POLICY "Auto-apply queue is service role only"
  ON public.auto_apply_queue
  FOR ALL
  TO authenticated
  USING (false); -- Users cannot access queue directly

-- Application Notifications: Users can view and update their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.application_notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.application_notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- 10. HELPER FUNCTION: Get Monthly Reset Date
-- ============================================
-- Function to calculate next monthly reset date (1st of next month)
-- Note: Cannot be IMMUTABLE since it uses now(), must be VOLATILE
CREATE OR REPLACE FUNCTION get_next_monthly_reset_date()
RETURNS date AS $$
BEGIN
  RETURN date_trunc('month', now() + interval '1 month')::date;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- ============================================
-- 11. HELPER FUNCTION: Reset Monthly Application Count
-- ============================================
-- Function to reset application counts for subscriptions past their reset date
CREATE OR REPLACE FUNCTION reset_monthly_application_counts()
RETURNS void AS $$
BEGIN
  UPDATE public.user_subscriptions
  SET 
    applications_used_this_month = 0,
    monthly_reset_date = get_next_monthly_reset_date(),
    updated_at = now()
  WHERE 
    is_active = true
    AND monthly_reset_date <= CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- NOTES
-- ============================================
-- 1. Premium plans are inserted via INSERT with ON CONFLICT to avoid duplicates
-- 2. user_subscriptions has UNIQUE constraint on user_id (one active subscription per user)
-- 3. job_applications has UNIQUE constraint on (user_id, job_id) to prevent duplicates
-- 4. Auto-apply queue is optional but recommended for better tracking and retry logic
-- 5. RLS policies ensure users can only access their own data
-- 6. Service role will need to bypass RLS for auto-apply operations (use service_role key)
-- 7. Monthly reset function can be called daily via cron to reset counters

