import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { defaultKategori, defaultSiswa, defaultInputAspirasi, defaultAspirasi } from './src/data/initialData';
import { Kategori, Siswa, InputAspirasi, Aspirasi, AspirasiFullItem, StatusAspirasi } from './src/types';

// In-Memory Database Store (Simulating Relational Database Tables from Diagram)
let dbKategori: Kategori[] = [...defaultKategori];
let dbSiswa: Siswa[] = [...defaultSiswa];
let dbInputAspirasi: InputAspirasi[] = [...defaultInputAspirasi];
let dbAspirasi: Aspirasi[] = [...defaultAspirasi];

let nextPelaporanId = 505;
let nextAspirasiId = 705;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper function to perform SQL JOIN simulation between InputAspirasi, Aspirasi, Siswa, and Kategori
  function getJoinedAspirasi(): AspirasiFullItem[] {
    return dbInputAspirasi.map((input) => {
      const asp = dbAspirasi.find((a) => a.id_pelaporan === input.id_pelaporan) || {
        id_aspirasi: 0,
        id_pelaporan: input.id_pelaporan,
        status: 'Menunggu' as StatusAspirasi,
        id_kategori: input.id_kategori,
        feedback: 'Pengaduan belum direspon',
        updated_at: input.created_at
      };
      const siswa = dbSiswa.find((s) => s.nis === input.nis) || { nis: input.nis, kelas: 'Siswa' };
      const kat = dbKategori.find((k) => k.id_kategori === input.id_kategori) || { id_kategori: input.id_kategori, ket_kategori: 'Umum' };

      return {
        id_aspirasi: asp.id_aspirasi,
        id_pelaporan: input.id_pelaporan,
        nis: input.nis,
        kelas: siswa.kelas,
        id_kategori: input.id_kategori,
        ket_kategori: kat.ket_kategori,
        lokasi: input.lokasi,
        ket: input.ket,
        tanggal: input.tanggal,
        status: asp.status,
        feedback: asp.feedback,
        created_at: input.created_at,
        updated_at: asp.updated_at
      };
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // --- API ROUTES ---

  // 1. Get List Kategori
  app.get('/api/kategori', (req, res) => {
    res.json(dbKategori);
  });

  // 2. Get List Siswa
  app.get('/api/siswa', (req, res) => {
    res.json(dbSiswa);
  });

  // 3. Register or get student NIS
  app.post('/api/siswa', (req, res) => {
    const { nis, kelas } = req.body;
    const parsedNis = Number(nis);
    if (!parsedNis || !kelas) {
      return res.status(400).json({ error: 'NIS dan Kelas wajib diisi' });
    }
    let existing = dbSiswa.find((s) => s.nis === parsedNis);
    if (!existing) {
      existing = { nis: parsedNis, kelas: String(kelas).trim() };
      dbSiswa.push(existing);
    } else {
      existing.kelas = String(kelas).trim(); // update class if changed
    }
    res.json(existing);
  });

  // 4. Get Aspirasi list with filter (per tanggal, per bulan, per siswa, per kategori, per status)
  app.get('/api/aspirasi', (req, res) => {
    let items = getJoinedAspirasi();
    const { nis, id_kategori, status, tanggal, bulan, search } = req.query;

    if (nis) {
      items = items.filter((item) => item.nis === Number(nis));
    }
    if (id_kategori && id_kategori !== 'all') {
      items = items.filter((item) => item.id_kategori === Number(id_kategori));
    }
    if (status && status !== 'all') {
      items = items.filter((item) => item.status === String(status));
    }
    if (tanggal) {
      items = items.filter((item) => item.tanggal === String(tanggal));
    }
    if (bulan) {
      items = items.filter((item) => item.tanggal.startsWith(String(bulan)));
    }
    if (search) {
      const q = String(search).toLowerCase();
      items = items.filter(
        (item) =>
          item.ket.toLowerCase().includes(q) ||
          item.lokasi.toLowerCase().includes(q) ||
          item.ket_kategori.toLowerCase().includes(q) ||
          String(item.nis).includes(q) ||
          item.kelas.toLowerCase().includes(q)
      );
    }

    res.json(items);
  });

  // 5. Submit Form Aspirasi Siswa (Creates InputAspirasi & Aspirasi records)
  app.post('/api/aspirasi', (req, res) => {
    const { nis, kelas, id_kategori, lokasi, ket } = req.body;

    const parsedNis = Number(nis);
    const parsedKategori = Number(id_kategori);

    if (!parsedNis || !kelas || !parsedKategori || !lokasi || !ket) {
      return res.status(400).json({ error: 'Semua field (NIS, Kelas, Kategori, Lokasi, Keterangan) wajib diisi!' });
    }

    // Auto-register student if not registered
    let student = dbSiswa.find((s) => s.nis === parsedNis);
    if (!student) {
      student = { nis: parsedNis, kelas: String(kelas).trim() };
      dbSiswa.push(student);
    } else {
      student.kelas = String(kelas).trim();
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];
    const fullDateTime = `${dateStr} ${timeStr}`;

    const newPelaporanId = nextPelaporanId++;
    const newAspirasiId = nextAspirasiId++;

    // Insert to InputAspirasi table
    const newInput: InputAspirasi = {
      id_pelaporan: newPelaporanId,
      nis: parsedNis,
      id_kategori: parsedKategori,
      lokasi: String(lokasi).trim(),
      ket: String(ket).trim(),
      tanggal: dateStr,
      created_at: fullDateTime
    };
    dbInputAspirasi.push(newInput);

    // Insert to Aspirasi table (Initial status = "Menunggu")
    const newAspirasi: Aspirasi = {
      id_aspirasi: newAspirasiId,
      id_pelaporan: newPelaporanId,
      status: 'Menunggu',
      id_kategori: parsedKategori,
      feedback: 'Pengaduan telah diterima oleh sistem dan sedang menunggu tinjauan dari pihak sekolah.',
      updated_at: fullDateTime
    };
    dbAspirasi.push(newAspirasi);

    // Return full item
    const createdItem = getJoinedAspirasi().find((item) => item.id_pelaporan === newPelaporanId);
    res.status(201).json(createdItem);
  });

  // 6. Update Aspirasi Status & Feedback (Halaman Umpan Balik Admin)
  app.put('/api/aspirasi/:id', (req, res) => {
    const idAspirasi = Number(req.params.id);
    const { status, feedback } = req.body;

    const aspIndex = dbAspirasi.findIndex((a) => a.id_aspirasi === idAspirasi);
    if (aspIndex === -1) {
      return res.status(404).json({ error: 'Aspirasi tidak ditemukan' });
    }

    const validStatuses: StatusAspirasi[] = ['Menunggu', 'Proses', 'Selesai'];
    if (status && validStatuses.includes(status)) {
      dbAspirasi[aspIndex].status = status;
    }

    if (feedback !== undefined) {
      dbAspirasi[aspIndex].feedback = String(feedback).trim();
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];
    dbAspirasi[aspIndex].updated_at = `${dateStr} ${timeStr}`;

    const updatedItem = getJoinedAspirasi().find((item) => item.id_aspirasi === idAspirasi);
    res.json(updatedItem);
  });

  // 7. Delete Aspirasi
  app.delete('/api/aspirasi/:id', (req, res) => {
    const idAspirasi = Number(req.params.id);
    const aspIndex = dbAspirasi.findIndex((a) => a.id_aspirasi === idAspirasi);
    if (aspIndex !== -1) {
      const pelaporanId = dbAspirasi[aspIndex].id_pelaporan;
      dbAspirasi.splice(aspIndex, 1);
      dbInputAspirasi = dbInputAspirasi.filter((i) => i.id_pelaporan !== pelaporanId);
      return res.json({ message: 'Aspirasi berhasil dihapus' });
    }
    res.status(404).json({ error: 'Aspirasi tidak ditemukan' });
  });

  // 8. Reset DB to seed
  app.post('/api/reset', (req, res) => {
    dbKategori = [...defaultKategori];
    dbSiswa = [...defaultSiswa];
    dbInputAspirasi = [...defaultInputAspirasi];
    dbAspirasi = [...defaultAspirasi];
    nextPelaporanId = 505;
    nextAspirasiId = 705;
    res.json({ message: 'Data berhasil di-reset ke kondisi awal' });
  });

  // 9. Login Endpoint for Siswa
  app.post('/api/login/siswa', (req, res) => {
    const { nama, nis, password } = req.body;
    if (!nama || !password) {
      return res.status(400).json({ success: false, message: 'Nama dan Password wajib diisi!' });
    }

    const parsedNis = Number(nis) || 1001;
    let student = dbSiswa.find((s) => s.nis === parsedNis);
    if (!student) {
      student = { nis: parsedNis, kelas: '10-IPA-1' };
      dbSiswa.push(student);
    }

    return res.json({
      success: true,
      user: {
        role: 'siswa',
        nama: String(nama).trim(),
        nis: student.nis,
        kelas: student.kelas
      }
    });
  });

  // 10. Login Endpoint for Guru / Admin
  app.post('/api/login/guru', (req, res) => {
    const { nama, password } = req.body;
    if (!nama || !password) {
      return res.status(400).json({ success: false, message: 'Nama/Username dan Password wajib diisi!' });
    }

    if (String(password).trim().length < 3) {
      return res.status(401).json({ success: false, message: 'Password salah!' });
    }

    return res.json({
      success: true,
      user: {
        role: 'guru',
        nama: String(nama).trim(),
        username: String(nama).trim().toLowerCase().replace(/\s+/g, '_')
      }
    });
  });


  // --- VITE / SERVING SETUP ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server Pengaduan Sarana Sekolah running on http://localhost:${PORT}`);
  });
}

startServer();
