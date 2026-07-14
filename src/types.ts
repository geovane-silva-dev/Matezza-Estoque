/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'Administrador' | 'Operador' | 'Funcionário';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  color: string; // Tailwind color class or hex
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  image?: string;
  price: number;
  cost: number;
  margin: number; // percentage
  supplier: string;
  category: string; // Category Name or ID
  barcode: string;
  weight: number; // in kg
  description: string;
  stock: number;
  minQuantity: number; // threshold for low stock alert
  isRawMaterial: boolean; // to differentiate components vs finished goods
  createdAt: string;
  updatedAt: string;
}

export interface SaleProduct {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  cost: number;
}

export interface Sale {
  id: string;
  clientId: string;
  clientName: string;
  products: SaleProduct[];
  discount: number;
  tax: number;
  total: number;
  paymentMethod: 'PIX' | 'Dinheiro' | 'Cartão' | 'Boleto';
  status: 'Paga' | 'Pendente' | 'Cancelada';
  receiptId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductionRawMaterial {
  productId: string;
  name: string;
  quantityUsed: number;
}

export interface Production {
  id: string;
  productId: string; // Finished product to produce
  productName: string;
  quantity: number;
  rawMaterials: ProductionRawMaterial[];
  totalCost: number;
  estimatedProfit: number;
  margin: number; // percentage
  durationMinutes: number;
  responsible: string;
  status: 'Em andamento' | 'Finalizado' | 'Cancelado';
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  description: string;
  category: 'Funcionários' | 'Energia' | 'Água' | 'Internet' | 'Aluguel' | 'Matéria-Prima' | 'Outros';
  amount: number;
  date: string;
  status: 'Pago' | 'Pendente';
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;
  cpfCnpj: string;
  email: string;
  phone: string;
  balance: number; // for store credit
  status: 'Ativo' | 'Inativo';
  createdAt: string;
  updatedAt: string;
}

export interface Alert {
  id: string;
  type: 'stock' | 'expense' | 'production' | 'expiry';
  message: string;
  severity: 'normal' | 'attention' | 'urgent'; // corresponds to normal, warning, error
  read: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  title: string;
  content: string;
  priority: 'normal' | 'attention' | 'urgent';
  pinned: boolean;
  createdBy: string;
  createdAt: string;
}

export interface Settings {
  darkMode: boolean;
  language: 'pt' | 'en';
  companyName: string;
  companyLogo?: string;
  lastBackupDate?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  createdAt: string;
}
