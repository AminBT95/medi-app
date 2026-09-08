import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X, Clock, Coffee, Utensils, Moon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { notificationManager } from '../lib/notifications';
import { apiRequest } from '../lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { TodayReminder } from '@shared/schema';

interface MedicationCardProps {
  reminder: TodayReminder;
}

export default function MedicationCard({ reminder }: MedicationCardProps) {
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const markStatusMutation = useMutation({
    mutationFn: async ({ status }: { status: 'taken' | 'missed' }) => {
      const today = new Date().toISOString().split('T')[0];
      
      if (reminder.historyId) {
        // Update existing history
        const response = await apiRequest('PATCH', `/api/history/${reminder.historyId}`, {
          status,
          actualTime: new Date().toISOString(),
        });
        return response.json();
      } else {
        // Create new history entry
        const response = await apiRequest('POST', '/api/history', {
          medicationId: reminder.medicationId,
          scheduledTime: reminder.time,
          status,
          actualTime: new Date().toISOString(),
          date: today,
        });
        return response.json();
      }
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/reminders/today'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats/today'] });
      queryClient.invalidateQueries({ queryKey: ['/api/history'] });
      
      const message = status === 'taken' 
        ? t('notification.marked_taken')
        : t('notification.marked_missed');
      
      toast({
        title: message,
        variant: status === 'taken' ? 'default' : 'destructive',
      });
      
      notificationManager.showStatusNotification(message, language);
    },
  });

  const getBorderColor = () => {
    switch (reminder.status) {
      case 'taken':
        return 'border-green-500';
      case 'missed':
        return 'border-red-500';
      default:
        return 'border-primary-500';
    }
  };

  const getInstructionIcon = () => {
    const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
      'before': Coffee,
      'during': Utensils,
      'after': Clock,
      'anytime': Moon
    };
    return iconMap[reminder.instructions] || Clock;
  };

  const getInstructionText = () => {
    const instructionMap: Record<string, Record<string, string>> = {
      'before': { fr: 'avant le repas', en: 'before meal' },
      'during': { fr: 'pendant le repas', en: 'during meal' },
      'after': { fr: 'après le repas', en: 'after meal' },
      'anytime': { fr: 'à tout moment', en: 'anytime' }
    };

    return instructionMap[reminder.instructions]?.[language] || reminder.instructions;
  };

  const getInstructionColor = () => {
    const colorMap: Record<string, string> = {
      'before': 'text-orange-600 dark:text-orange-400',
      'during': 'text-green-600 dark:text-green-400',
      'after': 'text-blue-600 dark:text-blue-400',
      'anytime': 'text-purple-600 dark:text-purple-400'
    };
    return colorMap[reminder.instructions] || 'text-gray-600 dark:text-gray-400';
  };

  const ActionButtons = () => {
    if (reminder.status === 'taken') {
      return (
        <div className="flex items-center">
          <Button
            variant="secondary"
            disabled
            className="bg-green-500 text-white px-4 py-2 text-senior-base font-medium h-auto"
          >
            <Check className="h-4 w-4 mr-2" />
            {t('status.taken')}
          </Button>
        </div>
      );
    }

    return (
      <div className="flex flex-col space-y-2">
        <Button
          onClick={() => markStatusMutation.mutate({ status: 'taken' })}
          disabled={markStatusMutation.isPending}
          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 text-senior-base font-medium h-auto hover-scale focus-visible:ring-4"
        >
          <Check className="h-4 w-4 mr-2" />
          {t('actions.taken')}
        </Button>
        <Button
          onClick={() => markStatusMutation.mutate({ status: 'missed' })}
          disabled={markStatusMutation.isPending}
          variant="destructive"
          className="px-4 py-2 text-senior-base font-medium h-auto hover-scale focus-visible:ring-4"
        >
          <X className="h-4 w-4 mr-2" />
          {t('actions.missed')}
        </Button>
      </div>
    );
  };

  return (
    <Card className={`border-l-4 ${getBorderColor()} shadow-md hover-scale`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h4 className="text-senior-lg font-semibold text-gray-800 dark:text-white mb-1">
              {reminder.medicationName}
            </h4>
            <p className="text-senior-base text-gray-600 dark:text-gray-300 mb-2">
              {reminder.dosage}
            </p>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center text-accent-600 dark:text-accent-400">
                <Clock className="h-4 w-4 mr-2" />
                <span className="text-senior-base font-medium">
                  {reminder.time}
                </span>
              </div>
              <div className={`flex items-center ${getInstructionColor()}`}>
                {(() => {
                  const IconComponent = getInstructionIcon();
                  return <IconComponent className="h-4 w-4 mr-1" />;
                })()}
                <span className="text-sm font-medium">
                  {getInstructionText()}
                </span>
              </div>
            </div>
          </div>
          <div className="ml-4">
            <ActionButtons />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
