import { ArrowLeft } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export function ProfileView({ onBack }: { onBack: () => void }) {
  const { user, workouts } = useAppContext();

  return (
    <div className="flex-1 flex flex-col bg-slate-950 h-full">
      <div className="px-5 pt-8 pb-4 flex items-center justify-between sticky top-0 bg-slate-950/80 backdrop-blur-xl z-10 border-b border-white/5">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors -ml-2"><ArrowLeft size={20} /></button>
        <h2 className="text-white font-bold text-lg">Profile</h2>
        <div className="w-10" />
      </div>
      <div className="flex-1 overflow-y-auto hide-scrollbar px-5 py-6 space-y-6">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center text-white font-extrabold text-4xl mb-4">{user?.name?.charAt(0) || 'U'}</div>
          <h1 className="text-2xl font-black text-white mb-1">{user?.name}</h1>
          <p className="text-slate-400 text-sm font-medium">{workouts.length} total workouts</p>
        </div>
        <div className="bg-slate-900/80 border border-white/5 rounded-[20px] p-5">
          <p className="text-slate-500 text-xs font-bold uppercase mb-2">MVP Note</p>
          <p className="text-slate-300 text-sm">Detailed charts and measurements can be expanded in the next iteration.</p>
        </div>
      </div>
    </div>
  );
}
