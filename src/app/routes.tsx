import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Mesas } from './pages/Mesas';
import { Pedido } from './pages/Pedido';
import { Ventas } from './pages/Ventas';
import { Inventario } from './pages/Inventario';
import { Promociones } from './pages/Promociones';
import { Reportes } from './pages/Reportes';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Mesas },
      { path: 'pedido/:tableId', Component: Pedido },
      { path: 'ventas', Component: Ventas },
      { path: 'inventario', Component: Inventario },
      { path: 'promociones', Component: Promociones },
      { path: 'reportes', Component: Reportes },
    ],
  },
]);
