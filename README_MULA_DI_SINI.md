# ATTENDANCE WEB V3 PREMIUM V5

**Sambungan terus daripada:** `ATTENDANCE_WEB_V3_PREMIUM_V4_NO_AUTO_ARCHIVE.zip` (bukan bina semula).

## Versi V5 — perubahan yang diminta

- **Paparan premium:** warna **navy / white / teal** kekal; kad, sidebar PC, bottom navigation telefon, log masuk dan susun atur diperhalus. Tiada framework berat.
- **BM / EN:** butang **EN | BM** tersedia pada login, Admin dan Staff, termasuk iPhone/Android/PC. English ialah bahasa asal. Pilihan disimpan pada peranti (localStorage) dan boleh ditukar tanpa refresh browser. Terjemahan UI/report diberi melalui `i18n.js`, bukan perkhidmatan pihak ketiga.
- **Manual delete bulan lama:** Admin → **Attendance** → **Delete old attendance records**. Pilih **month** dan **site** (atau **All Sites**), tekan **Delete Records**, kemudian **Cancel/Confirm Delete**. Tiada preview, senarai atau jumlah rekod sebelum padam. **Bulan semasa dan akan datang tidak boleh dipadam.**
- **Padam di Supabase sebenar:** fungsi baru `attendance-v3-delete-month` memadam rekod kehadiran **daripada jadual `public.att_v3_attendance`** dan selfie **daripada bucket private `att-v3-selfies`**. Akaun pekerja, tapak dan bulan lain kekal. Queue `att_v3_selfie_delete_queue` merekod foto yang belum berjaya dibersihkan supaya boleh dicuba lagi melalui butang **Retry unfinished selfie cleanup** dalam panel padam.
- **Buang perkara lama:** tiada menu **Storan & Arkib**; tiada job auto arkib/padam tiga bulan; tiada butang cleanup lama; tiada **Login Staff Lama** dalam UI; tiada butang **Delete Employee** secara kekal. Staf boleh dinyahaktifkan tanpa memadam sejarah.
- **Employee Management:** tindakan Edit / Password / Activate/Deactivate muncul selepas menekan **Manage**, bukan sepanjang masa.
- **Staff GPS:** koordinat tepat disembunyikan di bawah **GPS details**. Status radius, ketepatan, kamera hadapan, Clock In/Out kekal.
- **Excel:** kekal dua helaian dengan tajuk mengikut bahasa (**Summary / Daily Records** atau **Ringkasan / Rekod Harian**). Semua rekod bulan terpilih diambil berhalaman. Data pekerja dan login sedia ada dikekalkan.

## Perkara yang **tidak berubah**

- Admin: email + password. Staff: nombor telefon antarabangsa + password. **Tiada OTP/SMS**.
- Staff ID asal (mula 001); lokasi GPS dan selfie live; radius tapak 50–5,000 m (asal 200 m).
- Rekod dan selfie **disimpan tanpa had usia secara lalai**. Tiada auto archive/delete; pemadaman manual sahaja.
- Database Supabase **projek sedia ada** (shared Supabase). Jangan gunakan SQL V3 pemasangan kosong atau reset jadual.
- Perkhidmatan foto menggunakan private Storage dan signed URL; tidak menggunakan `service_role` di browser.
- `START_LOCAL.bat` untuk Windows. Untuk kamera/GPS pada iPhone, gunakan hosting **HTTPS**.

## Langkah pemasangan / update (WAJIB ikut urutan)

**0. Backup rekod & Storage dahulu.** Simpan ZIP V4 sebagai frontend rollback. Pemadaman manual tidak boleh diundur tanpa backup. **Tiada rekod dipadam ketika menjalankan migrasi SQL V5**; ia hanya menyediakan fungsi, bukan melaksanakannya.

**1. Matikan Cron lama (jika pernah memasang auto cleanup V4)**

- Supabase → **SQL Editor** → jalankan `DISABLE_LEGACY_AUTO_CLEANUP.sql`.
- Skrip ini hanya unschedule job `att-v3-retention-cleanup`. Ia tidak memadam rekod atau Cron projek lain. Jika job tidak wujud, ia tidak berbuat apa-apa.
- **JANGAN jalankan** `CRON_SETUP_V4_ONCE.sql` daripada pakej lama.

**2. Jalankan SQL shared dan V5 manual delete**

