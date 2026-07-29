import React, { useState, useEffect } from 'react';
import { AspirasiFullItem, StatusAspirasi } from '../types';
import { Search, Clock, CheckCircle2, AlertCircle, RefreshCw, MessageSquare, MapPin, Calendar, Hash, ArrowRight } from 'lucide-react';

interface SiswaHistoryProps {
  initialNis?: number | null;
  onGoToForm: () => void;
  userSession?: UserSession | null;
}

export const SiswaHistory: React.FC<SiswaHistoryProps> = ({ initialNis, onGoToForm, userSession }) => {
  const isGuru = userSession?.role === 'guru';
  const [nisInput, setNisInput] = useState<string>(initialNis ? String(initialNis) : '1001');
  const [activeNis, setActiveNis] = useState<number | null>(initialNis || 1001);
  const [items, setItems] = useState<AspirasiFullItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch complaints history filtered by NIS
  const fetchHistory = async (nis: number) => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await fetch(`/api/aspirasi?nis=${nis}`);
      if (!res.ok) throw new Error('Gagal memuat histori');
      const data: AspirasiFullItem[] = await res.json();
      setItems(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memuat histori pengaduan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeNis) {
      fetchHistory(activeNis);
    }
  }, [activeNis]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(nisInput);
    if (!num || isNaN(num)) {
      setErrorMsg('Masukkan NIS angka yang valid');
      return;
    }
    setActiveNis(num);
  };

  // Helper badge color per status
  const getStatusBadge = (status: StatusAspirasi) => {
    switch (status) {
      case 'Selesai':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Selesai</span>;
      case 'Proses':
        return <span className="bg-blue-100 text-blue-800 border border-blue-300 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-blue-600" /> Sedang Diproses</span>;
      default:
        return <span className="bg-amber-100 text-amber-800 border border-amber-300 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Menunggu Tinjauan</span>;
    }
  };

  // Render visual progress step indicator
  const renderProgressBar = (status: StatusAspirasi) => {
    const isMenunggu = true;
    const isProses = status === 'Proses' || status === 'Selesai';
    const isSelesai = status === 'Selesai';

    return (
      <div className="mt-4 pt-3 border-t border-slate-100">
        <p className="text-xs font-medium text-slate-500 mb-2">Progres Perbaikan Penanganan:</p>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          {/* Step 1: Menunggu */}
          <div className={`p-2 rounded-lg border ${isMenunggu ? 'bg-amber-50 border-amber-300 text-amber-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
            <span className="block text-[10px] text-slate-500 uppercase">Tahap 1</span>
            1. Menunggu
          </div>

          {/* Step 2: Proses */}
          <div className={`p-2 rounded-lg border ${isProses ? 'bg-blue-50 border-blue-300 text-blue-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
            <span className="block text-[10px] text-slate-500 uppercase">Tahap 2</span>
            2. Dalam Proses
          </div>

          {/* Step 3: Selesai */}
          <div className={`p-2 rounded-lg border ${isSelesai ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
            <span className="block text-[10px] text-slate-500 uppercase">Tahap 3</span>
            3. Selesai
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6">
      
      {/* Search Header Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="bg-yellow-500/20 text-yellow-800 border border-yellow-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                SMKN 3 JEMBER
              </span>
              <h2 className="text-xl font-bold text-slate-900">Histori & Status Aspirasi Siswa</h2>
              {isGuru && (
                <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  Mode Guru / Admin
                </span>
              )}
            </div>
            <p className="text-slate-500 text-xs">
              Cari berdasarkan NIS untuk melihat status penyelesaian, umpan balik admin, dan progres perbaikan.
            </p>
          </div>

          {!isGuru && (
            <button
              onClick={onGoToForm}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl shadow-sm transition-all"
            >
              <span>Buat Aspirasi Baru</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Search NIS Form */}
        <form onSubmit={handleSearch} className="mt-4 flex gap-2">
          <div className="relative flex-1">
            <input
              type="number"
              placeholder="Masukkan NIS Anda (contoh: 1001)"
              value={nisInput}
              onChange={(e) => setNisInput(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-xl transition-all"
          >
            Cari NIS
          </button>
        </form>

        {/* Quick Sample NIS badges */}
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 overflow-x-auto">
          <span>Contoh NIS Cepat:</span>
          {[1001, 1002, 1003, 1004].map((n) => (
            <button
              key={n}
              onClick={() => {
                setNisInput(String(n));
                setActiveNis(n);
              }}
              className={`px-2 py-0.5 rounded border text-[11px] transition-all ${
                activeNis === n
                  ? 'bg-indigo-100 border-indigo-300 text-indigo-800 font-semibold'
                  : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
              }`}
            >
              NIS {n}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
          <p className="text-slate-600 text-sm">Memuat data histori aspirasi NIS {activeNis}...</p>
        </div>
      )}

      {/* Error message */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-sm mb-6 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Results List */}
      {!loading && !errorMsg && (
        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Daftar Laporan untuk NIS: <span className="text-indigo-600 font-bold">{activeNis}</span> ({items.length} Laporan)
            </p>
          </div>

          {items.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">Belum Ada Aspirasi Dikirim</h3>
              <p className="text-slate-500 text-xs max-w-sm mx-auto mt-1">
                Tidak ditemukan riwayat pengaduan untuk NIS {activeNis}. Silakan buat aspirasi baru jika ada sarana yang rusak.
              </p>
              <button
                onClick={onGoToForm}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Buat Aspirasi Sekarang
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id_pelaporan} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 hover:border-slate-300 transition-all">
                  
                  {/* Card Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-semibold">
                        ID: #{item.id_pelaporan}
                      </span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <Calendar className="w-3.5 h-3.5" />
                        {item.tanggal}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-indigo-600 font-medium">
                        Kategori: {item.ket_kategori}
                      </span>
                    </div>

                    <div>
                      {getStatusBadge(item.status)}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="mt-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium mb-1">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Lokasi: {item.lokasi}</span>
                      <span className="text-slate-300">•</span>
                      <span>Kelas: {item.kelas}</span>
                    </div>

                    <p className="text-slate-900 text-sm bg-slate-50 p-3 rounded-xl border border-slate-200/60 mt-2 font-normal leading-relaxed">
                      "{item.ket}"
                    </p>
                  </div>

                  {/* Progress Indicator */}
                  {renderProgressBar(item.status)}

                  {/* Umpan Balik Admin Section */}
                  <div className="mt-4 bg-indigo-50/70 border border-indigo-100 rounded-xl p-3.5">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs font-bold text-indigo-900">Umpan Balik / Tanggapan Pihak Sekolah:</span>
                    </div>
                    <p className="text-xs text-indigo-950 pl-6 leading-relaxed">
                      {item.feedback || 'Belum ada tanggapan spesifik dari admin/sarpras.'}
                    </p>
                    <div className="text-[10px] text-indigo-600/70 pl-6 mt-1">
                      Terakhir diperbarui: {item.updated_at}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
