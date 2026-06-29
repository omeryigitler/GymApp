import { useState } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { Dashboard } from './components/Dashboard';
import { ActiveWorkout } from './components/ActiveWorkout';
import { WorkoutComplete } from './components/WorkoutComplete';
import { PaywallModal } from './components/PaywallModal';
import { AuthScreen } from './components/AuthScreen';
import { RoutineBuilder } from './components/RoutineBuilder';
import { ProfileView } from './components/ProfileView';
import { Routine, Workout } from './types';

function MainApp() {
  const { user, routines } = useAppContext();
  const [view, setView] = useState<'dashboard' | 'workout' | 'routine' | 'profile' | 'complete'>('dashboard');
  const [showPaywall, setShowPaywall] = useState(false);
  const [activeRoutine, setActiveRoutine] = useState<Routine | undefined>(undefined);
  const [completedWorkout, setCompletedWorkout] = useState<Workout | null>(null);

  if (!user) {
    return <AuthScreen />;
  }

  const closeToDashboard = () => {
    setActiveRoutine(undefined);
    setCompletedWorkout(null);
    setView('dashboard');
  };

  const showCompletedWorkout = (workout: Workout) => {
    setActiveRoutine(undefined);
    setCompletedWorkout(workout);
    setView('complete');
  };

  return (
    <div className="h-screen w-full bg-black font-sans text-[#e5e2e1] flex flex-col items-center selection:bg-[#CCFF00]/30">
      <div className="w-full max-w-md h-full flex flex-col relative overflow-hidden shadow-2xl border-x border-white/5 bg-[#131313]">
        {view === 'dashboard' ? (
          <Dashboard
            onStartEmpty={() => {
              setActiveRoutine(undefined);
              setCompletedWorkout(null);
              setView('workout');
            }}
            onStartRoutine={(id) => {
              const routine = routines.find(item => item.id === id);
              if (!routine) return;
              setActiveRoutine(routine);
              setCompletedWorkout(null);
              setView('workout');
            }}
            onCreateRoutine={() => {
              setActiveRoutine(undefined);
              setCompletedWorkout(null);
              setView('routine');
            }}
            onEditRoutine={(id) => {
              const routine = routines.find(item => item.id === id);
              if (!routine) return;
              setActiveRoutine(routine);
              setCompletedWorkout(null);
              setView('routine');
            }}
            onShowPaywall={() => setShowPaywall(true)}
            onOpenProfile={() => setView('profile')}
          />
        ) : view === 'workout' ? (
          <ActiveWorkout
            routine={activeRoutine}
            onFinish={showCompletedWorkout}
            onCancel={closeToDashboard}
          />
        ) : view === 'complete' && completedWorkout ? (
          <WorkoutComplete workout={completedWorkout} onBack={closeToDashboard} />
        ) : view === 'routine' ? (
          <RoutineBuilder
            routineToEdit={activeRoutine}
            onClose={closeToDashboard}
          />
        ) : view === 'profile' ? (
          <ProfileView onBack={closeToDashboard} />
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
