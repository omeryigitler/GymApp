import { useEffect, useState } from 'react';
import { Check, Plus, Timer, X } from 'lucide-react';
import { EXERCISES } from '../data';
import { Exercise, Routine, SetType, Workout, WorkoutExercise, WorkoutSet } from '../types';
import { useAppContext } from '../context/AppContext';
import { translations } from '../i18n';
import { cn, formatTime, generateId } from '../utils';

export function ActiveWorkout({ routine, onFinish, onCancel }: { routine?: Routine; onFinish: (w: Workout) => void; onCancel: () => void }) {
  const { addWorkout, workouts, lang } = useAppContext();
  const t = translations[lang];

  const [activeWorkout, setActiveWorkout] = useState<Workout>(() => ({
    id: generateId(),
    name: routine?.name || t.workoutName,
    startTime: Date.now(),
    exercises: routine ? routine.exercises.map(item => ({
      id: generateId(),
      exercise: item.exercise,
      restTime: item.restTime,
      notes: item.notes,
      supersetId: item.supersetId,
      sets: Array.from({ length: item.targetSets }).map(() => ({ id: generateId(), weight: '', reps: item.targetReps, time: item.targetTime || '', completed: false }))
    })) : []
  }));
  const [elapsed, setElapsed] = useState(0);
  const [restTimeLeft, setRestTimeLeft] = useState<number | null>(null);

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
      sets: [{ id: generateId(), weight: '', reps: '', completed: false }]
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
        sets: [...current.sets, { id: generateId(), weight: last?.weight || '', reps: last?.reps || '', time: last?.time || '', completed: false }]
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

  const removeExercise = (exerciseIndex: number) => {
    setActiveWorkout(prev => ({ ...prev, exercises: prev.exercises.filter((_, index) => index !== exerciseIndex) }));
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
    <div className="flex flex-col h-full bg-slate-950 relative">
      {restTimeLeft !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={cn('w-full max-w-sm rounded-[2rem] p-8 flex flex-col items-center text-center', restTimeLeft <= 3 ? 'bg-red-600/90' : 'bg-slate-900 border border-slate-800')}>
            <p className="font-bold uppercase tracking-widest mb-4 text-blue-500">{t.rest}</p>
            <div className="font-mono font-black text-7xl text-white">{formatTime(restTimeLeft)}</div>
            <button onClick={() => setRestTimeLeft(null)} className="mt-10 bg-slate-800 text-slate-300 py-3 px-8 rounded-full font-bold">{t.skip}</button>
          </div>
        </div>
      )}

      <div className="sticky top-0 z-10 bg-slate-950 p-5 flex items-center justify-between">
        <div className="flex items-center gap-2"><Timer size={18} className="text-blue-500" /><span className="font-extrabold text-white">{formatTime(elapsed)}</span></div>
        <button onClick={handleFinish} className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-2 px-6 rounded-full text-sm transition-colors">{t.finish}</button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-28 hide-scrollbar">
        <input type="text" value={activeWorkout.name} onChange={e => setActiveWorkout({ ...activeWorkout, name: e.target.value })} className="bg-transparent border-none text-[28px] font-extrabold text-white w-full focus:outline-none placeholder-slate-700 mb-6" placeholder={t.workoutName} />

        <div className="grid grid-cols-2 gap-2 mb-6">
          {EXERCISES.slice(0, 8).map(exercise => <button key={exercise.id} onClick={() => addExercise(exercise)} className="bg-slate-900 text-slate-200 rounded-xl p-3 text-xs font-bold text-left border border-slate-800">+ {exercise.name[lang]}</button>)}
        </div>

        <div className="space-y-4">
          {activeWorkout.exercises.map((exercise, exerciseIndex) => (
            <div key={exercise.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-4">
              <div className="flex items-start justify-between mb-4">
                <div><h3 className="text-white font-bold text-lg">{exercise.exercise.name[lang]}</h3><p className="text-xs text-blue-400 font-medium mt-1">{exercise.exercise.muscle[lang]}</p></div>
                <button onClick={() => removeExercise(exerciseIndex)} className="text-slate-500 hover:text-red-400"><X size={18} /></button>
              </div>
              <div className="space-y-2">
                {exercise.sets.map((set, setIndex) => (
                  <div key={set.id} className={cn('grid grid-cols-[28px_1fr_1fr_40px] gap-2 items-center rounded-xl p-1', set.completed && 'bg-blue-500/10')}>
                    <span className="text-xs font-bold text-slate-500 text-center">{setIndex + 1}</span>
                    <input type="number" inputMode="decimal" value={set.weight} onChange={e => updateSet(exerciseIndex, setIndex, 'weight', e.target.value)} placeholder={t.placeholderWeight} className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-lg py-2 px-2 text-center text-sm font-bold focus:outline-none" />
                    <input type="number" inputMode="numeric" value={set.reps} onChange={e => updateSet(exerciseIndex, setIndex, 'reps', e.target.value)} placeholder={t.placeholderReps} className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-lg py-2 px-2 text-center text-sm font-bold focus:outline-none" />
                    <button onClick={() => updateSet(exerciseIndex, setIndex, 'completed', !set.completed)} className={cn('w-9 h-9 rounded-xl flex items-center justify-center transition-all', set.completed ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400')}><Check size={18} /></button>
                  </div>
                ))}
              </div>
              <button onClick={() => addSet(exerciseIndex)} className="w-full mt-3 flex items-center justify-center gap-1.5 text-slate-400 bg-slate-950/50 border border-slate-800 hover:bg-slate-800 hover:text-white py-2.5 rounded-xl text-sm font-bold transition-colors"><Plus size={16} /> {t.addSet}</button>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-5 bg-slate-950 max-w-md mx-auto border-x border-slate-900/50">
        <button onClick={handleCancel} className="w-full py-4 rounded-2xl border border-red-900 bg-red-950/30 text-red-500 font-extrabold hover:bg-red-900/40 transition-colors">{t.cancel}</button>
      </div>
    </div>
  );
}
