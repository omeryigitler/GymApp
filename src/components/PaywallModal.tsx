import { CheckCircle2, Crown, Sparkles, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export function PaywallModal({ onClose }: { onClose: () => void }) {
  const { setPremium } = useAppContext();

  const handleUpgrade = () => {
    setPremium(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/80 backdrop-blur-xl p-4">
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-950/45 via-slate-900 to-slate-950 border border-blue-500/30 w-full max-w-md rounded-[34px] shadow-[0_30px_120px_-45px_rgba(37,99,235,0.95)]">
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-indigo-500/15 rounded-full blur-3xl" />
        <div className="relative p-6">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-950/60 border border-white/10 rounded-full p-2 transition-colors"><X size={18} /></button>
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300 shadow-[0_0_40px_rgba(245,158,11,0.18)] mb-5">
            <Crown size={30} />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-300 border border-blue-500/20 font-black text-[10px] uppercase tracking-widest rounded-full mb-4"><Sparkles size={12} /> Pro Plan</div>
          <h2 className="text-3xl font-black text-white mb-3 tracking-tight">Sınırların Ötesine Geç</h2>
          <p className="text-slate-400 mb-7 text-sm font-semibold leading-relaxed">PRO sürümü ile antrenman potansiyelinizi maksimize edin ve rutin sınırını kaldırın.</p>
          <div className="space-y-3 mb-8">
            {['Sınırsız Rutin Oluşturma', 'Gelişmiş Antrenman İstatistikleri', 'Kişisel Rekor Takibi', 'Reklamsız Deneyim'].map(feature => (
              <div key={feature} className="flex items-center gap-3 text-slate-200 text-sm font-bold bg-slate-950/45 border border-white/10 rounded-2xl p-3"><CheckCircle2 size={20} className="text-blue-400 flex-shrink-0" /><span>{feature}</span></div>
            ))}
          </div>
          <button onClick={handleUpgrade} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl transition-colors shadow-lg shadow-blue-600/25 active:scale-[0.98]">14 Gün Ücretsiz Dene</button>
          <p className="text-center text-xs text-slate-500 mt-3 font-semibold">Demo MVP: gerçek ödeme henüz bağlı değil.</p>
        </div>
      </div>
    </div>
  );
}
