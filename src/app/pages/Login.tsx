import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { sendTelegram } from '../../lib/telegram';
import { toast } from 'sonner';
import { Delete, Lock } from 'lucide-react';

export function Login() {
  const [pin, setPin] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') { if (pin.length < 4) setPin(p => p + e.key); }
      else if (e.key === 'Backspace') { setPin(p => p.slice(0, -1)); }
      else if (e.key === 'Enter' && pin.length === 4) handleLogin();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin]);

  const handleLogin = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('pin', pin).maybeSingle();
    if (data) {
      login(data);
      sendTelegram(`🛡️ *ACCESO AL POS - COMO EN CASA*\n\nEl usuario *${data.name}* acaba de iniciar sesión.`);
      toast.success(`¡Bienvenido!`);
      const path = data.role === 'admin' ? '/stats' : '/';
      setTimeout(() => navigate(path), 500);
    } else {
      toast.error("PIN Incorrecto");
      setPin('');
    }
  };

  return (
    <div className="h-screen w-screen bg-[#F8FAFC] flex flex-col items-center justify-center">
      <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner animate-bounce">🍦</div>
      <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter mb-2">Como en Casa</h1>
      <p className="text-slate-400 text-xs font-bold uppercase tracking-[3px] mb-12">Heladería & POS</p>
      
      {/* CORREGIDO: Array definido para los 4 puntos del PIN */}
      <div className="flex gap-6 mb-12">
        {[0, 1, 2, 3].map((i: number) => (
          <div key={i} className={`w-5 h-5 rounded-full border-2 border-pink-500 transition-all ${pin.length > i ? 'bg-pink-500 scale-125 shadow-lg' : ''}`} />
        ))}
      </div>
      
      {/* CORREGIDO: Array definido para los botones del 1 al 9 */}
      <div className="grid grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n: number) => (
          <button key={n} onClick={() => { if (pin.length < 4) setPin(p => p + n); }} className="w-20 h-20 bg-white rounded-[24px] shadow-sm text-2xl font-black border border-slate-100 active:scale-90">{n}</button>
        ))}
        <button onClick={() => setPin('')} className="w-20 h-20 bg-slate-100 rounded-[24px] flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-400 active:scale-90 transition-all"><Delete/></button>
        <button onClick={() => { if (pin.length < 4) setPin(p => p + '0'); }} className="w-20 h-20 bg-white rounded-[24px] shadow-sm text-2xl font-black border border-slate-100 active:scale-90">0</button>
        <button onClick={handleLogin} disabled={pin.length < 4} className={`w-20 h-20 rounded-[24px] flex items-center justify-center transition-all ${pin.length === 4 ? 'bg-pink-500 text-white shadow-lg active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}><Lock/></button>
      </div>
    </div>
  );
}
