-- APPLIED 2026-10-21 to the Supabase project (migration rls_hardening_guest_form_owner_statements),
-- after Nico's approval. Before: anon SELECT 200 on both tables, anon INSERT passed RLS.
-- After: anon SELECT 401 on both, anon INSERT 401 (42501); service_role still 200.
--
-- Evidence (checked 2026-10-21): the only code that touches these tables is
--   guest_form_data  -> optima-web2026 app/api/my-booking/[id]/form/route.ts   (service_role)
--   owner_statements -> optima-dashboard + optima-dashboard-1 properties/[id]/page.tsx (service_role)
-- No repo reads them with the anon/authenticated key. NOT verifiable from here: n8n
-- workflows or any other external tool using the anon key against these tables.
--
-- Problem today: guest_form_data (passport/ID numbers) has policy "Allow all"
-- (ALL, USING true, role public) + full anon grants => anyone with the public anon key
-- (shipped in the browser) can read/modify/delete it. owner_statements: anon SELECT (true).

begin;

drop policy if exists "Allow all on guest_form_data" on public.guest_form_data;
revoke all on public.guest_form_data from anon, authenticated;

drop policy if exists "Allow read" on public.owner_statements;
drop policy if exists "Allow insert service role" on public.owner_statements;
revoke all on public.owner_statements from anon, authenticated;

-- Same permissive 'public' policies; currently harmless only because anon has no table
-- grant. Dropping them removes the latent risk (service_role bypasses RLS anyway).
drop policy if exists "Allow all on guest_conversations" on public.guest_conversations;
drop policy if exists "Allow all on guest_messages" on public.guest_messages;

commit;

-- Verify (as anon, expect 401/empty):  GET /rest/v1/guest_form_data?select=id
--
-- ROLLBACK (restores the previous, INSECURE state — only if something breaks):
--   create policy "Allow all on guest_form_data" on public.guest_form_data for all to public using (true);
--   grant all on public.guest_form_data to anon, authenticated;
--   create policy "Allow read" on public.owner_statements for select to public using (true);
--   create policy "Allow insert service role" on public.owner_statements for insert to public
--     with check (auth.role() = 'service_role');
--   grant all on public.owner_statements to anon, authenticated;
--   create policy "Allow all on guest_conversations" on public.guest_conversations for all to public using (true);
--   create policy "Allow all on guest_messages" on public.guest_messages for all to public using (true);
