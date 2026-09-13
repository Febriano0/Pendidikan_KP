/**
 * DATABASES DUMMY DIGUNAKAN UNTUK DASHBOARD EXECUTIVE DISDIKPORA KULON PROGO
 * Sumber Data Rujukan: Dapodik, Dukcapil, BPS, Platform Rapor Pendidikan, BAN-S/M, BKPSDM, & Tim Dikpora.
 */

const DB = {
  kapanewon: [
    { id: "all", name: "Semua Kapanewon (12)", zone: "All" },
    { id: "wates", name: "Wates (Ibu Kota)", zone: "Tengah" },
    { id: "pengasih", name: "Pengasih", zone: "Tengah" },
    { id: "sentolo", name: "Sentolo", zone: "Tengah" },
    { id: "temon", name: "Temon (YIA)", zone: "Selatan" },
    { id: "kokap", name: "Kokap (Sermo)", zone: "Utara" },
    { id: "girimulyo", name: "Girimulyo (Menoreh)", zone: "Utara" },
    { id: "samigaluh", name: "Samigaluh (Menoreh)", zone: "Utara" },
    { id: "kalibawang", name: "Kalibawang", zone: "Utara" },
    { id: "lendah", name: "Lendah", zone: "Selatan" },
    { id: "galur", name: "Galur", zone: "Selatan" },
    { id: "panjatan", name: "Panjatan", zone: "Selatan" },
    { id: "nanggulan", name: "Nanggulan", zone: "Tengah" }
  ],

  // Submenu 1: Akses & Pemerataan Data
  akses: [
    { no: 1, kapanewon: "Pengasih", kalurahan: "Pengasih & Sendangsari", sumber: "Dapodik & Proyeksi BPS", apk: "79.2%", apm: "99.1% / 95.4%", ats: 145, putus: "0.08%", regrouping: "Optimal", statusColor: "emerald", usage: "Evaluasi Afirmasi Wilayah" },
    { no: 2, kapanewon: "Wates", kalurahan: "Wates & Bendungan", sumber: "Dapodik & Dukcapil", apk: "84.5%", apm: "99.5% / 97.2%", ats: 98, putus: "0.05%", regrouping: "Optimal", statusColor: "emerald", usage: "Evaluasi Afirmasi Perkotaan" },
    { no: 3, kapanewon: "Sentolo", kalurahan: "Sentolo & Sukoreno", sumber: "Dapodik & Tim Regrouping", apk: "77.8%", apm: "98.4% / 93.8%", ats: 182, putus: "0.12%", regrouping: "Rekomendasi Merger 2 SD", statusColor: "amber", usage: "Dasar SK Penggabungan SD" },
    { no: 4, kapanewon: "Temon", kalurahan: "Glagah & Palihan (YIA)", sumber: "Verval PD & Dinsos", apk: "76.1%", apm: "97.9% / 92.5%", ats: 164, putus: "0.15%", regrouping: "Optimal", statusColor: "emerald", usage: "Intervensi Bantuan ATS" },
    { no: 5, kapanewon: "Galur", kalurahan: "Brosot & Kranggan", sumber: "Dapodik & Dukcapil", apk: "75.4%", apm: "98.1% / 93.1%", ats: 178, putus: "0.18%", regrouping: "Merger Process", statusColor: "blue", usage: "Pemantauan Regrouping" },
    { no: 6, kapanewon: "Lendah", kalurahan: "Jatirejo & Sidorejo", sumber: "Dapodik & Tim Regrouping", apk: "74.2%", apm: "97.5% / 91.8%", ats: 210, putus: "0.22%", regrouping: "Rekomendasi Merger 1 SD", statusColor: "amber", usage: "Kajian Regrouping SD" },
    { no: 7, kapanewon: "Kokap", kalurahan: "Hargorejo & Hargowilis", sumber: "Verval PD & Dinsos", apk: "68.5%", apm: "95.2% / 87.4%", ats: 342, putus: "0.45%", regrouping: "Prioritas Afirmasi", statusColor: "red", usage: "AFIRMASI BANTUAN MENDESAK" },
    { no: 8, kapanewon: "Girimulyo", kalurahan: "Jatimulyo & Purwosari", sumber: "Verval PD & BPS", apk: "66.9%", apm: "94.8% / 86.9%", ats: 285, putus: "0.38%", regrouping: "Prioritas Afirmasi", statusColor: "red", usage: "AFIRMASI BANTUAN MENDESAK" },
    { no: 9, kapanewon: "Samigaluh", kalurahan: "Gerbosari & Banjarsari", sumber: "Dapodik & Dinsos", apk: "65.4%", apm: "94.1% / 85.8%", ats: 312, putus: "0.41%", regrouping: "Prioritas Afirmasi", statusColor: "red", usage: "AFIRMASI BANTUAN MENDESAK" },
    { no: 10, kapanewon: "Kalibawang", kalurahan: "Banjarharjo & Banjaroyo", sumber: "Dapodik & Dukcapil", apk: "71.3%", apm: "96.8% / 89.5%", ats: 174, putus: "0.20%", regrouping: "Optimal", statusColor: "emerald", usage: "Evaluasi Afirmasi Perbatasan" },
    { no: 11, kapanewon: "Panjatan", kalurahan: "Gotakan & Garongan", sumber: "Dapodik & Dukcapil", apk: "77.5%", apm: "98.3% / 93.4%", ats: 168, putus: "0.14%", regrouping: "Optimal", statusColor: "emerald", usage: "Evaluasi Afirmasi Pesisir" },
    { no: 12, kapanewon: "Nanggulan", kalurahan: "Wijimulyo & Jatimulyo", sumber: "Dapodik & BPS", apk: "78.1%", apm: "98.6% / 94.2%", ats: 152, putus: "0.11%", regrouping: "Optimal", statusColor: "emerald", usage: "Evaluasi Afirmasi Pertanian" }
  ],

  // Submenu 2: Mutu & Capaian Pembelajaran Data
  mutu: [
    { npsn: "20402811", nama: "SMP Negeri 1 Wates", kapanewon: "Wates", kalurahan: "Bendungan", sumber: "Rapor Pendidikan Kemendikdasmen", literasi: "86.4 (Tinggi)", numerasi: "82.1 (Tinggi)", karakter: "85.2", akreditasi: "A (BAN-S/M)", pembinaan: "Pendampingan Reguler", statusColor: "emerald" },
    { npsn: "20402815", nama: "SD Negeri Pengasih 1", kapanewon: "Pengasih", kalurahan: "Pengasih", sumber: "Rapor Pendidikan Kemendikdasmen", literasi: "82.0 (Tinggi)", numerasi: "78.4 (Sedang)", karakter: "81.0", akreditasi: "A (BAN-S/M)", pembinaan: "Pendampingan Reguler", statusColor: "emerald" },
    { npsn: "20402820", nama: "SMP Negeri 2 Kokap", kapanewon: "Kokap", kalurahan: "Hargorejo", sumber: "Rapor Pendidikan & ANBK", literasi: "64.2 (Rendah)", numerasi: "58.1 (Rendah)", karakter: "72.4", akreditasi: "B (BAN-S/M)", pembinaan: "PRIORITAS UTAMA PEMBINAAN", statusColor: "red" },
    { npsn: "20402825", nama: "SD Negeri Samigaluh 3", kapanewon: "Samigaluh", kalurahan: "Gerbosari", sumber: "Rapor Pendidikan & ANBK", literasi: "62.8 (Rendah)", numerasi: "55.4 (Rendah)", karakter: "70.1", akreditasi: "B (BAN-S/M)", pembinaan: "PRIORITAS UTAMA PEMBINAAN", statusColor: "red" },
    { npsn: "20402830", nama: "SMP Negeri 1 Sentolo", kapanewon: "Sentolo", kalurahan: "Salamrejo", sumber: "Rapor Pendidikan Kemendikdasmen", literasi: "81.5 (Tinggi)", numerasi: "75.2 (Sedang)", karakter: "82.6", akreditasi: "A (BAN-S/M)", pembinaan: "Pendampingan Reguler", statusColor: "emerald" },
    { npsn: "20402835", nama: "SD Negeri Temon 2", kapanewon: "Temon", kalurahan: "Temon Kulon", sumber: "Rapor Pendidikan & BAN-S/M", literasi: "75.4 (Sedang)", numerasi: "71.0 (Sedang)", karakter: "78.2", akreditasi: "A (BAN-S/M)", pembinaan: "Pendampingan Intensif", statusColor: "amber" },
    { npsn: "20402840", nama: "SMP Negeri 3 Girimulyo", kapanewon: "Girimulyo", kalurahan: "Jatimulyo", sumber: "Rapor Pendidikan & ANBK", literasi: "66.1 (Rendah)", numerasi: "60.2 (Rendah)", karakter: "73.5", akreditasi: "B (BAN-S/M)", pembinaan: "PRIORITAS UTAMA PEMBINAAN", statusColor: "red" },
    { npsn: "20402845", nama: "SMP Negeri 1 Panjatan", kapanewon: "Panjatan", kalurahan: "Gotakan", sumber: "Rapor Pendidikan Kemendikdasmen", literasi: "78.4 (Sedang)", numerasi: "74.2 (Sedang)", karakter: "80.1", akreditasi: "A (BAN-S/M)", pembinaan: "Pendampingan Reguler", statusColor: "emerald" },
    { npsn: "20402850", nama: "SMP Negeri 1 Nanggulan", kapanewon: "Nanggulan", kalurahan: "Wijimulyo", sumber: "Rapor Pendidikan Kemendikdasmen", literasi: "79.5 (Sedang)", numerasi: "76.1 (Sedang)", karakter: "81.2", akreditasi: "A (BAN-S/M)", pembinaan: "Pendampingan Reguler", statusColor: "emerald" },
    { npsn: "20402855", nama: "SMP Negeri 1 Kalibawang", kapanewon: "Kalibawang", kalurahan: "Banjarharjo", sumber: "Rapor Pendidikan Kemendikdasmen", literasi: "77.8 (Sedang)", numerasi: "73.5 (Sedang)", karakter: "79.4", akreditasi: "A (BAN-S/M)", pembinaan: "Pendampingan Intensif", statusColor: "amber" },
    { npsn: "20402860", nama: "SMP Negeri 1 Lendah", kapanewon: "Lendah", kalurahan: "Jatirejo", sumber: "Rapor Pendidikan Kemendikdasmen", literasi: "76.9 (Sedang)", numerasi: "72.8 (Sedang)", karakter: "78.9", akreditasi: "A (BAN-S/M)", pembinaan: "Pendampingan Intensif", statusColor: "amber" },
    { npsn: "20402865", nama: "SMP Negeri 1 Galur", kapanewon: "Galur", kalurahan: "Brosot", sumber: "Rapor Pendidikan Kemendikdasmen", literasi: "78.0 (Sedang)", numerasi: "74.0 (Sedang)", karakter: "80.5", akreditasi: "A (BAN-S/M)", pembinaan: "Pendampingan Reguler", statusColor: "emerald" }
  ],

  // Submenu 3: Sarana & Prasarana Data
  sarpras: [
    { npsn: "20402825", nama: "SD Negeri Samigaluh 2", kapanewon: "Samigaluh", kalurahan: "Gerbosari", sumber: "Dapodik Sarpras", baik: "3 Ruang", rusakRingan: "2 Ruang", rusakBerat: "4 Ruang", spm: "Belum Layak", perpus: "Ada", lab: "Belum Ada", dak: "PRIORITAS 1 (MENDESAK)", statusColor: "red" },
    { npsn: "20402820", nama: "SMP Negeri 2 Kokap", kapanewon: "Kokap", kalurahan: "Hargorejo", sumber: "Dapodik Sarpras", baik: "5 Ruang", rusakRingan: "3 Ruang", rusakBerat: "3 Ruang", spm: "Layak", perpus: "Ada", lab: "Ada", dak: "PRIORITAS 1 (MENDESAK)", statusColor: "red" },
    { npsn: "20402840", nama: "SD Negeri Girimulyo 1", kapanewon: "Girimulyo", kalurahan: "Giripurwo", sumber: "Dapodik Sarpras", baik: "4 Ruang", rusakRingan: "4 Ruang", rusakBerat: "2 Ruang", spm: "Belum Layak", perpus: "Ada", lab: "Belum Ada", dak: "PRIORITAS 2 (REHAB)", statusColor: "amber" },
    { npsn: "20402811", nama: "SMP Negeri 1 Wates", kapanewon: "Wates", kalurahan: "Bendungan", sumber: "Dapodik Sarpras", baik: "18 Ruang", rusakRingan: "2 Ruang", rusakBerat: "0 Ruang", spm: "Sangat Layak", perpus: "Ada (Digital)", lab: "Ada (IPA/Komputer)", dak: "Normal (Perawatan)", statusColor: "emerald" },
    { npsn: "20402815", nama: "SD Negeri Pengasih 1", kapanewon: "Pengasih", kalurahan: "Pengasih", sumber: "Dapodik Sarpras", baik: "12 Ruang", rusakRingan: "1 Ruang", rusakBerat: "0 Ruang", spm: "Layak", perpus: "Ada", lab: "Ada", dak: "Normal (Perawatan)", statusColor: "emerald" },
    { npsn: "20402835", nama: "SMP Negeri 1 Temon", kapanewon: "Temon", kalurahan: "Temon Kulon", sumber: "Dapodik Sarpras", baik: "14 Ruang", rusakRingan: "2 Ruang", rusakBerat: "0 Ruang", spm: "Sangat Layak", perpus: "Ada", lab: "Ada", dak: "Normal (Perawatan)", statusColor: "emerald" },
    { npsn: "20402830", nama: "SD Negeri Sentolo 1", kapanewon: "Sentolo", kalurahan: "Sentolo", sumber: "Dapodik Sarpras", baik: "10 Ruang", rusakRingan: "2 Ruang", rusakBerat: "1 Ruang", spm: "Layak", perpus: "Ada", lab: "Ada", dak: "PRIORITAS 2 (REHAB)", statusColor: "amber" },
    { npsn: "20402855", nama: "SD Negeri Kalibawang 2", kapanewon: "Kalibawang", kalurahan: "Banjarharjo", sumber: "Dapodik Sarpras", baik: "6 Ruang", rusakRingan: "3 Ruang", rusakBerat: "2 Ruang", spm: "Belum Layak", perpus: "Ada", lab: "Belum Ada", dak: "PRIORITAS 1 (MENDESAK)", statusColor: "red" },
    { npsn: "20402860", nama: "SD Negeri Lendah 1", kapanewon: "Lendah", kalurahan: "Jatirejo", sumber: "Dapodik Sarpras", baik: "8 Ruang", rusakRingan: "3 Ruang", rusakBerat: "1 Ruang", spm: "Layak", perpus: "Ada", lab: "Ada", dak: "PRIORITAS 2 (REHAB)", statusColor: "amber" },
    { npsn: "20402865", nama: "SD Negeri Galur 2", kapanewon: "Galur", kalurahan: "Kranggan", sumber: "Dapodik Sarpras", baik: "7 Ruang", rusakRingan: "2 Ruang", rusakBerat: "1 Ruang", spm: "Layak", perpus: "Ada", lab: "Ada", dak: "PRIORITAS 2 (REHAB)", statusColor: "amber" },
    { npsn: "20402845", nama: "SD Negeri Panjatan 1", kapanewon: "Panjatan", kalurahan: "Gotakan", sumber: "Dapodik Sarpras", baik: "9 Ruang", rusakRingan: "2 Ruang", rusakBerat: "0 Ruang", spm: "Layak", perpus: "Ada", lab: "Ada", dak: "Normal (Perawatan)", statusColor: "emerald" },
    { npsn: "20402850", nama: "SD Negeri Nanggulan 1", kapanewon: "Nanggulan", kalurahan: "Wijimulyo", sumber: "Dapodik Sarpras", baik: "11 Ruang", rusakRingan: "1 Ruang", rusakBerat: "0 Ruang", spm: "Layak", perpus: "Ada", lab: "Ada", dak: "Normal (Perawatan)", statusColor: "emerald" }
  ],

  // Submenu 4: GTK & MCDM Data
  gtk: [
    { nip: "19720412 199803 1 004", nama: "Drs. Bambang Sutrisno", mapel: "Matematika", kalurahan: "Gerbosari → Bendungan", sumber: "BKPSDM & Info GTK", asal: "SMPN 3 Samigaluh (56 Thn)", jarakAsal: "28.5 km", tujuan: "SMP Negeri 1 Wates (Defisit 1)", jarakBaru: "3.2 km", mcdmScore: "96.4%", argumentasi: "Mendekatkan guru senior ke domisili tempat tinggal", statusColor: "emerald" },
    { nip: "19850819 201001 2 012", nama: "Siti Rahmawati, S.Pd", mapel: "Bahasa Inggris", kalurahan: "Hargorejo → Pengasih", sumber: "BKPSDM & Dapodik", asal: "SDN 2 Kokap (41 Thn)", jarakAsal: "19.2 km", tujuan: "SD Negeri Pengasih 1 (Defisit 1)", jarakBaru: "4.1 km", mcdmScore: "92.1%", argumentasi: "Optimalisasi jarak mengajar & kompetensi", statusColor: "emerald" },
    { nip: "19910204 201402 1 008", nama: "Ahmad Fauzi, M.Pd", mapel: "IPA / Fisika", kalurahan: "Jatimulyo → Salamrejo", sumber: "BKPSDM & Info GTK", asal: "SMPN 2 Girimulyo (35 Thn)", jarakAsal: "22.0 km", tujuan: "SMP Negeri 1 Sentolo (Defisit 2)", jarakBaru: "5.5 km", mcdmScore: "89.5%", argumentasi: "Pengisian kekosongan jam mengajar wajib", statusColor: "emerald" },
    { nip: "19701105 199512 2 001", nama: "Endang Sri W, S.Pd", mapel: "Guru Kelas SD", kalurahan: "Banjarharjo → Temon Kulon", sumber: "BKPSDM & Dapodik", asal: "SDN 3 Kalibawang (57 Thn)", jarakAsal: "24.1 km", tujuan: "SD Negeri Temon 1 (Defisit 1)", jarakBaru: "2.8 km", mcdmScore: "97.8%", argumentasi: "Afirmasi Guru Senior Usia Lanjut", statusColor: "emerald" },
    { nip: "19780315 200501 1 005", nama: "Wahyu Hidayat, S.Pd", mapel: "PJOK", kalurahan: "Brosot → Gotakan", sumber: "BKPSDM & Dapodik", asal: "SDN 1 Galur (46 Thn)", jarakAsal: "16.4 km", tujuan: "SD Negeri Panjatan 1 (Defisit 1)", jarakBaru: "3.5 km", mcdmScore: "94.2%", argumentasi: "Pemerataan Guru PJOK Wilayah Selatan", statusColor: "emerald" },
    { nip: "19830520 200902 2 007", nama: "Nurul Hidayati, M.Pd", mapel: "Bahasa Indonesia", kalurahan: "Wijimulyo → Banjarharjo", sumber: "BKPSDM & Info GTK", asal: "SMPN 1 Nanggulan (42 Thn)", jarakAsal: "14.8 km", tujuan: "SMP Negeri 1 Kalibawang (Defisit 1)", jarakBaru: "4.0 km", mcdmScore: "91.8%", argumentasi: "Efisiensi Jarak Guru Domisili Nanggulan", statusColor: "emerald" },
    { nip: "19871110 201101 1 009", nama: "Eko Prasetyo, S.Pd", mapel: "Bimbingan Konseling", kalurahan: "Jatirejo → Sentolo", sumber: "BKPSDM & Dapodik", asal: "SMPN 2 Lendah (38 Thn)", jarakAsal: "18.0 km", tujuan: "SMP Negeri 1 Sentolo (Defisit 1)", jarakBaru: "4.8 km", mcdmScore: "90.6%", argumentasi: "Pemenuhan Layanan BK Sekolah Rujukan", statusColor: "emerald" }
  ],

  // Submenu 5: Kelembagaan & Prestasi Data
  kelembagaan: [
    { npsn: "69821045", nama: "PAUD KB Melati Sentolo", kapanewon: "Sentolo", kalurahan: "Sentolo", sumber: "Bidang PAUD-Dikmas Internal", jenjang: "PAUD/PNF", izin: "Izin Aktif (Valid)", akreditasi: "B", prestasi: "Juara 1 Lomba Alat Peraga Edukatif", inovasi: "Sosialisasi Digital", statusColor: "emerald" },
    { npsn: "20402811", nama: "SMP Negeri 1 Wates", kapanewon: "Wates", kalurahan: "Bendungan", sumber: "Dapodik & Data Dikpora", jenjang: "SMP", izin: "Negeri (Aktif)", akreditasi: "A", prestasi: "Juara 1 O2SN Atletik & Gold FLS2N", inovasi: "PILOT PROJECT CODING & AI", statusColor: "purple" },
    { npsn: "20402815", nama: "SD Negeri Pengasih 1", kapanewon: "Pengasih", kalurahan: "Pengasih", sumber: "Dapodik & Data Dikpora", jenjang: "SD", izin: "Negeri (Aktif)", akreditasi: "A", prestasi: "Juara 2 OSN Matematika DIY", inovasi: "PILOT PROJECT CODING & AI", statusColor: "purple" },
    { npsn: "69912088", nama: "PKBM Handayani Temon", kapanewon: "Temon", kalurahan: "Palihan", sumber: "Bidang PAUD-Dikmas Internal", jenjang: "PAUD/PNF", izin: "Izin Aktif (Valid)", akreditasi: "B", prestasi: "Penyelenggara Kesetaraan Terbaik", inovasi: "Pelatihan Komputer Dasar", statusColor: "emerald" },
    { npsn: "69954012", nama: "PAUD KB Tunas Bangsa Kokap", kapanewon: "Kokap", kalurahan: "Hargowilis", sumber: "Bidang PAUD-Dikmas Internal", jenjang: "PAUD/PNF", izin: "Izin Aktif (Valid)", akreditasi: "B", prestasi: "Apresiasi Parenting Komunitas Desa", inovasi: "Bina Keluarga Balita", statusColor: "emerald" },
    { npsn: "20402840", nama: "SMP Negeri 3 Girimulyo", kapanewon: "Girimulyo", kalurahan: "Jatimulyo", sumber: "Dapodik & Data Dikpora", jenjang: "SMP", izin: "Negeri (Aktif)", akreditasi: "B", prestasi: "Juara Harapan Konservasi Lingkungan", inovasi: "Sekolah Adiwiyata Menoreh", statusColor: "emerald" },
    { npsn: "20402825", nama: "SD Negeri Samigaluh 2", kapanewon: "Samigaluh", kalurahan: "Gerbosari", sumber: "Dapodik & Data Dikpora", jenjang: "SD", izin: "Negeri (Aktif)", akreditasi: "B", prestasi: "Juara 3 Seni Budaya Tradisional DIY", inovasi: "Kelas Seni Kesenian Lokal", statusColor: "emerald" },
    { npsn: "69834120", nama: "PKBM Mandiri Kalibawang", kapanewon: "Kalibawang", kalurahan: "Banjarharjo", sumber: "Bidang PAUD-Dikmas Internal", jenjang: "PAUD/PNF", izin: "Izin Aktif (Valid)", akreditasi: "B", prestasi: "Sentra Vokasi Kopi Menoreh", inovasi: "Pelatihan Wirausaha Terapan", statusColor: "purple" },
    { npsn: "20402860", nama: "SMP Negeri 1 Lendah", kapanewon: "Lendah", kalurahan: "Jatirejo", sumber: "Dapodik & Data Dikpora", jenjang: "SMP", izin: "Negeri (Aktif)", akreditasi: "A", prestasi: "Juara 2 Pramuka Garuda Kulon Progo", inovasi: "Sekolah Ramah Anak", statusColor: "emerald" },
    { npsn: "20402865", nama: "SD Negeri Galur 1", kapanewon: "Galur", kalurahan: "Brosot", sumber: "Dapodik & Data Dikpora", jenjang: "SD", izin: "Negeri (Aktif)", akreditasi: "A", prestasi: "Finalis Literasi Sekolah DIY", inovasi: "Pojok Baca Digital", statusColor: "emerald" },
    { npsn: "20402845", nama: "SMP Negeri 1 Panjatan", kapanewon: "Panjatan", kalurahan: "Gotakan", sumber: "Dapodik & Data Dikpora", jenjang: "SMP", izin: "Negeri (Aktif)", akreditasi: "A", prestasi: "Juara 1 Lomba Drumband Pelajar", inovasi: "Pendidikan Karakter Maritim", statusColor: "emerald" },
    { npsn: "20402850", nama: "SMP Negeri 1 Nanggulan", kapanewon: "Nanggulan", kalurahan: "Wijimulyo", sumber: "Dapodik & Data Dikpora", jenjang: "SMP", izin: "Negeri (Aktif)", akreditasi: "A", prestasi: "Juara 1 Debat Bahasa Kulon Progo", inovasi: "Laboratorium Riset Terbuka", statusColor: "purple" }
  ]
};


// SECURITY IMMUTABILITY & INTEGRITY FREEZE
(function freezeDatabase() {
  Object.keys(DB).forEach(key => {
    if (Array.isArray(DB[key])) {
      DB[key].forEach(item => Object.freeze(item));
      Object.freeze(DB[key]);
    }
  });
  Object.freeze(DB);
})();

// CHECKSUM SHA-256 SIMULATED SIGNATURE FOR DATA INTEGRITY
const DB_INTEGRITY = {
  version: "2026.09.13-V1.0",
  checksum: "sha256-e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  lastVerified: "2026-09-13T01:21:00Z",
  dataSourcesVerified: ["Dapodik", "Dukcapil", "BPS", "Rapor Pendidikan", "BAN-S/M", "BKPSDM"]
};
Object.freeze(DB_INTEGRITY);
