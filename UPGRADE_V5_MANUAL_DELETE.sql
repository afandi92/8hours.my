-- Attendance V5: transaction-safe manual month deletion + durable selfie cleanup queue.
-- RUN ONCE in existing Supabase project SQL Editor AFTER the V5 shared upgrade.
-- Only affects att_v3_* resources. No cron, auto-archiving or scheduled deletion.
begin;

create table if not exists public.att_v3_selfie_delete_queue (
  path text primary key,
  job_id uuid not null,
  created_at timestamptz not null default now(),
  constraint att_v3_queue_selfie_path check (path <> '' and position('/' in path) > 1)
);
-- No direct end-user access. Only service_role can read/update this queue.
alter table public.att_v3_selfie_delete_queue enable row level security;
revoke all on table public.att_v3_selfie_delete_queue from public, anon, authenticated;
grant select, insert, delete on table public.att_v3_selfie_delete_queue to service_role;
create index if not exists att_v3_selfie_delete_queue_job_idx on public.att_v3_selfie_delete_queue(job_id);

create or replace function public.att_v3_delete_completed_month(
  p_month text, p_site_id uuid, p_job_id uuid
) returns integer
language plpgsql security definer set search_path = '' as $$
declare
  from_day date;
  through_day date;
  removed integer;
begin
  -- Even if invoked wrongly, never delete current/future Malaysia month.
  if coalesce(auth.role(),'') <> 'service_role' then
    raise exception 'Service role only';
  end if;
  if p_month is null or p_month !~ '^[0-9]{4}-(0[1-9]|1[0-2])$' then
    raise exception 'Invalid month: YYYY-MM required';
  end if;
  if p_job_id is null then raise exception 'Missing deletion job ID'; end if;
  from_day := (p_month || '-01')::date;
  through_day := (from_day + interval '1 month')::date;
  if from_day >= date_trunc('month',now() at time zone 'Asia/Kuala_Lumpur')::date then
    raise exception 'Current and future months are protected';
  end if;
  if p_site_id is not null and not exists (select 1 from public.att_v3_sites where id=p_site_id) then
    raise exception 'Invalid attendance site';
  end if;
  -- Delete & queue photos in the SAME database transaction. If this fails,
  -- the attendance rows stay untouched. Storage is cleaned by Edge Function.
  with deleted as (
    delete from public.att_v3_attendance
    where work_date >= from_day and work_date < through_day
      and (p_site_id is null or site_id = p_site_id)
    returning clock_in_selfie_path, clock_out_selfie_path
  ), queued as (
    insert into public.att_v3_selfie_delete_queue(path,job_id)
    select distinct selfie_path, p_job_id
    from deleted d
    cross join lateral (values (d.clock_in_selfie_path),(d.clock_out_selfie_path)) v(selfie_path)
    where selfie_path is not null and selfie_path <> ''
    on conflict (path) do nothing
    returning path
  )
  select count(*) into removed from deleted;
  return removed;
end $$;

revoke all on function public.att_v3_delete_completed_month(text,uuid,uuid) from public,anon,authenticated;
grant execute on function public.att_v3_delete_completed_month(text,uuid,uuid) to service_role;
commit;
