-- SECURITY DEFINER functions inherit EXECUTE for PUBLIC unless it is revoked.
-- Career Quest RPCs are account-only and must never be callable by anon.

revoke execute on function public.get_today_dashboard() from public, anon;
revoke execute on function public.record_review_decision(uuid,text,text,jsonb) from public, anon;
revoke execute on function public.submit_mission(text,text,text,text,text) from public, anon;
revoke execute on function public.get_review_submission(uuid) from public, anon;

grant execute on function public.get_today_dashboard() to authenticated;
grant execute on function public.record_review_decision(uuid,text,text,jsonb) to authenticated;
grant execute on function public.submit_mission(text,text,text,text,text) to authenticated;
grant execute on function public.get_review_submission(uuid) to authenticated;
