/* Attendance Web V3 Premium — static frontend, Supabase backend.
   Deliberately no service_role key, no user-managed OTP, no gallery upload. */
import {createClient} from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import {getCountries,getCountryCallingCode,parsePhoneNumberFromString} from 'https://cdn.jsdelivr.net/npm/libphonenumber-js@1.12.24/min/+esm';
import {SUPABASE_URL,SUPABASE_ANON_KEY} from './config.js';
import {language, setLanguage, tr, translateTree} from './i18n.js';

const root=document.getElementById('app');
const toastEl=document.getElementById('toast');
const modal=document.getElementById('modal');
const modalContent=document.getElementById('modalContent');
const db=SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes('YOUR_PROJECT')
  ? createClient(SUPABASE_URL,SUPABASE_ANON_KEY,{auth:{persistSession:true,autoRefreshToken:true}}) : null;
const TIMEZONE='Asia/Kuala_Lumpur';
const defaultRadius=200;
const siteRadius=()=>Math.min(5000,Math.max(50,Number(state.site?.radius_m)||defaultRadius));
const maximumAccuracy=100;
const validLocationForMs=90_000;
const state={user:null,profile:null,view:'home',mode:'staff',sites:[],staff:[],records:[],site:null,loading:false,lastUser:null,fetchId:0,formBusy:false,geo:null,selfie:null,stream:null,previewUrl:null,clockTimer:null,gpsBusy:false,gpsRequest:0,gpsMessage:'',cameraMessage:''};
const makeMonthView=()=>({month:null,page:0,pageSize:20,rows:[],total:0,loading:false,loadedKey:'',requestId:0,error:'',photos:new Map(),photoError:''});
const monthViews={records:makeMonthView(),history:makeMonthView()};
const esc=(value)=>String(value??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const pad=(v)=>String(v??0).padStart(3,'0');
const nameOf=(id)=>state.staff.find(s=>s.id===id)?.full_name||tr('Pekerja');
const siteOf=(id)=>state.sites.find(s=>s.id===id)?.name||tr('Tapak');
const friendlyTime=(t)=>t?new Date(t).toLocaleTimeString('en-MY',{timeZone:TIMEZONE,hour:'2-digit',minute:'2-digit',hour12:true}):'--:--';
const dateText=()=>new Date().toLocaleDateString(language()==='bm'?'ms-MY':'en-MY',{timeZone:TIMEZONE,weekday:'long',year:'numeric',month:'long',day:'numeric'});
function localDate(){const pieces=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:TIMEZONE,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).map(x=>[x.type,x.value]));return `${pieces.year}-${pieces.month}-${pieces.day}`;}
const number=(v)=>Number.isFinite(Number(v))?Number(v):0;
function svg(name){const paths={
 home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
 history:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 people:'<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 5v1"/>',
 pin:'<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="2.5"/>',
 camera:'<path d="M4 7h4l2-2h4l2 2h4v12H4z"/><circle cx="12" cy="13" r="3.5"/>',
 check:'<path d="m4 12 5 5L20 6"/>',
 close:'<path d="M5 5l14 14M19 5 5 19"/>',
 refresh:'<path d="M20 7V3l-3 3a8 8 0 1 0 2.5 8M20 7h-7"/>',
 edit:'<path d="m4 17-.5 4 4-.5L19 9a2 2 0 0 0-4-4z"/>',
 lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
 trash:'<path d="M4 7h16M9 7V4h6v3m3 0-1 14H7L6 7M10 11v6m4-6v6"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
 logout:'<path d="M9 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4m4-4 4-4-4-4m-8 4h12"/>',
 search:'<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',
 shield:'<path d="m12 2 8 4v5c0 6-4 9-8 11-4-2-8-5-8-11V6z"/><path d="m9 12 2 2 4-4"/>',
 overview:'<rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/>',
 done:'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
 users:'<circle cx="8" cy="8" r="3"/><path d="M2 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 1 1 0 6m2 3a5 5 0 0 1 4 5"/>'};
return `<span class="icon" aria-hidden="true"><svg viewBox="0 0 24 24">${paths[name]||paths.info}</svg></span>`;}
let toastTimeout;
function notify(message,isError=false){toastEl.textContent=tr(message);toastEl.className='toast'+(isError?' error':'');toastEl.hidden=false;clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>{toastEl.hidden=true;},isError?8500:4500);}
function errorText(err){if(!err)return 'Ralat tidak diketahui';return err.message||String(err);}
function requireDb(){if(!db)throw Error('Supabase belum disediakan. Semak config.js.');}
function stopCamera(){if(state.stream){for(const t of state.stream.getTracks())t.stop();state.stream=null;}if(state.previewUrl){URL.revokeObjectURL(state.previewUrl);state.previewUrl=null;}}
function resetCapture(){stopCamera();state.geo=null;state.selfie=null;state.gpsMessage='';state.cameraMessage='';state.gpsBusy=false;state.gpsRequest++;}
function stopClock(){if(state.clockTimer){clearInterval(state.clockTimer);state.clockTimer=null;}}
function cleanup(){stopClock();stopCamera();state.gpsRequest++;state.gpsBusy=false;}
function roleIsAdmin(){return state.profile?.role==='admin'&&state.profile?.active===true;}
const navStaff=[['home','Hari ini','home'],['history','Sejarah','history'],['profile','Profil','people']];
const navAdmin=[['overview','Dashboard','overview'],['staff','Pekerja','users'],['sites','Tapak','pin'],['records','Kehadiran','history']];
function frame(inner,{guest=false}={}){
 cleanup();
 const profile=state.profile;
 const items=roleIsAdmin()?navAdmin:navStaff;
 const nav=(type)=>items.map(([v,label,ic])=>`<button class="${type==='side'?'side-link':'bottom-item'} ${state.view===v?'active':''}" data-view="${v}" aria-current="${state.view===v?'page':'false'}">${svg(ic)}<span>${label}</span></button>`).join('');
 root.innerHTML=`<div class="shell"><header class="topbar"><div class="brand"><span class="brand-mark">A</span><span>ATTENDANCE<span class="brand-dot">.</span></span></div><div class="topbar-right"><div class="language-control" role="group" aria-label="Language / Bahasa"><button type="button" data-lang="en" class="lang-choice ${language()==='en'?'active':''}" aria-pressed="${language()==='en'}">EN</button><button type="button" data-lang="bm" class="lang-choice ${language()==='bm'?'active':''}" aria-pressed="${language()==='bm'}">BM</button></div>${profile?`<span class="role-pill">${roleIsAdmin()?'ADMIN':'STAFF'}</span><strong title="${esc(profile.full_name)}">${esc(profile.full_name)}</strong><button id="signout" class="top-signout" aria-label="Log keluar">${svg('logout')}</button>`:'<span class="role-pill">WORKFORCE PORTAL</span>'}</div></header>${guest?`<div class="login-page">${inner}</div>`:`<div class="workframe"><aside class="sidebar"><div class="nav-label">${roleIsAdmin()?'ADMINISTRATION':'STAFF PORTAL'}</div>${nav('side')}<div class="sidebar-note">${svg('shield')}<br><strong>Attendance V3</strong><br>Secure attendance with verified GPS and live selfie.</div></aside><main class="page"><div class="page-inner">${inner}<p class="footer-note">Attendance V3 · Malaysia Time (MYT) · GPS + Live Selfie</p></div></main></div><nav class="bottom-nav" aria-label="Navigasi">${nav('bottom')}</nav>`}</div>`;
 translateTree(root);
 root.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>{if(language()===b.dataset.lang)return;setLanguage(b.dataset.lang);toastEl.hidden=true;modal.close();if(state.profile)render();else showLogin();}));
 root.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>goto(b.dataset.view)));
 root.querySelector('#signout')?.addEventListener('click',async()=>{cleanup();try{await db.auth.signOut();}catch(e){notify(errorText(e),true);}});
}
function goto(next){if(!state.profile||state.view===next)return;if(!roleIsAdmin()&&navAdmin.some(x=>x[0]===next))return;state.view=next;resetCapture();render();}
const countryNames={en:new Intl.DisplayNames(['en'],{type:'region'}),bm:new Intl.DisplayNames(['ms'],{type:'region'})};
const countries=getCountries().map(code=>({code,dial:getCountryCallingCode(code),name:countryNames[language()].of(code)||code})).sort((a,b)=>a.name.localeCompare(b.name));
const phoneInputs=(namePrefix='')=>`<div class="form-grid"><label class="field"><span class="label">Negara / kod</span><select name="${namePrefix}country" required>${countries.map(c=>`<option value="${c.code}" ${c.code==='MY'?'selected':''}>${esc(countryNames[language()].of(c.code)||c.name)} (+${c.dial})</option>`).join('')}</select></label><label class="field"><span class="label">Nombor telefon</span><input name="${namePrefix}phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="0123456789" required></label></div>`;
function phoneValue(phone,country){const parsed=parsePhoneNumberFromString(String(phone||''),String(country||'MY'));if(!parsed?.isValid())throw Error('Nombor telefon tidak sah. Semak negara dan nombor.');return parsed.number;}
async function staffEmail(phone){const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('attendance-v3:'+phone));return 'staff-'+[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('')+'@attendance-v3.invalid';}
function showLogin(){state.profile=null;state.view='home';frame(`<section class="card login-card"><div class="eyebrow">WELCOME BACK</div><h1 class="login-title">Log masuk Attendance</h1><p class="login-sub">Portal kehadiran pekerja, selamat dan ringkas.</p><div class="login-tabs" role="tablist"><button id="staffTab" class="${state.mode==='staff'?'active':''}" role="tab" aria-selected="${state.mode==='staff'}">Staff · Telefon</button><button id="adminTab" class="${state.mode==='admin'?'active':''}" role="tab" aria-selected="${state.mode==='admin'}">Admin · Email</button></div>${!db?'<p class="error-inline">Sila isi URL dan publishable key Supabase dalam config.js.</p>':''}<form id="loginForm">${state.mode==='staff'?phoneInputs():`<label class="field"><span class="label">Emel Admin</span><input name="email" type="email" autocomplete="username" required placeholder="admin@syarikat.com"></label>`}<label class="field"><span class="label">Kata laluan</span><input name="password" type="password" autocomplete="current-password" required placeholder="Masukkan kata laluan"></label><button type="submit" class="btn primary lg full" ${!db?'disabled':''}>Log Masuk ${svg('arrow')}</button></form><p class="login-foot">Akaun pekerja disediakan oleh Admin · Tiada OTP</p></section>`,{guest:true});
 document.getElementById('staffTab').onclick=()=>{state.mode='staff';showLogin()};
 document.getElementById('adminTab').onclick=()=>{state.mode='admin';showLogin()};
 document.getElementById('loginForm').onsubmit=async e=>{
  e.preventDefault();const form=e.currentTarget;const button=form.querySelector('button[type="submit"]');button.disabled=true;button.textContent='Sedang log masuk…';
  try{requireDb();const f=new FormData(form);const email=state.mode==='staff'?await staffEmail(phoneValue(f.get('phone'),f.get('country'))):String(f.get('email')||'').trim();
   const {data,error}=await db.auth.signInWithPassword({email,password:String(f.get('password')||'')});
   if(error)throw error;
   const {data:access,error:pe}=await db.from('att_v3_profiles').select('role,active').eq('id',data.user.id).single();
   if(pe||!access){await db.auth.signOut();throw Error('Profil Attendance V3 tiada atau tidak boleh dibaca: '+(pe?.message||''));}
   if(!access.active||access.role!==(state.mode==='staff'?'staff':'admin')){await db.auth.signOut();throw Error('Akaun tidak aktif atau jenis login tidak sepadan.');}
  }catch(e){notify(errorText(e),true);if(button.isConnected){button.disabled=false;button.innerHTML='Log Masuk '+svg('arrow');}}
 };
}
let activeRefresh=null;
async function refresh(){if(!state.user||!db)return;const uid=state.user.id;
 if(activeRefresh?.uid===uid)return activeRefresh.promise;
 const fetchId=++state.fetchId;
 const work=(async()=>{
  const p=await db.from('att_v3_profiles').select('*').eq('id',uid).maybeSingle();
  if(uid!==state.user?.id||fetchId!==state.fetchId)return;
  if(p.error||!p.data){state.profile=null;frame(`<section class="card"><h2>Akaun belum didaftarkan</h2><p class="error-inline">${esc(p.error?.message||'Profil tiada dalam att_v3_profiles.')}</p><button class="btn" id="backLogin">Log keluar</button></section>`);document.getElementById('backLogin').onclick=()=>db.auth.signOut();return;}
  state.profile=p.data;
  if(!p.data.active){await db.auth.signOut();notify('Akaun telah dinyahaktifkan.',true);return;}
  if(state.lastUser!==uid){state.view=p.data.role==='admin'?'overview':'home';state.lastUser=uid;}
  const isAdmin=roleIsAdmin();
  const [sites,records,staff]=await Promise.all([
   db.from('att_v3_sites').select('*').order('name'),
   db.from('att_v3_attendance').select('*').eq('work_date',localDate()).order('clock_in_at',{ascending:false}).limit(1000),
   isAdmin?db.from('att_v3_profiles').select('*').order('staff_no',{ascending:true,nullsFirst:true}):Promise.resolve({data:[]})
  ]);
  if(uid!==state.user?.id||fetchId!==state.fetchId)return;
  for(const [what,item] of [['Tapak',sites],['Kehadiran',records],['Pekerja',staff]])if(item.error){notify(what+': '+item.error.message,true);}
  state.sites=sites.data||[];state.records=records.data||[];state.staff=staff.data||[];
  state.site=state.sites.find(s=>s.id===state.profile.site_id)||null;
  render();
 })();activeRefresh={uid,promise:work};try{await work;}finally{if(activeRefresh?.promise===work)activeRefresh=null;}
}
async function invokeAdmin(action,payload={}){requireDb();const {data,error}=await db.functions.invoke('attendance-v3-manage-staff',{body:{action,...payload}});if(error){let extra='';try{const response=error.context;if(response?.json){const body=await response.json();extra=body?.error||'';}}catch{}throw Error(extra||error.message||'Edge Function gagal.');}if(data?.error)throw Error(data.error);return data;}
function render(){if(!state.profile)return showLogin();if(roleIsAdmin()){if(!navAdmin.some(x=>x[0]===state.view))state.view='overview';return ({overview:adminOverview,staff:adminStaff,sites:adminSites,records:adminRecords})[state.view]();}if(!navStaff.some(x=>x[0]===state.view))state.view='home';return ({home:staffHome,history:staffHistory,profile:staffProfile})[state.view]();}
function dateHead(title,desc){return `<div class="page-head"><div><div class="eyebrow">${roleIsAdmin()?'ATTENDANCE MANAGEMENT':'STAFF PORTAL'}</div><h1>${esc(title)}</h1><p>${esc(desc)}</p></div><div class="right-head"><span class="today-chip">${esc(dateText())}</span></div></div>`;}
function currentRecord(){return state.records.find(x=>x.user_id===state.user?.id&&x.work_date===localDate());}
function haversine(lat,lng,sLat,sLng){const rad=x=>x*Math.PI/180;const dLat=rad(Number(sLat)-lat),dLng=rad(Number(sLng)-lng);const a=Math.sin(dLat/2)**2+Math.cos(rad(lat))*Math.cos(rad(Number(sLat)))*Math.sin(dLng/2)**2;return 6371000*2*Math.atan2(Math.sqrt(a),Math.sqrt(Math.max(0,1-a)));}
function geoGood(){return state.geo&&state.site&&state.geo.distance<=siteRadius()&&state.geo.accuracy<=maximumAccuracy&&(Date.now()-state.geo.receivedAt)<validLocationForMs;}
function recordStatus(a){return tr(a?.clock_out_at?'Selesai':a?.clock_in_at?'Sudah Clock In':'Belum Clock In');}
function staffHome(){const p=state.profile,s=state.site,a=currentRecord(),complete=!!a?.clock_out_at,hasClockedIn=!!a?.clock_in_at;
 const action=hasClockedIn?'out':'in';
 frame(`<div class="attendance-wrap"><div class="staff-welcome"><div class="eyebrow">SALAM SEJAHTERA</div><h1>${esc(p.full_name)}</h1><span class="staff-id">${svg('people')} STAFF ID #${pad(p.staff_no)}</span></div>
 <div class="schedule-card"><div><div class="eyebrow">TODAY'S SCHEDULE</div><strong>${esc(s?.name||'Tiada site ditetapkan')}</strong><small style="color:#c3d3df">Jadual masa: rujuk penyelia tapak</small></div><span class="schedule-icon">${svg('clock')}</span></div>
 <div class="clock-face"><span>${svg('clock')}</span><div id="liveTime" class="clock-digits">--:--:--</div><span class="clock-sec">MALAYSIA TIME · MYT</span></div><div class="clock-date">${esc(dateText())}</div>
 <section class="location-box"><div class="section-heading"><strong>📍 CLOCK IN / OUT LOCATION</strong><span id="gpsBadge" class="badge neutral">Belum disemak</span></div><p class="location-name">${esc(s?.name||'Tapak belum ditetapkan')}</p><details class="gps-details"><summary>GPS details</summary><p class="coord">Koordinat tapak: ${s?`${Number(s.latitude).toFixed(6)}, ${Number(s.longitude).toFixed(6)}`:'—'}</p><p class="coord" id="ownCoord">Koordinat anda: —</p></details><div class="location-pairs"><div><small>Jarak ke tapak</small><strong id="distance">—</strong></div><div><small>Radius dibenarkan</small><strong>${siteRadius()} m</strong></div><div><small>Ketepatan GPS</small><strong id="accuracy">—</strong></div><div><small>Status</small><strong id="distanceStatus" style="font-size:13px">Menunggu GPS</strong></div></div><div id="gpsStatus" class="gps-state">${s?'GPS akan diperiksa secara automatik. Sila benarkan akses lokasi.':'Admin perlu menetapkan tapak untuk akaun ini.'}</div><button id="gpsRetry" class="btn small" ${!s?'disabled':''}>${svg('refresh')} Semak semula GPS</button></section>
 <section class="selfie-section"><div class="section-title">${svg('camera')} ${hasClockedIn?'Clock Out':'Clock In'} Selfie <span style="color:#c8515d">*</span></div><div id="cameraArea"><button id="openCamera" class="camera-open" ${!s||complete?'disabled':''}>${svg('camera')}<span>Take Front Selfie</span><small>Kamera langsung sahaja · Bukan galeri</small></button></div><p id="cameraHint" class="camera-note">Selfie hanya boleh diambil terus daripada kamera hadapan.</p></section>
 <div class="status-line"><span class="status-dot ${complete?'off':hasClockedIn?'good':''}"></span><strong>${recordStatus(a)}</strong></div><button class="btn ${complete?'primary':'teal'} lg full" id="clockSubmit" disabled>${svg('arrow')} ${complete?'SELESAI HARI INI':hasClockedIn?'CLOCK OUT':'CLOCK IN'}</button>
 <p class="hint" id="clockHint">${complete?'Kehadiran hari ini telah lengkap.':'Sistem memerlukan lokasi GPS tepat dalam radius tapak dan selfie secara langsung.'}</p>
 <div class="time-entries"><div><span>Clock In</span><strong>${friendlyTime(a?.clock_in_at)}</strong></div><div><span>Clock Out</span><strong>${friendlyTime(a?.clock_out_at)}</strong></div></div>
 </div>`);
 let tick=0;const updateClock=()=>{const el=document.getElementById('liveTime');if(el)el.textContent=new Date().toLocaleTimeString('en-GB',{timeZone:TIMEZONE,hour12:false});if(++tick%15===0)updateGpsDisplay();};updateClock();state.clockTimer=setInterval(updateClock,1000);
 document.getElementById('gpsRetry').addEventListener('click',()=>checkGps());
 document.getElementById('openCamera').addEventListener('click',()=>openCamera());
 document.getElementById('clockSubmit').addEventListener('click',()=>submitAttendance(action));
 updateGpsDisplay();updateSubmitButton();
 if(s&&!complete)queueMicrotask(()=>{if(state.view==='home'&&state.user&&document.getElementById('gpsRetry'))checkGps();});
}
function updateGpsDisplay(){const s=state.site,loc=state.geo;const badge=document.getElementById('gpsBadge');if(!badge)return;
 const status=document.getElementById('gpsStatus');
 const good=geoGood();
 badge.textContent=state.gpsBusy?'Mencari…':good?'Dalam kawasan':loc?.distance>siteRadius()?'Di luar radius':loc?'GPS kurang tepat':'GPS belum tersedia';
 badge.className='badge '+(state.gpsBusy?'warn':good?'':loc?'bad':'neutral');
 document.getElementById('distance').textContent=loc?`${Math.round(loc.distance)} m`:'—';
 document.getElementById('accuracy').textContent=loc?`±${Math.round(loc.accuracy)} m`:'—';
 document.getElementById('ownCoord').textContent=loc?`Koordinat anda: ${loc.latitude.toFixed(6)}, ${loc.longitude.toFixed(6)}`:'Koordinat anda: —';
 document.getElementById('distanceStatus').textContent=good?'Dibenarkan':state.gpsBusy?'Sedang semak':loc?'Ditolak':'Belum disemak';
 status.textContent=state.gpsMessage||(state.gpsBusy?'Mendapatkan lokasi peranti…':!s?'Tiada site ditetapkan.':good?'GPS sah. Sila ambil selfie untuk meneruskan.':'Tekan Semak semula GPS apabila peranti sudah bersedia.');
 status.className='gps-state '+(good?'good':loc||state.gpsMessage.startsWith('GPS gagal')?'bad':'');
 const button=document.getElementById('gpsRetry');if(button)button.disabled=state.gpsBusy||!s;
 updateSubmitButton();
 ['gpsBadge','gpsStatus','ownCoord','distanceStatus'].forEach(id=>translateTree(document.getElementById(id)));
}
function geolocate(options){return new Promise((resolve,reject)=>{if(!navigator.geolocation)return reject(new Error('Browser tidak menyokong GPS.'));navigator.geolocation.getCurrentPosition(resolve,reject,options);});}
async function checkGps(){if(state.gpsBusy||!state.site)return false;state.gpsBusy=true;state.geo=null;state.gpsMessage='Memeriksa GPS…';let id=++state.gpsRequest;updateGpsDisplay();
 try{
  let fix;try{fix=await geolocate({enableHighAccuracy:true,timeout:14000,maximumAge:0});}catch(first){if(first?.code===1)throw first;state.gpsMessage='GPS tepat tidak tersedia. Cuba mod alternatif…';updateGpsDisplay();fix=await geolocate({enableHighAccuracy:false,timeout:12000,maximumAge:0});}
  if(id!==state.gpsRequest||state.view!=='home')return false;
  const {latitude,longitude,accuracy}=fix.coords;
  if(![latitude,longitude,accuracy].every(Number.isFinite))throw Error('Bacaan GPS tidak sah.');
  const distance=haversine(latitude,longitude,state.site.latitude,state.site.longitude);
  state.geo={latitude,longitude,accuracy,distance,receivedAt:Date.now()};
  state.gpsMessage=distance>siteRadius()?`Lokasi ${Math.round(distance)}m dari tapak. Had ${siteRadius()}m.`:accuracy>maximumAccuracy?`GPS terlalu kurang tepat (±${Math.round(accuracy)}m). Cuba semula di kawasan terbuka.`:'Lokasi disahkan. Jarak dan ketepatan GPS memenuhi syarat.';
  return Boolean(geoGood());
 }catch(err){if(id!==state.gpsRequest)return false;
  const explanation=err?.code===1?'Kebenaran lokasi ditolak. Benarkan GPS dalam tetapan browser.':err?.code===2?'Lokasi tidak tersedia. Hidupkan Location Services/Wi-Fi.':err?.code===3?'GPS timeout. Cuba semula atau gunakan telefon dengan HTTPS.':errorText(err);
  state.gpsMessage='GPS gagal: '+explanation;state.geo=null;return false;
 }finally{if(id===state.gpsRequest){state.gpsBusy=false;updateGpsDisplay();}}
}
function updateSubmitButton(){const b=document.getElementById('clockSubmit');if(!b)return;const record=currentRecord();const complete=!!record?.clock_out_at;const ready=Boolean(!state.formBusy&&!complete&&geoGood()&&state.selfie&&state.site&&state.profile?.role==='staff');b.disabled=!ready;const hint=document.getElementById('clockHint');if(hint&&!complete){hint.textContent=ready?'GPS dan selfie lengkap. Kehadiran sedia dihantar.':!state.geo?'Benarkan akses GPS dahulu.':!geoGood()?'Lokasi tidak memenuhi radius / ketepatan atau telah luput.':'Ambil selfie menggunakan kamera hadapan.';}if(hint)translateTree(hint);}
async function openCamera(){const area=document.getElementById('cameraArea');if(!area||state.stream)return;
 if(!window.isSecureContext||!navigator.mediaDevices?.getUserMedia){state.cameraMessage='Kamera memerlukan HTTPS atau localhost dan browser yang menyokong getUserMedia.';document.getElementById('cameraHint').textContent=tr(state.cameraMessage);notify(state.cameraMessage,true);return;}
 area.innerHTML='<div class="camera-box" style="display:grid;place-items:center;min-height:180px">Membuka kamera…</div>';translateTree(area);
 try{const stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:'user'},width:{ideal:1280},height:{ideal:960}}});
  if(state.view!=='home'||!document.getElementById('cameraArea')){stream.getTracks().forEach(t=>t.stop());return;}
  state.stream=stream;state.selfie=null;area.innerHTML=`<div class="camera-box"><video id="cameraPreview" playsinline muted autoplay aria-label="Pratonton kamera hadapan"></video><div class="camera-actions"><button class="btn small" id="snapPhoto">${svg('camera')} Capture Selfie</button><button class="btn small" id="cancelCamera">Tutup</button></div></div>`;translateTree(area);
  const video=document.getElementById('cameraPreview');video.srcObject=stream;await video.play().catch(()=>{});
  document.getElementById('snapPhoto').onclick=takeSelfie;
  document.getElementById('cancelCamera').onclick=()=>{stopCamera();state.selfie=null;resetCameraArea();updateSubmitButton();};
  document.getElementById('cameraHint').textContent=tr('Pastikan wajah jelas sebelum tekan Capture Selfie.');
 }catch(err){stopCamera();resetCameraArea();const code=err.name==='NotAllowedError'?'Akses kamera tidak dibenarkan. Sila benarkan kamera pada browser.':err.name==='NotFoundError'?'Kamera tidak ditemui pada peranti ini.':errorText(err);document.getElementById('cameraHint').textContent=tr(code);notify(code,true);}
}
function resetCameraArea(){const area=document.getElementById('cameraArea');if(!area)return;area.innerHTML=`<button id="openCamera" class="camera-open">${svg('camera')}<span>Take Front Selfie</span><small>Kamera langsung sahaja · Bukan galeri</small></button>`;translateTree(area);document.getElementById('openCamera').onclick=openCamera;}
function takeSelfie(){const video=document.getElementById('cameraPreview');if(!video||!video.videoWidth||!video.videoHeight){notify('Kamera belum bersedia. Cuba lagi.',true);return;}
 const targetW=Math.min(1100,video.videoWidth),targetH=Math.round(video.videoHeight*targetW/video.videoWidth);
 const canvas=document.createElement('canvas');canvas.width=targetW;canvas.height=targetH;
 const ctx=canvas.getContext('2d');ctx.translate(targetW,0);ctx.scale(-1,1);ctx.drawImage(video,0,0,targetW,targetH);
 canvas.toBlob(blob=>{if(!blob){notify('Gagal mengambil selfie. Sila cuba lagi.',true);return;}if(!document.getElementById('cameraArea'))return;stopCamera();state.selfie=blob;state.previewUrl=URL.createObjectURL(blob);document.getElementById('cameraArea').innerHTML=`<div class="camera-box"><img id="selfiePhoto" src="${state.previewUrl}" alt="Selfie yang baru diambil" style="transform:none"><div class="camera-actions"><button id="retake" class="btn small">${svg('refresh')} Retake</button><span class="badge">${svg('check')} Selfie diambil</span></div></div>`;translateTree(document.getElementById('cameraArea'));
 document.getElementById('cameraHint').textContent=tr('Selfie diambil terus daripada kamera. Gambar akan dihantar bersama kehadiran.');
 document.getElementById('retake').onclick=()=>{state.selfie=null;if(state.previewUrl){URL.revokeObjectURL(state.previewUrl);state.previewUrl=null;}resetCameraArea();updateSubmitButton();openCamera();};updateSubmitButton();
 },'image/jpeg',.82);
}
async function submitAttendance(kind){if(state.formBusy)return;
 if(!state.selfie){notify('Sila ambil selfie terlebih dahulu.',true);return;}
 if(!geoGood()){notify('GPS perlu disahkan semula.',true);await checkGps();if(!geoGood())return;}
 state.formBusy=true;updateSubmitButton();const button=document.getElementById('clockSubmit');if(button){button.disabled=true;button.innerHTML='<span class="loading-spinner"></span> '+tr('Memastikan lokasi…');}
 let pendingPath=null;
 try{
  // Fresh GPS check stops users submitting an old cached location after moving away.
  state.geo=null;const valid=await checkGps();if(!valid)throw Error('GPS semasa tidak memenuhi syarat. Kehadiran belum dihantar.');
  button.innerHTML='<span class="loading-spinner"></span> '+tr('Menyimpan kehadiran…');
  const bytes=new Uint8Array(16);crypto.getRandomValues(bytes);const randomName=[...bytes].map(x=>x.toString(16).padStart(2,'0')).join('');
  const path=`${state.user.id}/${randomName}.jpg`;
  const upload=await db.storage.from('att-v3-selfies').upload(path,state.selfie,{contentType:'image/jpeg',cacheControl:'3600',upsert:false});
  if(upload.error)throw upload.error;pendingPath=path;
  const lat=state.geo.latitude,lng=state.geo.longitude,accuracy=state.geo.accuracy;
  const {error}=await db.rpc('att_v3_record_attendance',{p_site_id:state.site.id,p_kind:kind,p_lat:lat,p_lng:lng,p_accuracy:accuracy,p_selfie_path:path});
  if(error)throw error;pendingPath=null;
  for(const v of Object.values(monthViews)){v.requestId++;v.loadedKey='';v.loading=false;v.rows=[];v.photos.clear();}
  resetCapture();await refresh();notify(kind==='in'?'Clock In berjaya direkodkan.':'Clock Out berjaya direkodkan.');
 }catch(err){if(pendingPath){try{await db.storage.from('att-v3-selfies').remove([pendingPath]);}catch{}}notify(errorText(err),true);}finally{state.formBusy=false;updateSubmitButton();}
}
function staffHistory(){
 const v=getMonthView('history');
 const cards=v.rows.map(a=>`<div class="activity-row history-row"><div><strong>${esc(a.work_date)}</strong><small>${esc(siteOf(a.site_id))}</small><div class="inline-photos">${photoCell(a.clock_in_selfie_path,'IN')}${photoCell(a.clock_out_selfie_path,'OUT')}</div></div><div class="activity-times"><strong>${friendlyTime(a.clock_in_at)} – ${friendlyTime(a.clock_out_at)}</strong><small>${a.clock_out_at?'Selesai':'Belum Clock Out'}</small></div></div>`).join('');
 frame(`${dateHead('Sejarah Kehadiran','Semak kehadiran anda mengikut bulan dan lihat selfie yang direkodkan.')}<section class="card"><div class="card-header"><h2>Rekod Anda</h2><span class="badge neutral">${v.total} rekod bulan ini</span></div>${monthToolbar('history')}${v.loading?loadingRecords():v.error?recordsError(v.error):v.rows.length?cards:empty('Tiada rekod kehadiran pada bulan ini.','history')}${pagination('history')}<p class="muted" style="margin-top:16px">Rekod disimpan dalam Supabase. Selfie hanya boleh dilihat oleh pekerja berkenaan dan Admin Attendance.</p></section>`);
 wireMonth('history');
}

