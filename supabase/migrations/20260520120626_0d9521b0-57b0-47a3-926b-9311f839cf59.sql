
-- ============ A: intake hardening + file uploads ============

-- Verify booking_id belongs to the same user_id when inserting/updating intake_forms
CREATE OR REPLACE FUNCTION public.verify_intake_booking_ownership()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  bk_user uuid;
BEGIN
  SELECT user_id INTO bk_user FROM public.bookings WHERE id = NEW.booking_id;
  IF bk_user IS NULL THEN
    RAISE EXCEPTION 'Booking does not exist';
  END IF;
  IF bk_user IS DISTINCT FROM NEW.user_id THEN
    RAISE EXCEPTION 'Intake form user_id must match the booking owner';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS verify_intake_booking_ownership_trg ON public.intake_forms;
CREATE TRIGGER verify_intake_booking_ownership_trg
BEFORE INSERT OR UPDATE ON public.intake_forms
FOR EACH ROW EXECUTE FUNCTION public.verify_intake_booking_ownership();

-- Unique intake per booking
CREATE UNIQUE INDEX IF NOT EXISTS intake_forms_booking_id_unique ON public.intake_forms(booking_id);

-- Booking files bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('booking-files', 'booking-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: path layout = {user_id}/{booking_id}/{filename}
CREATE POLICY "Users read own booking files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'booking-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users upload own booking files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'booking-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own booking files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'booking-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins read all booking files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'booking-files' AND public.has_role(auth.uid(), 'admin'));

-- intake_files metadata
CREATE TABLE public.intake_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  booking_id uuid NOT NULL,
  file_path text NOT NULL,
  file_name text NOT NULL,
  file_size_bytes bigint,
  mime_type text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.intake_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own files" ON public.intake_files
FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own files" ON public.intake_files
FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own files" ON public.intake_files
FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins view all files" ON public.intake_files
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- ============ B: counselor availability ============

ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS counselor_id uuid;
CREATE INDEX IF NOT EXISTS bookings_counselor_id_idx ON public.bookings(counselor_id);

CREATE TABLE public.counselor_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  counselor_id uuid NOT NULL REFERENCES public.counselors(id) ON DELETE CASCADE,
  weekday smallint NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_time > start_time)
);
ALTER TABLE public.counselor_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads active availability" ON public.counselor_availability
FOR SELECT USING (active = true);
CREATE POLICY "Admins view all availability" ON public.counselor_availability
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage availability ins" ON public.counselor_availability
FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage availability upd" ON public.counselor_availability
FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage availability del" ON public.counselor_availability
FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.counselor_time_off (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  counselor_id uuid NOT NULL REFERENCES public.counselors(id) ON DELETE CASCADE,
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_at > start_at)
);
ALTER TABLE public.counselor_time_off ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public reads time off" ON public.counselor_time_off
FOR SELECT USING (true);
CREATE POLICY "Admins manage time_off ins" ON public.counselor_time_off
FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage time_off upd" ON public.counselor_time_off
FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage time_off del" ON public.counselor_time_off
FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============ D: custom intake form templates ============

CREATE TABLE public.intake_form_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  counselor_id uuid REFERENCES public.counselors(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  schema jsonb NOT NULL DEFAULT '[]'::jsonb,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.intake_form_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone reads active templates" ON public.intake_form_templates
FOR SELECT USING (active = true);
CREATE POLICY "Admins view all templates" ON public.intake_form_templates
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert templates" ON public.intake_form_templates
FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update templates" ON public.intake_form_templates
FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete templates" ON public.intake_form_templates
FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_intake_templates_updated_at
BEFORE UPDATE ON public.intake_form_templates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.intake_form_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES public.intake_form_templates(id) ON DELETE CASCADE,
  booking_id uuid NOT NULL,
  user_id uuid NOT NULL,
  responses jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (template_id, booking_id)
);
ALTER TABLE public.intake_form_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own responses" ON public.intake_form_responses
FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own responses" ON public.intake_form_responses
FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own responses" ON public.intake_form_responses
FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins view all responses" ON public.intake_form_responses
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER verify_response_booking_ownership_trg
BEFORE INSERT OR UPDATE ON public.intake_form_responses
FOR EACH ROW EXECUTE FUNCTION public.verify_intake_booking_ownership();

CREATE TRIGGER update_intake_responses_updated_at
BEFORE UPDATE ON public.intake_form_responses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
