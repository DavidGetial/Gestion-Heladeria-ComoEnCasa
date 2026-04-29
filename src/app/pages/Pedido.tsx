import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { ChevronLeft, ShoppingBag, Banknote, CreditCard, Search, Plus, Minus, AlertCircle, UtensilsCrossed, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { sendTelegram } from '../../lib/telegram';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";

export function Pedido() {
  const { id: mesaId } = useParams();
  const navigate = useNavigate();
  const { user, activeShift } = useAuth();
  
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [prevItems, setPrevItems] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showNequi, setShowNequi] = useState(false);
  const [refNequi, setRefNequi] = useState('');
  const [showNoShiftModal, setShowNoShiftModal] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!activeShift) setShowNoShiftModal(true);
    load();
  }, [mesaId, activeShift]);

  async function load() {
    const { data: p } = await supabase.from('products').select('*').eq('active', true).order('name', { ascending: true });
    const { data: o } = await supabase.from('orders').select('*').eq('table_id', mesaId).eq('status', 'pending').maybeSingle();
    if (p) setProducts(p);
    if (o) setPrevItems(o.items || []);
  }

  const addToCart = (p: any) => {
    setCart(prev => {
      const exist = prev.find(item => item.id === p.id);
      if (exist) return prev.map(item => item.id === p.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...p, quantity: 1 }];
    });
  };

  const updateQty = (id: string, delta: number, isPrev: boolean) => {
    const target = isPrev ? setPrevItems : setCart;
    target((prev: any[]) => prev.map(item => item.id === id ? { ...item, quantity: item.quantity + delta } : item).filter(i => i.quantity > 0));
  };

  const removeItem = (id: string, isPrev: boolean) => {
    if (isPrev) setPrevItems(prev => prev.filter(i => i.id !== id));
    else setCart(prev => prev.filter(i => i.id !== id));
  };

  const totalPagar = [...prevItems, ...cart].reduce((acc, i) => acc + (i.price * i.quantity), 0);

  const enviarACocina = async () => {
    if (cart.length === 0 && prevItems.length === 0) return toast.error("La cuenta está vacía");
    setSaving(true);
    try {
      const finalItems = [...prevItems, ...cart];
      const { data: order } = await supabase.from('orders').select('id').eq('table_id', mesaId).eq('status', 'pending').maybeSingle();
      if (order) await supabase.from('orders').update({ items: finalItems, total: totalPagar }).eq('id', order.id);
      else await supabase.from('orders').insert([{ table_id: Number(mesaId), items: finalItems, total: totalPagar, status: 'pending', shift_id: activeShift.id }]);

      await supabase.from('tables').update({ status: 'En preparación', total_actual: totalPagar }).eq('id', mesaId);
      toast.success("Enviado a cocina");
      navigate('/');
    } catch (e) { toast.error("Error"); } finally { setSaving(false); }
  };

  const finalizarCobro = async (metodo: string) => {
    if (metodo === 'Transferencia' && refNequi.length < 4) return toast.error("Ref. incompleta");
    setSaving(true);
    try {
      await supabase.from('orders').update({ status: 'completed', payment_method: metodo, notes: refNequi, total: totalPagar, items: [...prevItems, ...cart] }).match({ table_id: mesaId, status: 'pending' });
      await supabase.from('cash_movements').insert([{ shift_id: activeShift.id, type: 'venta', amount: totalPagar, description: `Venta Mesa ${mesaId}`, payment_method: metodo }]);
      await supabase.from('tables').update({ status: 'Vacía', total_actual: 0 }).eq('id', mesaId);
      
      if (metodo === 'Transferencia') {
        const itemsTxt = [...prevItems, ...cart].map(i => `• ${i.quantity}x ${i.name}`).join('\n');
        sendTelegram(`📱 *PAGO NEQUI - MESA ${mesaId}*\n👤 Vendedor: ${user.name}\n${itemsTxt}\n💰 Total: $${totalPagar.toLocaleString()}\n🔢 Ref: ****${refNequi}`);
      }
      toast.success("Mesa liberada");
      navigate('/');
    } catch (e) { toast.error("Error"); } finally { setSaving(false); }
  };

  return (
    <div className="flex h-full bg-[#F1F5F9]">
      <div className="flex-1 p-10 overflow-auto border-r border-slate-200">
        <div className="flex items-center gap-6 mb-10"><Link to="/"><ChevronLeft size={32}/></Link><h1 className="text-4xl font-black uppercase">Mesa {mesaId}</h1></div>
        <div className="relative mb-10"><Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20}/><input type="text" placeholder="Buscar..." className="w-full pl-14 pr-6 py-5 bg-white rounded-[25px] shadow-sm border-none font-bold outline-none" onChange={e => setSearch(e.target.value)} /></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map(p => (
            <Card key={p.id} onClick={() => addToCart(p)} className="p-8 bg-white rounded-[40px] border-none shadow-xl hover:scale-[1.02] cursor-pointer transition-all">
              <span className="text-[9px] bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-black uppercase">{p.category}</span>
              <p className="font-black text-slate-800 text-xl mt-4 leading-tight">{p.name}</p><p className="text-3xl font-black text-slate-900 mt-4">${p.price.toLocaleString()}</p>
            </Card>
          ))}
        </div>
      </div>

      <aside className="w-[500px] bg-white p-10 flex flex-col shadow-2xl relative z-50">
        <h2 className="text-2xl font-black mb-8 uppercase flex items-center gap-3"><ShoppingBag className="text-blue-600"/> Cuenta Mesa</h2>
        <div className="flex-1 overflow-auto space-y-6">
          {[...prevItems, ...cart].map((item, idx) => (
            <div key={idx} className="bg-slate-50 p-5 rounded-[30px] flex justify-between items-center border border-white">
              <div className="flex-1"><p className="font-bold text-slate-700 text-sm">{item.name}</p><button onClick={() => removeItem(item.id, cart.some(c => c.id === item.id) ? false : true)} className="text-[9px] font-black text-red-400 uppercase mt-1 flex items-center gap-1"><Trash2 size={10}/> Quitar</button></div>
              <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border"><button onClick={() => updateQty(item.id, -1, cart.some(c => c.id === item.id) ? false : true)}><Minus size={16}/></button><span className="font-black text-lg">{item.quantity}</span><button onClick={() => updateQty(item.id, 1, cart.some(c => c.id === item.id) ? false : true)}><Plus size={16}/></button></div>
            </div>
          ))}
        </div>
        <div className="pt-8 border-t-4 border-slate-50 mt-6 space-y-6"><div className="flex justify-between items-end px-4"><span className="text-slate-400 font-black text-xs">Total</span><span className="text-6xl font-black text-slate-900 tracking-tighter">${totalPagar.toLocaleString()}</span></div>
          <div className="flex flex-col gap-3"><Button onClick={enviarACocina} disabled={cart.length === 0 || saving} className="h-20 bg-blue-600 text-white rounded-[35px] font-black text-xl shadow-xl uppercase hover:bg-blue-700">{saving ? "ENVIANDO..." : "ENVIAR A COCINA"}</Button><div className="grid grid-cols-2 gap-3"><button onClick={() => finalizarCobro('Efectivo')} className="h-16 bg-emerald-500 text-white rounded-3xl font-black uppercase text-[10px]">Efectivo</button><button onClick={() => setShowNequi(true)} className="h-16 bg-pink-500 text-white rounded-3xl font-black uppercase text-[10px]">Nequi</button></div></div>
        </div>
      </aside>

      <Dialog open={showNequi} onOpenChange={setShowNequi}><DialogContent className="rounded-[50px] p-12 bg-white shadow-2xl max-w-[400px] border-none"><DialogHeader><DialogTitle className="text-center text-3xl font-black uppercase">Ref. Nequi</DialogTitle></DialogHeader><div className="mt-8 space-y-8 text-center"><input type="number" className="w-full p-10 bg-slate-50 rounded-[35px] text-6xl font-black text-center text-blue-600 outline-none" placeholder="0000" value={refNequi} onChange={e => setRefNequi(e.target.value.slice(0,4))} /><Button onClick={() => finalizarCobro('Transferencia')} className="w-full h-20 bg-blue-600 text-white rounded-[28px] font-black text-xl uppercase shadow-xl">Confirmar Cobro</Button></div></DialogContent></Dialog>
    </div>
  );
}
