import React, { useState, useEffect } from 'react';
import { AspirasiFullItem, Kategori, StatusAspirasi } from '../types';
import { 
  ShieldCheck, Filter, Calendar, Users, Layers, CheckCircle2, Clock, 
  AlertCircle, MessageSquare, Edit3, Trash2, Search, RefreshCw, X, Save,
  BarChart2
} from 'lucide-react';

interface AdminFeedbackProps {
  categories: Kategori[];
  onDataChanged: () => void;
}

export const AdminFeedback: React.FC<AdminFeedbackProps> = ({ categories, onDataChanged }) => {
  const [items, setItems] = useState<AspirasiFullItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --- Filter States ---
  const [filterKategori, setFilterKategori] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterTanggal, setFilterTanggal] = useState<string>('');
  const [filterBulan, setFilterBulan] = useState<string>('');
  const [filterSearch, setFilterSearch] = useState<string>('');

  // --- Modal Edit State ---
  const [editingItem, setEditingItem] = useState<AspirasiFullItem | null>(null);
  const [editStatus, setEditStatus] = useState<StatusAspirasi>('Menunggu');
  const [editFeedback, setEditFeedback] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  // Fetch filtered aspirasi items
  const fetchAdminAspirasi = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const params = new URLSearchParams();
      if (filterKategori !== 'all') params.append('id_kategori', filterKategori);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterTanggal) params.append('tanggal', filterTanggal);
      if (filterBulan) params.append('bulan', filterBulan);
      if (filterSearch) params.append('search', filterSearch);

      const res = await fetch(`/api/aspirasi?${params.toString()}`);
      if (!res.ok) throw new Error('Gagal mengambil data aspirasi');
      const data: AspirasiFullItem[] = await res.json();
      setItems(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memuat data aspirasi admin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminAspirasi();
  }, [filterKategori, filterStatus, filterTanggal, filterBulan, filterSearch]);

  // Handle open edit feedback modal
  const openEditModal = (item: AspirasiFullItem) => {
    setEditingItem(item);
    setEditStatus(item.status);
    setEditFeedback(item.feedback || '');
  };

  // Handle saving status & feedback change
  const handleSaveFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      setSaving(true);
      const res = await fetch(`/api/aspirasi/${editingItem.id_aspirasi}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editStatus,
          feedback: editFeedback
        })
      });

      if (!res.ok) throw new Error('Gagal memperbarui status dan umpan balik');

      setEditingItem(null);
      fetchAdminAspirasi();
      onDataChanged();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan perubahan');
    } finally {
      setSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async (idAspirasi: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus laporan aspirasi ini?')) return;
    try {
      const res = await fetch(`/api/aspirasi/${idAspirasi}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus');
      fetchAdminAspirasi();
      onDataChanged();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus data');
    }
  };

  // Reset filter controls
  const resetFilters = () => {
    setFilterKategori('all');
    setFilterStatus('all');
    setFilterTanggal('');
    setFilterBulan('');
    setFilterSearch('');
  };

  // Summary counts
  const totalCount = items.length;
  const menungguCount = items.filter((i) => i.status === 'Menunggu').length;
  const prosesCount = items.filter((i) => i.status === 'Proses').length;
  const selesaiCount = items.filter((i) => i.status === 'Selesai').length;

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white p-6 rounded-2xl shadow-lg mb-6 border border-emerald-800/50">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-600/30 rounded-xl border border-emerald-400/30">
              <ShieldCheck className="w-8 h-8 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="inline-block px-2.5 py-0.5 text-xs font-extrabold bg-yellow-500/20 text-yellow-300 rounded-full border border-yellow-500/30 uppercase tracking-wider">
                  SMKN 3 JEMBER
                </span>
                <span className="inline-block px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                  Panel Umpan Balik Tim Sarpras
                </span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Manajemen Aspirasi & Status Perbaikan</h2>
              <p className="text-slate-300 text-xs sm:text-sm mt-1">
                Kelola daftar aspirasi, ubah status penyelesaian (Menunggu, Proses, Selesai), dan berikan umpan balik langsung kepada siswa SMKN 3 Jember.
              </p>
            </div>
          </div>

          <button
            onClick={fetchAdminAspirasi}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-medium transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Segarkan Data</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Laporan</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{totalCount}</p>
          </div>
          <div className="p-2.5 bg-slate-100 rounded-lg text-slate-700">
            <BarChart2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-sm flex items-center justify-between bg-gradient-to-br from-white to-amber-50/50">
          <div>
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Menunggu</span>
            <p className="text-2xl font-black text-amber-700 mt-1">{menungguCount}</p>
          </div>
          <div className="p-2.5 bg-amber-100 rounded-lg text-amber-800">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm flex items-center justify-between bg-gradient-to-br from-white to-blue-50/50">
          <div>
            <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider">Sedang Diproses</span>
            <p className="text-2xl font-black text-blue-700 mt-1">{prosesCount}</p>
          </div>
          <div className="p-2.5 bg-blue-100 rounded-lg text-blue-800">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm flex items-center justify-between bg-gradient-to-br from-white to-emerald-50/50">
          <div>
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Selesai</span>
            <p className="text-2xl font-black text-emerald-700 mt-1">{selesaiCount}</p>
          </div>
          <div className="p-2.5 bg-emerald-100 rounded-lg text-emerald-800">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar (Kriteria Gambar 2) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-5 mb-6">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Filter Aspirasi Keseluruhan</h3>
          </div>
          <button
            onClick={resetFilters}
            className="text-xs text-indigo-600 hover:underline font-medium"
          >
            Reset Semua Filter
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          
          {/* Filter per Kategori */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
              <Layers className="w-3 h-3 text-slate-400" /> Per Kategori
            </label>
            <select
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((k) => (
                <option key={k.id_kategori} value={k.id_kategori}>
                  {k.ket_kategori}
                </option>
              ))}
            </select>
          </div>

          {/* Filter per Status */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" /> Status Perbaikan
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="all">Semua Status</option>
              <option value="Menunggu">Menunggu</option>
              <option value="Proses">Dalam Proses</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>

          {/* Filter per Tanggal */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" /> Per Tanggal
            </label>
            <input
              type="date"
              value={filterTanggal}
              onChange={(e) => {
                setFilterTanggal(e.target.value);
                if (e.target.value) setFilterBulan(''); // clear month filter if exact date set
              }}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Filter per Bulan */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" /> Per Bulan
            </label>
            <input
              type="month"
              value={filterBulan}
              onChange={(e) => {
                setFilterBulan(e.target.value);
                if (e.target.value) setFilterTanggal(''); // clear exact date filter if month set
              }}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Search per Siswa / Kata Kunci */}
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-[11px] font-semibold text-slate-500 mb-1 flex items-center gap-1">
              <Users className="w-3 h-3 text-slate-400" /> Per Siswa / NIS / Lokasi
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="NIS, Kelas, Lokasi..."
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                className="w-full pl-7 pr-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
            </div>
          </div>

        </div>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-sm mb-6 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Table of Aspirasi */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-2" />
            <p className="text-slate-500 text-sm">Memuat data aspirasi...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 px-4">
            <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-700 font-bold text-sm">Tidak Ada Data Aspirasi</p>
            <p className="text-slate-500 text-xs mt-1">Tidak ditemukan laporan sesuai filter yang Anda pilih.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4 w-28">ID / Tanggal</th>
                  <th className="py-3 px-4 w-36">Siswa (NIS & Kelas)</th>
                  <th className="py-3 px-4 w-44">Kategori & Lokasi</th>
                  <th className="py-3 px-4 min-w-[200px]">Isi Pengaduan</th>
                  <th className="py-3 px-4 min-w-[220px]">Status & Umpan Balik</th>
                  <th className="py-3 px-4 text-center w-36">Aksi / Respon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.map((item) => (
                  <tr key={item.id_pelaporan} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* ID & Date */}
                    <td className="py-3.5 px-4 align-top whitespace-nowrap">
                      <div className="font-mono font-bold text-slate-900">#{item.id_pelaporan}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">{item.tanggal}</div>
                    </td>

                    {/* Siswa */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-bold text-slate-900">NIS: {item.nis}</div>
                      <span className="inline-block bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] mt-1 font-medium">
                        Kelas: {item.kelas}
                      </span>
                    </td>

                    {/* Kategori & Lokasi */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-semibold text-emerald-800">{item.ket_kategori}</div>
                      <div className="text-slate-600 text-[11px] mt-0.5 flex items-center gap-1">
                        <span>{item.lokasi}</span>
                      </div>
                    </td>

                    {/* Description */}
                    <td className="py-3.5 px-4 align-top max-w-xs">
                      <p className="text-slate-800 line-clamp-3 leading-relaxed">
                        "{item.ket}"
                      </p>
                    </td>

                    {/* Status & Feedback */}
                    <td className="py-3.5 px-4 align-top max-w-xs">
                      <div className="mb-1.5">
                        {item.status === 'Selesai' && (
                          <span className="bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full text-[11px] inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Selesai
                          </span>
                        )}
                        {item.status === 'Proses' && (
                          <span className="bg-blue-100 text-blue-800 font-semibold px-2.5 py-0.5 rounded-full text-[11px] inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Dalam Proses
                          </span>
                        )}
                        {item.status === 'Menunggu' && (
                          <span className="bg-amber-100 text-amber-800 font-semibold px-2.5 py-0.5 rounded-full text-[11px] inline-flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Menunggu
                          </span>
                        )}
                      </div>
                      
                      <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-200">
                        <strong className="text-slate-800 block mb-0.5">Umpan Balik:</strong>
                        {item.feedback || 'Belum diberikan umpan balik.'}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 align-top text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEditModal(item)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-xs shadow-sm transition-all"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Ubah Feedback</span>
                        </button>

                        <button
                          onClick={() => handleDelete(item.id_aspirasi)}
                          title="Hapus Aspirasi"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Modal / Dialog Edit Status & Umpan Balik */}
      {editingItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Beri Umpan Balik & Status</h3>
                  <p className="text-xs text-slate-500">Laporan #{editingItem.id_pelaporan} - NIS: {editingItem.nis}</p>
                </div>
              </div>

              <button
                onClick={() => setEditingItem(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFeedback} className="space-y-4 mt-4">
              
              {/* Summary of Complaint */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <span className="font-semibold text-slate-700">Pengaduan Siswa ({editingItem.ket_kategori} - {editingItem.lokasi}):</span>
                <p className="text-slate-800 italic mt-1">"{editingItem.ket}"</p>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Ubah Status Penyelesaian <span className="text-red-500">*</span>
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as StatusAspirasi)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Menunggu">Menunggu (Pending)</option>
                  <option value="Proses">Proses (Dalam Pengerjaan/Perbaikan)</option>
                  <option value="Selesai">Selesai (Perbaikan Tuntas)</option>
                </select>
                <span className="text-[11px] text-slate-500 mt-1 block">Tipe: enum ("Menunggu"; "Proses"; "Selesai")</span>
              </div>

              {/* Feedback Textarea */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Umpan Balik / Tanggapan Pihak Sekolah <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tuliskan umpan balik atau perkembangan pengerjaan sarana untuk diketahui siswa..."
                  value={editFeedback}
                  onChange={(e) => setEditFeedback(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">Tanggapan tertulis yang dapat dibaca siswa di halaman histori</span>
              </div>

              {/* Form Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-medium rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-lg shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Simpan...' : 'Simpan Umpan Balik'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
