-- JALANKAN SEKALI di Supabase SQL Editor JIKA cron V4 pernah diaktifkan.
-- Hanya menyahjadualkan job attendance V3; tidak memadam rekod, selfie, arkib atau job lain.
do $$
declare job_id bigint;
begin
  if to_regclass('cron.job') is not null then
    select jobid into job_id from cron.job where jobname = 'att-v3-retention-cleanup' limit 1;
    if job_id is not null then
      perform cron.unschedule(job_id);
    end if;
  end if;
end $$;
