import React, { createContext, useContext, useEffect, useState } from 'react';
import { Language, Measurement, Routine, User, Workout } from '../types';

interface AppState {
  workouts: Workout[];
  routines: Routine[];
  measurements: Measurement[];
  isPremium: boolean;
  user: User | null;
  lang: Language;
  addWorkout: (w: Workout) => void;
  deleteWorkout: (id: string) => void;
  addRoutine: (r: Routine) => boolean;
  updateRoutine: (r: Routine) => void;
  deleteRoutine: (id: string) => void;
  addMeasurement: (m: Measurement) => void;
  deleteMeasurement: (id: string) => void;
  setPremium: (val: boolean) => void;
  login: () => void;
  logout: () => void;
  setLang: (l: Language) => void;
}

const AppContext = createContext<AppState | null>(null);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [isPremium, setIsPremium] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [lang, setLang] = useState<Language>('tr');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem('lifttrack_data_v2');
    if (data) {
      try {
        const parsed = JSON.parse(data) as Partial<AppState>;
        setWorkouts(parsed.workouts || []);
        setRoutines(parsed.routines || []);
        setMeasurements(parsed.measurements || []);
        setIsPremium(!!parsed.isPremium);
        setUser(parsed.user || null);
        setLang(parsed.lang || 'tr');
      } catch (e) {
        console.error('Failed to load data', e);
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem('lifttrack_data_v2', JSON.stringify({ workouts, routines, measurements, isPremium, user, lang }));
    }
  }, [workouts, routines, measurements, isPremium, user, lang, loaded]);

  const addWorkout = (w: Workout) => setWorkouts(prev => [w, ...prev]);
  const deleteWorkout = (id: string) => setWorkouts(prev => prev.filter(x => x.id !== id));
  const addRoutine = (r: Routine) => {
    if (!isPremium && routines.length >= 2) return false;
    setRoutines(prev => [...prev, r]);
    return true;
  };
  const updateRoutine = (r: Routine) => setRoutines(prev => prev.map(x => x.id === r.id ? r : x));
  const deleteRoutine = (id: string) => setRoutines(prev => prev.filter(x => x.id !== id));
  const addMeasurement = (m: Measurement) => setMeasurements(prev => [...prev, m]);
  const deleteMeasurement = (id: string) => setMeasurements(prev => prev.filter(x => x.id !== id));
  const setPremium = (val: boolean) => setIsPremium(val);
  const login = () => setUser({ id: '1', name: 'User' });
  const logout = () => setUser(null);

  if (!loaded) return null;

  return (
    <AppContext.Provider value={{ workouts, routines, measurements, isPremium, user, lang, addWorkout, deleteWorkout, addRoutine, updateRoutine, deleteRoutine, addMeasurement, deleteMeasurement, setPremium, login, logout, setLang }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('Missing AppProvider');
  return ctx;
};
