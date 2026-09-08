import { Bell } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { notificationManager } from '../lib/notifications';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
  const { language, t } = useLanguage();

  const handleAllow = async () => {
    const granted = await notificationManager.requestPermission();
    if (granted) {
      notificationManager.showStatusNotification(
        language === 'fr' ? 'Notifications activées !' : 'Notifications enabled!',
        language
      );
    }
    onClose();
  };

  const handleDeny = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-accent-100 dark:bg-accent-900/30 p-4 rounded-full">
              <Bell className="h-8 w-8 text-accent-600 dark:text-accent-400" />
            </div>
          </div>
          <DialogTitle className="text-senior-xl font-bold text-gray-800 dark:text-white">
            {t('notification.title')}
          </DialogTitle>
          <DialogDescription className="text-senior-base text-gray-600 dark:text-gray-300 mt-2">
            {t('notification.message')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex space-x-3 mt-6">
          <Button
            variant="outline"
            onClick={handleDeny}
            className="flex-1 text-senior-base font-medium h-auto py-3 px-4"
          >
            {t('actions.deny')}
          </Button>
          <Button
            onClick={handleAllow}
            className="flex-1 bg-primary-500 hover:bg-primary-600 text-senior-base font-medium h-auto py-3 px-4"
          >
            {t('actions.allow')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