function staffProfile(){const p=state.profile;frame(`${dateHead('Profil Pekerja','Maklumat akaun kehadiran anda.')}<section class="card"><div class="staff-primary"><div class="avatar">${esc(p.full_name?.charAt(0)||'S')}</div><div class="info"><h2 style="margin:0">${esc(p.full_name)}</h2><small>Staff ID #${pad(p.staff_no)}</small></div></div><div class="divider"></div><div class="location-pairs"><div><small>Nombor telefon</small><strong style="font-size:13px">${esc(p.phone||'—')}</strong></div><div><small>Site</small><strong style="font-size:13px">${esc(state.site?.name||'Belum ditetapkan')}</strong></div><div><small>Status</small><strong style="font-size:13px">${p.active?'Aktif':'Tidak aktif'}</strong></div><div><small>Radius GPS</small><strong>${siteRadius()} m</strong></div></div><p class="muted">Untuk menukar profil atau kata laluan, sila hubungi Admin.</p></section>`);}
function empty(message,ic='info'){return `<div class="empty-state">${svg(ic)}<strong>${esc(message)}</strong><small>Maklumat akan muncul apabila tersedia.</small></div>`;}
function adminStats(){const today=localDate(),tod=state.records.filter(x=>x.work_date===today),workers=state.staff.filter(x=>x.role==='staff'),present=tod.filter(x=>x.clock_in_at&&!x.clock_out_at).length,done=tod.filter(x=>x.clock_out_at).length;return {today,tod,workers,present,done};}
function kpi(title,value,ic,foot){return `<article class="card kpi"><div class="kpi-top"><span>${title}</span><span class="kpi-icon">${svg(ic)}</span></div><strong>${value}</strong><small>${esc(foot)}</small></article>`;}
function adminOverview(){const {tod,workers,present,done}=adminStats();frame(`${dateHead('Dashboard','Ringkasan operasi dan kehadiran pekerja hari ini.')}<div class="kpis">${kpi('Jumlah Staff',workers.length,'people','Pekerja berdaftar')}${kpi('Aktif',workers.filter(x=>x.active).length,'shield','Akaun aktif')}${kpi('Di Tapak',present,'pin','Sudah Clock In')}${kpi('Selesai',done,'done','Sudah Clock Out')}</div><section class="card"><div class="card-header"><h2>Aktiviti Hari Ini</h2><button id="refreshOverview" class="btn small">${svg('refresh')} Refresh</button></div>${tod.length?tod.slice(0,15).map(a=>`<div class="activity-row"><div><strong>${esc(nameOf(a.user_id))}</strong><small>${esc(siteOf(a.site_id))}</small></div><div class="activity-times"><strong>${friendlyTime(a.clock_in_at)} – ${friendlyTime(a.clock_out_at)}</strong><small>${a.clock_out_at?'Clock Out selesai':'Masih di tapak'}</small></div></div>`).join(''):empty('Belum ada kehadiran hari ini.','history')}</section><section class="card tight"><div class="toolbar" style="margin:0"><div><h2 style="margin-bottom:4px">Pengurusan Pekerja</h2><p class="muted" style="margin:0">Tambah pekerja, tetapkan tapak dan urus akaun.</p></div><button class="btn primary" data-jump="staff">${svg('arrow')} Buka Staff</button></div></section>`);document.getElementById('refreshOverview').onclick=async()=>{notify('Mengemas kini…');await refresh();};document.querySelector('[data-jump]').onclick=()=>goto('staff');}
function staffLine(p){const assigned=state.sites.find(x=>x.id===p.site_id)?.name||tr('Belum ditetapkan');return `<div class="staff-line" data-staff-row="${p.id}"><div class="staff-primary"><div class="avatar">${esc(p.full_name?.charAt(0)||'S')}</div><div class="info"><strong>#${pad(p.staff_no)} · ${esc(p.full_name)}</strong><small>${esc(p.phone||'—')} · ${esc(assigned)}</small><span class="badge ${p.active?'':'bad'}" style="margin-top:6px;display:inline-block">${p.active?'Aktif':'Tidak aktif'}</span></div></div><button class="btn small manage-worker" type="button" data-worker-actions="${p.id}" aria-expanded="false">${svg('edit')} Manage</button><div class="actions worker-actions" hidden data-worker-panel="${p.id}"><button class="btn small" data-edit="${p.id}">${svg('edit')} Edit</button><button class="btn small" data-password="${p.id}">${svg('lock')} Password</button><button class="btn small" data-toggle="${p.id}">${p.active?'Nyahaktif':'Aktifkan'}</button></div></div>`;}
function adminStaff(){const staff=state.staff.filter(p=>p.role==='staff');frame(`${dateHead('Pengurusan Pekerja','Urus akaun Staff terus dari web, tanpa SMS atau OTP.')}<section class="card"><div class="card-header"><h2>Tambah Pekerja</h2><span class="badge">Staff ID automatik</span></div><form id="addStaff"><label class="field"><span class="label">Nama penuh pekerja</span><input name="name" placeholder="Nama seperti di dokumen" required maxlength="120"></label>${phoneInputs()}<div class="form-grid"><label class="field"><span class="label">Kata laluan awal (min. 8 aksara)</span><input name="password" type="password" minlength="8" autocomplete="new-password" required></label><label class="field"><span class="label">Tetapkan tapak</span><select name="site"><option value="">Belum ditetapkan</option>${state.sites.map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select></label></div><p class="draft-status" data-draft-note>Draf akan disimpan semasa menaip, kecuali password.</p><div class="form-actions"><button type="submit" class="btn primary">${svg('plus')} Tambah Staff</button></div></form></section><section class="card"><div class="card-header"><h2>Senarai Pekerja</h2><span class="badge neutral">${staff.length} orang</span></div><div class="toolbar"><input class="search" id="staffSearch" placeholder="Cari nama, ID atau nombor…" aria-label="Cari pekerja" type="search"><div style="display:flex;gap:8px;flex-wrap:wrap"><button id="refreshStaff" class="btn small">${svg('refresh')} Refresh</button></div></div><div class="staff-card-list" id="staffList">${staff.length?staff.map(staffLine).join(''):empty('Tiada pekerja didaftarkan','people')}</div><p class="muted" style="margin:20px 0 0">Staff ID tidak dikitar semula. Penghapusan akaun Attendance dikawal supaya tidak menjejaskan akaun projek lain.</p></section>`);
 attachDraft(document.getElementById('addStaff'),'add-staff');
 document.getElementById('addStaff').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.currentTarget),form=e.currentTarget,button=form.querySelector('button[type=submit]');button.disabled=true;try{const phone=phoneValue(f.get('phone'),f.get('country'));
 const result=await invokeAdmin('create',{name:String(f.get('name')).trim(),phone,password:String(f.get('password')),site_id:f.get('site')||null});clearDraft('add-staff');await refresh();notify('Staff #'+pad(result.staff_no)+' berjaya ditambah.');}catch(err){notify(errorText(err),true);if(button.isConnected)button.disabled=false;}};
 const input=document.getElementById('staffSearch');input.oninput=()=>{const term=input.value.trim().toLowerCase();document.querySelectorAll('[data-staff-row]').forEach(el=>{el.hidden=!el.textContent.toLowerCase().includes(term);});};
 document.getElementById('refreshStaff').onclick=()=>refresh();
 for(const b of document.querySelectorAll('[data-edit]'))b.onclick=()=>showStaffEdit(b.dataset.edit);
 for(const b of document.querySelectorAll('[data-password]'))b.onclick=()=>showPasswordDialog(b.dataset.password);
 for(const b of document.querySelectorAll('[data-toggle]'))b.onclick=()=>showToggleDialog(b.dataset.toggle);
 for(const b of document.querySelectorAll('[data-worker-actions]'))b.onclick=()=>{const p=document.querySelector(`[data-worker-panel="${b.dataset.workerActions}"]`);if(!p)return;const expanded=b.getAttribute('aria-expanded')==='true';p.hidden=expanded;b.setAttribute('aria-expanded',String(!expanded));};
}
function openDialog(content,handler,draftKind=null){modalContent.innerHTML=content;translateTree(modalContent);modal.showModal();const draftForm=modalContent.querySelector('form');if(draftKind)attachDraft(draftForm,draftKind);const f=modalContent.querySelector('form');f?.addEventListener('submit',async e=>{e.preventDefault();const btn=f.querySelector('button[type=submit]');if(btn)btn.disabled=true;try{await handler(new FormData(f));if(draftKind)clearDraft(draftKind);modal.close();await refresh();}catch(err){notify(errorText(err),true);if(btn)btn.disabled=false;}});modalContent.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>modal.close());}
// Draf borang disimpan pada peranti pengguna sahaja (7 hari), bukan password.
const DRAFT_TTL=7*86400000;
function draftKey(kind){return `att-v3-draft:${state.user?.id||'guest'}:${kind}`;}
function readDraft(kind){try{const raw=localStorage.getItem(draftKey(kind));if(!raw)return null;const parsed=JSON.parse(raw);if(!parsed?.at||Date.now()-parsed.at>DRAFT_TTL){localStorage.removeItem(draftKey(kind));return null;}return parsed.values||null;}catch{return null;}}
function clearDraft(kind){try{localStorage.removeItem(draftKey(kind));}catch{}}
function draftFields(form){return [...form.elements].filter(el=>el.name&&!el.disabled&&!['password','file','hidden'].includes(el.type)&&el.type!=='submit'&&el.type!=='button');}
function attachDraft(form,kind){if(!form)return;
 const old=readDraft(kind);if(old){for(const el of draftFields(form)){if(Object.prototype.hasOwnProperty.call(old,el.name)){
  if(el.tagName==='SELECT'&&![...el.options].some(o=>o.value===old[el.name]))continue;
  el.value=old[el.name];
 }}const label=form.querySelector('[data-draft-note]');if(label)label.textContent='Draf sebelumnya dipulihkan daripada peranti ini.';}
 const save=()=>{const values={};for(const el of draftFields(form))values[el.name]=el.value;
  try{localStorage.setItem(draftKey(kind),JSON.stringify({at:Date.now(),values}));const label=form.querySelector('[data-draft-note]');if(label)label.textContent='Draf disimpan secara automatik di peranti ini.';}catch{const label=form.querySelector('[data-draft-note]');if(label)label.textContent='Draf tidak dapat disimpan (storan browser terhad).';}};
 let timer;const queue=()=>{clearTimeout(timer);timer=setTimeout(save,250);};
 form.addEventListener('input',queue);form.addEventListener('change',queue);
}

