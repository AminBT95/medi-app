import { useLocation } from 'wouter';
import { Home, Plus, History, Calendar, Heart, UserCheck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '@/components/ui/button';

const navigationItems = [
  {
    id: 'home',
    path: '/',
    icon: Home,
    labelKey: 'nav.home' as const,
  },
  {
    id: 'add',
    path: '/add',
    icon: Plus,
    labelKey: 'nav.add' as const,
  },
  {
    id: 'calendar',
    path: '/calendar',
    icon: Calendar,
    labelKey: 'nav.calendar' as const,
  },
  {
    id: 'reports',
    path: '/reports',
    icon: History,
    labelKey: 'nav.reports' as const,
  },
  {
    id: 'symptoms',
    path: '/add-symptom',
    icon: Heart,
    labelKey: 'nav.symptoms' as const,
  },
];

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();
  const { t } = useLanguage();

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600 px-2 py-2 z-30">
      <div className="flex justify-around">
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = location === item.path;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => setLocation(item.path)}
              className={`
                flex flex-col items-center p-2 h-auto space-y-1 transition-colors flex-1
                ${isActive 
                  ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/30 dark:text-primary-400' 
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                }
              `}
              aria-label={t(item.labelKey)}
            >
              <IconComponent className="icon-senior" />
              <span className="text-xs font-medium">
                {t(item.labelKey)}
              </span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