- Supabase projek yang sama → **SQL Editor** → jalankan `UPGRADE_V5_SHARED.sql` (tambahan / idempotent, termasuk `radius_m` dan semakan GPS server).
- Kemudian jalankan **`UPGRADE_V5_MANUAL_DELETE.sql`**. Ia mencipta queue selfie yang terasing dan RPC admin backend untuk pemadaman satu bulan. Fungsi pangkalan data menolak bulan semasa dan masa depan berdasarkan **waktu Malaysia**.
- Kedua-dua skrip memfokuskan hanya jadual `att_v3_*` dan bucket selfie yang sedia ada; tidak `DROP` jadual atau menyentuh projek lain.

**3. Deploy Supabase Edge Functions**

- **`attendance-v3-manage-staff`** → `supabase/functions/attendance-v3-manage-staff/index.ts` (versi V5, tindakan padam pekerja/legacy migration dinyahaktifkan).
- **`attendance-v3-delete-month`** → `supabase/functions/attendance-v3-delete-month/index.ts` (**baharu dan wajib** untuk manual delete). Kekalkan **JWT verification ON**. Secret `SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY` mesti tersedia **di server/Edge Function sahaja**, jangan masukkan ke `config.js`.
- **`attendance-v3-cleanup`** → `supabase/functions/attendance-v3-cleanup/index.ts` (opsyen jika endpoint lama pernah di-deploy). Versi ini mematikan API cleanup lama sepenuhnya dengan HTTP 410. Tidak lagi menawarkan arkib CSV.
- **Tiada Cron V5** dan tiada `ATT_V3_CLEANUP_SECRET` diperlukan untuk pemadaman baharu.

**4. Website untuk uji local (Windows)**

1. Extract ZIP ke folder baru.
2. Pastikan `config.js` mempunyai **project URL & public publishable/anon key sahaja**. Jangan letak service key.
3. Double-click `START_LOCAL.bat` (memerlukan Python 3). Browser akan buka `http://localhost:8000` atau port kosong 8000–8050.
4. Uji **Admin → Dashboard, Employees, Sites, Attendance, EN | BM**, dan **Staff → Today, History, Profile, GPS, Selfie**.
5. Sebelum uji padam bulan lama, gunakan **tapak/bulan ujian** dan backup. Selepas tekan Confirm Delete, periksa rekod dan selfie benar-benar hilang daripada Supabase.
6. Deploy frontend ke hosting **HTTPS** (contohnya Netlify) untuk uji GPS/kamera pada iPhone sebenar.

## Keselamatan & amaran

- Delete bulan lama mempunyai dua lapis pengesahan: UI dan server. Edge Function memeriksa sesi JWT & `att_v3_profiles(role='admin', active=true)`; RPC hanya boleh dipanggil dengan `service_role`. Staff tidak boleh memanggil fungsi ini.
- DB menghapuskan rekod dan mencatat path selfie ke queue **dalam transaksi yang sama**. Storage dipadam selepas itu; sekiranya Storage gagal, **rekod DB sudah terpadam** tetapi ada foto mungkin tertinggal dalam Storage sehingga Admin menekan Retry. Tiada pemadaman foto secara automatik di latar belakang.
- Foto yang sudah dipadam tidak boleh dipulihkan daripada CSV. Pengguna bertanggungjawab membuat backup sebelum pemadaman kekal.
- `att-v3-archives` lama, jika pernah wujud, **tidak dipadam**; ia cuma tidak dipaparkan dalam V5.
- **V5 belum dijalankan pada Supabase produksi atau peranti sebenar pengguna.** SQL migrasi dan deploy Edge Function diperlukan untuk tindakan delete berfungsi. Ujian browser menggunakan database/mock sahaja dan tidak membuktikan integrasi produksi.

## Ujian pembangunan dilakukan

- Sintaks `app.js`, `i18n.js`, `xlsx-export.js` disemak.
- Paparan mock Chromium Admin/Staff/Login pada 1366×900 dan 390×844; navigasi, suis EN/BM, pengurusan pekerja dan pengesahan manual delete diuji tanpa JavaScript page error.
- Contoh .xlsx disahkan sebagai ZIP OOXML dengan CRC dan XML sah.
- Ujian **belum** mengesahkan transaksi SQL/RPC, Storage deletion, Auth sebenar, GPS/kamera dan prestasi internet Supabase sebenar. Buat ujian staging/backup sebelum menggunakannya di tapak.
