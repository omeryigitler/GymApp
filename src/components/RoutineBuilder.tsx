import { useState } from 'react';
import { Link2, Plus, Save, X } from 'lucide-react';
import { Routine, RoutineExercise, Exercise } from '../types';
import { cn, generateId } from '../utils';
import { useAppContext } from '../context/AppContext';
import { ExercisePicker } from './ExercisePicker';
import { translations } from '../i18n';

export function RoutineBuilder({ onClose, routineToEdit }: { onClose: () => void; routineToEdit?: Routine }) {
  const { lang, addRoutine, updateRoutine } = useAppContext();
  const t = translations[lang];

  const [name, setName] = useState(routineToEdit?.name || '');
  const [exercises, setExercises] = useState<RoutineExercise[]>(routineToEdit?.exercises || []);
  const [showPicker, setShowPicker] = useState(false);
  const [error, setError] = useState('');

  const handleAddExercise = (exercise: Exercise) => {
    setError('');
    setExercises(prev => [...prev, {
      id: generateId(),
      exercise,
      targetSets: 3,
      targetReps: '10',
      restTime: 90
    }]);
    setShowPicker(false);
  };

  const updateExercise = (index: number, field: keyof RoutineExercise, value: string | number | undefined) => {
    const next = [...exercises];
    next[index] = { ...next[index], [field]: value };
    setExercises(next);
  };

  const removeExercise = (index: number) => {
    const next = [...exercises];
    next.splice(index, 1);
    setExercises(next);
  };

  const toggleSuperset = (index: number) => {
    if (index <= 0) return;
    const newExercises = [...exercises];
    const prevEx = newExercises[index - 1];
    const currentEx = newExercises[index];

    if (currentEx.supersetId && currentEx.supersetId === prevEx.supersetId) {
      currentEx.supersetId = undefined;
    } else {
      const sid = prevEx.supersetId || generateId();
      prevEx.supersetId = sid;
      currentEx.supersetId = sid;
    }
    setExercises(newExercises);
  };

  const handleSave = () => {
    if (!name.trim()) {
      setError(lang === 'tr' ? 'Lütfen bir rutin adı girin.' : 'Please enter a routine name.');
      return;
    }
    if (exercises.length === 0) {
      setError(lang === 'tr' ? 'Lütfen en az bir egzersiz ekleyin.' : 'Please add at least one exercise.');
      return;
    }

    if (routineToEdit) {
      updateRoutine({ ...routineToEdit, name: name.trim(), exercises });
      onClose();
      return;
    }

    const success = addRoutine({ id: generateId(), name: name.trim(), exercises });
    if (!success) {
      setError(lang === 'tr' ? 'Ücretsiz versiyonda en fazla 2 rutin oluşturabilirsiniz.' : 'You can only create up to 2 routines in the free version.');
      return;
    }

    onClose();
  };

  return (
    <div className="flex flex-col h-full bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.18),_transparent_36%),#020617] animate-in slide-in-from-bottom-4 duration-300 relative">
      <div className="sticky top-0 z-10 bg-slate-950/90 p-5 flex items-center justify-between border-b border-white/5 backdrop-blur-2xl">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">{routineToEdit ? 'Rutini Düzenle' : t.createRoutine}</h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">Eski rutin mantığı korunur; sadece görünüm yenilendi.</p>
        </div>
        <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-white/10 rounded-full transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-28 hide-scrollbar">
        <input
          type="text"
          value={name}
          onChange={event => { setName(event.target.value); setError(''); }}
          placeholder={t.routineName}
          className="bg-transparent border-none text-[32px] font-black text-white w-full focus:outline-none placeholder-slate-700 mt-6 mb-8 tracking-tight"
        />

        <div className="space-y-4 mb-6">
          {exercises.map((exercise, index) => {
            const isSupersetWithPrev = index > 0 && exercise.supersetId && exercise.supersetId === exercises[index - 1].supersetId;
            const isSupersetWithNext = index < exercises.length - 1 && exercise.supersetId && exercise.supersetId === exercises[index + 1].supersetId;

            return (
              <div key={exercise.id} className="relative">
                {isSupersetWithPrev && <div className="absolute -top-4 left-8 bottom-0 w-1 bg-blue-600/80 z-10" />}
                {isSupersetWithNext && !isSupersetWithPrev && <div className="absolute top-0 left-8 -bottom-4 w-1 bg-blue-600/80 z-10 rounded-t-full" />}
                {isSupersetWithPrev && !isSupersetWithNext && <div className="absolute -top-4 left-8 h-12 w-1 bg-blue-600/80 z-10 rounded-b-full" />}

                <div className={cn(
                  'relative z-0 overflow-hidden bg-gradient-to-br from-slate-900/95 to-slate-950 border border-white/10 p-5 shadow-[0_20px_70px_-55px_rgba(37,99,235,0.8)]',
                  exercise.supersetId && 'border-blue-500/45',
                  isSupersetWithPrev ? 'rounded-b-[28px] rounded-t-xl mt-1' : 'rounded-[28px]'
                )}>
                  {exercise.supersetId && <div className="absolute top-4 left-4 w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_16px_rgba(96,165,250,0.9)]" />}

                  <div className="flex gap-1 absolute top-4 right-4">
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => toggleSuperset(index)}
                        className={cn(
                          'p-2 rounded-xl transition-colors text-[10px] font-black uppercase tracking-wider flex items-center gap-1',
                          exercise.supersetId && exercise.supersetId === exercises[index - 1]?.supersetId
                            ? 'text-white bg-blue-600 shadow-lg shadow-blue-600/25'
                            : 'text-slate-500 hover:text-white bg-slate-950/60 border border-white/10'
                        )}
                        title={t.superset}
                      >
                        <Link2 size={12} /> Sup
                      </button>
                    )}
                    <button type="button" onClick={() => removeExercise(index)} className="text-slate-500 hover:text-red-400 p-2 rounded-xl hover:bg-red-500/10 transition-colors">
                      <X size={18} />
                    </button>
                  </div>

                  <div className={cn(exercise.supersetId && 'pl-4')}>
                    <h3 className="text-white font-black text-lg mb-1 pr-24 truncate">{exercise.exercise.name[lang]}</h3>
                    <p className="text-xs text-blue-400 uppercase tracking-widest font-bold mb-5">{exercise.exercise.muscle[lang]} {exercise.supersetId ? '• SUPERSET' : ''}</p>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div className="bg-slate-950/50 rounded-2xl p-2 border border-white/10 flex flex-col items-center">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1.5 text-center">{t.sets}</label>
                      <input type="number" min="0" value={exercise.targetSets} onChange={event => updateExercise(index, 'targetSets', parseInt(event.target.value, 10) || 0)} className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 text-white font-bold focus:outline-none text-center focus:border-blue-500 transition-colors text-sm" />
                    </div>
                    <div className="bg-slate-950/50 rounded-2xl p-2 border border-white/10 flex flex-col items-center">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1.5 text-center">{t.reps}</label>
                      <input type="text" value={exercise.targetReps} onChange={event => updateExercise(index, 'targetReps', event.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 text-white font-bold focus:outline-none text-center focus:border-blue-500 transition-colors text-sm" />
                    </div>
                    <div className="bg-slate-950/50 rounded-2xl p-2 border border-white/10 flex flex-col items-center">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1.5 text-center">{t.rest}</label>
                      <div className="relative flex items-center w-full">
                        <input type="number" min="0" value={exercise.restTime} onChange={event => updateExercise(index, 'restTime', parseInt(event.target.value, 10) || 0)} className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 text-white font-bold focus:outline-none text-center focus:border-blue-500 transition-colors text-sm pr-6" />
                        <span className="absolute right-1.5 text-[9px] font-bold text-slate-500 pointer-events-none">sn</span>
                      </div>
                    </div>
                    <div className="bg-slate-950/50 rounded-2xl p-2 border border-white/10 flex flex-col items-center">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1.5 text-center">{t.duration}</label>
                      <div className="relative flex items-center w-full">
                        <input type="number" min="0" value={exercise.targetTime || ''} placeholder="-" onChange={event => updateExercise(index, 'targetTime', event.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 text-white font-bold focus:outline-none text-center focus:border-blue-500 transition-colors text-sm pr-6 placeholder-slate-600" />
                        <span className="absolute right-1.5 text-[9px] font-bold text-slate-500 pointer-events-none">sn</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {!showPicker && (
          <button type="button" onClick={() => setShowPicker(true)} className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black flex items-center justify-center gap-2 hover:from-blue-500 hover:to-indigo-500 transition-colors shadow-lg shadow-blue-600/20 active:scale-[0.98]">
            <Plus size={20} /> {t.addExercise}
          </button>
        )}
      </div>

      {!showPicker && (
        <div className="fixed bottom-0 left-0 right-0 p-5 bg-slate-950/95 backdrop-blur-xl max-w-md mx-auto border-x border-slate-900/50">
          {error && <div className="mb-3 text-red-400 text-sm font-bold text-center bg-red-400/10 py-2 px-4 rounded-xl border border-red-400/20">{error}</div>}
          <button type="button" onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] flex items-center justify-center gap-2">
            <Save size={20} /> {t.save}
          </button>
        </div>
      )}

      {showPicker && <ExercisePicker onPick={handleAddExercise} onClose={() => setShowPicker(false)} />}
    </div>
  );
}
