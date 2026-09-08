import { useState, useEffect } from 'react';
import { PillBottle, Languages, Settings } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import BottomNavigation from './BottomNavigation';
import NotificationModal from './NotificationModal';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { language, toggleLanguage, t } = useLanguage();
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  // Check notification permission on load
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      // Show notification modal after a short delay
      const timer = setTimeout(() => {
        setShowNotificationModal(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="min-h-screen max-w-md mx-auto bg-white shadow-xl relative">
      {/* Header */}
      <header className="bg-primary-500 text-white p-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <PillBottle className="h-7 w-7" />
            <h1 className="text-senior-xl font-bold">
              {t('app.title')}
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
              className="text-white hover:bg-primary-600 h-10 w-10"
              aria-label={`Switch to ${language === 'fr' ? 'English' : 'Français'}`}
            >
              <Languages className="h-5 w-5" />
            </Button>
            
            {/* Settings (placeholder) */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNotificationModal(true)}
              className="text-white hover:bg-primary-600 h-10 w-10"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="min-h-[calc(100vh-140px)]">
        {children}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* Notification Modal */}
      <NotificationModal 
        isOpen={showNotificationModal} 
        onClose={() => setShowNotificationModal(false)}
      />
    </div>
  );
}
