/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ERPProvider, useERP } from './context/ERPContext';
import { AuthScreen } from './components/AuthScreen';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { RelatoriosView } from './components/RelatoriosView';
import { StockView } from './components/StockView';
import { SalesView } from './components/SalesView';
import { ExpensesView } from './components/ExpensesView';
import { ProductionLogView } from './components/ProductionLogView';
import { ProductionView } from './components/ProductionView';
import { CategoriesView } from './components/CategoriesView';
import { ProductsView } from './components/ProductsView';
import { EmployeesView } from './components/EmployeesView';
import { ClientsView } from './components/ClientsView';
import {
  Bell,
  Menu,
  ShieldCheck,
  Check,
  X
} from 'lucide-react';

function ERPShell() {
  const { currentUser, alerts, markAlertAsRead, clearAllAlerts, toasts, removeToast } = useERP();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

  // If not logged in, render Auth screen
  if (!currentUser) {
    return <AuthScreen />;
  }

  // Double check role permission for active tab
  const getPermittedView = () => {
    const isAdmin = currentUser.role === 'Administrador';
    const isOperator = currentUser.role === 'Operador';
    
    // Safety checks for unauthorized views, redirecting to dashboard
    if (activeTab === 'expenses' && !isAdmin) return <DashboardView onNavigate={setActiveTab} />;
    if (activeTab === 'reports' && (!isAdmin && !isOperator)) return <DashboardView onNavigate={setActiveTab} />;
    if (activeTab === 'production' && (!isAdmin && !isOperator)) return <DashboardView onNavigate={setActiveTab} />;
    if (activeTab === 'production_smart' && (!isAdmin && !isOperator)) return <DashboardView onNavigate={setActiveTab} />;
    if (activeTab === 'employees' && (!isAdmin && !isOperator)) return <DashboardView onNavigate={setActiveTab} />;

    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onNavigate={setActiveTab} />;
      case 'reports':
        return <RelatoriosView />;
      case 'stock':
        return <StockView />;
      case 'sales':
        return <SalesView />;
      case 'clients':
        return <ClientsView />;
      case 'expenses':
        return <ExpensesView />;
      case 'production':
        return <ProductionLogView />;
      case 'production_smart':
        return <ProductionView />;
      case 'employees':
        return <EmployeesView />;
      case 'categories':
        return <CategoriesView />;
      case 'products':
        return <ProductsView />;
      default:
        return <DashboardView onNavigate={setActiveTab} />;
    }
  };

  const unreadAlerts = alerts.filter(a => !a.read);

  return (
    <div className="min-h-screen flex bg-[#040f0c] text-slate-100 font-sans antialiased overflow-hidden">
      
      {/* SIDEBAR NAVIGATION */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* MAIN ERP CONTAINER */}
      <div id="erp-main-wrapper" className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* HEADER BAR */}
        <header id="erp-header-bar" className="h-20 bg-[#020a08]/95 border-b border-[#051713] flex items-center justify-between px-6 shrink-0 z-30 select-none">
          <div className="flex items-center gap-4">
            {/* Mobile Sidebar Hamburger Toggle */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-[#051713] rounded-xl transition-all cursor-pointer"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Custom Company Identity Header */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="w-8 h-8 bg-[#00df89]/10 border border-[#00df89]/20 rounded-lg flex items-center justify-center text-[#00df89] font-bold text-sm">M</div>
              <div className="text-left">
                <span className="text-sm font-black tracking-widest text-white uppercase block leading-none">MATEZZA INDUSTRIAL</span>
                <span className="text-[9px] text-[#00b36e] uppercase tracking-widest font-bold mt-1 block">Análise de Performance Operacional</span>
              </div>
            </div>
          </div>

          {/* Right Header: Alerts count dropdown & Profile quick badge */}
          <div className="flex items-center gap-4">
            
            {/* Alerts Center Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                className="p-2.5 bg-[#03110d] hover:bg-[#051c16] border border-[#0b2d25] rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer relative"
              >
                <Bell className="w-4 h-4 text-emerald-400" />
                {unreadAlerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white font-mono text-[9px] font-bold rounded-full flex items-center justify-center animate-bounce shadow">
                    {unreadAlerts.length}
                  </span>
                )}
              </button>

              {/* Real-time Alerts Dropdown list */}
              {showNotificationDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotificationDropdown(false)}
                  />
                  <div
                    id="alerts-dropdown-panel"
                    className="absolute right-0 mt-2.5 w-[22rem] bg-[#041611] border border-[#0b3a2d] rounded-2xl shadow-2xl z-50 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-[#0b3328]/40 pb-2.5">
                      <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Bell className="w-3.5 h-3.5 text-[#00df89]" />
                        Centro de Notificações
                      </span>
                      {unreadAlerts.length > 0 && (
                        <button
                          onClick={clearAllAlerts}
                          className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold transition-all cursor-pointer"
                        >
                          Marcar todas como lidas
                        </button>
                      )}
                    </div>

                    <div className="space-y-2 max-h-[260px] overflow-y-auto custom-scrollbar">
                      {alerts.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 text-xs">
                          Nenhuma notificação ativa.
                        </div>
                      ) : (
                        alerts.map((al) => {
                          const alertDate = new Date(al.createdAt);
                          const formattedDate = alertDate.toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          });
                          const formattedTime = alertDate.toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          });

                          return (
                            <div
                              key={al.id}
                              onClick={() => !al.read && markAlertAsRead(al.id)}
                              className={`p-3 rounded-xl text-xs flex gap-2.5 transition-all border ${
                                al.read 
                                  ? 'bg-slate-950/20 border-slate-800/20 text-slate-500' 
                                  : al.severity === 'urgent'
                                    ? 'bg-rose-500/5 border-rose-500/20 text-slate-200'
                                    : 'bg-amber-500/5 border-amber-500/20 text-slate-200'
                              }`}
                            >
                              <span className="shrink-0 mt-0.5 text-xs">{al.read ? '✅' : '🔔'}</span>
                              <div className="flex-1 min-w-0">
                                <p className={`leading-snug text-[11px] break-words ${!al.read ? 'font-medium' : ''}`}>{al.message}</p>
                                <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800/30">
                                  <span className="text-[9px] text-slate-500">
                                    {formattedDate} às {formattedTime}
                                  </span>
                                  {!al.read ? (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        markAlertAsRead(al.id);
                                      }}
                                      className="px-2 py-0.5 bg-emerald-950/80 border border-emerald-800/60 hover:bg-emerald-900 text-emerald-400 hover:text-emerald-200 text-[9px] font-bold rounded-md transition-all uppercase tracking-wider flex items-center gap-0.5 cursor-pointer"
                                    >
                                      <Check className="w-2.5 h-2.5" />
                                      Lida
                                    </button>
                                  ) : (
                                    <span className="text-[9px] text-emerald-500/60 font-semibold flex items-center gap-0.5">
                                      Lida
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile Info Badge */}
            <div className="flex items-center gap-3 pl-3 border-l border-[#0b2d25]">
              <div className="hidden md:block text-right">
                <span className="text-xs font-bold text-white block leading-none">{currentUser.name}</span>
                <span className="text-[9px] text-[#00b36e] mt-1 block uppercase tracking-widest font-bold">{currentUser.role}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00b36e] to-[#00df89] flex items-center justify-center text-slate-950 font-black text-sm shadow-md">
                {currentUser.name.substring(0,2).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* ACTIVE MODULE VIEW STAGE */}
        <main id="erp-content-stage" className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          {getPermittedView()}
        </main>
      </div>

      {/* Floating Toast Notifications */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-[calc(100%-2.5rem)] pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl shadow-2xl border flex items-start justify-between gap-3 transition-all transform animate-fadeIn ${
              toast.type === 'success'
                ? 'bg-[#031c15]/95 border-emerald-500/40 text-emerald-300'
                : toast.type === 'error'
                  ? 'bg-[#1c0308]/95 border-rose-500/40 text-rose-300'
                  : 'bg-[#081215]/95 border-sky-500/40 text-sky-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">
                {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'}
              </span>
              <p className="text-xs font-bold leading-normal">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 p-1 bg-transparent hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ERPProvider>
      <ERPShell />
    </ERPProvider>
  );
}
