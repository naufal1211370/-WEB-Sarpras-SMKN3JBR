import React from 'react';
import { School, MessageSquarePlus, History, RefreshCw, ShieldCheck, LogIn, LogOut, UserCheck } from 'lucide-react';
import { UserRole, UserSession } from '../types';

interface NavbarProps {
  activeTab: 'form' | 'admin' | 'history';
  setActiveTab: (tab: 'form' | 'admin' | 'history') => void;
  studentNis?: number | null;
  onResetData: () => void;
  userSession: UserSession | null;
  onOpenLogin: (role?: UserRole) => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  studentNis,
  onResetData,
  userSession,
  onOpenLogin,
  onLogout
}) => {
  const isGuru = userSession?.role === 'guru';

  return (
    <header className="bg-slate-900 text-white shadow-md border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Application Title */}
          <div 
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none" 
            onClick={() => setActiveTab(isGuru ? 'admin' : 'form')}
          >
            <div className="p-2 bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-500 rounded-xl shadow-md shrink-0 border border-blue-400/30">
              <School className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 text-[10px] font-extrabold px-1.5 py-0.2 rounded tracking-wider uppercase">
                  SMKN 3 JEMBER
                </span>
              </div>
              <h1 className="font-bold text-sm sm:text-base md:text-lg leading-tight tracking-tight text-white">
                Pengaduan Sarpras Sekolah
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-300 line-clamp-1">
                {isGuru ? 'Portal Aspirasi & Umpan Balik Tim Sarpras' : 'Aspirasi & Laporan Sarana Prasarana'}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            
            {/* Form Aspirasi (Khusus Siswa / Tamu) */}
            {!isGuru && (
              <button
                onClick={() => setActiveTab('form')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'form'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <MessageSquarePlus className="w-4 h-4" />
                <span>Form Aspirasi Siswa</span>
              </button>
            )}

            {/* Histori & Status (Bisa Diakses Siswa & Guru) */}
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'history'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Histori & Status Siswa</span>
              {studentNis && !isGuru && (
                <span className="bg-indigo-950 text-indigo-200 text-xs px-2 py-0.5 rounded-full border border-indigo-700">
                  NIS: {studentNis}
                </span>
              )}
            </button>

            {/* Umpan Balik Admin (Khusus Guru / Admin) */}
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'admin'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Umpan Balik (Admin)</span>
            </button>
          </nav>

          {/* User Session & Actions */}
          <div className="flex items-center gap-2">
            
            {userSession ? (
              <div className="flex items-center gap-2 bg-slate-800 p-1 pl-2.5 rounded-xl border border-slate-700">
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-white line-clamp-1 max-w-[120px] sm:max-w-[160px]">
                    {userSession.nama}
                  </span>
                  <span className="text-[10px] text-slate-400 capitalize">
                    {userSession.role === 'siswa' ? `Siswa (${userSession.kelas || 'NIS ' + userSession.nis})` : 'Guru / Admin'}
                  </span>
                </div>

                <button
                  onClick={onLogout}
                  title="Keluar dari akun"
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onOpenLogin('siswa')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </button>
            )}

            <button
              onClick={onResetData}
              title="Reset data ke kondisi awal"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex border-t border-slate-800/80 py-2 overflow-x-auto space-x-2 text-xs no-scrollbar">
          {!isGuru && (
            <button
              onClick={() => setActiveTab('form')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
                activeTab === 'form' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-800 text-slate-300'
              }`}
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              <span>Form Aspirasi</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
              activeTab === 'history' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-800 text-slate-300'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Histori Siswa</span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
              activeTab === 'admin' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-800 text-slate-300'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Feedback</span>
          </button>
        </div>
      </div>
    </header>
  );
};


