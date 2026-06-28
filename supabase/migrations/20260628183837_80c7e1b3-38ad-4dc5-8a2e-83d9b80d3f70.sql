
DROP POLICY IF EXISTS "Public reads time off" ON public.counselor_time_off;
CREATE POLICY "Authenticated reads time off windows"
  ON public.counselor_time_off
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can log resource downloads"
  ON public.resource_downloads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

DROP POLICY IF EXISTS "Anyone can insert contact messages" ON public.contact_messages;
CREATE POLICY "Anyone can insert contact messages"
  ON public.contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(full_name) BETWEEN 1 AND 200
    AND char_length(email) BETWEEN 3 AND 320
    AND char_length(subject) BETWEEN 1 AND 300
    AND char_length(message) BETWEEN 1 AND 5000
    AND read = false
  );

DROP POLICY IF EXISTS "Anyone can insert testimonials" ON public.testimonials;
CREATE POLICY "Anyone can insert testimonials"
  ON public.testimonials
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(full_name) BETWEEN 1 AND 200
    AND char_length(testimonial_text) BETWEEN 1 AND 5000
    AND rating BETWEEN 1 AND 5
    AND status = 'pending'
  );

DROP POLICY IF EXISTS "Anyone can insert registrations" ON public.conference_registrations;
CREATE POLICY "Anyone can insert registrations"
  ON public.conference_registrations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(participant_name) BETWEEN 1 AND 200
    AND char_length(email) BETWEEN 3 AND 320
    AND char_length(phone) BETWEEN 3 AND 50
    AND char_length(event_name) BETWEEN 1 AND 300
    AND num_seats BETWEEN 1 AND 50
  );

DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe"
  ON public.newsletter_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (char_length(email) BETWEEN 3 AND 320);
