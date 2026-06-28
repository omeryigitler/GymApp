import { useEffect, useMemo, useState } from 'react';
import { Check, Dumbbell, Link2, Plus, StickyNote, Timer, X } from 'lucide-react';
import { EXERCISES } from '../data';
import { Exercise, Routine, SetType, Workout, WorkoutExercise, WorkoutSet } from '../types';
import { useAppContext } from '../context/AppContext';
import { translations } from '../i18n';
import { cn, formatTime, generateId } from '../utils';

const SET_TYPES: SetType[] = ['normal', 'warmup', 'dropset', 'failure'];
const SET_TYPE_LABELS: Record<SetType, string> = {
  normal: 'Normal',
  warmup: 'Isınma',
  dropset: 'Drop',
  failure: 'Tükeniş'
};
const SET_TYPE_STYLES: Record<SetType, string> = {
  normal: 'bg-slate-800 text-slate-300 border-slate-700',
  warmup: 'bg-amber-500/10 text-amber-300 border-amber-500/25',
  dropset: 'bg-violet-500/10 text-violet-300 border-violet-500/25',
  failure: 'bg-red-500/10 text-red-300 border-red-500/25'
};

export function ActiveWorkout({ routine, onFinish, onCancel }: { routine?: Routine; onFinish: (w: Workout) => void; onCancel: () => void }) {
  const { addWorkout, workouts, lang } = useAppContext();
  const t = translations[lang];
  const [exerciseQuery, setExerciseQuery] = useState('');

  const [activeWorkout, setActiveWorkout] = useState<Workout>(() => ({
    id: generateId(),
    name: routine?.name || t.workoutName,
    startTime: Date.now(),
    notes: '',
    exercises: routine ? routine.exercises.map(item => ({
      id: generateId(),
      exercise: item.exercise,
      restTime: item.restTime,
      notes: item.notes || '',
      supersetId: item.supersetId,
      sets: Array.from({ length: item.targetSets }).map(() => ({
        id: generateId(),
        weight: '',
        reps: item.targetReps,
        time: item.targetTime || '',
        completed: false,
        type: 'normal' as SetType
      }))
    })) : []
  }));

  const [elapsed, setElapsed] = useState(0);
  const [restTimeLeft, setRestTimeLeft] = useState<number | null>(null);

  const completedSets = activeWorkout.exercises.reduce((total, exercise) => total + exercise.sets.filter(set => set.completed).length, 0);
  const totalVolume = activeWorkout.exercises.reduce((total, exercise) => total + exercise.sets.reduce((setTotal, set) => {
    if (!set.completed || !set.weight || !set.reps) return setTotal;
    return setTotal + parseFloat(set.weight) * parseInt(set.reps, 10);
  }, 0), 0);

  const filteredExercises = useMemo(() => {
    const query = exerciseQuery.trim().toLowerCase();
    return EXERCISES.filter(exercise => !query || exercise.name[lang].toLowerCase().includes(query) || exercise.muscle[lang].toLowerCase().includes(query)).slice(0, 8);
  }, [exerciseQuery, lang]);

  useEffect(() => {
    const timer = window.setInterval(() => setElapsed(Math.floor((Date.now() - activeWorkout.startTime) / 1000)), 1000);
    return () => window.clearInterval(timer);
  }, [activeWorkout.startTime]);

  useEffect(() => {
    if (restTimeLeft !== null && restTimeLeft > 0) {
      const timer = window.setTimeout(() => setRestTimeLeft(restTimeLeft - 1), 1000);
      return () => window.clearTimeout(timer);
    }
    if (restTimeLeft === 0) setRestTimeLeft(null);
  }, [restTimeLeft]);

  const addExercise = (exercise: Exercise) => {
    const newExercise: WorkoutExercise = {
      id: generateId(),
      exercise,
      restTime: 90,
      notes: '',
      sets: [{ id: generateId(), weight: '', reps: '', time: '', completed: false, type: 'normal' }]
    };
    setActiveWorkout(prev => ({ ...prev, exercises: [...prev.exercises, newExercise] }));
  };

  const addSet = (exerciseIndex: number) => {
    setActiveWorkout(prev => {
      const exercises = [...prev.exercises];
      const current = exercises[exerciseIndex];
      const last = current.sets[current.sets.length - 1];
      exercises[exerciseIndex] = {
        ...current,
        sets: [...current.sets, {
          id: generateId(),
          weight: last?.weight || '',
          reps: last?.reps || '',
          time: last?.time || '',
          rpe: last?.rpe,
          type: last?.type || 'normal',
          completed: false
        }]
      };
      return { ...prev, exercises };
    });
  };

  const updateSet = (exerciseIndex: number, setIndex: number, field: keyof WorkoutSet, value: string | boolean | number | SetType | undefined) => {
    setActiveWorkout(prev => {
      const exercises = [...prev.exercises];
      const currentExercise = { ...exercises[exerciseIndex] };
      const sets = [...currentExercise.sets];
      const currentSet = { ...sets[setIndex] };
      if (field === 'completed' && value === true && !currentSet.completed && currentExercise.restTime > 0) setRestTimeLeft(currentExercise.restTime);
      sets[setIndex] = { ...currentSet, [field]: value };
      exercises[exerciseIndex] = { ...currentExercise, sets };
      return { ...prev, exercises };
    });
  };

  const cycleSetType = (exerciseIndex: number, setIndex: number) => {
    const currentType = activeWorkout.exercises[exerciseIndex].sets[setIndex].type || 'normal';
    const nextType = SET_TYPES[(SET_TYPES.indexOf(currentType) + 1) % SET_TYPES.length];
    updateSet(exerciseIndex, setIndex, 'type', nextType);
  };

  const updateExerciseField = (exerciseIndex: number, field: keyof WorkoutExercise, value: string | number | undefined) => {
    setActiveWorkout(prev => {
      const exercises = [...prev.exercises];
      exercises[exerciseIndex] = { ...exercises[exerciseIndex], [field]: value };
      return { ...prev, exercises };
    });
  };

  const toggleSupersetWithPrevious = (exerciseIndex: number) => {
    if (exerciseIndex <= 0) return;
    setActiveWorkout(prev => {
      const exercises = [...prev.exercises];
      const current = exercises[exerciseIndex];
      const previous = exercises[exerciseIndex - 1];
      if (current.supersetId && previous.supersetId === current.supersetId) {
        exercises[exerciseIndex] = { ...current, supersetId: undefined };
        exercises[exerciseIndex - 1] = { ...previous, supersetId: undefined };
      } else {
        const supersetId = previous.supersetId || generateId();
        exercises[exerciseIndex - 1] = { ...previous, supersetId };
        exercises[exerciseIndex] = { ...current, supersetId };
      }
      return { ...prev, exercises };
    });
  };

  const removeExercise = (exerciseIndex: number) => {
    setActiveWorkout(prev => ({ ...prev, exercises: prev.exercises.filter((_, index) => index !== exerciseIndex) }));
  };

  const previousSetText = (exerciseId: string, setIndex: number) => {
    const previousExercise = workouts.flatMap(workout => workout.exercises).find(item => item.exercise.id === exerciseId);
    const previousSet = previousExercise?.sets?.[setIndex];
    if (!previousSet) return '-';
    const parts = [];
    if (previousSet.weight) parts.push(`${previousSet.weight}kg`);
    if (previousSet.reps) parts.push(`${previousSet.reps} tekrar`);
    if (previousSet.time) parts.push(`${previousSet.time} sn`);
    return parts.length ? parts.join(' / ') : '-';
  };

  const handleFinish = () => {
    const hasCompletedSet = activeWorkout.exercises.some(exercise => exercise.sets.some(set => set.completed));
    if (!hasCompletedSet) {
      alert(lang === 'tr' ? 'Antrenmanı kaydetmek için en az bir set tamamlamalısınız.' : 'Complete at least one set before saving the workout.');
      return;
    }
    const completedWorkout = { ...activeWorkout, endTime: Date.now() };
    addWorkout(completedWorkout);
    onFinish(completedWorkout);
  };

  const handleCancel = () => {
    if (confirm(t.confirmCancel)) onCancel();
  };

  return (
    <div className="flex flex-col h-full bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.18),_transparent_36%),#020617] relative">
      {restTimeLeft !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl">
          <div className={cn('w-full max-w-sm rounded-[2rem] p-8 flex flex-col items-center text-center border shadow-2xl', restTimeLeft <= 3 ? 'bg-red-600/90 border-red-300/30 shadow-red-500/30' : 'bg-slate-900/95 border-blue-500/30 shadow-blue-500/20')}>
            <p className="font-black uppercase tracking-widest mb-4 text-blue-400">{t.rest}</p>
            <div className="font-mono font-black text-7xl text-white drop-shadow-lg">{formatTime(restTimeLeft)}</div>
            <button onClick={() => setRestTimeLeft(null)} className="mt-10 bg-white/10 hover:bg-white/15 text-slate-100 border border-white/10 py-3 px-8 rounded-full font-black transition-all">{t.skip}</button>
          </div>
        </div>
      )}

      <div className="sticky top-0 z-10 bg-slate-950/80 p-5 flex items-center justify-between border-b border-white/5 backdrop-blur-2xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-[0_0_30px_rgba(37,99,235,0.2)]"><Timer size={20} /></div>
          <div>
            <span className="font-mono font-black text-white text-lg">{formatTime(elapsed)}</span>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{completedSets} set • {totalVolume.toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US')} kg</p>
          </div>
        </div>
        <button onClick={handleFinish} className="bg-blue-600 hover:bg-blue-500 text-white font-black py-2.5 px-6 rounded-full text-sm transition-colors shadow-lg shadow-blue-600/25">{t.finish}</button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-32 hide-scrollbar">
        <input type="text" value={activeWorkout.name} onChange={event => setActiveWorkout({ ...activeWorkout, name: event.target.value })} className="bg-transparent border-none text-[32px] font-black text-white w-full focus:outline-none placeholder-slate-700 mt-6 mb-3 tracking-tight" placeholder={t.workoutName} />
        <textarea value={activeWorkout.notes || ''} onChange={event => setActiveWorkout({ ...activeWorkout, notes: event.target.value })} placeholder="Antrenman notu..." className="w-full bg-slate-950/50 border border-white/10 rounded-2xl p-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/70 mb-6 resize-none" rows={2} />

        <div className="relative overflow-hidden rounded-[28px] border border-blue-500/30 bg-gradient-to-br from-blue-950/35 via-slate-900/85 to-slate-950 p-4 mb-6 shadow-[0_20px_70px_-45px_rgba(37,99,235,0.9)]">
          <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="relative flex items-center justify-between mb-3">
            <div>
              <h3 className="text-white font-black text-lg">Egzersiz Ekle</h3>
              <p className="text-xs text-slate-500 font-semibold">Arama ile hızlı ekle.</p>
            </div>
            <Dumbbell className="text-blue-400" size={22} />
          </div>
          <input value={exerciseQuery} onChange={event => setExerciseQuery(event.target.value)} placeholder="Egzersiz ara..." className="relative w-full bg-slate-950/60 border border-white/10 rounded-2xl py-3 px-4 text-white text-sm font-semibold placeholder:text-slate-600 focus:outline-none focus:border-blue-500/70 mb-3" />
          <div className="relative grid grid-cols-2 gap-2">
            {filteredExercises.map(exercise => <button key={exercise.id} onClick={() => addExercise(exercise)} className="bg-slate-950/50 hover:bg-slate-900/90 text-slate-200 rounded-2xl p-3 text-xs font-black text-left border border-white/10 hover:border-blue-500/40 transition-all active:scale-[0.98]"><span className="text-blue-400">+</span> {exercise.name[lang]}</button>)}
          </div>
        </div>

        <div className="space-y-4">
          {activeWorkout.exercises.map((exercise, exerciseIndex) => (
            <div key={exercise.id} className="bg-gradient-to-br from-slate-900/95 to-slate-950 border border-white/10 rounded-[28px] p-4 shadow-[0_20px_70px_-55px_rgba(37,99,235,0.8)]">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0"><Dumbbell size={21} /></div>
                  <div className="min-w-0"><h3 className="text-white font-black text-lg truncate">{exercise.exercise.name[lang]}</h3><p className="text-xs text-blue-400 font-bold mt-1 uppercase tracking-widest">{exercise.exercise.muscle[lang]} {exercise.supersetId ? '• SUPERSET' : ''}</p></div>
                </div>
                <button onClick={() => removeExercise(exerciseIndex)} className="text-slate-500 hover:text-red-400 w-9 h-9 rounded-xl hover:bg-red-500/10 flex items-center justify-center shrink-0"><X size={18} /></button>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <label className="bg-slate-950/40 border border-white/10 rounded-2xl p-2">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Dinlenme sn</span>
                  <input type="number" min="0" value={exercise.restTime} onChange={event => updateExerciseField(exerciseIndex, 'restTime', parseInt(event.target.value, 10) || 0)} className="w-full bg-transparent text-white font-black text-sm focus:outline-none mt-1" />
                </label>
                <button disabled={exerciseIndex === 0} onClick={() => toggleSupersetWithPrevious(exerciseIndex)} className={cn('rounded-2xl border p-2 flex items-center justify-center gap-2 text-xs font-black transition-all', exercise.supersetId ? 'bg-violet-500/15 border-violet-500/30 text-violet-300' : 'bg-slate-950/40 border-white/10 text-slate-500 hover:text-white disabled:opacity-40')}><Link2 size={15} /> Süper Set</button>
              </div>

              <textarea value={exercise.notes || ''} onChange={event => updateExerciseField(exerciseIndex, 'notes', event.target.value)} placeholder="Egzersiz notu..." className="w-full bg-slate-950/40 border border-white/10 rounded-2xl p-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/70 mb-3 resize-none" rows={2} />

              <div className="space-y-2">
                {exercise.sets.map((set, setIndex) => {
                  const setType = set.type || 'normal';
                  return (
                    <div key={set.id} className={cn('rounded-2xl p-2 border transition-all space-y-2', set.completed ? 'bg-blue-500/10 border-blue-500/20' : 'bg-slate-950/35 border-white/5')}>
                      <div className="grid grid-cols-[30px_1fr_1fr_1fr_42px] gap-2 items-center">
                        <span className="text-xs font-black text-slate-500 text-center">{setIndex + 1}</span>
                        <input type="number" inputMode="decimal" value={set.weight} onChange={event => updateSet(exerciseIndex, setIndex, 'weight', event.target.value)} placeholder={t.placeholderWeight} className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-xl py-2.5 px-2 text-center text-sm font-black focus:outline-none focus:border-blue-500/70" />
                        <input type="number" inputMode="numeric" value={set.reps} onChange={event => updateSet(exerciseIndex, setIndex, 'reps', event.target.value)} placeholder={t.placeholderReps} className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-xl py-2.5 px-2 text-center text-sm font-black focus:outline-none focus:border-blue-500/70" />
                        <input type="number" inputMode="numeric" value={set.time || ''} onChange={event => updateSet(exerciseIndex, setIndex, 'time', event.target.value)} placeholder="sn" className="w-full bg-slate-950/60 border border-slate-800 text-white rounded-xl py-2.5 px-2 text-center text-sm font-black focus:outline-none focus:border-blue-500/70" />
                        <button onClick={() => updateSet(exerciseIndex, setIndex, 'completed', !set.completed)} className={cn('w-10 h-10 rounded-xl flex items-center justify-center transition-all', set.completed ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' : 'bg-slate-800 text-slate-400 hover:bg-slate-700')}><Check size={18} /></button>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <button onClick={() => cycleSetType(exerciseIndex, setIndex)} className={`border rounded-xl py-2 px-2 font-black ${SET_TYPE_STYLES[setType]}`}>{SET_TYPE_LABELS[setType]}</button>
                        <input type="number" min="1" max="10" value={set.rpe || ''} onChange={event => updateSet(exerciseIndex, setIndex, 'rpe', event.target.value ? parseInt(event.target.value, 10) : undefined)} placeholder="RPE" className="bg-slate-950/60 border border-slate-800 rounded-xl py-2 px-2 text-center text-white font-black focus:outline-none focus:border-blue-500/70" />
                        <div className="bg-slate-950/40 border border-white/5 rounded-xl py-2 px-2 text-slate-500 truncate">Önceki: {previousSetText(exercise.exercise.id, setIndex)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button onClick={() => addSet(exerciseIndex)} className="w-full mt-3 flex items-center justify-center gap-1.5 text-blue-300 bg-blue-500/5 border border-blue-500/20 hover:bg-blue-500/10 hover:text-white py-2.5 rounded-2xl text-sm font-black transition-colors"><Plus size={16} /> {t.addSet}</button>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-5 bg-slate-950/95 backdrop-blur-xl max-w-md mx-auto border-x border-slate-900/50">
        <button onClick={handleCancel} className="w-full py-4 rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400 font-black hover:bg-red-500/15 transition-colors">{t.cancel}</button>
      </div>
    </div>
  );
}
