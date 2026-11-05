import { createClient } from 'npm:@supabase/supabase-js@2';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};
const reply = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers });
async function staffLoginEmail(phone: string): Promise<string> {
  const bytes = new TextEncoder().encode('attendance-v3:' + phone);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  const hex = [...new Uint8Array(hash)].map(x => x.toString(16).padStart(2, '0')).join('');
  return `staff-${hex}@attendance-v3.invalid`;
}
const validId = (v: unknown) => typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers });
  if (req.method !== 'POST') return reply({ error: 'POST only' }, 405);
  try {
    const url = Deno.env.get('SUPABASE_URL');
    const anon = Deno.env.get('SUPABASE_ANON_KEY');
    const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !anon || !service) return reply({ error: 'Supabase environment missing' }, 500);
    const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
    if (!token) return reply({ error: 'Login required' }, 401);
    const admin = createClient(url, service, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data: authData, error: authError } = await admin.auth.getUser(token);
    if (authError || !authData.user) return reply({ error: 'Invalid login' }, 401);
    const callerId = authData.user.id;
    const { data: caller, error: callerError } = await admin.from('att_v3_profiles')
      .select('role,active').eq('id', callerId).maybeSingle();
    if (callerError || !caller || caller.role !== 'admin' || !caller.active) return reply({ error: 'Attendance V3 admin only' }, 403);

    const body = await req.json();
    const action = String(body.action || '');
    if (action === 'create') {
      const name = String(body.name || '').trim();
      const phone = String(body.phone || '').trim(); // E.164, e.g. +628123456789
      const password = String(body.password || '');
      const siteId = body.site_id || null;
      if (!name || name.length > 120 || !/^\+[1-9]\d{6,14}$/.test(phone) || password.length < 8 || (siteId && !validId(siteId)))
        return reply({ error: 'Invalid name, international phone, password or site' }, 400);
      if (siteId) {
        const { data: site } = await admin.from('att_v3_sites').select('id').eq('id', siteId).maybeSingle();
        if (!site) return reply({ error: 'Site not found' }, 400);
      }
      const email = await staffLoginEmail(phone);
      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email, password, email_confirm: true,
        app_metadata: { attendance_v3_owned: true },
      });
      if (createError || !created.user) return reply({ error: createError?.message || 'Unable to create staff' }, 400);
      const id = created.user.id;
      const { data: staffNo, error: seqError } = await admin.rpc('att_v3_allocate_staff_number');
      if (seqError) { await admin.auth.admin.deleteUser(id); throw seqError; }
      const { error: insertError } = await admin.from('att_v3_profiles').insert({
        id, full_name: name, phone, role: 'staff', staff_no: staffNo, site_id: siteId, active: true,
      });
      if (insertError) { await admin.auth.admin.deleteUser(id); throw insertError; }
      return reply({ ok: true, id, staff_no: String(staffNo).padStart(3, '0') });
    }

    const id = body.id;
    if (!validId(id) || id === callerId) return reply({ error: 'Invalid staff ID' }, 400);
    const { data: staff, error: staffError } = await admin.from('att_v3_profiles')
      .select('id,role,phone').eq('id', id).maybeSingle();
    if (staffError || !staff || staff.role !== 'staff') return reply({ error: 'Attendance staff not found' }, 404);
    const { data: target, error: targetError } = await admin.auth.admin.getUserById(id);
    if (targetError || !target.user) return reply({ error: 'Auth user not found' }, 404);
    // Shared Supabase Auth: never modify/delete a user created by another system.
    if (target.user.app_metadata?.attendance_v3_owned !== true)
      return reply({ error: 'Shared Auth account: operation blocked to protect other projects' }, 409);

    if (action === 'update') {
      const name = String(body.name || '').trim();
      const siteId = body.site_id === undefined ? undefined : (body.site_id || null);
      if (!name || name.length > 120 || (siteId && !validId(siteId))) return reply({ error: 'Invalid name/site' }, 400);
      if (siteId) {
        const { data: site } = await admin.from('att_v3_sites').select('id').eq('id', siteId).maybeSingle();
        if (!site) return reply({ error: 'Site not found' }, 400);
      }
      const changes: Record<string, unknown> = { full_name: name };
      if (siteId !== undefined) changes.site_id = siteId;
      const { error } = await admin.from('att_v3_profiles').update(changes).eq('id', id);
      if (error) throw error;
      return reply({ ok: true });
    }
    if (action === 'password') {
      const password = String(body.password || '');
      if (password.length < 8) return reply({ error: 'Password minimum 8 characters' }, 400);
      const { error } = await admin.auth.admin.updateUserById(id, { password });
      if (error) throw error;
      return reply({ ok: true });
    }
    if (action === 'active') {
      const active = body.active === true;
      const { error: authUpdateError } = await admin.auth.admin.updateUserById(id, { ban_duration: active ? 'none' : '876000h' });
      if (authUpdateError) throw authUpdateError;
      const { error } = await admin.from('att_v3_profiles').update({ active }).eq('id', id);
      if (error) throw error;
      return reply({ ok: true });
    }
    return reply({ error: 'Unknown action' }, 400);
  } catch (err) {
    return reply({ error: err instanceof Error ? err.message : 'Unexpected error' }, 500);
  }
});
