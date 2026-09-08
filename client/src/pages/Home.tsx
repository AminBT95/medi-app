import { useMemo } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import {
  Activity,
  CalendarDays,
  ChevronRight,
  CircleCheckBig,
  Clock3,
  HeartPulse,
  Pill,
  Plus,
  Stethoscope,
  TrendingUp,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import MedicationCard from '../components/MedicationCard';
import { Progress } from '@/components/ui/progress';
import type { TodayReminder } from '@shared/schema';

type TodayStats = { taken: number; missed: number; pending: number };

export default function Home() {
  const { language, t } = useLanguage();
  const [, setLocation] = useLocation();

  const { data: reminders = [], isLoading } = useQuery<TodayReminder[]>({
    queryKey: ['/api/reminders/today'],
  });

  const { data: stats } = useQuery<TodayStats>({
    queryKey: ['/api/stats/today'],
  });

  const today = new Date();
  const locale = language === 'fr' ? fr : enUS;
  const formattedDate = format(today, 'EEEE d MMMM', { locale });
  const pendingReminders = reminders.filter((r) => r.status === 'pending');
  const completedReminders = reminders.filter((r) => r.status === 'taken');
  const missedReminders = reminders.filter((r) => r.status === 'missed');

  const nextReminder = useMemo(() => {
    if (!pendingReminders.length) return undefined;
    const nowMinutes = today.getHours() * 60 + today.getMinutes();
    const toMinutes = (value: string) => {
      const [h = '0', m = '0'] = value.split(':');
      return Number(h) * 60 + Number(m);
    };
    return [...pendingReminders].sort((a, b) => {
      const aDelta = toMinutes(a.time) - nowMinutes;
      const bDelta = toMinutes(b.time) - nowMinutes;
      const aScore = aDelta >= 0 ? aDelta : aDelta + 24 * 60;
      const bScore = bDelta >= 0 ? bDelta : bDelta + 24 * 60;
      return aScore - bScore;
    })[0];
  }, [pendingReminders, today]);

  const total = stats ? stats.taken + stats.missed + stats.pending : reminders.length;
  const adherence = total ? Math.round(((stats?.taken ?? completedReminders.length) / total) * 100) : 100;

  if (isLoading) {
    return (
      <main className="px-4 pb-28 pt-5">
        <div className="h-40 animate-pulse rounded-[28px] bg-slate-100" />
        <div className="mt-5 grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100" />)}
        </div>
        <div className="mt-6 space-y-3">
          {[1, 2].map((i) => <div key={i} className="h-32 animate-pulse rounded-3xl bg-slate-100" />)}
        </div>
      </main>
    );
  }

  return (
    <main className="medi-home pb-28">
      <section className="px-4 pb-2 pt-4">
        <div className="medi-hero relative overflow-hidden rounded-[30px] p-5 text-white">
          <div className="relative z-10">
            <p className="text-sm font-semibold text-white/75 capitalize">{formattedDate}</p>
            <div className="mt-2 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[28px] font-extrabold leading-tight tracking-[-0.03em] text-white">
                  {language === 'fr' ? 'Votre santé, au bon rythme.' : 'Your health, on track.'}
                </h2>
                <p className="mt-2 max-w-[270px] text-sm leading-5 text-white/75">
                  {pendingReminders.length
                    ? (language === 'fr' ? `${pendingReminders.length} prise(s) restent à suivre aujourd’hui.` : `${pendingReminders.length} dose(s) left today.`)
                    : (language === 'fr' ? 'Tout est à jour pour aujourd’hui.' : 'Everything is up to date today.')}
                </p>
              </div>
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                <Pill className="h-7 w-7" />
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/15 bg-white/10 p-3 backdrop-blur-sm">
              <div className="flex items-center justify-between text-xs font-semibold text-white/80">
                <span>{language === 'fr' ? 'Observance du jour' : 'Today adherence'}</span>
                <span>{adherence}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15">
                <div className="h-full rounded-full bg-white transition-all duration-500" style={{ width: `${adherence}%` }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pt-4">
        <div className="grid grid-cols-3 gap-3">
          <StatTile value={stats?.taken ?? completedReminders.length} label={language === 'fr' ? 'Prises' : 'Taken'} icon={CircleCheckBig} tone="emerald" />
          <StatTile value={stats?.pending ?? pendingReminders.length} label={language === 'fr' ? 'À venir' : 'Pending'} icon={Clock3} tone="blue" />
          <StatTile value={stats?.missed ?? missedReminders.length} label={language === 'fr' ? 'Manquées' : 'Missed'} icon={Activity} tone="rose" />
        </div>
      </section>

      <section className="px-4 pt-6">
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">{language === 'fr' ? 'Prochaine étape' : 'Up next'}</p>
            <h3 className="mt-1 text-xl font-extrabold tracking-tight text-slate-900">{language === 'fr' ? 'Prochaine prise' : 'Next dose'}</h3>
          </div>
          <button onClick={() => setLocation('/patient/calendar')} className="flex items-center gap-1 text-xs font-bold text-slate-500">
            {language === 'fr' ? 'Calendrier' : 'Calendar'} <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {nextReminder ? (
          <div className="rounded-[26px] border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-200">
                <Pill className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-extrabold text-slate-900">{nextReminder.medicationName}</p>
                <p className="mt-0.5 text-sm font-medium text-slate-500">{nextReminder.dosage}</p>
              </div>
              <div className="rounded-2xl bg-slate-900 px-3 py-2 text-center text-white">
                <Clock3 className="mx-auto h-4 w-4 text-emerald-300" />
                <p className="mt-1 text-sm font-extrabold">{nextReminder.time}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-[26px] border border-emerald-100 bg-emerald-50 p-5 text-center">
            <CircleCheckBig className="mx-auto h-8 w-8 text-emerald-600" />
            <p className="mt-2 font-bold text-slate-900">{language === 'fr' ? 'Aucune prise en attente' : 'No pending dose'}</p>
            <p className="mt-1 text-sm text-slate-500">{language === 'fr' ? 'Vous êtes à jour pour aujourd’hui.' : 'You are all caught up today.'}</p>
          </div>
        )}
      </section>

      <section className="px-4 pt-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xl font-extrabold tracking-tight text-slate-900">{language === 'fr' ? 'Actions rapides' : 'Quick actions'}</h3>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <QuickAction label={language === 'fr' ? 'Traitement' : 'Medicine'} icon={Plus} onClick={() => setLocation('/patient/add')} />
          <QuickAction label={language === 'fr' ? 'Symptôme' : 'Symptom'} icon={HeartPulse} onClick={() => setLocation('/patient/add-symptom')} />
          <QuickAction label={language === 'fr' ? 'Médecin' : 'Doctor'} icon={Stethoscope} onClick={() => setLocation('/patient/add-doctor')} />
          <QuickAction label={language === 'fr' ? 'Rapports' : 'Reports'} icon={TrendingUp} onClick={() => setLocation('/patient/reports')} />
        </div>
      </section>

      <section className="px-4 pt-7">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{language === 'fr' ? 'Aujourd’hui' : 'Today'}</p>
            <h3 className="mt-1 text-xl font-extrabold tracking-tight text-slate-900">{t('home.todays_meds')}</h3>
          </div>
          <button onClick={() => setLocation('/patient/history')} className="flex items-center gap-1 text-xs font-bold text-emerald-700">
            {language === 'fr' ? 'Historique' : 'History'} <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {reminders.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-200 bg-white p-7 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500"><CalendarDays className="h-6 w-6" /></div>
            <h4 className="mt-4 font-extrabold text-slate-900">{t('home.no_medications')}</h4>
            <p className="mx-auto mt-1 max-w-[260px] text-sm leading-5 text-slate-500">{t('home.no_medications_desc')}</p>
            <button onClick={() => setLocation('/patient/add')} className="mt-4 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-emerald-100">
              {language === 'fr' ? 'Ajouter un traitement' : 'Add medication'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingReminders.map((reminder) => <MedicationCard key={reminder.id} reminder={reminder} />)}
            {completedReminders.map((reminder) => <MedicationCard key={reminder.id} reminder={reminder} />)}
            {missedReminders.map((reminder) => <MedicationCard key={reminder.id} reminder={reminder} />)}
          </div>
        )}
      </section>
    </main>
  );
}

function StatTile({ value, label, icon: Icon, tone }: { value: number; label: string; icon: any; tone: 'emerald' | 'blue' | 'rose' }) {
  const tones = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100',
  };
  return (
    <div className={`rounded-2xl border p-3 ${tones[tone]}`}>
      <Icon className="h-4 w-4 opacity-80" />
      <div className="mt-2 text-2xl font-black leading-none">{value}</div>
      <div className="mt-1 truncate text-[11px] font-bold opacity-75">{label}</div>
    </div>
  );
}

function QuickAction({ label, icon: Icon, onClick }: { label: string; icon: any; onClick: () => void }) {
  return (
    <button onClick={onClick} className="group flex min-w-0 flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-white px-1 py-3 shadow-sm transition active:scale-[.97]">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white transition group-active:bg-emerald-600"><Icon className="h-5 w-5" /></div>
      <span className="w-full truncate text-[10px] font-extrabold text-slate-600">{label}</span>
    </button>
  );
}
