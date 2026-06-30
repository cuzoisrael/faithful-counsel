
-- Extend reminder_logs to support delivery webhook updates, secret-rotation versioning, and admin throttling.
ALTER TABLE public.reminder_logs
  ADD COLUMN IF NOT EXISTS provider_message_id text,
  ADD COLUMN IF NOT EXISTS delivery_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz,
  ADD COLUMN IF NOT EXISTS status_updated_at timestamptz,
  ADD COLUMN IF NOT EXISTS triggered_by uuid,
  ADD COLUMN IF NOT EXISTS secret_version smallint;

CREATE INDEX IF NOT EXISTS idx_reminder_logs_msgid ON public.reminder_logs(provider_message_id);
CREATE INDEX IF NOT EXISTS idx_reminder_logs_triggered_by ON public.reminder_logs(triggered_by, created_at DESC);

-- Allow the booking owner (when signed in) to read their own reminder timeline; service-role still bypasses RLS for token-based reads.
DROP POLICY IF EXISTS "Booking owner can view their reminder logs" ON public.reminder_logs;
CREATE POLICY "Booking owner can view their reminder logs"
ON public.reminder_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.id = reminder_logs.booking_id
      AND b.user_id = auth.uid()
  )
);
