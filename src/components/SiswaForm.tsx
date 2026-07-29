import React, { useState, useEffect } from 'react';
import { Kategori, AspirasiFullItem, UserSession } from '../types';
import { Send, CheckCircle2, AlertCircle, Info, MapPin, Hash, BookOpen, Layers, UserCheck } from 'lucide-react';

interface SiswaFormProps {
  categories: Kategori[];
  onFormSubmitSuccess: (item: AspirasiFullItem) => void;
  onGoToHistory: (nis: number) => void;
  userSession?: UserSession | null;
}

export const SiswaForm: React.FC<SiswaFormProps> = ({
  categories,
  onFormSubmitSuccess,
  onGoToHistory,
  userSession
}) => {
  // --- Form State Variables matching ERD fields ---
  const [nis, setNis] = useState<string>('');             // nis (int, 10)
  const [kelas, setKelas] = useState<string>('');         // kelas (varchar, 10)
  const [idKategori, setIdKategori] = useState<string>('1'); // id_kategori (int, 5)
  const [lokasi, setLokasi] = useState<string>('');       // lokasi (varchar, 50)
  const [ket, setKet] = useState<string>('');             // ket (varchar, 50 / text)

  // Pre-fill NIS & Kelas if user logged in as Siswa
  useEffect(() => {
    if (userSession && userSession.role === 'siswa') {
      if (userSession.nis) setNis(String(userSession.nis));
      if (userSession.kelas) setKelas(userSession.kelas);
    }
  }, [userSession]);


  // --- UI Feedback States ---
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastSubmittedItem, setLastSubmittedItem] = useState<AspirasiFullItem | null>(null);

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    const parsedNis = Number(nis);
    if (!parsedNis || isNaN(parsedNis)) {
      setErrorMsg('NIS harus berupa angka (contoh: 1001)');
      return;
    }
    if (!kelas.trim()) {
      setErrorMsg('Kelas tidak boleh kosong');
      return;
    }
    if (!lokasi.trim()) {
      setErrorMsg('Lokasi sarana tidak boleh kosong');
      return;
    }
    if (!ket.trim()) {
      setErrorMsg('Keterangan pengaduan tidak boleh kosong');
      return;
    }

    try {
      setSubmitting(true);
      // POST request to Express backend API /api/aspirasi
      const response = await fetch('/api/aspirasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nis: parsedNis,
          kelas: kelas.trim(),
          id_kategori: Number(idKategori),
          lokasi: lokasi.trim(),
          ket: ket.trim()
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Gagal mengirim aspirasi');
      }

      const createdData: AspirasiFullItem = await response.json();
      setLastSubmittedItem(createdData);
      onFormSubmitSuccess(createdData);

      // Reset form input except NIS & Kelas for convenience
      setLokasi('');
      setKet('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan sistem saat mengirim data.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-lg mb-6 border border-blue-800/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex items-start gap-4 relative z-10">
          <div className="p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl border border-blue-400/30 shrink-0 shadow-md">
            <Send className="w-7 h-7 text-yellow-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="inline-block px-2.5 py-0.5 text-xs font-extrabold bg-yellow-500/20 text-yellow-300 rounded-full border border-yellow-500/30 uppercase tracking-wider">
                SMKN 3 JEMBER
              </span>
              <span className="inline-block px-2.5 py-0.5 text-xs font-semibold bg-blue-500/20 text-blue-200 rounded-full border border-blue-500/30">
                Form Aspirasi Siswa
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Form Pengaduan Sarana Sekolah</h2>
            <p className="text-slate-300 text-sm mt-1">
              Sampaikan pengaduan atau keluhan mengenai fasilitas & sarana prasarana SMKN 3 Jember agar dapat segera ditindaklanjuti.
            </p>
          </div>
        </div>
      </div>

      {/* Success Banner if user submitted */}
      {lastSubmittedItem && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 mb-6 text-emerald-900 animate-fade-in shadow-sm">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-base text-emerald-800">Aspirasi Berhasil Dikirim!</h4>
              <p className="text-sm text-emerald-700 mt-1">
                Laporan <strong className="font-semibold">#{lastSubmittedItem.id_pelaporan}</strong> telah masuk ke sistem dengan status <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium text-xs">Menunggu</span>.
              </p>
              <div className="mt-3 flex items-center gap-3">
                <button
                  onClick={() => onGoToHistory(lastSubmittedItem.nis)}
                  className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs rounded-lg transition-colors shadow-sm"
                >
                  Lihat Status Progress Saya (NIS: {lastSubmittedItem.nis})
                </button>
                <button
                  onClick={() => setLastSubmittedItem(null)}
                  className="text-xs text-emerald-700 hover:underline"
                >
                  Tutup Notifikasi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 mb-6 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
        
        {/* Section 1: Identitas Siswa */}
        <div className="border-b border-slate-100 pb-5">
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Hash className="w-4 h-4 text-indigo-600" />
            1. Identitas Siswa
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Disimpan pada Tabel <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-700 font-mono">Siswa (nis, kelas)</code></p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {/* Input NIS */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                NIS (Nomor Induk Siswa) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                placeholder="Contoh: 1001"
                value={nis}
                onChange={(e) => setNis(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Data NIS bersifat unik (Tipe: int, 10)</span>
            </div>

            {/* Input Kelas */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Kelas <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: XII RPL 1 / X IPA 2"
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Rombongan belajar siswa (Tipe: varchar, 10)</span>
            </div>
          </div>
        </div>

        {/* Section 2: Detail Pengaduan Sarana */}
        <div>
          <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            2. Detail Pengaduan Sarana
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Disimpan pada Tabel <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-700 font-mono">Input Aspirasi (lokasi, id_kategori, ket)</code></p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {/* Select Kategori */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Kategori Sarana <span className="text-red-500">*</span>
              </label>
              <select
                value={idKategori}
                onChange={(e) => setIdKategori(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer"
              >
                {categories.map((kat) => (
                  <option key={kat.id_kategori} value={kat.id_kategori}>
                    [{kat.id_kategori}] {kat.ket_kategori}
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-slate-500 mt-1 block">Relasi ke Tabel Kategori (id_kategori)</span>
            </div>

            {/* Input Lokasi */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Lokasi Fasilitas <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Contoh: Gedung B Lantai 2 / Ruang Lab 1"
                  value={lokasi}
                  onChange={(e) => setLokasi(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">Lokasi tempat terjadinya masalah (varchar, 50)</span>
            </div>
          </div>

          {/* Input Keterangan / Isi Aspirasi */}
          <div className="mt-4">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Keterangan Pengaduan <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="Jelaskan secara rinci permasalahan sarana yang ditemukan (contoh: AC tidak dingin dan bocor air, kran toilet patah, dll)..."
              value={ket}
              onChange={(e) => setKet(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">Penjelasan rinci kerusakan/masukan (varchar, 50/text)</span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Info className="w-4 h-4 text-indigo-500" />
            <span>Setiap laporan akan langsung mendapat ID Pelaporan otomatis.</span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-md hover:shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {submitting ? (
              <span>Mengirim Data...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Kirim Aspirasi Sekarang</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};
