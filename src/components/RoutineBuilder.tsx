import { useMemo, useState } from 'react';
import { Dumbbell, Plus, Save, Search, Trash2, X } from 'lucide-react';
import { EXERCISES } from '../data';
import { Exercise, Routine, RoutineExercise } from '../types';
import { useAppContext } from '../context/AppContext';
import { translations } from '../i18n';
import { generateId } from '../utils';

const MUSCLE_GRADIENTS: Record<string, string> = {
  'Göğüs': 'from-blue-500/25 to-cyan-500/10 text-blue-300 border-blue-500/30',
  'Chest': 'from-blue-500/25 to-cyan-500/10 text-blue-300 border-blue-500/30',
  'Sırt': 'from-violet-500/25 to-fuchsia-500/10 text-violet-300 border-violet-500/30',
  'Back': 'from-violet-500/25 to-fuchsia-500/10 text-violet-300 border-violet-500/30',
  'Bacak': 'from-emerald-500/25 to-teal-500/10 text-emerald-300 border-emerald-500/30',
  'Legs': 'from-emerald-500/25 to-teal-500/10 text-emerald-300 border-emerald-500/30',
  'Omuz': 'from-orange-500/25 to-amber-500/10 text-orange-300 border-orange-500/30',
  'Shoulders': 'from-orange-500/25 to-amber-500/10 text-orange-300 border-orange-500/30',
  'Kol': 'from-pink-500/25 to-rose-500/10 text-pink-300 border-pink-500/30',
  'Arms': 'from-pink-500/25 to-rose-500/10 text-pink-300 border-pink-500/30',
  'Merkez': 'from-sky-500/25 to-indigo-500/10 text-sky-300 border-sky-500/30',
  'Core': 'from-sky-500/25 to-indigo-500/10 text-sky-300 border-sky-500/30',
  'Kardiyo': 'from-red-500/25 to-orange-500/10 text-red-300 border-red-500/30',
  'Cardio': 'from-red-500/25 to-orange-500/10 text-red-300 border-red-500/30'
};

function muscleTone(muscle: string) {
  return MUSCLE_GRADIENTS[muscle] || 'from-slate-500/25 to-slate-500/10 text-slate-300 border-slate-500/30';
}

