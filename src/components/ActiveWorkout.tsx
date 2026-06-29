import { useEffect, useState } from 'react';
import { Check, Clock, Dumbbell, Link2, MoreHorizontal, Plus, Timer, X } from 'lucide-react';
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
    if (set.completed) return { label: String(setIndex + 1), className: 'bg-[#CCFF00]/20 text-[#CCFF00] border-[#CCFF00]/30' };
    return { label: String(setIndex + 1), className: 'bg-[#2a2a2a] text-[#c4c9ac] border-white/10' };
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
    <div className="flex flex-col h-full bg-[#131313] text-[#e5e2e1] relative">
      {restTimeLeft !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl animate-in fade-in duration-300">
          <div className={cn(
            'w-full max-w-sm rounded-3xl p-8 flex flex-col items-center justify-center text-center border shadow-2xl transition-all duration-300',
            restTimeLeft <= 3 ? 'bg-[#FF4D00]/90 border-[#FF4D00]/30 shadow-[#FF4D00]/30 scale-105' : 'bg-[#1C1C1E]/95 border-[#CCFF00]/25 shadow-[#CCFF00]/20'
          )}>
            <p className={cn('font-black uppercase tracking-widest mb-4 transition-colors', restTimeLeft <= 3 ? 'text-white' : 'text-[#CCFF00]')}>{t.rest}</p>
            <div className={cn('font-mono font-black leading-none transition-all duration-500 ease-out text-white', restTimeLeft <= 3 ? 'text-8xl animate-pulse' : restTimeLeft <= 10 ? 'text-8xl' : 'text-7xl')}>
              {formatTime(restTimeLeft)}
            </div>
            <button type="button" onClick={() => setRestTimeLeft(null)} className="mt-12 bg-white/10 hover:bg-white/15 text-slate-100 border border-white/10 py-4 px-10 rounded-full font-black transition-all text-sm uppercase tracking-wider">
              {t.skip}
            </button>
          </div>
        </div>
      )}

      <div className="sticky top-0 z-10 bg-[#131313]/85 h-16 px-5 flex items-center justify-between border-b border-white/10 backdrop-blur-2xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-[#1C1C1E] border border-[#CCFF00]/25 flex items-center justify-center text-[#CCFF00] kinetic-glow-lime"><Timer size={20} /></div>
          <div>
            <span className="font-mono font-black text-white text-lg">{formatTime(elapsed)}</span>
            <p className="text-[10px] text-[#c4c9ac] font-black uppercase tracking-widest">{completedSets} set • {totalVolume.toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US')} kg</p>
          </div>
        </div>
        <button type="button" onClick={handleFinish} className="bg-[#CCFF00] hover:bg-[#abd600] text-[#131313] font-black py-2.5 px-6 rounded-full text-sm transition-colors kinetic-glow-lime">
          {t.finish}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-28 hide-scrollbar">
        <input
          type="text"
          value={activeWorkout.name}
          onChange={event => setActiveWorkout({ ...activeWorkout, name: event.target.value })}
          className="bg-transparent border-none font-display text-[32px] font-black text-white w-full focus:outline-none placeholder-[#353534] mt-6 mb-8 tracking-[-0.05em]"
          placeholder={t.workoutName}
        />

        <div className="space-y-4 mb-6">
          {activeWorkout.exercises.map((exercise, exerciseIndex) => {
            const isSupersetWithPrev = exerciseIndex > 0 && exercise.supersetId && exercise.supersetId === activeWorkout.exercises[exerciseIndex - 1].supersetId;
            const isSupersetWithNext = exerciseIndex < activeWorkout.exercises.length - 1 && exercise.supersetId && exercise.supersetId === activeWorkout.exercises[exerciseIndex + 1].supersetId;
            const supersetPosition = exercise.supersetId ? activeWorkout.exercises.filter((item, index) => index <= exerciseIndex && item.supersetId === exercise.supersetId).length : 0;
            const supersetCount = exercise.supersetId ? activeWorkout.exercises.filter(item => item.supersetId === exercise.supersetId).length : 0;

            return (
              <div key={exercise.id} className="relative">
                {isSupersetWithNext && !isSupersetWithPrev && (
                  <div className="relative mb-2 overflow-hidden rounded-2xl border border-[#CCFF00]/20 bg-[#CCFF00]/10 px-4 py-3">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(204,255,0,0.18),transparent_32%)]" />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[#CCFF00] text-xs font-black uppercase tracking-widest"><Link2 size={14} /> SUPERSET</div>
                      <span className="text-[10px] text-[#c4c9ac] font-black uppercase tracking-widest">{supersetCount} hareket bağlı</span>
                    </div>
                  </div>
                )}

                {exercise.supersetId && <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-[#CCFF00] via-[#0070F3] to-[#CCFF00] opacity-80" />}

                <div className={cn(
                  'relative overflow-hidden bg-[#1C1C1E] border border-white/10 shadow-none',
                  exercise.supersetId && 'border-[#CCFF00]/25 ml-3',
                  isSupersetWithPrev ? 'rounded-b-3xl rounded-t-xl mt-1' : 'rounded-3xl'
                )}>
                  {exercise.supersetId && <div className="absolute left-3 top-4 w-8 h-8 rounded-full bg-[#CCFF00] text-[#131313] font-black text-xs flex items-center justify-center kinetic-glow-lime">A{supersetPosition}</div>}

                  <div className={cn('flex items-start justify-between p-4 pb-2', exercise.supersetId && 'pl-14')}>
                    <div className="min-w-0">
                      <h3 className="font-display text-white font-black text-lg truncate tracking-[-0.04em]">{exercise.exercise.name[lang]}</h3>
                      <p className="text-xs text-[#CCFF00] font-black mt-1 mb-2 uppercase tracking-widest">{exercise.exercise.muscle[lang]} {exercise.supersetId ? '• SUPERSET' : ''}</p>
                      <button type="button" onClick={() => setShowSettingsFor(showSettingsFor === exerciseIndex ? null : exerciseIndex)} className="text-[#0070F3] text-xs font-bold flex items-center gap-1.5">
                        <Clock size={12} /> {exercise.restTime > 0 ? `${t.restTime}: ${exercise.restTime}s` : `${t.restTime}: OFF`}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowSettingsFor(showSettingsFor === exerciseIndex ? null : exerciseIndex)}
                      className={cn('p-2 rounded-xl transition-colors', showSettingsFor === exerciseIndex ? 'bg-[#2a2a2a] text-white' : 'text-[#c4c9ac] hover:text-white hover:bg-white/5')}
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </div>

                  {showSettingsFor === exerciseIndex && (
                    <div className="px-4 pb-3 space-y-2">
                      <div className="bg-[#201f1f] rounded-2xl p-3 border border-white/10 flex flex-col gap-3">
                        <div className="flex items-center justify-between gap-3">
                          <label className="text-xs font-black text-[#c4c9ac] uppercase tracking-widest">{t.restTime}</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              value={exercise.restTime || ''}
                              onChange={event => updateRestTime(exerciseIndex, parseInt(event.target.value, 10) || 0)}
                              className="w-20 bg-[#2a2a2a] border border-white/10 rounded-xl py-1.5 px-2 text-white font-bold focus:outline-none text-center focus:border-[#CCFF00] transition-colors"
                            />
                            <span className="text-sm font-bold text-[#c4c9ac]">sn</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button type="button" onClick={() => toggleExerciseNotes(exerciseIndex)} className="flex-1 bg-[#2a2a2a] border border-white/10 rounded-xl py-2 px-3 text-xs font-black text-white hover:bg-[#353534] transition-colors">
                            {exercise.notes !== undefined ? 'Notu Kapat' : t.addNotes}
                          </button>

                          {exerciseIndex > 0 && (
                            <button
                              type="button"
                              onClick={() => toggleSuperset(exerciseIndex)}
                              className={cn(
                                'flex-1 border rounded-xl py-2 px-3 text-xs font-black transition-colors',
                                exercise.supersetId && exercise.supersetId === activeWorkout.exercises[exerciseIndex - 1]?.supersetId
                                  ? 'bg-[#CCFF00] border-[#CCFF00] text-[#131313] kinetic-glow-lime'
                                  : 'bg-[#2a2a2a] border-white/10 text-white hover:bg-[#353534]'
                              )}
                            >
                              {t.superset}
                            </button>
                          )}

                          <button type="button" onClick={() => removeExercise(exerciseIndex)} className="bg-[#FF4D00]/15 text-[#FF4D00] hover:bg-[#FF4D00] hover:text-white border border-[#FF4D00]/20 rounded-xl py-2 px-3 text-xs font-black transition-colors">
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
                        className="w-full bg-[#201f1f] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#CCFF00] transition-colors placeholder-[#8e9379] resize-none"
                        rows={2}
                      />
                    </div>
                  )}

                  <div className="px-4 pb-4 overflow-x-auto hide-scrollbar -mx-4">
                    <div className="min-w-[430px] px-4">
                      <div className="grid grid-cols-[30px_minmax(48px,1fr)_1fr_1fr_1fr_44px_44px] gap-2 text-center mb-2 px-1">
                        <span className="text-[10px] font-black text-[#8e9379] uppercase tracking-widest flex items-center justify-center">#</span>
                        <span className="text-[10px] font-black text-[#8e9379] uppercase tracking-widest">{t.previous}</span>
                        <span className="text-[10px] font-black text-[#8e9379] uppercase tracking-widest">{t.weight}</span>
                        <span className="text-[10px] font-black text-[#8e9379] uppercase tracking-widest">{t.reps}</span>
                        <span className="text-[10px] font-black text-[#8e9379] uppercase tracking-widest">{t.duration}</span>
                        <span className="text-[10px] font-black text-[#8e9379] uppercase tracking-widest">RPE</span>
                        <span className="text-[10px] font-black text-[#8e9379] uppercase tracking-widest flex items-center justify-center"><Check size={14} /></span>
                      </div>

                      <div className="space-y-1.5">
                        {exercise.sets.map((set, setIndex) => {
                          const typeDisplay = getSetTypeDisplay(set, setIndex);

                          return (
                            <div key={set.id} className={cn('grid grid-cols-[30px_minmax(48px,1fr)_1fr_1fr_1fr_44px_44px] gap-1.5 items-center rounded-xl p-1 transition-colors', set.completed ? 'bg-[#CCFF00]/10' : '')}>
                              <div className="text-center">
                                <button type="button" onClick={() => cycleSetType(exerciseIndex, setIndex)} className={cn('text-xs font-black w-7 h-7 rounded-full inline-flex items-center justify-center border transition-colors', typeDisplay.className)}>
                                  {typeDisplay.label}
                                </button>
                              </div>
                              <div className="text-[11px] font-medium text-[#8e9379] whitespace-nowrap overflow-hidden text-ellipsis px-1 flex items-center justify-center">
                                {getPreviousSetText(exercise.exercise.id, setIndex)}
                              </div>
                              <input type="number" inputMode="decimal" value={set.weight} onChange={event => updateSet(exerciseIndex, setIndex, 'weight', event.target.value)} placeholder={t.placeholderWeight} className={cn('w-full bg-[#201f1f] border text-white rounded-lg py-2.5 px-1 text-center text-sm font-bold focus:outline-none transition-colors', set.completed ? 'border-transparent bg-transparent opacity-80' : 'border-white/10 focus:border-[#CCFF00] placeholder-[#8e9379]')} />
                              <input type="number" inputMode="numeric" value={set.reps} onChange={event => updateSet(exerciseIndex, setIndex, 'reps', event.target.value)} placeholder={t.placeholderReps} className={cn('w-full bg-[#201f1f] border text-white rounded-lg py-2.5 px-1 text-center text-sm font-bold focus:outline-none transition-colors', set.completed ? 'border-transparent bg-transparent opacity-80' : 'border-white/10 focus:border-[#CCFF00] placeholder-[#8e9379]')} />
                              <div className="relative flex items-center">
                                <input type="number" min="0" inputMode="numeric" value={set.time || ''} onChange={event => updateSet(exerciseIndex, setIndex, 'time', event.target.value)} placeholder="-" className={cn('w-full bg-[#201f1f] border text-white rounded-lg py-2.5 px-1 pr-5 text-center text-sm font-bold focus:outline-none transition-colors', set.completed ? 'border-transparent bg-transparent opacity-80' : 'border-white/10 focus:border-[#CCFF00] placeholder-[#8e9379]')} />
                                <span className="absolute right-1.5 text-[9px] font-bold text-[#8e9379] pointer-events-none">sn</span>
                              </div>
                              <input type="number" min="1" max="10" inputMode="numeric" value={set.rpe || ''} onChange={event => updateSet(exerciseIndex, setIndex, 'rpe', event.target.value ? parseFloat(event.target.value) : undefined)} placeholder="-" className={cn('w-full bg-[#201f1f] border text-white rounded-lg py-2.5 px-1 text-center text-sm font-bold focus:outline-none transition-colors', set.completed ? 'border-transparent bg-transparent opacity-80' : 'border-white/10 focus:border-[#CCFF00] placeholder-[#8e9379]')} />
                              <div className="flex justify-center">
                                <button type="button" onClick={() => updateSet(exerciseIndex, setIndex, 'completed', !set.completed)} className={cn('w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90', set.completed ? 'bg-[#CCFF00] text-[#131313] kinetic-glow-lime' : 'bg-[#2a2a2a] text-[#c4c9ac] hover:text-white hover:bg-[#353534]')}>
                                  <Check size={18} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <button type="button" onClick={() => addSet(exerciseIndex)} className="w-full py-3 bg-[#201f1f] hover:bg-[#CCFF00]/10 border-t border-white/10 text-[#CCFF00] font-black text-sm flex items-center justify-center gap-2 transition-colors">
                    <Plus size={16} /> {t.addSet}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <button type="button" onClick={() => setShowPicker(true)} className="w-full py-4 rounded-full bg-[#CCFF00] text-[#131313] font-black flex items-center justify-center gap-2 hover:bg-[#abd600] transition-colors kinetic-glow-lime active:scale-[0.98] mb-6">
          <Plus size={20} /> {t.addExercise}
        </button>
      </div>

      {!showPicker && (
        <div className="fixed bottom-0 left-0 right-0 p-5 bg-[#131313]/95 backdrop-blur-xl max-w-md mx-auto border-x border-white/5 pb-safe">
          <button type="button" onClick={handleCancel} className="w-full py-4 rounded-full border border-[#FF4D00]/20 bg-[#FF4D00]/10 text-[#FF4D00] font-black hover:bg-[#FF4D00]/15 transition-colors">
            {t.cancel}
          </button>
        </div>
      )}

      {showPicker && <ExercisePicker onPick={handleAddExercise} onClose={() => setShowPicker(false)} />}
    </div>
  );
}
