
-- Resources table
CREATE TABLE public.resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('worksheet','reading','prayer-journal')),
  file_path text NOT NULL,
  file_size_bytes bigint,
  mime_type text,
  active boolean NOT NULL DEFAULT true,
  display_order int NOT NULL DEFAULT 0,
  downloads_count int NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active resources" ON public.resources
  FOR SELECT USING (active = true);

CREATE POLICY "Admins can view all resources" ON public.resources
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert resources" ON public.resources
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update resources" ON public.resources
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete resources" ON public.resources
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER set_resources_updated_at
  BEFORE UPDATE ON public.resources
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Download access log
CREATE TABLE public.resource_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id uuid NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  user_id uuid,
  ip_hash text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.resource_downloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view downloads" ON public.resource_downloads
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
-- inserts only via service role / edge function

CREATE INDEX idx_resource_downloads_resource ON public.resource_downloads(resource_id, created_at DESC);

-- Storage bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('resources', 'resources', false)
ON CONFLICT (id) DO NOTHING;

-- Admins can manage objects in the resources bucket
CREATE POLICY "Admins can read resource files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'resources' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can upload resource files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'resources' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update resource files" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'resources' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete resource files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'resources' AND has_role(auth.uid(), 'admin'));
