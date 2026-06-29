import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Language, Measurement, Routine, User, Workout } from '../types';

type WaterLog = Record<string, number>;
type WaterReminderFrequency = 'hourly' | 'twoHours' | 'threeHours';

interface WaterReminderSettings {
  enabled: boolean;
  frequency: WaterReminderFrequency;
  startTime: string;
  endTime: string;
}

interface AppState {
  workouts: Workout[];
  routines: Routine[];
  measurements: Measurement[];
  isPremium: boolean;
  user: User | null;
  lang: Language;
  waterLog: WaterLog;
  waterGoal: number;
  hydrationToday: number;
  waterReminder: WaterReminderSettings;
  setWaterReminder: (settings: WaterReminderSettings) => void;
  addWater: () => void;
  removeWater: () => void;
  setWaterGoal: (goal: number) => void;
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
const todayKey = () => new Date().toISOString().slice(0, 10);
const defaultWaterReminder: WaterReminderSettings = { enabled: true, frequency: 'twoHours', startTime: '08:00', endTime: '22:00' };

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [isPremium, setIsPremium] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [lang, setLang] = useState<Language>('tr');
  const [waterLog, setWaterLog] = useState<WaterLog>({});
  const [waterGoal, setHydrationGoal] = useState(8);
  const [waterReminder, setWaterReminder] = useState<WaterReminderSettings>(defaultWaterReminder);
  const [loaded, setLoaded] = useState(false);

  const hydrationToday = useMemo(() => waterLog[todayKey()] || 0, [waterLog]);

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
        setWaterLog(parsed.waterLog || {});
        setHydrationGoal(parsed.waterGoal || 8);
        setWaterReminder(parsed.waterReminder || defaultWaterReminder);
      } catch (e) {
        console.error('Failed to load data', e);
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem('lifttrack_data_v2', JSON.stringify({ workouts, routines, measurements, isPremium, user, lang, waterLog, waterGoal, waterReminder }));
    }
  }, [workouts, routines, measurements, isPremium, user, lang, waterLog, waterGoal, waterReminder, loaded]);

  const addWater = () => setWaterLog(prev => ({ ...prev, [todayKey()]: Math.min((prev[todayKey()] || 0) + 1, 30) }));
  const removeWater = () => setWaterLog(prev => ({ ...prev, [todayKey()]: Math.max((prev[todayKey()] || 0) - 1, 0) }));
  const setWaterGoal = (goal: number) => setHydrationGoal(Math.max(1, Math.min(goal, 30)));
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
    <AppContext.Provider value={{ workouts, routines, measurements, isPremium, user, lang, waterLog, waterGoal, hydrationToday, waterReminder, setWaterReminder, addWater, removeWater, setWaterGoal, addWorkout, deleteWorkout, addRoutine, updateRoutine, deleteRoutine, addMeasurement, deleteMeasurement, setPremium, login, logout, setLang }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('Missing AppProvider');
  return ctx;
};
