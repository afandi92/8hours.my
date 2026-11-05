-- ATTENDANCE PREMIUM V5 — MIGRATION UNTUK PROJEK SUPABASE DIKONGSI
-- Selamat untuk data lama: tidak DROP/TRUNCATE jadual, tidak sentuh jadual projek lain.
-- RUN ONLY ONCE: Supabase SQL Editor -> New query -> Run.

begin;
alter table public.att_v3_sites add column if not exists radius_m integer not null default 200;
-- Kunci radius 50..5000m; default existing sites kekal 200.
do $$ begin
 if not exists(select 1 from pg_constraint where conname='att_v3_site_radius_range') then
  alter table public.att_v3_sites add constraint att_v3_site_radius_range check (radius_m between 50 and 5000);
 end if;
end $$;
create index if not exists att_v3_attendance_date_idx on public.att_v3_attendance(work_date desc);
create index if not exists att_v3_attendance_user_date_idx on public.att_v3_attendance(user_id,work_date desc);
-- Padam foto yang *baru saja* dimuat naik tetapi gagal disimpan rekod,
-- hanya milik pemilik akaun sendiri. Tidak menyentuh projek lain.
drop policy if exists "att_v3_selfie_delete_own" on storage.objects;
create policy "att_v3_selfie_delete_own" on storage.objects
 for delete to authenticated using (bucket_id='att-v3-selfies'
 and (storage.foldername(name))[1]=(select auth.uid())::text
 and exists(select 1 from public.att_v3_profiles p where p.id=(select auth.uid()) and p.role='staff' and p.active));

-- Validate selfie belongs to auth.uid() and is in private bucket still unchanged.
create or replace function public.att_v3_record_attendance(
 p_site_id uuid,p_kind text,p_lat double precision,p_lng double precision,
 p_accuracy double precision,p_selfie_path text
) returns uuid language plpgsql security definer set search_path='' as $$
declare s public.att_v3_sites%rowtype; result uuid; dist double precision;
 d date := (now() at time zone 'Asia/Kuala_Lumpur')::date;
begin
 if (select auth.uid()) is null then raise exception 'Login required'; end if;
 if p_kind not in ('in','out') then raise exception 'Invalid action'; end if;
 if p_lat is null or p_lng is null or p_lat not between -90 and 90 or p_lng not between -180 and 180 then raise exception 'Invalid GPS'; end if;
 if p_accuracy is null or p_accuracy < 0 or p_accuracy > 100 then raise exception 'GPS accuracy insufficient'; end if;
 if not exists(select 1 from public.att_v3_profiles where id=(select auth.uid()) and role='staff' and active and site_id=p_site_id) then raise exception 'Active staff/site assignment required'; end if;
 select * into s from public.att_v3_sites where id=p_site_id;
 if not found then raise exception 'Site missing'; end if;
 dist:=6371000*2*asin(least(1,sqrt(power(sin(radians(p_lat-s.latitude)/2),2)+cos(radians(s.latitude))*cos(radians(p_lat))*power(sin(radians(p_lng-s.longitude)/2),2))));
 if dist>coalesce(s.radius_m,200) then raise exception 'Outside site GPS radius (% meters)', coalesce(s.radius_m,200); end if;
 if p_selfie_path is null or split_part(p_selfie_path,'/',1)<>(select auth.uid())::text
 or not exists(select 1 from storage.objects where bucket_id='att-v3-selfies' and name=p_selfie_path)
 then raise exception 'Selfie required'; end if;
 if p_kind='in' then
  insert into public.att_v3_attendance(user_id,site_id,work_date,clock_in_lat,clock_in_lng,clock_in_accuracy,clock_in_selfie_path)
  values((select auth.uid()),p_site_id,d,p_lat,p_lng,p_accuracy,p_selfie_path) returning id into result;
 else
  update public.att_v3_attendance set clock_out_at=now(),clock_out_lat=p_lat,clock_out_lng=p_lng,
  clock_out_accuracy=p_accuracy,clock_out_selfie_path=p_selfie_path
  where user_id=(select auth.uid()) and work_date=d and site_id=p_site_id and clock_out_at is null returning id into result;
  if result is null then raise exception 'No active clock-in today'; end if;
 end if;
 return result;
end $$;
revoke all on function public.att_v3_record_attendance(uuid,text,double precision,double precision,double precision,text) from public,anon;
grant execute on function public.att_v3_record_attendance(uuid,text,double precision,double precision,double precision,text) to authenticated;


commit;
