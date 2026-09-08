import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { useLanguage } from '../contexts/LanguageContext';
import { apiRequest } from '../lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Heart, Clock, Calendar, FileText } from 'lucide-react';
import type { InsertSymptom } from '@shared/schema';

const formSchema = z.object({
  name: z.string().min(1, 'Le nom du symptôme est requis'),
  severity: z.number().min(1).max(10),
  notes: z.string().optional(),
  date: z.string().min(1, 'La date est requise'),
  time: z.string().min(1, 'L\'heure est requise'),
});

type FormData = z.infer<typeof formSchema>;

export default function AddSymptom() {
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      severity: 5,
      notes: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      time: format(new Date(), 'HH:mm'),
    },
  });

  const createSymptomMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch('/api/symptoms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create symptom');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/symptoms'] });
      toast({
        title: language === 'fr' ? 'Symptôme ajouté' : 'Symptom added',
        description: language === 'fr' ? 'Le symptôme a été enregistré avec succès.' : 'The symptom has been recorded successfully.',
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible d\'enregistrer le symptôme.' : 'Failed to record the symptom.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createSymptomMutation.mutate(data);
  };

  const getSeverityText = (severity: number) => {
    if (language === 'fr') {
      if (severity <= 3) return 'Léger';
      if (severity <= 6) return 'Modéré';
      if (severity <= 8) return 'Fort';
      return 'Très fort';
    } else {
      if (severity <= 3) return 'Mild';
      if (severity <= 6) return 'Moderate';
      if (severity <= 8) return 'Severe';
      return 'Very severe';
    }
  };

  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return 'text-green-600';
    if (severity <= 6) return 'text-yellow-600';
    if (severity <= 8) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <main className="p-4 pb-20">
      <div className="flex items-center space-x-3 mb-6">
        <Heart className="icon-senior-lg text-red-500" />
        <h2 className="text-senior-2xl font-bold text-gray-800 dark:text-white">
          {language === 'fr' ? 'Ajouter un Symptôme' : 'Add Symptom'}
        </h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Symptom Name */}
          <Card className="senior-contrast">
            <CardHeader>
              <CardTitle className="text-senior-lg flex items-center">
                <Heart className="icon-senior mr-2" />
                {language === 'fr' ? 'Nom du symptôme' : 'Symptom name'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-senior-base">
                      {language === 'fr' ? 'Décrivez votre symptôme' : 'Describe your symptom'}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder={language === 'fr' ? 'Ex: Mal de tête, Nausée, Fatigue...' : 'Ex: Headache, Nausea, Fatigue...'}
                        className="text-senior-base p-3 senior-contrast"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Severity */}
          <Card className="senior-contrast">
            <CardHeader>
              <CardTitle className="text-senior-lg">
                {language === 'fr' ? 'Intensité' : 'Severity'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-senior-base">
                      {language === 'fr' ? 'Sur une échelle de 1 à 10' : 'On a scale from 1 to 10'}
                    </FormLabel>
                    <div className="space-y-4">
                      <FormControl>
                        <Slider
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                          max={10}
                          min={1}
                          step={1}
                          className="w-full"
                        />
                      </FormControl>
                      <div className="flex justify-between text-senior-base">
                        <span>{language === 'fr' ? 'Très léger' : 'Very mild'}</span>
                        <span className={`font-bold text-senior-lg ${getSeverityColor(field.value)}`}>
                          {field.value}/10 - {getSeverityText(field.value)}
                        </span>
                        <span>{language === 'fr' ? 'Très fort' : 'Very severe'}</span>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="senior-contrast">
              <CardHeader>
                <CardTitle className="text-senior-lg flex items-center">
                  <Calendar className="icon-senior mr-2" />
                  {language === 'fr' ? 'Date' : 'Date'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="date"
                          className="text-senior-base p-3 senior-contrast"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="senior-contrast">
              <CardHeader>
                <CardTitle className="text-senior-lg flex items-center">
                  <Clock className="icon-senior mr-2" />
                  {language === 'fr' ? 'Heure' : 'Time'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="time"
                          className="text-senior-base p-3 senior-contrast"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Notes */}
          <Card className="senior-contrast">
            <CardHeader>
              <CardTitle className="text-senior-lg flex items-center">
                <FileText className="icon-senior mr-2" />
                {language === 'fr' ? 'Notes (optionnel)' : 'Notes (optional)'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-senior-base">
                      {language === 'fr' ? 'Détails supplémentaires' : 'Additional details'}
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder={language === 'fr' ? 'Circonstances, déclencheurs, autres observations...' : 'Circumstances, triggers, other observations...'}
                        className="text-senior-base p-3 senior-contrast min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full text-senior-lg py-6 senior-contrast"
            disabled={createSymptomMutation.isPending}
          >
            {createSymptomMutation.isPending 
              ? (language === 'fr' ? 'Enregistrement...' : 'Recording...') 
              : (language === 'fr' ? 'Enregistrer le symptôme' : 'Record symptom')
            }
          </Button>
        </form>
      </Form>
    </main>
  );
}