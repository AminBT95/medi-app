import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart } from 'lucide-react';

export default function AddSymptomSimple() {
  const { language } = useLanguage();
  
  return (
    <main className="p-4 pb-20">
      <div className="flex items-center space-x-3 mb-6">
        <Heart className="icon-senior-lg text-red-500" />
        <h2 className="text-senior-2xl font-bold text-gray-800 dark:text-white">
          {language === 'fr' ? 'Ajouter un Symptôme' : 'Add Symptom'}
        </h2>
      </div>

      <Card className="senior-contrast">
        <CardHeader>
          <CardTitle className="text-senior-lg">
            {language === 'fr' ? 'Suivi des symptômes' : 'Symptom tracking'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-senior-base text-gray-600 dark:text-gray-300">
            {language === 'fr' 
              ? 'Ici vous pourrez enregistrer vos symptômes avec leur intensité et leurs détails.'
              : 'Here you can record your symptoms with their intensity and details.'
            }
          </p>
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-senior-base text-red-800 dark:text-red-200">
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