import { useLocation } from 'wouter';
import { CalendarDays, Home, Plus, TrendingUp, HeartPulse } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const navigationItems = [
  { id: 'home', path: '/patient/app', icon: Home, labelFr: 'Accueil', labelEn: 'Home' },
  { id: 'calendar', path: '/patient/calendar', icon: CalendarDays, labelFr: 'Agenda', labelEn: 'Calendar' },
  { id: 'add', path: '/patient/add', icon: Plus, labelFr: 'Ajouter', labelEn: 'Add', primary: true },
  { id: 'symptoms', path: '/patient/add-symptom', icon: HeartPulse, labelFr: 'Santé', labelEn: 'Health' },
  { id: 'reports', path: '/patient/reports', icon: TrendingUp, labelFr: 'Suivi', labelEn: 'Reports' },
];

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();
  const { language } = useLanguage();

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t border-slate-100 bg-white/95 px-3 pb-[max(0.55rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_35px_rgba(15,23,42,0.07)] backdrop-blur-xl">
      <div className="flex items-end justify-around">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path || (item.path === '/patient/app' && (location === '/app' || location === '/'));
          if (item.primary) {
            return (
              <button key={item.id} onClick={() => setLocation(item.path)} className="-mt-7 flex w-16 flex-col items-center gap-1" aria-label={language === 'fr' ? item.labelFr : item.labelEn}>
                <span className="flex h-14 w-14 items-center justify-center rounded-[20px] border-4 border-white bg-emerald-600 text-white shadow-xl shadow-emerald-200 transition active:scale-95"><Icon className="h-6 w-6" /></span>
                <span className="text-[10px] font-extrabold text-slate-500">{language === 'fr' ? item.labelFr : item.labelEn}</span>
              </button>
            );
          }
          return (
            <button key={item.id} onClick={() => setLocation(item.path)} className={`flex min-w-[54px] flex-col items-center gap-1 rounded-xl px-2 py-1.5 transition ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} aria-label={language === 'fr' ? item.labelFr : item.labelEn}>
              <span className={`flex h-8 w-10 items-center justify-center rounded-xl ${isActive ? 'bg-emerald-50' : ''}`}><Icon className="h-5 w-5" /></span>
              <span className="text-[10px] font-extrabold">{language === 'fr' ? item.labelFr : item.labelEn}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