function showStaffEdit(id){const p=state.staff.find(s=>s.id===id);if(!p)return;
 openDialog(`<h2>Edit Pekerja #${pad(p.staff_no)}</h2><p>Kemas kini nama dan penempatan tapak.</p><form><label class="field"><span class="label">Nama penuh</span><input name="name" required maxlength="120" value="${esc(p.full_name)}"></label><label class="field"><span class="label">Tapak</span><select name="site"><option value="">Belum ditetapkan</option>${state.sites.map(s=>`<option value="${s.id}" ${p.site_id===s.id?'selected':''}>${esc(s.name)}</option>`).join('')}</select></label><p class="muted">Nombor telefon tidak ditukar di sini untuk mengelakkan login terputus. Penukaran telefon memerlukan kemas kini akaun Auth sekali.</p><div class="form-actions"><button type="button" class="btn" data-close>Batal</button><button class="btn primary" type="submit">Simpan</button></div></form>`,async f=>{await invokeAdmin('update',{id,name:String(f.get('name')).trim(),site_id:f.get('site')||null});notify('Maklumat pekerja dikemas kini.');},'edit-staff-'+id);
}
function showPasswordDialog(id){const p=state.staff.find(s=>s.id===id);if(!p)return;openDialog(`<h2>Reset Kata Laluan</h2><p>${esc(p.full_name)} · Staff #${pad(p.staff_no)}</p><form><label class="field"><span class="label">Kata laluan baharu</span><input name="password" type="password" required minlength="8" autocomplete="new-password"></label><div class="form-actions"><button type="button" class="btn" data-close>Batal</button><button type="submit" class="btn primary">Tetapkan Password</button></div></form>`,async f=>{await invokeAdmin('password',{id,password:String(f.get('password'))});notify('Password pekerja berjaya ditukar.');});}
function showToggleDialog(id){const p=state.staff.find(s=>s.id===id);if(!p)return;const activating=!p.active;openDialog(`<h2>${activating?'Aktifkan':'Nyahaktifkan'} Staff?</h2><p>${esc(p.full_name)}</p><p>${activating?'Pekerja boleh login semula selepas diaktifkan.':'Akses akaun Attendance akan dinyahaktifkan.'}</p><form><div class="form-actions"><button type="button" class="btn" data-close>Batal</button><button class="btn ${activating?'teal':'danger'}" type="submit">Sahkan</button></div></form>`,async()=>{await invokeAdmin('active',{id,active:activating});notify('Status pekerja dikemas kini.');});}
function adminSites(){frame(`${dateHead('Pengurusan Tapak','Tetapkan lokasi operasi dan koordinat GPS.')}<section class="card"><div class="card-header"><h2>Tambah Tapak Baharu</h2><span class="badge neutral">50 – 5,000 m / tapak</span></div><form id="siteForm"><label class="field"><span class="label">Nama tapak</span><input name="name" required maxlength="120" placeholder="Contoh: OFFICE 9"></label><div class="form-grid"><label class="field"><span class="label">Latitude</span><input name="lat" type="number" step="any" min="-90" max="90" required placeholder="2.941855"></label><label class="field"><span class="label">Longitude</span><input name="lng" type="number" step="any" min="-180" max="180" required placeholder="101.675017"></label></div><label class="field"><span class="label">Radius dibenarkan (meter)</span><input name="radius_m" type="number" inputmode="numeric" min="50" max="5000" step="1" value="200" required></label><p class="draft-status" data-draft-note>Draf disimpan automatik pada peranti ini.</p><div class="form-actions"><button class="btn primary" type="submit">${svg('plus')} Tambah Tapak</button></div></form></section><section class="card"><div class="card-header"><h2>Senarai Tapak</h2><span class="badge neutral">${state.sites.length} tapak</span></div>${state.sites.length?state.sites.map(s=>`<div class="site-line"><div><strong>${esc(s.name)}</strong><small style="display:block;margin-top:6px">${Number(s.latitude).toFixed(6)}, ${Number(s.longitude).toFixed(6)}<br>Radius: ${Math.round(Number(s.radius_m)||200)} m</small></div><button class="btn small" data-site-edit="${s.id}">${svg('edit')} Edit</button></div>`).join(''):empty('Tiada tapak didaftarkan','pin')}</section>`);
 attachDraft(document.getElementById('siteForm'),'add-site');
 document.getElementById('siteForm').onsubmit=async e=>{e.preventDefault();const form=e.currentTarget,f=new FormData(form),button=form.querySelector('button[type=submit]'),lat=Number(f.get('lat')),lng=Number(f.get('lng'));if(!Number.isFinite(lat)||Math.abs(lat)>90||!Number.isFinite(lng)||Math.abs(lng)>180)return notify('Koordinat tidak sah.',true);const radius=Number(f.get('radius_m'));if(!Number.isInteger(radius)||radius<50||radius>5000)return notify('Radius mesti antara 50 dan 5000m.',true);button.disabled=true;try{const {error}=await db.from('att_v3_sites').insert({name:String(f.get('name')).trim(),latitude:lat,longitude:lng,radius_m:radius});if(error)throw error;clearDraft('add-site');await refresh();notify('Tapak baharu berjaya ditambah.');}catch(err){notify(errorText(err),true);if(button.isConnected)button.disabled=false;}};
 for(const btn of document.querySelectorAll('[data-site-edit]'))btn.onclick=()=>{const s=state.sites.find(x=>x.id===btn.dataset.siteEdit);if(!s)return;openDialog(`<h2>Edit Tapak</h2><p>Ubah koordinat dan radius GPS untuk tapak ini.</p><form><label class="field"><span class="label">Nama tapak</span><input name="name" required maxlength="120" value="${esc(s.name)}"></label><label class="field"><span class="label">Latitude</span><input name="lat" type="number" min="-90" max="90" step="any" required value="${s.latitude}"></label><label class="field"><span class="label">Longitude</span><input name="lng" type="number" min="-180" max="180" step="any" required value="${s.longitude}"></label><label class="field"><span class="label">Radius GPS (meter)</span><input name="radius_m" type="number" min="50" max="5000" required value="${s.radius_m||200}"></label><p class="draft-status" data-draft-note>Draf disimpan automatik tanpa perlu tekan Save.</p><div class="form-actions"><button type="button" class="btn" data-close>Batal</button><button type="submit" class="btn primary">Simpan Tapak</button></div></form>`,async f=>{const lat=Number(f.get('lat')),lng=Number(f.get('lng'));if(!Number.isFinite(lat)||Math.abs(lat)>90||!Number.isFinite(lng)||Math.abs(lng)>180)throw Error('Koordinat tidak sah.');const radius=Number(f.get('radius_m'));if(!Number.isInteger(radius)||radius<50||radius>5000)throw Error('Radius mesti 50 hingga 5,000m.');const {error}=await db.from('att_v3_sites').update({name:String(f.get('name')).trim(),latitude:lat,longitude:lng,radius_m:radius}).eq('id',s.id);if(error)throw error;notify('Tapak berjaya dikemas kini.');},'edit-site-'+s.id);};
}
// Eksport .xlsx: semua halaman dalam bulan terpilih, bukan hanya 20 rekod di skrin.
const reportFilters={site:'',staff:''};
function recordsReportControls(){return `<div class="report-controls"><div class="filter-select"><label class="label" for="reportSite">Tapak</label><select id="reportSite"><option value="">Semua tapak</option>${state.sites.map(x=>`<option value="${esc(x.id)}" ${reportFilters.site===x.id?'selected':''}>${esc(x.name)}</option>`).join('')}</select></div><div class="filter-select"><label class="label" for="reportStaff">Pekerja</label><select id="reportStaff"><option value="">Semua pekerja</option>${state.staff.filter(s=>s.role==='staff').map(x=>`<option value="${esc(x.id)}" ${reportFilters.staff===x.id?'selected':''}>#${pad(x.staff_no)} ${esc(x.full_name)}</option>`).join('')}</select></div><button type="button" id="exportExcel" class="btn teal">${svg('arrow')} Download Excel (.xlsx)</button></div><p class="muted report-help">Excel mengandungi dua sheet: Ringkasan dan Rekod Harian. Status hadir berdasarkan rekod sebenar (tiada anggaran ponteng atau lewat).</p>`;}
function installReportControls(){for(const id of ['Site','Staff']){const input=document.getElementById('report'+id);if(!input)continue;input.onchange=()=>{reportFilters[id.toLowerCase()]=input.value;const v=getMonthView('records');v.page=0;v.loadedKey='';v.rows=[];v.requestId++;v.loading=false;render();};}const btn=document.getElementById('exportExcel');if(btn)btn.onclick=()=>downloadMonthlyExcel(btn);}
async function downloadMonthlyExcel(button){if(!roleIsAdmin()||!state.user)return;
 const month=getMonthView('records').month,start=month+'-01',end=monthNext(month),uid=state.user.id;
 button.disabled=true;const old=button.innerHTML;button.innerHTML='<span class="loading-spinner"></span> Menjana Excel…';
 try{
  const rows=[];let offset=0;const batch=500;
  for(;;){let query=db.from('att_v3_attendance').select('*').gte('work_date',start).lt('work_date',end).order('work_date',{ascending:true}).order('clock_in_at',{ascending:true}).range(offset,offset+batch-1);
   if(reportFilters.site)query=query.eq('site_id',reportFilters.site);
   if(reportFilters.staff)query=query.eq('user_id',reportFilters.staff);
   const {data,error}=await query;if(error)throw error;
   if(uid!==state.user?.id||!roleIsAdmin())throw Error('Sesi telah bertukar. Sila login semula.');
   if(!Array.isArray(data))throw Error('Respons laporan tidak sah.');rows.push(...data);offset+=data.length;
   if(data.length<batch)break;
   if(rows.length>=50000)throw Error('Terlalu banyak rekod untuk satu fail. Pilih tapak atau bulan yang lebih kecil.');
  }
  const roster=state.staff.filter(x=>x.role==='staff'&&(!reportFilters.staff||x.id===reportFilters.staff)&&(!reportFilters.site||x.site_id===reportFilters.site));
  const grouped=new Map(roster.map(x=>[x.id,{person:x,days:new Set(),complete:0,pending:0,hours:0}]));
  const time=t=>t?new Date(t).toLocaleTimeString('en-GB',{timeZone:TIMEZONE,hour:'2-digit',minute:'2-digit',hour12:false}):'';
  const details=[['Staff ID','Nama Pekerja','Tapak','Tarikh','Clock In','Clock Out','Status','Jumlah Jam','Selfie In / Out'].map(tr)];
  for(const r of rows){const person=state.staff.find(x=>x.id===r.user_id);if(!grouped.has(r.user_id))grouped.set(r.user_id,{person,days:new Set(),complete:0,pending:0,hours:0});
   const g=grouped.get(r.user_id);g.days.add(r.work_date);if(r.clock_out_at)g.complete++;else g.pending++;
   const hours=r.clock_out_at&&r.clock_in_at?Math.max(0,(new Date(r.clock_out_at)-new Date(r.clock_in_at))/3600000):0;g.hours+=hours;
   details.push([person?pad(person.staff_no):'—',person?.full_name||tr('Pekerja tidak aktif'),siteOf(r.site_id),r.work_date,time(r.clock_in_at),time(r.clock_out_at),tr(r.clock_out_at?'Selesai':'Belum Clock Out'),r.clock_out_at?Math.round(hours*100)/100:'',`${tr(r.clock_in_selfie_path?'Ada':'Tiada')} / ${tr(r.clock_out_selfie_path?'Ada':'Tiada')}`]);
  }
  const summary=[['Staff ID','Nama Pekerja','Tapak Semasa','Bulan','Hari Ada Rekod','Lengkap Clock Out','Belum Clock Out','Jumlah Jam','Nota'].map(tr)];
  for(const g of [...grouped.values()].sort((a,b)=>(a.person?.staff_no||999999)-(b.person?.staff_no||999999)))summary.push([g.person?pad(g.person.staff_no):'—',g.person?.full_name||tr('Pekerja tidak aktif'),g.person?siteOf(g.person.site_id):'—',month,g.days.size,g.complete,g.pending,Math.round(g.hours*100)/100,tr('Tiada status tidak hadir tanpa jadual rasmi')]);
  const {downloadWorkbook}=await import('./xlsx-export.js');const count=await downloadWorkbook({month,summary,details,sheetNames:language()==='bm'?['Ringkasan','Rekod Harian']:['Summary','Daily Records']});notify(`Excel ${month} berjaya dimuat turun: ${count} rekod.`);
 }catch(err){notify('Eksport gagal: '+errorText(err),true);}finally{if(button.isConnected){button.disabled=false;button.innerHTML=old;}}
}

// Admin-only manual deletion: never deletes current/future month, and server repeats all checks.
function monthDeleteControls(){
 const chosen=getMonthView('records').month;const previous=chosen<localDate().slice(0,7);
 return `<details class="delete-zone" id="manualDeleteZone"><summary>${svg('trash')} Delete old attendance records</summary><div class="delete-zone-inner"><p>Delete attendance and IN/OUT selfies permanently from Supabase for a completed month. Employee accounts and other months remain unchanged.</p><div class="delete-form-row"><label class="field"><span class="label">Month</span><input id="deleteMonth" type="month" value="${esc(previous?chosen:monthPrevious())}" max="${monthPrevious()}" required></label><label class="field"><span class="label">Site</span><select id="deleteSite"><option value="">All Sites</option>${state.sites.map(v=>`<option value="${esc(v.id)}">${esc(v.name)}</option>`).join('')}</select></label><button type="button" id="deleteMonthBtn" class="btn danger">${svg('trash')} Delete Records</button></div><p class="danger-sub">Only past months can be deleted. This action cannot be undone.</p><div id="deleteRetry" class="cleanup-retry"><button type="button" class="btn small" id="retryPhotoCleanup">Retry unfinished selfie cleanup</button></div></div></details>`;
}
function monthPrevious(){const [y,m]=localDate().slice(0,7).split('-').map(Number);return new Date(Date.UTC(y,m-2,1)).toISOString().slice(0,7);}
function installDeleteControls(){
 const del=document.getElementById('deleteMonthBtn');if(!del)return;
 del.onclick=()=>{
  const month=document.getElementById('deleteMonth').value;
  const siteId=document.getElementById('deleteSite').value;
  if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)||month>=localDate().slice(0,7))return notify('Only completed months can be deleted.',true);
  const site=siteId?state.sites.find(s=>s.id===siteId)?.name:null;
  openDialog(`<div class="destructive-modal"><span class="danger-icon">${svg('trash')}</span><h2>Delete attendance permanently?</h2><p><strong>${esc(monthLabel(month))}</strong> · ${esc(site||'All Sites')}</p><p>Attendance records, GPS and related selfies will be deleted from Supabase. This cannot be undone.</p><form><div class="form-actions"><button type="button" class="btn" data-close>Cancel</button><button type="submit" class="btn danger">Confirm Delete</button></div></form></div>`,async()=>{
   const result=await invokeDeleteMonth('delete-month',{month,site_id:siteId||null});
   const v=getMonthView('records');v.requestId++;v.loadedKey='';v.loading=false;v.rows=[];v.photos.clear();
   if(result.photos_pending){notify('Records deleted, but some selfies still need cleanup. Select Retry selfie cleanup.',true);}
   else notify('Selected attendance records and selfies have been deleted.');
  });
 };
 document.getElementById('retryPhotoCleanup').onclick=async e=>{const b=e.currentTarget;b.disabled=true;try{const result=await invokeDeleteMonth('retry-photos');notify(result.photos_pending?'Some selfie cleanup remains. Retry again.':'Selfie cleanup completed.',!!result.photos_pending);}catch(err){notify(errorText(err),true);}finally{b.disabled=false;}};
}
async function invokeDeleteMonth(action,params={}){
 requireDb();const {data,error}=await db.functions.invoke('attendance-v3-delete-month',{body:{action,...params}});
 if(error){let msg=error.message;try{const context=error.context;if(context?.json){const j=await context.json();msg=j?.error||msg;}}catch{}throw Error(msg||'Deletion service unavailable. Deploy the V5 Edge Function first.');}
 if(data?.error)throw Error(data.error);return data;
}

