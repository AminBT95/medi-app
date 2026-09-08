import { QueryClientProvider } from '@tanstack/react-query';
import { Redirect, Route, Switch } from 'wouter';
import { LanguageProvider } from './contexts/LanguageContext';
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
import NotFound from './pages/not-found';
import { Toaster } from './components/ui/toaster';
import './index.css';

function MobileRoutes() {
  return (
    <Layout>
      <Switch>
        <Route path="/">{() => <Redirect to="/app" />}</Route>
        <Route path="/app" component={Home} />
        <Route path="/add" component={AddMedication} />
        <Route path="/calendar" component={Calendar} />
        <Route path="/history" component={History} />
        <Route path="/reports" component={Reports} />
        <Route path="/add-symptom" component={AddSymptom} />
        <Route path="/add-doctor" component={AddDoctor} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

export default function App() {
  const isDashboard = window.location.pathname.startsWith('/dashboard');
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        {isDashboard ? <Dashboard /> : <MobileRoutes />}
        <Toaster />
      </LanguageProvider>
    </QueryClientProvider>
  );
}
