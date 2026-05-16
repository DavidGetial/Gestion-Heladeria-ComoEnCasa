import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { sendTelegram } from '../../lib/telegram';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { DollarSign, Calendar, ArrowUpRight, ShoppingBag, TrendingUp, Star } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function Stats() {
  const [stats, setStats] = useState({ totalSales: 0, cash: 0, nequi: 0, ordersCount: 0, dailyAverage: 0, projection: 0 });
  const [chartData, setChartData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    const { data } = await supabase.from('orders').select('*').eq('status', 'completed');
    if (data) {
      const total = data.reduce((acc, o) => acc + Number(o.total), 0);
      const cash = data.filter(o => o.payment_method === 'Efectivo').reduce((acc, o) => acc + Number(o.total), 0);
      const nequi = data.filter(o => o.payment_method === 'Transferencia').reduce((acc, o) => acc + Number(o.total), 0);
      
      const today = new Date();
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      const currentDay = today.getDate();
      const avg = total / currentDay;
      const proj = avg * daysInMonth;

      setStats({ totalSales: total, cash, nequi, ordersCount: data.length, dailyAverage: avg, projection: proj });
      setChartData([
        { name: 'Efectivo', valor: cash, color: '#10b981' },
        { name: 'Nequi', valor: nequi, color: '#3b82f6' }
      ]);

      const counts: any = {};
      data.forEach(order => {
        order.items?.forEach((item: any) => {
          counts[item.name] = (counts[item.name] || 0) + item.quantity;
        });
      });
      const sorted = Object.entries(counts).map(([name, qty]) => ({ name, qty }))
        .sort((a: any, b: any) => (b.qty as number) - (a.qty as number)).slice(0, 5);
      setTopProducts(sorted);
    }
  }

  const handleCierreMes = async () => {
    if (password !== '1080044879') {
      return toast.error("Contraseña incorrecta de Administrador");
    }

    try {
      const rankingTxt = topProducts.map((p, i) => `${i + 1}. ${p.name} (${p.qty} u.)`).join('\n');
      const mensajeCierre = `🚨 *CIERRE DE MES - COMO EN CASA HELADERÍA* 🚨\n\n` +
                           `👤 *Dueño:* David Alejandro Getial\n` +
                           `📅 *Fecha:* ${new Date().toLocaleDateString()}\n` +
                           `----------------------------------------\n` +
                           `💰 *VENTA TOTAL MES:* $${stats.totalSales.toLocaleString()}\n` +
                           `💵 *Total Efectivo:* $${stats.cash.toLocaleString()}\n` +
                           `📱 *Total Nequi:* $${stats.nequi.toLocaleString()}\n` +
                           `📦 *Cantidad Pedidos:* ${stats.ordersCount}\n` +
                           `----------------------------------------\n` +
                           `🏆 *TOP 5 PRODUCTOS MÁS VENDIDOS:*\n${rankingTxt}\n\n` +
                           `🔐 _Base de datos vaciada y reiniciada a $0 para el nuevo mes._`;
      
      await sendTelegram(mensajeCierre);

      await supabase.from('orders').delete().eq('status', 'completed');
      await supabase.from('cash_movements').delete();

      toast.success("¡Cierre de mes exitoso! Datos reiniciados a $0.");
      setIsModalOpen(false);
      setPassword('');
      loadStats();
    } catch (error) {
      toast.error("Error al procesar el cierre");
    }
  };

  return (
    <div className="p-10 bg-[#F8FAFC] min-h-full">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-black uppercase text-slate-900 tracking-tighter">Gerencia Como en Casa</h1>
          <p className="text-slate-500 font-medium italic">Análisis de ventas del mes</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-red-600 hover:bg-red-700 text-white rounded-2xl h-14 px-8 font-black uppercase text-[10px] shadow-lg flex items-center gap-2">
          ⚙️ Ejecutar Cierre de Mes
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <Card className="p-8 bg-blue-600 text-white rounded-[40px] shadow-xl col-span-2 relative overflow-hidden">
           <DollarSign className="absolute -right-4 -top-4 w-32 h-32 opacity-10" />
           <p className="text-xs font-black uppercase tracking-widest opacity-80">Venta Mensual Actual</p>
           <p className="text-5xl font-black mt-2 tracking-tighter">${stats.totalSales.toLocaleString()}</p>
           <div className="mt-6 flex items-center gap-2 text-[10px] font-black bg-white/10 w-fit px-3 py-1 rounded-full uppercase">
             <ShoppingBag size={12}/> {stats.ordersCount} Pedidos facturados
           </div>
        </Card>

        <Card className="p-8 bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-[40px] shadow-xl relative overflow-hidden col-span-2">
           <div className="absolute right-0 top-0 p-6 opacity-10"><Calendar size={80}/></div>
           <p className="text-xs font-black uppercase tracking-widest opacity-80 flex items-center gap-2">
             <ArrowUpRight size={14}/> Proyección Cierre de Mes
           </p>
           <p className="text-5xl font-black mt-2 tracking-tighter">${stats.projection.toLocaleString(undefined, {maximumFractionDigits:0})}</p>
           <p className="text-[9px] mt-6 font-bold uppercase opacity-60">* Promedio diario: ${stats.dailyAverage.toLocaleString(undefined, {maximumFractionDigits:0})}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
         <Card className="p-6 bg-white border-none shadow-sm rounded-[32px] flex items-center gap-4">
           <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center font-black">$</div>
           <div><p className="text-[10px] font-black text-slate-400 uppercase">Efectivo Mes</p><p className="text-xl font-black text-slate-900">${stats.cash.toLocaleString()}</p></div>
         </Card>
         <Card className="p-6 bg-white border-none shadow-sm rounded-[32px] flex items-center gap-4">
           <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center font-black">N</div>
           <div><p className="text-[10px] font-black text-slate-400 uppercase">Nequi Mes</p><p className="text-xl font-black text-slate-900">${stats.nequi.toLocaleString()}</p></div>
         </Card>
         <Card className="p-6 bg-white border-none shadow-sm rounded-[32px] flex items-center gap-4">
           <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center font-serif font-black">P</div>
           <div><p className="text-[10px] font-black text-slate-400 uppercase">Ticket Promedio</p><p className="text-xl font-black text-slate-900">${(stats.totalSales / (stats.ordersCount || 1)).toLocaleString(undefined, {maximumFractionDigits:0})}</p></div>
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-10 bg-white rounded-[50px] border-none shadow-sm">
          <h2 className="text-xl font-black uppercase mb-8 flex items-center gap-2 text-slate-800"><TrendingUp size={20} className="text-blue-500"/> Balance de Ingresos</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold', fill: '#94a3b8'}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontWeight: 'bold'}} />
                <Bar dataKey="valor" radius={[10, 10, 0, 0]} barSize={60}>
                  {chartData.map((e, i) => (<Cell key={i} fill={e.color} />))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-10 bg-white rounded-[50px] border-none shadow-sm">
          <h2 className="text-xl font-black uppercase mb-8 flex items-center gap-2 text-slate-800"><Star size={20} className="text-amber-500 fill-amber-500"/> Más Vendidos del Mes</h2>
          <div className="space-y-6">
            {topProducts.map((p: any, i: number) => {
              const maxQty = topProducts[0]?.qty || 1;
              const percentage = (p.qty / maxQty) * 100;
              return (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <p className="text-sm font-black text-slate-700 uppercase tracking-tight">{i + 1}. {p.name}</p>
                    <p className="text-sm font-black text-slate-900">{p.qty} u.</p>
                  </div>
                  <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="rounded-[40px] p-10 bg-white border-none shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-black uppercase tracking-tighter text-red-600">Cierre de Mes Autorizado</DialogTitle>
            <DialogDescription className="text-center font-bold text-slate-400 text-xs uppercase mt-2">Se enviará el reporte y las ventas volverán a $0</DialogDescription>
          </DialogHeader>
          <div className="mt-6 space-y-6 text-center">
            <input 
              type="password" 
              className="w-full p-6 bg-slate-50 rounded-[25px] text-3xl font-black text-center text-slate-800 outline-none shadow-inner border border-slate-100" 
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[2px]">Ingresa contraseña de dueño</p>
            <Button onClick={handleCierreMes} className="w-full h-16 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-base uppercase shadow-xl">AUTORIZAR Y REINICIAR</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
