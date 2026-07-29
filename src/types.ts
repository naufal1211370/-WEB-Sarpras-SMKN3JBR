/**
 * Definition of types matching the ERD schema diagram
 */

// Table 1: Admin
export interface Admin {
  username: string;
  password?: string;
}

// Table 2: Siswa
export interface Siswa {
  nis: number;       // NIS (int, 10)
  kelas: string;     // Kelas (varchar, 10)
}

// Table 3: Kategori
export interface Kategori {
  id_kategori: number;      // Id_kategori (int, 5)
  ket_kategori: string;     // ket_kategori (varchar, 30)
}

// Table 4: Input Aspirasi (Reporting data submitted by student)
export interface InputAspirasi {
  id_pelaporan: number;  // Id_pelaporan (int, 5)
  nis: number;           // nis (int, 10) - foreign key to Siswa
  id_kategori: number;   // id_kategori (int, 5) - foreign key to Kategori
  lokasi: string;        // lokasi (varchar, 50)
  ket: string;           // ket (varchar, 50) - description of complaint
  tanggal: string;       // YYYY-MM-DD format for date filtering
  created_at: string;
}

// Table 5: Aspirasi (Status & feedback response managed by Admin)
export type StatusAspirasi = 'Menunggu' | 'Proses' | 'Selesai';

export interface Aspirasi {
  id_aspirasi: number;    // id_aspirasi (int, 5)
  id_pelaporan: number;   // foreign key to InputAspirasi
  status: StatusAspirasi; // enum ("Menunggu"; "Proses"; "Selesai")
  id_kategori: number;    // id_kategori (int, 5)
  feedback: string;       // feedback text response from admin
  updated_at: string;
}

// Joined View Interface for full list display with student and category info
export interface AspirasiFullItem {
  id_aspirasi: number;
  id_pelaporan: number;
  nis: number;
  kelas: string;
  id_kategori: number;
  ket_kategori: string;
  lokasi: string;
  ket: string;
  tanggal: string;
  status: StatusAspirasi;
  feedback: string;
  created_at: string;
  updated_at: string;
}

// Filter params for admin list query
export interface FilterAspirasiParams {
  nis?: string;
  id_kategori?: string;
  status?: string;
  tanggal?: string;
  bulan?: string; // YYYY-MM format
  search?: string;
}

// User Authentication Roles & Session
export type UserRole = 'siswa' | 'guru';

export interface UserSession {
  role: UserRole;
  nama: string;
  nis?: number;
  kelas?: string;
  username?: string;
}

export interface LoginResponse {
  success: boolean;
  user: UserSession;
  message?: string;
}

