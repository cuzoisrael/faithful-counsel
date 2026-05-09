
CREATE TABLE public.counselors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  email TEXT,
  phone TEXT,
  specialties TEXT[],
  display_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.counselors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active counselors"
ON public.counselors FOR SELECT
USING (active = true);

CREATE POLICY "Admins can view all counselors"
ON public.counselors FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert counselors"
ON public.counselors FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update counselors"
ON public.counselors FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete counselors"
ON public.counselors FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_counselors_updated_at
BEFORE UPDATE ON public.counselors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