function adminRecords(){
 const v=getMonthView('records');
 const tableRows=v.rows.map(r=>`<tr><td><strong>${esc(nameOf(r.user_id))}</strong><small>Staff #${pad(state.staff.find(p=>p.id===r.user_id)?.staff_no)}</small></td><td>${esc(r.work_date)}<small>${esc(siteOf(r.site_id))}</small></td><td>${friendlyTime(r.clock_in_at)}</td><td>${friendlyTime(r.clock_out_at)}</td><td><div class="inline-photos">${photoCell(r.clock_in_selfie_path,'IN')}${photoCell(r.clock_out_selfie_path,'OUT')}</div></td></tr>`).join('');
 const cards=v.rows.map(r=>`<div class="record-card"><div class="record-card-head"><div><strong>${esc(nameOf(r.user_id))}</strong><small>#${pad(state.staff.find(p=>p.id===r.user_id)?.staff_no)} · ${esc(siteOf(r.site_id))}</small></div><span class="badge neutral">${esc(r.work_date)}</span></div><div class="record-card-times"><span>Clock In<strong>${friendlyTime(r.clock_in_at)}</strong></span><span>Clock Out<strong>${friendlyTime(r.clock_out_at)}</strong></span></div><div class="record-card-photos"><span>Selfie</span><div class="inline-photos">${photoCell(r.clock_in_selfie_path,'IN')}${photoCell(r.clock_out_selfie_path,'OUT')}</div></div></div>`).join('');
 const content=v.loading?loadingRecords():v.error?recordsError(v.error):v.rows.length?`<div class="table-wrap record-desktop"><table class="table"><thead><tr><th>Pekerja</th><th>Tarikh / Tapak</th><th>Clock In</th><th>Clock Out</th><th>Selfie In / Out</th></tr></thead><tbody>${tableRows}</tbody></table></div><div class="record-mobile">${cards}</div>`:empty('Tiada kehadiran direkodkan pada bulan ini.','history');
 frame(`${dateHead('Rekod Kehadiran','Selfie, laporan Excel dan rekod kehadiran bulanan.')}<section class="card"><div class="card-header"><h2>Rekod Bulanan</h2><span class="badge neutral">${v.total} rekod</span></div>${monthToolbar('records')}${recordsReportControls()}${content}${pagination('records')}${monthDeleteControls()}<p class="muted" style="margin-top:17px">Data diambil mengikut bulan, 20 rekod setiap halaman. Gambar selfie disimpan secara peribadi dalam Supabase Storage dan dipaparkan melalui pautan sementara.<span class="photo-error" id="selfieHelp"></span></p></section>`);
 wireMonth('records');installReportControls();installDeleteControls();
}

