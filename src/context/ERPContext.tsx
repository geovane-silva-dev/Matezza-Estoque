/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Product,
  Category,
  Sale,
  Production,
  Expense,
  Client,
  Alert,
  Message,
  Settings,
  AuditLog,
  UserRole
} from '../types';

interface ERPContextType {
  currentUser: User | null;
  users: User[];
  categories: Category[];
  products: Product[];
  sales: Sale[];
  productions: Production[];
  expenses: Expense[];
  clients: Client[];
  alerts: Alert[];
  messages: Message[];
  settings: Settings;
  auditLogs: AuditLog[];
  
  // Auth actions
  login: (email: string, role: UserRole) => boolean;
  logout: () => void;
  registerUser: (name: string, email: string, role: UserRole) => void;
  updateUserRole: (userId: string, role: UserRole) => void;

  // Category CRUD
  addCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Product CRUD
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (id: string, amount: number, isAddition: boolean) => void;

  // Sale CRUD
  addSale: (sale: Omit<Sale, 'id' | 'receiptId' | 'createdAt' | 'updatedAt'>) => void;
  updateSaleStatus: (id: string, status: Sale['status']) => void;
  deleteSale: (id: string) => void;

  // Production CRUD
  addProduction: (production: Omit<Production, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProductionStatus: (id: string, status: Production['status']) => void;
  updateProduction: (id: string, production: Production) => void;
  deleteProduction: (id: string) => void;

  // Expense CRUD
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  // Client CRUD
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  // Alert CRUD
  addAlert: (alert: Omit<Alert, 'id' | 'createdAt'>) => void;
  markAlertAsRead: (id: string) => void;
  clearAllAlerts: () => void;

  // Message CRUD
  addMessage: (message: Omit<Message, 'id' | 'createdAt'>) => void;
  updateMessage: (id: string, message: Partial<Message>) => void;
  deleteMessage: (id: string) => void;

  // Settings & System
  updateSettings: (settings: Partial<Settings>) => void;
  exportDatabase: () => string;
  importDatabase: (jsonStr: string) => boolean;
  clearDatabase: () => void;
}

const ERPContext = createContext<ERPContextType | undefined>(undefined);

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 11).toUpperCase();

// Mock Initial Data
const initialUsers: User[] = [
  { id: 'U-ADMIN', name: 'Administrador Matezza', email: 'admin@matezza.com', role: 'Administrador', createdAt: new Date().toISOString() },
  { id: 'U-OPER', name: 'Operador Fabril', email: 'operador@matezza.com', role: 'Operador', createdAt: new Date().toISOString() },
  { id: 'U-FUNC', name: 'Geovane Silva', email: 'geovane.silvaa2010@gmail.com', role: 'Funcionário', createdAt: new Date().toISOString() }
];

