import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, CalendarDays, CircleAlert, HeartPulse, PackageCheck, Pill, Stethoscope, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { Doctor, Medication, MedicationHistory, Symptom } from '@shared/schema';

type TodayStats = { taken: number; missed: number; pending: number };

type PharmacyDashboard = {
  totalProducts?: number;
  lowStockProducts?: number;
  totalCustomers?: number;
  todaySales?: number;
};

const number = new Intl.NumberFormat('fr-FR');

export default function Dashboard() {
  const medications = useQuery<Medication[]>({ queryKey: ['/api/medications'] });
  const doctors = useQuery<Doctor[]>({ queryKey: ['/api/doctors'] });
  const symptoms = useQuery<Symptom[]>({ queryKey: ['/api/symptoms'] });
  const history = useQuery<MedicationHistory[]>({ queryKey: ['/api/history'] });
  const stats = useQuery<TodayStats>({ queryKey: ['/api/stats/today'] });
  const pharmacy = useQuery<PharmacyDashboard>({ queryKey: ['/api/pharmacy/dashboard'], retry: false });

  const adherence = useMemo(() => {
    const rows = history.data ?? [];
    if (!rows.length) return 100;
    return Math.round((rows.filter((x) => x.status === 'taken').length / rows.length) * 100);
  }, [history.data]);

  const today = stats.data ?? { taken: 0, missed: 0, pending: 0 };
  const loading = medications.isLoading || doctors.isLoading || symptoms.isLoading || history.isLoading;

  const cards = [
    { label: 'Traitements actifs', value: medications.data?.filter((m: any) => m.isActive !== false).length ?? 0, icon: Pill, detail: `${today.pending} rappel(s) en attente` },
    { label: 'Observance globale', value: `${adherence}%`, icon: Activity, detail: `${today.taken} prise(s) validée(s) aujourd’hui` },
    { label: 'Médecins', value: doctors.data?.length ?? 0, icon: Stethoscope, detail: 'Répertoire médical' },
    { label: 'Symptômes suivis', value: symptoms.data?.length ?? 0, icon: HeartPulse, detail: `${today.missed} prise(s) manquée(s)` },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-5 py-7 lg:px-8">
        <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" /> Plateforme connectée
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">Medi‑Rappel Control Center</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">Supervision des traitements, de l’observance, des symptômes et des opérations pharmacie.</p>
          </div>
          <a href="/patient/app" className="rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-950/30 transition hover:bg-emerald-400">Ouvrir l’app patient</a>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(({ label, value, detail, icon: Icon }) => (
            <Card key={label} className="border-slate-800 bg-slate-900/80 text-white shadow-2xl shadow-black/10">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div><p className="text-sm text-slate-400">{label}</p><p className="mt-2 text-3xl font-bold">{loading ? '…' : value}</p></div>
                  <div className="rounded-xl bg-emerald-400/10 p-3 text-emerald-300"><Icon className="h-5 w-5" /></div>
                </div>
                <p className="mt-4 text-xs text-slate-500">{detail}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_.65fr]">
          <Card className="border-slate-800 bg-slate-900/80 text-white">
            <CardHeader><CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-emerald-300" /> Santé & observance</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="mb-2 flex justify-between text-sm"><span className="text-slate-400">Observance historique</span><strong>{adherence}%</strong></div>
                <Progress value={adherence} className="h-2" />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <Metric label="Prises" value={today.taken} tone="ok" />
                <Metric label="En attente" value={today.pending} tone="warn" />
                <Metric label="Manquées" value={today.missed} tone="danger" />
              </div>
              <div className="overflow-hidden rounded-xl border border-slate-800">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-950/70 text-slate-400"><tr><th className="p-3">Médicament</th><th className="p-3">Dosage</th><th className="p-3">Statut</th></tr></thead>
                  <tbody>
                    {(medications.data ?? []).slice(0, 6).map((m: any) => (
                      <tr key={m.id} className="border-t border-slate-800"><td className="p-3 font-medium">{m.name}</td><td className="p-3 text-slate-400">{m.dosage || '—'}</td><td className="p-3"><Badge className="bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/10">Actif</Badge></td></tr>
                    ))}
                    {!medications.data?.length && <tr><td colSpan={3} className="p-6 text-center text-slate-500">Aucun traitement enregistré.</td></tr>}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-slate-800 bg-slate-900/80 text-white">
              <CardHeader><CardTitle className="flex items-center gap-2"><PackageCheck className="h-5 w-5 text-cyan-300" /> Pharmacie / ERP</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <Mini label="Produits" value={pharmacy.data?.totalProducts ?? '—'} icon={PackageCheck} />
                <Mini label="Stock bas" value={pharmacy.data?.lowStockProducts ?? '—'} icon={CircleAlert} />
                <Mini label="Clients" value={pharmacy.data?.totalCustomers ?? '—'} icon={Users} />
                <Mini label="Ventes jour" value={typeof pharmacy.data?.todaySales === 'number' ? number.format(pharmacy.data.todaySales) : '—'} icon={Activity} />
                {pharmacy.isError && <p className="col-span-2 mt-2 text-xs text-slate-500">Le module ERP nécessite une session pharmacie autorisée.</p>}
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-gradient-to-br from-emerald-500/15 to-cyan-500/5 text-white">
              <CardContent className="p-5">
                <p className="text-xs font-semibold uppercase tracking-[.2em] text-emerald-300">Accès rapide</p>
                <div className="mt-4 grid gap-2">
                  <a className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm hover:bg-white/10" href="/erp">ERP médical complet</a>
                  <a className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm hover:bg-white/10" href="/pharmacy">Gestion pharmacie</a>
                  <a className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm hover:bg-white/10" href="/patient/reports">Rapports patient</a>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: number; tone: 'ok' | 'warn' | 'danger' }) {
  const classes = tone === 'ok' ? 'text-emerald-300 bg-emerald-400/10' : tone === 'warn' ? 'text-amber-300 bg-amber-400/10' : 'text-rose-300 bg-rose-400/10';
  return <div className={`rounded-xl p-4 ${classes}`}><div className="text-2xl font-bold">{value}</div><div className="mt-1 text-xs opacity-80">{label}</div></div>;
}

function Mini({ label, value, icon: Icon }: { label: string; value: string | number; icon: any }) {
  return <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"><Icon className="mb-3 h-4 w-4 text-slate-400" /><div className="text-xl font-bold">{value}</div><div className="text-xs text-slate-500">{label}</div></div>;
}
