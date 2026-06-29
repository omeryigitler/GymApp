import { useMemo, useState, type ReactNode } from 'react';
import { ArrowRight, Droplets, Dumbbell, Flame, Grid3X3, Layers3, Lock, Minus, Plus, Ruler, Settings, Target, Trophy, User, Zap } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export function ProfileView({ onBack }: { onBack: () => void }) {
  const { user, workouts, hydrationToday, waterGoal, addWater, removeWater, setWaterGoal, lang } = useAppContext();
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderFrequency, setReminderFrequency] = useState<'hourly' | 'twoHours' | 'threeHours'>('twoHours');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('22:00');

  const totalWorkouts = workouts.length;
  const totalMinutes = workouts.reduce((total, workout) => total + (workout.endTime ? Math.round((workout.endTime - workout.startTime) / 60000) : 0), 0);
  const totalHours = Math.round(totalMinutes / 60);
  const currentStreak = useMemo(() => calculateStreak(workouts.map(workout => workout.startTime)), [workouts]);
  const waterLiters = hydrationToday * 0.25;
  const waterGoalLiters = waterGoal * 0.25;
  const waterPercent = Math.min(100, Math.round((hydrationToday / waterGoal) * 100));
  const weeklyBars = useMemo(() => makeWeeklyBars(workouts, lang), [workouts, lang]);
  const recentWorkouts = workouts.slice(0, 2);

  return (
    <div className="flex-1 flex flex-col bg-[#f8faef] text-[#171717] h-full overflow-hidden">
      <header className="h-16 shrink-0 bg-[#3f3f3f] text-[#CCFF00] flex items-center justify-between px-5 border-b border-black/10">
        <button onClick={onBack} className="flex items-center gap-3 active:scale-95 transition-transform">
          <div className="w-9 h-9 rounded-full overflow-hidden border border-[#CCFF00]/40 bg-[#1C1C1E] flex items-center justify-center text-[#CCFF00] font-black">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <span className="font-display text-lg font-black tracking-[-0.06em]">FLOW STATE</span>
        </button>
        <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all">
          <Settings size={20} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto hide-scrollbar pb-28">
        <section className="mx-4 mt-6 rounded-[10px] bg-[#fbfff4] min-h-[268px] flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(204,255,0,0.12),transparent_48%)]" />
          <div className="relative mt-2 w-24 h-24 rounded-full border-2 border-[#CCFF00] p-1 shadow-[0_0_18px_rgba(204,255,0,0.35)] bg-[#151515]">
            <div className="w-full h-full rounded-full bg-[radial-gradient(circle_at_50%_20%,#777,#1b1b1b_42%,#050505)] flex items-center justify-center text-[#CCFF00] font-display font-black text-3xl">
              {user?.name?.charAt(0) || 'U'}
            </div>
          </div>
          <div className="relative mt-7 flex items-center gap-2 text-[#bdc1a7] text-xs font-semibold">
            <Flame size={14} className="text-[#CCFF00]" /> Elite Member
          </div>
          <div className="relative mt-3 flex items-center gap-3">
            <button className="px-5 py-2 rounded-full bg-[#CCFF00] text-[#111] text-sm font-semibold shadow-[0_0_16px_rgba(204,255,0,0.28)]">Edit Profile</button>
            <button className="px-5 py-2 rounded-full bg-white/70 text-white text-sm font-semibold opacity-50">Share</button>
          </div>
          <div className="relative w-full grid grid-cols-3 gap-2 mt-8 px-7 pb-5 text-center">
            <ProfileStat label="WORKOUTS" value={String(totalWorkouts || 0)} />
            <ProfileStat label="STREAK" value={`${currentStreak || 0}d`} highlight />
            <ProfileStat label="HOURS" value={String(totalHours || 0)} />
          </div>
        </section>

        <section className="px-7 mt-8">
          <div className="flex justify-end mb-4">
            <button className="bg-[#1C1C1E] text-white text-xs px-3 py-2 rounded-[4px] shadow-lg">This Week</button>
          </div>
          <div className="h-44 flex items-end justify-between gap-3">
            {weeklyBars.map((bar, index) => (
              <div key={bar.label} className="flex-1 flex flex-col items-center gap-3">
                <div className={`w-full max-w-[28px] rounded-t-sm ${index === 3 ? 'bg-[#CCFF00] shadow-[0_0_18px_rgba(204,255,0,0.35)]' : 'bg-[#c8dcf5]'}`} style={{ height: `${bar.height}px` }} />
                <span className={`text-xs ${index === 3 ? 'text-[#CCFF00]' : 'text-[#bdc1a7]'}`}>{bar.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="px-8 mt-14">
          <div className="flex justify-end gap-2 mb-6">
            <button onClick={removeWater} className="w-8 h-8 rounded-full bg-[#1C1C1E] text-white flex items-center justify-center border border-black/10 active:scale-95"><Minus size={17} /></button>
            <button onClick={addWater} className="w-8 h-8 rounded-full bg-[#1C1C1E] text-[#CCFF00] flex items-center justify-center border border-black/10 active:scale-95"><Plus size={17} /></button>
          </div>
          <div className="flex justify-between items-end mb-2 text-sm">
            <span className="text-[#0070F3] font-medium">{waterLiters.toFixed(1)}L</span>
            <span className="text-[#bdc1a7]">Hedef: {waterGoalLiters.toFixed(1)}L</span>
          </div>
          <div className="h-3 bg-[#171717] rounded-full overflow-hidden">
            <div className="h-full bg-[#0070F3] rounded-full transition-all" style={{ width: `${waterPercent}%` }} />
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex gap-1">
              {Array.from({ length: Math.min(waterGoal, 12) }).map((_, index) => (
                <Droplets key={index} size={16} className={index < hydrationToday ? 'text-[#0070F3]' : 'text-[#d9dec9]'} />
              ))}
            </div>
            <span className="text-[#bdc1a7] text-sm">{waterPercent}% Tamamlandı</span>
          </div>
        </section>

        <section className="px-8 mt-16 space-y-4">
          <div className="flex items-center justify-end">
            <button onClick={() => setReminderEnabled(prev => !prev)} className={`w-12 h-7 rounded-full p-1 transition-colors ${reminderEnabled ? 'bg-[#CCFF00]' : 'bg-[#d9dec9]'}`}>
              <span className={`block w-5 h-5 rounded-full bg-[#1C1C1E] transition-transform ${reminderEnabled ? 'translate-x-5' : ''}`} />
            </button>
          </div>
          <div className="grid grid-cols-[70px_1fr] gap-4 items-center">
            <span className="text-[#bdc1a7] text-sm leading-tight">Hatırlatma<br/>Sıklığı</span>
            <div className="grid grid-cols-3 gap-2">
              <ReminderButton active={reminderFrequency === 'hourly'} onClick={() => setReminderFrequency('hourly')}>Her saat</ReminderButton>
              <ReminderButton active={reminderFrequency === 'twoHours'} onClick={() => setReminderFrequency('twoHours')} lime>Her 2 saat</ReminderButton>
              <ReminderButton active={reminderFrequency === 'threeHours'} onClick={() => setReminderFrequency('threeHours')}>Her 3 saat</ReminderButton>
            </div>
          </div>
          <div className="grid grid-cols-[70px_1fr] gap-4 items-center">
            <span className="text-[#bdc1a7] text-sm leading-tight">Zaman Aralığı</span>
            <div className="flex gap-3 justify-end">
              <input value={startTime} onChange={event => setStartTime(event.target.value)} className="w-[74px] bg-[#1C1C1E] text-white text-center rounded-[4px] py-1.5 text-sm border border-black/20 outline-none" />
              <input value={endTime} onChange={event => setEndTime(event.target.value)} className="w-[74px] bg-[#1C1C1E] text-white text-center rounded-[4px] py-1.5 text-sm border border-black/20 outline-none" />
            </div>
          </div>
        </section>

        <section className="px-8 mt-16 space-y-3">
          {recentWorkouts.length === 0 ? (
            <ActivityCard icon={<Dumbbell size={20} />} title="Upper Body Power" meta="Today • 45 mins • 12,400 lbs" color="blue" />
          ) : recentWorkouts.map((workout, index) => {
            const minutes = workout.endTime ? Math.max(1, Math.round((workout.endTime - workout.startTime) / 60000)) : 0;
            const sets = workout.exercises.reduce((total, exercise) => total + exercise.sets.filter(set => set.completed).length, 0);
            return <ActivityCard key={workout.id} icon={index === 0 ? <Dumbbell size={20} /> : <Zap size={20} />} title={workout.name} meta={`${index === 0 ? 'Today' : 'Recent'} • ${minutes} mins • ${sets} sets`} color={index === 0 ? 'blue' : 'lime'} />;
          })}
          {recentWorkouts.length < 2 && <ActivityCard icon={<Zap size={20} />} title="HIIT Intervals" meta="Yesterday • 30 mins • 400 kcal" color="lime" />}
          <button className="w-full mt-6 py-3 text-[#bdc1a7] text-sm font-medium flex items-center justify-center gap-2">View Full History <ArrowRight size={17} /></button>
        </section>

        <section className="px-8 mt-14">
          <div className="flex justify-end text-[#CCFF00] text-xs font-medium mb-5">8 Earned</div>
          <div className="grid grid-cols-3 gap-5 text-center">
            <Badge icon={<Trophy size={24} />} label="Centurion" active color="lime" />
            <Badge icon={<Flame size={24} />} label="14d Streak" active color="orange" />
            <Badge icon={<Lock size={23} />} label="Marathon" />
          </div>
        </section>

        <section className="px-8 mt-14 space-y-3 pb-10">
          <SecondaryRow icon={<Ruler size={18} />} label="Body Measurements" />
          <SecondaryRow icon={<Target size={18} />} label="Manage Goals" />
        </section>
      </main>

      <nav className="h-20 shrink-0 bg-[#4a4a4a] border-t border-black/10 flex justify-around items-center px-4 pb-safe text-[11px]">
        <BottomItem icon={<Grid3X3 size={17} />} label="Home" onClick={onBack} />
        <BottomItem icon={<Dumbbell size={17} />} label="Library" />
        <BottomItem icon={<Layers3 size={17} />} label="Training" />
        <BottomItem icon={<User size={17} />} label="Profile" active />
      </nav>
    </div>
  );
}

function calculateStreak(times: number[]) {
  const days = new Set(times.map(time => new Date(time).toISOString().slice(0, 10)));
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function makeWeeklyBars(workouts: { startTime: number; exercises: { sets: { completed: boolean; weight?: string; reps?: string }[] }[] }[], lang: 'tr' | 'en') {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const volumes = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - index));
    const volume = workouts.filter(workout => {
      const workoutDate = new Date(workout.startTime);
      return workoutDate.getFullYear() === date.getFullYear() && workoutDate.getMonth() === date.getMonth() && workoutDate.getDate() === date.getDate();
    }).reduce((total, workout) => total + workout.exercises.reduce((exerciseTotal, exercise) => exerciseTotal + exercise.sets.reduce((setTotal, set) => {
      if (!set.completed || !set.weight || !set.reps) return setTotal;
      return setTotal + parseFloat(set.weight) * parseInt(set.reps, 10);
    }, 0), 0), 0);
    return { label: date.toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', { weekday: 'short' }).slice(0, 1).toUpperCase(), volume };
  });
  const fallback = [74, 108, 58, 144, 88, 124, 160];
  const max = Math.max(...volumes.map(item => item.volume), 1);
  return volumes.map((item, index) => ({ ...item, height: item.volume > 0 ? Math.max(46, Math.round((item.volume / max) * 160)) : fallback[index] }));
}

function ProfileStat({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return <div><span className={`block font-display text-sm font-black ${highlight ? 'text-[#CCFF00]' : 'text-[#171717]'}`}>{value}</span><span className="block text-[#bdc1a7] text-xs tracking-wider mt-1">{label}</span></div>;
}

function ReminderButton({ children, active, lime = false, onClick }: { children: string; active: boolean; lime?: boolean; onClick: () => void }) {
  return <button onClick={onClick} className={active ? `rounded-[4px] px-2 py-2 text-xs border ${lime ? 'bg-[#f4ffe1] border-[#CCFF00] text-[#CCFF00]' : 'bg-[#1C1C1E] border-[#1C1C1E] text-white'}` : 'rounded-[4px] px-2 py-2 text-xs bg-[#1C1C1E] border border-[#1C1C1E] text-white'}>{children}</button>;
}

function ActivityCard({ icon, title, meta, color }: { icon: ReactNode; title: string; meta: string; color: 'blue' | 'lime' }) {
  return (
    <div className="bg-[#1C1C1E] text-white rounded-[6px] p-4 flex items-center gap-4 border border-black/10">
      <div className={`w-11 h-11 rounded-full border flex items-center justify-center ${color === 'blue' ? 'text-[#0070F3] border-[#0070F3]/25' : 'text-[#CCFF00] border-[#CCFF00]/25'}`}>{icon}</div>
      <div className="flex-1 min-w-0"><h3 className="font-display font-black text-sm truncate">{title}</h3><p className="text-xs text-white/80 mt-1">{meta}</p></div>
      <ArrowRight size={18} className="text-white" />
    </div>
  );
}

function Badge({ icon, label, active = false, color = 'neutral' }: { icon: ReactNode; label: string; active?: boolean; color?: 'lime' | 'orange' | 'neutral' }) {
  const colorClass = color === 'lime' ? 'border-[#CCFF00] text-[#CCFF00] shadow-[0_0_16px_rgba(204,255,0,0.35)]' : color === 'orange' ? 'border-[#FF4D00] text-[#FF4D00]' : 'border-[#9f9f9f] text-white/80 bg-[#9f9f9f]';
  return <div className={`flex flex-col items-center gap-2 ${active ? '' : 'opacity-70'}`}><div className={`w-16 h-16 rounded-full bg-[#1C1C1E] border-2 flex items-center justify-center ${colorClass}`}>{icon}</div><span className="text-xs text-[#d8dcc8]">{label}</span></div>;
}

function SecondaryRow({ icon, label }: { icon: ReactNode; label: string }) {
  return <button className="w-full py-4 flex items-center justify-between text-[#bdc1a7]"><span className="flex items-center gap-3 text-sm">{icon}{label}</span><ArrowRight size={17} /></button>;
}

function BottomItem({ icon, label, active = false, onClick }: { icon: ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return <button onClick={onClick} className={`flex flex-col items-center gap-1 ${active ? 'text-[#CCFF00]' : 'text-white/75'}`}>{icon}<span>{label}</span></button>;
}
