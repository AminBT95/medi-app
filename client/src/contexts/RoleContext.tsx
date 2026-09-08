import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type AppRole = 'patient' | 'doctor' | 'pharmacy' | 'admin';

type RoleContextValue = {
  role: AppRole;
  setRole: (role: AppRole) => void;
  homeForRole: (role?: AppRole) => string;
};

const STORAGE_KEY = 'medi-rappel-role';
const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<AppRole>(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
    return saved === 'doctor' || saved === 'pharmacy' || saved === 'admin' || saved === 'patient' ? saved : 'patient';
  });

  const setRole = (next: AppRole) => {
    setRoleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  useEffect(() => {
    document.documentElement.dataset.mediRole = role;
  }, [role]);

  const value = useMemo<RoleContextValue>(() => ({
    role,
    setRole,
    homeForRole: (target = role) => target === 'patient' ? '/patient/app' : target === 'doctor' ? '/doctor' : target === 'pharmacy' ? '/pharmacy' : '/dashboard',
  }), [role]);

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) throw new Error('useRole must be used inside RoleProvider');
  return context;
}
