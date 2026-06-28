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
    <div className="flex-1 overflow-y-auto pb-24 bg-slate-950 hide-scrollbar">
      <div className="px-5 pt-8 pb-6 flex items-center justify-between sticky top-0 bg-slate-950/80 backdrop-blur-xl z-10 border-b border-white/5">
        <button onClick={onOpenProfile} className="flex items-center gap-3 text-left hover:opacity-80 transition-opacity active:scale-95">
          <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center text-white font-extrabold text-lg shadow-[0_0_15px_rgba(59,130,246,0.5)] ring-2 ring-slate-950">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white leading-tight tracking-tight">{user?.name}</h1>
            <p className="text-blue-400 text-xs font-bold tracking-widest uppercase">{t.appTitle}</p>
          </div>
        </button>
        <div className="flex items-center gap-2">
          {!isPremium && (
            <button onClick={onShowPaywall} className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-500 border border-amber-500/30 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
              <Crown size={14} /> PRO
            </button>
          )}
          <button onClick={logout} className="text-slate-500 hover:text-white p-2.5 transition-colors rounded-full hover:bg-white/5">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <div className="px-5 space-y-8 pt-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900/80 border border-white/5 rounded-[20px] p-4">
            <div className="flex items-center gap-2 text-blue-400 mb-2.5"><CalendarDays size={16} /><span className="text-[10px] font-bold uppercase tracking-widest">Antrenman</span></div>
            <p className="text-4xl font-black text-white">{totalWorkouts}</p>
          </div>
          <div className="bg-slate-900/80 border border-white/5 rounded-[20px] p-4">
            <div className="flex items-center gap-2 text-emerald-400 mb-2.5"><Activity size={16} /><span className="text-[10px] font-bold uppercase tracking-widest">Hacim</span></div>
            <p className="text-3xl font-black text-white flex items-baseline gap-1">{totalVolume.toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US')} <span className="text-sm text-slate-500 font-bold">kg</span></p>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest pl-2">Hızlı Başla</h2>
          <button onClick={onStartEmpty} className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-[24px] p-5 flex items-center gap-4 transition-all active:scale-[0.98] shadow-[0_10px_30px_-10px_rgba(59,130,246,0.6)] border border-white/10">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0"><Plus size={28} /></div>
            <div className="text-left"><h3 className="font-black text-xl leading-tight mb-1">{t.startEmpty}</h3><p className="text-blue-100/80 text-sm font-semibold">{t.startEmptyDesc}</p></div>
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between pl-2">
            <h2 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">{t.myRoutines}</h2>
            {routines.length > 0 && <span className="text-[10px] font-black text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg">{routines.length} / {isPremium ? '∞' : '2'}</span>}
          </div>

          {routines.length === 0 ? (
            <div className="border-2 border-dashed border-white/10 bg-slate-900/30 rounded-[24px] p-8 text-center flex flex-col items-center justify-center">
              <Dumbbell className="text-slate-400 mb-4" size={28} />
              <p className="text-sm text-slate-400 font-semibold mb-5">{t.noRoutines}</p>
              <button onClick={onCreateRoutine} className="text-white font-extrabold text-sm bg-white/10 px-6 py-3 rounded-xl">{t.createRoutine}</button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {routines.map(routine => (
                <div key={routine.id} onClick={() => onStartRoutine(routine.id)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onStartRoutine(routine.id); } }} className="bg-slate-900/80 border border-white/5 rounded-[20px] p-4 flex items-center justify-between hover:bg-slate-800/80 hover:border-white/10 transition-all cursor-pointer group shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/60">
                  <div>
                    <h3 className="text-white font-bold text-base mb-1">{routine.name}</h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{routine.exercises.map(e => e.exercise.name[lang]).join(', ').slice(0, 45)}{routine.exercises.length > 2 ? '...' : ''}</p>
                  </div>
                  <div className="flex items-center gap-1.5 ml-2">
                    <button onClick={(e) => { e.stopPropagation(); onEditRoutine(routine.id); }} className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-colors shrink-0"><Edit3 size={18} /></button>
                    <button onClick={(e) => { e.stopPropagation(); deleteRoutine(routine.id); }} className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"><Trash2 size={18} /></button>
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/30 group-hover:scale-105 active:scale-95 transition-all shrink-0"><Play size={18} fill="currentColor" className="ml-1" /></div>
                  </div>
                </div>
              ))}
              {(!isPremium && routines.length >= 2) ? (
                <button onClick={onShowPaywall} className="w-full flex items-center justify-center gap-2 border border-amber-500/20 bg-amber-500/10 text-amber-500 font-extrabold py-3.5 rounded-[16px] transition-all text-sm"><Crown size={16} /> {t.pro}</button>
              ) : (
                <button onClick={onCreateRoutine} className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-white/10 text-slate-400 hover:text-white font-bold py-3.5 rounded-[16px] transition-all text-sm mt-2"><Plus size={16} /> {t.createRoutine}</button>
              )}
            </div>
          )}
        </div>

        <div className="space-y-3 pb-8">
          <h2 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest pl-2">{t.history}</h2>
          {workouts.length === 0 ? <div className="text-center text-slate-500 py-12 text-sm font-semibold bg-slate-900/50 rounded-[24px] border border-white/5">{t.noHistory}</div> : (
            <div className="space-y-3">
              {workouts.slice(0, 5).map(workout => {
                const duration = workout.endTime ? workout.endTime - workout.startTime : 0;
                const totalSets = workout.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0);
                return (
                  <div key={workout.id} className="bg-slate-900/80 border border-white/5 rounded-[20px] p-5 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div><h3 className="text-white font-extrabold text-lg">{workout.name}</h3><p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1">{new Date(workout.startTime).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US')}</p></div>
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
