import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Bell, Languages, Pill, Settings } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import BottomNavigation from './BottomNavigation';
import NotificationModal from './NotificationModal';

interface LayoutProps { children: React.ReactNode; }

export default function Layout({ children }: LayoutProps) {
  const { language, toggleLanguage, t } = useLanguage();
  const [, setLocation] = useLocation();
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      const timer = setTimeout(() => setShowNotificationModal(true), 2200);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="relative mx-auto min-h-screen w-full max-w-md overflow-x-hidden bg-[#f8faf9] shadow-2xl shadow-slate-300/30">
        <header className="sticky top-0 z-40 border-b border-slate-100/80 bg-white/90 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-100">
                <Pill className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-[17px] font-black tracking-[-0.02em] text-slate-900">{t('app.title')}</h1>
                <p className="text-[11px] font-semibold text-slate-400">{language === 'fr' ? 'Espace patient · Assistant santé' : 'Patient space · Health assistant'}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={toggleLanguage} className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100" aria-label={`Switch to ${language === 'fr' ? 'English' : 'Français'}`}>
                <Languages className="h-5 w-5" />
              </button>
              <button onClick={() => setShowNotificationModal(true)} className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100" aria-label="Notifications">
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-emerald-500" />
              </button>
              <button onClick={() => setLocation('/roles')} className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100" aria-label="Changer d’espace">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        <div className="min-h-[calc(100vh-138px)]">{children}</div>
        <BottomNavigation />
        <NotificationModal isOpen={showNotificationModal} onClose={() => setShowNotificationModal(false)} />
      </div>
    </div>
  );
}
