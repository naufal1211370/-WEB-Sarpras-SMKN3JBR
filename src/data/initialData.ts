import { Kategori, Siswa, InputAspirasi, Aspirasi } from '../types';

// Default categories according to school facilities
export const defaultKategori: Kategori[] = [
  { id_kategori: 1, ket_kategori: 'Ruang Kelas' },
  { id_kategori: 2, ket_kategori: 'Laboratorium' },
  { id_kategori: 3, ket_kategori: 'Toilet & Sanitasi' },
  { id_kategori: 4, ket_kategori: 'Lapangan & Olahraga' },
  { id_kategori: 5, ket_kategori: 'Perpustakaan' },
  { id_kategori: 6, ket_kategori: 'Kantin & Sarpras Lain' },
];

// Initial registered students
export const defaultSiswa: Siswa[] = [
  { nis: 1001, kelas: 'XII RPL 1' },
  { nis: 1002, kelas: 'XII TKJ 2' },
  { nis: 1003, kelas: 'XI OTKP 1' },
  { nis: 1004, kelas: 'X AKL 3' },
];

// Initial reporting inputs
export const defaultInputAspirasi: InputAspirasi[] = [
  {
    id_pelaporan: 501,
    nis: 1001,
    id_kategori: 1,
    lokasi: 'Ruang Kelas XII RPL 1',
    ket: 'AC di ruang kelas XII RPL 1 tidak dingin dan berbunyi bising',
    tanggal: '2026-07-20',
    created_at: '2026-07-20 08:30:00'
  },
  {
    id_pelaporan: 502,
    nis: 1002,
    id_kategori: 2,
    lokasi: 'Lab Komputer 2',
    ket: 'Beberapa monitor PC nomor 12 dan 14 mati total',
    tanggal: '2026-07-22',
    created_at: '2026-07-22 10:15:00'
  },
  {
    id_pelaporan: 503,
    nis: 1001,
    id_kategori: 3,
    lokasi: 'Toilet Lantai 2 Gedung Utama',
    ket: 'Kran air toilet siswa bocor dan pintu kuncinya rusak',
    tanggal: '2026-07-25',
    created_at: '2026-07-25 13:45:00'
  },
  {
    id_pelaporan: 504,
    nis: 1003,
    id_kategori: 4,
    lokasi: 'Lapangan Basket Outdoor',
    ket: 'Jaring ring basket terlepas dan papan pantul retak',
    tanggal: '2026-07-27',
    created_at: '2026-07-27 09:00:00'
  }
];

// Initial aspirasi statuses & admin feedback
export const defaultAspirasi: Aspirasi[] = [
  {
    id_aspirasi: 701,
    id_pelaporan: 501,
    status: 'Selesai',
    id_kategori: 1,
    feedback: 'AC sudah diperbaiki oleh teknisi pada tanggal 21 Juli 2026 dan berfungsi normal.',
    updated_at: '2026-07-21 14:00:00'
  },
  {
    id_aspirasi: 702,
    id_pelaporan: 502,
    status: 'Proses',
    id_kategori: 2,
    feedback: 'Sedang dalam pengajuan penggantian monitor unit baru ke bagian logistik.',
    updated_at: '2026-07-23 11:20:00'
  },
  {
    id_aspirasi: 703,
    id_pelaporan: 503,
    status: 'Menunggu',
    id_kategori: 3,
    feedback: 'Pengaduan telah diterima, sedang dijadwalkan inspeksi oleh tim kebersihan/sarpras.',
    updated_at: '2026-07-25 13:45:00'
  },
  {
    id_aspirasi: 704,
    id_pelaporan: 504,
    status: 'Menunggu',
    id_kategori: 4,
    feedback: 'Laporan baru masuk, menunggu evaluasi dari tim sarpras.',
    updated_at: '2026-07-27 09:00:00'
  }
];
