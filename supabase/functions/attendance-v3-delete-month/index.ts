/** V5: Admin-only manual deletion, never runs on schedule. JWT required.
 * DB deletion + photo queue is one PostgreSQL transaction via RPC. If Storage
 * fails, unfinished paths persist and Admin can explicitly retry later.
 * Other Supabase projects/tables/buckets/users are never touched.
 */
import {createClient} from 'npm:@supabase/supabase-js@2';
const headers={
  'Access-Control-Allow-Origin':'*',
  'Access-Control-Allow-Headers':'authorization,apikey,x-client-info,content-type',
  'Access-Control-Allow-Methods':'POST,OPTIONS',
  'Content-Type':'application/json',
};
const reply=(obj:unknown,status=200)=>new Response(JSON.stringify(obj),{status,headers});
const uuid=(s:unknown)=>typeof s==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
const monthValid=(s:unknown)=>typeof s==='string'&&/^\d{4}-(0[1-9]|1[0-2])$/.test(s);
function currentMonth(){const p=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Kuala_Lumpur',year:'numeric',month:'2-digit'}).formatToParts(new Date()).map(x=>[x.type,x.value]));return `${p.year}-${p.month}`;}
Deno.serve(async req=>{
  if(req.method==='OPTIONS')return new Response(null,{headers});
  if(req.method!=='POST')return reply({error:'POST only'},405);
  try{
    const url=Deno.env.get('SUPABASE_URL'),secret=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if(!url||!secret)return reply({error:'Missing Supabase server configuration'},500);
    const bearer=(req.headers.get('Authorization')||'').replace(/^Bearer\s+/i,'');
    if(!bearer)return reply({error:'Admin login is required'},401);
    const db=createClient(url,secret,{auth:{autoRefreshToken:false,persistSession:false}});
    const {data:auth,error:authError}=await db.auth.getUser(bearer);
    if(authError||!auth.user)return reply({error:'Invalid user session'},401);
    const {data:p,error:profileError}=await db.from('att_v3_profiles').select('role,active').eq('id',auth.user.id).maybeSingle();
    if(profileError||p?.role!=='admin'||p?.active!==true)return reply({error:'Attendance Admin only'},403);
    const body=await req.json().catch(()=>null);
    if(!body||typeof body!=='object')return reply({error:'Invalid request body'},400);
    const action=body.action;
    if(action!=='delete-month'&&action!=='retry-photos')return reply({error:'Unsupported action'},400);
    let recordsDeleted=0;
    let targetJob:string|null=null;
    if(action==='delete-month'){
      const month=body.month;
      if(!monthValid(month)||month>=currentMonth())return reply({error:'Only completed months can be deleted'},400);
      const site=body.site_id===null||body.site_id===undefined||body.site_id===''?null:body.site_id;
      if(site!==null&&!uuid(site))return reply({error:'Invalid site'},400);
      targetJob=crypto.randomUUID();
      const {data,error}=await db.rpc('att_v3_delete_completed_month',{p_month:month,p_site_id:site,p_job_id:targetJob});
      if(error)return reply({error:'Unable to delete attendance: '+error.message},400);
      recordsDeleted=Number(data)||0;
    }
    const bucket=db.storage.from('att-v3-selfies');
    let removed=0;
    // Keep within Edge Function runtime: up to 3000 photos/request. Pending
    // photos remain in private queue if interrupted/fails.
    let storageError='';
    for(let i=0;i<30;i++){
      let q=db.from('att_v3_selfie_delete_queue').select('path').order('created_at',{ascending:true}).limit(100);

      const {data:list,error:readError}=await q;
      if(readError)throw readError;
      if(!list?.length)break;
      const paths=list.map((x:{path:string})=>x.path);
      const {error:removeError}=await bucket.remove(paths);
      if(removeError){storageError=removeError.message;break;}
      const {error:queueError}=await db.from('att_v3_selfie_delete_queue').delete().in('path',paths);
      if(queueError){storageError='Storage cleaned; queue needs retry: '+queueError.message;break;}
      removed+=paths.length;
    }
    let count=db.from('att_v3_selfie_delete_queue').select('path',{count:'exact',head:true});

    const {count:pending,error:countError}=await count;
    if(countError)throw countError;
    return reply({ok:true,records_deleted:recordsDeleted,photos_deleted:removed,photos_pending:(pending||0)>0,warning:storageError||undefined});
  }catch(err){return reply({error:err instanceof Error?err.message:'Unexpected failure'},500);}
});
