/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import {
  TrendingUp,
  FileSpreadsheet,
  Printer,
  BookOpen,
  ChevronDown,
  LineChart,
  BarChart3,
  Calendar,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell
} from 'recharts';

export const RelatoriosView: React.FC = () => {
  const { sales, productions, expenses, products } = useERP();
  const [selectedProductFilter, setSelectedProductFilter] = useState('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Formatter for currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Filter calculations based on product selection
  const getFilteredMetrics = () => {
    let filteredSales = sales.filter(s => s.status !== 'Cancelada');
    let filteredProductions = productions.filter(p => p.status !== 'Cancelado');
    let filteredExpenses = [...expenses];

    if (selectedProductFilter !== 'all') {
      // Filter sales to only those containing the selected product
      filteredSales = sales.filter(s => 
        s.status !== 'Cancelada' && 
        s.products.some(p => p.productId === selectedProductFilter)
      );

      // Filter productions to only those of the selected product
      filteredProductions = productions.filter(p => 
        p.status !== 'Cancelado' && 
        p.productId === selectedProductFilter
      );
    }

    // Revenue: sum of totals of filtered sales
    const revenue = filteredSales.reduce((sum, s) => {
      if (selectedProductFilter === 'all') {
        return sum + s.total;
      } else {
        // Only sum the item portion
        const itemTotal = s.products
          .filter(p => p.productId === selectedProductFilter)
          .reduce((itemSum, p) => itemSum + (p.quantity * p.price), 0);
        return sum + itemTotal;
      }
    }, 0);

    // Production costs: cost of raw materials or cost value of sold goods
    const productionCost = filteredProductions.reduce((sum, p) => sum + p.totalCost, 0);

    // Expenses: we distribute administrative expenses
    const adminExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Liquid excess (Excesso Líquido)
    const netExcess = revenue - productionCost - (selectedProductFilter === 'all' ? adminExpenses : adminExpenses / Math.max(1, products.length));

    return {
      revenue,
      productionCost,
      adminExpenses: selectedProductFilter === 'all' ? adminExpenses : adminExpenses / Math.max(1, products.length),
      netExcess
    };
  };

  const metrics = getFilteredMetrics();
  const filteredSales = sales.filter(s => s.status !== 'Cancelada');

  // Products list for dropdown
  const finishedProducts = products.filter(p => !p.isRawMaterial);
  const selectedProductLabel = selectedProductFilter === 'all' 
    ? 'TODOS OS PRODUTOS' 
    : products.find(p => p.id === selectedProductFilter)?.name || 'PRODUTO SELECIONADO';

  // Timeline chart data
  const getTimelineData = () => {
    if (filteredSales.length === 0) return [];
    
    // Group sales by date
    const groups: { [key: string]: { revenue: number, cost: number } } = {};
    
    filteredSales.forEach(s => {
      const dateStr = new Date(s.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      if (!groups[dateStr]) {
        groups[dateStr] = { revenue: 0, cost: 0 };
      }
      
      if (selectedProductFilter === 'all') {
        groups[dateStr].revenue += s.total;
        // Estimate cost as 40% of sale if production not linked, or sum actual costs
        const saleCost = s.products.reduce((cSum, p) => cSum + (p.cost * p.quantity), 0);
        groups[dateStr].cost += saleCost;
      } else {
        const matchingItems = s.products.filter(p => p.productId === selectedProductFilter);
        const itemRevenue = matchingItems.reduce((sum, p) => sum + (p.quantity * p.price), 0);
        const itemCost = matchingItems.reduce((sum, p) => sum + (p.cost * p.quantity), 0);
        groups[dateStr].revenue += itemRevenue;
        groups[dateStr].cost += itemCost;
      }
    });

    return Object.keys(groups).map(date => ({
      name: date,
      Faturamento: Number(groups[date].revenue.toFixed(2)),
      Custo: Number(groups[date].cost.toFixed(2)),
      Margem: Number((groups[date].revenue - groups[date].cost).toFixed(2))
    })).slice(-7); // take last 7 dates
  };

  const timelineData = getTimelineData();

  // Best selling products ranking
  const getLeaderboardData = () => {
    const counts: { [key: string]: { name: string, qty: number, revenue: number } } = {};
    
    filteredSales.forEach(s => {
      s.products.forEach(p => {
        if (!counts[p.productId]) {
          counts[p.productId] = { name: p.name, qty: 0, revenue: 0 };
        }
        counts[p.productId].qty += p.quantity;
        counts[p.productId].revenue += p.quantity * p.price;
      });
    });

    return Object.keys(counts).map(id => ({
      id,
      name: counts[id].name,
      qty: counts[id].qty,
      revenue: counts[id].revenue
    })).sort((a, b) => b.qty - a.qty).slice(0, 5);
  };

  const leaders = getLeaderboardData();

  // Export as mockup spreadsheet (CSV)
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'REF ID,DATA,COMPRADOR,ITENS,TOTAL,METODO,STATUS\n';
    
    sales.forEach(s => {
      const date = new Date(s.createdAt).toLocaleDateString('pt-BR');
      const items = s.products.map(p => `${p.name} (x${p.quantity})`).join(' | ');
      csvContent += `${s.receiptId},${date},"${s.clientName}","${items}",${s.total},${s.paymentMethod},${s.status}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_vendas_matezza.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Mock Printing
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-fadeIn text-slate-100">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Relatórios de Rentabilidade</h1>
          <p className="text-xs text-emerald-400/80 font-medium">Balanços de performance, vendas consolidadas e faturamento tributário.</p>
        </div>
        
        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-[#06241c] hover:bg-[#0a352a] border border-[#0d4738] rounded-xl text-xs font-semibold text-emerald-400 transition-all cursor-pointer shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar Planilha</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-[#06241c] hover:bg-[#0a352a] border border-[#0d4738] rounded-xl text-xs font-semibold text-emerald-400 transition-all cursor-pointer shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Invoice</span>
          </button>
        </div>
      </div>

      {/* STRATEGY BANNER CARD */}
      <div className="bg-[#051a14] border border-[#0b382b] rounded-2xl p-6 relative overflow-hidden">
        {/* Decorative corner glow */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* LEFT PANEL: CONTEXT & FILTER */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 shrink-0 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mt-1">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase block">Estratégia de Performance</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Abaixo estão os indicadores consolidados baseados no faturamento de insumos biológicos. Ajuste o filtro rápido à direita para focar em indicadores específicos de um produto.
                </p>
              </div>
            </div>

            {/* PRODUCT QUICK SELECTOR */}
            <div className="relative pt-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Análise por Produto:</span>
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center justify-between gap-3 px-4 py-2 bg-[#03110d] hover:bg-[#051e18] border border-[#0a382a] rounded-xl text-xs font-bold text-white transition-all w-full sm:w-64"
              >
                <span className="truncate">{selectedProductLabel}</span>
                <ChevronDown className="w-4 h-4 text-emerald-400 shrink-0" />
              </button>

              {showFilterDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowFilterDropdown(false)} />
                  <div className="absolute left-0 mt-1.5 w-72 bg-[#041611] border border-[#0b3a2d] rounded-xl shadow-2xl z-50 p-2 max-h-60 overflow-y-auto custom-scrollbar">
                    <button
                      onClick={() => {
                        setSelectedProductFilter('all');
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold block transition-colors ${
                        selectedProductFilter === 'all' ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-300 hover:bg-slate-900/40'
                      }`}
                    >
                      TODOS OS PRODUTOS
                    </button>
                    <div className="h-px bg-[#0a382a] my-1" />
                    {finishedProducts.map(p => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setSelectedProductFilter(p.id);
                          setShowFilterDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs block transition-colors ${
                          selectedProductFilter === p.id ? 'bg-emerald-500/10 text-emerald-400 font-bold' : 'text-slate-300 hover:bg-[#06241c]'
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* RIGHT PANEL: NUMERICAL STATS (5/12) */}
          <div className="lg:col-span-5 bg-[#03110d] border border-[#0a3528]/80 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center text-xs border-b border-[#0a3528]/50 pb-2">
              <span className="text-slate-400 font-medium">FATURAMENTO CONQUISTADO:</span>
              <span className="font-mono font-bold text-white">{formatCurrency(metrics.revenue)}</span>
            </div>
            <div className="flex justify-between items-center text-xs border-b border-[#0a3528]/50 pb-2">
              <span className="text-slate-400 font-medium">CUSTOS FABRIS INSUMIDOS:</span>
              <span className="font-mono font-bold text-white">{formatCurrency(metrics.productionCost)}</span>
            </div>
            <div className="flex justify-between items-center text-xs border-b border-[#0a3528]/50 pb-2">
              <span className="text-slate-400 font-medium">DESPESAS ADMINISTRATIVAS:</span>
              <span className="font-mono font-bold text-white">{formatCurrency(metrics.adminExpenses)}</span>
            </div>
            <div className="flex justify-between items-center text-xs pt-1">
              <span className="text-emerald-400 font-bold">EXCESSO LÍQUIDO:</span>
              <span className="font-mono font-black text-[#00df89] text-sm">{formatCurrency(metrics.netExcess)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CHARTS GRID SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* TIMELINE OF BILLING (7/12) */}
        <div className="lg:col-span-7 bg-[#051713] border border-[#0b2d25] rounded-2xl p-6 flex flex-col justify-between min-h-[360px]">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <LineChart className="w-4 h-4 text-emerald-400" />
              <span>Timeline de Faturamento</span>
            </h3>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-1">
              Comparativo entre faturamento, insumo de fabricação e margens líquidas
            </p>
          </div>

          <div className="flex-1 flex items-center justify-center mt-6">
            {timelineData.length === 0 ? (
              <div className="text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-slate-600 mx-auto" />
                <span className="text-xs text-slate-500 font-mono tracking-wider block uppercase">
                  FALTAM REGISTROS DE VENDAS CRONOLÓGICOS
                </span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={timelineData}>
                  <defs>
                    <linearGradient id="colorFaturamento" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00df89" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#00df89" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#0b2c23" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#03100c', borderColor: '#0b3529', borderRadius: '12px' }}
                    labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="Faturamento" stroke="#00df89" strokeWidth={2} fillOpacity={1} fill="url(#colorFaturamento)" />
                  <Area type="monotone" dataKey="Custo" stroke="#ef4444" strokeWidth={1} fill="none" strokeDasharray="4 4" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* BEST SELLING PRODUCTS (5/12) */}
        <div className="lg:col-span-5 bg-[#051713] border border-[#0b2d25] rounded-2xl p-6 flex flex-col justify-between min-h-[360px]">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>Produtos Líderes de Venda</span>
            </h3>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-1">
              Rank de quantidade absorvida por compradores
            </p>
          </div>

          <div className="flex-1 flex items-center justify-center mt-6">
            {leaders.length === 0 ? (
              <div className="text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-slate-600 mx-auto" />
                <span className="text-xs text-slate-500 font-mono tracking-wider block uppercase">
                  SEM PERFORMANCE FATURADA
                </span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={leaders}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#0b2c23" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickFormatter={(val) => val.substring(0, 10) + '...'} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#03100c', borderColor: '#0b3529', borderRadius: '12px' }}
                  />
                  <Bar dataKey="qty" fill="#00df89" radius={[4, 4, 0, 0]}>
                    {leaders.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#00df89' : '#046a50'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* DETAILED JOURNAL TABLE (FULL WIDTH) */}
      <div className="bg-[#051713] border border-[#0b2d25] rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Diário de Controle Industrial & Vendas Integrados</h3>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">Livro mercantil com registros de faturamento consolidado</p>
          </div>
        </div>

        <div className="border border-[#0b2c23] rounded-xl overflow-hidden bg-[#03100c]/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#03100c] border-b border-[#0b2c23] text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">REF ID</th>
                  <th className="py-3.5 px-4">DATA LANÇAMENTO</th>
                  <th className="py-3.5 px-4">COMPRADOR TRIBUTADO</th>
                  <th className="py-3.5 px-4">UNIDADES</th>
                  <th className="py-3.5 px-4">INSUMO BASE DE VENDA</th>
                  <th className="py-3.5 px-4">PREÇO POR UN.</th>
                  <th className="py-3.5 px-4 text-right">FATURAMENTO CONSOLIDADO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0b2c23] text-xs">
                {sales.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 font-mono text-[10px] uppercase tracking-wider">
                      Nenhum lançamento no livro mercantil.
                    </td>
                  </tr>
                ) : (
                  sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-[#051c17] text-slate-300 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">{sale.receiptId}</td>
                      <td className="py-3.5 px-4">
                        {new Date(sale.createdAt).toLocaleDateString('pt-BR')} - {new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white">{sale.clientName}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        {sale.products.reduce((sum, p) => sum + p.quantity, 0)} un
                      </td>
                      <td className="py-3.5 px-4 truncate max-w-[200px]">
                        {sale.products.map(p => p.name).join(', ')}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        {formatCurrency(sale.products[0]?.price || 0)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                        {formatCurrency(sale.total)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
