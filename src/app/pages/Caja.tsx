import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { sendTelegram } from '../../lib/telegram';
import { Card } from '../components/ui/card';
import { 
  Wallet, Plus, Minus, History, Power, 
  Receipt, Landmark, Store, CheckCircle2 
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "../components/ui/dialog";

export function Caja() {
  const { user, activeShift, checkActiveShift } = useAuth();
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'base' | 'gasto' | 'cierre'>('base');
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');

  useEffect(() => {
    if (activeShift) fetchData();
    else setLoading(false);
  }, [activeShift]);

  async function fetchData() {
    const { data } = await supabase.from('cash_movements')
      .select('*')
      .eq('shift_id', activeShift.id)
      .order('created_at', { ascending: false });
    if (data) setMovements(data);
    setLoading(false);
  }

  const handleOpenShift = async () => {
    const { data: lastShift } = await supabase.from('shifts').select('actual_cash').eq('status', 'closed').order('end_time', { ascending: false }).limit(1).maybeSingle();
    const balance = amount ? Number(amount) : (lastShift?.actual_cash || 0);
    const { error } = await supabase.from('shifts').insert([{ user_id: user.id, initial_balance: balance, status: 'open' }]);
    if (!error) { 
      sendTelegram(`🔓 *TURNO ABIERTO*\n👤: ${user.name}\n📥 Base: $${balance.toLocaleString()}`);
      checkActiveShift(); setShowModal(false); setAmount(''); 
    }
  };

  const handleRegisterExpense = async () => {
    if (!amount || !desc) return toast.error("Completa los datos");
    const { error } = await supabase.from('cash_movements').insert([{ 
      shift_id: activeShift.id, type: 'gasto', amount: Number(amount), 
      description: desc, payment_method: 'Efectivo' 
    }]);
    if (!error) { 
      sendTelegram(`💸 *GASTO REGISTRADO*\n👤: ${user.name}\n💰: -$${Number(amount).toLocaleString()}\n📝: ${desc}`);
      toast.success("Gasto guardado"); setShowModal(false); setAmount(''); setDesc(''); fetchData(); 
    }
  };

  const handleCloseShift = async () => {
    const efe = movements.filter(m => m.type === 'venta' && m.payment_method === 'Efectivo').reduce((acc, m) => acc + Number(m.amount), 0);
    const neq = movements.filter(m => m.type === 'venta' && m.payment_method === 'Transferencia').reduce((acc, m) => acc + Number(m.amount), 0);
    const gas = movements.filter(m => m.type === 'gasto').reduce((acc, m) => acc + Number(m.amount), 0);
    const saldoEstimado = Number(activeShift.initial_balance) + efe - gas;

    // 1. Acumulado Histórico Real
    const { data: allSales } = await supabase.from('orders').select('total').eq('status', 'completed');
    const historico = allSales?.reduce((acc, curr) => acc + Number(curr.total), 0) || 0;

    const { error } = await supabase.from('shifts').update({ 
      end_time: new Date(), status: 'closed', total_cash_sales: efe, total_nequi_sales: neq, total_expenses: gas, expected_cash: saldoEstimado, actual_cash: saldoEstimado 
    }).eq('id', activeShift.id);

    if (!error) {
        const msg = `🏁 *CIERRE DE CAJA - FRUTI HOME* 🏁\n\n` +
                    `👤 *Vendedor:* ${user.name}\n` +
                    `📥 *Base:* $${Number(activeShift.initial_balance).toLocaleString()}\n` +
                    `💰 *Ventas Efectivo:* $${efe.toLocaleString()}\n` +
                    `🏦 *Nequi:* $${neq.toLocaleString()}\n` +
                    `💸 *Gastos:* $${gas.toLocaleString()}\n` +
                    `--------------------------\n` +
                    `💵 *Efectivo en Caja:* $${saldoEstimado.toLocaleString()}\n` +
                    `📈 *ACUMULADO TOTAL:* $${historico.toLocaleString()}`;
        
        await sendTelegram(msg);
        toast.success("Caja cerrada y reporte enviado");
        setTimeout(() => window.location.reload(), 1000);
    }
  };

  if (loading) return <div className="p-20 text-center font-black animate-pulse uppercase tracking-[4px] text-slate-300">Sincronizando...</div>;

  if (!activeShift) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-10 bg-[#F8FAFC]">
        <div className="bg-white p-12 rounded-[50px] shadow-2xl text-center border-2 max-w-md">
          <Power size={50} className="text-pink-500 mx-auto mb-6" />
          <h2 className="text-3xl font-black uppercase mb-4 text-slate-900">Caja Cerrada</h2>
          <Button onClick={() => { setModalType('base'); setShowModal(true); }} className="w-full h-20 bg-blue-600 text-white rounded-3xl font-black text-xl shadow-xl uppercase">Abrir Turno</Button>
        </div>
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="rounded-[40px] p-10 bg-white border-none shadow-2xl">
            <DialogHeader><DialogTitle className="text-center font-black uppercase text-slate-900">Base de apertura</DialogTitle></DialogHeader>
            <input type="number" className="w-full p-8 bg-slate-50 rounded-[30px] text-5xl font-black text-center text-blue-600 outline-none mt-4" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" autoFocus />
            <Button onClick={handleOpenShift} className="w-full h-16 bg-emerald-500 text-white rounded-2xl font-black mt-8 uppercase">Confirmar Apertura</Button>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  const efeTotal = movements.filter(m => m.type === 'venta' && m.payment_method === 'Efectivo').reduce((acc, m) => acc + Number(m.amount), 0);
  const neqTotal = movements.filter(m => m.type === 'venta' && m.payment_method === 'Transferencia').reduce((acc, m) => acc + Number(m.amount), 0);
  const gasTotal = movements.filter(m => m.type === 'gasto').reduce((acc, m) => acc + Number(m.amount), 0);
  const saldoActual = Number(activeShift.initial_balance) + efeTotal - gasTotal;

  return (
    <div className="p-10 bg-[#F8FAFC] min-h-full">
      <div className="flex justify-between items-end mb-10">
        <div><h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Caja</h1><p className="text-slate-400 font-bold uppercase text-[10px]">Cajero: {user.name}</p></div>
        <div className="flex gap-4">
          <Button onClick={() => { setModalType('gasto'); setShowModal(true); }} className="bg-red-500 text-white rounded-2xl h-14 px-8 font-black uppercase text-[10px] shadow-lg">Registrar Gasto</Button>
          <Button onClick={() => { setModalType('cierre'); setShowModal(true); }} className="bg-slate-900 text-white rounded-2xl h-14 px-8 font-black uppercase text-[10px] shadow-lg">Cerrar Caja</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <Card className="p-10 border-none shadow-2xl rounded-[50px] bg-blue-600 text-white col-span-2 relative overflow-hidden">
          <Wallet className="absolute -right-6 -top-6 w-40 h-40 opacity-10" />
          <p className="text-xs font-black uppercase opacity-70 tracking-widest">Saldo Físico Estimado</p>
          <p className="text-6xl font-black tracking-tighter mt-2">${saldoActual.toLocaleString()}</p>
        </Card>
        <Card className="p-6 bg-white rounded-[40px] border shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-2 text-slate-400 mb-1"><Store size={14}/><p className="text-[10px] font-black uppercase">Base Inicial</p></div>
            <p className="text-2xl font-black text-slate-900">${Number(activeShift.initial_balance).toLocaleString()}</p>
        </Card>
        <Card className="p-6 bg-white rounded-[40px] border shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-2 text-emerald-500 mb-1"><Receipt size={14}/><p className="text-[10px] font-black uppercase">Ventas Efec.</p></div>
            <p className="text-2xl font-black text-emerald-600">+${efeTotal.toLocaleString()}</p>
        </Card>
        <Card className="p-6 bg-white rounded-[40px] border shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-2 text-red-500 mb-1"><Minus size={14}/><p className="text-[10px] font-black uppercase">Gastos</p></div>
            <p className="text-2xl font-black text-red-500">-${gasTotal.toLocaleString()}</p>
        </Card>
        <Card className="p-6 bg-white rounded-[40px] border shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-2 text-blue-500 mb-1"><Landmark size={14}/><p className="text-[10px] font-black uppercase">Ventas Nequi</p></div>
            <p className="text-2xl font-black text-blue-500">${neqTotal.toLocaleString()}</p>
        </Card>
      </div>

      <Card className="border-none shadow-sm rounded-[40px] overflow-hidden bg-white border border-slate-100">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100"><tr className="text-[10px] font-black uppercase text-slate-400"><th className="px-10 py-6">Descripción</th><th className="px-10 py-6">Método</th><th className="px-10 py-6 text-right">Monto</th></tr></thead>
          <tbody className="divide-y divide-slate-50">
            {movements.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-10 py-6 font-bold text-slate-800 uppercase text-sm leading-tight">{m.description}<p className="text-[10px] text-slate-400 font-bold mt-1">{new Date(m.created_at).toLocaleTimeString()}</p></td>
                <td className="px-10 py-6"><span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${m.payment_method === 'Transferencia' ? 'bg-blue-50 text-blue-500' : 'bg-slate-100 text-slate-500'}`}>{m.payment_method}</span></td>
                <td className={`px-10 py-6 text-right font-black text-2xl tracking-tighter ${m.type === 'gasto' ? 'text-red-500' : 'text-slate-900'}`}>{m.type === 'gasto' ? '-' : '+'}${Number(m.amount).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="rounded-[40px] p-12 bg-white shadow-2xl border-none text-center">
          {modalType === 'cierre' ? (
            <div className="space-y-8 animate-in zoom-in duration-300">
              <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mx-auto text-4xl">🍦</div>
              <DialogHeader><DialogTitle className="text-3xl font-black uppercase text-slate-900">Fruti Home POS</DialogTitle><DialogDescription className="text-slate-500 font-bold text-lg mt-2">¿Confirmas cerrar caja con <span className="text-blue-600 font-black">${saldoActual.toLocaleString()}</span>?</DialogDescription></DialogHeader>
              <Button onClick={handleCloseShift} className="h-20 w-full bg-blue-600 text-white rounded-[30px] font-black text-xl shadow-xl hover:bg-blue-700">FINALIZAR Y ENVIAR REPORTE</Button>
            </div>
          ) : (
            <div className="space-y-6">
                <DialogHeader><DialogTitle className="text-2xl font-black uppercase">Registrar Gasto</DialogTitle></DialogHeader>
                <input type="number" className="w-full p-8 bg-slate-50 rounded-[30px] text-4xl font-black text-blue-600 text-center outline-none" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" autoFocus />
                <input className="w-full p-5 bg-slate-50 rounded-2xl font-bold border-none outline-none focus:bg-white transition-all" value={desc} onChange={e => setDesc(e.target.value)} placeholder="¿En qué se gastó?" />
                <Button onClick={handleRegisterExpense} className="w-full h-16 bg-blue-600 text-white rounded-[30px] font-black uppercase">Confirmar Gasto</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
