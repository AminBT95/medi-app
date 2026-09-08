import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

export default function CalendarSimple() {
  const { language } = useLanguage();
  
  return (
    <main className="p-4 pb-20">
      <div className="flex items-center space-x-3 mb-6">
        <Calendar className="icon-senior-lg text-blue-500" />
        <h2 className="text-senior-2xl font-bold text-gray-800 dark:text-white">
          {language === 'fr' ? 'Calendrier de Suivi' : 'Tracking Calendar'}
        </h2>
      </div>

      <Card className="senior-contrast">
        <CardHeader>
          <CardTitle className="text-senior-lg">
            {language === 'fr' ? 'Calendrier de suivi' : 'Tracking calendar'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-senior-base text-gray-600 dark:text-gray-300">
            {language === 'fr' 
              ? 'Ici vous pourrez voir vos médicaments et symptômes sur un calendrier visuel.'
              : 'Here you can view your medications and symptoms on a visual calendar.'
            }
          </p>
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-senior-base text-blue-800 dark:text-blue-200">
              {language === 'fr' 
                ? 'Fonctionnalité en cours de développement - Bientôt disponible !'
                : 'Feature under development - Coming soon!'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}