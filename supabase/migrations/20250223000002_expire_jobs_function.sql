-- Function to expire jobs based on deadline
CREATE OR REPLACE FUNCTION expire_jobs()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  expired_count integer;
BEGIN
  UPDATE jobs
  SET status = 'expired'
  WHERE status = 'active'
    AND deadline IS NOT NULL
    AND deadline < CURRENT_DATE
    AND deadline < now()::date;

  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$;
