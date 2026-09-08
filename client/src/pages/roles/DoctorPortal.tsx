import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, ChevronRight, Clock3, FileText, HeartPulse, Pill, Stethoscope, UserRound, Users } from 'lucide-react';
import { useLocation } from 'wouter';
import type { Doctor } from '@shared/schema';

type Appointment = { id: number; patientName: string; appointmentDate: string; type: string; status: string; symptoms?: string | null };

export default function DoctorPortal() {
  const [, setLocation] = useLocation();
  const doctors = useQuery<Doctor[]>({ queryKey: ['/api/doctors'] });
  const [doctorId, setDoctorId] = useState<number | null>(null);
  const activeDoctor = doctorId ?? doctors.data?.[0]?.id ?? null;
  const appointments = useQuery<Appointment[]>({ queryKey: activeDoctor ? [`/api/medical/appointments/today/${activeDoctor}`] : ['doctor-no-appointments'], enabled: !!activeDoctor });

  const status = useMemo(() => {
    const rows = appointments.data ?? [];
    return { total: rows.length, completed: rows.filter(x => x.status === 'completed').length, pending: rows.filter(x => x.status === 'scheduled').length };
  }, [appointments.data]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-sky-100 bg-white px-5 py-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-lg shadow-sky-200"><Stethoscope className="h-5 w-5" /></div><div><p className="text-xs font-black uppercase tracking-[.18em] text-sky-600">Espace médecin</p><h1 className="text-xl font-black">Cabinet Medi-Rappel</h1></div></div>
          <button onClick={() => setLocation('/roles')} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600">Changer d’espace</button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-7">
        <section className="mb-6 rounded-[28px] bg-gradient-to-br from-sky-600 to-indigo-700 p-6 text-white shadow-xl shadow-sky-200/60">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div><p className="text-sm font-semibold text-sky-100">Aujourd’hui</p><h2 className="mt-1 text-3xl font-black">Votre journée clinique</h2><p className="mt-2 max-w-xl text-sm leading-6 text-sky-100">Centralisez les rendez-vous, le suivi patient, les prescriptions et les prochains actes médicaux.</p></div>
            {!!doctors.data?.length && <select value={activeDoctor ?? ''} onChange={e => setDoctorId(Number(e.target.value))} className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-bold text-white outline-none"><option className="text-slate-900" value="">Choisir un médecin</option>{doctors.data.map(d => <option className="text-slate-900" value={d.id} key={d.id}>{d.name}</option>)}</select>}
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <Metric icon={CalendarDays} label="Rendez-vous" value={status.total} />
          <Metric icon={Clock3} label="À venir" value={status.pending} />
          <Metric icon={HeartPulse} label="Terminés" value={status.completed} />
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
          <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-[.16em] text-slate-400">Agenda</p><h3 className="mt-1 text-xl font-black">Consultations du jour</h3></div><CalendarDays className="h-5 w-5 text-sky-600" /></div>
            <div className="space-y-3">
              {(appointments.data ?? []).map(a => <div key={a.id} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-sky-600 shadow-sm"><UserRound className="h-5 w-5" /></div><div className="min-w-0 flex-1"><p className="truncate font-black">{a.patientName}</p><p className="mt-1 text-xs text-slate-500">{new Date(a.appointmentDate).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})} · {a.type}</p></div><span className="rounded-full bg-white px-3 py-1 text-[11px] font-black text-slate-500">{a.status}</span></div>)}
              {!appointments.isLoading && !(appointments.data ?? []).length && <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">Aucun rendez-vous aujourd’hui pour ce médecin.</div>}
            </div>
          </div>

          <div className="space-y-4">
            <Action icon={Users} title="Patients" text="Dossiers et historique médical" />
            <Action icon={Pill} title="Prescriptions" text="Préparer et suivre les traitements" />
            <Action icon={FileText} title="Documents" text="Ordonnances, comptes rendus et factures" />
            <div className="rounded-[24px] bg-slate-900 p-5 text-white"><p className="text-xs font-black uppercase tracking-[.15em] text-slate-400">Préparé pour la suite</p><p className="mt-2 text-sm leading-6 text-slate-300">Ce portail pourra être verrouillé par rôle médecin dès que l’authentification unifiée sera branchée.</p></div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({ icon: Icon, label, value }: any) { return <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-600"><Icon className="h-5 w-5" /></div><div className="text-3xl font-black">{value}</div><div className="mt-1 text-sm font-semibold text-slate-500">{label}</div></div>; }
function Action({ icon: Icon, title, text }: any) { return <button className="group flex w-full items-center gap-4 rounded-[22px] border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-sky-200 hover:shadow-md"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 text-slate-600"><Icon className="h-5 w-5" /></span><span className="flex-1"><strong className="block text-sm">{title}</strong><span className="text-xs text-slate-500">{text}</span></span><ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-sky-600" /></button>; }
