import { CheckCircle2, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export function PaywallModal({ onClose }: { onClose: () => void }) {
  const { setPremium } = useAppContext();

  const handleUpgrade = () => {
    setPremium(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 rounded-full p-1 transition-colors"><X size={20} /></button>
          <div className="inline-block px-3 py-1 bg-blue-500/10 text-blue-400 font-bold text-xs uppercase tracking-wider rounded-full mb-4">Pro Plan</div>
          <h2 className="text-2xl font-bold text-white mb-2">Sınırların Ötesine Geç</h2>
          <p className="text-slate-400 mb-6 text-sm">PRO sürümü ile antrenman potansiyelinizi maksimize edin.</p>
          <div className="space-y-4 mb-8">
            {['Sınırsız Rutin Oluşturma', 'Gelişmiş Antrenman İstatistikleri', 'Kişisel Rekor Takibi', 'Reklamsız Deneyim'].map(feature => (
              <div key={feature} className="flex items-center gap-3 text-slate-200 text-sm font-medium"><CheckCircle2 size={20} className="text-blue-500 flex-shrink-0" /><span>{feature}</span></div>
            ))}
          </div>
          <button onClick={handleUpgrade} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-blue-500/20">14 Gün Ücretsiz Dene</button>
          <p className="text-center text-xs text-slate-500 mt-3">Demo MVP: gerçek ödeme henüz bağlı değil.</p>
        </div>
      </div>
    </div>
  );
}
