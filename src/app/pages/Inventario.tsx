import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Card } from '../components/ui/card';
import { Plus, Trash2, Edit3, Package, Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";

export function Inventario() {
  const [products, setProducts] = useState<any[]>([]);
  const [isModal, setIsModal] = useState(false);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', category: 'Helados', price: '', stock: '', type: 'VENTA' });

  useEffect(() => { fetchProducts(); }, []);

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*').order('name', { ascending: true });
    if (data) setProducts(data);
  }

  const handleSave = async () => {
    if (!form.name || !form.price) return toast.error("Completa los datos obligatorios");
    
    const payload = {
      name: form.name,
      category: form.category,
      price: Number(form.price),
      stock: form.stock ? Number(form.stock) : null,
      type: form.type
    };

    if (editingId) {
      await supabase.from('products').update(payload).eq('id', editingId);
      toast.success("Producto actualizado");
    } else {
      await supabase.from('products').insert([payload]);
      toast.success("Producto creado");
    }

    setIsModal(false);
    setEditingId(null);
    setForm({ name: '', category: 'Helados', price: '', stock: '', type: 'VENTA' });
    fetchProducts();
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar este producto?")) return;
    await supabase.from('products').delete().eq('id', id);
    fetchProducts();
    toast.success("Producto eliminado");
  };

  return (
    <div className="p-10 bg-[#F8FAFC] min-h-full">
      <div className="flex justify-between items-end mb-10">
        <div>
          {/* MARCA ACTUALIZADA */}
          <h1 className="text-4xl font-black uppercase text-slate-900 tracking-tighter">Inventario</h1>
          <p className="text-slate-500 font-medium italic">Control total de Como en Casa Heladería</p>
        </div>
        <Button onClick={() => { setIsModal(true); setEditingId(null); }} className="bg-blue-600 text-white rounded-2xl h-14 px-8 font-black uppercase text-[10px] shadow-lg shadow-blue-100">
          <Plus size={16} className="mr-2"/> Nuevo Producto
        </Button>
      </div>

      {/* BUSCADOR */}
      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18}/>
        <input type="text" placeholder="Filtrar por nombre..." className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border-none font-bold text-sm shadow-sm outline-none" onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* TABLA DE PRODUCTOS */}
      <Card className="border-none shadow-sm rounded-[40px] overflow-hidden bg-white">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr className="text-[10px] font-black uppercase text-slate-400">
              <th className="px-10 py-6">Producto</th>
              <th className="px-10 py-6">Tipo</th>
              <th className="px-10 py-6 text-right">Precio/Stock</th>
              <th className="px-10 py-6 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/30 transition-colors">
                <td className="px-10 py-6">
                  <p className="font-black text-slate-800 text-base uppercase leading-tight">{p.name}</p>
                  <p className="text-[10px] text-slate-400 font-black uppercase mt-1 tracking-widest">{p.category}</p>
                </td>
                <td className="px-10 py-6">
                  <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${p.type === 'PREPARACION' ? 'bg-pink-50 text-pink-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {p.type}
                  </span>
                </td>
                <td className="px-10 py-6 text-right">
                  <p className="font-black text-slate-900 text-xl tracking-tighter">${Number(p.price).toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{p.stock !== null ? `${p.stock} Unid.` : 'Ilimitado'}</p>
                </td>
                <td className="px-10 py-6">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => {
                      setEditingId(p.id);
                      setForm({ name: p.name, category: p.category || 'Helados', price: p.price.toString(), stock: p.stock ? p.stock.toString() : '', type: p.type || 'VENTA' });
                      setIsModal(true);
                    }} className="p-2 text-slate-300 hover:text-blue-500 transition-colors"><Edit3 size={16}/></button>
                    <button onClick={() => deleteProduct(p.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* MODAL NUEVO / EDITAR */}
      <Dialog open={isModal} onOpenChange={setIsModal}>
        <DialogContent className="rounded-[40px] p-10 bg-white border-none shadow-2xl max-w-md">
          <DialogHeader><DialogTitle className="text-2xl font-black uppercase text-center text-slate-900">{editingId ? 'Editar' : 'Nuevo'} Producto</DialogTitle></DialogHeader>
          <div className="space-y-5 mt-6">
            <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Nombre</label><input className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Ej: Paleta de Coco" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Precio ($)</label><input type="number" className="w-full p-4 bg-slate-50 rounded-2xl font-black text-lg border-none text-blue-600" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="5000" /></div>
              <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Stock Inicial</label><input type="number" className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} placeholder="Ilimitado" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Categoría</label>
                <select className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none" value={form.category} onChange={e => setForm({...form, category: e.target.value})}><option value="Helados">Helados</option><option value="Paletas">Paletas</option><option value="Bebidas">Bebidas</option></select>
              </div>
              <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">Modo POS</label>
                <select className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-none outline-none" value={form.type} onChange={e => setForm({...form, type: e.target.value})}><option value="VENTA">Venta Rápida</option><option value="PREPARACION">Cocina</option></select>
              </div>
            </div>
            <Button onClick={handleSave} className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black uppercase shadow-xl mt-4">Guardar Producto</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