const initialCategories: Category[] = [
  { id: 'CAT1', name: 'Matérias-Primas', icon: 'Layers', color: 'emerald', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'CAT2', name: 'Kits & Cuias', icon: 'Coffee', color: 'amber', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'CAT3', name: 'Garrafas Térmicas', icon: 'Flame', color: 'sky', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'CAT4', name: 'Acessórios Premium', icon: 'Sparkles', color: 'purple', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'CAT5', name: 'Embalagens', icon: 'Box', color: 'rose', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
];

const initialProducts: Product[] = [
  // Finished Goods
  {
    id: 'P-CUIA-PREM',
    name: 'Cuia Térmica Inox Matezza Premium',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=400',
    price: 159.90,
    cost: 45.00,
    margin: 255.3,
    supplier: 'Metalúrgica Sul Ltda',
    category: 'Kits & Cuias',
    barcode: '7891020304011',
    weight: 0.35,
    description: 'Cuia de parede dupla a vácuo em aço inoxidável 304, mantendo o chimarrão quente por até 45 minutos e frio por até 3 horas.',
    stock: 42,
    minQuantity: 15,
    isRawMaterial: false,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'P-TERM-1L',
    name: 'Garrafa Térmica 1L Classic Inox',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=400',
    price: 249.90,
    cost: 85.00,
    margin: 194.0,
    supplier: 'Importações Brasil-China',
    category: 'Garrafas Térmicas',
    barcode: '7891020304028',
    weight: 0.85,
    description: 'Garrafa térmica de alto desempenho, rolha de precisão de 360°, parede dupla com isolamento a vácuo.',
    stock: 28,
    minQuantity: 10,
    isRawMaterial: false,
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'P-BOMBA-INOX',
    name: 'Bomba de Chimarrão Inox Desmontável',
    image: 'https://images.unsplash.com/photo-1513530534585-c7b1394c6d51?auto=format&fit=crop&q=80&w=400',
    price: 89.90,
    cost: 22.00,
    margin: 308.6,
    supplier: 'Artigos Gaúchos Eireli',
    category: 'Acessórios Premium',
    barcode: '7891020304035',
    weight: 0.08,
    description: 'Bomba em aço inox cirúrgico com bojo removível para limpeza facilitada. Acompanha escova de higienização.',
    stock: 65,
    minQuantity: 20,
    isRawMaterial: false,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Raw materials
  {
    id: 'P-RAW-STEEL',
    name: 'Chapa de Aço Inox 304 (m²)',
    image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=400',
    price: 0,
    cost: 75.00,
    margin: 0,
    supplier: 'Gerdau S.A.',
    category: 'Matérias-Primas',
    barcode: 'RAW-ST-001',
    weight: 7.80,
    description: 'Chapa de aço inoxidável AISI 304, espessura 1.2mm, utilizada para moldagem do corpo das cuias e garrafas.',
    stock: 120, // 120 m²
    minQuantity: 30,
    isRawMaterial: true,
    createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'P-RAW-PAINT',
    name: 'Pintura Eletrostática Epóxi (kg)',
    image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&q=80&w=400',
    price: 0,
    cost: 32.00,
    margin: 0,
    supplier: 'WEG Tintas',
    category: 'Matérias-Primas',
    barcode: 'RAW-PT-002',
    weight: 1.00,
    description: 'Pó epóxi poliéster preto fosco texturizado para acabamento externo super resistente.',
    stock: 45, // 45 kg
    minQuantity: 10,
    isRawMaterial: true,
    createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'P-RAW-BOX',
    name: 'Caixa de Papelão Premium Matezza',
    image: 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&q=80&w=400',
    price: 0,
    cost: 4.50,
    margin: 0,
    supplier: 'Klabin Embalagens',
    category: 'Embalagens',
    barcode: 'RAW-BX-003',
    weight: 0.15,
    description: 'Caixa de papelão microondulado com acabamento em hot-stamping dourado para embalagem individual.',
    stock: 8, // Low stock on purpose to trigger alerts!
    minQuantity: 25,
    isRawMaterial: true,
    createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const initialClients: Client[] = [
  { id: 'C-MATE-SUL', name: 'Distribuidora Rio Grande S/A', cpfCnpj: '12.345.678/0001-99', email: 'comercial@riograndedist.com', phone: '(51) 3344-5566', balance: 0, status: 'Ativo', createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
  { id: 'C-MATE-SPA', name: 'Paraná Mate Emporium', cpfCnpj: '98.765.432/0002-11', email: 'contato@paranamate.com.br', phone: '(41) 99888-1122', balance: 450.00, status: 'Ativo', createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
  { id: 'C-GEO-SILVA', name: 'Geovane Silva', cpfCnpj: '025.145.986-22', email: 'geovane.silvaa2010@gmail.com', phone: '(51) 98112-2334', balance: 120.00, status: 'Ativo', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() }
];

const initialSales: Sale[] = [
  {
    id: 'S-001',
    clientId: 'C-MATE-SUL',
    clientName: 'Distribuidora Rio Grande S/A',
    products: [
      { productId: 'P-CUIA-PREM', name: 'Cuia Térmica Inox Matezza Premium', quantity: 15, price: 159.90, cost: 45.00 },
      { productId: 'P-TERM-1L', name: 'Garrafa Térmica 1L Classic Inox', quantity: 8, price: 249.90, cost: 85.00 }
    ],
    discount: 150.00,
    tax: 85.40,
    total: 4333.10, // (15*159.9 + 8*249.9) - 150 + 85.4
    paymentMethod: 'PIX',
    status: 'Paga',
    receiptId: 'REC-2026-001',
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'S-002',
    clientId: 'C-GEO-SILVA',
    clientName: 'Geovane Silva',
    products: [
      { productId: 'P-CUIA-PREM', name: 'Cuia Térmica Inox Matezza Premium', quantity: 1, price: 159.90, cost: 45.00 },
      { productId: 'P-BOMBA-INOX', name: 'Bomba de Chimarrão Inox Desmontável', quantity: 1, price: 89.90, cost: 22.00 }
    ],
    discount: 0,
    tax: 12.50,
    total: 262.30,
    paymentMethod: 'Cartão',
    status: 'Paga',
    receiptId: 'REC-2026-002',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'S-003',
    clientId: 'C-MATE-SPA',
    clientName: 'Paraná Mate Emporium',
    products: [
      { productId: 'P-TERM-1L', name: 'Garrafa Térmica 1L Classic Inox', quantity: 5, price: 249.90, cost: 85.00 }
    ],
    discount: 50.00,
    tax: 25.00,
    total: 1224.50,
    paymentMethod: 'Boleto',
    status: 'Pendente',
    receiptId: 'REC-2026-003',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const initialProductions: Production[] = [
  {
    id: 'PRD-001',
    productId: 'P-CUIA-PREM',
    productName: 'Cuia Térmica Inox Matezza Premium',
    quantity: 50,
    rawMaterials: [
      { productId: 'P-RAW-STEEL', name: 'Chapa de Aço Inox 304 (m²)', quantityUsed: 12 },
      { productId: 'P-RAW-PAINT', name: 'Pintura Eletrostática Epóxi (kg)', quantityUsed: 5 },
      { productId: 'P-RAW-BOX', name: 'Caixa de Papelão Premium Matezza', quantityUsed: 50 }
    ],
    totalCost: 1285.00, // 12*75 + 5*32 + 50*4.5
    estimatedProfit: 6710.00, // 50*159.90 - 1285.00
    margin: 522.1,
    durationMinutes: 180,
    responsible: 'Operador Fabril',
    status: 'Finalizado',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'PRD-002',
    productId: 'P-TERM-1L',
    productName: 'Garrafa Térmica 1L Classic Inox',
    quantity: 20,
    rawMaterials: [
      { productId: 'P-RAW-STEEL', name: 'Chapa de Aço Inox 304 (m²)', quantityUsed: 8 },
      { productId: 'P-RAW-PAINT', name: 'Pintura Eletrostática Epóxi (kg)', quantityUsed: 3 },
      { productId: 'P-RAW-BOX', name: 'Caixa de Papelão Premium Matezza', quantityUsed: 20 }
    ],
    totalCost: 786.00, // 8*75 + 3*32 + 20*4.5
    estimatedProfit: 4212.00, // 20*249.90 - 786.00
    margin: 535.8,
    durationMinutes: 240,
    responsible: 'Geovane Silva',
    status: 'Em andamento',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const initialExpenses: Expense[] = [
  { id: 'EXP-001', description: 'Folha de Pagamento - Junho', category: 'Funcionários', amount: 8500.00, date: '2026-06-30', status: 'Pago', createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
  { id: 'EXP-002', description: 'Fatura de Energia Elétrica Fabril', category: 'Energia', amount: 1450.20, date: '2026-07-05', status: 'Pago', createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
  { id: 'EXP-003', description: 'Aluguel do Galpão Industrial', category: 'Aluguel', amount: 3500.00, date: '2026-07-10', status: 'Pago', createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
  { id: 'EXP-004', description: 'Serviço de Link Dedicado Internet', category: 'Internet', amount: 380.00, date: '2026-07-12', status: 'Pago', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
  { id: 'EXP-005', description: 'Abastecimento d\'Água Sabesp', category: 'Água', amount: 240.00, date: '2026-07-14', status: 'Pendente', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
];

const initialMessages: Message[] = [
  { id: 'MSG-001', title: 'Meta de Produção Batida! 🎉', content: 'Parabéns à equipe gaúcha! Alcançamos o marco de 500 cuias térmicas fabricadas este mês. Um bônus especial será distribuído na folha de pagamento.', priority: 'normal', pinned: true, createdBy: 'Administrador Matezza', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'MSG-002', title: 'Manutenção Preventiva das Prensas', content: 'Atenção Operadores: Na sexta-feira às 14:00, a prensa hidráulica nº 3 passará por calibração. Favor planejar as ordens de serviço correspondentes.', priority: 'attention', pinned: false, createdBy: 'Administrador Matezza', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'MSG-003', title: 'Alerta de Baixo Estoque: Caixas Premium', content: 'Nosso estoque de "Caixas de Papelão Premium" atingiu nível crítico (8 unidades). O setor de compras já foi alertado, porém novas produções de kits de cuias devem aguardar a chegada do lote.', priority: 'urgent', pinned: true, createdBy: 'Administrador Matezza', createdAt: new Date().toISOString() }
];

const initialAlerts: Alert[] = [
  { id: 'AL-1', type: 'stock', message: 'Produto "Caixa de Papelão Premium Matezza" está abaixo do limite mínimo (Estoque: 8 / Mín: 25).', severity: 'urgent', read: false, createdAt: new Date().toISOString() },
  { id: 'AL-2', type: 'production', message: 'Produção PRD-002 (Garrafa Térmica 1L) está pendente para finalização do lote.', severity: 'normal', read: false, createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() },
  { id: 'AL-3', type: 'expense', message: 'Despesa de Aluguel do Galpão no valor de R$ 3.500,00 foi processada.', severity: 'normal', read: true, createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() }
];

export const ERPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [productions, setProductions] = useState<Production[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [settings, setSettings] = useState<Settings>({
    darkMode: true,
    language: 'pt',
    companyName: 'MATEZZA INDUSTRIAL LTDA',
    companyLogo: ''
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem('matezza_users');
      const storedCategories = localStorage.getItem('matezza_categories');
      const storedProducts = localStorage.getItem('matezza_products');
      const storedSales = localStorage.getItem('matezza_sales');
      const storedProductions = localStorage.getItem('matezza_productions');
      const storedExpenses = localStorage.getItem('matezza_expenses');
      const storedClients = localStorage.getItem('matezza_clients');
      const storedAlerts = localStorage.getItem('matezza_alerts');
      const storedMessages = localStorage.getItem('matezza_messages');
      const storedSettings = localStorage.getItem('matezza_settings');
      const storedLogs = localStorage.getItem('matezza_audit_logs');
      const activeSession = localStorage.getItem('matezza_session');

      if (storedUsers) setUsers(JSON.parse(storedUsers));
      else {
        setUsers(initialUsers);
        localStorage.setItem('matezza_users', JSON.stringify(initialUsers));
      }

      if (storedCategories) setCategories(JSON.parse(storedCategories));
      else {
        setCategories(initialCategories);
        localStorage.setItem('matezza_categories', JSON.stringify(initialCategories));
      }

      if (storedProducts) setProducts(JSON.parse(storedProducts));
      else {
        setProducts(initialProducts);
        localStorage.setItem('matezza_products', JSON.stringify(initialProducts));
      }

      if (storedSales) setSales(JSON.parse(storedSales));
      else {
        setSales(initialSales);
        localStorage.setItem('matezza_sales', JSON.stringify(initialSales));
      }

      if (storedProductions) setProductions(JSON.parse(storedProductions));
      else {
        setProductions(initialProductions);
        localStorage.setItem('matezza_productions', JSON.stringify(initialProductions));
      }

      if (storedExpenses) setExpenses(JSON.parse(storedExpenses));
      else {
        setExpenses(initialExpenses);
        localStorage.setItem('matezza_expenses', JSON.stringify(initialExpenses));
      }

      if (storedClients) setClients(JSON.parse(storedClients));
      else {
        setClients(initialClients);
        localStorage.setItem('matezza_clients', JSON.stringify(initialClients));
      }

      if (storedAlerts) setAlerts(JSON.parse(storedAlerts));
      else {
        setAlerts(initialAlerts);
        localStorage.setItem('matezza_alerts', JSON.stringify(initialAlerts));
      }

      if (storedMessages) setMessages(JSON.parse(storedMessages));
      else {
        setMessages(initialMessages);
        localStorage.setItem('matezza_messages', JSON.stringify(initialMessages));
      }

      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        if (parsed && parsed.companyLogo && parsed.companyLogo.includes('photo-1599305445671-ac291c95aaa9')) {
          parsed.companyLogo = '';
          localStorage.setItem('matezza_settings', JSON.stringify(parsed));
        }
        setSettings(parsed);
      }
      
      if (storedLogs) setAuditLogs(JSON.parse(storedLogs));

      if (activeSession) {
        setCurrentUser(JSON.parse(activeSession));
      } else {
        // Auto login with Admin for instant testing experience
        setCurrentUser(initialUsers[0]);
        localStorage.setItem('matezza_session', JSON.stringify(initialUsers[0]));
      }
    } catch (e) {
      console.error('Error reading localStorage for MATEZZA', e);
    }
  }, []);

  // Sync to local storage on changes
  const saveToStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const addAuditLog = (action: string, details: string) => {
    const newLog: AuditLog = {
      id: generateId(),
      userId: currentUser?.id || 'SYSTEM',
      userName: currentUser?.name || 'Sistema',
      action,
      details,
      createdAt: new Date().toISOString()
    };
    const updated = [newLog, ...auditLogs];
    setAuditLogs(updated);
    saveToStorage('matezza_audit_logs', updated);
  };

  // Auth Operations
  const login = (email: string, role: UserRole): boolean => {
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (foundUser) {
      const loggedUser = { ...foundUser, role }; // override role as chosen or use existing
      setCurrentUser(loggedUser);
      saveToStorage('matezza_session', loggedUser);
      addAuditLog('Login', `Usuário ${loggedUser.name} efetuou login como ${role}`);
      return true;
    }
    // Auto-create user if not found for seamless preview experience
    const name = email.split('@')[0];
    const newUser: User = {
      id: 'U-' + generateId(),
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email: email,
      role: role,
      createdAt: new Date().toISOString()
    };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    saveToStorage('matezza_users', updatedUsers);
    setCurrentUser(newUser);
    saveToStorage('matezza_session', newUser);
    addAuditLog('Cadastro & Login', `Novo usuário cadastrado e logado: ${newUser.name} (${role})`);
    return true;
  };

  const logout = () => {
    addAuditLog('Logout', `Usuário ${currentUser?.name} deslogou`);
    setCurrentUser(null);
    localStorage.removeItem('matezza_session');
  };

  const registerUser = (name: string, email: string, role: UserRole) => {
    const newUser: User = {
      id: 'U-' + generateId(),
      name,
      email,
      role,
      createdAt: new Date().toISOString()
    };
    const updated = [...users, newUser];
    setUsers(updated);
    saveToStorage('matezza_users', updated);
    addAuditLog('Cadastro de Usuário', `Administrador criou o usuário ${name} (${role})`);
  };

  const updateUserRole = (userId: string, role: UserRole) => {
    const updated = users.map(u => u.id === userId ? { ...u, role } : u);
    setUsers(updated);
    saveToStorage('matezza_users', updated);
    addAuditLog('Alteração de Permissão', `Usuário ${userId} alterado para ${role}`);
  };

  // Category Operations
  const addCategory = (cat: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCat: Category = {
      ...cat,
      id: 'CAT-' + generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [...categories, newCat];
    setCategories(updated);
    saveToStorage('matezza_categories', updated);
    addAuditLog('Criação de Categoria', `Categoria ${newCat.name} criada`);
  };

  const updateCategory = (id: string, partial: Partial<Category>) => {
    const updated = categories.map(c => c.id === id ? { ...c, ...partial, updatedAt: new Date().toISOString() } : c);
    setCategories(updated);
    saveToStorage('matezza_categories', updated);
    addAuditLog('Atualização de Categoria', `Categoria ${id} atualizada`);
  };

  const deleteCategory = (id: string) => {
    const updated = categories.filter(c => c.id !== id);
    setCategories(updated);
    saveToStorage('matezza_categories', updated);
    addAuditLog('Exclusão de Categoria', `Categoria ${id} deletada`);
  };

  // Product Operations
  const addProduct = (prod: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProd: Product = {
      ...prod,
      id: 'P-' + generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [...products, newProd];
    setProducts(updated);
    saveToStorage('matezza_products', updated);
    addAuditLog('Criação de Produto', `Produto ${newProd.name} adicionado ao estoque`);
    
    // Check stock trigger
    checkLowStock(newProd);
  };

  const updateProduct = (id: string, partial: Partial<Product>) => {
    const updated = products.map(p => {
      if (p.id === id) {
        const next = { ...p, ...partial, updatedAt: new Date().toISOString() };
        checkLowStock(next);
        return next;
      }
      return p;
    });
    setProducts(updated);
    saveToStorage('matezza_products', updated);
    addAuditLog('Atualização de Produto', `Produto ${id} atualizado`);
  };

  const deleteProduct = (id: string) => {
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    saveToStorage('matezza_products', updated);
    addAuditLog('Exclusão de Produto', `Produto ${id} deletado`);
  };

  const adjustStock = (id: string, amount: number, isAddition: boolean) => {
    const updated = products.map(p => {
      if (p.id === id) {
        const currentStock = p.stock;
        const newStock = isAddition ? currentStock + amount : Math.max(0, currentStock - amount);
        const next = { ...p, stock: newStock, updatedAt: new Date().toISOString() };
        checkLowStock(next);
        return next;
      }
      return p;
    });
    setProducts(updated);
    saveToStorage('matezza_products', updated);
    addAuditLog('Ajuste de Estoque', `Estoque do produto ${id} alterado por ${isAddition ? '+' : '-'}${amount}`);
  };

  // Low stock checker helper
  const checkLowStock = (p: Product) => {
    if (p.stock <= p.minQuantity) {
      const message = `Produto "${p.name}" está com estoque crítico (${p.stock} unidades de limite mínimo ${p.minQuantity}).`;
      // Check if alert already exists
      const exists = alerts.some(a => a.type === 'stock' && a.message.includes(p.name) && !a.read);
      if (!exists) {
        const newAlert: Alert = {
          id: 'AL-' + generateId(),
          type: 'stock',
          message,
          severity: 'urgent',
          read: false,
          createdAt: new Date().toISOString()
        };
        const updatedAlerts = [newAlert, ...alerts];
        setAlerts(updatedAlerts);
        saveToStorage('matezza_alerts', updatedAlerts);
      }
    }
  };

  // Sale Operations
  const addSale = (saleData: Omit<Sale, 'id' | 'receiptId' | 'createdAt' | 'updatedAt'>) => {
    const saleId = 'S-' + generateId();
    const receiptId = 'REC-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
    const newSale: Sale = {
      ...saleData,
      id: saleId,
      receiptId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Deduct stock for products sold
    const updatedProducts = products.map(p => {
      const soldItem = saleData.products.find(item => item.productId === p.id);
      if (soldItem) {
        const newStock = Math.max(0, p.stock - soldItem.quantity);
        const nextProd = { ...p, stock: newStock, updatedAt: new Date().toISOString() };
        // Check low stock trigger
        setTimeout(() => checkLowStock(nextProd), 100);
        return nextProd;
      }
      return p;
    });

    setProducts(updatedProducts);
    saveToStorage('matezza_products', updatedProducts);

    const updatedSales = [newSale, ...sales];
    setSales(updatedSales);
    saveToStorage('matezza_sales', updatedSales);

    // Update Client balance if the sale is unpaid or registered for store tracking
    if (saleData.clientId) {
      const updatedClients = clients.map(c => {
        if (c.id === saleData.clientId) {
          return {
            ...c,
            balance: c.balance + (newSale.status === 'Pendente' ? newSale.total : 0),
            updatedAt: new Date().toISOString()
          };
        }
        return c;
      });
      setClients(updatedClients);
      saveToStorage('matezza_clients', updatedClients);
    }

    addAuditLog('Venda Registrada', `Venda ${saleId} realizada no total de R$ ${newSale.total.toFixed(2)}`);
  };

  const updateSaleStatus = (id: string, status: Sale['status']) => {
    const updated = sales.map(s => s.id === id ? { ...s, status, updatedAt: new Date().toISOString() } : s);
    setSales(updated);
    saveToStorage('matezza_sales', updated);
    addAuditLog('Alteração de Status de Venda', `Venda ${id} alterada para ${status}`);
  };

  const deleteSale = (id: string) => {
    // Return stock back
    const saleToRefund = sales.find(s => s.id === id);
    if (saleToRefund) {
      const updatedProducts = products.map(p => {
        const refundedItem = saleToRefund.products.find(item => item.productId === p.id);
        if (refundedItem) {
          return { ...p, stock: p.stock + refundedItem.quantity, updatedAt: new Date().toISOString() };
        }
        return p;
      });
      setProducts(updatedProducts);
      saveToStorage('matezza_products', updatedProducts);
    }

    const updated = sales.filter(s => s.id !== id);
    setSales(updated);
    saveToStorage('matezza_sales', updated);
    addAuditLog('Exclusão de Venda', `Venda ${id} excluída e estoque estornado`);
  };

  // Production Operations
  const addProduction = (prodData: Omit<Production, 'id' | 'createdAt' | 'updatedAt'>) => {
    const prodId = 'PRD-' + generateId();
    const newProduction: Production = {
      ...prodData,
      id: prodId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Deduct raw materials instantly when starting production
    const updatedProducts = products.map(p => {
      const materialUsed = prodData.rawMaterials.find(rm => rm.productId === p.id);
      if (materialUsed) {
        const next = { ...p, stock: Math.max(0, p.stock - materialUsed.quantityUsed), updatedAt: new Date().toISOString() };
        setTimeout(() => checkLowStock(next), 100);
        return next;
      }
      return p;
    });

    setProducts(updatedProducts);
    saveToStorage('matezza_products', updatedProducts);

    // If production is immediately finished, add to stock of finished product
    if (newProduction.status === 'Finalizado') {
      const updatedProdsWithFinished = updatedProducts.map(p => {
        if (p.id === newProduction.productId) {
          return { ...p, stock: p.stock + newProduction.quantity, updatedAt: new Date().toISOString() };
        }
        return p;
      });
      setProducts(updatedProdsWithFinished);
      saveToStorage('matezza_products', updatedProdsWithFinished);
    }

    const updatedProductions = [newProduction, ...productions];
    setProductions(updatedProductions);
    saveToStorage('matezza_productions', updatedProductions);

    addAuditLog('Produção Iniciada', `Ordem de produção ${prodId} criada para ${newProduction.quantity}x ${newProduction.productName}`);
  };

  const updateProductionStatus = (id: string, status: Production['status']) => {
    const currentProduction = productions.find(p => p.id === id);
    if (!currentProduction) return;

    const previousStatus = currentProduction.status;
    if (previousStatus === status) return;

    // Handle inventory changes based on state transitions
    let updatedProducts = [...products];

    if (previousStatus === 'Em andamento' && status === 'Finalizado') {
      // Add the final products to stock
      updatedProducts = products.map(p => {
        if (p.id === currentProduction.productId) {
          return { ...p, stock: p.stock + currentProduction.quantity, updatedAt: new Date().toISOString() };
        }
        return p;
      });
    } else if (previousStatus === 'Em andamento' && status === 'Cancelado') {
      // Return the raw materials back to stock
      updatedProducts = products.map(p => {
        const materialRefund = currentProduction.rawMaterials.find(rm => rm.productId === p.id);
        if (materialRefund) {
          return { ...p, stock: p.stock + materialRefund.quantityUsed, updatedAt: new Date().toISOString() };
        }
        return p;
      });
    } else if (previousStatus === 'Cancelado' && status === 'Em andamento') {
      // Deduct raw materials again
      updatedProducts = products.map(p => {
        const materialUsed = currentProduction.rawMaterials.find(rm => rm.productId === p.id);
        if (materialUsed) {
          return { ...p, stock: Math.max(0, p.stock - materialUsed.quantityUsed), updatedAt: new Date().toISOString() };
        }
        return p;
      });
    } else if (previousStatus === 'Finalizado' && status === 'Cancelado') {
      // Refund raw materials AND subtract finished products from stock
      updatedProducts = products.map(p => {
        if (p.id === currentProduction.productId) {
          return { ...p, stock: Math.max(0, p.stock - currentProduction.quantity), updatedAt: new Date().toISOString() };
        }
        const materialRefund = currentProduction.rawMaterials.find(rm => rm.productId === p.id);
        if (materialRefund) {
          return { ...p, stock: p.stock + materialRefund.quantityUsed, updatedAt: new Date().toISOString() };
        }
        return p;
      });
    }

    setProducts(updatedProducts);
    saveToStorage('matezza_products', updatedProducts);

    const updatedProductions = productions.map(p => p.id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p);
    setProductions(updatedProductions);
    saveToStorage('matezza_productions', updatedProductions);

    addAuditLog('Produção Status Alterado', `Ordem de produção ${id} alterada de ${previousStatus} para ${status}`);
  };

  const updateProduction = (id: string, updatedProd: Production) => {
    const oldProd = productions.find(p => p.id === id);
    if (!oldProd) return;

    let tempProducts = [...products];

    // 1. REVERT old production stock impact
    if (oldProd.status === 'Em andamento') {
      // Revert raw material deduction (add back)
      tempProducts = tempProducts.map(p => {
        const used = oldProd.rawMaterials.find(rm => rm.productId === p.id);
        if (used) {
          return { ...p, stock: p.stock + used.quantityUsed, updatedAt: new Date().toISOString() };
        }
        return p;
      });
    } else if (oldProd.status === 'Finalizado') {
      // Revert raw material deduction (add back) AND revert finished product addition (subtract)
      tempProducts = tempProducts.map(p => {
        let nextStock = p.stock;
        if (p.id === oldProd.productId) {
          nextStock = Math.max(0, nextStock - oldProd.quantity);
        }
        const used = oldProd.rawMaterials.find(rm => rm.productId === p.id);
        if (used) {
          nextStock += used.quantityUsed;
        }
        if (nextStock !== p.stock) {
          return { ...p, stock: nextStock, updatedAt: new Date().toISOString() };
        }
        return p;
      });
    }

    // 2. APPLY new production stock impact
    if (updatedProd.status === 'Em andamento') {
      // Deduct new raw materials
      tempProducts = tempProducts.map(p => {
        const used = updatedProd.rawMaterials.find(rm => rm.productId === p.id);
        if (used) {
          return { ...p, stock: Math.max(0, p.stock - used.quantityUsed), updatedAt: new Date().toISOString() };
        }
        return p;
      });
    } else if (updatedProd.status === 'Finalizado') {
      // Deduct new raw materials AND add new finished product
      tempProducts = tempProducts.map(p => {
        let nextStock = p.stock;
        if (p.id === updatedProd.productId) {
          nextStock += updatedProd.quantity;
        }
        const used = updatedProd.rawMaterials.find(rm => rm.productId === p.id);
        if (used) {
          nextStock = Math.max(0, nextStock - used.quantityUsed);
        }
        if (nextStock !== p.stock) {
          return { ...p, stock: nextStock, updatedAt: new Date().toISOString() };
        }
        return p;
      });
    }

    setProducts(tempProducts);
    saveToStorage('matezza_products', tempProducts);

    // Update the production order
    const updatedProductions = productions.map(p => p.id === id ? { ...updatedProd, updatedAt: new Date().toISOString() } : p);
    setProductions(updatedProductions);
    saveToStorage('matezza_productions', updatedProductions);

    addAuditLog('Edição de Produção', `Ordem de produção ${id} editada. Status: ${updatedProd.status}, Quantidade: ${updatedProd.quantity}`);
  };

  const deleteProduction = (id: string) => {
    const updated = productions.filter(p => p.id !== id);
    setProductions(updated);
    saveToStorage('matezza_productions', updated);
    addAuditLog('Exclusão de Produção', `Ordem de produção ${id} removida`);
  };

  // Expense Operations
  const addExpense = (exp: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newExp: Expense = {
      ...exp,
      id: 'EXP-' + generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [newExp, ...expenses];
    setExpenses(updated);
    saveToStorage('matezza_expenses', updated);
    addAuditLog('Criação de Despesa', `Despesa com ${newExp.description} lançada (R$ ${newExp.amount.toFixed(2)})`);

    // Alert if expenses are unusually high this month
    const currentMonthExpenses = updated
      .filter(e => {
        const date = new Date(e.date);
        return date.getMonth() === new Date().getMonth() && date.getFullYear() === new Date().getFullYear();
      })
      .reduce((sum, e) => sum + e.amount, 0);

    if (currentMonthExpenses > 15000) {
      const newAlert: Alert = {
        id: 'AL-' + generateId(),
        type: 'expense',
        message: `Atenção: Os gastos totais deste mês atingiram R$ ${currentMonthExpenses.toFixed(2)}. Monitore as despesas operacionais.`,
        severity: 'attention',
        read: false,
        createdAt: new Date().toISOString()
      };
      setAlerts(prev => [newAlert, ...prev]);
    }
  };

  const updateExpense = (id: string, partial: Partial<Expense>) => {
    const updated = expenses.map(e => e.id === id ? { ...e, ...partial, updatedAt: new Date().toISOString() } : e);
    setExpenses(updated);
    saveToStorage('matezza_expenses', updated);
    addAuditLog('Atualização de Despesa', `Despesa ${id} atualizada`);
  };

  const deleteExpense = (id: string) => {
    const updated = expenses.filter(e => e.id !== id);
    setExpenses(updated);
    saveToStorage('matezza_expenses', updated);
    addAuditLog('Exclusão de Despesa', `Despesa ${id} removida`);
  };

  // Client Operations
  const addClient = (cl: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newClient: Client = {
      ...cl,
      id: 'C-' + generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [...clients, newClient];
    setClients(updated);
    saveToStorage('matezza_clients', updated);
    addAuditLog('Criação de Cliente', `Cliente ${newClient.name} cadastrado`);
  };

  const updateClient = (id: string, partial: Partial<Client>) => {
    const updated = clients.map(c => c.id === id ? { ...c, ...partial, updatedAt: new Date().toISOString() } : c);
    setClients(updated);
    saveToStorage('matezza_clients', updated);
    addAuditLog('Atualização de Cliente', `Cliente ${id} atualizado`);
  };

  const deleteClient = (id: string) => {
    const updated = clients.filter(c => c.id !== id);
    setClients(updated);
    saveToStorage('matezza_clients', updated);
    addAuditLog('Exclusão de Cliente', `Cliente ${id} deletado`);
  };

  // Alert Operations
  const addAlert = (al: Omit<Alert, 'id' | 'createdAt'>) => {
    const newAlert: Alert = {
      ...al,
      id: 'AL-' + generateId(),
      createdAt: new Date().toISOString()
    };
    const updated = [newAlert, ...alerts];
    setAlerts(updated);
    saveToStorage('matezza_alerts', updated);
  };

  const markAlertAsRead = (id: string) => {
    const updated = alerts.map(a => a.id === id ? { ...a, read: true } : a);
    setAlerts(updated);
    saveToStorage('matezza_alerts', updated);
  };

  const clearAllAlerts = () => {
    const updated = alerts.map(a => ({ ...a, read: true }));
    setAlerts(updated);
    saveToStorage('matezza_alerts', updated);
  };

  // Message Board Operations
  const addMessage = (msg: Omit<Message, 'id' | 'createdAt'>) => {
    const newMsg: Message = {
      ...msg,
      id: 'MSG-' + generateId(),
      createdAt: new Date().toISOString()
    };
    const updated = [newMsg, ...messages];
    setMessages(updated);
    saveToStorage('matezza_messages', updated);
    addAuditLog('Novo Recado', `Mural de recados atualizado: "${newMsg.title}"`);
  };

  const updateMessage = (id: string, partial: Partial<Message>) => {
    const updated = messages.map(m => m.id === id ? { ...m, ...partial } : m);
    setMessages(updated);
    saveToStorage('matezza_messages', updated);
    addAuditLog('Atualização de Recado', `Recado ${id} editado`);
  };

  const deleteMessage = (id: string) => {
    const updated = messages.filter(m => m.id !== id);
    setMessages(updated);
    saveToStorage('matezza_messages', updated);
    addAuditLog('Exclusão de Recado', `Recado ${id} excluído`);
  };

  // Settings & Operations
  const updateSettings = (partial: Partial<Settings>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    saveToStorage('matezza_settings', updated);
    addAuditLog('Alteração de Configuração', `Configurações da empresa atualizadas`);
  };

  const exportDatabase = (): string => {
    addAuditLog('Exportação de Backup', 'Exportação completa do banco de dados iniciada');
    return JSON.stringify({
      users,
      categories,
      products,
      sales,
      productions,
      expenses,
      clients,
      alerts,
      messages,
      settings,
      auditLogs
    }, null, 2);
  };

  const importDatabase = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.users) setUsers(data.users);
      if (data.categories) setCategories(data.categories);
      if (data.products) setProducts(data.products);
      if (data.sales) setSales(data.sales);
      if (data.productions) setProductions(data.productions);
      if (data.expenses) setExpenses(data.expenses);
      if (data.clients) setClients(data.clients);
      if (data.alerts) setAlerts(data.alerts);
      if (data.messages) setMessages(data.messages);
      if (data.settings) setSettings(data.settings);
      if (data.auditLogs) setAuditLogs(data.auditLogs);

      // Save everything
      saveToStorage('matezza_users', data.users || users);
      saveToStorage('matezza_categories', data.categories || categories);
      saveToStorage('matezza_products', data.products || products);
      saveToStorage('matezza_sales', data.sales || sales);
      saveToStorage('matezza_productions', data.productions || productions);
      saveToStorage('matezza_expenses', data.expenses || expenses);
      saveToStorage('matezza_clients', data.clients || clients);
      saveToStorage('matezza_alerts', data.alerts || alerts);
      saveToStorage('matezza_messages', data.messages || messages);
      saveToStorage('matezza_settings', data.settings || settings);
      saveToStorage('matezza_audit_logs', data.auditLogs || auditLogs);

      addAuditLog('Importação de Backup', 'Importação completa de banco de dados efetuada com sucesso');
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const clearDatabase = () => {
    setUsers(initialUsers);
    setCategories(initialCategories);
    setProducts(initialProducts);
    setSales([]);
    setProductions([]);
    setExpenses([]);
    setClients(initialClients);
    setAlerts([]);
    setMessages(initialMessages);
    setSettings({
      darkMode: true,
      language: 'pt',
      companyName: 'MATEZZA INDUSTRIAL LTDA',
      companyLogo: ''
    });
    setAuditLogs([]);

    localStorage.clear();
    saveToStorage('matezza_users', initialUsers);
    saveToStorage('matezza_categories', initialCategories);
    saveToStorage('matezza_products', initialProducts);
    saveToStorage('matezza_clients', initialClients);
    saveToStorage('matezza_messages', initialMessages);
    addAuditLog('Limpeza de Dados', 'Todas as tabelas foram reiniciadas para as configurações de fábrica');
  };

  return (
    <ERPContext.Provider value={{
      currentUser,
      users,
      categories,
      products,
      sales,
      productions,
      expenses,
      clients,
      alerts,
      messages,
      settings,
      auditLogs,

      login,
      logout,
      registerUser,
      updateUserRole,

      addCategory,
      updateCategory,
      deleteCategory,

      addProduct,
      updateProduct,
      deleteProduct,
      adjustStock,

      addSale,
      updateSaleStatus,
      deleteSale,

      addProduction,
      updateProductionStatus,
      updateProduction,
      deleteProduction,

      addExpense,
      updateExpense,
      deleteExpense,

      addClient,
      updateClient,
      deleteClient,

      addAlert,
      markAlertAsRead,
      clearAllAlerts,

      addMessage,
      updateMessage,
      deleteMessage,

      updateSettings,
      exportDatabase,
      importDatabase,
      clearDatabase
    }}>
      {children}
    </ERPContext.Provider>
  );
};

export const useERP = () => {
  const context = useContext(ERPContext);
  if (context === undefined) {
    throw new Error('useERP must be used within an ERPProvider');
  }
  return context;
};
