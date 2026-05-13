import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Utensils, Wallet, Settings, LogOut, BarChart3, Target, Gift } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // MENÚ PARA VENDEDOR (Operación)
  const sellerMenu = [
    { name: 'Mesas', path: '/', icon: <LayoutDashboard size={22} /> },
    { name: 'Cocina y Mostrador', path: '/cocina', icon: <Utensils size={22} /> },
    { name: 'Caja y Ventas', path: '/caja', icon: <Wallet size={22} /> },
    { name: 'Inventario', path: '/inventario', icon: <Package size={22} /> },
  ];

  // MENÚ PARA ADMIN (Estrategia)
  const adminMenu = [
    { name: 'Estadísticas', path: '/stats', icon: <BarChart3 size={22} /> },
    { name: 'Ajustes Perfiles', path: '/ajustes', icon: <Settings size={22} /> },
  ];

  const menuToRender = user?.role === 'admin' ? adminMenu : sellerMenu;

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      <aside className="w-72 bg-white border-r flex flex-col p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-2xl">🍦</div>
          <div>
            <h1 className="text-xl font-black text-slate-900 leading-none">Como en Casa</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{user?.role === 'admin' ? 'Panel Dueño' : 'Panel Venta'}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {menuToRender.map((item) => (
            <Link key={item.path} to={item.path} className={`flex items-center gap-4 px-5 py-4 rounded-[20px] font-bold transition-all ${location.pathname === item.path ? 'bg-blue-50 text-blue-600 border border-blue-100 shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}>
              {item.icon} <span className="text-[15px]">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-pink-500 text-white flex items-center justify-center font-black text-xs uppercase">{user?.name?.substring(0,2)}</div>
            <div className="flex-1 overflow-hidden"><p className="text-sm font-black text-slate-800 truncate">{user?.name}</p></div>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }} className="w-full flex items-center gap-3 px-5 py-4 rounded-[20px] font-bold text-red-400 hover:bg-red-50 transition-all"><LogOut size={20} /> <span className="text-sm uppercase tracking-widest">Cerrar Sesión</span></button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto"><Outlet /></main>
    </div>
  );
}
