import { useMemo, useState } from 'react';
import { Dumbbell, Plus, Search, X } from 'lucide-react';
import { EXERCISES } from '../data';
import { Exercise } from '../types';
import { useAppContext } from '../context/AppContext';
import { translations } from '../i18n';

export function ExercisePicker({ onPick, onClose }: { onPick: (ex: Exercise) => void; onClose: () => void }) {
  const { lang } = useAppContext();
  const t = translations[lang];
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EXERCISES.filter(exercise =>
      exercise.name[lang].toLowerCase().includes(q) ||
      exercise.muscle[lang].toLowerCase().includes(q)
    );
  }, [query, lang]);

  const groups = useMemo(() => {
    const map = new Map<string, Exercise[]>();
    filtered.forEach(exercise => {
      const muscle = exercise.muscle[lang];
      if (!map.has(muscle)) map.set(muscle, []);
      map.get(muscle)!.push(exercise);
    });
    return Array.from(map.entries());
  }, [filtered, lang]);

  return (
    <div className="fixed inset-0 z-[9999] w-full h-dvh max-w-md mx-auto isolate overflow-hidden bg-[#131313] border-x border-white/10 animate-in slide-in-from-bottom-full duration-300">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(204,255,0,0.10),_transparent_34%),#131313]" />

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#131313]/95 backdrop-blur-2xl">
          <div>
            <h2 className="font-display text-xl font-black text-white tracking-[-0.04em]">{t.addExercise}</h2>
            <p className="text-xs text-[#c4c9ac] font-semibold mt-1">{filtered.length} sonuç • toplam {EXERCISES.length} egzersiz</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 bg-[#1C1C1E] border border-white/10 rounded-full text-[#c4c9ac] hover:text-white hover:bg-[#2a2a2a] transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 bg-[#131313]/90">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8e9379] pointer-events-none" size={18} />
            <input
              autoFocus
              type="text"
              placeholder={t.searchEx}
              value={query}
              onChange={event => setQuery(event.target.value)}
              className="w-full bg-[#1C1C1E] border border-white/10 text-white rounded-2xl py-4 pl-11 pr-4 focus:outline-none focus:border-[#CCFF00] transition-colors placeholder-[#8e9379] font-semibold"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6 pt-0 hide-scrollbar bg-[#131313]/95">
          {groups.map(([muscle, items]) => (
            <div key={muscle} className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-[11px] font-black text-[#CCFF00] uppercase tracking-widest">{muscle}</h3>
                <span className="text-[10px] font-black text-[#c4c9ac] bg-white/5 border border-white/10 rounded-full px-2 py-0.5">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map(exercise => (
                  <button
                    type="button"
                    key={exercise.id}
                    onClick={() => onPick(exercise)}
                    className="w-full flex items-center justify-between bg-[#1C1C1E] p-4 rounded-2xl border border-white/10 hover:border-[#CCFF00]/50 transition-all text-left active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-[#CCFF00]/10 border border-[#CCFF00]/25 flex items-center justify-center text-[#CCFF00] shrink-0"><Dumbbell size={20} /></div>
                      <div className="min-w-0">
                        <div className="font-display text-white font-black text-sm mb-0.5 truncate tracking-[-0.03em]">{exercise.name[lang]}</div>
                        <div className="text-[11px] text-[#c4c9ac] font-semibold">{exercise.muscle[lang]}</div>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full border border-[#CCFF00]/40 bg-[#CCFF00]/10 text-[#CCFF00] flex items-center justify-center shrink-0"><Plus size={18} /></div>
                  </button>
                ))}
              </div>
            </div>
          ))}
          {groups.length === 0 && <div className="text-center text-[#c4c9ac] mt-10 text-sm font-semibold">{t.notFound}</div>}
        </div>
      </div>
    </div>
  );
}
