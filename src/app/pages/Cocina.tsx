import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Card } from '../components/ui/card';
import { CheckCircle2, Clock, Store, Users, Utensils } from 'lucide-react';
import { toast } from 'sonner';

export function Cocina() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
    const channel = supabase
      .channel('cocina-live')
      .on('postgres_changes' as any, { event: '*', schema: 'public', table: 'orders' }, () => loadOrders())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function loadOrders() {
    // CORREGIDO: Traemos tanto órdenes pendientes (mesas) como completadas de hoy (mostrador)
    // que contengan productos que requieran preparación en cocina
    const { data } = await supabase
      .from('orders')
      .select('*')
      .in('status', ['pending', 'completed']) 
      .order('created_at', { ascending: true });
    
    if (data) setOrders(data);
    setLoading(false);
  }

  // --- FUNCIÓN ACTUALIZADA: COMPATIBLE CON MOSTRADOR Y MESAS ---
  const despacharProductoIndividual = async (orderId: string, itemUniqueCartId: string, tableId: number) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Marcamos como servido únicamente el producto seleccionado
    const nuevosItems = order.items.map((item: any) => {
      if (item.uniqueCartId === itemUniqueCartId) {
        return { ...item, servido: true };
      }
      return item;
    });

    const todosServidos = nuevosItems.every((item: any) => item.servido === true);

    try {
      if (tableId > 0) {
        // LÓGICA DE MESAS
        if (todosServidos) {
          await supabase.from('orders').update({ items: nuevosItems }).eq('id', orderId);
          await supabase.from('tables').update({ status: 'Lista para cobrar' }).eq('id', tableId);
          toast.success("¡Pedido de la mesa completado!");
        } else {
          await supabase.from('orders').update({ items: nuevosItems }).eq('id', orderId);
          toast.success("Plato despachado");
        }
      } else {
        // LÓGICA DE MOSTRADOR: Como el estado ya es 'completed', solo actualizamos los ítems del JSON
        // Añadimos una propiedad de control interna para ocultarlo si ya se sirvió todo
        await supabase.from('orders').update({ 
          items: nuevosItems,
          notes: todosServidos ? 'despachado_mostrador' : order.notes 
        }).eq('id', orderId);
        
        toast.success(todosServidos ? "¡Venta de mostrador entregada!" : "Plato despachado");
      }
      
      loadOrders();
    } catch (e) {
      toast.error("Error al despachar el producto");
    }
  };

  // FILTRADO INTELIGENTE PARA LA PANTALLA
  // Mostrador: Muestra órdenes de mostrador (table_id = 0) que NO estén marcadas como despachadas del todo
  const ordersMostrador = orders.filter(o => o.table_id === 0 && o.notes !== 'despachado_mostrador');
  // Mesas: Muestra órdenes de salón (table_id > 0) que sigan pendientes de cobro/despacho
  const ordersMesas = orders.filter(o => o.table_id > 0 && o.status === 'pending');

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-slate-300">CARGANDO PEDIDOS...</div>;

  return (
    <div className="flex flex-col h-full bg-[#F1F5F9] p-6 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        
        {/* COLUMNA MOSTRADOR */}
        <div className="flex flex-col h-full bg-white/40 rounded-[40px] p-6 border border-white/50 backdrop-blur-sm">
          <div className="flex justify-between items-center bg-blue-600 text-white px-8 py-5 rounded-[28px] shadow-lg mb-6">
            <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3"><Store size={24}/> Mostrador (Venta Rápida)</h2>
            <span className="bg-white/20 px-4 py-1 rounded-full font-black text-sm">{ordersMostrador.length} Pedidos</span>
          </div>

          <div className="flex-1 overflow-auto space-y-4 pr-2 custom-scrollbar">
            {ordersMostrador.map(order => {
              const itemsPendientes = order.items?.filter((item: any) => !item.servido) || [];
              if (itemsPendientes.length === 0) return null;

              return (
                <Card key={order.id} className="p-6 rounded-[35px] border-none shadow-md bg-white space-y-4">
                  <div className="flex justify-between items-center border-b pb-3 border-slate-100">
                    <span className="text-xs font-black text-slate-400 uppercase">Ticket #{order.id.slice(0,4)}</span>
                    <span className="text-xs font-bold text-blue-500 flex items-center gap-1"><Clock size={12}/> {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <div className="space-y-2">
                    {itemsPendientes.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-3 rounded-2xl bg-blue-50/50 font-bold text-slate-800 text-sm">
                        <p className="flex-1">{item.quantity}x {item.displayName || item.name}</p>
                        <button onClick={() => despacharProductoIndividual(order.id, item.uniqueCartId, 0)} className="p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors shadow-sm"><CheckCircle2 size={18}/></button>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
            {ordersMostrador.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-300">
                <Utensils size={48} strokeWidth={1}/>
                <p className="font-black text-xs uppercase tracking-widest mt-4">Sin pedidos aquí</p>
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA PEDIDOS DE MESAS */}
        <div className="flex flex-col h-full bg-white/40 rounded-[40px] p-6 border border-white/50 backdrop-blur-sm">
          <div className="flex justify-between items-center bg-pink-500 text-white px-8 py-5 rounded-[28px] shadow-lg mb-6">
            <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3"><Users size={24}/> Pedidos de Mesas</h2>
            <span className="bg-white/20 px-4 py-1 rounded-full font-black text-sm">{ordersMesas.length} Pedidos</span>
          </div>

          <div className="overflow-auto flex-1 space-y-4 pr-2 custom-scrollbar">
            {ordersMesas.map(order => {
              const itemsPendientes = order.items?.filter((item: any) => !item.servido) || [];
              if (itemsPendientes.length === 0) return null;

              return (
                <Card key={order.id} className="p-6 rounded-[40px] border-none shadow-xl bg-white border-l-8 border-pink-500 space-y-4">
                  <div className="flex justify-between items-center border-b pb-3 border-slate-100">
                    <h3 className="text-2xl font-black text-slate-900 uppercase">Mesa {order.table_id}</h3>
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1"><Clock size={14}/> {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <div className="space-y-2">
                    {itemsPendientes.map((item: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-[22px] bg-slate-50 border border-white shadow-sm flex justify-between items-center">
                        <p className="font-black text-slate-800 text-sm uppercase tracking-tight flex-1">{item.quantity}x {item.displayName || item.name}</p>
                        <button onClick={() => despacharProductoIndividual(order.id, item.uniqueCartId, order.table_id)} className="w-10 h-10 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-emerald-100 active:scale-90 transition-all ml-4"><CheckCircle2 size={20}/></button>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
            {ordersMesas.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-300">
                <Utensils size={48} strokeWidth={1}/>
                <p className="font-black text-xs uppercase tracking-widest mt-4">Sin pedidos en mesas</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
