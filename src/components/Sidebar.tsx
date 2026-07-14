/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useERP } from '../context/ERPContext';
import {
  LayoutDashboard,
  TrendingUp,
  Boxes,
  ShoppingCart,
  DollarSign,
  Factory,
  Sparkles,
  Layers,
  ClipboardList,
  ShieldCheck,
  LogOut,
  X
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  mobileOpen,
  setMobileOpen
}) => {
  const { currentUser, logout } = useERP();

  // Exact 9 sidebar items in Portuguese from screenshot 2
  const menuItems = [
    { id: 'dashboard', label: 'Painel', icon: LayoutDashboard, role: ['Administrador', 'Operador', 'Funcionário'] },
    { id: 'reports', label: 'Relatórios', icon: TrendingUp, role: ['Administrador', 'Operador'] },
    { id: 'stock', label: 'Estoque', icon: Boxes, role: ['Administrador', 'Operador', 'Funcionário'] },
    { id: 'sales', label: 'Vendas', icon: ShoppingCart, role: ['Administrador', 'Operador', 'Funcionário'] },
    { id: 'expenses', label: 'Despesas', icon: DollarSign, role: ['Administrador'] },
    { id: 'production', label: 'Produção', icon: Factory, role: ['Administrador', 'Operador'] },
    { id: 'production_smart', label: 'Produção Inteligente', icon: Sparkles, role: ['Administrador', 'Operador'] },
    { id: 'categories', label: 'Categorias', icon: Layers, role: ['Administrador', 'Operador'] },
    { id: 'products', label: 'Produtos', icon: ClipboardList, role: ['Administrador', 'Operador'] }
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          id="sidebar-backdrop"
          className="fixed inset-0 bg-[#040f0c]/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar container with beautiful deep green style */}
      <aside
        id="sidebar-container"
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#020a08] border-r border-[#051713] flex flex-col justify-between transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* LOGO AREA */}
        <div className="p-6 border-b border-[#051713] flex items-center justify-between bg-[#010605]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#00df89]/10 border border-[#00df89]/30 rounded-xl flex items-center justify-center">
              <span className="text-[#00df89] font-black font-sans text-lg">M</span>
            </div>
            <div>
              <span className="text-md font-black text-[#00df89] tracking-widest block leading-none">MATEZZA</span>
              <span className="text-[9px] text-[#00b36e] uppercase tracking-widest font-semibold mt-1 block">Industrial ERP</span>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1 text-slate-400 hover:text-white rounded-lg hover:bg-[#051713]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            // Check roles
            if (currentUser && !item.role.includes(currentUser.role)) {
              return null;
            }

            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#00df89]/10 text-[#00df89] border-l-4 border-[#00df89] shadow-sm shadow-[#00df89]/5'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-[#06241c]/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#00df89]' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* USER PROFILE INFO & LOGOUT */}
        <div className="p-4 border-t border-[#051713] bg-[#010605]">
          <div className="flex items-center gap-3 p-2 bg-[#03110d] rounded-2xl border border-[#08241d]/70 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00b36e] to-[#00df89] flex items-center justify-center text-slate-950 font-black text-sm shadow-md">
              {currentUser?.name.substring(0, 2).toUpperCase() || 'BM'}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-bold text-white block truncate leading-tight">{currentUser?.name.toUpperCase()}</span>
              <div className="flex items-center gap-1 mt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00df89]" />
                <span className="text-[9px] text-[#00b36e] font-bold truncate uppercase tracking-widest">{currentUser?.role}</span>
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#0b2d25] text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 hover:border-rose-900/30 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair do ERP</span>
          </button>
        </div>
      </aside>
    </>
  );
};
