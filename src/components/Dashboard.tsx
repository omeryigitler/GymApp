import { type ReactNode, useRef } from 'react';
import { Activity, BarChart3, Bell, CalendarDays, Crown, Droplets, Dumbbell, Edit3, Flame, Grid3X3, Layers3, Minus, Play, Plus, Search, Trash2, User } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { translations } from '../i18n';
import { formatTime } from '../utils';

export function Dashboard({ onStartEmpty, onStartRoutine, onCreateRoutine, onEditRoutine, onShowPaywall, onOpenProfile }: { onStartEmpty: () => void; onStartRoutine: (id: string) => void; onCreateRoutine: () => void; onEditRoutine: (id: string) => void; onShowPaywall: () => void; onOpenProfile: () => void }) {
  const { workouts, routines, isPremium, lang, user, deleteWorkout, deleteRoutine, hydrationToday, waterGoal, addWater, removeWater } = useAppContext();
  const t = translations[lang];
  const mainRef = useRef<HTMLElement | null>(null);
  const trainingRef = useRef<HTMLElement | null>(null);
  const libraryRef = useRef<HTMLElement | null>(null);

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(now.getDate() - 6);

  const recentWorkouts = workouts.filter(workout => workout.startTime >= weekStart.getTime());
  const totalWorkouts = workouts.length;
  const weeklyWorkouts = recentWorkouts.length;
  const totalVolume = workouts.reduce((acc, workout) => acc + workout.exercises.reduce((exAcc, exercise) => exAcc + exercise.sets.reduce((setAcc, set) => {
    if (set.completed && set.weight && set.reps) return setAcc + parseFloat(set.weight) * parseInt(set.reps, 10);
    return setAcc;
  }, 0), 0), 0);
  const completedSets = workouts.reduce((total, workout) => total + workout.exercises.reduce((exerciseTotal, exercise) => exerciseTotal + exercise.sets.filter(set => set.completed).length, 0), 0);
  const weeklyMinutes = recentWorkouts.reduce((total, workout) => total + (workout.endTime ? Math.round((workout.endTime - workout.startTime) / 60000) : 0), 0);
  const waterPercent = Math.min(100, Math.round((hydrationToday / waterGoal) * 100));
  const flowPercent = Math.min(100, Math.round(((weeklyWorkouts / 4) * 40) + ((hydrationToday / waterGoal) * 35) + ((weeklyMinutes / 180) * 25)));

  const scrollToTop = () => mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  const scrollToTraining = () => trainingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const scrollToLibrary = () => libraryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div className="flex-1 overflow-hidden bg-[#131313] text-[#e5e2e1] flex flex-col">
      <header className="h-16 shrink-0 bg-[#131313]/85 backdrop-blur-2xl border-b border-white/10 px-5 flex items-center justify-between">
        <button onClick={onOpenProfile} className="flex items-center gap-3 active:scale-95 transition-transform">
          <div className="w-9 h-9 rounded-full bg-[#1C1C1E] border border-[#CCFF00]/30 flex items-center justify-center text-[#CCFF00] shadow-[0_0_14px_rgba(204,255,0,0.22)]">
            {user?.name?.charAt(0) || <User size={18} fill="currentColor" />}
          </div>
          <span className="font-display text-[24px] font-black italic tracking-[-0.08em] text-[#CCFF00]">FLOW STATE</span>
        </button>
        <div className="flex items-center gap-2">
          {!isPremium && <button onClick={onShowPaywall} className="hidden sm:flex items-center gap-1.5 text-[#CCFF00] border border-[#CCFF00]/20 bg-[#CCFF00]/10 text-[10px] font-black px-3 py-2 rounded-full"><Crown size={14} /> PRO</button>}
          <button type="button" className="w-9 h-9 rounded-full flex items-center justify-center text-[#CCFF00] hover:bg-white/5 active:scale-95 transition-all"><Bell size={20} /></button>
        </div>
      </header>

      <main ref={mainRef} className="flex-1 overflow-y-auto hide-scrollbar px-5 py-8 pb-28 space-y-8 scroll-smooth">
        <section>
          <h1 className="font-display text-[30px] leading-9 font-black text-white tracking-[-0.05em]">Merhaba, {user?.name || 'Ömer'}!</h1>
          <p className="text-[#c4c9ac] text-lg mt-2 font-medium">Ready to find your flow today?</p>
        </section>

        <section className="relative overflow-hidden bg-[#1C1C1E] rounded-xl p-5 border border-white/10">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1C1C1E] to-[#201f1f] opacity-80" />
          <div className="relative z-10 flex flex-col items-center">
            <h2 className="font-display text-white text-[28px] font-black tracking-[-0.05em] self-start mb-5">Daily Goals</h2>
            <div className="relative w-48 h-48 flex items-center justify-center mb-5">
              <svg className="w-full h-full -rotate-90 absolute" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                <circle cx="50" cy="50" r="25" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="#CCFF00" strokeWidth="8" strokeLinecap="round" strokeDasharray="283" strokeDashoffset={283 - (283 * Math.min(100, weeklyWorkouts * 25)) / 100} />
                <circle cx="50" cy="50" r="35" fill="none" stroke="#0070F3" strokeWidth="8" strokeLinecap="round" strokeDasharray="220" strokeDashoffset={220 - (220 * waterPercent) / 100} />
                <circle cx="50" cy="50" r="25" fill="none" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" strokeDasharray="157" strokeDashoffset={157 - (157 * Math.min(100, Math.round((weeklyMinutes / 180) * 100))) / 100} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center"><span className="font-display text-[#CCFF00] text-3xl font-black leading-none">{flowPercent}%</span><span className="text-[#c4c9ac] text-xs font-black uppercase tracking-widest mt-1">Overall</span></div>
            </div>
            <div className="w-full space-y-3"><GoalLine color="bg-[#CCFF00]" textColor="text-[#CCFF00]" label="Workouts" value={`${weeklyWorkouts} / 4`} /><GoalLine color="bg-[#0070F3]" textColor="text-[#0070F3]" label="Hydration" value={`${hydrationToday} / ${waterGoal}`} /><GoalLine color="bg-white" textColor="text-white" label="Active" value={`${weeklyMinutes} / 180m`} /></div>
          </div>
        </section>

        <section ref={trainingRef}>
          <button onClick={onStartEmpty} className="relative overflow-hidden w-full h-64 rounded-xl border border-white/10 bg-[#1C1C1E] text-left group active:scale-[0.99] transition-transform">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_32%,rgba(204,255,0,0.22),transparent_22%),linear-gradient(135deg,rgba(0,112,243,0.2),transparent_55%)]" />
            <div className="absolute right-5 top-8 w-36 h-36 rounded-full border border-[#CCFF00]/25 bg-[#CCFF00]/5 flex items-center justify-center text-[#CCFF00] opacity-80"><Dumbbell size={72} /></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1E] via-[#1C1C1E]/70 to-transparent" />
            <div className="relative h-full p-5 flex flex-col justify-end"><span className="w-fit px-4 py-1.5 bg-[#CCFF00] text-[#131313] rounded-full text-sm font-black mb-3">Suggested</span><h3 className="font-display text-white group-hover:text-[#CCFF00] transition-colors text-3xl font-black tracking-[-0.06em]">HIIT Core Crusher</h3><p className="text-[#c4c9ac] text-sm font-semibold mt-2">{t.startEmptyDesc}</p><div className="absolute right-5 bottom-5 w-14 h-14 rounded-full bg-[#CCFF00] text-[#131313] flex items-center justify-center shadow-[0_0_28px_rgba(204,255,0,0.4)]"><Play size={24} fill="currentColor" /></div></div>
          </button>
        </section>

        <section className="grid grid-cols-2 gap-3"><StatCard icon={<CalendarDays size={18} />} label="Antrenman" value={String(totalWorkouts)} accent="text-[#CCFF00]" /><StatCard icon={<BarChart3 size={18} />} label="Hacim" value={`${totalVolume.toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US')} kg`} accent="text-[#0070F3]" /><StatCard icon={<Dumbbell size={18} />} label="Set" value={String(completedSets)} accent="text-white" /><StatCard icon={<Flame size={18} />} label="Aktif" value={`${weeklyMinutes} dk`} accent="text-[#FF4D00]" /></section>

        <section className="relative overflow-hidden rounded-xl bg-[#1C1C1E] border border-white/10 p-5">
          <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-3"><div className="w-11 h-11 rounded-full bg-[#0070F3]/10 border border-[#0070F3]/30 text-[#0070F3] flex items-center justify-center"><Droplets size={22} /></div><div><h3 className="font-display text-white font-black text-xl tracking-[-0.04em]">Su Takibi</h3><p className="text-[#c4c9ac] text-xs font-semibold">Günlük hedef: {waterGoal} bardak</p></div></div><div className="flex gap-2"><button onClick={removeWater} className="w-8 h-8 rounded-full bg-[#131313] text-white flex items-center justify-center border border-white/10 active:scale-95"><Minus size={16} /></button><button onClick={addWater} className="w-8 h-8 rounded-full bg-[#131313] text-[#CCFF00] flex items-center justify-center border border-white/10 active:scale-95"><Plus size={16} /></button></div></div>
          <div className="flex justify-between text-sm mb-2"><span className="text-[#0070F3] font-semibold">{(hydrationToday * 0.25).toFixed(1)}L</span><span className="text-[#c4c9ac]">Hedef: {(waterGoal * 0.25).toFixed(1)}L</span></div><div className="h-3 bg-[#0e0e0e] rounded-full overflow-hidden"><div className="h-full bg-[#0070F3] rounded-full transition-all" style={{ width: `${waterPercent}%` }} /></div><div className="flex items-center justify-between mt-3"><div className="flex gap-1">{Array.from({ length: Math.min(waterGoal, 10) }).map((_, index) => <Droplets key={index} size={15} className={index < hydrationToday ? 'text-[#0070F3]' : 'text-[#353534]'} />)}</div><span className="text-[#c4c9ac] text-sm">{waterPercent}% Tamamlandı</span></div>
        </section>

        <section ref={libraryRef} className="space-y-4 scroll-mt-4">
          <div className="flex items-center justify-between"><h2 className="font-display text-white text-2xl font-black tracking-[-0.05em]">Workout Library</h2><button onClick={onCreateRoutine} className="text-[#CCFF00] text-sm font-black flex items-center gap-1"><Plus size={16} /> Rutin</button></div>
          <div className="relative"><Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#c4c9ac]" /><div className="w-full bg-[#1C1C1E] border border-white/10 text-[#c4c9ac] rounded-full py-3.5 pl-12 pr-4 font-medium">Search workouts...</div></div>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">{['Kardiyo', 'Güç', 'Yoga', 'HIIT'].map((item, index) => <button key={item} className={index === 0 ? 'shrink-0 bg-[#CCFF00] text-[#131313] px-5 py-2.5 rounded-full font-black' : 'shrink-0 bg-[#1C1C1E] border border-white/10 text-[#c4c9ac] px-5 py-2.5 rounded-full font-black'}>{item}</button>)}</div>
          <div className="space-y-4">
            {routines.length === 0 ? <LibraryCard title="Apex Predator" meta="45 Min • High Intensity" icon={<Dumbbell size={28} />} onClick={onCreateRoutine} /> : routines.map((routine, index) => <div key={routine.id} onClick={() => onStartRoutine(routine.id)} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onStartRoutine(routine.id); } }} className="group relative overflow-hidden h-56 rounded-xl bg-[#1C1C1E] border border-white/10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#CCFF00]/60"><div className={`absolute inset-0 ${index % 2 === 0 ? 'bg-[radial-gradient(circle_at_80%_25%,rgba(204,255,0,0.16),transparent_26%),linear-gradient(135deg,rgba(0,112,243,0.18),transparent_60%)]' : 'bg-[radial-gradient(circle_at_70%_55%,rgba(0,112,243,0.18),transparent_28%),linear-gradient(135deg,rgba(204,255,0,0.12),transparent_62%)]'}`} /><div className="absolute right-6 top-8 w-28 h-28 rounded-full border border-white/10 flex items-center justify-center text-[#CCFF00]/80"><Dumbbell size={58} /></div><div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1E] via-[#1C1C1E]/60 to-transparent" /><div className="relative h-full p-5 flex flex-col justify-end"><h3 className="font-display text-white text-3xl font-black tracking-[-0.06em] truncate">{routine.name}</h3><p className="text-[#c4c9ac] text-sm font-semibold mt-2 truncate">{routine.exercises.map(exercise => exercise.exercise.name[lang]).join(', ')}</p><div className="flex items-center justify-between mt-4"><span className="text-xs text-white bg-black/30 rounded-md px-2 py-1 font-bold">{routine.exercises.length} egzersiz</span><div className="flex items-center gap-1.5"><button onClick={(event) => { event.stopPropagation(); onEditRoutine(routine.id); }} className="w-9 h-9 rounded-full flex items-center justify-center text-white bg-black/30 hover:bg-white/10"><Edit3 size={16} /></button><button onClick={(event) => { event.stopPropagation(); deleteRoutine(routine.id); }} className="w-9 h-9 rounded-full flex items-center justify-center text-white bg-black/30 hover:bg-red-500/20"><Trash2 size={16} /></button><div className="w-11 h-11 bg-[#CCFF00] rounded-full flex items-center justify-center text-[#131313] shadow-[0_0_24px_rgba(204,255,0,0.25)]"><Play size={18} fill="currentColor" /></div></div></div></div></div>)}
            {(!isPremium && routines.length >= 2) ? <button onClick={onShowPaywall} className="w-full flex items-center justify-center gap-2 border border-[#CCFF00]/20 bg-[#CCFF00]/10 text-[#CCFF00] font-black py-3.5 rounded-full transition-all text-sm"><Crown size={16} /> {t.pro}</button> : routines.length > 0 && <button onClick={onCreateRoutine} className="w-full flex items-center justify-center gap-2 border border-dashed border-[#CCFF00]/25 bg-[#CCFF00]/5 text-[#CCFF00] hover:bg-[#CCFF00]/10 font-black py-3.5 rounded-full transition-all text-sm"><Plus size={16} /> {t.createRoutine}</button>}
          </div>
        </section>

        <section className="space-y-3 pb-8"><h2 className="font-display text-white text-2xl font-black tracking-[-0.05em] px-1">{t.history}</h2>{workouts.length === 0 ? <div className="text-center text-[#c4c9ac] py-12 text-sm font-semibold bg-[#1C1C1E] rounded-xl border border-white/10">{t.noHistory}</div> : <div className="space-y-3">{workouts.slice(0, 5).map(workout => { const duration = workout.endTime ? workout.endTime - workout.startTime : 0; const totalSets = workout.exercises.reduce((acc, exercise) => acc + exercise.sets.filter(set => set.completed).length, 0); return <div key={workout.id} className="bg-[#1C1C1E] border border-white/10 rounded-xl p-5"><div className="flex justify-between items-start mb-4"><div><h3 className="font-display text-white font-black text-lg tracking-[-0.04em]">{workout.name}</h3><p className="text-[11px] text-[#c4c9ac] font-bold uppercase tracking-widest mt-1">{new Date(workout.startTime).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US')}</p></div><button onClick={() => deleteWorkout(workout.id)} className="p-2 text-[#c4c9ac] hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"><Trash2 size={16} /></button></div><div className="flex gap-5 border-t border-white/10 pt-4"><div className="flex items-center gap-2 text-sm text-white font-bold"><Activity size={14} />{formatTime(Math.floor(duration / 1000))}</div><div className="flex items-center gap-2 text-sm text-white font-bold"><Dumbbell size={14} />{totalSets} {t.sets}</div></div></div>; })}</div>}</section>
      </main>

      <nav className="h-20 shrink-0 bg-[#1C1C1E]/95 backdrop-blur-2xl border-t border-white/10 flex justify-around items-center px-4 pb-safe text-[11px]"><BottomItem icon={<Grid3X3 size={18} />} label="Home" active onClick={scrollToTop} /><BottomItem icon={<Dumbbell size={18} />} label="Library" onClick={scrollToLibrary} /><BottomItem icon={<Layers3 size={18} />} label="Training" onClick={scrollToTraining} /><BottomItem icon={<User size={18} />} label="Profile" onClick={onOpenProfile} /></nav>
    </div>
  );
}

function GoalLine({ color, textColor, label, value }: { color: string; textColor: string; label: string; value: string }) { return <div className="flex items-center justify-between gap-3"><div className={`flex items-center gap-2 ${textColor} text-sm font-black`}><span className={`w-2 h-2 rounded-full ${color}`} /> {label}</div><span className="text-white text-sm font-bold">{value}</span></div>; }
function StatCard({ icon, label, value, accent }: { icon: ReactNode; label: string; value: string; accent: string }) { return <div className="bg-[#1C1C1E] border border-white/10 rounded-xl p-4"><div className={`${accent} mb-3`}>{icon}</div><p className="font-display text-white text-2xl font-black leading-tight truncate">{value}</p><p className="text-[#c4c9ac] text-[10px] font-black uppercase tracking-widest mt-1">{label}</p></div>; }
function LibraryCard({ title, meta, icon, onClick }: { title: string; meta: string; icon: ReactNode; onClick: () => void }) { return <button onClick={onClick} className="relative overflow-hidden h-56 rounded-xl bg-[#1C1C1E] border border-white/10 w-full text-left"><div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_30%,rgba(204,255,0,0.16),transparent_28%)]" /><div className="absolute right-6 top-8 w-28 h-28 rounded-full border border-white/10 flex items-center justify-center text-[#CCFF00]/80">{icon}</div><div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1E] via-[#1C1C1E]/70 to-transparent" /><div className="relative h-full p-5 flex flex-col justify-end"><h3 className="font-display text-white text-3xl font-black tracking-[-0.06em]">{title}</h3><p className="text-[#c4c9ac] text-sm font-semibold mt-2">{meta}</p></div></button>; }
function BottomItem({ icon, label, active = false, onClick }: { icon: ReactNode; label: string; active?: boolean; onClick?: () => void }) { return <button onClick={onClick} className={`flex flex-col items-center gap-1 ${active ? 'text-[#CCFF00]' : 'text-[#c4c9ac]'}`}>{icon}<span className="font-black">{label}</span>{active && <span className="w-1 h-1 rounded-full bg-[#CCFF00]" />}</button>; }
