import { type ReactNode } from 'react';
import { BarChart3, Flame, Home, Share2, Timer, Trophy, Zap } from 'lucide-react';
import { Workout } from '../types';
import { formatTime } from '../utils';

export function WorkoutComplete({ workout, onBack }: { workout: Workout; onBack: () => void }) {
  const durationSeconds = workout.endTime ? Math.max(0, Math.floor((workout.endTime - workout.startTime) / 1000)) : 0;
  const completedSets = workout.exercises.reduce((total, exercise) => total + exercise.sets.filter(set => set.completed).length, 0);
  const totalVolume = workout.exercises.reduce((total, exercise) => total + exercise.sets.reduce((setTotal, set) => {
    if (!set.completed || !set.weight || !set.reps) return setTotal;
    return setTotal + parseFloat(set.weight) * parseInt(set.reps, 10);
  }, 0), 0);
  const estimatedCalories = Math.max(120, Math.round((durationSeconds / 60) * 8 + completedSets * 6));
  const averageRpe = getAverageRpe(workout);
  const intensityBars = [32, 56, 42, 78, 112, 92, 66, 44];

  return (
    <div className="flex-1 flex flex-col bg-[#131313] text-[#e5e2e1] h-full overflow-hidden">
      <header className="h-16 shrink-0 bg-[#131313]/85 backdrop-blur-2xl border-b border-white/10 flex items-center justify-between px-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#1C1C1E] border border-[#CCFF00]/25 overflow-hidden flex items-center justify-center text-[#CCFF00]"><Flame size={18} fill="currentColor" /></div>
          <span className="font-display text-[24px] font-black italic tracking-[-0.08em] text-[#CCFF00]">FLOW STATE</span>
        </div>
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-[#1C1C1E] border border-white/10 text-[#c4c9ac] hover:text-white flex items-center justify-center"><Home size={18} /></button>
      </header>

      <main className="flex-1 overflow-y-auto hide-scrollbar px-5 py-8 pb-28">
        <section className="text-center pt-6">
          <div className="w-28 h-28 mx-auto rounded-full border border-[#CCFF00] bg-[#1C1C1E] flex items-center justify-center text-[#CCFF00] shadow-[0_0_34px_rgba(204,255,0,0.22)] mb-8"><Flame size={52} fill="currentColor" /></div>
          <h1 className="font-display text-[48px] leading-[58px] font-black text-[#CCFF00] tracking-[-0.08em] uppercase">Antrenman Tamamlandı!</h1>
          <p className="text-[#c4c9ac] text-lg leading-7 mt-5 max-w-xs mx-auto">Vücudunu sınırlarına zorladın. İşte sonuçların.</p>
        </section>

        <section className="grid grid-cols-2 gap-4 mt-10">
          <ResultCard icon={<Timer size={17} />} label="Süre" value={formatTime(durationSeconds)} />
          <ResultCard icon={<Flame size={17} />} label="Kalori" value={`${estimatedCalories} kcal`} accent="text-[#FF4D00]" />
          <ResultCard icon={<Zap size={17} />} label="Ort. RPE" value={averageRpe ? `${averageRpe}/10` : '--'} />
          <ResultCard icon={<BarChart3 size={17} />} label="Hacim" value={`${Math.round(totalVolume).toLocaleString('tr-TR')} kg`} accent="text-[#0070F3]" />
        </section>

        <section className="relative overflow-hidden mt-8 rounded-2xl bg-[#1C1C1E] border border-white/10 p-6 border-l-4 border-l-[#CCFF00]">
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-[#CCFF00]/5 blur-xl" />
          <div className="relative flex flex-col items-center text-center py-4">
            <div className="w-16 h-16 rounded-full bg-[#201f1f] border border-white/5 flex items-center justify-center text-[#CCFF00] mb-5"><Trophy size={28} /></div>
            <p className="text-[#CCFF00] text-sm font-black uppercase tracking-widest mb-3">Yeni Başarı Açıldı!</p>
            <h2 className="font-display text-white text-3xl font-black tracking-[-0.05em]">{completedSets} Setlik Seri</h2>
            <p className="text-[#c4c9ac] mt-3 text-base">Sürekli disiplin. Asla pes etme.</p>
          </div>
        </section>

        <section className="mt-8 rounded-2xl bg-[#1C1C1E] border border-white/10 p-6">
          <h2 className="font-display text-white text-2xl font-black tracking-[-0.05em] mb-7">Yoğunluk Analizi</h2>
          <div className="h-36 flex items-end gap-2 px-2 border-b border-white/10 pb-3">
            {intensityBars.map((height, index) => (
              <div key={index} className="flex-1 rounded-t-md bg-gradient-to-t from-[#0054b8] to-[#0070F3] relative" style={{ height }}>
                {index === 4 && <div className="absolute inset-0 bg-[#CCFF00] shadow-[0_0_18px_rgba(204,255,0,0.45)] rounded-t-md" />}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[#c4c9ac] text-sm mt-4"><span>Başlangıç</span><span>Bitiş</span></div>
        </section>
      </main>

      <div className="shrink-0 p-5 bg-[#131313]/95 backdrop-blur-2xl border-t border-white/10 pb-safe space-y-3">
        <button onClick={onBack} className="w-full h-14 rounded-full bg-[#CCFF00] text-[#131313] font-black kinetic-glow-lime active:scale-[0.98]">PANELE DÖN</button>
        <button className="w-full h-14 rounded-full bg-transparent border border-white/10 text-white font-black flex items-center justify-center gap-2 active:scale-[0.98]"><Share2 size={18} /> İLERLEMEYİ PAYLAŞ</button>
      </div>
    </div>
  );
}

function getAverageRpe(workout: Workout) {
  const rpes = workout.exercises.flatMap(exercise => exercise.sets.map(set => set.rpe).filter((rpe): rpe is number => typeof rpe === 'number'));
  if (rpes.length === 0) return null;
  return Math.round((rpes.reduce((sum, rpe) => sum + rpe, 0) / rpes.length) * 10) / 10;
}

function ResultCard({ icon, label, value, accent = 'text-white' }: { icon: ReactNode; label: string; value: string; accent?: string }) {
  return <div className="bg-[#1C1C1E] border border-white/10 rounded-2xl p-4"><div className="flex items-center gap-2 text-[#c4c9ac] text-xs font-black uppercase tracking-widest mb-4">{icon} {label}</div><p className={`font-display text-2xl font-black tracking-[-0.04em] ${accent}`}>{value}</p></div>;
}
