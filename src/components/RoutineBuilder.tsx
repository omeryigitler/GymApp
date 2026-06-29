import { useState, type ReactNode } from 'react';
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
    setExercises(prev => [...prev, { id: generateId(), exercise, targetSets: 3, targetReps: '10', restTime: 90 }]);
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
    if (currentEx.supersetId && currentEx.supersetId === prevEx.supersetId) currentEx.supersetId = undefined;
    else {
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
    <div className="flex flex-col h-full bg-[#131313] text-[#e5e2e1] relative">
      <header className="h-16 shrink-0 bg-[#131313]/85 backdrop-blur-2xl border-b border-white/10 px-5 flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-black text-white tracking-[-0.05em]">{routineToEdit ? 'Rutini Düzenle' : t.createRoutine}</h2>
          <p className="text-xs text-[#c4c9ac] font-semibold mt-1">Set, tekrar, süre ve superset akışı.</p>
        </div>
        <button type="button" onClick={onClose} className="w-10 h-10 rounded-full bg-[#1C1C1E] border border-white/10 text-[#c4c9ac] hover:text-white flex items-center justify-center"><X size={20} /></button>
      </header>
      <div className="flex-1 overflow-y-auto px-5 pb-32 hide-scrollbar">
        <input type="text" value={name} onChange={event => { setName(event.target.value); setError(''); }} placeholder={t.routineName} className="bg-transparent border-none font-display text-[34px] font-black text-white w-full focus:outline-none placeholder-[#353534] mt-7 mb-7 tracking-[-0.06em]" />
        <div className="space-y-4 mb-6">
          {exercises.map((exercise, index) => {
            const isSupersetWithPrev = index > 0 && exercise.supersetId && exercise.supersetId === exercises[index - 1].supersetId;
            const isSupersetWithNext = index < exercises.length - 1 && exercise.supersetId && exercise.supersetId === exercises[index + 1].supersetId;
            const supersetPosition = exercise.supersetId ? exercises.filter((item, itemIndex) => itemIndex <= index && item.supersetId === exercise.supersetId).length : 0;
            return (
              <div key={exercise.id} className="relative">
                {isSupersetWithNext && !isSupersetWithPrev && <div className="mb-2 rounded-2xl border border-[#CCFF00]/20 bg-[#CCFF00]/10 px-4 py-3 flex items-center justify-between"><span className="flex items-center gap-2 text-[#CCFF00] text-xs font-black uppercase tracking-widest"><Link2 size={14} /> SUPERSET</span><span className="text-[10px] text-[#c4c9ac] font-black uppercase tracking-widest">Bağlı grup</span></div>}
                {exercise.supersetId && <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-[#CCFF00] via-[#0070F3] to-[#CCFF00] opacity-80" />}
                <div className={cn('relative overflow-hidden bg-[#1C1C1E] border border-white/10 p-5', exercise.supersetId && 'border-[#CCFF00]/25 ml-3', isSupersetWithPrev ? 'rounded-b-3xl rounded-t-xl mt-1' : 'rounded-3xl')}>
                  {exercise.supersetId && <div className="absolute left-3 top-4 w-8 h-8 rounded-full bg-[#CCFF00] text-[#131313] font-black text-xs flex items-center justify-center kinetic-glow-lime">A{supersetPosition}</div>}
                  <div className="absolute top-4 right-4 flex gap-1">
                    {index > 0 && <button type="button" onClick={() => toggleSuperset(index)} className={cn('p-2 rounded-xl transition-colors text-[10px] font-black uppercase tracking-wider flex items-center gap-1', exercise.supersetId && exercise.supersetId === exercises[index - 1]?.supersetId ? 'text-[#131313] bg-[#CCFF00] kinetic-glow-lime' : 'text-[#c4c9ac] hover:text-white bg-[#201f1f] border border-white/10')} title={t.superset}><Link2 size={12} /> Sup</button>}
                    <button type="button" onClick={() => removeExercise(index)} className="text-[#c4c9ac] hover:text-[#FF4D00] p-2 rounded-xl hover:bg-[#FF4D00]/10 transition-colors"><X size={18} /></button>
                  </div>
                  <div className={cn(exercise.supersetId && 'pl-12')}>
                    <h3 className="font-display text-white font-black text-lg mb-1 pr-24 truncate tracking-[-0.04em]">{exercise.exercise.name[lang]}</h3>
                    <p className="text-xs text-[#CCFF00] uppercase tracking-widest font-black mb-5">{exercise.exercise.muscle[lang]} {exercise.supersetId ? '• SUPERSET' : ''}</p>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <Field label={t.sets}><input type="number" min="0" value={exercise.targetSets} onChange={event => updateExercise(index, 'targetSets', parseInt(event.target.value, 10) || 0)} className="field-input" /></Field>
                    <Field label={t.reps}><input type="text" value={exercise.targetReps} onChange={event => updateExercise(index, 'targetReps', event.target.value)} className="field-input" /></Field>
                    <Field label={t.rest}><input type="number" min="0" value={exercise.restTime} onChange={event => updateExercise(index, 'restTime', parseInt(event.target.value, 10) || 0)} className="field-input" /></Field>
                    <Field label={t.duration}><input type="number" min="0" value={exercise.targetTime || ''} placeholder="-" onChange={event => updateExercise(index, 'targetTime', event.target.value)} className="field-input placeholder-[#8e9379]" /></Field>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {!showPicker && <button type="button" onClick={() => setShowPicker(true)} className="w-full py-4 rounded-full bg-[#CCFF00] text-[#131313] font-black flex items-center justify-center gap-2 hover:bg-[#abd600] transition-colors kinetic-glow-lime active:scale-[0.98]"><Plus size={20} /> {t.addExercise}</button>}
      </div>
      {!showPicker && <div className="fixed bottom-0 left-0 right-0 p-5 bg-[#131313]/95 backdrop-blur-xl max-w-md mx-auto border-x border-white/5 pb-safe">{error && <div className="mb-3 text-[#FF4D00] text-sm font-bold text-center bg-[#FF4D00]/10 py-2 px-4 rounded-xl border border-[#FF4D00]/20">{error}</div>}<button type="button" onClick={handleSave} className="w-full bg-[#CCFF00] hover:bg-[#abd600] text-[#131313] font-black py-4 rounded-full transition-all kinetic-glow-lime active:scale-[0.98] flex items-center justify-center gap-2"><Save size={20} /> {t.save}</button></div>}
      {showPicker && <ExercisePicker onPick={handleAddExercise} onClose={() => setShowPicker(false)} />}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div className="bg-[#201f1f] rounded-2xl p-2 border border-white/10 flex flex-col items-center"><label className="text-[9px] font-black text-[#8e9379] uppercase tracking-widest block mb-1.5 text-center">{label}</label>{children}</div>;
}
