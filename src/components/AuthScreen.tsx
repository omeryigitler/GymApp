import { useState } from 'react';
import { Dumbbell, Sparkles } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { translations } from '../i18n';
import { cn } from '../utils';

export function AuthScreen() {
  const { login, lang, setLang } = useAppContext();
  const t = translations[lang];
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center selection:bg-blue-500/30">
      <div className="w-full max-w-md min-h-screen bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.24),_transparent_36%),#020617] flex flex-col items-center justify-center p-6 relative overflow-hidden shadow-2xl border-x border-slate-900/50">
        <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-blue-600/15 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[420px] h-[420px] bg-indigo-500/15 rounded-full blur-[100px] pointer-events-none -translate-x-1/3 translate-y-1/3" />

        <div className="absolute top-6 right-6 flex gap-2 z-20 bg-slate-950/50 border border-white/10 p-1 rounded-full backdrop-blur-xl">
          <button onClick={() => setLang('tr')} className={cn('px-3 py-1.5 text-xs font-black rounded-full transition-colors', lang === 'tr' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' : 'text-slate-500 hover:text-slate-300')}>TR</button>
          <button onClick={() => setLang('en')} className={cn('px-3 py-1.5 text-xs font-black rounded-full transition-colors', lang === 'en' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' : 'text-slate-500 hover:text-slate-300')}>EN</button>
        </div>

        <div className="w-full relative z-10 flex flex-col items-center">
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-50 rounded-[28px]" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-800 rounded-[28px] flex items-center justify-center shadow-2xl border border-white/20">
                <Dumbbell className="text-white" size={42} />
              </div>
            </div>
            <div className="inline-flex items-center gap-2 text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest mb-4">
              <Sparkles size={12} /> Premium Workout Tracker
            </div>
            <h1 className="text-5xl font-black text-white tracking-tight">{t.appTitle}</h1>
            <p className="text-slate-400 text-sm mt-3 font-semibold">Antrenmanlarını takip et, rutinlerini oluştur, gelişimini gör.</p>
          </div>

          <div className="w-full relative overflow-hidden bg-gradient-to-br from-slate-900/95 to-slate-950 border border-white/10 rounded-[32px] p-5 shadow-[0_25px_80px_-45px_rgba(37,99,235,0.9)]">
            <div className="absolute -top-16 -right-16 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="relative flex bg-slate-950/70 p-1.5 rounded-2xl mb-6 border border-white/10 backdrop-blur-md">
              <button onClick={() => setIsLogin(true)} className={cn('flex-1 py-3 text-sm font-black rounded-xl transition-colors', isLogin ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' : 'text-slate-400 hover:text-slate-200')}>{t.login}</button>
              <button onClick={() => setIsLogin(false)} className={cn('flex-1 py-3 text-sm font-black rounded-xl transition-colors', !isLogin ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' : 'text-slate-400 hover:text-slate-200')}>{t.register}</button>
            </div>

            <div className="relative w-full flex flex-col space-y-4">
              {!isLogin && <input type="text" placeholder={t.name} className="w-full bg-slate-950/60 border border-white/10 text-white rounded-2xl py-4 px-5 focus:outline-none focus:border-blue-500/80 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-slate-600 font-semibold" />}
              <input type="email" placeholder={t.email} className="w-full bg-slate-950/60 border border-white/10 text-white rounded-2xl py-4 px-5 focus:outline-none focus:border-blue-500/80 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-slate-600 font-semibold" />
              <input type="password" placeholder={t.password} className="w-full bg-slate-950/60 border border-white/10 text-white rounded-2xl py-4 px-5 focus:outline-none focus:border-blue-500/80 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-slate-600 font-semibold" />
              {isLogin && <div className="flex justify-end pt-1"><span className="text-sm text-blue-400 font-bold">{t.forgotPassword}</span></div>}
              <button onClick={login} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/25 active:scale-[0.98] mt-2">
                {isLogin ? t.login : t.register}
              </button>
              <p className="text-center text-xs text-slate-500 font-semibold">Demo MVP: gerçek auth henüz bağlı değil.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
