
CREATE OR REPLACE FUNCTION public.increment_resource_downloads(_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.resources SET downloads_count = downloads_count + 1 WHERE id = _id;
$$;

REVOKE EXECUTE ON FUNCTION public.increment_resource_downloads(uuid) FROM PUBLIC, anon, authenticated;
