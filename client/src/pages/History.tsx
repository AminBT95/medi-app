import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { MedicationHistory } from '@shared/schema';

type FilterType = 'all' | 'taken' | 'missed';

export default function History() {
  const { language, t } = useLanguage();
  const [filter, setFilter] = useState<FilterType>('all');

  const { data: history = [], isLoading } = useQuery<MedicationHistory[]>({
    queryKey: ['/api/history'],
  });

  const locale = language === 'fr' ? fr : enUS;

  const filteredHistory = history.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'taken':
        return (
          <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {t('status.taken')}
          </Badge>
        );
      case 'missed':
        return (
          <Badge className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            {t('status.missed')}
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t('status.pending')}
          </Badge>
        );
    }
  };

  const getBorderColor = (status: string) => {
    switch (status) {
      case 'taken':
        return 'border-green-500';
      case 'missed':
        return 'border-red-500';
      default:
        return 'border-gray-300 dark:border-gray-600';
    }
  };

  if (isLoading) {
    return (
      <main className="p-4 pb-20">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-6"></div>
        <div className="flex space-x-2 mb-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="p-4 pb-20">
      <h2 className="text-senior-2xl font-bold text-gray-800 dark:text-white mb-6">
        {t('history.title')}
      </h2>

      {/* Filter Buttons */}
      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2 hide-scrollbar">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          className="text-senior-base font-medium whitespace-nowrap h-auto py-2 px-4"
        >
          {t('history.all')}
        </Button>
        <Button
          variant={filter === 'taken' ? 'default' : 'outline'}
          onClick={() => setFilter('taken')}
          className="text-senior-base font-medium whitespace-nowrap h-auto py-2 px-4"
        >
          {t('history.taken')}
        </Button>
        <Button
          variant={filter === 'missed' ? 'default' : 'outline'}
          onClick={() => setFilter('missed')}
          className="text-senior-base font-medium whitespace-nowrap h-auto py-2 px-4"
        >
          {t('history.missed')}
        </Button>
      </div>

      {/* History Items */}
      {filteredHistory.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-gray-400 dark:text-gray-500 mb-2">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-senior-lg font-semibold text-gray-800 dark:text-white mb-2">
              {t('history.no_history')}
            </h3>
            <p className="text-senior-base text-gray-600 dark:text-gray-300">
              {t('history.no_history_desc')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((item) => (
            <Card key={item.id} className={`border-l-4 ${getBorderColor(item.status)}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-senior-lg font-semibold text-gray-800 dark:text-white">
                      Medication #{item.medicationId}
                    </h4>
                    <p className="text-senior-base text-gray-600 dark:text-gray-300 mb-1">
                      {t('time.at')} {item.scheduledTime}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(item.date), 'dd MMMM yyyy', { locale })}
                      {item.actualTime && (
                        <span className="ml-2">
                          ({format(new Date(item.actualTime), 'HH:mm', { locale })})
                        </span>
                      )}
                    </p>
                    {item.notes && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 italic">
                        {item.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center ml-4">
                    {getStatusBadge(item.status)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
