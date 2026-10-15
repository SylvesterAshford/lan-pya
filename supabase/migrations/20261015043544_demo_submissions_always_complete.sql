-- A demo submission always reaches Completed (founder, 2026-10-15).
--
-- In a pitch the links typed into the demo are placeholders, and a broken one
-- sent the work back with "fix your links", so the walk to the next stop never
-- happened. For the shared demo account only, a failed link check is recorded
-- as "can't tell" instead: Completed, awaiting review. Every other learner is
-- unchanged, and a broken link still goes back to them.

create or replace function public.complete_evaluation(p_job_id uuid, p_submission_id uuid, p_outcome text, p_observations jsonb, p_summary text, p_evaluator_version text)
 returns void
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  v_owner uuid; v_milestone uuid; v_state public.submission_state; v_outcome text := p_outcome;
begin
  if p_outcome not in ('pass', 'feedback', 'inconclusive', 'skipped', 'error') then
    raise exception 'invalid outcome';
  end if;

  if v_outcome = 'feedback' and exists (
    select 1 from public.submissions submission
    join public.learner_profiles profile on profile.user_id = submission.user_id and profile.data_origin = 'seeded_demo'
    where submission.id = p_submission_id
  ) then
    v_outcome := 'inconclusive';
  end if;

  insert into public.automated_evaluations(submission_id, evaluator, evaluator_version, outcome, observations, raw_summary)
  values (p_submission_id, 'deterministic-url-checker', p_evaluator_version, v_outcome, p_observations, p_summary)
  on conflict(submission_id, evaluator_version) do update
    set outcome = excluded.outcome, observations = excluded.observations, raw_summary = excluded.raw_summary, created_at = now();

  update public.evaluation_jobs
    set status = case when v_outcome = 'error' then 'failed' else 'completed' end,
        attempts = attempts + 1,
        last_error = case when v_outcome = 'error' then p_summary end,
        updated_at = now()
  where id = p_job_id and submission_id = p_submission_id;

  -- A broken link goes back to the learner. Anything else is Completed and
  -- waits for a human: "can't tell" and our own errors are not the learner's
  -- fault, and the reviewer still looks at every link.
  v_state := case
    when v_outcome = 'feedback' then 'automated_feedback_ready'
    when v_outcome = 'inconclusive' then 'automated_inconclusive'
    when v_outcome = 'skipped' then 'automated_skipped'
    else 'human_review_queued'
  end;

  -- A result applies only to a submission that is still being checked. A
  -- redelivered queue message must not pull reviewed work back into waiting.
  update public.submissions set state = v_state, updated_at = now()
  where id = p_submission_id and state in ('submitted', 'deterministic_running')
  returning user_id into v_owner;
  if v_owner is null then return; end if;

  if v_state <> 'automated_feedback_ready' then
    select mission.milestone_id into v_milestone
    from public.submissions submission
    join public.mission_definitions mission on mission.id = submission.mission_id
    where submission.id = p_submission_id;

    -- Never downgrade: a milestone already complete by placement or proof keeps its source.
    insert into public.milestone_progress(user_id, milestone_id, status, source)
    values (v_owner, v_milestone, 'complete', 'checked')
    on conflict (user_id, milestone_id) do update
      set status = 'complete', source = 'checked', updated_at = now()
      where public.milestone_progress.status <> 'complete';
  end if;

  insert into public.audit_events(actor_id, action, entity_type, entity_id, metadata)
  values (null, case when v_state = 'automated_feedback_ready' then 'submission.needs_fix' else 'submission.checked' end,
          'submission', p_submission_id::text, jsonb_build_object('outcome', v_outcome, 'evaluator_version', p_evaluator_version));
end;
$function$;

select public.reset_demo_account();
