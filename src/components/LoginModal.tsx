import React, { useState } from 'react';
import { UserRole, UserSession } from '../types';
import { UserCheck, ShieldCheck, KeyRound, Eye, EyeOff, Lock, Sparkles, X, School } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: UserSession) => void;
  initialRole?: UserRole;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialRole = 'siswa'
}) => {
  const [role, setRole] = useState<UserRole>(initialRole);
  const [nama, setNama] = useState('');
  const [nis, setNis] = useState('1001');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!nama.trim() || !password) {
      setErrorMsg('Nama dan Password wajib diisi!');
      return;
    }

    setLoading(true);

    try {
      const endpoint = role === 'siswa' ? '/api/login/siswa' : '/api/login/guru';
      const bodyData = role === 'siswa' 
        ? { nama, nis, password }
        : { nama, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        onLoginSuccess(data.user);
        onClose();
      } else {
        setErrorMsg(data.message || 'Gagal login. Periksa kembali nama & password.');
      }
    } catch (err) {
      setErrorMsg('Terjadi kesalahan koneksi server.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoRole: UserRole) => {
    if (demoRole === 'siswa') {
      onLoginSuccess({
        role: 'siswa',
        nama: 'Ahmad Rizky',
        nis: 1001,
        kelas: '10-IPA-1'
      });
    } else {
      onLoginSuccess({
        role: 'guru',
        nama: 'Pak Bambang (Sarpras)',
        username: 'admin'
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-gradient-to-tr from-blue-700 to-indigo-600 rounded-xl shadow-md border border-blue-400/30">
              <School className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <span className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase tracking-wider">
                SMKN 3 JEMBER
              </span>
              <h2 className="font-bold text-lg leading-tight text-white">Login Akun Sekolah</h2>
              <p className="text-xs text-slate-300">Pengaduan Sarana & Prasarana</p>
            </div>
          </div>

          {/* Role Tabs */}
          <div className="grid grid-cols-2 gap-2 mt-4 bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setRole('siswa');
                setErrorMsg(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all ${
                role === 'siswa'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Akun Siswa</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRole('guru');
                setErrorMsg(null);
              }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition-all ${
                role === 'guru'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Akun Guru / Admin</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <Lock className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Field Nama */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {role === 'siswa' ? 'Nama Lengkap Siswa' : 'Nama Lengkap / Username Guru'}
            </label>
            <input
              type="text"
              required
              placeholder={role === 'siswa' ? 'Masukkan Nama Siswa (cth: Ahmad Rizky)' : 'Masukkan Username/Nama (cth: Pak Bambang)'}
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition-all"
            />
          </div>

          {/* Field NIS (For Siswa) */}
          {role === 'siswa' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NIS (Nomor Induk Siswa)
              </label>
              <input
                type="number"
                required
                placeholder="Masukkan NIS (cth: 1001)"
                value={nis}
                onChange={(e) => setNis(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition-all"
              />
            </div>
          )}

          {/* Field Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 px-4 rounded-xl text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
              role === 'siswa'
                ? 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800'
                : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>{loading ? 'Memproses...' : `Masuk Sebagai ${role === 'siswa' ? 'Siswa' : 'Guru'}`}</span>
          </button>

          {/* Quick Demo Login Option */}
          <div className="pt-3 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Login Cepat Demo (1-Klik)
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('siswa')}
                className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded-lg text-left transition-colors flex flex-col"
              >
                <span className="font-bold">Ahmad Rizky</span>
                <span className="text-[10px] text-indigo-500">Siswa (NIS: 1001)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('guru')}
                className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium rounded-lg text-left transition-colors flex flex-col"
              >
                <span className="font-bold">Pak Bambang</span>
                <span className="text-[10px] text-emerald-600">Guru / Tim Sarpras</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
