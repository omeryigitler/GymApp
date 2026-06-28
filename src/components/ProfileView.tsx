import { useMemo, useState } from 'react';
import { Activity, ArrowLeft, Dumbbell, Flame, Plus, Scale, Trash2, TrendingUp } from 'lucide-react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { useAppContext } from '../context/AppContext';
import { Measurement } from '../types';
import { generateId } from '../utils';

type MeasurementType = 'weight' | 'chest' | 'shoulders' | 'arms' | 'legs' | 'waist' | 'bodyFat';

const MEASUREMENT_LABELS: Record<MeasurementType, string> = {
  weight: 'Vücut Ağırlığı',
  chest: 'Göğüs',
  shoulders: 'Omuz',
  arms: 'Kol',
  legs: 'Bacak',
  waist: 'Bel',
  bodyFat: 'Yağ Oranı'
};

const MEASUREMENT_UNITS: Record<MeasurementType, string> = {
  weight: 'kg',
  chest: 'cm',
  shoulders: 'cm',
  arms: 'cm',
  legs: 'cm',
  waist: 'cm',
  bodyFat: '%'
};

export function ProfileView({ onBack }: { onBack: () => void }) {
  const { user, workouts, measurements, addMeasurement, deleteMeasurement, lang } = useAppContext();
  const [selectedMeasurement, setSelectedMeasurement] = useState<MeasurementType>('weight');
  const [newMeasurementValue, setNewMeasurementValue] = useState('');

  const completedSets = workouts.reduce((total, workout) => total + workout.exercises.reduce((exerciseTotal, exercise) => exerciseTotal + exercise.sets.filter(set => set.completed).length, 0), 0);
  const totalExercises = workouts.reduce((total, workout) => total + workout.exercises.length, 0);

  const chartData = useMemo(() => [...workouts].sort((a, b) => a.startTime - b.startTime).slice(-12).map(workout => {
    const volume = workout.exercises.reduce((total, exercise) => total + exercise.sets.reduce((setTotal, set) => {
      if (!set.completed || !set.weight || !set.reps) return setTotal;
      return setTotal + parseFloat(set.weight) * parseInt(set.reps, 10);
    }, 0), 0);
    return {
      name: new Date(workout.startTime).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'short' }),
      volume
    };
  }), [workouts, lang]);

  const heatmapData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from({ length: 28 }).map((_, index) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (27 - index));
      const count = workouts.filter(workout => {
        const workoutDate = new Date(workout.startTime);
        return workoutDate.getFullYear() === date.getFullYear() && workoutDate.getMonth() === date.getMonth() && workoutDate.getDate() === date.getDate();
      }).length;
      return { date, count };
    });
  }, [workouts]);

  const relevantMeasurements = [...measurements].filter(item => item[selectedMeasurement] !== undefined).sort((a, b) => b.date - a.date);
  const latestValue = relevantMeasurements.length > 0 ? relevantMeasurements[0][selectedMeasurement] : null;
  const measurementChartData = [...relevantMeasurements].reverse().map(item => ({
    name: new Date(item.date).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'short' }),
    value: item[selectedMeasurement]
  }));

  const handleAddMeasurement = () => {
    if (!newMeasurementValue || Number.isNaN(Number(newMeasurementValue))) return;
    const measurement: Measurement = {
      id: generateId(),
      date: Date.now(),
      [selectedMeasurement]: parseFloat(newMeasurementValue)
    };
    addMeasurement(measurement);
    setNewMeasurementValue('');
  };

  return (
    <div className="flex-1 flex flex-col bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.18),_transparent_36%),#020617] h-full">
      <div className="px-5 pt-8 pb-4 flex items-center justify-between sticky top-0 bg-slate-950/80 backdrop-blur-2xl z-10 border-b border-white/5">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors -ml-2 border border-white/5 bg-white/[0.02]"><ArrowLeft size={20} /></button>
        <h2 className="text-white font-black text-lg">Profil</h2>
        <div className="w-10" />
      </div>
      <div className="flex-1 overflow-y-auto hide-scrollbar px-5 py-6 space-y-6 pb-10">
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-950/45 via-slate-900/90 to-slate-950 border border-blue-500/30 rounded-[34px] p-6 shadow-[0_25px_90px_-50px_rgba(37,99,235,0.9)]">
          <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="relative flex flex-col items-center">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-40 rounded-full" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-[30px] flex items-center justify-center text-white font-black text-4xl border border-white/20 shadow-2xl">{user?.name?.charAt(0) || 'U'}</div>
            </div>
            <h1 className="text-3xl font-black text-white mb-1 tracking-tight">{user?.name}</h1>
            <p className="text-blue-300 text-xs font-black uppercase tracking-widest">LiftTrack Athlete</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gradient-to-br from-slate-900/95 to-slate-950 border border-white/10 rounded-[24px] p-4"><Activity className="text-blue-400 mb-3" size={20} /><p className="text-2xl font-black text-white">{workouts.length}</p><p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Antrenman</p></div>
          <div className="bg-gradient-to-br from-slate-900/95 to-slate-950 border border-white/10 rounded-[24px] p-4"><Dumbbell className="text-emerald-400 mb-3" size={20} /><p className="text-2xl font-black text-white">{completedSets}</p><p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Set</p></div>
          <div className="bg-gradient-to-br from-slate-900/95 to-slate-950 border border-white/10 rounded-[24px] p-4"><Flame className="text-orange-400 mb-3" size={20} /><p className="text-2xl font-black text-white">{totalExercises}</p><p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Egzersiz</p></div>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900/95 to-slate-950 border border-white/10 rounded-[28px] p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4"><div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400"><TrendingUp size={22} /></div><div><p className="text-white text-lg font-black">Hacim Grafiği</p><p className="text-slate-500 text-xs font-semibold">Son antrenmanlardaki toplam hacim.</p></div></div>
          <div className="h-56">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%"><LineChart data={chartData}><XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} /><Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff' }} /><Line type="monotone" dataKey="volume" stroke="#3b82f6" strokeWidth={3} dot={false} /></LineChart></ResponsiveContainer>
            ) : <div className="h-full flex items-center justify-center text-slate-500 text-sm font-semibold">Grafik için antrenman kaydı gerekli.</div>}
          </div>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900/95 to-slate-950 border border-white/10 rounded-[28px] p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-5"><div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400"><Activity size={22} /></div><div><p className="text-white text-lg font-black">Aktivite Grid'i</p><p className="text-slate-500 text-xs font-semibold">Son 28 gün.</p></div></div>
          <div className="grid grid-cols-7 gap-2">
            {heatmapData.map((day, index) => <div key={index} title={`${day.date.toLocaleDateString()}: ${day.count}`} className={`aspect-square rounded-lg border ${day.count > 0 ? 'bg-blue-500/80 border-blue-300/30 shadow-[0_0_18px_rgba(37,99,235,0.25)]' : 'bg-slate-800/70 border-white/5'}`} />)}
          </div>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-blue-950/35 via-slate-900/90 to-slate-950 border border-blue-500/25 rounded-[28px] p-5 shadow-[0_20px_70px_-55px_rgba(37,99,235,0.8)]">
          <div className="flex items-center gap-3 mb-5"><div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400"><Scale size={22} /></div><div><p className="text-white text-lg font-black">Ölçümler</p><p className="text-slate-500 text-xs font-semibold">Kilo, bel, kol, göğüs ve yağ oranı takibi.</p></div></div>
          <select value={selectedMeasurement} onChange={event => setSelectedMeasurement(event.target.value as MeasurementType)} className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-4 py-3 text-white font-black text-sm mb-3 focus:outline-none focus:border-blue-500/70">
            {(Object.keys(MEASUREMENT_LABELS) as MeasurementType[]).map(type => <option key={type} value={type}>{MEASUREMENT_LABELS[type]}</option>)}
          </select>
          <div className="flex gap-2 mb-5">
            <input type="number" value={newMeasurementValue} onChange={event => setNewMeasurementValue(event.target.value)} placeholder={`${MEASUREMENT_LABELS[selectedMeasurement]} (${MEASUREMENT_UNITS[selectedMeasurement]})`} className="flex-1 bg-slate-950/60 border border-white/10 rounded-2xl px-4 py-3 text-white font-bold outline-none focus:border-blue-500/70" />
            <button onClick={handleAddMeasurement} className="w-12 h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/25"><Plus size={20} /></button>
          </div>
          <div className="flex items-baseline gap-2 mb-4"><span className="text-4xl font-black text-white">{latestValue ?? '--'}</span><span className="text-slate-500 font-black">{MEASUREMENT_UNITS[selectedMeasurement]}</span></div>
          {measurementChartData.length > 1 && <div className="h-36 mb-4"><ResponsiveContainer width="100%" height="100%"><LineChart data={measurementChartData}><Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff' }} /><Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={false} /></LineChart></ResponsiveContainer></div>}
          <div className="space-y-2 border-t border-white/10 pt-4">
            {relevantMeasurements.slice(0, 5).map(item => <div key={item.id} className="flex items-center justify-between bg-slate-950/35 border border-white/5 rounded-2xl p-3"><div><p className="text-white text-sm font-black">{item[selectedMeasurement]} {MEASUREMENT_UNITS[selectedMeasurement]}</p><p className="text-slate-500 text-xs font-semibold">{new Date(item.date).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US')}</p></div><button onClick={() => deleteMeasurement(item.id)} className="w-9 h-9 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center"><Trash2 size={16} /></button></div>)}
            {relevantMeasurements.length === 0 && <p className="text-slate-500 text-sm font-semibold text-center py-3">Henüz ölçüm eklenmedi.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
