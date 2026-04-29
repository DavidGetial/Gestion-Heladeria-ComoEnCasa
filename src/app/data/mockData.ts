// Mock data para el sistema POS de heladería Fruti Home

export type TableStatus = 'empty' | 'occupied' | 'ready-to-pay';

export interface Table {
  id: number;
  number: number;
  status: TableStatus;
  guests?: number;
  total?: number;
  openedAt?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  category: string;
  size: 'pequeño' | 'mediano' | 'grande';
  quantity: number;
  unitPrice: number;
  toppings: string[];
  notes?: string;
}

export interface Order {
  id: string;
  tableId: number;
  items: OrderItem[];
  subtotal: number;
  tip: number;
  total: number;
  splitBetween?: number;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: 'helados' | 'paletas' | 'bebidas' | 'postres' | 'toppings';
  price: {
    pequeño?: number;
    mediano?: number;
    grande?: number;
  };
  cost: number;
  stock: number;
  lowStockThreshold: number;
  active: boolean;
  imageUrl?: string;
  popular?: boolean;
}

export interface InventoryItem extends Product {
  rotation: number; // ventas por semana
}

export interface SalesStats {
  todaySales: number;
  todayOrders: number;
  averagePerTable: number;
  peakHour: string;
}

// Datos mock
export const mockTables: Table[] = [
  { id: 1, number: 1, status: 'empty' },
  { id: 2, number: 2, status: 'occupied', guests: 2, total: 24500, openedAt: '14:30' },
  { id: 3, number: 3, status: 'ready-to-pay', guests: 4, total: 48000, openedAt: '14:45' },
  { id: 4, number: 4, status: 'empty' },
  { id: 5, number: 5, status: 'ready-to-pay', guests: 3, total: 36000, openedAt: '13:20' },
  { id: 6, number: 6, status: 'occupied', guests: 2, total: 18000, openedAt: '15:00' },
  { id: 7, number: 7, status: 'empty' },
  { id: 8, number: 8, status: 'empty' },
  { id: 9, number: 9, status: 'occupied', guests: 5, total: 62000, openedAt: '14:15' },
  { id: 10, number: 10, status: 'empty' },
  { id: 11, number: 11, status: 'ready-to-pay', guests: 2, total: 21000, openedAt: '15:10' },
  { id: 12, number: 12, status: 'empty' },
];

export const mockProducts: Product[] = [
  {
    id: 'p1',
    name: 'Helado de Vainilla',
    category: 'helados',
    price: { pequeño: 4000, mediano: 6000, grande: 8000 },
    cost: 2000,
    stock: 45,
    lowStockThreshold: 10,
    active: true,
    popular: true,
  },
  {
    id: 'p2',
    name: 'Helado de Chocolate',
    category: 'helados',
    price: { pequeño: 4000, mediano: 6000, grande: 8000 },
    cost: 2000,
    stock: 38,
    lowStockThreshold: 10,
    active: true,
    popular: true,
  },
  {
    id: 'p3',
    name: 'Helado de Fresa',
    category: 'helados',
    price: { pequeño: 4500, mediano: 6500, grande: 8500 },
    cost: 2200,
    stock: 32,
    lowStockThreshold: 10,
    active: true,
    popular: true,
  },
  {
    id: 'p4',
    name: 'Helado de Arequipe',
    category: 'helados',
    price: { pequeño: 5000, mediano: 7000, grande: 9000 },
    cost: 2500,
    stock: 28,
    lowStockThreshold: 10,
    active: true,
    popular: false,
  },
  {
    id: 'p5',
    name: 'Paleta de Frutas',
    category: 'paletas',
    price: { pequeño: 3000 },
    cost: 1200,
    stock: 8,
    lowStockThreshold: 15,
    active: true,
    popular: false,
  },
  {
    id: 'p6',
    name: 'Paleta de Crema',
    category: 'paletas',
    price: { pequeño: 3500 },
    cost: 1400,
    stock: 24,
    lowStockThreshold: 15,
    active: true,
    popular: false,
  },
  {
    id: 'p7',
    name: 'Malteada',
    category: 'bebidas',
    price: { mediano: 8000, grande: 10000 },
    cost: 3500,
    stock: 18,
    lowStockThreshold: 8,
    active: true,
    popular: true,
  },
  {
    id: 'p8',
    name: 'Smoothie',
    category: 'bebidas',
    price: { mediano: 7000, grande: 9000 },
    cost: 3000,
    stock: 22,
    lowStockThreshold: 8,
    active: true,
    popular: false,
  },
  {
    id: 'p9',
    name: 'Brownie con Helado',
    category: 'postres',
    price: { mediano: 9000 },
    cost: 4000,
    stock: 6,
    lowStockThreshold: 10,
    active: true,
    popular: true,
  },
  {
    id: 'p10',
    name: 'Waffle con Helado',
    category: 'postres',
    price: { mediano: 10000 },
    cost: 4500,
    stock: 15,
    lowStockThreshold: 10,
    active: true,
    popular: false,
  },
];

