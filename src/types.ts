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
  image?: string; // used for custom emoji / icon selection
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
  unit?: string; // unit of measurement e.g. "Lata / Litro (L)"
  productType?: 'final' | 'raw' | 'both'; // "final", "raw", or "both"
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

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

const unitAbbreviationMap: Record<string, string> = {
  'unidade': 'un',
  'unidades': 'un',
  'grama': 'g',
  'gramas': 'g',
  'pacote': 'pct',
  'pacotes': 'pct',
  'quilo': 'kg',
  'quilos': 'kg',
  'quilograma': 'kg',
  'quilogramas': 'kg',
  'litro': 'L',
  'litros': 'L',
  'mililitro': 'ml',
  'mililitros': 'ml'
};

export function getProductUnitSuffix(unit?: string): string {
  if (!unit) return 'un';
  const u = unit.trim();
  
  const mapUnit = (str: string): string => {
    const s = str.toLowerCase().trim();
    if (unitAbbreviationMap[s]) {
      return unitAbbreviationMap[s];
    }
    return s;
  };

  // 1. Check for colon-based suffix, e.g., "erva:g" or "erva: g"
  if (u.includes(':')) {
    const parts = u.split(':');
    const suffix = parts[parts.length - 1].trim();
    if (suffix) return mapUnit(suffix);
  }
  
  // 2. Check for comma-based suffix, e.g., "pacote,pct" or "pacote, pct"
  if (u.includes(',')) {
    const parts = u.split(',');
    const suffix = parts[parts.length - 1].trim();
    if (suffix) return mapUnit(suffix);
  }
  
  // 3. Check for parentheses, e.g., "Unidade (un)", "Canudo (unidade)"
  const match = u.match(/\(([^)]+)\)/);
  if (match) {
    return mapUnit(match[1].trim());
  }
  
  // 4. If it contains space, e.g., "canudo unidade" -> see if the last word is mapped or short
  if (u.includes(' ')) {
    const words = u.split(/\s+/);
    const lastWord = words[words.length - 1].toLowerCase();
    const mapped = mapUnit(lastWord);
    if (mapped.length <= 4) {
      return mapped;
    }
  }

  // 5. Default: if the whole unit string is mapped, return mapped, otherwise if short (<= 4 chars), return it as is
  const mappedWhole = mapUnit(u);
  if (mappedWhole.length <= 4) {
    return mappedWhole;
  }

  return 'un';
}

