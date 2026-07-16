/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { Product, getProductUnitSuffix } from '../types';
import {
  Search,
  Plus,
  Minus,
  AlertTriangle,
  Scale,
  Barcode,
  Boxes,
  RefreshCw,
  FolderOpen,
  CheckCircle
} from 'lucide-react';

export const StockView: React.FC = () => {
  const { products, categories, adjustStock } = useERP();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');

  // Local state for instant custom adjust inputs
  const [adjustAmount, setAdjustAmount] = useState<{ [productId: string]: number }>({});

  const handleAdjustClick = (productId: string, isAdd: boolean) => {
    const amount = adjustAmount[productId] || 1;
    adjustStock(productId, amount, isAdd);
  };

  const handleInputChange = (productId: string, val: number) => {
    setAdjustAmount(prev => ({
      ...prev,
      [productId]: Math.max(1, val)
    }));
  };

  // Filtered lists
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search);
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    
    let matchesStock = true;
    if (stockFilter === 'low') {
      matchesStock = p.stock <= p.minQuantity && p.stock > 0;
    } else if (stockFilter === 'out') {
      matchesStock = p.stock === 0;
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  const lowStockCount = products.filter(p => p.stock <= p.minQuantity && p.stock > 0).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;

  return (
    <div className="space-y-8 animate-fadeIn text-slate-100">
      
      {/* HEADER SECTION */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Painel de Estoque & Insumos</h1>
        <p className="text-xs text-emerald-400/80 font-medium">Controle de volumes físicos, reabastecimentos, ajustes rápidos e alertas de níveis críticos.</p>
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-[#051713] border border-[#0b2d25] p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total de Itens</span>
            <Boxes className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className="text-2xl font-bold text-white font-mono">{products.length}</h3>
          <p className="text-[10px] text-slate-500 uppercase font-semibold mt-1">Produtos cadastrados</p>
        </div>

        <div className="bg-[#051713] border border-[#0b2d25] p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Estoque Mínimo</span>
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <h3 className="text-2xl font-bold text-amber-400 font-mono">{lowStockCount}</h3>
          <p className="text-[10px] text-slate-500 uppercase font-semibold mt-1">Com volume em alerta</p>
        </div>

        <div className="bg-[#051713] border border-[#0b2d25] p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-rose-500">Zerados / Esgotados</span>
            <AlertTriangle className="w-5 h-5 text-rose-500" />
          </div>
          <h3 className="text-2xl font-bold text-rose-500 font-mono">{outOfStockCount}</h3>
          <p className="text-[10px] text-slate-500 uppercase font-semibold mt-1">Indisponíveis na fábrica</p>
        </div>
      </div>

      {/* CRITICAL STOCK ALERTS BOX */}
      {(lowStockCount > 0 || outOfStockCount > 0) && (
        <div className="bg-[#1f0b0b] border border-[#441818] rounded-2xl p-5 flex gap-4 items-start">
          <AlertTriangle className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            <h4 className="text-xs font-bold text-rose-400 uppercase tracking-widest">Inconformidades Críticas Detectadas</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Existem {lowStockCount + outOfStockCount} insumos essenciais abaixo do limite mínimo recomendado ou zerados. Isso pode interromper a cadeia de produção inteligente.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {products
                .filter(p => p.stock <= p.minQuantity)
                .slice(0, 5)
                .map(p => (
                  <span
                    key={p.id}
                    className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      p.stock === 0 ? 'bg-rose-950/80 text-rose-400 border border-rose-900/40' : 'bg-amber-950/80 text-amber-400 border border-amber-900/40'
                    }`}
                  >
                    {p.name} ({p.stock} {getProductUnitSuffix(p.unit)})
                  </span>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* FILTER AND CONTROLS */}
      <div className="bg-[#051713] border border-[#0b2d25] rounded-2xl p-5 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          
          {/* SEARCH BAR */}
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#03100c] border border-[#0b2d25] rounded-xl py-2 pl-9 pr-4 text-xs font-medium text-white focus:outline-none focus:border-emerald-500/40"
              placeholder="Pesquisar por nome do produto ou código SKU..."
            />
          </div>

          {/* DROP DOWNS */}
          <div className="flex flex-wrap gap-3 w-full lg:w-auto items-center">
            
            {/* Category filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <FolderOpen className="w-3.5 h-3.5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-[#03100c] border border-[#0b2d25] rounded-xl py-1.5 px-3 text-xs text-slate-300 font-semibold focus:outline-none"
              >
                <option value="all">TODAS CATEGORIAS</option>
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name.toUpperCase()}</option>
                ))}
              </select>
            </div>

            {/* Volume filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <RefreshCw className="w-3.5 h-3.5" />
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as any)}
                className="bg-[#03100c] border border-[#0b2d25] rounded-xl py-1.5 px-3 text-xs text-slate-300 font-semibold focus:outline-none"
              >
                <option value="all">SITUAÇÃO (TODAS)</option>
                <option value="low">SÓ ESTOQUE CRÍTICO</option>
                <option value="out">SÓ PRODUTO ESGOTADO</option>
              </select>
            </div>
          </div>
        </div>

        {/* INVENTORY TABLE */}
        <div className="border border-[#0b2c23] rounded-xl overflow-hidden bg-[#03100c]/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#03100c] border-b border-[#0b2c23] text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">ITEM SKU</th>
                  <th className="py-3.5 px-4">PRODUTO / INSUMO</th>
                  <th className="py-3.5 px-4">CATEGORIA</th>
                  <th className="py-3.5 px-4">TIPO</th>
                  <th className="py-3.5 px-4 text-center">NÍVEL ATUAL</th>
                  <th className="py-3.5 px-4 text-center">SITUAÇÃO</th>
                  <th className="py-3.5 px-4 text-right">AJUSTE RÁPIDO DE VOLUME</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0b2c23] text-xs">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 font-mono text-[10px] uppercase tracking-wider">
                      Nenhum item do estoque atende a esses filtros de pesquisa.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const isLow = p.stock <= p.minQuantity && p.stock > 0;
                    const isOut = p.stock === 0;

                    return (
                      <tr key={p.id} className="hover:bg-[#051c17] text-slate-300 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold">{p.barcode}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-white">{p.name}</div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <Scale className="w-3 h-3" /> {p.weight} kg
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-400">{p.category}</td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            p.isRawMaterial ? 'bg-[#0f241a] text-emerald-400 border border-emerald-900/30' : 'bg-blue-950/40 text-blue-400 border border-blue-900/30'
                          }`}>
                            {p.isRawMaterial ? 'M-Prima' : p.productType === 'both' ? 'Ambos' : 'Produto Final'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-sm text-white">
                          {p.stock} {getProductUnitSuffix(p.unit)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {isOut ? (
                            <span className="bg-rose-950/40 text-rose-400 border border-rose-900/30 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                              ESGOTADO
                            </span>
                          ) : isLow ? (
                            <span className="bg-amber-950/40 text-amber-400 border border-amber-900/30 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                              ABAIXO MÍN
                            </span>
                          ) : (
                            <span className="bg-emerald-950/40 text-emerald-400 border border-emerald-900/30 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                              NORMAL
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <input
                              type="number"
                              min="1"
                              value={adjustAmount[p.id] || 1}
                              onChange={(e) => handleInputChange(p.id, Number(e.target.value))}
                              className="w-12 bg-[#03100c] border border-[#0b2d25] rounded-xl py-1 text-center text-xs text-white font-mono focus:outline-none"
                            />
                            <button
                              onClick={() => handleAdjustClick(p.id, false)}
                              className="p-1.5 bg-[#1f0b0b] hover:bg-rose-950/60 border border-[#441818] rounded-xl text-rose-400 transition-all cursor-pointer"
                              title="Retirar do Estoque"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleAdjustClick(p.id, true)}
                              className="p-1.5 bg-[#06241c] hover:bg-[#0a352a] border border-[#0d4738] rounded-xl text-emerald-400 transition-all cursor-pointer"
                              title="Inserir no Estoque"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
