import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Trash2, Plus, Utensils, Clock, Coffee, Moon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { insertMedicationSchema } from '@shared/schema';
import { apiRequest } from '../lib/queryClient';
import { scheduleMedicationNotifications } from '../lib/nativeNotifications';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Liste des médicaments couramment prescrits pour l'autocomplétion
const COMMON_MEDICATIONS = [
  'Doliprane 1000mg', 'Paracétamol 500mg', 'Doliprane 500mg',
  'Ibuprofène 400mg', 'Aspégic 100mg', 'Aspirine 75mg',
  'Levothyrox 50µg', 'Levothyrox 75µg', 'Levothyrox 100µg',
  'Kardégic 75mg', 'Plavix 75mg', 'Coversyl 5mg',
  'Amlor 5mg', 'Témérit 20mg', 'Previscan 20mg',
  'Tahor 20mg', 'Crestor 10mg', 'Inexium 40mg',
  'Mopral 20mg', 'Oméprazole 20mg', 'Smecta',
  'Spasfon 80mg', 'Efferalgan 1000mg', 'Nurofen 400mg',
  'Temesta 1mg', 'Lexomil 6mg', 'Stilnox 10mg',
  'Zolpidem 10mg', 'Tardyferon 80mg', 'Furadantine 50mg'
];

const formSchema = insertMedicationSchema.extend({
  times: z.array(z.string()).min(1, "Au moins une heure est requise"),
});

type FormData = z.infer<typeof formSchema>;

// Options d'instructions avec icônes
const INSTRUCTION_OPTIONS = [
  {
    value: 'before',
    icon: Coffee,
    labelKey: 'add.before_meal' as const,
    color: 'bg-orange-500'
  },
  {
    value: 'during',
    icon: Utensils,
    labelKey: 'add.during_meal' as const,
    color: 'bg-green-500'
  },
  {
    value: 'after',
    icon: Clock,
    labelKey: 'add.after_meal' as const,
    color: 'bg-blue-500'
  },
  {
    value: 'anytime',
    icon: Moon,
    labelKey: 'add.anytime' as const,
    color: 'bg-purple-500'
  }
];

export default function AddMedication() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [times, setTimes] = useState(['08:00']);
  const [medicationInput, setMedicationInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Filtrer les suggestions basées sur l'input
  const filteredMedications = useMemo(() => {
    if (!medicationInput) return [];
    return COMMON_MEDICATIONS.filter(med => 
      med.toLowerCase().includes(medicationInput.toLowerCase())
    ).slice(0, 5); // Limiter à 5 suggestions
  }, [medicationInput]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      dosage: '',
      instructions: 'after',
      times: ['08:00'],
      duration: undefined,
      durationType: 'days',
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest('POST', '/api/medications', data);
      return response.json();
    },
    onSuccess: async (medication, variables) => {
      toast({
        title: t('add.success'),
        variant: 'default',
      });
      await scheduleMedicationNotifications({ ...medication, times: variables.times });
      queryClient.invalidateQueries({ queryKey: ['/api/reminders/today'] });
      queryClient.invalidateQueries({ queryKey: ['/api/medications'] });
      setLocation('/patient/app');
    },
    onError: () => {
      toast({
        title: t('add.error'),
        variant: 'destructive',
      });
    },
  });

  const addTime = () => {
    const newTimes = [...times, '12:00'];
    setTimes(newTimes);
    form.setValue('times', newTimes);
  };

  const removeTime = (index: number) => {
    if (times.length > 1) {
      const newTimes = times.filter((_, i) => i !== index);
      setTimes(newTimes);
      form.setValue('times', newTimes);
    }
  };

  const updateTime = (index: number, value: string) => {
    const newTimes = [...times];
    newTimes[index] = value;
    setTimes(newTimes);
    form.setValue('times', newTimes);
  };

  const selectMedication = (medication: string) => {
    setMedicationInput(medication);
    form.setValue('name', medication);
    setShowSuggestions(false);
  };

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  return (
    <main className="p-4 pb-20">
      <h2 className="text-senior-2xl font-bold text-gray-800 dark:text-white mb-6">
        {t('add.title')}
      </h2>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Medication Name with Autocomplete */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-senior-lg font-semibold">
                      {t('add.name_label')}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          value={medicationInput}
                          onChange={(e) => {
                            setMedicationInput(e.target.value);
                            field.onChange(e.target.value);
                            setShowSuggestions(true);
                          }}
                          onBlur={() => {
                            // Délai pour permettre le clic sur une suggestion
                            setTimeout(() => setShowSuggestions(false), 200);
                          }}
                          onFocus={() => setShowSuggestions(medicationInput.length > 0)}
                          placeholder={t('add.name_placeholder')}
                          className="text-senior-base p-4 h-auto focus-visible:ring-4"
                        />
                        
                        {/* Suggestions dropdown */}
                        {showSuggestions && filteredMedications.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {filteredMedications.map((medication, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => selectMedication(medication)}
                                className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-senior-base border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                              >
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {medication}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Dosage */}
              <FormField
                control={form.control}
                name="dosage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-senior-lg font-semibold">
                      {t('add.dosage_label')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t('add.dosage_placeholder')}
                        className="text-senior-base p-4 h-auto focus-visible:ring-4"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Instructions avec icônes */}
              <FormField
                control={form.control}
                name="instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-senior-lg font-semibold">
                      {t('add.instructions_label')}
                    </FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-2 gap-3">
                        {INSTRUCTION_OPTIONS.map((option) => {
                          const IconComponent = option.icon;
                          const isSelected = field.value === option.value;
                          
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => field.onChange(option.value)}
                              className={`
                                flex flex-col items-center p-4 rounded-xl border-2 transition-all hover-scale
                                ${isSelected 
                                  ? `${option.color} text-white border-transparent shadow-lg` 
                                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                }
                              `}
                            >
                              <IconComponent className="h-8 w-8 mb-2" />
                              <span className="text-senior-base font-medium text-center">
                                {t(option.labelKey)}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Times */}
              <div>
                <label className="block text-senior-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">
                  {t('add.times_label')}
                </label>
                <div className="space-y-3">
                  {times.map((time, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Input
                        type="time"
                        value={time}
                        onChange={(e) => updateTime(index, e.target.value)}
                        className="flex-1 text-senior-base p-4 h-auto focus-visible:ring-4"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => removeTime(index)}
                        disabled={times.length === 1}
                        className="p-3 h-auto"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={addTime}
                  className="mt-3 text-senior-base font-medium h-auto py-3 px-4"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  {t('add.add_time')}
                </Button>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-senior-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">
                  {t('add.duration_label')}
                </label>
                <div className="flex items-center space-x-3">
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            placeholder="7"
                            min="1"
                            className="text-senior-base p-4 h-auto focus-visible:ring-4"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="durationType"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <SelectTrigger className="text-senior-base p-4 h-auto focus-visible:ring-4 w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="days">{t('add.days')}</SelectItem>
                              <SelectItem value="weeks">{t('add.weeks')}</SelectItem>
                              <SelectItem value="months">{t('add.months')}</SelectItem>
                              <SelectItem value="indefinite">{t('add.indefinite')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation('/patient/app')}
                  className="flex-1 text-senior-lg font-medium h-auto py-4 px-6"
                >
                  {t('actions.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 bg-primary-500 hover:bg-primary-600 text-senior-lg font-medium h-auto py-4 px-6"
                >
                  {createMutation.isPending ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {t('actions.save')}
                    </div>
                  ) : (
                    t('actions.save')
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}
