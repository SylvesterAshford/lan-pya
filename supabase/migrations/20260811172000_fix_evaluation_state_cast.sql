create or replace function public.complete_evaluation(
  p_job_id uuid,
  p_submission_id uuid,
  p_outcome text,
  p_observations jsonb,
  p_summary text,
  p_evaluator_version text
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_outcome not in ('pass', 'feedback', 'inconclusive', 'skipped', 'error') then
    raise exception 'invalid outcome';
  end if;

  insert into public.automated_evaluations(
    submission_id,
    evaluator,
    evaluator_version,
    outcome,
    observations,
    raw_summary
  ) values (
    p_submission_id,
    'deterministic-url-checker',
    p_evaluator_version,
    p_outcome,
    p_observations,
    p_summary
  )
  on conflict(submission_id, evaluator_version) do update
    set outcome = excluded.outcome,
        observations = excluded.observations,
        raw_summary = excluded.raw_summary,
        created_at = now();

  update public.evaluation_jobs
    set status = case when p_outcome = 'error' then 'failed' else 'completed' end,
        attempts = attempts + 1,
        last_error = case when p_outcome = 'error' then p_summary end,
        updated_at = now()
  where id = p_job_id and submission_id = p_submission_id;

  update public.submissions
    set state = case
      when p_outcome = 'inconclusive' then 'automated_inconclusive'::public.submission_state
      when p_outcome = 'skipped' then 'automated_skipped'::public.submission_state
      else 'human_review_queued'::public.submission_state
    end,
    updated_at = now()
  where id = p_submission_id;
end;
$$;

revoke all on function public.complete_evaluation(uuid, uuid, text, jsonb, text, text) from public, anon, authenticated;
grant execute on function public.complete_evaluation(uuid, uuid, text, jsonb, text, text) to service_role;
