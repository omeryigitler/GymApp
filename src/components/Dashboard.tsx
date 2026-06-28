import { Activity, CalendarDays, Clock, Crown, Dumbbell, Edit3, LogOut, Play, Plus, Trash2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { translations } from '../i18n';
import { formatTime } from '../utils';

export function Dashboard({ onStartEmpty, onStartRoutine, onCreateRoutine, onEditRoutine, onShowPaywall, onOpenProfile }: { onStartEmpty: () => void; onStartRoutine: (id: string) => void; onCreateRoutine: () => void; onEditRoutine: (id: string) => void; onShowPaywall: () => void; onOpenProfile: () => void }) {
  const { workouts, routines, isPremium, lang, logout, user, deleteWorkout, deleteRoutine } = useAppContext();
  const t = translations[lang];

  const totalWorkouts = workouts.length;
  const totalVolume = workouts.reduce((acc, workout) => acc + workout.exercises.reduce((exAcc, exercise) => exAcc + exercise.sets.reduce((setAcc, set) => {
    if (set.completed && set.weight && set.reps) return setAcc + parseFloat(set.weight) * parseInt(set.reps, 10);
    return setAcc;
  }, 0), 0), 0);

  return (
    <div className="flex-1 overflow-y-auto pb-28 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.18),_transparent_35%),#020617] hide-scrollbar">
      <div className="px-5 pt-8 pb-6 flex items-center justify-between sticky top-0 bg-slate-950/70 backdrop-blur-2xl z-10 border-b border-white/5">
        <button onClick={onOpenProfile} className="flex items-center gap-3 text-left hover:opacity-90 transition-all active:scale-95">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 blur-xl opacity-40 rounded-full" />
            <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-700 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg ring-1 ring-white/20">
              {user?.name?.charAt(0) || 'U'}
            </div>
          </div>
          <div>
            <h1 className="text-xl font-black text-white leading-tight tracking-tight">{user?.name}</h1>
            <p className="text-blue-400 text-xs font-extrabold tracking-widest uppercase">{t.appTitle}</p>
          </div>
        </button>
        <div className="flex items-center gap-2">
          {!isPremium && (
            <button onClick={onShowPaywall} className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-black px-3 py-2 rounded-full uppercase tracking-wider shadow-[0_0_24px_rgba(245,158,11,0.18)]">
              <Crown size={14} /> PRO
            </button>
          )}
          <button onClick={logout} className="text-slate-500 hover:text-white p-2.5 transition-colors rounded-full hover:bg-white/5 border border-white/5 bg-white/[0.02]">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <div className="px-5 space-y-8 pt-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900/95 to-slate-950 border border-white/10 rounded-[24px] p-4 shadow-[0_20px_70px_-45px_rgba(59,130,246,0.9)]">
            <div className="absolute -right-8 -top-8 w-24 h-24 bg-blue-500/15 rounded-full blur-2xl" />
            <div className="relative flex items-center gap-2 text-blue-400 mb-3"><CalendarDays size={16} /><span className="text-[10px] font-black uppercase tracking-widest">Antrenman</span></div>
            <p className="relative text-4xl font-black text-white">{totalWorkouts}</p>
          </div>
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900/95 to-slate-950 border border-white/10 rounded-[24px] p-4 shadow-[0_20px_70px_-45px_rgba(16,185,129,0.9)]">
            <div className="absolute -right-8 -top-8 w-24 h-24 bg-emerald-500/15 rounded-full blur-2xl" />
            <div className="relative flex items-center gap-2 text-emerald-400 mb-3"><Activity size={16} /><span className="text-[10px] font-black uppercase tracking-widest">Hacim</span></div>
            <p className="relative text-3xl font-black text-white flex items-baseline gap-1">{totalVolume.toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US')} <span className="text-sm text-slate-500 font-bold">kg</span></p>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-widest pl-2">Hızlı Başla</h2>
          <button onClick={onStartEmpty} className="relative overflow-hidden w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-[28px] p-5 flex items-center gap-4 transition-all active:scale-[0.98] shadow-[0_20px_70px_-30px_rgba(37,99,235,0.9)] border border-white/15">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.25),transparent_30%)]" />
            <div className="relative w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 border border-white/20"><Plus size={28} /></div>
            <div className="relative text-left"><h3 className="font-black text-xl leading-tight mb-1">{t.startEmpty}</h3><p className="text-blue-100/80 text-sm font-semibold">{t.startEmptyDesc}</p></div>
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between pl-2">
            <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{t.myRoutines}</h2>
            {routines.length > 0 && <span className="text-[10px] font-black text-slate-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">{routines.length} / {isPremium ? '∞' : '2'}</span>}
          </div>

          {routines.length === 0 ? (
            <div className="relative overflow-hidden border border-blue-500/25 bg-gradient-to-br from-blue-950/30 via-slate-900/70 to-slate-950 rounded-[28px] p-8 text-center flex flex-col items-center justify-center shadow-[0_20px_70px_-45px_rgba(37,99,235,0.8)]">
              <div className="absolute -top-16 -right-16 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
              <div className="relative w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-4"><Dumbbell className="text-blue-400" size={28} /></div>
              <p className="relative text-sm text-slate-400 font-semibold mb-5">{t.noRoutines}</p>
              <button onClick={onCreateRoutine} className="relative text-white font-black text-sm bg-white/10 hover:bg-white/15 border border-white/10 px-6 py-3 rounded-2xl transition-all active:scale-95">{t.createRoutine}</button>
            </div>
          ) : (
            <div className="space-y-3">
              {routines.map(routine => (
                <div key={routine.id} onClick={() => onStartRoutine(routine.id)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onStartRoutine(routine.id); } }} className="group bg-gradient-to-br from-slate-900/95 to-slate-950 border border-white/10 rounded-[26px] p-4 flex items-center justify-between hover:border-blue-500/50 hover:shadow-[0_20px_70px_-45px_rgba(37,99,235,0.9)] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/60">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-white font-black text-base mb-1 truncate">{routine.name}</h3>
                    <p className="text-xs text-slate-500 font-semibold leading-relaxed truncate">{routine.exercises.map(e => e.exercise.name[lang]).join(', ')}</p>
                    <div className="flex items-center gap-2 mt-3"><span className="text-[10px] font-black text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-full px-2.5 py-1">{routine.exercises.length} egzersiz</span></div>
                  </div>
                  <div className="flex items-center gap-1.5 ml-2">
                    <button onClick={(e) => { e.stopPropagation(); onEditRoutine(routine.id); }} className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-colors shrink-0"><Edit3 size={18} /></button>
                    <button onClick={(e) => { e.stopPropagation(); deleteRoutine(routine.id); }} className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"><Trash2 size={18} /></button>
                    <div className="w-11 h-11 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/30 group-hover:scale-105 active:scale-95 transition-all shrink-0"><Play size={18} fill="currentColor" className="ml-1" /></div>
                  </div>
                </div>
              ))}
              {(!isPremium && routines.length >= 2) ? (
                <button onClick={onShowPaywall} className="w-full flex items-center justify-center gap-2 border border-amber-500/20 bg-amber-500/10 text-amber-400 font-black py-3.5 rounded-[18px] transition-all text-sm"><Crown size={16} /> {t.pro}</button>
              ) : (
                <button onClick={onCreateRoutine} className="w-full flex items-center justify-center gap-2 border border-dashed border-blue-500/25 bg-blue-500/5 text-blue-300 hover:text-white hover:bg-blue-500/10 font-black py-3.5 rounded-[18px] transition-all text-sm mt-2"><Plus size={16} /> {t.createRoutine}</button>
              )}
            </div>
          )}
        </div>

        <div className="space-y-3 pb-8">
          <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-widest pl-2">{t.history}</h2>
          {workouts.length === 0 ? <div className="text-center text-slate-500 py-12 text-sm font-semibold bg-gradient-to-br from-slate-900/90 to-slate-950 rounded-[28px] border border-white/10">{t.noHistory}</div> : (
            <div className="space-y-3">
              {workouts.slice(0, 5).map(workout => {
                const duration = workout.endTime ? workout.endTime - workout.startTime : 0;
                const totalSets = workout.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0);
                return (
                  <div key={workout.id} className="bg-gradient-to-br from-slate-900/95 to-slate-950 border border-white/10 rounded-[24px] p-5 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div><h3 className="text-white font-black text-lg">{workout.name}</h3><p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1">{new Date(workout.startTime).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US')}</p></div>
                      <button onClick={() => deleteWorkout(workout.id)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"><Trash2 size={16} /></button>
                    </div>
                    <div className="flex gap-5 border-t border-white/10 pt-4"><div className="flex items-center gap-2 text-sm text-white font-bold"><Clock size={14} />{formatTime(Math.floor(duration / 1000))}</div><div className="flex items-center gap-2 text-sm text-white font-bold"><Dumbbell size={14} />{totalSets} {t.sets}</div></div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
