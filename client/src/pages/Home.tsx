import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useLanguage } from '../contexts/LanguageContext';
import MedicationCard from '../components/MedicationCard';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { TodayReminder } from '@shared/schema';

export default function Home() {
  const { language, t } = useLanguage();

  // Get today's reminders
  const { data: reminders = [], isLoading } = useQuery<TodayReminder[]>({
    queryKey: ['/api/reminders/today'],
  });

  // Get today's stats
  const { data: stats } = useQuery<{ taken: number; missed: number; pending: number }>({
    queryKey: ['/api/stats/today'],
  });

  const today = new Date();
  const locale = language === 'fr' ? fr : enUS;
  const formattedDate = format(today, 'EEEE, dd MMMM yyyy', { locale });

  const pendingReminders = reminders.filter(r => r.status === 'pending');
  const completedReminders = reminders.filter(r => r.status === 'taken');

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <main className="pb-20">
      {/* Welcome Section */}
      <div className="p-4 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-gray-700 dark:to-gray-600 border-b dark:border-gray-600">
        <h2 className="text-senior-2xl font-bold text-gray-800 dark:text-white mb-2">
          {t('home.welcome')}
        </h2>
        <p className="text-senior-base text-gray-600 dark:text-gray-300">
          {t('home.today_date')}, {formattedDate}
        </p>
      </div>

      {/* Today's Medications */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-senior-xl font-semibold text-gray-800 dark:text-white">
            {t('home.todays_meds')}
          </h3>
          <Badge className="bg-accent-500 text-white text-senior-base font-medium">
            {reminders.length} {reminders.length === 1 ? 'rappel' : 'rappels'}
          </Badge>
        </div>

        {reminders.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-gray-400 dark:text-gray-500 mb-2">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-senior-lg font-semibold text-gray-800 dark:text-white mb-2">
                {t('home.no_medications')}
              </h3>
              <p className="text-senior-base text-gray-600 dark:text-gray-300">
                {t('home.no_medications_desc')}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Pending reminders first */}
            {pendingReminders.map((reminder) => (
              <MedicationCard key={reminder.id} reminder={reminder} />
            ))}
            
            {/* Completed reminders */}
            {completedReminders.map((reminder) => (
              <MedicationCard key={reminder.id} reminder={reminder} />
            ))}
          </div>
        )}

        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.taken}
              </div>
              <div className="text-senior-base text-green-700 dark:text-green-300">
                {t('stats.taken_today')}
              </div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {stats.missed}
              </div>
              <div className="text-senior-base text-red-700 dark:text-red-300">
                {t('stats.missed_today')}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
