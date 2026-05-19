# Build Plan — IACPD platform expansion

You've asked for ~12 substantial features in one go. To ship them well I'll group them into phases. Each phase is independently shippable; please confirm the order (or trim) before I start.

---

## New domain: iacpd.org

You've registered `iacpd.org` at GoDaddy. To use it I'll need you to:
1. Connect it as a custom domain in **Project Settings → Domains** (so the site serves from `iacpd.org`).
2. Approve a Lovable Email setup on `notify.iacpd.org` so booking/contact/reminder emails come from `notify@iacpd.org`. I'll trigger the setup dialog when you're ready.

Once the domain is live I'll update SEO canonicals, sitemap, JSON-LD, and the og: tags from `iacpd.lovable.app` → `iacpd.org`.

---

## Phase 1 — Contact, WhatsApp, and Resources admin (small, fast wins)
- Replace contact/WhatsApp display sitewide with click-to-chat `https://wa.me/447448519299` links, consistent number on Header, Footer, Contact, Counselors.
- New `resources` table (title, description, category, file_path, active, downloads_count) + storage bucket `resources` (private).
- Admin page `/admin/resources` to upload, categorize, toggle active, and see download counts.
- Public `/resources` reads from DB instead of static data; downloads go through a signed-URL edge function (`resource-download`) that logs each access to `resource_downloads`.

## Phase 2 — Counselor admin + intake hardening
- Extend the existing `/admin/counselors` page with full profile editor (specialties array, credentials, years_experience, bio, image upload, active toggle, display_order drag).
- Tighten `intake_forms` RLS: add a trigger that verifies `booking_id` belongs to `auth.uid()` on insert/update; return clear field-level errors via a Postgres function.
- Add file upload field to Intake Form and My Bookings (private `booking-files` bucket, RLS scoped to booking owner + admins/assigned counselor).

## Phase 3 — Calendar availability + booking engine
- New tables: `counselor_availability` (counselor_id, day_of_week, start_time, end_time), `counselor_time_off`, and link `bookings.counselor_id` to `counselors.id`.
- Counselor dashboard page `/counselor` (new role `counselor`) where they manage weekly hours and time off.
- `/bookings` page replaces the free-form date/time inputs with a real-time slot picker that calls a `get-available-slots` edge function (excludes existing bookings + time off).
- Realtime subscription on `bookings` so two users can't grab the same slot.

## Phase 4 — Admin analytics dashboard
- Extend `/admin` overview with:
  - Booking trends (last 30/90 days, line + bar)
  - Counselor performance: completed sessions count, avg rating from a new `session_ratings` table
  - Client engagement: repeat-client %, intake completion rate, resource download leaderboard
- Recharts; data via SQL views for performance.

## Phase 5 — Secure session notes
- New `session_notes` table (booking_id, counselor_id, content, created_at).
- RLS: only the booking's assigned counselor and admins can SELECT/INSERT/UPDATE.
- Stored encrypted at rest using `pgsodium` (or AES via edge function with key in Vault) — counselor sees plaintext after server-side decrypt.
- Inline note editor on `/admin/bookings/:id`.

## Phase 6 — Reminder system (email + SMS)
- Edge function `send-session-reminders` invoked by pg_cron every 15 min.
- 24h before `preferred_date + preferred_time`: send email (Lovable Emails) and SMS (Twilio connector — needs your approval to add).
- Email contains: session details, intake form link, "join digital session" link (placeholder URL field on booking).

---

## Semrush questions
You also asked three keyword/competitor research questions. I can answer them with the Semrush tool — they don't block the build. Confirm and I'll run them after Phase 1 ships, or in parallel.

---

## What I need from you
1. **Confirm phase order** (or pick which 2–3 to do first — I recommend Phase 1 + 2, then Phase 3).
2. **Approve Lovable Email setup on `notify.iacpd.org`** so reminders/notifications work.
3. **Approve Twilio connector** when we reach Phase 6 (SMS requires paid Twilio credits).
4. **Connect `iacpd.org` as the custom domain** in project settings whenever you're ready — I'll then sweep the SEO files.

Reply with the phases you want first and I'll start immediately.
