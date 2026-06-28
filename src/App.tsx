import { useState } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { Dashboard } from './components/Dashboard';
import { ActiveWorkout } from './components/ActiveWorkout';
import { PaywallModal } from './components/PaywallModal';
import { AuthScreen } from './components/AuthScreen';
import { RoutineBuilder } from './components/RoutineBuilder';
import { ProfileView } from './components/ProfileView';
import { Routine } from './types';

function MainApp() {
  const { user, routines } = useAppContext();
  const [view, setView] = useState<'dashboard' | 'workout' | 'routine' | 'profile'>('dashboard');
  const [showPaywall, setShowPaywall] = useState(false);
  const [activeRoutine, setActiveRoutine] = useState<Routine | undefined>(undefined);

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="h-screen w-full bg-slate-950 font-sans text-slate-200 flex flex-col items-center selection:bg-blue-500/30">
      <div className="w-full max-w-md h-full flex flex-col relative overflow-hidden shadow-2xl border-x border-slate-900/50 bg-slate-950">
        {view === 'dashboard' ? (
          <Dashboard
            onStartEmpty={() => { setActiveRoutine(undefined); setView('workout'); }}
            onStartRoutine={(id) => {
              const r = routines.find(x => x.id === id);
              setActiveRoutine(r);
              setView('workout');
            }}
            onCreateRoutine={() => { setActiveRoutine(undefined); setView('routine'); }}
            onEditRoutine={(id) => {
              const r = routines.find(x => x.id === id);
              setActiveRoutine(r);
              setView('routine');
            }}
            onShowPaywall={() => setShowPaywall(true)}
            onOpenProfile={() => setView('profile')}
          />
        ) : view === 'workout' ? (
          <ActiveWorkout
            routine={activeRoutine}
            onFinish={() => setView('dashboard')}
            onCancel={() => setView('dashboard')}
          />
        ) : view === 'routine' ? (
          <RoutineBuilder
            routineToEdit={activeRoutine}
            onClose={() => setView('dashboard')}
          />
        ) : view === 'profile' ? (
          <ProfileView onBack={() => setView('dashboard')} />
        ) : null}

        {showPaywall && (
          <PaywallModal onClose={() => setShowPaywall(false)} />
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
