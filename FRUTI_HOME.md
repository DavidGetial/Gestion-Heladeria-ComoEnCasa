# 🍦 Fruti Home - Sistema POS

Sistema Point of Sale (POS) de alta fidelidad para la heladería **Fruti Home** en Pasto, Colombia.

## 📋 Descripción del Proyecto

Fruti Home es una heladería moderna con servicio en mesa, para llevar y domicilio. Este sistema POS está diseñado para dos tipos de usuarios principales:

### 👥 Usuarios

1. **Cajero / Personal de Salón**
   - Toma pedidos por mesa
   - Valida productos, modificaciones y observaciones
   - Divide cuentas entre comensales
   - Procesa pagos en efectivo y Nequi

2. **Administrador**
   - Gestiona inventario, costos y rotación de productos
   - Consulta ventas y reportes estadísticos
   - Configura productos, precios y alertas de stock bajo
   - Visualiza métricas de rendimiento del negocio

## 🎨 Diseño Visual

### Paleta de Colores

- **Base**: Azul claro (#3B82F6, #60A5FA), Blanco (#FFFFFF), Grises suaves
- **Acentos Pastel**:
  - Rosa helado (#FFC1CC, #FFB3C1) - para elementos premium/destacados
  - Verde menta (#10B981, #6EE7B7) - para acciones positivas y confirmaciones
  - Amarillo suave (#FCD34D) - para estados de ocupación

### Tipografía

- **Fuente**: Poppins
- **Jerarquía clara**: Títulos bold, subtítulos semibold, texto regular

### Estados de Mesas (Código de Colores)

- 🔵 **Vacía**: Azul claro (`bg-blue-50`)
- 🟡 **Ocupada**: Amarillo suave (`bg-amber-50`)
- 🟢 **Lista para cobrar**: Verde pastel (`bg-emerald-50`)

## 📱 Pantallas Principales

### 1. Gestión de Mesas (Pantalla Principal)

Vista del salón con todas las mesas numeradas.

**Características**:
- Grid de mesas con estados visuales diferenciados
- Tarjetas de estadísticas rápidas (Disponibles, Ocupadas, Listas para cobrar)
- Barra lateral con menú rápido de productos
- Filtros por categoría y búsqueda de productos
- Sección de productos más vendidos

### 2. Vista de Pedido por Mesa

Gestión completa del pedido de una mesa específica.

**Características**:
- Lista detallada de items con:
  - Nombre del producto
  - Tamaño (Pequeño / Mediano / Grande)
  - Toppings seleccionados
  - Observaciones personalizadas
  - Controles de cantidad (+/-)
- Edición de items con modal interactivo
- División de cuenta (1-4 personas)
- Resumen financiero (Subtotal, Propina, Total)
- Métodos de pago:
  - **Efectivo**: Con cálculo automático de cambio
  - **Nequi**: Con QR simulado y confirmación
- Acciones: Enviar a cocina, Imprimir, Cerrar mesa

### 3. Módulo de Inventario

Panel administrativo para gestión de productos.

**Características**:
- Tabla completa de productos con columnas:
  - Nombre y categoría
  - Precio al público
  - Costo
  - Stock actual
  - Umbral de stock bajo
- Filtros por categoría y estado
- Alertas visuales de stock bajo
- Indicadores de productos populares
- Acciones de edición por producto

### 4. Reportes y Estadísticas

Panel de análisis de ventas y rendimiento.

**Características**:
- Tarjetas de métricas rápidas:
  - Ventas del día
  - Número de pedidos
  - Promedio por mesa
  - Hora pico
- Gráfico de barras: Productos más vendidos
- Gráfico de línea: Ventas por hora
- Tabla de productos con stock bajo (con niveles críticos)

### 5. Historial de Ventas

Registro completo de transacciones.

**Características**:
- Tabla de ventas con detalles completos
- Filtros por fecha y búsqueda
- Estadísticas de rendimiento
- Opción de exportación

### 6. Gestión de Promociones

Administración de ofertas y descuentos.

**Características**:
- Tarjetas de promociones activas
- Información de descuentos y validez
- Creación y edición de promociones
- Activación/desactivación de ofertas

## 🧩 Componentes Reutilizables

### `TableCard`
Tarjeta de mesa con estado visual, información de ocupación y total.

### `ProductCard`
Tarjeta de producto para menú rápido con precio, categoría y badge de popular.

### `StatsCard`
Tarjeta de estadística con icono, valor y colores personalizables.

### `EditItemModal`
Modal para editar items del pedido:
- Selector de tamaño
- Checkboxes de toppings
- Campo de observaciones

### `PaymentModal`
Modal de pago con dos flujos:
- **Efectivo**: Entrada de monto y cálculo de cambio
- **Nequi**: QR simulado y confirmación de pago

## 🚀 Tecnologías Utilizadas

- **React 18** - Framework principal
- **React Router 7** - Navegación (Data mode)
- **TypeScript** - Tipado estático
- **Tailwind CSS v4** - Estilos
- **Lucide React** - Iconografía
- **Recharts** - Gráficos y visualizaciones

## 📊 Datos Mock

El sistema incluye datos de ejemplo realistas:
- 12 mesas con diferentes estados
- 10 productos de ejemplo
- 7 toppings disponibles
- Pedidos activos en mesas 2 y 3
- Estadísticas de ventas del día
- Productos con stock bajo

## 🎯 Características Destacadas

1. **Interfaz intuitiva**: Diseñada para uso rápido sin formación extensa
2. **Responsive**: Adaptable a tablets (1440×900)
3. **Accesibilidad**: Botones grandes fácilmente "tappable"
4. **Feedback visual**: Estados claros con código de colores
5. **Flujos completos**: Desde abrir mesa hasta cerrar cuenta
6. **Modales interactivos**: Edición y pago con UX fluida

## 📝 Notas de Implementación

- Todos los precios en **pesos colombianos (COP)**
- Formato de moneda: `toLocaleString('es-CO')`
- Estados de tabla simplificados (3 estados vs 4 anteriores)
- Tipografía Poppins importada desde Google Fonts
- Componentes modulares y reutilizables

## 🔮 Próximas Mejoras Sugeridas

- Integración con backend real
- Sincronización en tiempo real de estados de mesa
- Sistema de notificaciones para cocina
- Historial completo de transacciones por mesa
- Reportes exportables en PDF/Excel
- Sistema de reservas
- Integración con delivery (Rappi, etc.)
- Multi-sucursal

---

**Desarrollado para Fruti Home** 🍦
*Pasto, Colombia*
