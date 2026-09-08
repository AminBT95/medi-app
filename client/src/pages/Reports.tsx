import { useQuery } from '@tanstack/react-query';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingDown, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import type { MedicationHistory, Medication } from '@shared/schema';

export default function Reports() {
  const { language, t } = useLanguage();
  const locale = language === 'fr' ? fr : enUS;

  // Get all medications
  const { data: medications = [] } = useQuery<Medication[]>({
    queryKey: ['/api/medications'],
  });

  // Get medication history
  const { data: history = [] } = useQuery<MedicationHistory[]>({
    queryKey: ['/api/history'],
  });

  // Calculate stats for different periods
  const today = new Date();
  const yesterday = subDays(today, 1);
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

  const getStatsForPeriod = (startDate: Date, endDate: Date) => {
    const periodHistory = history.filter(h => {
      const historyDate = new Date(h.date);
      return historyDate >= startDate && historyDate <= endDate;
    });

    return {
      total: periodHistory.length,
      taken: periodHistory.filter(h => h.status === 'taken').length,
      missed: periodHistory.filter(h => h.status === 'missed').length,
      adherenceRate: periodHistory.length > 0 ? (periodHistory.filter(h => h.status === 'taken').length / periodHistory.length) * 100 : 0
    };
  };

  const todayStats = getStatsForPeriod(today, today);
  const weekStats = getStatsForPeriod(weekStart, weekEnd);
  const monthStats = getStatsForPeriod(monthStart, monthEnd);

  // Get medications with poor adherence (< 80%)
  const getMedicationAdherence = () => {
    return medications.map(med => {
      const medHistory = history.filter(h => h.medicationId === med.id);
      const taken = medHistory.filter(h => h.status === 'taken').length;
      const total = medHistory.length;
      const adherenceRate = total > 0 ? (taken / total) * 100 : 100;
      
      return {
        medication: med,
        adherenceRate,
        totalDoses: total,
        takenDoses: taken,
        missedDoses: total - taken
      };
    }).sort((a, b) => a.adherenceRate - b.adherenceRate);
  };

  const medicationAdherence = getMedicationAdherence();
  const poorAdherence = medicationAdherence.filter(ma => ma.adherenceRate < 80 && ma.totalDoses > 0);

  // Dangers liés à la non-observance
  const adherenceRisks = [
    {
      id: 'cardiovascular',
      icon: AlertTriangle,
      titleFr: 'Risques cardiovasculaires',
      titleEn: 'Cardiovascular risks',
      contentFr: 'L\'arrêt ou l\'oubli de médicaments cardiovasculaires peut entraîner des crises cardiaques, des AVC ou une aggravation de l\'insuffisance cardiaque.',
      contentEn: 'Stopping or missing cardiovascular medications can lead to heart attacks, strokes, or worsening heart failure.',
      severity: 'high',
      color: 'bg-red-500'
    },
    {
      id: 'diabetes',
      icon: TrendingDown,
      titleFr: 'Complications diabétiques',
      titleEn: 'Diabetic complications',
      contentFr: 'L\'oubli d\'antidiabétiques peut provoquer une hyperglycémie sévère, un coma diabétique ou des complications à long terme.',
      contentEn: 'Missing diabetes medications can cause severe hyperglycemia, diabetic coma, or long-term complications.',
      severity: 'high',
      color: 'bg-red-500'
    },
    {
      id: 'antibiotics',
      icon: AlertCircle,
      titleFr: 'Résistance aux antibiotiques',
      titleEn: 'Antibiotic resistance',
      contentFr: 'L\'arrêt prématuré d\'antibiotiques peut créer des résistances bactériennes et une récidive de l\'infection.',
      contentEn: 'Premature discontinuation of antibiotics can create bacterial resistance and infection recurrence.',
      severity: 'medium',
      color: 'bg-orange-500'
    },
    {
      id: 'mental_health',
      icon: AlertTriangle,
      titleFr: 'Santé mentale',
      titleEn: 'Mental health',
      contentFr: 'L\'arrêt brutal d\'antidépresseurs ou d\'anxiolytiques peut provoquer un syndrome de sevrage et une rechute.',
      contentEn: 'Sudden discontinuation of antidepressants or anxiolytics can cause withdrawal syndrome and relapse.',
      severity: 'high',
      color: 'bg-red-500'
    },
    {
      id: 'seizures',
      icon: AlertTriangle,
      titleFr: 'Crises d\'épilepsie',
      titleEn: 'Seizures',
      contentFr: 'L\'oubli d\'antiépileptiques peut déclencher des crises convulsives potentiellement dangereuses.',
      contentEn: 'Missing anti-epileptic drugs can trigger potentially dangerous seizures.',
      severity: 'high',
      color: 'bg-red-500'
    },
    {
      id: 'blood_pressure',
      icon: TrendingDown,
      titleFr: 'Hypertension artérielle',
      titleEn: 'High blood pressure',
      contentFr: 'L\'arrêt d\'antihypertenseurs peut provoquer une crise hypertensive et endommager les organes.',
      contentEn: 'Stopping blood pressure medications can cause hypertensive crisis and organ damage.',
      severity: 'high',
      color: 'bg-red-500'
    }
  ];

  const getAdherenceColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600 dark:text-green-400';
    if (rate >= 80) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getAdherenceBadge = (rate: number) => {
    if (rate >= 90) return { variant: 'default' as const, color: 'bg-green-500', text: 'Excellent' };
    if (rate >= 80) return { variant: 'secondary' as const, color: 'bg-yellow-500', text: 'Bon' };
    return { variant: 'destructive' as const, color: 'bg-red-500', text: 'Faible' };
  };

  return (
    <main className="p-4 pb-20">
      <h2 className="text-senior-2xl font-bold text-gray-800 dark:text-white mb-6">
        {language === 'fr' ? 'Rapports et Observance' : 'Reports and Adherence'}
      </h2>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'fr' ? 'Aujourd\'hui' : 'Today'}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {todayStats.adherenceRate.toFixed(0)}%
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">{todayStats.taken}</span>
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm">{todayStats.missed}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'fr' ? 'Cette semaine' : 'This week'}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {weekStats.adherenceRate.toFixed(0)}%
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">{weekStats.taken}</span>
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm">{weekStats.missed}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'fr' ? 'Ce mois' : 'This month'}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {monthStats.adherenceRate.toFixed(0)}%
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">{monthStats.taken}</span>
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm">{monthStats.missed}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Medication Adherence */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-senior-xl">
            {language === 'fr' ? 'Observance par médicament' : 'Medication adherence'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {medicationAdherence.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              {language === 'fr' ? 'Aucune donnée disponible' : 'No data available'}
            </p>
          ) : (
            <div className="space-y-4">
              {medicationAdherence.map((ma) => {
                const badge = getAdherenceBadge(ma.adherenceRate);
                return (
                  <div key={ma.medication.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {ma.medication.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {ma.takenDoses}/{ma.totalDoses} doses prises
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`text-lg font-bold ${getAdherenceColor(ma.adherenceRate)}`}>
                        {ma.adherenceRate.toFixed(0)}%
                      </span>
                      <Badge className={`${badge.color} text-white`}>
                        {badge.text}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Poor Adherence Alerts */}
      {poorAdherence.length > 0 && (
        <Card className="mb-6 border-orange-200 dark:border-orange-800">
          <CardHeader>
            <CardTitle className="text-senior-xl text-orange-800 dark:text-orange-200 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              {language === 'fr' ? 'Alertes d\'observance' : 'Adherence alerts'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {poorAdherence.map((ma) => (
                <div key={ma.medication.id} className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-orange-900 dark:text-orange-100">
                        {ma.medication.name}
                      </h4>
                      <p className="text-sm text-orange-700 dark:text-orange-300">
                        {language === 'fr' 
                          ? `${ma.missedDoses} doses manquées sur ${ma.totalDoses}` 
                          : `${ma.missedDoses} missed doses out of ${ma.totalDoses}`
                        }
                      </p>
                    </div>
                    <Badge variant="destructive">
                      {ma.adherenceRate.toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Adherence Risks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-senior-xl text-red-800 dark:text-red-200 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            {language === 'fr' ? 'Dangers de la non-observance' : 'Risks of non-adherence'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {adherenceRisks.map((risk) => {
              const IconComponent = risk.icon;
              return (
                <div key={risk.id} className="border-l-4 border-red-500 pl-4 py-2">
                  <div className="flex items-start space-x-3">
                    <div className={`${risk.color} text-white p-2 rounded-full flex-shrink-0`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {language === 'fr' ? risk.titleFr : risk.titleEn}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {language === 'fr' ? risk.contentFr : risk.contentEn}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-500 text-white p-2 rounded-full">
                <AlertCircle className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  {language === 'fr' ? 'Conseil important' : 'Important advice'}
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {language === 'fr' 
                    ? 'Ne jamais arrêter ou modifier un traitement sans l\'avis de votre médecin. En cas d\'effets secondaires ou de questions, consultez votre professionnel de santé.'
                    : 'Never stop or modify treatment without your doctor\'s advice. If you experience side effects or have questions, consult your healthcare professional.'
                  }
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}