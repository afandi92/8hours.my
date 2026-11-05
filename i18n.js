/** Attendance V5 UI localisation. BM source strings remain backwards-compatible.
 * EN is the default; per-device preference only (no Supabase profile migration).
 * No remote translation service / UI framework required.
 */
const DICTIONARY = {
 'Hari ini':'Today','Sejarah':'History','Profil':'Profile','Pekerja':'Employees','Tapak':'Sites','Kehadiran':'Attendance',
 'Log masuk Attendance':'Sign in to Attendance','Portal kehadiran pekerja, selamat dan ringkas.':'A secure and simple workforce attendance portal.',
 'Staff · Telefon':'Staff · Phone','Admin · Email':'Admin · Email','Negara / kod':'Country / code','Nombor telefon':'Phone number',
 'Kata laluan':'Password','Kata laluan awal (min. 8 aksara)':'Initial password (min. 8 characters)',
 'Emel Admin':'Admin email','Masukkan kata laluan':'Enter your password','Log Masuk':'Sign In','Sedang log masuk…':'Signing in…',
 'Akaun pekerja disediakan oleh Admin · Tiada OTP':'Staff accounts are managed by Admin · No OTP required',
 'Sila isi URL dan publishable key Supabase dalam config.js.':'Configure the Supabase URL and publishable key in config.js.',
 'Akaun belum didaftarkan':'Account not registered','Profil tiada dalam att_v3_profiles.':'No profile found in att_v3_profiles.',
 'Log keluar':'Sign Out','Akaun telah dinyahaktifkan.':'Account has been deactivated.',
 'Profil Attendance V3 tiada atau tidak boleh dibaca:':'Attendance V3 profile missing or inaccessible:',
 'Akaun tidak aktif atau jenis login tidak sepadan.':'Inactive account or incorrect sign-in type.',
 'Ralat tidak diketahui':'Unknown error','Supabase belum disediakan. Semak config.js.':'Supabase is not configured. Check config.js.',
 'Edge Function gagal.':'Edge Function failed.',
 'Kehadiran, lokasi GPS dan selfie dikendalikan dengan akaun berasingan.':'Attendance, GPS and selfies use dedicated accounts.',
 'Navigasi':'Navigation','Log keluar':'Sign Out','ATTENDANCE MANAGEMENT':'ATTENDANCE MANAGEMENT',
 'Staff ID':'Staff ID','Jumlah Staff':'Total Staff','Pekerja berdaftar':'Registered employees','Aktif':'Active','Tidak aktif':'Inactive',
 'Akaun aktif':'Active accounts','Di Tapak':'On Site','Sudah Clock In':'Clocked In','Selesai':'Completed',
 'Sudah Clock Out':'Clocked Out','Ringkasan operasi dan kehadiran pekerja hari ini.':'Workforce overview and today’s attendance.',
 'Aktiviti Hari Ini':'Today’s Activity','Mengemas kini…':'Refreshing…','Masih di tapak':'Still on site',
 'Clock Out selesai':'Clock Out completed','Belum ada kehadiran hari ini.':'No attendance recorded today.',
 'Pengurusan Pekerja':'Employee Management','Tambah pekerja, tetapkan tapak dan urus akaun.':'Manage employee accounts and site assignments.',
 'Buka Staff':'View Employees','Jumlah pekerja':'Total employees',
 'SALAM SEJAHTERA':'WELCOME','TODAY\'S SCHEDULE':'TODAY\'S SITE','Tiada site ditetapkan':'No site assigned',
 'Tiada site ditetapkan.':'No site assigned.','Tapak belum ditetapkan':'No site assigned',
 'Jadual masa: rujuk penyelia tapak':'Work schedule: contact your supervisor',
 'Koordinat tapak:':'Site coordinates:','Koordinat anda:':'Your coordinates:',
 'Belum disemak':'Not checked','Jarak ke tapak':'Distance to site','Radius dibenarkan':'Allowed radius',
 'Ketepatan GPS':'GPS accuracy','Menunggu GPS':'Waiting for GPS','Status':'Status',
 'GPS akan diperiksa secara automatik. Sila benarkan akses lokasi.':'GPS will be checked automatically. Please allow location access.',
 'Admin perlu menetapkan tapak untuk akaun ini.':'An Admin must assign a site to this account.',
 'Semak semula GPS':'Retry GPS','Kamera langsung sahaja · Bukan galeri':'Live camera only · No gallery uploads',
 'Selfie hanya boleh diambil terus daripada kamera hadapan.':'Selfies must be captured with the front camera.',
 'SELESAI HARI INI':'DONE FOR TODAY','Kehadiran hari ini telah lengkap.':'Today’s attendance is complete.',
 'Sistem memerlukan lokasi GPS tepat dalam radius tapak dan selfie secara langsung.':'Valid on-site GPS and a live selfie are required.',
 'Mencari…':'Locating…','Dalam kawasan':'Within site','Di luar radius':'Outside radius',
 'GPS kurang tepat':'Low GPS accuracy','GPS belum tersedia':'GPS unavailable',
 'Mendapatkan lokasi peranti…':'Getting device location…',
 'GPS sah. Sila ambil selfie untuk meneruskan.':'GPS verified. Take a selfie to continue.',
 'Tekan Semak semula GPS apabila peranti sudah bersedia.':'Tap Retry GPS when your device is ready.',
 'Browser tidak menyokong GPS.':'Your browser does not support GPS.',
 'Memeriksa GPS…':'Checking GPS…','GPS tepat tidak tersedia. Cuba mod alternatif…':'Precise GPS is unavailable. Trying an alternative…',
 'Bacaan GPS tidak sah.':'Invalid GPS reading.',
 'Lokasi disahkan. Jarak dan ketepatan GPS memenuhi syarat.':'Location verified. GPS distance and accuracy meet requirements.',
 'Kebenaran lokasi ditolak. Benarkan GPS dalam tetapan browser.':'Location permission denied. Enable location access in your browser.',
 'Lokasi tidak tersedia. Hidupkan Location Services/Wi-Fi.':'Location unavailable. Enable Location Services and Wi-Fi.',
 'GPS timeout. Cuba semula atau gunakan telefon dengan HTTPS.':'GPS timed out. Try again on a secure HTTPS connection.',
 'GPS gagal:':'GPS failed:','GPS dan selfie lengkap. Kehadiran sedia dihantar.':'GPS and selfie verified. Ready to submit.',
 'Benarkan akses GPS dahulu.':'Please allow GPS access first.',
 'Lokasi tidak memenuhi radius / ketepatan atau telah luput.':'GPS is outside range, inaccurate or expired.',
 'Ambil selfie menggunakan kamera hadapan.':'Take a selfie using the front camera.',
 'Kamera memerlukan HTTPS atau localhost dan browser yang menyokong getUserMedia.':'Camera requires HTTPS or localhost and a supported browser.',
 'Membuka kamera…':'Opening camera…','Pratonton kamera hadapan':'Front camera preview',
 'Tutup':'Close','Pastikan wajah jelas sebelum tekan Capture Selfie.':'Make sure your face is clearly visible before capturing.',
 'Akses kamera tidak dibenarkan. Sila benarkan kamera pada browser.':'Camera permission denied. Allow camera access in your browser.',
 'Kamera tidak ditemui pada peranti ini.':'No camera found on this device.',
 'Kamera belum bersedia. Cuba lagi.':'Camera is not ready. Try again.',
 'Dibenarkan':'Allowed','Sedang semak':'Checking','Ditolak':'Denied','Belum Clock In':'Not clocked in',
 'GPS details':'Butiran GPS',
 'Gagal mengambil selfie. Sila cuba lagi.':'Could not capture selfie. Try again.',
 'Selfie yang baru diambil':'Captured selfie','Selfie diambil':'Selfie captured',
 'Selfie diambil terus daripada kamera. Gambar akan dihantar bersama kehadiran.':'Selfie captured live and will be submitted with attendance.',
 'Sila ambil selfie terlebih dahulu.':'Please capture a selfie first.','GPS perlu disahkan semula.':'Please reverify your GPS.',
 'GPS semasa tidak memenuhi syarat. Kehadiran belum dihantar.':'Current GPS does not meet requirements. Attendance was not submitted.',
 'Memastikan lokasi…':'Verifying location…','Menyimpan kehadiran…':'Saving attendance…',
 'Clock In berjaya direkodkan.':'Clock In recorded successfully.','Clock Out berjaya direkodkan.':'Clock Out recorded successfully.',
 'Sejarah Kehadiran':'Attendance History','Semak kehadiran anda mengikut bulan dan lihat selfie yang direkodkan.':'Review your monthly attendance records and selfies.',
 'Rekod Anda':'Your Records','rekod bulan ini':'records this month','Belum Clock Out':'Not clocked out',
 'Tiada rekod kehadiran pada bulan ini.':'No attendance records for this month.',
 'Rekod disimpan dalam Supabase. Selfie hanya boleh dilihat oleh pekerja berkenaan dan Admin Attendance.':'Records are stored in Supabase. Selfies are accessible only to their owner and Attendance Admin.',
 'Profil Pekerja':'Employee Profile','Maklumat akaun kehadiran anda.':'Your attendance account details.',
 'Belum ditetapkan':'Unassigned','Untuk menukar profil atau kata laluan, sila hubungi Admin.':'Contact Admin to change your profile or password.',
 'Maklumat akan muncul apabila tersedia.':'Information will appear here when available.',
 'Urus akaun Staff terus dari web, tanpa SMS atau OTP.':'Manage staff accounts directly, with no SMS or OTP.',
 'Tambah Pekerja':'Add Employee','Staff ID automatik':'Automatic Staff ID','Nama penuh pekerja':'Employee full name',
 'Nama seperti di dokumen':'Name as shown on identification','Tetapkan tapak':'Assign site',
 'Draf akan disimpan semasa menaip, kecuali password.':'Draft saves as you type, except passwords.',
 'Tambah Staff':'Add Employee','Senarai Pekerja':'Employee Directory','orang':'employees',
 'Cari nama, ID atau nombor…':'Search name, ID or phone…','Cari pekerja':'Search employees',
 'Nyahaktif':'Deactivate','Aktifkan':'Activate','Nyahaktifkan':'Deactivate',
 'Tiada pekerja didaftarkan':'No employees registered',
 'Staff ID tidak dikitar semula. Penghapusan akaun Attendance dikawal supaya tidak menjejaskan akaun projek lain.':'Staff IDs are never recycled. Accounts are kept to preserve attendance history.',
 'Staff ID':'Staff ID','Draf sebelumnya dipulihkan daripada peranti ini.':'Previous draft restored from this device.',
 'Draf disimpan secara automatik di peranti ini.':'Draft saved automatically on this device.',
 'Draf tidak dapat disimpan (storan browser terhad).':'Unable to save draft (browser storage is full).',
 'Edit Pekerja':'Edit Employee','Kemas kini nama dan penempatan tapak.':'Update employee name and site assignment.',
 'Nama penuh':'Full name','Nombor telefon tidak ditukar di sini untuk mengelakkan login terputus. Penukaran telefon memerlukan kemas kini akaun Auth sekali.':'Phone number changes require an account update to prevent sign-in issues.',
 'Batal':'Cancel','Simpan':'Save','Maklumat pekerja dikemas kini.':'Employee details updated.',
 'Reset Kata Laluan':'Reset Password','Kata laluan baharu':'New password',
 'Tetapkan Password':'Set Password','Password pekerja berjaya ditukar.':'Employee password updated.',
 'Staff?':'employee?','Pekerja boleh login semula selepas diaktifkan.':'Employee can sign in again once activated.',
 'Akses akaun Attendance akan dinyahaktifkan.':'Attendance account access will be disabled.',
 'Sahkan':'Confirm','Status pekerja dikemas kini.':'Employee status updated.',
 'Pengurusan Tapak':'Site Management','Tetapkan lokasi operasi dan koordinat GPS.':'Set operational sites and their GPS coordinates.',
 'Tambah Tapak Baharu':'Add New Site','Nama tapak':'Site name','Radius dibenarkan (meter)':'Allowed radius (metres)',
 'Draf disimpan automatik pada peranti ini.':'Draft saves automatically on this device.',
 'Tambah Tapak':'Add Site','Senarai Tapak':'Site Directory','tapak':'sites',
 'Tiada tapak didaftarkan':'No sites registered','Koordinat tidak sah.':'Invalid coordinates.',
 'Radius mesti antara 50 dan 5000m.':'Radius must be between 50 and 5000 m.',
 'Tapak baharu berjaya ditambah.':'Site added successfully.',
 'Edit Tapak':'Edit Site','Ubah koordinat dan radius GPS untuk tapak ini.':'Update the GPS coordinates and radius for this site.',
 'Radius GPS (meter)':'GPS radius (metres)','Draf disimpan automatik tanpa perlu tekan Save.':'Draft automatically saves without pressing Save.',
 'Simpan Tapak':'Save Site','Radius mesti 50 hingga 5,000m.':'Radius must be between 50 and 5,000 m.',
 'Tapak berjaya dikemas kini.':'Site updated successfully.',
 'Semua tapak':'All Sites','Semua pekerja':'All Employees',
 'Excel mengandungi dua sheet: Ringkasan dan Rekod Harian. Status hadir berdasarkan rekod sebenar (tiada anggaran ponteng atau lewat).':'Excel includes Summary and Daily Records. Attendance is based on recorded events only.',
 'Menjana Excel…':'Generating Excel…','Sesi telah bertukar. Sila login semula.':'Session changed. Please sign in again.',
 'Respons laporan tidak sah.':'Invalid report response.',
 'Terlalu banyak rekod untuk satu fail. Pilih tapak atau bulan yang lebih kecil.':'Too many records for one report. Select a smaller site or month.',
 'Nama Pekerja':'Employee Name','Tapak Semasa':'Current Site','Tarikh':'Date','Jumlah Jam':'Total Hours','Selfie In / Out':'IN / OUT Selfies',
 'Bulan':'Month','Hari Ada Rekod':'Days Recorded','Lengkap Clock Out':'Completed Clock Out','Belum Clock Out':'Pending Clock Out',
 'Nota':'Notes','Pekerja tidak aktif':'Inactive employee','Ada':'Yes','Tiada':'No',
 'Tiada status tidak hadir tanpa jadual rasmi':'No absence status without an approved schedule',
 'Eksport gagal:':'Export failed:','berjaya dimuat turun:':'downloaded successfully:',
 'Rekod Kehadiran':'Attendance Records','Selfie, laporan Excel dan rekod kehadiran bulanan.':'Monthly attendance, private selfies and Excel reports.',
 'Rekod Bulanan':'Monthly Records','rekod':'records','Tarikh / Tapak':'Date / Site',
 'Tiada kehadiran direkodkan pada bulan ini.':'No attendance recorded for this month.',
 'Data diambil mengikut bulan, 20 rekod setiap halaman. Gambar selfie disimpan secara peribadi dalam Supabase Storage dan dipaparkan melalui pautan sementara.':'Monthly data is paginated at 20 rows per page. Private selfies use temporary links.',
 'Bulan Kehadiran':'Attendance Month','Papar rekod terbaru dahulu':'Newest records first',
 'Muat semula rekod':'Reload records','Memuatkan rekod daripada Supabase…':'Loading records from Supabase…',
 'Gagal mendapatkan rekod:':'Unable to load records:','Rekod':'Records','daripada':'of',
 'Sebelumnya':'Previous','Halaman':'Page','Seterusnya':'Next','Bulan tidak sah.':'Invalid month.',
 'Lihat selfie':'View selfie','Selfie tidak dapat dipaparkan:':'Selfie unavailable:',
 'Sesetengah selfie tidak dapat dibaca.':'Some selfies are unavailable.',
 'REKOD KEHADIRAN':'ATTENDANCE RECORD','Memuatkan gambar…':'Loading image…',
 'Gambar peribadi · Akses terhad kepada pemilik rekod dan Admin Attendance.':'Private image · Access restricted to its owner and Attendance Admin.',
 'Gambar gagal dimuatkan. Semak Storage dan kebenaran akses.':'Image failed to load. Check Storage permissions.',
 'Gagal membuka selfie:':'Unable to open selfie:',
 // Newly introduced V5 action text (BM mode)
 'Manage':'Urus','GPS details':'Butiran GPS',
 'Refresh':'Muat Semula','Download Excel (.xlsx)':'Muat Turun Excel (.xlsx)',
 'Secure attendance with verified GPS and live selfie.':'Kehadiran selamat dengan GPS disahkan dan selfie langsung.',
 'Attendance V3 · Malaysia Time (MYT) · GPS + Live Selfie':'Attendance V3 · Waktu Malaysia (MYT) · GPS + Selfie Langsung',
 'WELCOME BACK':'SELAMAT KEMBALI','WORKFORCE PORTAL':'PORTAL KEHADIRAN','ADMINISTRATION':'PENTADBIRAN',
 'ATTENDANCE MANAGEMENT':'PENGURUSAN KEHADIRAN','STAFF PORTAL':'PORTAL PEKERJA',
 'TODAY’S SITE':'TAPAK HARI INI',"TODAY'S SCHEDULE":'TAPAK HARI INI',
 'CLOCK IN':'MASUK KERJA','CLOCK OUT':'TAMAT KERJA',
 'Clock In':'Masuk Kerja','Clock Out':'Tamat Kerja',
 'CLOCK IN / OUT LOCATION':'LOKASI MASUK / TAMAT KERJA',
 'Take Front Selfie':'Ambil Selfie Hadapan',
 'Capture Selfie':'Ambil Selfie','Retake':'Ambil Semula',
 'GPS details':'Butiran GPS',
 'Delete old attendance records':'Padam rekod kehadiran lama',
 'Delete attendance and IN/OUT selfies permanently from Supabase for a completed month. Employee accounts and other months remain unchanged.':'Padam rekod kehadiran dan selfie IN/OUT secara kekal daripada Supabase bagi bulan yang telah tamat. Akaun pekerja dan bulan lain kekal.',
 'Month':'Bulan','Site':'Tapak','All Sites':'Semua Tapak','Delete Records':'Padam Rekod',
 'Only past months can be deleted. This action cannot be undone.':'Hanya bulan terdahulu boleh dipadam. Tindakan ini tidak boleh dibatalkan.',
 'Retry unfinished selfie cleanup':'Cuba semula pembersihan selfie yang belum selesai',
 'Delete attendance permanently?':'Padam kehadiran secara kekal?',
 'Attendance records, GPS and related selfies will be deleted from Supabase. This cannot be undone.':'Rekod kehadiran, GPS dan selfie berkaitan akan dipadam daripada Supabase. Tindakan tidak boleh dibatalkan.',
 'Cancel':'Batal','Confirm Delete':'Sahkan Padam',
 'Only completed months can be deleted.':'Hanya bulan yang telah tamat boleh dipadam.',
 'Records deleted, but some selfies still need cleanup. Select Retry selfie cleanup.':'Rekod telah dipadam tetapi sebahagian selfie belum dibersihkan. Pilih Cuba Semula.',
 'Selected attendance records and selfies have been deleted.':'Rekod kehadiran dan selfie yang dipilih telah dipadam.',
 'Some selfie cleanup remains. Retry again.':'Masih ada selfie belum dibersihkan. Cuba lagi.',
 'Selfie cleanup completed.':'Pembersihan selfie selesai.',
};

