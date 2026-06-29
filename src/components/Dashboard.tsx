import { Activity, BarChart3, CalendarDays, Crown, Droplets, Dumbbell, Edit3, Flame, LogOut, Minus, Play, Plus, Trash2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { translations } from '../i18n';
import { formatTime } from '../utils';

export function Dashboard({ onStartEmpty, onStartRoutine, onCreateRoutine, onEditRoutine, onShowPaywall, onOpenProfile }: { onStartEmpty: () => void; onStartRoutine: (id: string) => void; onCreateRoutine: () => void; onEditRoutine: (id: string) => void; onShowPaywall: () => void; onOpenProfile: () => void }) {
  const { workouts, routines, isPremium, lang, logout, user, deleteWorkout, deleteRoutine, hydrationToday, waterGoal, addWater, removeWater } = useAppContext();
  const t = translations[lang];

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

  return (
    <div className="flex-1 overflow-y-auto pb-28 bg-[#131313] text-[#e5e2e1] hide-scrollbar">
      <div className="sticky top-0 z-10 h-16 bg-[#131313]/85 backdrop-blur-2xl border-b border-white/10 px-5 flex items-center justify-between">
        <button onClick={onOpenProfile} className="flex items-center gap-2 active:scale-95 transition-transform">
          <div className="w-8 h-8 rounded-full bg-[#1C1C1E] border border-white/10 flex items-center justify-center text-[#CCFF00] font-black">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <span className="text-[#CCFF00] text-lg font-black tracking-[-0.05em]">FLOW STATE</span>
        </button>
        <div className="flex items-center gap-2">
          {!isPremium && <button onClick={onShowPaywall} className="flex items-center gap-1.5 text-[#CCFF00] border border-[#CCFF00]/20 bg-[#CCFF00]/10 text-[10px] font-black px-3 py-2 rounded-full"><Crown size={14} /> PRO</button>}
          <button onClick={logout} className="text-[#c4c9ac] hover:text-white p-2 rounded-full hover:bg-white/5"><LogOut size={18} /></button>
        </div>
      </div>

      <main className="px-5 py-8 space-y-8">
        <section>
          <h1 className="text-[32px] leading-9 font-black text-white tracking-[-0.04em]">Merhaba, {user?.name || 'Ömer'}!</h1>
          <p className="text-[#c4c9ac] text-base mt-2 font-medium">Bugün akışını koru: antrenman, hacim ve su takibi.</p>
        </section>

        <section className="relative overflow-hidden rounded-3xl bg-[#1C1C1E] border border-white/10 p-5 shadow-[0_20px_80px_-55px_rgba(204,255,0,0.8)]">
          <div className="pointer-events-none absolute -top-20 -right-20 w-56 h-56 rounded-full bg-[#CCFF00]/10 blur-3xl" />
          <div className="relative flex items-start justify-between mb-5">
            <div>
              <h2 className="text-white text-2xl font-black tracking-[-0.04em]">Daily Goals</h2>
              <p className="text-[#c4c9ac] text-sm font-semibold mt-1">Haftalık hedef + su takibi</p>
            </div>
            <div className="text-right">
              <p className="text-[#CCFF00] text-3xl font-black leading-none">{flowPercent}%</p>
              <p className="text-[10px] text-[#c4c9ac] font-black uppercase tracking-widest mt-1">Overall</p>
            </div>
          </div>

          <div className="grid grid-cols-[132px_1fr] gap-5 items-center">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="43" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                <circle cx="50" cy="50" r="32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                <circle cx="50" cy="50" r="21" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                <circle cx="50" cy="50" r="43" fill="none" stroke="#CCFF00" strokeWidth="8" strokeLinecap="round" strokeDasharray="270" strokeDashoffset={270 - (270 * Math.min(100, weeklyWorkouts * 25)) / 100} />
                <circle cx="50" cy="50" r="32" fill="none" stroke="#0070F3" strokeWidth="8" strokeLinecap="round" strokeDasharray="201" strokeDashoffset={201 - (201 * waterPercent) / 100} />
                <circle cx="50" cy="50" r="21" fill="none" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" strokeDasharray="132" strokeDashoffset={132 - (132 * Math.min(100, Math.round((weeklyMinutes / 180) * 100))) / 100} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[#CCFF00] text-2xl font-black">{flowPercent}%</span>
                <span className="text-[10px] text-[#c4c9ac] font-black uppercase tracking-widest">Flow</span>
              </div>
            </div>

            <div className="space-y-3">
              <GoalLine color="bg-[#CCFF00]" textColor="text-[#CCFF00]" label="Haftalık" value={`${weeklyWorkouts} / 4`} />
              <GoalLine color="bg-[#0070F3]" textColor="text-[#0070F3]" label="Su" value={`${hydrationToday} / ${waterGoal} bardak`} />
              <GoalLine color="bg-white" textColor="text-white" label="Aktif" value={`${weeklyMinutes} / 180 dk`} />
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <StatCard icon={<CalendarDays size={18} />} label="Antrenman" value={String(totalWorkouts)} accent="text-[#CCFF00]" />
          <StatCard icon={<BarChart3 size={18} />} label="Hacim" value={`${totalVolume.toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US')} kg`} accent="text-[#0070F3]" />
          <StatCard icon={<Dumbbell size={18} />} label="Set" value={String(completedSets)} accent="text-white" />
          <StatCard icon={<Flame size={18} />} label="Aktif Süre" value={`${weeklyMinutes} dk`} accent="text-orange-400" />
        </section>

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1C1C1E] to-[#201f1f] border border-white/10 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#0070F3]/10 border border-[#0070F3]/30 text-[#0070F3] flex items-center justify-center"><Droplets size={24} /></div>
              <div>
                <h3 className="text-white font-black text-xl tracking-[-0.03em]">Su Takibi</h3>
                <p className="text-[#c4c9ac] text-xs font-semibold">Günlük hedef: {waterGoal} bardak</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[#0070F3] text-3xl font-black">{hydrationToday}</p>
              <p className="text-[10px] text-[#c4c9ac] font-black uppercase tracking-widest">bardak</p>
            </div>
          </div>

          <div className="h-3 bg-white/5 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-[#0070F3] rounded-full shadow-[0_0_20px_rgba(0,112,243,0.5)] transition-all" style={{ width: `${waterPercent}%` }} />
          </div>

          <div className="grid grid-cols-8 gap-1.5 mb-4">
            {Array.from({ length: waterGoal }).map((_, index) => (
              <div key={index} className={`aspect-square rounded-xl border flex items-center justify-center ${index < hydrationToday ? 'bg-[#0070F3]/25 border-[#0070F3]/50 text-[#0070F3]' : 'bg-white/5 border-white/10 text-[#353534]'}`}>
                <Droplets size={14} />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={removeWater} className="py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black flex items-center justify-center gap-2 active:scale-[0.98]"><Minus size={18} /> Azalt</button>
            <button onClick={addWater} className="py-3 rounded-2xl bg-[#0070F3] hover:bg-blue-500 text-white font-black flex items-center justify-center gap-2 active:scale-[0.98] shadow-[0_0_28px_rgba(0,112,243,0.35)]"><Plus size={18} /> Su İçtim</button>
          </div>
        </section>

        <section>
          <button onClick={onStartEmpty} className="relative overflow-hidden w-full h-56 rounded-3xl border border-white/10 bg-[#1C1C1E] text-left group active:scale-[0.99] transition-transform">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(204,255,0,0.25),transparent_28%),linear-gradient(135deg,rgba(0,112,243,0.22),transparent_55%)]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1E] via-[#1C1C1E]/70 to-transparent" />
            <div className="relative h-full p-5 flex flex-col justify-end">
              <span className="w-fit px-3 py-1 bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/20 rounded-full text-xs font-black mb-3">Suggested</span>
              <h3 className="text-white group-hover:text-[#CCFF00] transition-colors text-3xl font-black tracking-[-0.05em]">{t.startEmpty}</h3>
              <p className="text-[#c4c9ac] text-sm font-semibold mt-2">{t.startEmptyDesc}</p>
              <div className="absolute right-5 bottom-5 w-13 h-13 rounded-full bg-[#CCFF00] text-[#131313] flex items-center justify-center shadow-[0_0_28px_rgba(204,255,0,0.4)]"><Play size={24} fill="currentColor" /></div>
            </div>
          </button>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-white text-2xl font-black tracking-[-0.04em]">Rutinler</h2>
            {routines.length > 0 && <span className="text-[10px] font-black text-[#c4c9ac] bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">{routines.length} / {isPremium ? '∞' : '2'}</span>}
          </div>

          {routines.length === 0 ? (
            <div className="bg-[#1C1C1E] rounded-3xl p-8 border border-white/10 text-center">
              <div className="w-16 h-16 rounded-3xl bg-[#CCFF00]/10 border border-[#CCFF00]/20 text-[#CCFF00] flex items-center justify-center mx-auto mb-4"><Dumbbell size={28} /></div>
              <p className="text-[#c4c9ac] text-sm font-semibold mb-5">{t.noRoutines}</p>
              <button onClick={onCreateRoutine} className="text-[#131313] bg-[#CCFF00] px-6 py-3 rounded-2xl font-black active:scale-95 transition-transform">{t.createRoutine}</button>
            </div>
          ) : (
            <div className="space-y-3">
              {routines.map(routine => (
                <div key={routine.id} onClick={() => onStartRoutine(routine.id)} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onStartRoutine(routine.id); } }} className="group bg-[#1C1C1E] border border-white/10 rounded-3xl p-4 flex items-center justify-between hover:border-[#CCFF00]/40 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#CCFF00]/60">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-white font-black text-base mb-1 truncate">{routine.name}</h3>
                    <p className="text-xs text-[#c4c9ac] font-semibold leading-relaxed truncate">{routine.exercises.map(exercise => exercise.exercise.name[lang]).join(', ')}</p>
                    <span className="inline-flex mt-3 text-[10px] font-black text-[#CCFF00] bg-[#CCFF00]/10 border border-[#CCFF00]/20 rounded-full px-2.5 py-1">{routine.exercises.length} egzersiz</span>
                  </div>
                  <div className="flex items-center gap-1.5 ml-2">
                    <button onClick={(event) => { event.stopPropagation(); onEditRoutine(routine.id); }} className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#c4c9ac] hover:text-white hover:bg-white/10 transition-colors shrink-0"><Edit3 size={18} /></button>
                    <button onClick={(event) => { event.stopPropagation(); deleteRoutine(routine.id); }} className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#c4c9ac] hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"><Trash2 size={18} /></button>
                    <div className="w-11 h-11 bg-[#CCFF00] rounded-2xl flex items-center justify-center text-[#131313] shadow-[0_0_24px_rgba(204,255,0,0.25)] group-hover:scale-105 active:scale-95 transition-all shrink-0"><Play size={18} fill="currentColor" className="ml-1" /></div>
                  </div>
                </div>
              ))}
              {(!isPremium && routines.length >= 2) ? (
                <button onClick={onShowPaywall} className="w-full flex items-center justify-center gap-2 border border-[#CCFF00]/20 bg-[#CCFF00]/10 text-[#CCFF00] font-black py-3.5 rounded-2xl transition-all text-sm"><Crown size={16} /> {t.pro}</button>
              ) : (
                <button onClick={onCreateRoutine} className="w-full flex items-center justify-center gap-2 border border-dashed border-[#CCFF00]/25 bg-[#CCFF00]/5 text-[#CCFF00] hover:bg-[#CCFF00]/10 font-black py-3.5 rounded-2xl transition-all text-sm"><Plus size={16} /> {t.createRoutine}</button>
              )}
            </div>
          )}
        </section>

        <section className="space-y-3 pb-8">
          <h2 className="text-white text-2xl font-black tracking-[-0.04em] px-1">{t.history}</h2>
          {workouts.length === 0 ? <div className="text-center text-[#c4c9ac] py-12 text-sm font-semibold bg-[#1C1C1E] rounded-3xl border border-white/10">{t.noHistory}</div> : (
            <div className="space-y-3">
              {workouts.slice(0, 5).map(workout => {
                const duration = workout.endTime ? workout.endTime - workout.startTime : 0;
                const totalSets = workout.exercises.reduce((acc, exercise) => acc + exercise.sets.filter(set => set.completed).length, 0);
                return (
                  <div key={workout.id} className="bg-[#1C1C1E] border border-white/10 rounded-3xl p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div><h3 className="text-white font-black text-lg">{workout.name}</h3><p className="text-[11px] text-[#c4c9ac] font-bold uppercase tracking-widest mt-1">{new Date(workout.startTime).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US')}</p></div>
                      <button onClick={() => deleteWorkout(workout.id)} className="p-2 text-[#c4c9ac] hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"><Trash2 size={16} /></button>
                    </div>
                    <div className="flex gap-5 border-t border-white/10 pt-4"><div className="flex items-center gap-2 text-sm text-white font-bold"><Activity size={14} />{formatTime(Math.floor(duration / 1000))}</div><div className="flex items-center gap-2 text-sm text-white font-bold"><Dumbbell size={14} />{totalSets} {t.sets}</div></div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function GoalLine({ color, textColor, label, value }: { color: string; textColor: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className={`flex items-center gap-2 ${textColor} text-xs font-black`}><span className={`w-2 h-2 rounded-full ${color}`} /> {label}</div>
      <span className="text-white text-sm font-bold">{value}</span>
    </div>
  );
}

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: string }) {
  return (
    <div className="bg-[#1C1C1E] border border-white/10 rounded-3xl p-4">
      <div className={`${accent} mb-3`}>{icon}</div>
      <p className="text-white text-2xl font-black leading-tight truncate">{value}</p>
      <p className="text-[#c4c9ac] text-[10px] font-black uppercase tracking-widest mt-1">{label}</p>
    </div>
  );
}
