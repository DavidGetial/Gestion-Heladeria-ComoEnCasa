import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Card } from '../components/ui/card';
import { UserPlus, Trash2, Edit3, ShieldCheck, Key, Phone, MapPin } from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";

export function Ajustes() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', pin: '', role: 'seller', phone: '', address: '' });

  useEffect(() => { fetchProfiles(); }, []);

  async function fetchProfiles() {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: true });
    if (data) setProfiles(data);
  }

  const handleSave = async () => {
    if (form.pin.length < 4) return toast.error("PIN debe ser de 4 dígitos");
    
    if (editingId) {
      const { error } = await supabase.from('profiles').update(form).eq('id', editingId);
      if (!error) toast.success("Perfil actualizado");
    } else {
      const { error } = await supabase.from('profiles').insert([form]);
      if (!error) toast.success("Perfil creado");
    }
    
    setShowModal(false);
    setEditingId(null);
    setForm({ name: '', pin: '', role: 'seller', phone: '', address: '' });
    fetchProfiles();
  };

  const startEdit = (p: any) => {
    setEditingId(p.id);
    setForm({ name: p.name, pin: p.pin, role: p.role, phone: p.phone || '', address: p.address || '' });
    setShowModal(true);
  };

  const deleteProfile = async (id: string) => {
    if (!confirm('¿Seguro? Se borrará todo su historial de turnos.')) return;
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) toast.error("Error al borrar");
    else { toast.success("Eliminado"); fetchProfiles(); }
  };

  return (
    <div className="p-10 bg-[#F8FAFC] min-h-full">
      <div className="flex justify-between items-end mb-10">
        <div><h1 className="text-4xl font-black uppercase text-slate-900">Equipo Fruti Home</h1></div>
        <Button onClick={() => { setEditingId(null); setShowModal(true); }} className="bg-blue-600 rounded-2xl h-14 px-8 font-black">NUEVO VENDEDOR</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles.map((p) => (
          <Card key={p.id} className="p-8 border-none shadow-sm rounded-[40px] bg-white relative group">
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl ${p.role === 'admin' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}><ShieldCheck size={28}/></div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(p)} className="text-slate-300 hover:text-blue-500 transition-all"><Edit3 size={20}/></button>
                {p.role !== 'admin' && <button onClick={() => deleteProfile(p.id)} className="text-slate-300 hover:text-red-500 transition-all"><Trash2 size={20}/></button>}
              </div>
            </div>
            <h2 className="text-2xl font-black text-slate-900">{p.name}</h2>
            <p className="text-[10px] font-black text-blue-500 uppercase mb-4">{p.role}</p>
            <div className="space-y-2 mb-6 opacity-60">
               <p className="flex items-center gap-2 text-xs font-bold"><Phone size={14}/> {p.phone || 'N/A'}</p>
               <p className="flex items-center gap-2 text-xs font-bold"><MapPin size={14}/> {p.address || 'N/A'}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center">
               <span className="text-[10px] font-black text-slate-400">PIN</span>
               <span className="font-black text-slate-900 tracking-[4px]">{p.pin}</span>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="rounded-[40px] p-10 bg-white border-none shadow-2xl">
          <DialogHeader><DialogTitle className="text-2xl font-black uppercase text-center">{editingId ? 'Editar' : 'Crear'} Acceso</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="col-span-2 space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Nombre</label><input className="w-full p-4 bg-slate-50 rounded-2xl font-bold" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
            <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">PIN</label><input className="w-full p-4 bg-slate-50 rounded-2xl font-black" value={form.pin} onChange={e => setForm({...form, pin: e.target.value})} /></div>
            <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Celular</label><input className="w-full p-4 bg-slate-50 rounded-2xl" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
            <div className="col-span-2 space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Dirección</label><input className="w-full p-4 bg-slate-50 rounded-2xl" value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
            <Button onClick={handleSave} className="col-span-2 h-16 bg-blue-600 text-white rounded-2xl font-black uppercase">Guardar Cambios</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
