/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import {
  Factory,
  CheckCircle,
  Clock,
  Ban,
  Activity,
  History,
  TrendingUp,
  RotateCcw,
  Edit2
} from 'lucide-react';

export const ProductionLogView: React.FC = () => {
  const { productions, updateProductionStatus, updateProduction, deleteProduction, products } = useERP();
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  // Edit form states
  const [editingProduction, setEditingProduction] = useState<any | null>(null);
  const [editProductSelectedId, setEditProductSelectedId] = useState('');
  const [editQuantity, setEditQuantity] = useState(10);
  const [editResponsible, setEditResponsible] = useState('');
  const [editStatus, setEditStatus] = useState<'Em andamento' | 'Finalizado' | 'Cancelado'>('Em andamento');

  // Define recipes for finished products based on ID or fallback
  const getProductRecipe = (pId: string) => {
    const prod = products.find(p => p.id === pId);
    const prodNameLower = prod?.name.toLowerCase() || '';

    if (prodNameLower.includes('cuia')) {
      return [
        { productId: 'P-RAW-STEEL', name: 'Insumo Metálico Inox (m²)', baseQty: 0.25 },
        { productId: 'P-RAW-PAINT', name: 'Reagente Epóxi Acabamento (kg)', baseQty: 0.1 }
      ];
    } else if (prodNameLower.includes('térmica') || prodNameLower.includes('garrafa')) {
      return [
        { productId: 'P-RAW-STEEL', name: 'Insumo Metálico Inox (m²)', baseQty: 0.4 },
        { productId: 'P-RAW-PAINT', name: 'Reagente Epóxi Acabamento (kg)', baseQty: 0.15 }
      ];
    } else if (prodNameLower.includes('bomba')) {
      return [
        { productId: 'P-RAW-STEEL', name: 'Insumo Metálico Inox (m²)', baseQty: 0.1 }
      ];
    }

    // Default backup dynamic recipe using raw materials
    const rawMaterialsPool = products.filter(p => p.isRawMaterial);
    return rawMaterialsPool.slice(0, 2).map(rm => ({
      productId: rm.id,
      name: rm.name,
      baseQty: 0.2
    }));
  };

  const getEditCalculations = () => {
    if (!editingProduction || !editProductSelectedId) return null;

    const selectedProductObj = products.find(p => p.id === editProductSelectedId);
    if (!selectedProductObj) return null;

    const recipe = getProductRecipe(editProductSelectedId);
    let totalCost = 0;
    let sufficientStock = true;

    const itemsRequired = recipe.map(item => {
      const dbItem = products.find(p => p.id === item.productId);
      
      // Calculate original stock + current production's consumption of this material (since we'll revert/replace it)
      let stockAvailable = dbItem ? dbItem.stock : 0;
      if (editingProduction.status === 'Em andamento' || editingProduction.status === 'Finalizado') {
        const consumedByCurrent = editingProduction.rawMaterials.find((rm: any) => rm.productId === item.productId);
        if (consumedByCurrent) {
          stockAvailable += consumedByCurrent.quantityUsed;
        }
      }

      const qtyNeeded = item.baseQty * editQuantity;
      const hasEnough = stockAvailable >= qtyNeeded;
      if (!hasEnough && editStatus !== 'Cancelado') sufficientStock = false;

      const itemCost = dbItem ? dbItem.cost * qtyNeeded : 0;
      totalCost += itemCost;

      return {
        ...item,
        stockAvailable,
        qtyNeeded,
        hasEnough,
        cost: itemCost
      };
    });

    const totalRevenue = selectedProductObj.price * editQuantity;
    const estimatedProfit = totalRevenue - totalCost;
    const margin = totalCost > 0 ? (estimatedProfit / totalCost) * 100 : 0;
    const durationMinutes = Math.round(editQuantity * 8);

    return {
      itemsRequired,
      totalCost,
      estimatedProfit,
      margin,
      durationMinutes,
      sufficientStock,
      totalRevenue
    };
  };

  const startEditing = (prod: any) => {
    setEditingProduction(prod);
    setEditProductSelectedId(prod.productId);
    setEditQuantity(prod.quantity);
    setEditResponsible(prod.responsible);
    setEditStatus(prod.status);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduction || !editProductSelectedId) return;

    const selectedProductObj = products.find(p => p.id === editProductSelectedId);
    if (!selectedProductObj) return;

    const calcs = getEditCalculations();
    if (!calcs) return;

    if (!calcs.sufficientStock && editStatus !== 'Cancelado') {
      alert('Impossível salvar alteração! Estoque de matérias-primas insuficiente.');
      return;
    }

    const updatedProd = {
      ...editingProduction,
      productId: editProductSelectedId,
      productName: selectedProductObj.name,
      quantity: editQuantity,
      responsible: editResponsible,
      status: editStatus,
      rawMaterials: calcs.itemsRequired.map(i => ({
        productId: i.productId,
        name: i.name,
        quantityUsed: Number(i.qtyNeeded.toFixed(2))
      })),
      totalCost: Number(calcs.totalCost.toFixed(2)),
      estimatedProfit: Number(calcs.estimatedProfit.toFixed(2)),
      margin: Number(calcs.margin.toFixed(1)),
      durationMinutes: calcs.durationMinutes
    };

    updateProduction(editingProduction.id, updatedProd);
    setEditingProduction(null);
    alert('Ordem de serviço industrial atualizada com sucesso!');
  };

  // Formatter for currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Metrics calculations
  const activeBatchesCount = productions.filter(p => p.status === 'Em andamento').length;
  
  const totalManufacturedVolume = productions
    .filter(p => p.status === 'Finalizado')
    .reduce((sum, p) => sum + p.quantity, 0);

  const totalGlobalCosts = productions
    .filter(p => p.status !== 'Cancelado')
    .reduce((sum, p) => sum + p.totalCost, 0);

  return (
    <div className="space-y-8 animate-fadeIn text-slate-100">
      
      {/* HEADER SECTION */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Células de Produção Industrial</h1>
        <p className="text-xs text-emerald-400/80 font-medium">Históricos de fabricação, rendimento por insumo biológico e status de O.S.</p>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* Card 1: Lotes Ativos */}
        <div className="bg-[#051713] border border-[#0b2d25] p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Lotes Ativos em Processamento</span>
            <Activity className="w-5 h-5 text-[#00df89]" />
          </div>
          <h3 className="text-2xl font-black text-white font-mono">{activeBatchesCount} <span className="text-xs text-slate-500 font-semibold font-sans">Campanhas</span></h3>
          <p className="text-[10px] text-slate-500 uppercase font-bold mt-1">Lotes fabris rodando agora</p>
        </div>

        {/* Card 2: Volume Consolidado */}
        <div className="bg-[#051713] border border-[#0b2d25] p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Volume Manufaturado Consolidado</span>
            <Factory className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className="text-2xl font-black text-white font-mono">{totalManufacturedVolume} <span className="text-xs text-slate-500 font-semibold font-sans">un / L / kg</span></h3>
          <p className="text-[10px] text-slate-500 uppercase font-bold mt-1">Itens finalizados e estocados</p>
        </div>

        {/* Card 3: Custos Indiretos */}
        <div className="bg-[#051713] border border-[#0b2d25] p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Custos Globais Indiretos</span>
            <TrendingUp className="w-5 h-5 text-amber-500" />
          </div>
          <h3 className="text-2xl font-black text-white font-mono">{formatCurrency(totalGlobalCosts)}</h3>
          <p className="text-[10px] text-slate-500 uppercase font-bold mt-1">Insumo de matérias-primas</p>
        </div>
      </div>

      {/* INDUSTRIAL JOURNAL TABLE */}
      <div className="bg-[#051713] border border-[#0b2d25] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Diário de Controle Industrial</h3>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">Rastreamento de lotes biológicos e ordens de fabricação</p>
            </div>
          </div>
        </div>

        <div className="border border-[#0b2c23] rounded-xl overflow-hidden bg-[#03100c]/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#03100c] border-b border-[#0b2c23] text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">LOTE ID</th>
                  <th className="py-3.5 px-4">DATA MANUFATURA</th>
                  <th className="py-3.5 px-4">INSUMO PRODUZIDO</th>
                  <th className="py-3.5 px-4 text-center">FISIOLOGIA / STATUS</th>
                  <th className="py-3.5 px-4 text-center">VOLUME RENDERIZADO</th>
                  <th className="py-3.5 px-4 text-center">CUSTO MATÉRIA-PRIMA</th>
                  <th className="py-3.5 px-4">RESPONSÁVEL TÉCNICO</th>
                  <th className="py-3.5 px-4 text-right">AÇÕES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0b2c23] text-xs">
                {productions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500 font-mono text-[10px] uppercase tracking-wider">
                      Nenhuma campanha fabril registrada. Use o módulo Produção Inteligente para iniciar.
                    </td>
                  </tr>
                ) : (
                  [...productions].reverse().map((prod) => {
                    return (
                      <tr key={prod.id} className="hover:bg-[#051c17] text-slate-300 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">{prod.id}</td>
                        <td className="py-3.5 px-4">
                          {new Date(prod.createdAt).toLocaleDateString('pt-BR')} - {new Date(prod.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-white">{prod.productName}</td>
                        <td className="py-3.5 px-4 text-center">
                          {prod.status === 'Finalizado' ? (
                            <span className="bg-[#0f241a] text-emerald-400 border border-emerald-900/30 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase inline-flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> Finalizado
                            </span>
                          ) : prod.status === 'Cancelado' ? (
                            <span className="bg-rose-950/40 text-rose-400 border border-rose-900/30 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase inline-flex items-center gap-1">
                              <Ban className="w-3 h-3" /> Cancelado
                            </span>
                          ) : (
                            <span className="bg-amber-950/40 text-amber-400 border border-amber-900/30 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase inline-flex items-center gap-1 animate-pulse">
                              <Clock className="w-3 h-3 text-amber-400" /> Em Curso
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold">
                          {prod.quantity} un
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono text-slate-400">
                          {formatCurrency(prod.totalCost)}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-white">{prod.responsible}</td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2.5">
                            <button
                              onClick={() => startEditing(prod)}
                              className="p-1.5 bg-[#03100c] hover:bg-[#06241c] text-slate-400 hover:text-[#00df89] rounded-lg border border-[#0b2d25] hover:border-[#00df89]/30 transition-all cursor-pointer"
                              title="Editar O.S."
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {prod.status === 'Em andamento' ? (
                              <>
                                <button
                                  onClick={() => {
                                    updateProductionStatus(prod.id, 'Cancelado');
                                    alert('Ordem de serviço industrial cancelada!');
                                  }}
                                  className="px-2 py-1 bg-[#1f0b0b] hover:bg-rose-950/60 border border-[#441818] rounded-lg text-rose-400 font-bold text-[10px] uppercase transition-all cursor-pointer"
                                >
                                  Cancelar
                                </button>
                                <button
                                  onClick={() => {
                                    updateProductionStatus(prod.id, 'Finalizado');
                                    alert('Campanha industrial finalizada! Lotes de produtos acabados foram adicionados ao estoque.');
                                  }}
                                  className="px-2 py-1 bg-[#06241c] hover:bg-[#0a352a] border border-[#0d4738] rounded-lg text-[#00df89] font-bold text-[10px] uppercase transition-all cursor-pointer"
                                >
                                  Finalizar
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => setDeleteTarget(prod)}
                                className="text-slate-600 hover:text-rose-400 p-1.5 rounded-lg hover:bg-[#1f0b0b]/30 transition-all cursor-pointer"
                                title="Remover histórico"
                              >
                                ✕
                              </button>
                            )}
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
      {/* CUSTOM DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-rose-500/20 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-6 space-y-4">
              <div className="text-center space-y-2">
                <span className="text-rose-400 text-xs font-bold uppercase tracking-widest block">Excluir Registro</span>
                <p className="text-sm font-bold text-white">Deletar do histórico o lote "{deleteTarget.id}"?</p>
                <p className="text-[10px] text-slate-400 leading-relaxed">Esta ação não pode ser desfeita e removerá este registro do histórico de controle industrial.</p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold border border-slate-800 cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteProduction(deleteTarget.id);
                    setDeleteTarget(null);
                  }}
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Confirmar Exclusão
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PRODUCTION MODAL */}
      {editingProduction && (() => {
        const calcs = getEditCalculations();
        const finishedProductsList = products.filter(p => !p.isRawMaterial);

        return (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-[#041611] border border-emerald-500/20 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="p-6 border-b border-[#0b2c23] flex items-center justify-between">
                <div>
                  <span className="text-[#00df89] text-[10px] font-mono uppercase tracking-widest block font-bold">Controle Industrial</span>
                  <h3 className="text-md font-bold text-white">Editar Ordem de Serviço {editingProduction.id}</h3>
                </div>
                <button
                  onClick={() => setEditingProduction(null)}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Form Content (scrollable if too large) */}
              <form onSubmit={handleSaveEdit} className="overflow-y-auto custom-scrollbar flex-1 p-6 space-y-5">
                {/* Product Select */}
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Produto Fabricado</label>
                  <select
                    value={editProductSelectedId}
                    onChange={(e) => setEditProductSelectedId(e.target.value)}
                    className="w-full bg-[#03100c] border border-[#0b2d25] rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-[#00df89] cursor-pointer"
                  >
                    {finishedProductsList.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Estoque atual: {p.stock} un)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Grid for Quantity and Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Quantity */}
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Volume Produzido</label>
                    <input
                      type="number"
                      min={1}
                      value={editQuantity}
                      onChange={(e) => setEditQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-full bg-[#03100c] border border-[#0b2d25] rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-[#00df89]"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Status do Lote</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as any)}
                      className="w-full bg-[#03100c] border border-[#0b2d25] rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-[#00df89] cursor-pointer"
                    >
                      <option value="Em andamento">Em andamento</option>
                      <option value="Finalizado">Finalizado</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  </div>
                </div>

                {/* Responsible */}
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Responsável Técnico</label>
                  <input
                    type="text"
                    value={editResponsible}
                    onChange={(e) => setEditResponsible(e.target.value)}
                    placeholder="Nome do responsável"
                    className="w-full bg-[#03100c] border border-[#0b2d25] rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-[#00df89]"
                    required
                  />
                </div>

                {/* Live Recipe Consumption */}
                {calcs && (
                  <div className="bg-[#03100c] border border-[#0b2d25] rounded-2xl p-4.5 space-y-3">
                    <div className="flex items-center justify-between border-b border-[#0b2c23] pb-2">
                      <span className="text-[10px] font-bold text-[#00df89] uppercase tracking-widest">Insumos Industriais Requeridos</span>
                      <span className="text-[9px] text-slate-400 font-mono">MRP Simulado</span>
                    </div>

                    <div className="space-y-2">
                      {calcs.itemsRequired.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <div className="space-y-0.5">
                            <span className="text-slate-300 font-medium block">{item.name}</span>
                            <span className="text-[10px] text-slate-500 block">
                              Disponível: {item.stockAvailable.toFixed(2)} (necessário: {item.qtyNeeded.toFixed(2)})
                            </span>
                          </div>
                          <span className={`font-mono font-bold text-[11px] ${item.hasEnough ? 'text-[#00df89]' : 'text-rose-400'}`}>
                            {item.hasEnough ? '✓ Estoque OK' : '⚠ Estoque Insuficiente'}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Financial Projection preview */}
                    <div className="pt-2 border-t border-[#0b2c23]/40 grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Custo Total de Produção</span>
                        <span className="text-white font-mono font-bold">{formatCurrency(calcs.totalCost)}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Lucro Estimado</span>
                        <span className="text-[#00df89] font-mono font-bold">{formatCurrency(calcs.estimatedProfit)} ({calcs.margin.toFixed(1)}%)</span>
                      </div>
                    </div>

                    {/* Low stock warning */}
                    {!calcs.sufficientStock && editStatus !== 'Cancelado' && (
                      <div className="bg-rose-950/20 border border-rose-900/30 rounded-xl p-2.5 text-[10px] text-rose-400 leading-relaxed">
                        ⚠️ Atenção: Há insuficiência de matéria-prima no estoque para a quantidade simulada.
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#0b2c23]/30">
                  <button
                    type="button"
                    onClick={() => setEditingProduction(null)}
                    className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold border border-slate-800 cursor-pointer transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
