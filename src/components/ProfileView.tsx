import { useMemo, useState } from 'react';
import { Activity, ArrowLeft, Bell, BellOff, Droplets, Dumbbell, Flame, Minus, Plus, Scale, Trash2, TrendingUp } from 'lucide-react';
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
  const { user, workouts, measurements, addMeasurement, deleteMeasurement, lang, hydrationToday, waterGoal, addWater, removeWater, setWaterGoal } = useAppContext();
  const [selectedMeasurement, setSelectedMeasurement] = useState<MeasurementType>('weight');
  const [newMeasurementValue, setNewMeasurementValue] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(true);

  const completedSets = workouts.reduce((total, workout) => total + workout.exercises.reduce((exerciseTotal, exercise) => exerciseTotal + exercise.sets.filter(set => set.completed).length, 0), 0);
  const totalExercises = workouts.reduce((total, workout) => total + workout.exercises.length, 0);
  const waterPercent = Math.min(100, Math.round((hydrationToday / waterGoal) * 100));

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

  const weeklyBars = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }).map((_, index) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - index));
      const count = workouts.filter(workout => {
        const workoutDate = new Date(workout.startTime);
        return workoutDate.getFullYear() === date.getFullYear() && workoutDate.getMonth() === date.getMonth() && workoutDate.getDate() === date.getDate();
      }).length;
      return { date, count, day: date.toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', { weekday: 'short' }).slice(0, 2) };
    });
  }, [workouts, lang]);

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
    <div className="flex-1 flex flex-col bg-[#131313] text-[#e5e2e1] h-full">
      <div className="px-5 h-16 flex items-center justify-between sticky top-0 bg-[#131313]/85 backdrop-blur-2xl z-10 border-b border-white/10">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center text-[#c4c9ac] hover:text-white hover:bg-white/5 rounded-full transition-colors -ml-2 border border-white/10 bg-[#1C1C1E]"><ArrowLeft size={20} /></button>
        <h2 className="font-display text-white font-black text-lg tracking-[-0.04em]">PROFILE</h2>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar px-5 py-6 space-y-6 pb-10">
        <section className="relative overflow-hidden bg-[#1C1C1E] border border-white/10 rounded-3xl p-6">
          <div className="pointer-events-none absolute -top-20 -right-20 w-56 h-56 rounded-full bg-[#CCFF00]/10 blur-3xl" />
          <div className="relative flex items-center gap-4">
            <div className="w-20 h-20 bg-[#CCFF00] rounded-full flex items-center justify-center text-[#131313] font-black text-3xl kinetic-glow-lime">{user?.name?.charAt(0) || 'U'}</div>
            <div className="min-w-0">
              <h1 className="font-display text-3xl font-black text-white tracking-[-0.05em] truncate">{user?.name}</h1>
              <p className="text-[#CCFF00] text-xs font-black uppercase tracking-widest mt-1">FLOW STATE ATHLETE</p>
              <p className="text-[#c4c9ac] text-sm font-semibold mt-2">Momentum, hacim ve rutin takibi.</p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-3 gap-3">
          <MetricTile icon={<Activity size={20} />} label="Antrenman" value={String(workouts.length)} accent="text-[#CCFF00]" />
          <MetricTile icon={<Dumbbell size={20} />} label="Set" value={String(completedSets)} accent="text-[#0070F3]" />
          <MetricTile icon={<Flame size={20} />} label="Egzersiz" value={String(totalExercises)} accent="text-[#FF4D00]" />
        </section>

        <section className="relative overflow-hidden bg-[#1C1C1E] border border-white/10 rounded-3xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#0070F3]/10 border border-[#0070F3]/30 flex items-center justify-center text-[#0070F3]"><Droplets size={24} /></div>
              <div>
                <p className="font-display text-white text-xl font-black tracking-[-0.04em]">Su Tüketimi</p>
                <p className="text-[#c4c9ac] text-xs font-semibold">Bugünkü hedef: {waterGoal} bardak</p>
              </div>
            </div>
            <div className="text-right"><p className="text-[#0070F3] text-3xl font-black leading-none">{hydrationToday}</p><p className="text-[10px] text-[#c4c9ac] font-black uppercase tracking-widest">bardak</p></div>
          </div>

          <div className="h-3 bg-white/5 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-[#0070F3] rounded-full kinetic-glow-blue transition-all" style={{ width: `${waterPercent}%` }} />
          </div>

          <div className="grid grid-cols-8 gap-1.5 mb-4">
            {Array.from({ length: waterGoal }).map((_, index) => (
              <div key={index} className={`aspect-square rounded-xl border flex items-center justify-center ${index < hydrationToday ? 'bg-[#0070F3]/25 border-[#0070F3]/50 text-[#0070F3]' : 'bg-white/5 border-white/10 text-[#353534]'}`}>
                <Droplets size={14} />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-[44px_1fr_44px] gap-2 mb-3">
            <button onClick={removeWater} className="h-11 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center active:scale-95"><Minus size={18} /></button>
            <button onClick={addWater} className="h-11 rounded-full bg-[#0070F3] text-white font-black active:scale-95 kinetic-glow-blue">Su İçtim</button>
            <button onClick={() => setWaterGoal(waterGoal + 1)} className="h-11 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center active:scale-95"><Plus size={18} /></button>
          </div>

          <button onClick={() => setReminderEnabled(prev => !prev)} className="w-full flex items-center justify-between bg-[#201f1f] border border-white/10 rounded-2xl p-3">
            <span className="flex items-center gap-2 text-sm font-black text-white">{reminderEnabled ? <Bell size={16} className="text-[#CCFF00]" /> : <BellOff size={16} className="text-[#c4c9ac]" />} Su İçme Hatırlatıcısı</span>
            <span className={`w-12 h-7 rounded-full p-1 transition-colors ${reminderEnabled ? 'bg-[#CCFF00]' : 'bg-white/10'}`}><span className={`block w-5 h-5 rounded-full bg-[#131313] transition-transform ${reminderEnabled ? 'translate-x-5' : ''}`} /></span>
          </button>
        </section>

        <section className="bg-[#1C1C1E] border border-white/10 rounded-3xl p-5">
          <div className="flex items-center gap-3 mb-5"><div className="w-12 h-12 rounded-2xl bg-[#CCFF00]/10 border border-[#CCFF00]/25 flex items-center justify-center text-[#CCFF00]"><TrendingUp size={22} /></div><div><p className="font-display text-white text-xl font-black tracking-[-0.04em]">Haftalık Aktivite</p><p className="text-[#c4c9ac] text-xs font-semibold">Son 7 gün antrenman frekansı.</p></div></div>
          <div className="grid grid-cols-7 gap-2 items-end h-36">
            {weeklyBars.map((day, index) => {
              const height = Math.max(10, day.count * 34);
              return <div key={index} className="flex flex-col items-center gap-2"><div className="w-full rounded-t-xl bg-[#CCFF00] kinetic-glow-lime" style={{ height: `${height}px`, opacity: day.count > 0 ? 1 : 0.12 }} /><span className="text-[10px] text-[#c4c9ac] font-black uppercase">{day.day}</span></div>;
            })}
          </div>
        </section>

        <section className="bg-[#1C1C1E] border border-white/10 rounded-3xl p-5">
          <div className="flex items-center gap-3 mb-4"><div className="w-12 h-12 rounded-2xl bg-[#0070F3]/10 border border-[#0070F3]/30 flex items-center justify-center text-[#0070F3]"><TrendingUp size={22} /></div><div><p className="font-display text-white text-xl font-black tracking-[-0.04em]">Hacim Grafiği</p><p className="text-[#c4c9ac] text-xs font-semibold">Son antrenmanlardaki toplam hacim.</p></div></div>
          <div className="h-56">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%"><LineChart data={chartData}><XAxis dataKey="name" stroke="#8e9379" fontSize={10} tickLine={false} axisLine={false} /><Tooltip contentStyle={{ backgroundColor: '#1C1C1E', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff' }} /><Line type="monotone" dataKey="volume" stroke="#CCFF00" strokeWidth={3} dot={false} /></LineChart></ResponsiveContainer>
            ) : <div className="h-full flex items-center justify-center text-[#c4c9ac] text-sm font-semibold">Grafik için antrenman kaydı gerekli.</div>}
          </div>
        </section>

        <section className="bg-[#1C1C1E] border border-white/10 rounded-3xl p-5">
          <div className="flex items-center gap-3 mb-5"><div className="w-12 h-12 rounded-2xl bg-[#CCFF00]/10 border border-[#CCFF00]/25 flex items-center justify-center text-[#CCFF00]"><Scale size={22} /></div><div><p className="font-display text-white text-xl font-black tracking-[-0.04em]">Ölçümler</p><p className="text-[#c4c9ac] text-xs font-semibold">Kilo, bel, kol, göğüs ve yağ oranı takibi.</p></div></div>
          <select value={selectedMeasurement} onChange={event => setSelectedMeasurement(event.target.value as MeasurementType)} className="w-full bg-[#2a2a2a] border border-white/10 rounded-2xl px-4 py-3 text-white font-black text-sm mb-3 focus:outline-none focus:border-[#CCFF00]">
            {(Object.keys(MEASUREMENT_LABELS) as MeasurementType[]).map(type => <option key={type} value={type}>{MEASUREMENT_LABELS[type]}</option>)}
          </select>
          <div className="flex gap-2 mb-5">
            <input type="number" value={newMeasurementValue} onChange={event => setNewMeasurementValue(event.target.value)} placeholder={`${MEASUREMENT_LABELS[selectedMeasurement]} (${MEASUREMENT_UNITS[selectedMeasurement]})`} className="flex-1 bg-[#2a2a2a] border border-white/10 rounded-2xl px-4 py-3 text-white font-bold outline-none focus:border-[#CCFF00]" />
            <button onClick={handleAddMeasurement} className="w-12 h-12 bg-[#CCFF00] text-[#131313] rounded-2xl flex items-center justify-center kinetic-glow-lime"><Plus size={20} /></button>
          </div>
          <div className="flex items-baseline gap-2 mb-4"><span className="font-display text-4xl font-black text-white">{latestValue ?? '--'}</span><span className="text-[#c4c9ac] font-black">{MEASUREMENT_UNITS[selectedMeasurement]}</span></div>
          {measurementChartData.length > 1 && <div className="h-36 mb-4"><ResponsiveContainer width="100%" height="100%"><LineChart data={measurementChartData}><Tooltip contentStyle={{ backgroundColor: '#1C1C1E', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff' }} /><Line type="monotone" dataKey="value" stroke="#0070F3" strokeWidth={3} dot={false} /></LineChart></ResponsiveContainer></div>}
          <div className="space-y-2 border-t border-white/10 pt-4">
            {relevantMeasurements.slice(0, 5).map(item => <div key={item.id} className="flex items-center justify-between bg-[#201f1f] border border-white/10 rounded-2xl p-3"><div><p className="text-white text-sm font-black">{item[selectedMeasurement]} {MEASUREMENT_UNITS[selectedMeasurement]}</p><p className="text-[#c4c9ac] text-xs font-semibold">{new Date(item.date).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US')}</p></div><button onClick={() => deleteMeasurement(item.id)} className="w-9 h-9 rounded-xl text-[#c4c9ac] hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center"><Trash2 size={16} /></button></div>)}
            {relevantMeasurements.length === 0 && <p className="text-[#c4c9ac] text-sm font-semibold text-center py-3">Henüz ölçüm eklenmedi.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}

function MetricTile({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: string }) {
  return (
    <div className="bg-[#1C1C1E] border border-white/10 rounded-3xl p-4">
      <div className={`${accent} mb-3`}>{icon}</div>
      <p className="font-display text-2xl font-black text-white leading-none truncate">{value}</p>
      <p className="text-[#c4c9ac] text-[10px] font-black uppercase tracking-widest mt-2">{label}</p>
    </div>
  );
}
