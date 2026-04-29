import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import { Mesas } from './pages/Mesas'
import { Pedido } from './pages/Pedido'
import { Inventario } from './pages/Inventario'
import { Cocina } from './pages/Cocina'
import { Caja } from './pages/Caja'
import { Login } from './pages/Login'
import { Ajustes } from './pages/Ajustes'
import { Stats } from './pages/Stats'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Toaster } from 'sonner'

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const { user, loading } = useAuth();
  if (loading) return null; 
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Mesas />} />
          <Route path="cocina" element={<Cocina />} />
          <Route path="caja" element={<Caja />} />
          <Route path="inventario" element={<Inventario />} /> { /* LIBERADO PARA TODOS */ }
          <Route path="pedido/:id" element={<Pedido />} />
          
          {/* RUTAS SOLO ADMIN */}
          <Route path="ajustes" element={<ProtectedRoute adminOnly><Ajustes /></ProtectedRoute>} />
          <Route path="stats" element={<ProtectedRoute adminOnly><Stats /></ProtectedRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
