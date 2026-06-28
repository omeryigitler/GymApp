import { useState } from 'react';
import { Plus, Save, Trash2, X } from 'lucide-react';
import { EXERCISES } from '../data';
import { Routine, RoutineExercise } from '../types';
import { useAppContext } from '../context/AppContext';
import { translations } from '../i18n';
import { generateId } from '../utils';

export function RoutineBuilder({ onClose, routineToEdit }: { onClose: () => void; routineToEdit?: Routine }) {
  const { lang, addRoutine, updateRoutine } = useAppContext();
  const t = translations[lang];
  const [name, setName] = useState(routineToEdit?.name || '');
  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  const [exercises, setExercises] = useState<RoutineExercise[]>(routineToEdit?.exercises || []);
  const [error, setError] = useState('');

  const addSelectedExercise = () => {
    const exercise = EXERCISES.find(item => item.id === selectedExerciseId);
    if (!exercise) {
      setError(lang === 'tr' ? 'Lütfen bir egzersiz seçin.' : 'Please select an exercise.');
      return;
    }
    setExercises(prev => [
      ...prev,
      {
        id: generateId(),
        exercise,
        targetSets: 3,
        targetReps: '10',
        restTime: 90
      }
    ]);
    setSelectedExerciseId('');
    setError('');
  };

  const updateExercise = (index: number, field: keyof RoutineExercise, value: string | number) => {
    const next = [...exercises];
    next[index] = { ...next[index], [field]: value };
    setExercises(next);
    setError('');
  };

  const removeExercise = (index: number) => {
    setExercises(prev => prev.filter((_, itemIndex) => itemIndex !== index));
    setError('');
  };

  const handleSave = () => {
    const cleanName = name.trim();
    if (!cleanName) {
      setError(lang === 'tr' ? 'Lütfen bir rutin adı girin.' : 'Please enter a routine name.');
      return;
    }
    if (exercises.length === 0) {
      setError(lang === 'tr' ? 'Lütfen en az bir egzersiz ekleyin.' : 'Please add at least one exercise.');
      return;
    }

    const normalizedExercises = exercises.map(item => ({
      ...item,
      targetSets: Math.max(1, Number(item.targetSets) || 1),
      targetReps: item.targetReps.trim() || '10',
      restTime: Math.max(0, Number(item.restTime) || 0)
    }));

    if (routineToEdit) {
      updateRoutine({ ...routineToEdit, name: cleanName, exercises: normalizedExercises });
      onClose();
      return;
    }

    const success = addRoutine({ id: generateId(), name: cleanName, exercises: normalizedExercises });
    if (!success) {
      setError(lang === 'tr' ? 'Ücretsiz versiyonda en fazla 2 rutin oluşturabilirsiniz.' : 'You can only create up to 2 routines in the free version.');
      return;
    }
    onClose();
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 relative">
      <div className="sticky top-0 z-10 bg-slate-950 p-5 flex items-center justify-between border-b border-slate-900/50">
        <div>
          <h2 className="text-xl font-extrabold text-white">{routineToEdit ? 'Rutini Düzenle' : t.createRoutine}</h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">Kaydet, sonra dashboard kartına basıp başlat.</p>
        </div>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-full transition-colors"><X size={20} /></button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-32 hide-scrollbar">
        <input
          type="text"
          value={name}
          onChange={event => { setName(event.target.value); setError(''); }}
          placeholder={t.routineName}
          className="bg-transparent border-none text-[28px] font-extrabold text-white w-full focus:outline-none placeholder-slate-700 mt-6 mb-5"
        />

        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-4 mb-5">
          <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block mb-2">Egzersiz ekle</label>
          <div className="flex gap-2">
            <select
              value={selectedExerciseId}
              onChange={event => { setSelectedExerciseId(event.target.value); setError(''); }}
              className="min-w-0 flex-1 bg-slate-950 border border-slate-800 text-white rounded-2xl p-3 font-bold text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="">Seç...</option>
              {EXERCISES.map(exercise => (
                <option key={exercise.id} value={exercise.id}>{exercise.name[lang]} - {exercise.muscle[lang]}</option>
              ))}
            </select>
            <button onClick={addSelectedExercise} className="w-12 h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl flex items-center justify-center shrink-0 active:scale-95 transition-all">
              <Plus size={22} />
            </button>
          </div>
        </div>

        {exercises.length === 0 ? (
          <div className="border-2 border-dashed border-white/10 rounded-3xl p-8 text-center text-slate-500 text-sm font-semibold">
            Rutine en az bir egzersiz ekle.
          </div>
        ) : (
          <div className="space-y-4">
            {exercises.map((item, index) => (
              <div key={item.id} className="bg-slate-900 border border-slate-800 p-5 rounded-3xl">
                <div className="flex justify-between gap-4 mb-5">
                  <div>
                    <h3 className="text-white font-bold text-lg">{item.exercise.name[lang]}</h3>
                    <p className="text-xs text-blue-500 uppercase tracking-widest font-bold mt-1">{item.exercise.muscle[lang]}</p>
                  </div>
                  <button onClick={() => removeExercise(index)} className="text-slate-500 hover:text-red-400 w-9 h-9 rounded-xl hover:bg-red-500/10 flex items-center justify-center">
                    <Trash2 size={17} />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <label className="bg-slate-950/50 rounded-2xl p-2 border border-slate-800/50 text-center">
                    <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1.5">{t.sets}</span>
                    <input type="number" min="1" value={item.targetSets} onChange={event => updateExercise(index, 'targetSets', parseInt(event.target.value, 10) || 1)} className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 text-white font-bold text-center focus:outline-none" />
                  </label>
                  <label className="bg-slate-950/50 rounded-2xl p-2 border border-slate-800/50 text-center">
                    <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1.5">{t.reps}</span>
                    <input type="text" value={item.targetReps} onChange={event => updateExercise(index, 'targetReps', event.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 text-white font-bold text-center focus:outline-none" />
                  </label>
                  <label className="bg-slate-950/50 rounded-2xl p-2 border border-slate-800/50 text-center">
                    <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1.5">{t.rest}</span>
                    <input type="number" min="0" value={item.restTime} onChange={event => updateExercise(index, 'restTime', parseInt(event.target.value, 10) || 0)} className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 text-white font-bold text-center focus:outline-none" />
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-5 bg-slate-950 max-w-md mx-auto border-x border-slate-900/50">
        {error && <div className="mb-3 text-red-400 text-sm font-bold text-center bg-red-400/10 py-2 px-4 rounded-xl">{error}</div>}
        <button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] flex items-center justify-center gap-2">
          <Save size={20} /> {t.save}
        </button>
      </div>
    </div>
  );
}
