import { useLanguage } from '../contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb, Clock, Utensils, Heart, Shield, Target } from 'lucide-react';

interface HealthTip {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  titleKey: string;
  contentKey: string;
  colorClass: string;
}

const healthTips: HealthTip[] = [
  {
    id: 'hydration',
    icon: Lightbulb,
    titleKey: 'tips.hydration.title',
    contentKey: 'tips.hydration.content',
    colorClass: 'from-primary-50 to-secondary-50 dark:from-gray-700 dark:to-gray-600',
  },
  {
    id: 'timing',
    icon: Clock,
    titleKey: 'tips.timing.title',
    contentKey: 'tips.timing.content',
    colorClass: 'from-secondary-50 to-accent-50 dark:from-gray-700 dark:to-gray-600',
  },
  {
    id: 'food',
    icon: Utensils,
    titleKey: 'tips.food.title',
    contentKey: 'tips.food.content',
    colorClass: 'from-accent-50 to-primary-50 dark:from-gray-700 dark:to-gray-600',
  },
];

// Additional health tips that are not in the translation keys but enhance the app
const additionalTips = [
  {
    id: 'storage',
    icon: Shield,
    title: {
      fr: 'Conservation des médicaments',
      en: 'Medication storage'
    },
    content: {
      fr: 'Conservez vos médicaments dans un endroit sec, frais et à l\'abri de la lumière. Vérifiez régulièrement les dates d\'expiration.',
      en: 'Store your medications in a dry, cool place away from light. Regularly check expiration dates.'
    },
    colorClass: 'from-green-50 to-blue-50 dark:from-gray-700 dark:to-gray-600',
  },
  {
    id: 'adherence',
    icon: Target,
    title: {
      fr: 'Observance du traitement',
      en: 'Treatment adherence'
    },
    content: {
      fr: 'N\'arrêtez jamais un traitement sans l\'avis de votre médecin, même si vous vous sentez mieux. Respectez les doses prescrites.',
      en: 'Never stop treatment without your doctor\'s advice, even if you feel better. Follow prescribed doses.'
    },
    colorClass: 'from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-600',
  },
  {
    id: 'side_effects',
    icon: Heart,
    title: {
      fr: 'Effets secondaires',
      en: 'Side effects'
    },
    content: {
      fr: 'Si vous ressentez des effets secondaires inhabituels, contactez votre médecin ou pharmacien. Ne modifiez pas votre traitement seul.',
      en: 'If you experience unusual side effects, contact your doctor or pharmacist. Don\'t modify your treatment alone.'
    },
    colorClass: 'from-red-50 to-orange-50 dark:from-gray-700 dark:to-gray-600',
  },
];

export default function HealthTips() {
  const { language, t } = useLanguage();

  return (
    <main className="p-4 pb-20">
      <h2 className="text-senior-2xl font-bold text-gray-800 dark:text-white mb-6">
        {t('tips.title')}
      </h2>

      <div className="space-y-6">
        {/* Main tips with translations */}
        {healthTips.map((tip) => {
          const IconComponent = tip.icon;
          return (
            <Card key={tip.id} className={`bg-gradient-to-r ${tip.colorClass} border-0`}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-primary-500 text-white p-3 rounded-full flex-shrink-0">
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-senior-lg font-semibold text-gray-800 dark:text-white mb-2">
                      {t(tip.titleKey as any)}
                    </h3>
                    <p className="text-senior-base text-gray-600 dark:text-gray-300">
                      {t(tip.contentKey as any)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Additional tips */}
        {additionalTips.map((tip) => {
          const IconComponent = tip.icon;
          return (
            <Card key={tip.id} className={`bg-gradient-to-r ${tip.colorClass} border-0`}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-secondary-500 text-white p-3 rounded-full flex-shrink-0">
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-senior-lg font-semibold text-gray-800 dark:text-white mb-2">
                      {tip.title[language]}
                    </h3>
                    <p className="text-senior-base text-gray-600 dark:text-gray-300">
                      {tip.content[language]}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Emergency contact reminder */}
        <Card className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="bg-red-500 text-white p-3 rounded-full flex-shrink-0">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-senior-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                  {language === 'fr' ? 'En cas d\'urgence' : 'In case of emergency'}
                </h3>
                <p className="text-senior-base text-red-700 dark:text-red-300">
                  {language === 'fr' 
                    ? 'En cas de réaction grave ou d\'urgence médicale, appelez immédiatement le 15 (SAMU) ou le 112.' 
                    : 'In case of severe reaction or medical emergency, immediately call 15 (SAMU) or 112.'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
