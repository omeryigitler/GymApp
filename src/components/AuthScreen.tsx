import { useState } from 'react';
import { Bell, Dumbbell, Flame, Lock, Mail, User, Zap } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { translations } from '../i18n';
import { cn } from '../utils';

export function AuthScreen() {
  const { login, lang, setLang } = useAppContext();
  const t = translations[lang];
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen w-full bg-black flex justify-center text-[#e5e2e1] selection:bg-[#CCFF00]/30">
      <div className="w-full max-w-md min-h-screen bg-[#131313] relative overflow-hidden border-x border-white/10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_8%,rgba(204,255,0,0.16),transparent_28%),radial-gradient(circle_at_80%_70%,rgba(0,112,243,0.12),transparent_34%)]" />

        <header className="relative z-10 h-16 bg-[#131313]/85 backdrop-blur-2xl border-b border-white/10 flex items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#1C1C1E] border border-[#CCFF00]/30 flex items-center justify-center text-[#CCFF00] shadow-[0_0_14px_rgba(204,255,0,0.24)]">
              <User size={18} fill="currentColor" />
            </div>
            <span className="font-display text-[24px] font-black italic tracking-[-0.08em] text-[#CCFF00]">FLOW STATE</span>
          </div>
          <Bell size={21} className="text-[#CCFF00]" />
        </header>

        <div className="relative z-10 px-5 pt-8 pb-10 min-h-[calc(100vh-64px)] flex flex-col">
          <div className="flex justify-end mb-8">
            <div className="flex gap-1 bg-[#1C1C1E] border border-white/10 p-1 rounded-full">
              <button type="button" onClick={() => setLang('tr')} className={cn('px-3 py-1.5 text-xs font-black rounded-full transition-all', lang === 'tr' ? 'bg-[#CCFF00] text-[#131313] shadow-[0_0_14px_rgba(204,255,0,0.28)]' : 'text-[#c4c9ac] hover:text-white')}>TR</button>
              <button type="button" onClick={() => setLang('en')} className={cn('px-3 py-1.5 text-xs font-black rounded-full transition-all', lang === 'en' ? 'bg-[#CCFF00] text-[#131313] shadow-[0_0_14px_rgba(204,255,0,0.28)]' : 'text-[#c4c9ac] hover:text-white')}>EN</button>
            </div>
          </div>

          <section className="mb-8">
            <div className="w-24 h-24 mx-auto rounded-full bg-[#1C1C1E] border border-[#CCFF00] flex items-center justify-center text-[#CCFF00] shadow-[0_0_32px_rgba(204,255,0,0.26)] mb-7">
              <Flame size={46} fill="currentColor" />
            </div>
            <p className="text-center text-[#CCFF00] text-xs font-black uppercase tracking-[0.24em] mb-3">Premium Fitness System</p>
            <h1 className="font-display text-[46px] leading-[48px] font-black text-white tracking-[-0.08em] text-center uppercase">Enter Your Flow</h1>
            <p className="text-center text-[#c4c9ac] text-base font-medium mt-4 leading-6">Antrenmanlarını takip et, rutinlerini oluştur, gelişimini gör.</p>
          </section>

          <section className="bg-[#1C1C1E] border border-white/10 rounded-[28px] p-5 shadow-[0_20px_80px_-55px_rgba(204,255,0,0.8)]">
            <div className="grid grid-cols-2 gap-2 bg-[#131313] border border-white/10 p-1 rounded-full mb-6">
              <button type="button" onClick={() => setIsLogin(true)} className={cn('py-3 rounded-full text-sm font-black transition-all', isLogin ? 'bg-[#CCFF00] text-[#131313] shadow-[0_0_18px_rgba(204,255,0,0.3)]' : 'text-[#c4c9ac] hover:text-white')}>{t.login}</button>
              <button type="button" onClick={() => setIsLogin(false)} className={cn('py-3 rounded-full text-sm font-black transition-all', !isLogin ? 'bg-[#CCFF00] text-[#131313] shadow-[0_0_18px_rgba(204,255,0,0.3)]' : 'text-[#c4c9ac] hover:text-white')}>{t.register}</button>
            </div>

            <div className="space-y-3">
              {!isLogin && <Field icon={<User size={18} />} placeholder={t.name} type="text" />}
              <Field icon={<Mail size={18} />} placeholder={t.email} type="email" />
              <Field icon={<Lock size={18} />} placeholder={t.password} type="password" />

              {isLogin && <button type="button" className="w-full text-right text-[#0070F3] text-sm font-black pt-1">{t.forgotPassword}</button>}

              <button type="button" onClick={login} className="w-full mt-3 bg-[#CCFF00] hover:bg-[#abd600] text-[#131313] font-black py-4 rounded-full transition-all shadow-[0_0_24px_rgba(204,255,0,0.28)] active:scale-[0.98] flex items-center justify-center gap-2">
                <Zap size={19} fill="currentColor" /> {isLogin ? t.login : t.register}
              </button>
            </div>
          </section>

          <div className="mt-7 grid grid-cols-3 gap-3">
            <MiniMetric icon={<Dumbbell size={17} />} label="Routines" value="Build" />
            <MiniMetric icon={<Flame size={17} />} label="Streak" value="Flow" />
            <MiniMetric icon={<Zap size={17} />} label="Progress" value="Track" />
          </div>

          <p className="mt-auto pt-8 text-center text-xs text-[#8e9379] font-semibold">Demo MVP: gerçek auth henüz bağlı değil.</p>
        </div>
      </div>
    </div>
  );
}

function Field({ icon, placeholder, type }: { icon: React.ReactNode; placeholder: string; type: string }) {
  return (
    <label className="flex items-center gap-3 bg-[#201f1f] border border-white/10 rounded-2xl px-4 py-4 focus-within:border-[#CCFF00] transition-colors">
      <span className="text-[#CCFF00]">{icon}</span>
      <input type={type} placeholder={placeholder} className="min-w-0 flex-1 bg-transparent text-white placeholder:text-[#8e9379] font-semibold outline-none" />
    </label>
  );
}

function MiniMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-[#1C1C1E] border border-white/10 rounded-2xl p-3">
      <div className="text-[#CCFF00] mb-2">{icon}</div>
      <p className="text-white text-sm font-black leading-none">{value}</p>
      <p className="text-[#c4c9ac] text-[10px] font-black uppercase tracking-widest mt-1">{label}</p>
    </div>
  );
}
