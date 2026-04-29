import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Card } from '../components/ui/card';
import { Search, Plus, Edit3, Trash2, IceCream, UtensilsCrossed, Package } from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogDescription 
} from "../components/ui/dialog";

const SABORES_BASE = ['Vainilla', 'Chocolate', 'Fresa', 'Veteado', 'Ron con Pasas', 'Chicle', 'Oreo', 'Brownie'];

export function Inventario() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [isModal, setIsModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({ 
    name: '', category: 'helados', price: 0, cost: 0, stock: 0, 
    tipo_producto: 'venta', sabores_disponibles: [], active: true 
  });

  useEffect(() => { fetchP(); }, []);

  async function fetchP() {
    const { data } = await supabase.from('products').select('*').order('name', { ascending: true });
    if (data) setProducts(data);
    setLoading(false);
  }

  const handleSave = async () => {
    if (!form.name) return toast.error("El nombre es obligatorio");
    try {
      if (editing) await supabase.from('products').update(form).eq('id', editing.id);
      else await supabase.from('products').insert([form]);
      setIsModal(false);
      fetchP();
      toast.success("Inventario actualizado");
    } catch (e) { toast.error("Error al guardar"); }
  };

  const toggleSabor = (s: string) => {
    const sabs = form.sabores_disponibles || [];
    setForm({ ...form, sabores_disponibles: sabs.includes(s) ? sabs.filter((x:string) => x !== s) : [...sabs, s] });
  };

  if (loading) return <div className="p-20 text-center font-black text-slate-300 animate-pulse">CARGANDO INVENTARIO...</div>;

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-full">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900">Inventario</h1>
          <p className="text-slate-500 font-medium italic">Control total de Fruti Home</p>
        </div>
        <Button onClick={() => { setEditing(null); setForm({ name:'', category:'helados', price:0, cost:0, stock:0, tipo_producto:'venta', sabores_disponibles:[], active:true }); setIsModal(true); }} className="bg-blue-600 text-white rounded-2xl h-14 px-8 font-black shadow-lg uppercase hover:bg-blue-700 transition-all">
          <Plus className="mr-2"/> Nuevo Producto
        </Button>
      </div>

      <Card className="border-none shadow-sm rounded-[40px] overflow-hidden bg-white">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase">Producto</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase text-center">Tipo</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase text-right">Precio/Stock</th>
              <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {products.filter(p => p.name.toLowerCase().includes(busqueda.toLowerCase())).map(p => (
              <tr key={p.id} className="hover:bg-blue-50/20 transition-all">
                <td className="px-10 py-6">
                  <p className="font-bold text-slate-800 text-lg leading-tight">{p.name}</p>
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{p.category}</span>
                </td>
                <td className="px-10 py-6 text-center">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${p.tipo_producto === 'venta' ? 'bg-emerald-50 text-emerald-600' : p.tipo_producto === 'preparacion' ? 'bg-pink-50 text-pink-600' : 'bg-blue-50 text-blue-600'}`}>
                    {p.tipo_producto}
                  </span>
                </td>
                <td className="px-10 py-6 text-right font-black text-slate-900">
                  <p>${Number(p.price).toLocaleString()}</p>
                  <p className="text-[10px] text-slate-300 uppercase">{p.tipo_producto === 'preparacion' ? 'Ilimitado' : `${p.stock} unid.`}</p>
                </td>
                <td className="px-10 py-6">
                  <div className="flex justify-center gap-3">
                    <button onClick={() => { setEditing(p); setForm(p); setIsModal(true); }} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Edit3 size={18}/></button>
                    <button onClick={() => { if(confirm('¿Eliminar?')) supabase.from('products').delete().eq('id', p.id).then(() => fetchP()) }} className="p-3 bg-red-50 text-red-400 rounded-xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={18}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Dialog open={isModal} onOpenChange={setIsModal}>
        <DialogContent className="sm:max-w-[600px] rounded-[40px] p-10 bg-white shadow-2xl border-none overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black uppercase tracking-tighter">Configurar Item</DialogTitle>
            <DialogDescription className="font-bold text-slate-400">Selecciona el tipo y completa los datos.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-3 gap-3 mb-8">
            {['venta', 'preparacion', 'insumo'].map((t:any) => (
              <button key={t} onClick={() => setForm({...form, tipo_producto: t})} className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${form.tipo_producto === t ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-50 text-slate-300 opacity-60'}`}>
                {t === 'venta' ? <IceCream/> : t === 'preparacion' ? <UtensilsCrossed/> : <Package/>}
                <span className="text-[9px] font-black uppercase tracking-widest">{t}</span>
              </button>
            ))}
          </div>

          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Nombre del Producto</label>
              <input className="w-full p-5 bg-slate-50 rounded-2xl font-bold border-none outline-none focus:ring-2 focus:ring-blue-100" placeholder="Ej: Paleta de Agua o Ensalada..." value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>

            {form.tipo_producto === 'preparacion' && (
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Sabores Disponibles:</p>
                <div className="grid grid-cols-3 gap-2">
                  {SABORES_BASE.map(s => (
                    <button key={s} onClick={() => toggleSabor(s)} className={`p-2 rounded-xl text-[10px] font-bold border transition-all ${form.sabores_disponibles?.includes(s) ? 'bg-pink-500 text-white border-pink-600 shadow-md' : 'bg-white text-slate-400 border-slate-100'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {form.tipo_producto !== 'insumo' && (
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Precio al Público</label>
                  <input type="number" className="w-full p-5 bg-slate-50 rounded-2xl font-black text-2xl outline-none" value={form.price} onChange={e => setForm({...form, price: Number(e.target.value)})} />
                </div>
              )}
              {form.tipo_producto !== 'preparacion' && (
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Stock Disponible</label>
                  <input type="number" className="w-full p-5 bg-slate-50 rounded-2xl font-black text-2xl outline-none" value={form.stock} onChange={e => setForm({...form, stock: Number(e.target.value)})} />
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="mt-8">
            <Button onClick={handleSave} className="w-full h-20 bg-blue-600 text-white rounded-[24px] font-black text-lg shadow-xl shadow-blue-100 uppercase tracking-widest hover:bg-blue-700">
              {editing ? 'Guardar Cambios' : 'Registrar Producto'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
