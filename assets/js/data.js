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
    { no: 1, kapanewon: "Pengasih", sumber: "Dapodik & Proyeksi BPS", apk: "79.2%", apm: "99.1% / 95.4%", ats: 145, putus: "0.08%", regrouping: "Optimal", statusColor: "emerald", usage: "Evaluasi Afirmasi Wilayah" },
    { no: 2, kapanewon: "Wates", sumber: "Dapodik & Dukcapil", apk: "84.5%", apm: "99.5% / 97.2%", ats: 98, putus: "0.05%", regrouping: "Optimal", statusColor: "emerald", usage: "Evaluasi Afirmasi Perkotaan" },
    { no: 3, kapanewon: "Sentolo", sumber: "Dapodik & Tim Regrouping", apk: "77.8%", apm: "98.4% / 93.8%", ats: 182, putus: "0.12%", regrouping: "Rekomendasi Merger 2 SD", statusColor: "amber", usage: "Dasar SK Penggabungan SD" },
    { no: 4, kapanewon: "Temon", sumber: "Verval PD & Dinsos", apk: "76.1%", apm: "97.9% / 92.5%", ats: 164, putus: "0.15%", regrouping: "Optimal", statusColor: "emerald", usage: "Intervensi Bantuan ATS" },
    { no: 5, kapanewon: "Galur", sumber: "Dapodik & Dukcapil", apk: "75.4%", apm: "98.1% / 93.1%", ats: 178, putus: "0.18%", regrouping: "Merger Process", statusColor: "blue", usage: "Pemantauan Regrouping" },
    { no: 6, kapanewon: "Lendah", sumber: "Dapodik & Tim Regrouping", apk: "74.2%", apm: "97.5% / 91.8%", ats: 210, putus: "0.22%", regrouping: "Rekomendasi Merger 1 SD", statusColor: "amber", usage: "Kajian Regrouping SD" },
    { no: 7, kapanewon: "Kokap", sumber: "Verval PD & Dinsos", apk: "68.5%", apm: "95.2% / 87.4%", ats: 342, putus: "0.45%", regrouping: "Prioritas Afirmasi", statusColor: "red", usage: "AFIRMASI BANTUAN MENDESAK" },
    { no: 8, kapanewon: "Girimulyo", sumber: "Verval PD & BPS", apk: "66.9%", apm: "94.8% / 86.9%", ats: 285, putus: "0.38%", regrouping: "Prioritas Afirmasi", statusColor: "red", usage: "AFIRMASI BANTUAN MENDESAK" },
    { no: 9, kapanewon: "Samigaluh", sumber: "Dapodik & Dinsos", apk: "65.4%", apm: "94.1% / 85.8%", ats: 312, putus: "0.41%", regrouping: "Prioritas Afirmasi", statusColor: "red", usage: "AFIRMASI BANTUAN MENDESAK" },
    { no: 10, kapanewon: "Kalibawang", sumber: "Dapodik & Dukcapil", apk: "71.3%", apm: "96.8% / 89.5%", ats: 174, putus: "0.20%", regrouping: "Optimal", statusColor: "emerald", usage: "Evaluasi Afirmasi Perbatasan" }
  ],

  // Submenu 2: Mutu & Capaian Pembelajaran Data
  mutu: [
    { npsn: "20402811", nama: "SMP Negeri 1 Wates", kapanewon: "Wates", sumber: "Rapor Pendidikan Kemendikdasmen", literasi: "86.4 (Tinggi)", numerasi: "82.1 (Tinggi)", karakter: "85.2", akreditasi: "A (BAN-S/M)", pembinaan: "Pendampingan Reguler", statusColor: "emerald" },
    { npsn: "20402815", nama: "SD Negeri Pengasih 1", kapanewon: "Pengasih", sumber: "Rapor Pendidikan Kemendikdasmen", literasi: "82.0 (Tinggi)", numerasi: "78.4 (Sedang)", karakter: "81.0", akreditasi: "A (BAN-S/M)", pembinaan: "Pendampingan Reguler", statusColor: "emerald" },
    { npsn: "20402820", nama: "SMP Negeri 2 Kokap", kapanewon: "Kokap", sumber: "Rapor Pendidikan & ANBK", literasi: "64.2 (Rendah)", numerasi: "58.1 (Rendah)", karakter: "72.4", akreditasi: "B (BAN-S/M)", pembinaan: "PRIORITAS UTAMA PEMBINAAN", statusColor: "red" },
    { npsn: "20402825", nama: "SD Negeri Samigaluh 3", kapanewon: "Samigaluh", sumber: "Rapor Pendidikan & ANBK", literasi: "62.8 (Rendah)", numerasi: "55.4 (Rendah)", karakter: "70.1", akreditasi: "B (BAN-S/M)", pembinaan: "PRIORITAS UTAMA PEMBINAAN", statusColor: "red" },
    { npsn: "20402830", nama: "SMP Negeri 1 Sentolo", kapanewon: "Sentolo", sumber: "Rapor Pendidikan Kemendikdasmen", literasi: "81.5 (Tinggi)", numerasi: "75.2 (Sedang)", karakter: "82.6", akreditasi: "A (BAN-S/M)", pembinaan: "Pendampingan Reguler", statusColor: "emerald" },
    { npsn: "20402835", nama: "SD Negeri Temon 2", kapanewon: "Temon", sumber: "Rapor Pendidikan & BAN-S/M", literasi: "75.4 (Sedang)", numerasi: "71.0 (Sedang)", karakter: "78.2", akreditasi: "A (BAN-S/M)", pembinaan: "Pendampingan Intensif", statusColor: "amber" },
    { npsn: "20402840", nama: "SMP Negeri 3 Girimulyo", kapanewon: "Girimulyo", sumber: "Rapor Pendidikan & ANBK", literasi: "66.1 (Rendah)", numerasi: "60.2 (Rendah)", karakter: "73.5", akreditasi: "B (BAN-S/M)", pembinaan: "PRIORITAS UTAMA PEMBINAAN", statusColor: "red" }
  ],

  // Submenu 3: Sarana & Prasarana Data
  sarpras: [
    { npsn: "20402825", nama: "SD Negeri Samigaluh 2", kapanewon: "Samigaluh", sumber: "Dapodik Sarpras", baik: "3 Ruang", rusakRingan: "2 Ruang", rusakBerat: "4 Ruang", spm: "Belum Layak", perpus: "Ada", lab: "Belum Ada", dak: "PRIORITAS 1 (MENDESAK)", statusColor: "red" },
    { npsn: "20402820", nama: "SMP Negeri 2 Kokap", kapanewon: "Kokap", sumber: "Dapodik Sarpras", baik: "5 Ruang", rusakRingan: "3 Ruang", rusakBerat: "3 Ruang", spm: "Layak", perpus: "Ada", lab: "Ada", dak: "PRIORITAS 1 (MENDESAK)", statusColor: "red" },
    { npsn: "20402840", nama: "SD Negeri Girimulyo 1", kapanewon: "Girimulyo", sumber: "Dapodik Sarpras", baik: "4 Ruang", rusakRingan: "4 Ruang", rusakBerat: "2 Ruang", spm: "Belum Layak", perpus: "Ada", lab: "Belum Ada", dak: "PRIORITAS 2 (REHAB)", statusColor: "amber" },
    { npsn: "20402811", nama: "SMP Negeri 1 Wates", kapanewon: "Wates", sumber: "Dapodik Sarpras", baik: "18 Ruang", rusakRingan: "2 Ruang", rusakBerat: "0 Ruang", spm: "Sangat Layak", perpus: "Ada (Digital)", lab: "Ada (IPA/Komputer)", dak: "Normal (Perawatan)", statusColor: "emerald" },
    { npsn: "20402815", nama: "SD Negeri Pengasih 1", kapanewon: "Pengasih", sumber: "Dapodik Sarpras", baik: "12 Ruang", rusakRingan: "1 Ruang", rusakBerat: "0 Ruang", spm: "Layak", perpus: "Ada", lab: "Ada", dak: "Normal (Perawatan)", statusColor: "emerald" }
  ],

  // Submenu 4: GTK & MCDM Data
  gtk: [
    { nip: "19720412 199803 1 004", nama: "Drs. Bambang Sutrisno", mapel: "Matematika", sumber: "BKPSDM & Info GTK", asal: "SMPN 3 Samigaluh (56 Thn)", jarakAsal: "28.5 km", tujuan: "SMP Negeri 1 Wates (Defisit 1)", jarakBaru: "3.2 km", mcdmScore: "96.4%", argumentasi: "Mendekatkan guru senior ke domisili tempat tinggal", statusColor: "emerald" },
    { nip: "19850819 201001 2 012", nama: "Siti Rahmawati, S.Pd", mapel: "Bahasa Inggris", sumber: "BKPSDM & Dapodik", asal: "SDN 2 Kokap (41 Thn)", jarakAsal: "19.2 km", tujuan: "SD Negeri Pengasih 1 (Defisit 1)", jarakBaru: "4.1 km", mcdmScore: "92.1%", argumentasi: "Optimalisasi jarak mengajar & kompetensi", statusColor: "emerald" },
    { nip: "19910204 201402 1 008", nama: "Ahmad Fauzi, M.Pd", mapel: "IPA / Fisika", sumber: "BKPSDM & Info GTK", asal: "SMPN 2 Girimulyo (35 Thn)", jarakAsal: "22.0 km", tujuan: "SMP Negeri 1 Sentolo (Defisit 2)", jarakBaru: "5.5 km", mcdmScore: "89.5%", argumentasi: "Pengisian kekosongan jam mengajar wajib", statusColor: "emerald" },
    { nip: "19701105 199512 2 001", nama: "Endang Sri W, S.Pd", mapel: "Guru Kelas SD", sumber: "BKPSDM & Dapodik", asal: "SDN 3 Kalibawang (57 Thn)", jarakAsal: "24.1 km", tujuan: "SD Negeri Temon 1 (Defisit 1)", jarakBaru: "2.8 km", mcdmScore: "97.8%", argumentasi: "Afirmai Guru Senior Usia Lanjut", statusColor: "emerald" }
  ],

  // Submenu 5: Kelembagaan & Prestasi Data
  kelembagaan: [
    { npsn: "69821045", nama: "PAUD KB Melati Sentolo", kapanewon: "Sentolo", sumber: "Bidang PAUD-Dikmas Internal", jenjang: "PAUD/PNF", izin: "Izin Aktif (Valid)", akreditasi: "B", prestasi: "Juara 1 Lomba Alat Peraga Edukatif", inovasi: "Sosialisasi Digital", statusColor: "emerald" },
    { npsn: "20402811", nama: "SMP Negeri 1 Wates", kapanewon: "Wates", sumber: "Dapodik & Data Dikpora", jenjang: "SMP", izin: "Negeri (Aktif)", akreditasi: "A", prestasi: "Juara 1 O2SN Atletik & Gold FLS2N", inovasi: "PILOT PROJECT CODING & AI", statusColor: "purple" },
    { npsn: "20402815", nama: "SD Negeri Pengasih 1", kapanewon: "Pengasih", sumber: "Dapodik & Data Dikpora", jenjang: "SD", izin: "Negeri (Aktif)", akreditasi: "A", prestasi: "Juara 2 OSN Matematika DIY", inovasi: "PILOT PROJECT CODING & AI", statusColor: "purple" },
    { npsn: "69912088", nama: "PKBM Handayani Temon", kapanewon: "Temon", sumber: "Bidang PAUD-Dikmas Internal", jenjang: "PAUD/PNF", izin: "Izin Aktif (Valid)", akreditasi: "B", prestasi: "Penyelenggara Kesetaraan Terbaik", inovasi: "Pelatihan Komputer Dasar", statusColor: "emerald" }
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
