
-- Extend counselors
ALTER TABLE public.counselors
  ADD COLUMN IF NOT EXISTS years_experience integer,
  ADD COLUMN IF NOT EXISTS credentials text;

-- Intake forms
CREATE TABLE IF NOT EXISTS public.intake_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL,
  user_id uuid NOT NULL,
  medical_history text,
  current_medications text,
  allergies text,
  emotional_history text,
  presenting_concerns text,
  family_history text,
  prior_therapy text,
  emergency_contact_name text,
  emergency_contact_phone text,
  consent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (booking_id)
);

ALTER TABLE public.intake_forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own intake" ON public.intake_forms
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own intake" ON public.intake_forms
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own intake" ON public.intake_forms
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all intake" ON public.intake_forms
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_intake_forms_updated_at
  BEFORE UPDATE ON public.intake_forms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed counselors (only if table is empty)
INSERT INTO public.counselors (name, title, bio, specialties, years_experience, credentials, display_order, active)
SELECT * FROM (VALUES
  ('Dr. Adaeze Okafor', 'Lead Marriage & Family Counselor',
   'Dr. Adaeze brings over 15 years of faith-based counseling experience, helping couples and families rebuild trust, communication, and intimacy through Christ-centered approaches.',
   ARRAY['Marriage Counseling','Family Therapy','Pre-marital Counseling']::text[], 15,
   'PhD Clinical Psychology, Licensed Marriage & Family Therapist (LMFT)', 1, true),
  ('Pastor James Adeyemi', 'Senior Pastoral Counselor',
   'Pastor James integrates biblical wisdom with modern counseling techniques to guide clients through spiritual struggles, grief, and life transitions.',
   ARRAY['Pastoral Counseling','Grief & Loss','Spiritual Direction']::text[], 20,
   'MDiv, Certified Pastoral Counselor (CPC)', 2, true),
  ('Mrs. Chioma Eze', 'Mental Health & Trauma Specialist',
   'Chioma specializes in trauma recovery, anxiety, and depression with a compassionate, faith-informed approach that meets clients where they are.',
   ARRAY['Trauma Therapy','Anxiety & Depression','EMDR']::text[], 10,
   'MSc Clinical Counseling, Licensed Professional Counselor (LPC)', 3, true)
) AS v(name, title, bio, specialties, years_experience, credentials, display_order, active)
WHERE NOT EXISTS (SELECT 1 FROM public.counselors LIMIT 1);
