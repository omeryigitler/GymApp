import { useState } from 'react';
import { Plus, Save, X } from 'lucide-react';
import { EXERCISES } from '../data';
import { Routine, RoutineExercise } from '../types';
import { useAppContext } from '../context/AppContext';
import { translations } from '../i18n';
import { generateId } from '../utils';

export function RoutineBuilder({ onClose, routineToEdit }: { onClose: () => void; routineToEdit?: Routine }) {
  const { lang, addRoutine, updateRoutine } = useAppContext();
  const t = translations[lang];
  const [name, setName] = useState(routineToEdit?.name || '');
  const [exercises, setExercises] = useState<RoutineExercise[]>(routineToEdit?.exercises || []);
  const [error, setError] = useState('');

  const addExercise = (exerciseId: string) => {
    const exercise = EXERCISES.find(item => item.id === exerciseId);
    if (!exercise) return;
    setError('');
    setExercises(prev => [...prev, { id: generateId(), exercise, targetSets: 3, targetReps: '10', restTime: 90 }]);
  };

  const updateExercise = (index: number, field: keyof RoutineExercise, value: string | number) => {
    const next = [...exercises];
    next[index] = { ...next[index], [field]: value };
    setExercises(next);
  };

  const removeExercise = (index: number) => setExercises(prev => prev.filter((_, itemIndex) => itemIndex !== index));

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
    <div className="flex flex-col h-full bg-slate-950 relative">
      <div className="sticky top-0 z-10 bg-slate-950 p-5 flex items-center justify-between border-b border-slate-900/50">
        <h2 className="text-xl font-extrabold text-white">{t.createRoutine}</h2>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-full transition-colors"><X size={20} /></button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-28 hide-scrollbar">
        <input type="text" value={name} onChange={e => { setName(e.target.value); setError(''); }} placeholder={t.routineName} className="bg-transparent border-none text-[28px] font-extrabold text-white w-full focus:outline-none placeholder-slate-700 mt-6 mb-6" />

        <select onChange={e => { addExercise(e.target.value); e.currentTarget.value = ''; }} defaultValue="" className="w-full bg-slate-900 border border-slate-800 text-white rounded-2xl p-4 mb-6 font-bold focus:outline-none focus:border-blue-500">
          <option value="" disabled>{t.addExercise}</option>
          {EXERCISES.map(exercise => <option key={exercise.id} value={exercise.id}>{exercise.name[lang]} - {exercise.muscle[lang]}</option>)}
        </select>

        <div className="space-y-4">
          {exercises.map((item, index) => (
            <div key={item.id} className="bg-slate-900 border border-slate-800 p-5 rounded-3xl">
              <div className="flex justify-between gap-4 mb-5">
                <div><h3 className="text-white font-bold text-lg">{item.exercise.name[lang]}</h3><p className="text-xs text-blue-500 uppercase tracking-widest font-bold mt-1">{item.exercise.muscle[lang]}</p></div>
                <button onClick={() => removeExercise(index)} className="text-slate-500 hover:text-red-400"><X size={18} /></button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <label className="bg-slate-950/50 rounded-2xl p-2 border border-slate-800/50 text-center"><span className="text-[9px] font-bold text-slate-500 uppercase block mb-1.5">{t.sets}</span><input type="number" min="0" value={item.targetSets} onChange={e => updateExercise(index, 'targetSets', parseInt(e.target.value, 10) || 0)} className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 text-white font-bold text-center focus:outline-none" /></label>
                <label className="bg-slate-950/50 rounded-2xl p-2 border border-slate-800/50 text-center"><span className="text-[9px] font-bold text-slate-500 uppercase block mb-1.5">{t.reps}</span><input type="text" value={item.targetReps} onChange={e => updateExercise(index, 'targetReps', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 text-white font-bold text-center focus:outline-none" /></label>
                <label className="bg-slate-950/50 rounded-2xl p-2 border border-slate-800/50 text-center"><span className="text-[9px] font-bold text-slate-500 uppercase block mb-1.5">{t.rest}</span><input type="number" min="0" value={item.restTime} onChange={e => updateExercise(index, 'restTime', parseInt(e.target.value, 10) || 0)} className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 text-white font-bold text-center focus:outline-none" /></label>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-5 bg-slate-950 max-w-md mx-auto border-x border-slate-900/50">
        {error && <div className="mb-3 text-red-400 text-sm font-bold text-center bg-red-400/10 py-2 px-4 rounded-xl">{error}</div>}
        <button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] flex items-center justify-center gap-2"><Save size={20} /> {t.save}</button>
      </div>
    </div>
  );
}