// Rekod bulanan: query server berhalaman, bukan hanya filter 500 rekod terakhir.
function getMonthView(which){const v=monthViews[which];if(!v.month)v.month=localDate().slice(0,7);return v;}
function monthNext(month){const [year,m]=month.split('-').map(Number);return new Date(Date.UTC(year,m,1)).toISOString().slice(0,10);}
function monthLabel(month){return new Date(month+'-01T12:00:00Z').toLocaleDateString(language()==='bm'?'ms-MY':'en-MY',{timeZone:'UTC',month:'long',year:'numeric'});}
function monthSignature(which,v){return `${state.user?.id||''}:${which}:${v.month}:${v.page}:${which==='records'?reportFilters.site+'|'+reportFilters.staff:''}`;}
function photoCell(path,label){return path?`<button type="button" class="photo-thumb" data-selfie-path="${esc(path)}" data-photo-label="${label}" title="Lihat selfie ${label}" aria-label="Lihat selfie ${label}"><span class="photo-placeholder">${svg('camera')}<b>${label}</b></span></button>`:`<span class="no-photo" title="Tiada selfie ${label}">${label}: —</span>`;}
function monthToolbar(which){const v=getMonthView(which);return `<div class="month-toolbar"><div class="month-field"><label for="monthFilter-${which}" class="label">Bulan Kehadiran</label><input type="month" id="monthFilter-${which}" value="${esc(v.month)}" min="2020-01" max="2100-12"></div><div class="month-description"><strong>${esc(monthLabel(v.month))}</strong><small>Papar rekod terbaru dahulu</small></div><button type="button" class="btn small" id="monthReload-${which}" aria-label="Muat semula rekod">${svg('refresh')} Refresh</button></div>`;}
function loadingRecords(){return `<div class="records-loading"><span class="record-spinner"></span><span>Memuatkan rekod daripada Supabase…</span></div>`;}
function recordsError(msg){return `<div class="error-inline records-error">Gagal mendapatkan rekod: ${esc(msg)}</div>`;}
function pagination(which){const v=getMonthView(which);if(v.loading||v.error||v.total<=v.pageSize)return '';const start=v.page*v.pageSize+1,end=Math.min(v.total,(v.page+1)*v.pageSize);return `<div class="month-pages"><small>Rekod ${start}–${end} daripada ${v.total}</small><div><button class="btn small" id="monthPrev-${which}" ${v.page===0?'disabled':''}>Sebelumnya</button><span>Halaman ${v.page+1} / ${Math.ceil(v.total/v.pageSize)}</span><button class="btn small" id="monthNext-${which}" ${(v.page+1)*v.pageSize>=v.total?'disabled':''}>Seterusnya</button></div></div>`;}
function wireMonth(which){
 const v=getMonthView(which),sig=monthSignature(which,v);
 const filter=document.getElementById('monthFilter-'+which);
 filter.onchange=()=>{if(!/^\d{4}-(0[1-9]|1[012])$/.test(filter.value)){notify('Bulan tidak sah.',true);return;}v.month=filter.value;v.page=0;v.loadedKey='';v.photos.clear();render();};
 document.getElementById('monthReload-'+which).onclick=()=>{v.loadedKey='';v.photos.clear();render();};
 const prev=document.getElementById('monthPrev-'+which),next=document.getElementById('monthNext-'+which);
 if(prev)prev.onclick=()=>{if(v.page>0){v.page--;v.loadedKey='';v.photos.clear();render();}};
 if(next)next.onclick=()=>{if((v.page+1)*v.pageSize<v.total){v.page++;v.loadedKey='';v.photos.clear();render();}};
 document.querySelectorAll('[data-selfie-path]').forEach(button=>button.onclick=()=>openSelfie(button.dataset.selfiePath,button.dataset.photoLabel));
 applyMonthPhotos(which);
 if(v.loadedKey!==sig&&!v.loading)void fetchMonth(which);
}
async function fetchMonth(which){
 const v=getMonthView(which),sig=monthSignature(which,v),id=state.user?.id;
 if(!db||!id||v.loading)return;
 v.loading=true;v.error='';v.rows=[];v.photos.clear();v.photoError='';const req=++v.requestId;
 const start=v.month+'-01',end=monthNext(v.month),first=v.page*v.pageSize,last=first+v.pageSize-1;
 try{
  let q=db.from('att_v3_attendance').select('*',{count:'exact'}).gte('work_date',start).lt('work_date',end).order('work_date',{ascending:false}).order('clock_in_at',{ascending:false}).range(first,last);
  if(which==='history')q=q.eq('user_id',id);else{if(reportFilters.site)q=q.eq('site_id',reportFilters.site);if(reportFilters.staff)q=q.eq('user_id',reportFilters.staff);}
  const {data,error,count}=await q;
  if(req!==v.requestId||id!==state.user?.id||sig!==monthSignature(which,v))return;
  if(error)throw error;
  v.rows=data||[];v.total=count??v.rows.length;v.loadedKey=sig;
 }catch(error){if(req!==v.requestId||id!==state.user?.id||sig!==monthSignature(which,v))return;v.error=error.message||String(error);v.loadedKey=sig;}
 finally{
  if(req===v.requestId&&id===state.user?.id&&sig===monthSignature(which,v)){
   v.loading=false;
   if(state.view===which)render();
   if(!v.error&&v.rows.length)void fetchMonthPhotos(which,sig);
  }
 }
}
async function fetchMonthPhotos(which,sig){
 const v=getMonthView(which);
 const paths=[...new Set(v.rows.flatMap(row=>[row.clock_in_selfie_path,row.clock_out_selfie_path].filter(Boolean)))];
 if(!paths.length||!db)return;
 try{
  const {data,error}=await db.storage.from('att-v3-selfies').createSignedUrls(paths,600);
  if(error)throw error;
  if(sig!==monthSignature(which,v)||state.view!==which)return;
  for(const item of data||[])if(item.signedUrl&&item.path)v.photos.set(item.path,item.signedUrl);
  v.photoError=(data||[]).some(x=>x.error)?tr('Sesetengah selfie tidak dapat dibaca.'):' ';
  applyMonthPhotos(which);
 }catch(error){if(sig!==monthSignature(which,v))return;v.photoError=tr('Selfie tidak dapat dipaparkan: ')+(error.message||String(error));const help=document.getElementById('selfieHelp');if(help)help.textContent=' '+v.photoError;}
}
function applyMonthPhotos(which){
 const v=getMonthView(which);
 if(state.view!==which)return;
 const help=document.getElementById('selfieHelp');if(help&&v.photoError.trim())help.textContent=' '+v.photoError;
 for(const button of document.querySelectorAll('[data-selfie-path]')){
  const url=v.photos.get(button.dataset.selfiePath);if(!url||button.querySelector('img'))continue;
  const image=document.createElement('img');image.src=url;image.alt='Selfie '+button.dataset.photoLabel;image.loading='lazy';image.decoding='async';
  image.onerror=()=>{image.remove();button.classList.add('photo-unavailable');};
  button.prepend(image);button.classList.add('photo-loaded');
 }
}
async function openSelfie(path,label){
 if(!path||!db)return;
 modalContent.innerHTML=`<div class="selfie-viewer"><div class="selfie-modal-head"><div><div class="eyebrow">REKOD KEHADIRAN</div><h2>Selfie ${esc(label||'')}</h2></div><button class="btn small" type="button" id="closeSelfie">Tutup</button></div><div id="selfieViewerBody" class="selfie-viewer-body"><span class="record-spinner"></span> Memuatkan gambar…</div><p class="muted" style="margin:12px 0 0">Gambar peribadi · Akses terhad kepada pemilik rekod dan Admin Attendance.</p></div>`;
 translateTree(modalContent);modalContent.querySelector('#closeSelfie').onclick=()=>modal.close();modal.showModal();
 try{
  const {data,error}=await db.storage.from('att-v3-selfies').createSignedUrl(path,300);
  if(error)throw error;
  if(!modal.open)return;
  const body=modalContent.querySelector('#selfieViewerBody');if(!body)return;
  body.innerHTML='';const image=document.createElement('img');image.src=data.signedUrl;image.alt='Selfie '+(label||'');image.decoding='async';image.onerror=()=>{body.textContent=tr('Gambar gagal dimuatkan. Semak Storage dan kebenaran akses.');};body.appendChild(image);
 }catch(err){const body=modalContent.querySelector('#selfieViewerBody');if(body)body.textContent=tr('Gagal membuka selfie: ')+(err.message||String(err));}
}
function onUserChanged(next){const old=state.user?.id;state.user=next;
 if(!next){for(const v of Object.values(monthViews)){v.requestId++;v.loading=false;v.loadedKey='';v.rows=[];v.total=0;v.photos.clear();v.error='';}reportFilters.site='';reportFilters.staff='';state.fetchId++;state.profile=null;state.lastUser=null;state.sites=[];state.records=[];state.staff=[];state.site=null;state.view='home';resetCapture();showLogin();return;}
 if(old!==next.id){for(const v of Object.values(monthViews)){v.requestId++;v.loading=false;v.loadedKey='';v.rows=[];v.total=0;v.photos.clear();v.error='';}state.lastUser=null;resetCapture();}
 // Avoid duplicate refresh caused by INITIAL_SESSION and SIGNED_IN event.
 if(activeRefresh?.uid===next.id)return;
 refresh().catch(e=>{notify(errorText(e),true);});
}
if(db){db.auth.onAuthStateChange((evt,session)=>{if(evt==='TOKEN_REFRESHED')return;setTimeout(()=>onUserChanged(session?.user||null),0);});
 db.auth.getSession().then(({data,error})=>{if(error)notify(error.message,true);if(!state.profile&&!activeRefresh)onUserChanged(data?.session?.user||null);}).catch(e=>{showLogin();notify(errorText(e),true);});
}else{showLogin();}

// Localise dynamic GPS/camera elements explicitly; no MutationObserver for smoother UI.
