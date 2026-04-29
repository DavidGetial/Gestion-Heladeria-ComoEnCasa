import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { CheckCircle2, Utensils, Clock, Store, Users } from 'lucide-react';
import { toast } from 'sonner';

export function Cocina() {
  const [pedidos, setPedidos] = useState<any[]>([]);

  useEffect(() => {
    fetchPedidos();
    const ch = supabase.channel('despacho-realtime')
      .on('postgres_changes' as any, { event: '*', schema: 'public', table: 'orders' }, () => fetchPedidos())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  async function fetchPedidos() {
    const { data } = await supabase.from('orders')
      .select('*')
      .in('status', ['pending', 'completed'])
      .order('created_at', { ascending: true });
    setPedidos(data || []);
  }

  const marcarItemServido = async (pedidoId: string, itemIdx: number) => {
    const pedido = pedidos.find(p => p.id === pedidoId);
    if (!pedido) return;
    const nuevosItems = [...pedido.items];
    nuevosItems[itemIdx].servido = true;
    await supabase.from('orders').update({ items: nuevosItems }).eq('id', pedidoId);

    const todoListo = nuevosItems.every((i: any) => i.servido === true);
    if (todoListo && pedido.table_id !== 0 && pedido.status === 'pending') {
      await supabase.from('tables').update({ status: 'Lista para cobrar' }).eq('id', pedido.table_id);
    }
    fetchPedidos();
    toast.success("¡Producto entregado!");
  };

  // FILTROS PARA LAS DOS COLUMNAS
  const pedidosMostrador = pedidos.filter(p => p.table_id === 0 && p.items?.some((i: any) => !i.servido));
  const pedidosMesas = pedidos.filter(p => p.table_id !== 0 && p.items?.some((i: any) => !i.servido));

  return (
    <div className="flex h-screen bg-[#F1F5F9] overflow-hidden">
      
      {/* SECCIÓN MOSTRADOR (IZQUIERDA) */}
      <section className="flex-1 flex flex-col border-r-4 border-slate-200">
        <div className="p-6 bg-blue-600 text-white flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <Store size={28} />
            <h1 className="text-2xl font-black uppercase tracking-tighter">Mostrador (Venta Rápida)</h1>
          </div>
          <span className="bg-white/20 px-4 py-1 rounded-full font-bold text-sm">{pedidosMostrador.length} Pedidos</span>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-6">
          {pedidosMostrador.map((p) => (
            <div key={p.id} className="bg-white rounded-[32px] shadow-md border-2 border-blue-100 overflow-hidden animate-in slide-in-from-left-4">
              <div className="bg-blue-50 px-6 py-3 flex justify-between items-center border-b">
                <span className="font-black text-blue-600 text-xs uppercase">Ticket #{p.id.slice(0,4)}</span>
                <span className="bg-emerald-500 text-white px-3 py-1 rounded-full font-black text-[9px] uppercase">Ya Pagado</span>
              </div>
              <div className="p-6 space-y-4">
                {p.items.map((item: any, idx: number) => !item.servido && (
                  <div key={idx} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div>
                      <p className="font-black text-slate-800">{item.quantity}x {item.name}</p>
                      {item.sabor && <p className="text-[10px] text-blue-600 font-black uppercase">Sabor: {item.sabor}</p>}
                    </div>
                    <button onClick={() => marcarItemServido(p.id, idx)} className="h-10 w-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-all"><CheckCircle2 size={20}/></button>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {pedidosMostrador.length === 0 && <div className="h-full flex flex-col items-center justify-center opacity-20"><Store size={80} /><p className="font-black uppercase mt-4">Sin pedidos aquí</p></div>}
        </div>
      </section>

      {/* SECCIÓN MESAS (DERECHA) */}
      <section className="flex-1 flex flex-col">
        <div className="p-6 bg-pink-500 text-white flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <Users size={28} />
            <h1 className="text-2xl font-black uppercase tracking-tighter">Pedidos de Mesas</h1>
          </div>
          <span className="bg-white/20 px-4 py-1 rounded-full font-bold text-sm">{pedidosMesas.length} Pedidos</span>
        </div>

        <div className="flex-1 overflow-auto p-6 space-y-6">
          {pedidosMesas.map((p) => (
            <div key={p.id} className="bg-white rounded-[32px] shadow-md border-2 border-pink-100 overflow-hidden animate-in slide-in-from-right-4">
              <div className="bg-pink-50 px-6 py-3 flex justify-between items-center border-b">
                <span className="font-black text-pink-600 text-lg uppercase">MESA {p.table_id}</span>
                <div className="flex items-center gap-2">
                    <Clock size={14} className="text-pink-300" />
                    <span className="text-[10px] font-bold text-pink-400 uppercase">{new Date(p.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {p.items.map((item: any, idx: number) => !item.servido && (
                  <div key={idx} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div>
                      <p className="font-black text-slate-800">{item.quantity}x {item.name}</p>
                      {item.sabor && <p className="text-[10px] text-pink-600 font-black uppercase">Sabor: {item.sabor}</p>}
                    </div>
                    <button onClick={() => marcarItemServido(p.id, idx)} className="h-10 w-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-all"><CheckCircle2 size={20}/></button>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {pedidosMesas.length === 0 && <div className="h-full flex flex-col items-center justify-center opacity-20"><Users size={80} /><p className="font-black uppercase mt-4">Mesas al día</p></div>}
        </div>
      </section>

    </div>
  );
}
