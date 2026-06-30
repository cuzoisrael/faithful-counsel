
CREATE TABLE public.reminder_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  channel TEXT NOT NULL DEFAULT 'whatsapp',
  status TEXT NOT NULL,
  recipient TEXT,
  provider_response TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
CREATE INDEX idx_reminder_logs_booking ON public.reminder_logs(booking_id);
CREATE INDEX idx_reminder_logs_created ON public.reminder_logs(created_at DESC);
GRANT SELECT ON public.reminder_logs TO authenticated;
GRANT ALL ON public.reminder_logs TO service_role;
ALTER TABLE public.reminder_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view reminder logs" ON public.reminder_logs FOR SELECT USING (public.has_role(auth.uid(), 'admin'::app_role));
