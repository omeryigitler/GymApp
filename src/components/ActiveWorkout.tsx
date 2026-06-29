import { useEffect, useState } from 'react';
import { Check, Clock, Dumbbell, MoreHorizontal, Plus, Timer, X } from 'lucide-react';
import { Workout, WorkoutExercise, Exercise, WorkoutSet, Routine, SetType } from '../types';
import { generateId, formatTime, cn } from '../utils';
import { useAppContext } from '../context/AppContext';
import { ExercisePicker } from './ExercisePicker';
import { translations } from '../i18n';

export function ActiveWorkout({
  routine,
  onFinish,
  onCancel
}: {
  routine?: Routine;
  onFinish: (w: Workout) => void;
  onCancel: () => void;
}) {
  const { addWorkout, workouts, lang } = useAppContext();
  const t = translations[lang];

  const [activeWorkout, setActiveWorkout] = useState<Workout>(() => {
    const startTime = Date.now();

    if (routine) {
      return {
        id: generateId(),
        name: routine.name,
        startTime,
        exercises: routine.exercises.map(routineExercise => {
          let lastWeight = '';

          for (const workout of workouts) {
            const pastExercise = workout.exercises.find(exercise => exercise.exercise.id === routineExercise.exercise.id);
            if (pastExercise && pastExercise.sets.length > 0) {
              const completedSets = pastExercise.sets.filter(set => set.completed);
              if (completedSets.length > 0) {
                lastWeight = completedSets[completedSets.length - 1].weight;
              } else {
                lastWeight = pastExercise.sets[0].weight;
              }
              break;
            }
          }

          return {
            id: generateId(),
            exercise: routineExercise.exercise,
            restTime: routineExercise.restTime,
            notes: routineExercise.notes,
            supersetId: routineExercise.supersetId,
            sets: Array.from({ length: routineExercise.targetSets }).map(() => ({
              id: generateId(),
              weight: lastWeight,
              reps: routineExercise.targetReps,
              time: routineExercise.targetTime || '',
              completed: false
            }))
          };
        })
      };
    }

    return {
      id: generateId(),
      name: t.workoutName,
      startTime,
      exercises: []
    };
  });

  const [elapsed, setElapsed] = useState(0);
  const [showPicker, setShowPicker] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState<number | null>(null);
  const [showSettingsFor, setShowSettingsFor] = useState<number | null>(null);

  const completedSets = activeWorkout.exercises.reduce((total, exercise) => total + exercise.sets.filter(set => set.completed).length, 0);
  const totalVolume = activeWorkout.exercises.reduce((total, exercise) => total + exercise.sets.reduce((setTotal, set) => {
    if (!set.completed || !set.weight || !set.reps) return setTotal;
    return setTotal + parseFloat(set.weight) * parseInt(set.reps, 10);
  }, 0), 0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - activeWorkout.startTime) / 1000));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [activeWorkout.startTime]);

  useEffect(() => {
    if (restTimeLeft !== null && restTimeLeft > 0) {
      const timer = window.setTimeout(() => setRestTimeLeft(restTimeLeft - 1), 1000);
      return () => window.clearTimeout(timer);
    }

    if (restTimeLeft === 0) {
      setRestTimeLeft(null);
    }
  }, [restTimeLeft]);

  const handleAddExercise = (exercise: Exercise) => {
    let lastWeight = '';
    let lastReps = '';

    for (const workout of workouts) {
      const pastExercise = workout.exercises.find(item => item.exercise.id === exercise.id);
      if (pastExercise && pastExercise.sets.length > 0) {
        const completedSetsForExercise = pastExercise.sets.filter(set => set.completed);
        if (completedSetsForExercise.length > 0) {
          lastWeight = completedSetsForExercise[completedSetsForExercise.length - 1].weight;
          lastReps = completedSetsForExercise[completedSetsForExercise.length - 1].reps;
        } else {
          lastWeight = pastExercise.sets[0].weight;
          lastReps = pastExercise.sets[0].reps;
        }
        break;
      }
    }

    const newExercise: WorkoutExercise = {
      id: generateId(),
      exercise,
      restTime: 90,
      sets: [{ id: generateId(), weight: lastWeight, reps: lastReps, completed: false }]
    };

    setActiveWorkout(prev => ({ ...prev, exercises: [...prev.exercises, newExercise] }));
    setShowPicker(false);
  };

  const addSet = (exerciseIndex: number) => {
    const newWorkout = { ...activeWorkout };
    newWorkout.exercises = [...newWorkout.exercises];
    const exercise = { ...newWorkout.exercises[exerciseIndex] };
    exercise.sets = [...exercise.sets];
    const lastSet = exercise.sets[exercise.sets.length - 1];

    exercise.sets.push({
      id: generateId(),
      weight: lastSet ? lastSet.weight : '',
      reps: lastSet ? lastSet.reps : '',
      time: lastSet ? lastSet.time : '',
      completed: false
    });

    newWorkout.exercises[exerciseIndex] = exercise;
    setActiveWorkout(newWorkout);
  };

  const updateRestTime = (exerciseIndex: number, newRestTime: number) => {
    const newWorkout = { ...activeWorkout };
    newWorkout.exercises = [...newWorkout.exercises];
    newWorkout.exercises[exerciseIndex] = { ...newWorkout.exercises[exerciseIndex], restTime: newRestTime };
    setActiveWorkout(newWorkout);
  };

  const updateSet = (exerciseIndex: number, setIndex: number, field: keyof WorkoutSet, value: string | boolean | number | SetType | undefined) => {
    const newWorkout = { ...activeWorkout };
    newWorkout.exercises = [...newWorkout.exercises];
    const exercise = { ...newWorkout.exercises[exerciseIndex] };
    exercise.sets = [...exercise.sets];
    const set = { ...exercise.sets[setIndex] };

    if (field === 'completed') {
      const isCompleting = value as boolean;
      if (isCompleting && !set.completed && exercise.restTime > 0) {
        setRestTimeLeft(exercise.restTime);
      }
    }

    exercise.sets[setIndex] = { ...set, [field]: value };
    newWorkout.exercises[exerciseIndex] = exercise;
    setActiveWorkout(newWorkout);
  };

  const removeExercise = (index: number) => {
    const newWorkout = { ...activeWorkout };
    newWorkout.exercises = [...newWorkout.exercises];
    newWorkout.exercises.splice(index, 1);
    setActiveWorkout(newWorkout);
  };

  const toggleExerciseNotes = (exerciseIndex: number) => {
    const newWorkout = { ...activeWorkout };
    newWorkout.exercises = [...newWorkout.exercises];
    newWorkout.exercises[exerciseIndex] = {
      ...newWorkout.exercises[exerciseIndex],
      notes: newWorkout.exercises[exerciseIndex].notes !== undefined ? undefined : ''
    };
    setActiveWorkout(newWorkout);
  };

  const updateExerciseNotes = (exerciseIndex: number, notes: string) => {
    const newWorkout = { ...activeWorkout };
    newWorkout.exercises = [...newWorkout.exercises];
    newWorkout.exercises[exerciseIndex] = { ...newWorkout.exercises[exerciseIndex], notes };
    setActiveWorkout(newWorkout);
  };

  const toggleSuperset = (exerciseIndex: number) => {
    if (exerciseIndex <= 0) return;

    const newWorkout = { ...activeWorkout };
    newWorkout.exercises = [...newWorkout.exercises];
    const prevExercise = newWorkout.exercises[exerciseIndex - 1];
    const currentExercise = newWorkout.exercises[exerciseIndex];

    if (currentExercise.supersetId && currentExercise.supersetId === prevExercise.supersetId) {
      currentExercise.supersetId = undefined;
    } else {
      const supersetId = prevExercise.supersetId || generateId();
      prevExercise.supersetId = supersetId;
      currentExercise.supersetId = supersetId;
    }

    setActiveWorkout(newWorkout);
  };

  const getPreviousSetText = (exerciseId: string, setIndex: number) => {
    for (const workout of workouts) {
      const pastExercise = workout.exercises.find(exercise => exercise.exercise.id === exerciseId);
      if (pastExercise && pastExercise.sets[setIndex] && pastExercise.sets[setIndex].completed) {
        const previousSet = pastExercise.sets[setIndex];
        const parts = [];
        if (previousSet.weight) parts.push(previousSet.weight);
        if (previousSet.reps) parts.push(previousSet.reps);
        if (previousSet.time) parts.push(`${previousSet.time}s`);
        return parts.length > 0 ? parts.join(' x ') : '-';
      }
    }
    return '-';
  };

  const cycleSetType = (exerciseIndex: number, setIndex: number) => {
    const currentSet = activeWorkout.exercises[exerciseIndex].sets[setIndex];
    const types: (SetType | undefined)[] = ['normal', 'warmup', 'dropset', 'failure'];
    const currentIndex = types.indexOf(currentSet.type || 'normal');
    const nextType = types[(currentIndex + 1) % types.length];
    updateSet(exerciseIndex, setIndex, 'type', nextType);
  };

  const getSetTypeDisplay = (set: WorkoutSet, setIndex: number) => {
    if (set.type === 'warmup') return { label: 'W', className: 'bg-orange-500/20 text-orange-300 border-orange-500/30' };
    if (set.type === 'dropset') return { label: 'D', className: 'bg-red-500/20 text-red-300 border-red-500/30' };
    if (set.type === 'failure') return { label: 'F', className: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
    if (set.completed) return { label: String(setIndex + 1), className: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
    return { label: String(setIndex + 1), className: 'bg-slate-800 text-slate-400 border-slate-700' };
  };

  const handleFinish = () => {
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl animate-in fade-in duration-300">
          <div className={cn(
            'w-full max-w-sm rounded-[2rem] p-8 flex flex-col items-center justify-center text-center border shadow-2xl transition-all duration-300',
            restTimeLeft <= 3 ? 'bg-red-600/90 border-red-300/30 shadow-red-500/30 scale-105' : 'bg-slate-900/95 border-blue-500/30 shadow-blue-500/20'
          )}>
            <p className={cn('font-black uppercase tracking-widest mb-4 transition-colors', restTimeLeft <= 3 ? 'text-white' : 'text-blue-400')}>{t.rest}</p>
            <div className={cn('font-mono font-black leading-none transition-all duration-500 ease-out text-white', restTimeLeft <= 3 ? 'text-8xl animate-pulse' : restTimeLeft <= 10 ? 'text-8xl' : 'text-7xl')}>
              {formatTime(restTimeLeft)}
            </div>
            <button type="button" onClick={() => setRestTimeLeft(null)} className="mt-12 bg-white/10 hover:bg-white/15 text-slate-100 border border-white/10 py-4 px-10 rounded-full font-black transition-all text-sm uppercase tracking-wider">
              {t.skip}
            </button>
          </div>
        </div>
      )}

      <div className="sticky top-0 z-10 bg-slate-950/85 p-5 flex items-center justify-between border-b border-white/5 backdrop-blur-2xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-[0_0_30px_rgba(37,99,235,0.2)]"><Timer size={20} /></div>
          <div>
            <span className="font-mono font-black text-white text-lg">{formatTime(elapsed)}</span>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{completedSets} set • {totalVolume.toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US')} kg</p>
          </div>
        </div>
        <button type="button" onClick={handleFinish} className="bg-blue-600 hover:bg-blue-500 text-white font-black py-2.5 px-6 rounded-full text-sm transition-colors shadow-lg shadow-blue-600/25">
          {t.finish}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-28 hide-scrollbar">
        <input
          type="text"
          value={activeWorkout.name}
          onChange={event => setActiveWorkout({ ...activeWorkout, name: event.target.value })}
          className="bg-transparent border-none text-[32px] font-black text-white w-full focus:outline-none placeholder-slate-700 mt-6 mb-8 tracking-tight"
          placeholder={t.workoutName}
        />

        <div className="space-y-4 mb-6">
          {activeWorkout.exercises.map((exercise, exerciseIndex) => {
            const isSupersetWithPrev = exerciseIndex > 0 && exercise.supersetId && exercise.supersetId === activeWorkout.exercises[exerciseIndex - 1].supersetId;
            const isSupersetWithNext = exerciseIndex < activeWorkout.exercises.length - 1 && exercise.supersetId && exercise.supersetId === activeWorkout.exercises[exerciseIndex + 1].supersetId;

            return (
              <div key={exercise.id} className="relative">
                {isSupersetWithPrev && <div className="absolute -top-4 left-8 bottom-0 w-1 bg-blue-600/80 z-10" />}
                {isSupersetWithNext && !isSupersetWithPrev && <div className="absolute top-0 left-8 -bottom-4 w-1 bg-blue-600/80 z-10 rounded-t-full" />}
                {isSupersetWithPrev && !isSupersetWithNext && <div className="absolute -top-4 left-8 h-12 w-1 bg-blue-600/80 z-10 rounded-b-full" />}

                <div className={cn(
                  'relative z-0 overflow-hidden bg-gradient-to-br from-slate-900/95 to-slate-950 border border-white/10 shadow-[0_20px_70px_-55px_rgba(37,99,235,0.8)]',
                  exercise.supersetId && 'border-blue-500/45',
                  isSupersetWithPrev ? 'rounded-b-[28px] rounded-t-xl mt-1' : 'rounded-[28px]'
                )}>
                  {exercise.supersetId && <div className="absolute top-4 left-4 w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_16px_rgba(96,165,250,0.9)]" />}

                  <div className={cn('flex items-start justify-between p-4 pb-2', exercise.supersetId && 'pl-8')}>
                    <div className="min-w-0">
                      <h3 className="text-white font-black text-lg truncate">{exercise.exercise.name[lang]}</h3>
                      <p className="text-xs text-blue-400 font-bold mt-1 mb-2 uppercase tracking-widest">{exercise.exercise.muscle[lang]} {exercise.supersetId ? '• SUPERSET' : ''}</p>
                      <button type="button" onClick={() => setShowSettingsFor(showSettingsFor === exerciseIndex ? null : exerciseIndex)} className="text-blue-300 text-xs font-bold flex items-center gap-1.5">
                        <Clock size={12} /> {exercise.restTime > 0 ? `${t.restTime}: ${exercise.restTime}s` : `${t.restTime}: OFF`}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowSettingsFor(showSettingsFor === exerciseIndex ? null : exerciseIndex)}
                      className={cn('p-2 rounded-xl transition-colors', showSettingsFor === exerciseIndex ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white hover:bg-white/5')}
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </div>

                  {showSettingsFor === exerciseIndex && (
                    <div className="px-4 pb-3 space-y-2">
                      <div className="bg-slate-950/50 rounded-2xl p-3 border border-white/10 flex flex-col gap-3">
                        <div className="flex items-center justify-between gap-3">
                          <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.restTime}</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              value={exercise.restTime || ''}
                              onChange={event => updateRestTime(exerciseIndex, parseInt(event.target.value, 10) || 0)}
                              className="w-20 bg-slate-900 border border-slate-800 rounded-xl py-1.5 px-2 text-white font-bold focus:outline-none text-center focus:border-blue-500 transition-colors"
                            />
                            <span className="text-sm font-bold text-slate-500">sn</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button type="button" onClick={() => toggleExerciseNotes(exerciseIndex)} className="flex-1 bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs font-black text-white hover:bg-slate-800 transition-colors">
                            {exercise.notes !== undefined ? 'Notu Kapat' : t.addNotes}
                          </button>

                          {exerciseIndex > 0 && (
                            <button
                              type="button"
                              onClick={() => toggleSuperset(exerciseIndex)}
                              className={cn(
                                'flex-1 border rounded-xl py-2 px-3 text-xs font-black transition-colors',
                                exercise.supersetId && exercise.supersetId === activeWorkout.exercises[exerciseIndex - 1]?.supersetId
                                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20'
                                  : 'bg-slate-900 border-slate-800 text-white hover:bg-slate-800'
                              )}
                            >
                              {t.superset}
                            </button>
                          )}

                          <button type="button" onClick={() => removeExercise(exerciseIndex)} className="bg-red-500/15 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-xl py-2 px-3 text-xs font-black transition-colors">
                            Sil
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {exercise.notes !== undefined && (
                    <div className="px-4 pb-3">
                      <textarea
                        value={exercise.notes}
                        onChange={event => updateExerciseNotes(exerciseIndex, event.target.value)}
                        placeholder={`${t.notes}...`}
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors placeholder-slate-600 resize-none"
                        rows={2}
                      />
                    </div>
                  )}

                  <div className="px-4 pb-4 overflow-x-auto hide-scrollbar -mx-4">
                    <div className="min-w-[430px] px-4">
                      <div className="grid grid-cols-[30px_minmax(48px,1fr)_1fr_1fr_1fr_44px_44px] gap-2 text-center mb-2 px-1">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-center">#</span>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.previous}</span>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.weight}</span>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.reps}</span>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.duration}</span>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">RPE</span>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-center"><Check size={14} /></span>
                      </div>

                      <div className="space-y-1.5">
                        {exercise.sets.map((set, setIndex) => {
                          const typeDisplay = getSetTypeDisplay(set, setIndex);

                          return (
                            <div key={set.id} className={cn('grid grid-cols-[30px_minmax(48px,1fr)_1fr_1fr_1fr_44px_44px] gap-1.5 items-center rounded-xl p-1 transition-colors', set.completed ? 'bg-blue-500/10' : '')}>
                              <div className="text-center">
                                <button type="button" onClick={() => cycleSetType(exerciseIndex, setIndex)} className={cn('text-xs font-black w-7 h-7 rounded-full inline-flex items-center justify-center border transition-colors', typeDisplay.className)}>
                                  {typeDisplay.label}
                                </button>
                              </div>
                              <div className="text-[11px] font-medium text-slate-500 whitespace-nowrap overflow-hidden text-ellipsis px-1 flex items-center justify-center">
                                {getPreviousSetText(exercise.exercise.id, setIndex)}
                              </div>
                              <input type="number" inputMode="decimal" value={set.weight} onChange={event => updateSet(exerciseIndex, setIndex, 'weight', event.target.value)} placeholder={t.placeholderWeight} className={cn('w-full bg-slate-950/50 border text-white rounded-lg py-2.5 px-1 text-center text-sm font-bold focus:outline-none transition-colors', set.completed ? 'border-transparent bg-transparent opacity-80' : 'border-slate-800 focus:border-blue-500 focus:bg-slate-900 placeholder-slate-700')} />
                              <input type="number" inputMode="numeric" value={set.reps} onChange={event => updateSet(exerciseIndex, setIndex, 'reps', event.target.value)} placeholder={t.placeholderReps} className={cn('w-full bg-slate-950/50 border text-white rounded-lg py-2.5 px-1 text-center text-sm font-bold focus:outline-none transition-colors', set.completed ? 'border-transparent bg-transparent opacity-80' : 'border-slate-800 focus:border-blue-500 focus:bg-slate-900 placeholder-slate-700')} />
                              <div className="relative flex items-center">
                                <input type="number" min="0" inputMode="numeric" value={set.time || ''} onChange={event => updateSet(exerciseIndex, setIndex, 'time', event.target.value)} placeholder="-" className={cn('w-full bg-slate-950/50 border text-white rounded-lg py-2.5 px-1 pr-5 text-center text-sm font-bold focus:outline-none transition-colors', set.completed ? 'border-transparent bg-transparent opacity-80' : 'border-slate-800 focus:border-blue-500 focus:bg-slate-900 placeholder-slate-700')} />
                                <span className="absolute right-1.5 text-[9px] font-bold text-slate-500 pointer-events-none">sn</span>
                              </div>
                              <input type="number" min="1" max="10" inputMode="numeric" value={set.rpe || ''} onChange={event => updateSet(exerciseIndex, setIndex, 'rpe', event.target.value ? parseFloat(event.target.value) : undefined)} placeholder="-" className={cn('w-full bg-slate-950/50 border text-white rounded-lg py-2.5 px-1 text-center text-sm font-bold focus:outline-none transition-colors', set.completed ? 'border-transparent bg-transparent opacity-80' : 'border-slate-800 focus:border-blue-500 focus:bg-slate-900 placeholder-slate-700')} />
                              <div className="flex justify-center">
                                <button type="button" onClick={() => updateSet(exerciseIndex, setIndex, 'completed', !set.completed)} className={cn('w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90', set.completed ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' : 'bg-slate-800 text-slate-500 hover:text-white hover:bg-slate-700')}>
                                  <Check size={18} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <button type="button" onClick={() => addSet(exerciseIndex)} className="w-full py-3 bg-slate-950/50 hover:bg-blue-500/10 border-t border-white/10 text-blue-300 font-black text-sm flex items-center justify-center gap-2 transition-colors">
                    <Plus size={16} /> {t.addSet}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <button type="button" onClick={() => setShowPicker(true)} className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black flex items-center justify-center gap-2 hover:from-blue-500 hover:to-indigo-500 transition-colors shadow-lg shadow-blue-600/20 active:scale-[0.98] mb-6">
          <Plus size={20} /> {t.addExercise}
        </button>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-5 bg-slate-950/95 backdrop-blur-xl max-w-md mx-auto border-x border-slate-900/50">
        <button type="button" onClick={handleCancel} className="w-full py-4 rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400 font-black hover:bg-red-500/15 transition-colors">
          {t.cancel}
        </button>
      </div>

      {showPicker && <ExercisePicker onPick={handleAddExercise} onClose={() => setShowPicker(false)} />}
    </div>
  );
}
