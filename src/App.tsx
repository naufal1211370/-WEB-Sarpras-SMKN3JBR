import React, { useState, useEffect } from 'react';
import { Kategori, AspirasiFullItem, UserRole, UserSession } from './types';
import { Navbar } from './components/Navbar';
import { SiswaForm } from './components/SiswaForm';
import { SiswaHistory } from './components/SiswaHistory';
import { AdminFeedback } from './components/AdminFeedback';
import { LoginModal } from './components/LoginModal';
import { ShieldAlert, LogIn } from 'lucide-react';

export default function App() {
  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'form' | 'admin' | 'history'>('form');
  
  // Auth state
  const [userSession, setUserSession] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem('user_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalRole, setLoginModalRole] = useState<UserRole>('siswa');

  // Shared state variables
  const [categories, setCategories] = useState<Kategori[]>([]);
  const [studentNis, setStudentNis] = useState<number | null>(1001);

  // Sync userSession to localStorage & studentNis
  useEffect(() => {
    if (userSession) {
      localStorage.setItem('user_session', JSON.stringify(userSession));
      if (userSession.role === 'siswa' && userSession.nis) {
        setStudentNis(userSession.nis);
      }
    } else {
      localStorage.removeItem('user_session');
    }
  }, [userSession]);

  // Fetch initial category list from backend API
  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/kategori');
      if (res.ok) {
        const data: Kategori[] = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('Gagal mengambil data kategori:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenLogin = (role: UserRole = 'siswa') => {
    setLoginModalRole(role);
    setIsLoginModalOpen(true);
  };

  const handleLoginSuccess = (session: UserSession) => {
    setUserSession(session);
    if (session.role === 'guru') {
      setActiveTab('admin');
    } else {
      setActiveTab('form');
    }
  };

  const handleLogout = () => {
    setUserSession(null);
    setActiveTab('form');
  };

  // Handle tab switching with auth check for Admin & Form
  const handleTabChange = (tab: 'form' | 'admin' | 'history') => {
    if (tab === 'form' && userSession?.role === 'guru') {
      // Guru role should not fill student complaints
      setActiveTab('admin');
      return;
    }
    if (tab === 'admin' && (!userSession || userSession.role !== 'guru')) {
      handleOpenLogin('guru');
      return;
    }
    setActiveTab(tab);
  };

  // Handle successful form submission by student
  const handleFormSubmitSuccess = (newItem: AspirasiFullItem) => {
    setStudentNis(newItem.nis);
  };

  // Handle student history search redirection
  const handleGoToHistory = (nis: number) => {
    setStudentNis(nis);
    setActiveTab('history');
  };

  // Reset database back to seed condition
  const handleResetData = async () => {
    if (!confirm('Apakah Anda yakin ingin me-reset seluruh data ke sampel awal?')) return;
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (res.ok) {
        fetchCategories();
        alert('Data berhasil di-reset ke kondisi awal!');
        window.location.reload();
      }
    } catch (err) {
      alert('Gagal melakukan reset data.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Top Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        studentNis={studentNis}
        onResetData={handleResetData}
        userSession={userSession}
        onOpenLogin={handleOpenLogin}
        onLogout={handleLogout}
      />

      {/* Main Content Area based on Active Tab */}
      <main className="flex-1 pb-12 px-2 sm:px-4">
        {activeTab === 'form' && (
          userSession?.role === 'guru' ? (
            <div className="max-w-md mx-auto my-12 bg-white rounded-2xl p-6 border border-slate-200 text-center shadow-sm">
              <div className="p-3 bg-indigo-50 rounded-2xl w-12 h-12 flex items-center justify-center mx-auto mb-3 text-indigo-600">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Form Aspirasi Khusus Siswa</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Sebagai Guru / Tim Sarpras, Anda dapat memantau 'Histori & Status Siswa' atau mengelola 'Umpan Balik Admin'.
              </p>
              <button
                onClick={() => setActiveTab('admin')}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all"
              >
                Buka Umpan Balik Admin
              </button>
            </div>
          ) : (
            <SiswaForm
              categories={categories}
              onFormSubmitSuccess={handleFormSubmitSuccess}
              onGoToHistory={handleGoToHistory}
              userSession={userSession}
            />
          )
        )}

        {activeTab === 'history' && (
          <SiswaHistory
            initialNis={studentNis}
            onGoToForm={() => setActiveTab('form')}
            userSession={userSession}
          />
        )}

        {activeTab === 'admin' && (
          userSession && userSession.role === 'guru' ? (
            <AdminFeedback
              categories={categories}
              onDataChanged={fetchCategories}
            />
          ) : (
            <div className="max-w-md mx-auto my-12 bg-white rounded-2xl p-6 border border-slate-200 text-center shadow-sm">
              <div className="p-3 bg-amber-50 rounded-2xl w-12 h-12 flex items-center justify-center mx-auto mb-3 text-amber-600">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Akses Khusus Guru / Admin</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Silakan login sebagai Akun Guru / Tim Sarpras untuk mengakses halaman Umpan Balik Admin.
              </p>
              <button
                onClick={() => handleOpenLogin('guru')}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Login Akun Guru / Admin</span>
              </button>
            </div>
          )
        )}
      </main>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        initialRole={loginModalRole}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} SMKN 3 Jember — Sistem Pengaduan & Aspirasi Sarana Prasarana Sekolah.</p>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">Responsif & Terintegrasi ERD Database</span>
          </div>
        </div>
      </footer>

    </div>
  );
}