export const mockToppings = [
  'Chispas de chocolate',
  'Salsa de caramelo',
  'Frutas frescas',
  'Galleta oreo',
  'Coco rallado',
  'Cerezas',
  'Maní',
];

export const mockOrders: Record<number, Order> = {
  2: {
    id: 'ord-2',
    tableId: 2,
    items: [
      {
        id: 'oi-1',
        productId: 'p1',
        productName: 'Helado de Vainilla',
        category: 'helados',
        size: 'mediano',
        quantity: 1,
        unitPrice: 6000,
        toppings: ['Chispas de chocolate'],
      },
      {
        id: 'oi-2',
        productId: 'p7',
        productName: 'Malteada',
        category: 'bebidas',
        size: 'grande',
        quantity: 1,
        unitPrice: 10000,
        toppings: [],
      },
      {
        id: 'oi-3',
        productId: 'p3',
        productName: 'Helado de Fresa',
        category: 'helados',
        size: 'pequeño',
        quantity: 1,
        unitPrice: 4500,
        toppings: [],
      },
    ],
    subtotal: 20500,
    tip: 4000,
    total: 24500,
    createdAt: '14:30',
  },
  3: {
    id: 'ord-3',
    tableId: 3,
    items: [
      {
        id: 'oi-4',
        productId: 'p2',
        productName: 'Helado de Chocolate',
        category: 'helados',
        size: 'grande',
        quantity: 2,
        unitPrice: 8000,
        toppings: ['Salsa de caramelo', 'Maní'],
      },
      {
        id: 'oi-5',
        productId: 'p9',
        productName: 'Brownie con Helado',
        category: 'postres',
        size: 'mediano',
        quantity: 2,
        unitPrice: 9000,
        toppings: [],
      },
      {
        id: 'oi-6',
        productId: 'p7',
        productName: 'Malteada',
        category: 'bebidas',
        size: 'mediano',
        quantity: 2,
        unitPrice: 8000,
        toppings: [],
      },
    ],
    subtotal: 48000,
    tip: 0,
    total: 48000,
    createdAt: '14:45',
  },
};

export const mockSalesStats: SalesStats = {
  todaySales: 1248000,
  todayOrders: 42,
  averagePerTable: 29714,
  peakHour: '15:00 - 16:00',
};

export const mockTopProducts = [
  { name: 'Helado de Vainilla', sales: 24 },
  { name: 'Helado de Chocolate', sales: 22 },
  { name: 'Malteada', sales: 18 },
  { name: 'Helado de Fresa', sales: 16 },
  { name: 'Brownie con Helado', sales: 12 },
  { name: 'Paleta de Crema', sales: 9 },
];

export const mockHourlySales = [
  { hour: '10:00', ventas: 45000 },
  { hour: '11:00', ventas: 68000 },
  { hour: '12:00', ventas: 124000 },
  { hour: '13:00', ventas: 156000 },
  { hour: '14:00', ventas: 198000 },
  { hour: '15:00', ventas: 245000 },
  { hour: '16:00', ventas: 187000 },
  { hour: '17:00', ventas: 142000 },
  { hour: '18:00', ventas: 83000 },
];