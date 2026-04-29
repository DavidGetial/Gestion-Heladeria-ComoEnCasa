import { StatsCard } from '../components/StatsCard';
import { mockSalesStats, mockTopProducts, mockHourlySales, mockProducts } from '../data/mockData';
import { DollarSign, ShoppingBag, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export function Reportes() {
  const lowStockProducts = mockProducts.filter(p => p.stock < p.lowStockThreshold);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Reportes y estadísticas</h1>
        <p className="text-slate-600">Visualiza el rendimiento de tu heladería</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Ventas del día"
          value={`$${mockSalesStats.todaySales.toLocaleString('es-CO')}`}
          icon={DollarSign}
          color="blue"
        />
        <StatsCard
          title="Pedidos del día"
          value={mockSalesStats.todayOrders}
          icon={ShoppingBag}
          color="pink"
        />
        <StatsCard
          title="Promedio por mesa"
          value={`$${mockSalesStats.averagePerTable.toLocaleString('es-CO')}`}
          icon={TrendingUp}
          color="mint"
        />
        <StatsCard
          title="Hora pico"
          value={mockSalesStats.peakHour}
          icon={Clock}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Top products chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Productos más vendidos</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockTopProducts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                }}
              />
              <Bar dataKey="sales" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Hourly sales chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Ventas por hora</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockHourlySales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                }}
                formatter={(value: number) => `$${value.toLocaleString('es-CO')}`}
              />
              <Line
                type="monotone"
                dataKey="ventas"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Low stock products */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Productos con stock bajo</h2>
            <p className="text-sm text-slate-600">Productos por debajo del umbral mínimo</p>
          </div>
        </div>

        {lowStockProducts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400">No hay productos con stock bajo</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">
                    Producto
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">
                    Categoría
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">
                    Stock actual
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">
                    Umbral mínimo
                  </th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-slate-700">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {lowStockProducts.map((product) => {
                  const percentage = (product.stock / product.lowStockThreshold) * 100;
                  const isCritical = percentage < 50;

                  return (
                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg flex items-center justify-center text-lg">
                            {product.category === 'helados' && '🍦'}
                            {product.category === 'paletas' && '🍭'}
                            {product.category === 'bebidas' && '🥤'}
                            {product.category === 'postres' && '🍰'}
                          </div>
                          <span className="font-medium text-slate-900">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="capitalize text-slate-600">{product.category}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-bold ${isCritical ? 'text-red-600' : 'text-amber-600'}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-600">{product.lowStockThreshold}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden max-w-[120px]">
                            <div
                              className={`h-full rounded-full ${isCritical ? 'bg-red-500' : 'bg-amber-500'}`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                          <span className={`text-xs font-semibold ${isCritical ? 'text-red-600' : 'text-amber-600'}`}>
                            {Math.round(percentage)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
