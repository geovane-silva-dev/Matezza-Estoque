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
  UserRole,
  Toast
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
  updateUser: (userId: string, partial: Partial<User>) => void;
  deleteUser: (userId: string) => void;

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
  clearSalesHistory: () => void;

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

  // Toasts
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
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

const initialCategories: Category[] = [];

const initialProducts: Product[] = [];

const initialClients: Client[] = [];

const initialSales: Sale[] = [];

const initialProductions: Production[] = [];

const initialExpenses: Expense[] = [];

const initialMessages: Message[] = [];

const initialAlerts: Alert[] = [];

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
    companyName: 'MATEZZA INDUSTRIAL IND',
    companyLogo: ''
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const ultraClean = localStorage.getItem('matezza_ultra_clean_slate_v2');
      if (!ultraClean) {
        localStorage.clear();
        localStorage.setItem('matezza_ultra_clean_slate_v2', 'true');
        setUsers(initialUsers);
        setCategories([]);
        setProducts([]);
        setSales([]);
        setProductions([]);
        setExpenses([]);
        setClients([]);
        setAlerts([]);
        setMessages([]);
        setSettings({
          darkMode: true,
          language: 'pt',
          companyName: 'MATEZZA INDUSTRIAL IND',
          companyLogo: ''
        });
        localStorage.setItem('matezza_users', JSON.stringify(initialUsers));
        localStorage.setItem('matezza_categories', '[]');
        localStorage.setItem('matezza_products', '[]');
        localStorage.setItem('matezza_sales', '[]');
        localStorage.setItem('matezza_productions', '[]');
        localStorage.setItem('matezza_recipes', '[]');
        localStorage.setItem('matezza_expenses', '[]');
        localStorage.setItem('matezza_clients', '[]');
        localStorage.setItem('matezza_alerts', '[]');
        localStorage.setItem('matezza_messages', '[]');
        localStorage.setItem('matezza_session', JSON.stringify(initialUsers[0]));
        setCurrentUser(initialUsers[0]);
        return;
      }

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

      if (storedProducts) {
        const parsedProducts: Product[] = JSON.parse(storedProducts);
        const cleansedProducts = parsedProducts.map(p => {
          if (p.image && p.image.startsWith('http')) {
            if (p.id === 'P-CUIA-PREM' || p.name.includes('Cuia')) return { ...p, image: '🧉' };
            if (p.id === 'P-TERM-1L' || p.name.includes('Garrafa')) return { ...p, image: '💧' };
            if (p.id === 'P-BOMBA-INOX' || p.name.includes('Bomba')) return { ...p, image: '🌿' };
            if (p.id === 'P-RAW-STEEL' || p.name.includes('Aço')) return { ...p, image: '🛡️' };
            if (p.id === 'P-RAW-PAINT' || p.name.includes('Pintura')) return { ...p, image: '🍂' };
            if (p.id === 'P-RAW-BOX' || p.name.includes('Caixa')) return { ...p, image: '📦' };
            return { ...p, image: '📦' };
          }
          return p;
        });
        setProducts(cleansedProducts);
        localStorage.setItem('matezza_products', JSON.stringify(cleansedProducts));
      }
      else {
        setProducts(initialProducts);
        localStorage.setItem('matezza_products', JSON.stringify(initialProducts));
      }

      if (storedSales) setSales(JSON.parse(storedSales));
      else {
        setSales(initialSales);
        localStorage.setItem('matezza_sales', JSON.stringify(initialSales));
      }

      const clearedProd = localStorage.getItem('matezza_production_cleared_v2');
      if (!clearedProd) {
        localStorage.setItem('matezza_recipes', '[]');
        localStorage.setItem('matezza_productions', '[]');
        localStorage.setItem('matezza_production_cleared_v2', 'true');
        setProductions([]);
      } else if (storedProductions) {
        const parsed = JSON.parse(storedProductions);
        const filtered = parsed.filter((p: any) => p.id !== 'PRD-001' && p.id !== 'PRD-002');
        setProductions(filtered);
      }
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
        if (parsed && (!parsed.companyName || parsed.companyName.includes('LTDA'))) {
          parsed.companyName = parsed.companyName ? parsed.companyName.replace(/LTDA/gi, 'IND') : 'MATEZZA INDUSTRIAL IND';
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

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = generateId();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
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

  const updateUser = (userId: string, partial: Partial<User>) => {
    const updated = users.map(u => u.id === userId ? { ...u, ...partial } : u);
    setUsers(updated);
    saveToStorage('matezza_users', updated);
    addAuditLog('Edição de Usuário', `Usuário ${userId} atualizado`);
  };

  const deleteUser = (userId: string) => {
    const updated = users.filter(u => u.id !== userId);
    setUsers(updated);
    saveToStorage('matezza_users', updated);
    addAuditLog('Exclusão de Usuário', `Usuário ${userId} deletado`);
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
    const saleToUpdate = sales.find(s => s.id === id);
    if (saleToUpdate && saleToUpdate.clientId) {
      if (saleToUpdate.status === 'Pendente' && status === 'Paga') {
        const updatedClients = clients.map(c => {
          if (c.id === saleToUpdate.clientId) {
            return {
              ...c,
              balance: Math.max(0, c.balance - saleToUpdate.total),
              updatedAt: new Date().toISOString()
            };
          }
          return c;
        });
        setClients(updatedClients);
        saveToStorage('matezza_clients', updatedClients);
      } else if (saleToUpdate.status === 'Paga' && status === 'Pendente') {
        const updatedClients = clients.map(c => {
          if (c.id === saleToUpdate.clientId) {
            return {
              ...c,
              balance: c.balance + saleToUpdate.total,
              updatedAt: new Date().toISOString()
            };
          }
          return c;
        });
        setClients(updatedClients);
        saveToStorage('matezza_clients', updatedClients);
      }
    }

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

      // Refund client balance if sale was pendente
      if (saleToRefund.clientId && saleToRefund.status === 'Pendente') {
        const updatedClients = clients.map(c => {
          if (c.id === saleToRefund.clientId) {
            return {
              ...c,
              balance: Math.max(0, c.balance - saleToRefund.total),
              updatedAt: new Date().toISOString()
            };
          }
          return c;
        });
        setClients(updatedClients);
        saveToStorage('matezza_clients', updatedClients);
      }
    }

    const updated = sales.filter(s => s.id !== id);
    setSales(updated);
    saveToStorage('matezza_sales', updated);
    addAuditLog('Exclusão de Venda', `Venda ${id} excluída e estoque estornado`);
  };

  const clearSalesHistory = () => {
    setSales([]);
    saveToStorage('matezza_sales', []);
    addAuditLog('Limpeza de Histórico de Vendas', `Todo o histórico de vendas foi apagado`);
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

    // If production status is immediately 'Finalizado', apply stock impact
    if (newProduction.status === 'Finalizado') {
      const updatedProducts = products.map(p => {
        let nextStock = p.stock;
        
        // Deduct raw materials
        const materialUsed = newProduction.rawMaterials.find(rm => rm.productId === p.id);
        if (materialUsed) {
          nextStock = Math.max(0, nextStock - materialUsed.quantityUsed);
        }
        
        // Add finished product
        if (p.id === newProduction.productId) {
          nextStock += newProduction.quantity;
        }

        if (nextStock !== p.stock) {
          const next = { ...p, stock: nextStock, updatedAt: new Date().toISOString() };
          setTimeout(() => checkLowStock(next), 100);
          return next;
        }
        return p;
      });

      setProducts(updatedProducts);
      saveToStorage('matezza_products', updatedProducts);
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

    let updatedProducts = [...products];

    const isPrevFinalizado = previousStatus === 'Finalizado';
    const isNewFinalizado = status === 'Finalizado';

    if (!isPrevFinalizado && isNewFinalizado) {
      // Shifting to Finalizado: Deduct raw materials AND add finished product to stock
      updatedProducts = products.map(p => {
        let nextStock = p.stock;
        
        // Deduct raw materials
        const used = currentProduction.rawMaterials.find(rm => rm.productId === p.id);
        if (used) {
          nextStock = Math.max(0, nextStock - used.quantityUsed);
        }
        
        // Add finished product
        if (p.id === currentProduction.productId) {
          nextStock += currentProduction.quantity;
        }

        if (nextStock !== p.stock) {
          const next = { ...p, stock: nextStock, updatedAt: new Date().toISOString() };
          setTimeout(() => checkLowStock(next), 100);
          return next;
        }
        return p;
      });
    } else if (isPrevFinalizado && !isNewFinalizado) {
      // Shifting away from Finalizado: Add back raw materials AND subtract finished product from stock
      updatedProducts = products.map(p => {
        let nextStock = p.stock;
        
        // Refund raw materials
        const used = currentProduction.rawMaterials.find(rm => rm.productId === p.id);
        if (used) {
          nextStock += used.quantityUsed;
        }
        
        // Subtract finished product
        if (p.id === currentProduction.productId) {
          nextStock = Math.max(0, nextStock - currentProduction.quantity);
        }

        if (nextStock !== p.stock) {
          const next = { ...p, stock: nextStock, updatedAt: new Date().toISOString() };
          setTimeout(() => checkLowStock(next), 100);
          return next;
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

    // 1. REVERT old production stock impact (only if it was Finalizado)
    if (oldProd.status === 'Finalizado') {
      tempProducts = tempProducts.map(p => {
        let nextStock = p.stock;
        
        // Subtract finished product
        if (p.id === oldProd.productId) {
          nextStock = Math.max(0, nextStock - oldProd.quantity);
        }
        
        // Refund raw materials
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

    // 2. APPLY new production stock impact (only if it is Finalizado)
    if (updatedProd.status === 'Finalizado') {
      tempProducts = tempProducts.map(p => {
        let nextStock = p.stock;
        
        // Add finished product
        if (p.id === updatedProd.productId) {
          nextStock += updatedProd.quantity;
        }
        
        // Deduct raw materials
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
    const prodToDelete = productions.find(p => p.id === id);
    if (prodToDelete && prodToDelete.status === 'Finalizado') {
      const tempProducts = products.map(p => {
        let nextStock = p.stock;
        
        // Subtract finished product
        if (p.id === prodToDelete.productId) {
          nextStock = Math.max(0, nextStock - prodToDelete.quantity);
        }
        
        // Refund raw materials
        const used = prodToDelete.rawMaterials.find(rm => rm.productId === p.id);
        if (used) {
          nextStock += used.quantityUsed;
        }

        if (nextStock !== p.stock) {
          const next = { ...p, stock: nextStock, updatedAt: new Date().toISOString() };
          setTimeout(() => checkLowStock(next), 100);
          return next;
        }
        return p;
      });
      setProducts(tempProducts);
      saveToStorage('matezza_products', tempProducts);
    }

    const updated = productions.filter(p => p.id !== id);
    setProductions(updated);
    saveToStorage('matezza_productions', updated);
    addAuditLog('Exclusão de Produção', `Ordem de produção ${id} removida e estoque estornado se aplicável`);
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
      companyName: 'MATEZZA INDUSTRIAL IND',
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
      updateUser,
      deleteUser,

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
      clearSalesHistory,

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
      clearDatabase,

      toasts,
      showToast,
      removeToast
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
