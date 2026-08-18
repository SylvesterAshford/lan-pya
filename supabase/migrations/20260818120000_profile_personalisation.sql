-- Profile personalisation: display name, headline, and character.
--
-- The hero line was derived entirely from the active path ("Frontend Developer
-- · since Aug 17, 2026"). That is true but not the learner's own words, so a
-- headline they write themselves is stored alongside it and the derived line
-- stays as the fallback when they have not written one.
--
-- `avatar` is a key, not a URL. The app owns the artwork; letting a profile
-- row name an arbitrary image would turn a text column into an image host and
-- an injection surface.

alter table public.learner_profiles
  add column if not exists headline text check (headline is null or char_length(headline) between 1 and 80),
  add column if not exists avatar text not null default 'traveller' check (avatar in ('traveller','traveller-f'));

-- Writes go through a definer function for the same reason every other write
-- in this schema does: the table's RLS grants no direct update, so the set of
-- fields a learner may change is stated here rather than inferred from a
-- policy that would have to allow the whole row.
create or replace function public.update_learner_profile(p_alias text, p_headline text, p_avatar text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_alias text := trim(coalesce(p_alias, ''));
        v_headline text := nullif(trim(coalesce(p_headline, '')), '');
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  if char_length(v_alias) not between 1 and 60 then raise exception 'invalid alias'; end if;
  if v_headline is not null and char_length(v_headline) > 80 then raise exception 'invalid headline'; end if;
  if p_avatar is not null and p_avatar not in ('traveller','traveller-f') then raise exception 'invalid avatar'; end if;

  update public.learner_profiles
     set alias = v_alias,
         headline = v_headline,
         avatar = coalesce(p_avatar, avatar),
         updated_at = now()
   where user_id = auth.uid();

  if not found then raise exception 'profile not found'; end if;

  insert into public.audit_events(actor_id,action,entity_type,entity_id)
  values(auth.uid(),'profile.updated','learner_profile',auth.uid()::text);

  return jsonb_build_object('alias', v_alias, 'headline', v_headline, 'avatar', coalesce(p_avatar, 'traveller'));
end $$;

revoke all on function public.update_learner_profile(text,text,text) from public, anon;
grant execute on function public.update_learner_profile(text,text,text) to authenticated;
