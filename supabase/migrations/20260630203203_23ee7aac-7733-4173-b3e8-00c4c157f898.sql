
CREATE TABLE public.auth_signin_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  ip text,
  success boolean NOT NULL DEFAULT false,
  attempted_at timestamptz NOT NULL DEFAULT now(),
  locked_until timestamptz
);
CREATE INDEX idx_auth_signin_attempts_email_time ON public.auth_signin_attempts (lower(email), attempted_at DESC);
GRANT SELECT, INSERT ON public.auth_signin_attempts TO anon, authenticated;
GRANT ALL ON public.auth_signin_attempts TO service_role;
ALTER TABLE public.auth_signin_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "insert_attempts_anyone" ON public.auth_signin_attempts FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "read_own_email_attempts" ON public.auth_signin_attempts FOR SELECT TO anon, authenticated USING (true);

CREATE OR REPLACE FUNCTION public.check_signin_lockout(_email text)
RETURNS TABLE(locked boolean, locked_until timestamptz, failed_count int)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int;
  v_lock timestamptz;
BEGIN
  SELECT count(*) INTO v_count
  FROM public.auth_signin_attempts
  WHERE lower(email) = lower(_email)
    AND success = false
    AND attempted_at > now() - interval '15 minutes';

  SELECT max(a.locked_until) INTO v_lock
  FROM public.auth_signin_attempts a
  WHERE lower(a.email) = lower(_email)
    AND a.locked_until IS NOT NULL
    AND a.locked_until > now();

  RETURN QUERY SELECT (v_lock IS NOT NULL) OR (v_count >= 5), v_lock, v_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.record_signin_attempt(_email text, _success boolean)
RETURNS timestamptz
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int;
  v_lock timestamptz;
BEGIN
  IF _success THEN
    INSERT INTO public.auth_signin_attempts(email, success) VALUES (_email, true);
    RETURN NULL;
  END IF;

  SELECT count(*) INTO v_count
  FROM public.auth_signin_attempts
  WHERE lower(email) = lower(_email)
    AND success = false
    AND attempted_at > now() - interval '15 minutes';

  IF v_count + 1 >= 5 THEN
    v_lock := now() + interval '30 minutes';
  END IF;

  INSERT INTO public.auth_signin_attempts(email, success, locked_until)
  VALUES (_email, false, v_lock);

  RETURN v_lock;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_signin_lockout(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_signin_attempt(text, boolean) TO anon, authenticated;
