import { useQuery } from '@tanstack/react-query';
import { Activity, Boxes, ChevronRight, CircleAlert, PackageCheck, Pill, ReceiptText, ShoppingCart, Truck, Users } from 'lucide-react';
import { useLocation } from 'wouter';

type PharmacyDashboard = { totalProducts?: number; lowStockProducts?: number; totalCustomers?: number; todaySales?: number };

export default function PharmacyPortal() {
  const [, setLocation] = useLocation();
  const dashboard = useQuery<PharmacyDashboard>({ queryKey: ['/api/pharmacy/dashboard'], retry: false });
  const data = dashboard.data ?? {};
  return (
    <main className="min-h-screen bg-[#f8f7fc] text-slate-900">
      <header className="border-b border-violet-100 bg-white px-5 py-5"><div className="mx-auto flex max-w-6xl items-center justify-between gap-4"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-200"><Pill className="h-5 w-5" /></div><div><p className="text-xs font-black uppercase tracking-[.18em] text-violet-600">Espace pharmacie</p><h1 className="text-xl font-black">Officine & ERP</h1></div></div><button onClick={() => setLocation('/roles')} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600">Changer d’espace</button></div></header>
      <div className="mx-auto max-w-6xl px-5 py-7">
        <section className="rounded-[28px] bg-gradient-to-br from-violet-600 to-fuchsia-700 p-6 text-white shadow-xl shadow-violet-200/60"><p className="text-sm font-semibold text-violet-100">Pilotage officine</p><h2 className="mt-1 text-3xl font-black">Votre pharmacie en un coup d’œil</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-violet-100">Stock, produits, clients, ventes et fournisseurs dans un espace distinct du suivi patient.</p>{dashboard.isError && <div className="mt-5 rounded-2xl border border-white/20 bg-white/10 p-4 text-sm">Connectez un compte pharmacie autorisé pour charger les données ERP privées.</div>}</section>
        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={PackageCheck} label="Produits" value={data.totalProducts ?? '—'} /><Metric icon={CircleAlert} label="Stock bas" value={data.lowStockProducts ?? '—'} /><Metric icon={Users} label="Clients" value={data.totalCustomers ?? '—'} /><Metric icon={Activity} label="Ventes du jour" value={data.todaySales ?? '—'} /></section>
        <section className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3"><Action icon={Boxes} title="Inventaire" text="Stocks, lots et dates d’expiration" /><Action icon={ShoppingCart} title="Ventes" text="Encaissement et historique" /><Action icon={ReceiptText} title="Ordonnances" text="Préparation et délivrance" /><Action icon={Users} title="Clients" text="Profils et historique d’achats" /><Action icon={Truck} title="Fournisseurs" text="Commandes et approvisionnement" /><Action icon={Activity} title="Analytique" text="Performance et alertes opérationnelles" /></section>
      </div>
    </main>
  );
}
function Metric({ icon: Icon, label, value }: any) { return <div className="rounded-[22px] border border-violet-100 bg-white p-5 shadow-sm"><div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50 text-violet-600"><Icon className="h-5 w-5" /></div><div className="text-3xl font-black">{value}</div><div className="mt-1 text-sm font-semibold text-slate-500">{label}</div></div>; }
function Action({ icon: Icon, title, text }: any) { return <button className="group flex items-center gap-4 rounded-[22px] border border-violet-100 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600"><Icon className="h-5 w-5" /></span><span className="flex-1"><strong className="block">{title}</strong><span className="mt-1 block text-xs text-slate-500">{text}</span></span><ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-violet-600" /></button>; }
