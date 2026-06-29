import { CheckCircle2, Crown, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export function PaywallModal({ onClose }: { onClose: () => void }) {
  const { setPremium } = useAppContext();

  const handleUpgrade = () => {
    setPremium(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/80 backdrop-blur-xl p-4">
      <div className="relative overflow-hidden bg-[#1C1C1E] border border-[#CCFF00]/25 w-full max-w-md rounded-[28px] shadow-[0_30px_120px_-55px_rgba(204,255,0,0.85)]">
        <div className="pointer-events-none absolute -top-20 -right-20 w-60 h-60 bg-[#CCFF00]/12 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 w-56 h-56 bg-[#0070F3]/14 rounded-full blur-3xl" />
        <div className="relative p-6">
          <button onClick={onClose} className="absolute top-4 right-4 text-[#c4c9ac] hover:text-white bg-[#131313]/80 border border-white/10 rounded-full p-2 transition-colors"><X size={18} /></button>
          <div className="w-16 h-16 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/30 flex items-center justify-center text-[#CCFF00] shadow-[0_0_40px_rgba(204,255,0,0.22)] mb-5"><Crown size={30} /></div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/20 font-black text-[10px] uppercase tracking-widest rounded-full mb-4">FLOW STATE PRO</div>
          <h2 className="font-display text-3xl font-black text-white mb-3 tracking-[-0.05em]">Limitleri Kaldır</h2>
          <p className="text-[#c4c9ac] mb-7 text-sm font-semibold leading-relaxed">Daha fazla rutin oluştur ve gelişimini daha detaylı takip et.</p>
          <div className="space-y-3 mb-8">
            {['Sınırsız rutin', 'Gelişmiş istatistik', 'Kişisel rekor takibi', 'Temiz deneyim'].map(feature => (
              <div key={feature} className="flex items-center gap-3 text-white text-sm font-bold bg-[#131313]/80 border border-white/10 rounded-2xl p-3"><CheckCircle2 size={20} className="text-[#CCFF00] flex-shrink-0" /><span>{feature}</span></div>
            ))}
          </div>
          <button onClick={handleUpgrade} className="w-full bg-[#CCFF00] hover:bg-[#abd600] text-[#131313] font-black py-4 rounded-full transition-colors shadow-[0_0_28px_rgba(204,255,0,0.28)] active:scale-[0.98]">PRO Aktif Et</button>
          <p className="text-center text-xs text-[#8e9379] mt-3 font-semibold">Demo mod.</p>
        </div>
      </div>
    </div>
  );
}
