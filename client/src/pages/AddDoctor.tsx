import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLanguage } from '../contexts/LanguageContext';
import { apiRequest } from '../lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { UserCheck, Stethoscope, Phone, Mail } from 'lucide-react';
import type { InsertDoctor } from '@shared/schema';

const formSchema = z.object({
  name: z.string().min(1, 'Le nom du médecin est requis'),
  specialty: z.string().min(1, 'La spécialité est requise'),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
});

type FormData = z.infer<typeof formSchema>;

export default function AddDoctor() {
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      specialty: '',
      phone: '',
      email: '',
    },
  });

  const createDoctorMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch('/api/doctors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create doctor');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/doctors'] });
      toast({
        title: language === 'fr' ? 'Médecin ajouté' : 'Doctor added',
        description: language === 'fr' ? 'Le médecin a été ajouté avec succès.' : 'The doctor has been added successfully.',
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: language === 'fr' ? 'Erreur' : 'Error',
        description: language === 'fr' ? 'Impossible d\'ajouter le médecin.' : 'Failed to add the doctor.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createDoctorMutation.mutate(data);
  };

  const commonSpecialties = [
    { fr: 'Médecin généraliste', en: 'General Practitioner' },
    { fr: 'Cardiologue', en: 'Cardiologist' },
    { fr: 'Pneumologue', en: 'Pulmonologist' },
    { fr: 'Endocrinologue', en: 'Endocrinologist' },
    { fr: 'Neurologue', en: 'Neurologist' },
    { fr: 'Psychiatre', en: 'Psychiatrist' },
    { fr: 'Rhumatologue', en: 'Rheumatologist' },
    { fr: 'Ophtalmologue', en: 'Ophthalmologist' },
    { fr: 'Dermatologue', en: 'Dermatologist' },
    { fr: 'Gynécologue', en: 'Gynecologist' },
  ];

  return (
    <main className="p-4 pb-20">
      <div className="flex items-center space-x-3 mb-6">
        <UserCheck className="icon-senior-lg text-blue-500" />
        <h2 className="text-senior-2xl font-bold text-gray-800 dark:text-white">
          {language === 'fr' ? 'Ajouter un Médecin' : 'Add Doctor'}
        </h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Doctor Name */}
          <Card className="senior-contrast">
            <CardHeader>
              <CardTitle className="text-senior-lg flex items-center">
                <UserCheck className="icon-senior mr-2" />
                {language === 'fr' ? 'Nom du médecin' : 'Doctor name'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-senior-base">
                      {language === 'fr' ? 'Nom complet' : 'Full name'}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder={language === 'fr' ? 'Dr. Martin Dubois' : 'Dr. John Smith'}
                        className="text-senior-base p-3 senior-contrast"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Specialty */}
          <Card className="senior-contrast">
            <CardHeader>
              <CardTitle className="text-senior-lg flex items-center">
                <Stethoscope className="icon-senior mr-2" />
                {language === 'fr' ? 'Spécialité' : 'Specialty'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="specialty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-senior-base">
                      {language === 'fr' ? 'Spécialité médicale' : 'Medical specialty'}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder={language === 'fr' ? 'Ex: Cardiologue, Médecin généraliste...' : 'Ex: Cardiologist, General Practitioner...'}
                        className="text-senior-base p-3 senior-contrast"
                        list="specialties"
                      />
                    </FormControl>
                    <datalist id="specialties">
                      {commonSpecialties.map((spec, index) => (
                        <option key={index} value={language === 'fr' ? spec.fr : spec.en} />
                      ))}
                    </datalist>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Common specialties as buttons */}
              <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {language === 'fr' ? 'Spécialités courantes :' : 'Common specialties:'}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {commonSpecialties.slice(0, 6).map((spec, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-left justify-start"
                      onClick={() => form.setValue('specialty', language === 'fr' ? spec.fr : spec.en)}
                    >
                      {language === 'fr' ? spec.fr : spec.en}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="senior-contrast">
              <CardHeader>
                <CardTitle className="text-senior-lg flex items-center">
                  <Phone className="icon-senior mr-2" />
                  {language === 'fr' ? 'Téléphone' : 'Phone'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-senior-base">
                        {language === 'fr' ? 'Numéro de téléphone (optionnel)' : 'Phone number (optional)'}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="tel"
                          placeholder="01 23 45 67 89"
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
                  <Mail className="icon-senior mr-2" />
                  {language === 'fr' ? 'Email' : 'Email'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-senior-base">
                        {language === 'fr' ? 'Adresse email (optionnel)' : 'Email address (optional)'}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="email"
                          placeholder="docteur@exemple.fr"
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

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full text-senior-lg py-6 senior-contrast"
            disabled={createDoctorMutation.isPending}
          >
            {createDoctorMutation.isPending 
              ? (language === 'fr' ? 'Ajout en cours...' : 'Adding...') 
              : (language === 'fr' ? 'Ajouter le médecin' : 'Add doctor')
            }
          </Button>
        </form>
      </Form>
    </main>
  );
}