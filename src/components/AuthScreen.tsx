import { useState } from 'react';
import { Dumbbell } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { translations } from '../i18n';
import { cn } from '../utils';

export function AuthScreen() {
  const { login, lang, setLang } = useAppContext();
  const t = translations[lang];
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center selection:bg-blue-500/30">
      <div className="w-full max-w-md min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden shadow-2xl border-x border-slate-900/50">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none -translate-x-1/3 translate-y-1/3" />

        <div className="absolute top-6 right-6 flex gap-2 z-20">
          <button onClick={() => setLang('tr')} className={cn('px-3 py-1 text-xs font-bold rounded-full transition-colors', lang === 'tr' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300')}>TR</button>
          <button onClick={() => setLang('en')} className={cn('px-3 py-1 text-xs font-bold rounded-full transition-colors', lang === 'en' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300')}>EN</button>
        </div>

        <div className="w-full relative z-10 flex flex-col items-center">
          <div className="flex flex-col items-center mb-10">
            <div className="w-20 h-20 bg-blue-600 rounded-[24px] flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(37,99,235,0.4)]">
              <Dumbbell className="text-white" size={36} />
            </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">{t.appTitle}</h1>
          </div>

          <div className="w-full">
            <div className="flex bg-slate-900/80 p-1.5 rounded-2xl mb-8 relative border border-slate-800/80 backdrop-blur-md">
              <button onClick={() => setIsLogin(true)} className={cn('flex-1 py-3 text-sm font-bold rounded-xl transition-colors', isLogin ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200')}>{t.login}</button>
              <button onClick={() => setIsLogin(false)} className={cn('flex-1 py-3 text-sm font-bold rounded-xl transition-colors', !isLogin ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200')}>{t.register}</button>
            </div>

            <div className="w-full flex flex-col space-y-4">
              {!isLogin && <input type="text" placeholder={t.name} className="w-full bg-slate-900/50 border border-slate-800 text-white rounded-2xl py-4 px-5 focus:outline-none focus:border-blue-500 transition-all placeholder-slate-600 font-medium" />}
              <input type="email" placeholder={t.email} className="w-full bg-slate-900/50 border border-slate-800 text-white rounded-2xl py-4 px-5 focus:outline-none focus:border-blue-500 transition-all placeholder-slate-600 font-medium" />
              <input type="password" placeholder={t.password} className="w-full bg-slate-900/50 border border-slate-800 text-white rounded-2xl py-4 px-5 focus:outline-none focus:border-blue-500 transition-all placeholder-slate-600 font-medium" />
              {isLogin && <div className="flex justify-end pt-1"><span className="text-sm text-blue-500 font-medium">{t.forgotPassword}</span></div>}
              <button onClick={login} className="w-full bg-white hover:bg-slate-200 text-slate-900 font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-[0.98] mt-4">
                {isLogin ? t.login : t.register}
              </button>
              <p className="text-center text-xs text-slate-500">Demo MVP: gerçek auth henüz bağlı değil.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
