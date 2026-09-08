import { useQuery } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Pill, Heart } from 'lucide-react';
import type { MedicationHistory, Medication, Symptom } from '@shared/schema';

export default function Calendar() {
  const { language, t } = useLanguage();
  const locale = language === 'fr' ? fr : enUS;
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get medications
  const { data: medications = [] } = useQuery<Medication[]>({
    queryKey: ['/api/medications'],
  });

  // Get medication history
  const { data: history = [] } = useQuery<MedicationHistory[]>({
    queryKey: ['/api/history'],
  });

  // Get symptoms
  const { data: symptoms = [] } = useQuery<Symptom[]>({
    queryKey: ['/api/symptoms'],
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const getDayData = (day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayHistory = history.filter(h => h.date === dayStr);
    const daySymptoms = symptoms.filter(s => s.date === dayStr);
    
    return {
      history: dayHistory,
      symptoms: daySymptoms,
      takenCount: dayHistory.filter(h => h.status === 'taken').length,
      missedCount: dayHistory.filter(h => h.status === 'missed').length,
    };
  };

  const getDayStatus = (day: Date) => {
    const data = getDayData(day);
    if (data.history.length === 0 && data.symptoms.length === 0) return 'none';
    if (data.missedCount > 0) return 'missed';
    if (data.symptoms.length > 0) return 'symptom';
    if (data.takenCount > 0) return 'taken';
    return 'none';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'taken': return 'bg-green-100 text-green-800 border-green-200';
      case 'missed': return 'bg-red-100 text-red-800 border-red-200';
      case 'symptom': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  return (
    <main className="p-4 pb-20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-senior-2xl font-bold text-gray-800 dark:text-white">
          {language === 'fr' ? 'Calendrier de Suivi' : 'Tracking Calendar'}
        </h2>
      </div>

      {/* Calendar Navigation */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigateMonth('prev')}
              className="senior-contrast"
            >
              <ChevronLeft className="icon-senior" />
            </Button>
            <CardTitle className="text-senior-xl">
              {format(currentDate, 'MMMM yyyy', { locale })}
            </CardTitle>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigateMonth('next')}
              className="senior-contrast"
            >
              <ChevronRight className="icon-senior" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {/* Day headers */}
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, i) => (
              <div key={i} className="p-2 text-center font-semibold text-gray-600 dark:text-gray-300">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {daysInMonth.map((day) => {
              const dayData = getDayData(day);
              const status = getDayStatus(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isCurrentDay = isToday(day);
              
              return (
                <div
                  key={day.toISOString()}
                  className={`
                    calendar-day senior-contrast rounded-lg p-2 text-center cursor-pointer
                    ${getStatusColor(status)}
                    ${isCurrentDay ? 'ring-2 ring-blue-500' : ''}
                    ${!isCurrentMonth ? 'opacity-30' : ''}
                  `}
                >
                  <div className="text-senior-base font-semibold mb-1">
                    {format(day, 'd')}
                  </div>
                  <div className="flex justify-center space-x-1">
                    {dayData.takenCount > 0 && (
                      <Badge variant="secondary" className="text-xs px-1">
                        <Pill className="icon-senior mr-1" />
                        {dayData.takenCount}
                      </Badge>
                    )}
                    {dayData.symptoms.length > 0 && (
                      <Badge variant="destructive" className="text-xs px-1">
                        <Heart className="icon-senior mr-1" />
                        {dayData.symptoms.length}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-senior-lg">
            {language === 'fr' ? 'Légende' : 'Legend'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
              <span className="text-senior-base">
                {language === 'fr' ? 'Médicaments pris' : 'Medications taken'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
              <span className="text-senior-base">
                {language === 'fr' ? 'Médicaments oubliés' : 'Medications missed'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-100 border border-orange-200 rounded"></div>
              <span className="text-senior-base">
                {language === 'fr' ? 'Symptômes signalés' : 'Symptoms reported'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                <Pill className="icon-senior mr-1" />
                2
              </Badge>
              <span className="text-senior-base">
                {language === 'fr' ? 'Nombre de prises' : 'Number of doses'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}