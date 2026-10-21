-- PROPOSED, NOT APPLIED. Review with whoever owns optima-dashboard first: it shares this
-- Supabase project and may read these tables with the anon/authenticated key.
-- 1) guest_form_data holds passport/ID numbers: today policy "Allow all" (ALL, USING true, role public)
--    + full anon grants => anyone with the public anon key can read/modify/delete it.
drop policy if exists "Allow all on guest_form_data" on public.guest_form_data;
revoke all on public.guest_form_data from anon, authenticated;
-- 2) owner_statements: anon SELECT policy (USING true) + anon grants => owner financials readable.
drop policy if exists "Allow read" on public.owner_statements;
revoke all on public.owner_statements from anon, authenticated;
-- 3) Same pattern, currently blocked only because anon has no table grant (keep it that way):
--    guest_conversations, guest_messages, conversations, messages -> drop the 'public' ALL/SELECT policies.
