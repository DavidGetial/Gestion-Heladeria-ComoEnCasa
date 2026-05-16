import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { sendTelegram } from '../../lib/telegram';
import { 
  ShoppingBag, Trash2, Banknote, CreditCard, 
  Search, Plus, Minus, AlertCircle, Coffee, CheckCircle2, Clock 
} from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";

const SABORES_HELADO = [
  { id: '1', name: 'Vainilla Chips' },
  { id: '2', name: 'Chocolate Suizo' },
  { id: '3', name: 'Fresa Silvestre' },
  { id: '4', name: 'Ron con Pasas' },
  { id: '5', name: 'Oreo Cream' },
  { id: '6', name: 'Guanábana' }
];

export function Mesas() {
  const navigate = useNavigate();
  const { user, activeShift } = useAuth();
  const [tables, setTables] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showNequi, setShowNequi] = useState(false);
  const [refNequi, setRefNequi] = useState('');
  const [showNoShiftModal, setShowNoShiftModal] = useState(false);
  const [showMonthBlock, setShowMonthBlock] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [showFlavorModal, setShowFlavorModal] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<any>(null);

  useEffect(() => {
    load();
    checkEndOfMonth();
    const sub = supabase.channel('salon-simple').on('postgres_changes' as any, { event: '*', schema: 'public', table: 'tables' }, () => load()).subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  async function load() {
    const { data: t } = await supabase.from('tables').select('*').neq('id', 0).order('id', { ascending: true });
    const { data: p } = await supabase.from('products').select('*').eq('active', true).order('name', { ascending: true });
    if (t) setTables(t);
    if (p) setProducts(p);
  }

  async function checkEndOfMonth() {
    const today = new Date();
    if (today.getDate() === 1) {
      const { data } = await supabase.from('orders').select('created_at').eq('status', 'completed').order('created_at', { ascending: false }).limit(1);
      if (data && data.length > 0) {
        const orderDate = new Date(data[0].created_at);
        if (orderDate.getMonth() !== today.getMonth()) {
          setShowMonthBlock(true);
        }
      }
    }
  }

  const handleForcedReset = async () => {
    if (adminPass !== '1080044879') {
      return toast.error("Contraseña incorrecta de Administrador");
    }
    await supabase.from('orders').delete().eq('status', 'completed');
    await supabase.from('cash_movements').delete();
    sendTelegram(`⚠️ *CIERRE AUTOMÁTICO DE MES EJECUTADO*\nEl sistema detectó cambio de mes y fue desbloqueado usando la clave maestra.`);
    toast.success("Sistema listo para el nuevo mes");
    setShowMonthBlock(false);
    setAdminPass('');
    load();
  };

  const handleProductSelect = (p: any) => {
    if (!activeShift) { setShowNoShiftModal(true); return; }
    if (p.requires_flavor) {
      setPendingProduct(p);
      setShowFlavorModal(true);
    } else {
      executeAddToCart(p, null);
    }
  };

  const executeAddToCart = (p: any, flavorName: string | null) => {
    setCart(prev => {
      const uniqueCartId = flavorName ? `${p.id}-${flavorName}` : `${p.id}-regular`;
      const exist = prev.find(item => item.uniqueCartId === uniqueCartId);
      const displayName = flavorName ? `${p.name} (${flavorName})` : p.name;

      if (exist) {
        return prev.map(item => item.uniqueCartId === uniqueCartId ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...p, uniqueCartId, quantity: 1, chosenFlavor: flavorName, displayName }];
    });
    setShowFlavorModal(false);
    setPendingProduct(null);
  };

  const updateQty = (uniqueCartId: string, delta: number) => {
    setCart(prev => prev.map(item => item.uniqueCartId === uniqueCartId ? { ...item, quantity: item.quantity + delta } : item).filter(i => i.quantity > 0));
  };

  const removeItem = (uniqueCartId: string) => {
    setCart(prev => prev.filter(i => i.uniqueCartId !== uniqueCartId));
    toast.info("Producto eliminado");
  };

  const totalFinal = cart.reduce((acc, i) => acc + (i.price * i.quantity), 0);

  const finalizarVenta = async (metodo: string) => {
    if (!activeShift) return setShowNoShiftModal(true);
    if (metodo === 'Transferencia' && refNequi.length < 4) return toast.error("Faltan 4 dígitos");
    const { error } = await supabase.from('orders').insert([{ table_id: 0, items: cart, total: totalFinal, status: 'completed', payment_method: metodo, notes: refNequi, shift_id: activeShift.id }]);
    if (!error) {
      await supabase.from('cash_movements').insert([{ shift_id: activeShift.id, type: 'venta', amount: totalFinal, description: 'Venta Mostrador', payment_method: metodo }]);
      if (metodo === 'Transferencia') {
        const itemsTxt = cart.map(i => `• ${i.quantity}x ${i.displayName}`).join('\n');
        sendTelegram(`📱 *PAGO NEQUI - COMO EN CASA HELADERÍA*\n👤 *Vendedor:* ${user.name}\n--------------------------\n${itemsTxt}\n--------------------------\n💰 *Total:* $${totalFinal.toLocaleString()}\n🔢 *Ref:* ****${refNequi}`);
      }
      toast.success("Venta Exitosa");
      setCart([]);
      setShowNequi(false);
      setRefNequi('');
    }
  };

  return (
    <div className="flex h-full bg-[#F8FAFC]">
      <div className="flex-1 p-10 overflow-auto border-r border-slate-100">
        <div className="mb-12"><h1 className="text-5xl font-black text-slate-900 uppercase tracking-tighter">Como en Casa</h1></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tables.map((t) => {
            let bgClass = "bg-white border-transparent text-slate-900";
            let badgeClass = "bg-slate-50 text-slate-400";
            let iconColor = "text-slate-200";
            let statusTextClass = "text-slate-300";

            if (t.status === 'En preparación') {
              bgClass = "bg-amber-400 border-amber-500 text-white shadow-xl shadow-amber-100";
              badgeClass = "bg-white/20 text-white shadow-inner";
              iconColor = "text-white/90";
              statusTextClass = "text-white/80";
            } else if (t.status === 'Lista para cobrar') {
              bgClass = "bg-emerald-500 border-emerald-600 text-white shadow-xl shadow-emerald-100";
              badgeClass = "bg-white/20 text-white shadow-inner";
              iconColor = "text-white/90";
              statusTextClass = "text-white/80";
            }

            return (
              <div 
                key={t.id} 
                onClick={() => { if(!showMonthBlock) { activeShift ? navigate(`/pedido/${t.id}`) : setShowNoShiftModal(true); } }} 
                className={`p-8 rounded-[45px] border-4 transition-all duration-300 hover:scale-[1.03] cursor-pointer shadow-xl ${bgClass}`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-2xl font-black ${badgeClass}`}>
                    {t.id}
                  </div>
                  {t.status === 'En preparación' ? (
                    <Clock className={`${iconColor} animate-pulse`} size={24} />
                  ) : t.status === 'Lista para cobrar' ? (
                    <CheckCircle2 className={iconColor} size={24} />
                  ) : (
                    <Coffee className={iconColor} size={24} />
                  )}
                </div>
                <p className="font-black text-3xl tracking-tighter">${Number(t.total_actual).toLocaleString()}</p>
                <p className={`font-black text-[10px] uppercase mt-2 tracking-widest ${statusTextClass}`}>{t.status}</p>
              </div>
            );
          })}
        </div>
      </div>

      <aside className="w-[520px] bg-white p-10 flex flex-col shadow-2xl relative z-50">
        <div className="flex justify-between items-center mb-8"><h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Mostrador</h2>{cart.length > 0 && <button onClick={() => setCart([])} className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={20}/></button>}</div>
        <div className="relative mb-8">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} /><input type="text" placeholder="Buscar helado..." className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-[25px] border-none font-bold text-slate-700 outline-none shadow-inner" onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex-1 overflow-auto space-y-4 pr-2 custom-scrollbar">
          <div className="grid grid-cols-2 gap-3 mb-6">
            {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).slice(0, 4).map(p => (
              <button key={p.id} onClick={() => handleProductSelect(p)} className="p-4 bg-white border-2 border-slate-100 rounded-[22px] font-black text-[11px] uppercase text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-all text-left flex flex-col shadow-sm">
                <span>{p.name}</span>
                {p.requires_flavor && <span className="text-[9px] text-pink-500 font-bold mt-1">✨ Requiere Sabor</span>}
              </button>
            ))}
          </div>
          {cart.map((item) => (
            <div key={item.uniqueCartId} className="bg-slate-50 p-5 rounded-[30px] flex flex-col gap-2 border border-white shadow-sm">
              <div className="flex justify-between items-center">
                <div className="flex-1"><p className="font-black text-slate-800 text-sm uppercase leading-tight">{item.displayName}</p><p className="text-blue-500 font-bold text-xs">${item.price.toLocaleString()}</p></div>
                <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-inner">
                  <button onClick={() => updateQty(item.uniqueCartId, -1)} className="text-slate-300 hover:text-red-500"><Minus size={16}/></button>
                  <span className="font-black text-lg w-6 text-center text-slate-900">{item.quantity}</span>
                  <button onClick={() => updateQty(item.uniqueCartId, 1)} className="text-slate-300 hover:text-blue-600"><Plus size={16}/></button>
                </div>
              </div>
              <button onClick={() => removeItem(item.uniqueCartId)} className="text-[9px] font-black text-red-400 uppercase flex items-center gap-1 hover:text-red-600 ml-1"><Trash2 size={12} /> Quitar</button>
            </div>
          ))}
        </div>
        <div className="pt-8 border-t-4 border-slate-50 mt-6 space-y-6">
          <div className="flex justify-between items-end px-4"><span className="text-slate-400 font-black text-xs uppercase tracking-widest">Total Pagar</span><span className="text-6xl font-black text-slate-900 tracking-tighter">${totalFinal.toLocaleString()}</span></div>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => finalizarVenta('Efectivo')} disabled={cart.length === 0 || showMonthBlock} className="h-24 bg-emerald-500 text-white rounded-[35px] font-black uppercase text-xs shadow-xl">Efectivo</button>
            <button onClick={() => setShowNequi(true)} disabled={cart.length === 0 || showMonthBlock} className="h-24 bg-blue-500 text-white rounded-[35px] font-black uppercase text-xs shadow-xl">Nequi</button>
          </div>
        </div>
      </aside>

      <Dialog open={showFlavorModal} onOpenChange={setShowFlavorModal}>
        <DialogContent className="rounded-[45px] p-10 bg-white border-none shadow-2xl max-w-md">
          <DialogHeader><DialogTitle className="text-center text-2xl font-black uppercase text-slate-900">Sabor de Helado</DialogTitle><DialogDescription className="text-center font-bold text-slate-400 text-xs uppercase mt-1">Elige la bola para mostrador</DialogDescription></DialogHeader>
          <div className="grid grid-cols-2 gap-3 mt-6">
            {SABORES_HELADO.map((f) => (
              <button key={f.id} onClick={() => executeAddToCart(pendingProduct, f.name)} className="p-4 bg-slate-50 hover:bg-blue-600 hover:text-white rounded-2xl font-black text-xs uppercase text-slate-700 transition-all text-center border shadow-sm">{f.name}</button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showNequi} onOpenChange={setShowNequi}>
        <DialogContent className="rounded-[50px] p-12 bg-white border-none shadow-2xl max-w-[400px]">
          <DialogHeader><DialogTitle className="text-center text-3xl font-black uppercase tracking-tighter">Referencia Nequi</DialogTitle></DialogHeader>
          <div className="mt-8 space-y-8 text-center">
            <input type="number" className="w-full p-10 bg-slate-50 rounded-[35px] text-6xl font-black text-center text-blue-600 outline-none border-none shadow-inner" placeholder="0000" value={refNequi} onChange={e => setRefNequi(e.target.value.slice(0, 4))} />
            <Button onClick={() => { setShowNequi(false); finalizarVenta('Transferencia'); }} className="w-full h-20 bg-blue-600 text-white rounded-[28px] font-black text-xl uppercase shadow-xl">Confirmar</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showNoShiftModal} onOpenChange={setShowNoShiftModal}>
        <DialogContent className="rounded-[50px] p-12 bg-white text-center shadow-2xl max-w-[420px] border-none">
          <AlertCircle size={56} className="text-red-500 mx-auto mb-8 animate-bounce" />
          <DialogHeader><DialogTitle className="text-3xl font-black uppercase text-slate-900 tracking-tighter">¡Caja Cerrada!</DialogTitle></DialogHeader>
          <p className="text-slate-500 font-medium mt-4">Abre el turno en la pestaña de <span className="font-black text-blue-600">Caja</span> antes de vender.</p>
          <Button onClick={() => navigate('/caja')} className="w-full h-20 bg-slate-900 text-white rounded-[30px] font-black text-lg uppercase mt-10 shadow-2xl">Ir a abrir caja ahora</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={showMonthBlock} onOpenChange={setShowMonthBlock}>
        <DialogContent className="rounded-[50px] p-12 bg-white text-center shadow-2xl max-w-[440px] border-none">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <span className="text-2xl">🔒</span>
          </div>
          <DialogHeader><DialogTitle className="text-3xl font-black uppercase text-slate-900 tracking-tight">Cierre de Mes Mandatorio</DialogTitle></DialogHeader>
          <p className="text-slate-500 font-medium text-sm mt-4">Se ha detectado un cambio de mes. Las ventas deben ser reiniciadas antes de continuar operando el POS.</p>
          <div className="mt-6 space-y-4">
            <input 
              type="password" 
              className="w-full p-5 bg-slate-50 rounded-[20px] text-2xl font-black text-center text-slate-800 outline-none border border-slate-200 shadow-inner" 
              placeholder="••••••••" 
              value={adminPass} 
              onChange={e => setAdminPass(e.target.value)} 
            />
            <Button onClick={handleForcedReset} className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-wider shadow-lg">Desbloquear Sistema</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
