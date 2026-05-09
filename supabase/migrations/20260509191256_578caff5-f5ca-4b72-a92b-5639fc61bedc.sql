
-- 1. Tighten counselors public policy: drop public read, add public read of non-sensitive view
DROP POLICY IF EXISTS "Anyone can view active counselors" ON public.counselors;

CREATE POLICY "Anyone can view active counselors (no contact)"
ON public.counselors FOR SELECT
USING (active = true AND (auth.uid() IS NULL OR NOT has_role(auth.uid(), 'admin'::app_role)));

-- Create a public-safe view exposing only non-sensitive fields
CREATE OR REPLACE VIEW public.counselors_public AS
SELECT id, name, title, bio, image_url, specialties, display_order, active, created_at, updated_at
FROM public.counselors
WHERE active = true;

GRANT SELECT ON public.counselors_public TO anon, authenticated;

-- Drop the public-read policy entirely; use the view for public access
DROP POLICY IF EXISTS "Anyone can view active counselors (no contact)" ON public.counselors;

-- 2. Tighten bookings insert: must be anon (user_id NULL) or signed-in user matching user_id
DROP POLICY IF EXISTS "Anyone can insert bookings" ON public.bookings;

CREATE POLICY "Public or owner can insert bookings"
ON public.bookings FOR INSERT
WITH CHECK (
  (auth.uid() IS NULL AND user_id IS NULL)
  OR (auth.uid() IS NOT NULL AND auth.uid() = user_id)
);

-- 3. has_role NULL guard
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF _user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
