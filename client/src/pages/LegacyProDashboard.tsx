import { useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';

export default function LegacyProDashboard() {
  const [, setLocation] = useLocation();
  const src = useMemo(() => '/pro-app.html', []);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === 'medi:navigate' && typeof event.data.path === 'string') {
        setLocation(event.data.path);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [setLocation]);

  return (
    <iframe
      src={src}
      title="MediRappel Pro"
      className="fixed inset-0 h-[100dvh] w-full border-0 bg-white"
    />
  );
}
