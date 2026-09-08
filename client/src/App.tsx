import { QueryClientProvider } from '@tanstack/react-query';
import { Redirect, Route, Switch } from 'wouter';
import { LanguageProvider } from './contexts/LanguageContext';
import { RoleProvider } from './contexts/RoleContext';
import { queryClient } from './lib/queryClient';
import Layout from './components/Layout';
import Home from './pages/Home';
import AddMedication from './pages/AddMedication';
import Calendar from './pages/Calendar';
import History from './pages/History';
import Reports from './pages/Reports';
import AddSymptom from './pages/AddSymptom';
import AddDoctor from './pages/AddDoctor';
import Dashboard from './pages/Dashboard';
import LegacyPatientHome from './pages/LegacyPatientHome';
import LegacyProDashboard from './pages/LegacyProDashboard';
import DoctorPortal from './pages/roles/DoctorPortal';
import PharmacyPortal from './pages/roles/PharmacyPortal';
import NotFound from './pages/not-found';
import { Toaster } from './components/ui/toaster';
import './index.css';

function PatientRoutes() {
  return (
    <Layout>
      <Switch>
        <Route path="/patient/app" component={LegacyPatientHome} />
        <Route path="/patient/add" component={AddMedication} />
        <Route path="/patient/calendar" component={Calendar} />
        <Route path="/patient/history" component={History} />
        <Route path="/patient/reports" component={Reports} />
        <Route path="/patient/add-symptom" component={AddSymptom} />
        <Route path="/patient/add-doctor" component={AddDoctor} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function Router() {
  const path = window.location.pathname;

  if (path.startsWith('/patient/')) return <PatientRoutes />;
  if (path === '/doctor' || path.startsWith('/doctor/')) return <DoctorPortal />;
  if (path === '/pharmacy' || path.startsWith('/pharmacy/')) return <PharmacyPortal />;
  if (path === '/dashboard' || path.startsWith('/dashboard/')) return <Dashboard />;
  if (path === '/pro' || path.startsWith('/pro/')) return <LegacyProDashboard />;

  return (
    <Switch>
      <Route path="/" component={LegacyPatientHome} />
      <Route path="/roles">{() => <Redirect to="/pro" />}</Route>

      {/* /app is the original Replit patient application requested as the mobile home */}
      <Route path="/app" component={LegacyPatientHome} />
      <Route path="/add">{() => <Redirect to="/patient/add" />}</Route>
      <Route path="/calendar">{() => <Redirect to="/patient/calendar" />}</Route>
      <Route path="/history">{() => <Redirect to="/patient/history" />}</Route>
      <Route path="/reports">{() => <Redirect to="/patient/reports" />}</Route>
      <Route path="/add-symptom">{() => <Redirect to="/patient/add-symptom" />}</Route>
      <Route path="/add-doctor">{() => <Redirect to="/patient/add-doctor" />}</Route>
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <RoleProvider>
          <Router />
          <Toaster />
        </RoleProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