// Labels authored directly in English in V5, translated only when BM is active.
const ENGLISH_V5_LABELS=new Set([
 'Manage','GPS details','Refresh','Download Excel (.xlsx)','Secure attendance with verified GPS and live selfie.',
 'Attendance V3 · Malaysia Time (MYT) · GPS + Live Selfie','WELCOME BACK','WORKFORCE PORTAL',
 'ADMINISTRATION','ATTENDANCE MANAGEMENT','STAFF PORTAL','TODAY’S SITE',"TODAY'S SCHEDULE",
 'CLOCK IN','CLOCK OUT','Clock In','Clock Out','CLOCK IN / OUT LOCATION',
 'Take Front Selfie','Capture Selfie','Retake',
 'Delete old attendance records',
 'Delete attendance and IN/OUT selfies permanently from Supabase for a completed month. Employee accounts and other months remain unchanged.',
 'Month','Site','All Sites','Delete Records','Only past months can be deleted. This action cannot be undone.',
 'Retry unfinished selfie cleanup','Delete attendance permanently?',
 'Attendance records, GPS and related selfies will be deleted from Supabase. This cannot be undone.',
 'Cancel','Confirm Delete','Only completed months can be deleted.',
 'Records deleted, but some selfies still need cleanup. Select Retry selfie cleanup.',
 'Selected attendance records and selfies have been deleted.','Some selfie cleanup remains. Retry again.',
 'Selfie cleanup completed.'
]);
const V5_BM=Object.fromEntries(Object.entries(DICTIONARY).filter(([key])=>ENGLISH_V5_LABELS.has(key)));
let selected = (()=>{try{return localStorage.getItem('att-v3-lang')==='bm'?'bm':'en';}catch{return 'en';}})();
export const language=()=>selected;
export function setLanguage(newLang){selected=newLang==='bm'?'bm':'en';document.documentElement.lang=selected==='bm'?'ms':'en';try{localStorage.setItem('att-v3-lang',selected);}catch{}}
setLanguage(selected);
const exactEN=Object.entries(DICTIONARY).filter(([k])=>!(k in V5_BM)).sort((a,b)=>b[0].length-a[0].length);
function english(text){let a=String(text);if(DICTIONARY[a]&&!(a in V5_BM))return DICTIONARY[a];
 // Preserve whitespace and dynamic numbers, names or server-error suffixes.
 for(const [bm,en] of exactEN) if(a.includes(bm) && bm.length>=5) a=a.split(bm).join(en);
 a=a.replace(/\brekod\b/gi,'records').replace(/\bRekod\b/g,'Records').replace(/\borang\b/g,'employees').replace(/\btapak\b/g,'sites');
 return a;
}
function malay(text){let a=String(text);if(V5_BM[a])return V5_BM[a];
 // Retain common English terms such as Clock In, Clock Out and GPS in the BM UI.
 for(const [en,bm] of Object.entries(V5_BM).sort((a,b)=>b[0].length-a[0].length)) if(a.includes(en)&&en.length>=6) a=a.split(en).join(bm);
 return a;
}
export function tr(text){return selected==='en'?english(text):malay(text);}
export function translateTree(element){
 if(!element)return;
 const translateNode=(node)=>{
  if(node.nodeType===3){if(!node.parentElement||node.parentElement.closest('script,style'))return;const old=node.nodeValue;const next=tr(old);if(next!==old)node.nodeValue=next;}
  else if(node.nodeType===1){
   if(node.matches('input,textarea,button,option,select,label,div,p,summary,span,nav,section,aside,main,h1,h2,h3,small,strong,th,td,a')){
    for(const attr of ['placeholder','title','aria-label'])if(node.hasAttribute(attr)){const old=node.getAttribute(attr),next=tr(old);if(old!==next)node.setAttribute(attr,next);}
   }
   for(const child of [...node.childNodes])translateNode(child);
  }
 };
 translateNode(element);
}
