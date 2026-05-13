
DROP VIEW IF EXISTS public.counselors_public;
CREATE VIEW public.counselors_public WITH (security_invoker = true) AS
SELECT id, name, title, bio, image_url, specialties, years_experience, credentials, display_order, active, created_at, updated_at
FROM public.counselors
WHERE active = true;
GRANT SELECT ON public.counselors_public TO anon, authenticated;
