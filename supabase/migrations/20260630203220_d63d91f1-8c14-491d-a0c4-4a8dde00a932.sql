
REVOKE SELECT, INSERT ON public.auth_signin_attempts FROM anon, authenticated;
DROP POLICY IF EXISTS "insert_attempts_anyone" ON public.auth_signin_attempts;
DROP POLICY IF EXISTS "read_own_email_attempts" ON public.auth_signin_attempts;
CREATE POLICY "no_direct_access" ON public.auth_signin_attempts FOR SELECT TO authenticated USING (false);