export function RoutineBuilder({ onClose, routineToEdit }: { onClose: () => void; routineToEdit?: Routine }) {
  const { lang, addRoutine, updateRoutine } = useAppContext();
  const t = translations[lang];
  const [name, setName] = useState(routineToEdit?.name || '');
  const [query, setQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('all');
  const [exercises, setExercises] = useState<RoutineExercise[]>(routineToEdit?.exercises || []);
  const [error, setError] = useState('');

  const muscleFilters = useMemo(() => {
    const muscles = Array.from(new Set(EXERCISES.map(exercise => exercise.muscle[lang])));
    return ['all', ...muscles];
  }, [lang]);

  const filteredExercises = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return EXERCISES.filter(exercise => {
      const matchesQuery = !normalizedQuery || exercise.name[lang].toLowerCase().includes(normalizedQuery) || exercise.muscle[lang].toLowerCase().includes(normalizedQuery);
      const matchesMuscle = selectedMuscle === 'all' || exercise.muscle[lang] === selectedMuscle;
      return matchesQuery && matchesMuscle;
    }).slice(0, 8);
  }, [query, selectedMuscle, lang]);

  const addExercise = (exercise: Exercise) => {
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
      <div className="sticky top-0 z-10 bg-slate-950/90 p-5 flex items-center justify-between border-b border-slate-900/50 backdrop-blur-xl">
        <div>
          <h2 className="text-xl font-extrabold text-white">{routineToEdit ? 'Rutini Düzenle' : t.createRoutine}</h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">Egzersizlerini seç, setlerini ayarla ve kaydet.</p>
        </div>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-full transition-colors"><X size={20} /></button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-36 hide-scrollbar">
        <input
          type="text"
          value={name}
          onChange={event => { setName(event.target.value); setError(''); }}
          placeholder={t.routineName}
          className="bg-transparent border-none text-[32px] font-black text-white w-full focus:outline-none placeholder-slate-700 mt-6 mb-5 tracking-tight"
        />

        <div className="relative overflow-hidden rounded-[28px] border border-blue-500/40 bg-gradient-to-br from-blue-950/45 via-slate-900/90 to-slate-950 p-5 mb-6 shadow-[0_20px_70px_-35px_rgba(37,99,235,0.9)]">
          <div className="absolute -top-16 -right-10 w-44 h-44 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="relative flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-500/40 flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.25)]">
              <Dumbbell className="text-blue-400" size={30} />
            </div>
            <div>
              <h3 className="text-white text-2xl font-black tracking-tight">Egzersiz Ekle</h3>
              <p className="text-slate-400 text-sm font-medium mt-1">Rutininize eklemek istediğiniz egzersizi seçin.</p>
            </div>
          </div>

          <div className="relative mb-4">
            <Search size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Egzersiz ara..."
              className="w-full bg-slate-950/60 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white font-semibold placeholder:text-slate-600 focus:outline-none focus:border-blue-500/80 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 mb-5">
            {muscleFilters.map(filter => {
              const isActive = selectedMuscle === filter;
              return (
                <button
                  key={filter}
                  onClick={() => setSelectedMuscle(filter)}
                  className={isActive ? 'shrink-0 px-4 py-2 rounded-full text-xs font-extrabold bg-blue-600 text-white shadow-lg shadow-blue-600/25' : 'shrink-0 px-4 py-2 rounded-full text-xs font-extrabold bg-slate-950/60 text-slate-400 border border-white/10 hover:text-white hover:border-blue-500/40'}
                >
                  {filter === 'all' ? 'Tümü' : filter}
                </button>
              );
            })}
          </div>

          <div className="space-y-3">
            {filteredExercises.map(exercise => {
              const muscle = exercise.muscle[lang];
              return (
                <button
                  key={exercise.id}
                  onClick={() => addExercise(exercise)}
                  className="w-full group bg-slate-950/45 hover:bg-slate-900/95 border border-white/10 hover:border-blue-500/50 rounded-3xl p-3.5 flex items-center gap-3 text-left transition-all active:scale-[0.99]"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${muscleTone(muscle)} border flex items-center justify-center shrink-0`}>
                    <Dumbbell size={24} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-white font-extrabold text-[15px] truncate">{exercise.name[lang]}</h4>
                    <span className={`inline-flex mt-2 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-gradient-to-r ${muscleTone(muscle)} border`}>
                      {muscle}
                    </span>
                  </div>
                  <div className="w-11 h-11 rounded-2xl border border-blue-500/50 bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-[0_0_24px_rgba(37,99,235,0.18)]">
                    <Plus size={22} />
                  </div>
                </button>
              );
            })}
            {filteredExercises.length === 0 && (
              <div className="rounded-3xl border border-dashed border-white/10 p-8 text-center text-slate-500 text-sm font-semibold">
                Aramanıza uygun egzersiz bulunamadı.
              </div>
            )}
          </div>
        </div>

        {exercises.length === 0 ? (
          <div className="border-2 border-dashed border-white/10 rounded-3xl p-8 text-center text-slate-500 text-sm font-semibold mb-4">
            Rutine en az bir egzersiz ekle.
          </div>
        ) : (
          <div className="space-y-4 mb-4">
            <h3 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest pl-2">Rutindeki Egzersizler</h3>
            {exercises.map((item, index) => {
              const muscle = item.exercise.muscle[lang];
              return (
                <div key={item.id} className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl shadow-sm">
                  <div className="flex justify-between gap-4 mb-5">
                    <div className="flex gap-3 min-w-0">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${muscleTone(muscle)} border flex items-center justify-center shrink-0`}>
                        <Dumbbell size={21} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-white font-extrabold text-base truncate">{item.exercise.name[lang]}</h3>
                        <p className="text-xs text-blue-400 uppercase tracking-widest font-bold mt-1">{muscle}</p>
                      </div>
                    </div>
                    <button onClick={() => removeExercise(index)} className="text-slate-500 hover:text-red-400 w-9 h-9 rounded-xl hover:bg-red-500/10 flex items-center justify-center shrink-0">
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
              );
            })}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-5 bg-slate-950/95 backdrop-blur-xl max-w-md mx-auto border-x border-slate-900/50">
        {error && <div className="mb-3 text-red-400 text-sm font-bold text-center bg-red-400/10 py-2 px-4 rounded-xl border border-red-400/20">{error}</div>}
        <button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] flex items-center justify-center gap-2">
          <Save size={20} /> {t.save}
        </button>
      </div>
    </div>
  );
}
