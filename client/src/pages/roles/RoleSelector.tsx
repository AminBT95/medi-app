import { Building2, ChevronRight, HeartPulse, Pill, ShieldCheck, Stethoscope } from 'lucide-react';
import { useLocation } from 'wouter';
import { AppRole, useRole } from '../../contexts/RoleContext';

const roles: Array<{ role: AppRole; title: string; eyebrow: string; description: string; icon: any; className: string }> = [
  { role: 'patient', title: 'Espace Patient', eyebrow: 'Mon suivi', description: 'Traitements, rappels, symptômes, calendrier et observance.', icon: HeartPulse, className: 'from-emerald-500 to-teal-600' },
  { role: 'doctor', title: 'Espace Médecin', eyebrow: 'Cabinet', description: 'Agenda, patients, consultations, prescriptions et suivi clinique.', icon: Stethoscope, className: 'from-sky-500 to-indigo-600' },
  { role: 'pharmacy', title: 'Espace Pharmacie', eyebrow: 'Officine', description: 'Stock, produits, ventes, clients, fournisseurs et ordonnances.', icon: Pill, className: 'from-violet-500 to-fuchsia-600' },
  { role: 'admin', title: 'Administration', eyebrow: 'Pilotage', description: 'Vue globale, supervision des modules et configuration de la plateforme.', icon: ShieldCheck, className: 'from-slate-700 to-slate-950' },
];

export default function RoleSelector() {
  const [, setLocation] = useLocation();
  const { role: currentRole, setRole, homeForRole } = useRole();

  const choose = (role: AppRole) => {
    setRole(role);
    setLocation(homeForRole(role));
  };

  return (
    <main className="min-h-screen bg-[#f5f8f7] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-200"><Pill className="h-6 w-6" /></div>
          <div>
            <p className="text-xs font-black uppercase tracking-[.22em] text-emerald-700">Medi-Rappel</p>
            <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Choisir votre espace</h1>
          </div>
        </div>

        <div className="rounded-[30px] border border-white bg-white/80 p-4 shadow-xl shadow-slate-200/60 backdrop-blur sm:p-6">
          <div className="mb-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            Cette sélection prépare l’application aux futurs comptes et permissions. Le rôle choisi reste mémorisé sur cet appareil.
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {roles.map(({ role, title, eyebrow, description, icon: Icon, className }) => {
              const active = currentRole === role;
              return (
                <button key={role} onClick={() => choose(role)} className={`group relative overflow-hidden rounded-[26px] border p-5 text-left transition hover:-translate-y-0.5 hover:shadow-xl ${active ? 'border-slate-300 bg-slate-50' : 'border-slate-100 bg-white'}`}>
                  <div className={`mb-5 flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-gradient-to-br ${className} text-white shadow-lg`}><Icon className="h-6 w-6" /></div>
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-[.2em] text-slate-400">{eyebrow}</p>
                      <h2 className="mt-1 text-xl font-black text-slate-900">{title}</h2>
                      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">{description}</p>
                    </div>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition group-hover:bg-slate-900 group-hover:text-white"><ChevronRight className="h-5 w-5" /></span>
                  </div>
                  {active && <span className="absolute right-4 top-4 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700">Actuel</span>}
                </button>
              );
            })}
          </div>
        </div>
        <div className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400"><Building2 className="h-4 w-4" /> Architecture multi-rôles prête à évoluer vers une authentification centralisée.</div>
      </div>
    </main>
  );
}
