import { useLanguage } from '../contexts/LanguageContext';

export default function ReportsTest() {
  const { language } = useLanguage();
  
  return (
    <main className="p-4 pb-20">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        {language === 'fr' ? 'Test - Page Rapports' : 'Test - Reports Page'}
      </h2>
      <p className="text-gray-600 dark:text-gray-300">
        {language === 'fr' 
          ? 'Cette page de test confirme que le routage fonctionne correctement.' 
          : 'This test page confirms that routing works correctly.'
        }
      </p>
    </main>
  );
}