/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useERP } from '../context/ERPContext';
import { Product } from '../types';
import {
  Play,
  Sparkles,
  Clock,
  Layers,
  Scale
} from 'lucide-react';

export const ProductionView: React.FC = () => {
  const {
    products,
    addProduction,
    currentUser
  } = useERP();

  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(10);
  const [responsible, setResponsible] = useState(currentUser?.name || 'Operador Master');

  // Form selections and calculations state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Finished products only (which can be manufactured)
  const finishedProducts = products.filter(p => !p.isRawMaterial);

  // Raw materials only (for recipe component)
  const rawMaterialsPool = products.filter(p => p.isRawMaterial);

  // Handle product select
  useEffect(() => {
    if (productId) {
      const prod = products.find(p => p.id === productId);
      setSelectedProduct(prod || null);
    } else {
      setSelectedProduct(null);
    }
  }, [productId, products]);

  // Define recipes for finished products based on ID or fallback
  const getProductRecipe = (pId: string) => {
    // If the product is Cuia, Bomba or Termica, or a custom registered finished product
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
    return rawMaterialsPool.slice(0, 2).map(rm => ({
      productId: rm.id,
      name: rm.name,
      baseQty: 0.2
    }));
  };

  const getCalculations = () => {
    if (!selectedProduct) return null;

    const recipe = getProductRecipe(selectedProduct.id);
    let totalCost = 0;
    let sufficientStock = true;
    const itemsRequired = recipe.map(item => {
      const dbItem = products.find(p => p.id === item.productId);
      const stockAvailable = dbItem ? dbItem.stock : 0;
      const qtyNeeded = item.baseQty * quantity;
      const hasEnough = stockAvailable >= qtyNeeded;
      if (!hasEnough) sufficientStock = false;

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

    const totalRevenue = selectedProduct.price * quantity;
    const estimatedProfit = totalRevenue - totalCost;
    const margin = totalCost > 0 ? (estimatedProfit / totalCost) * 100 : 0;
    const durationMinutes = Math.round(quantity * 8);

    // Dynamic intelligent advisor recommendations
    let recommendation = 'A ordem de produção atende os requisitos mínimos de rentabilidade.';
    let recommendationSeverity: 'info' | 'success' | 'warning' = 'info';

    if (!sufficientStock) {
      recommendation = '⚠️ Matéria-prima INSUFICIENTE no estoque. Reabasteça antes de iniciar o lote.';
      recommendationSeverity = 'warning';
    } else if (margin < 50) {
      recommendation = '⚠️ Atenção: A margem de lucro deste lote é baixa (menos de 50%). Considere reajustar o preço de venda.';
      recommendationSeverity = 'warning';
    } else if (margin >= 120) {
      recommendation = '🌟 Alta Rentabilidade! A receita prevista supera amplamente o custo fabril direto.';
      recommendationSeverity = 'success';
    }

    return {
      itemsRequired,
      totalCost,
      estimatedProfit,
      margin,
      durationMinutes,
      sufficientStock,
      recommendation,
      recommendationSeverity,
      totalRevenue
    };
  };

  const calcs = getCalculations();

  const handleStartProduction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !calcs) return;

    if (!calcs.sufficientStock) {
      alert('Impossível iniciar produção! Estoque de matérias-primas insuficiente.');
      return;
    }

    addProduction({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantity,
      rawMaterials: calcs.itemsRequired.map(i => ({
        productId: i.productId,
        name: i.name,
        quantityUsed: Number(i.qtyNeeded.toFixed(2))
      })),
      totalCost: Number(calcs.totalCost.toFixed(2)),
      estimatedProfit: Number(calcs.estimatedProfit.toFixed(2)),
      margin: Number(calcs.margin.toFixed(1)),
      durationMinutes: calcs.durationMinutes,
      responsible,
      status: 'Em andamento'
    });

    // Reset inputs
    setProductId('');
    setQuantity(10);
    alert('Ordem de serviço industrial iniciada! Matérias-primas foram debitadas do estoque.');
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-8 animate-fadeIn text-slate-100">
      
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Produção Inteligente</h1>
        <p className="text-xs text-emerald-400/80 font-medium font-mono uppercase tracking-wider">
          Mapeamento automatizado de MRP, consumo físico de receitas e simulação de rentabilidade industrial.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT PANEL: LAUNCH NEW PRODUCTION (5/12) */}
        <div className="lg:col-span-5">
          <form onSubmit={handleStartProduction} className="bg-[#051713] border border-[#0b2d25] rounded-2xl p-6 space-y-5 h-full flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest pb-2 border-b border-[#0b2c23] flex items-center gap-2">
                <Play className="w-4 h-4 text-[#00df89]" />
                <span>Configurar Produção</span>
              </h3>

              {/* Product select */}
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Produto para Fabricar</label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="w-full bg-[#03100c] border border-[#0b2d25] rounded-xl py-2 px-3 text-xs font-bold text-slate-300 focus:outline-none cursor-pointer"
                  required
                >
                  <option value="">— Selecione o lote de acabado —</option>
                  {finishedProducts.map(p => (
                    <option key={p.id} value={p.id}>{p.name.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              {selectedProduct && (
                <>
                  {/* Quantity and supervisor */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Quantidade Meta</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                        className="w-full bg-[#03100c] border border-[#0b2d25] rounded-xl py-2 px-3 text-xs text-white font-mono focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Responsável Técnico</label>
                      <input
                        type="text"
                        required
                        value={responsible}
                        onChange={(e) => setResponsible(e.target.value)}
                        className="w-full bg-[#03100c] border border-[#0b2d25] rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Calculations & Smart Advisor */}
                  {calcs && (
                    <div className="space-y-3.5 bg-[#03100c]/40 p-4 border border-[#0b2c23]/80 rounded-2xl">
                      <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>Receita MRP</span>
                        <span>Necessário / Disponível</span>
                      </div>
                      
                      <div className="space-y-2 max-h-[140px] overflow-y-auto custom-scrollbar">
                        {calcs.itemsRequired.map((rm) => (
                          <div key={rm.productId} className="flex items-center justify-between text-xs font-medium">
                            <span className="text-slate-300 truncate max-w-[170px]">{rm.name}</span>
                            <span className={`font-mono ${rm.hasEnough ? 'text-slate-400' : 'text-rose-400 font-bold'}`}>
                              {rm.qtyNeeded.toFixed(1)} / {rm.stockAvailable.toFixed(1)} un
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Smart Advisor Badge */}
                      <div className={`p-3 rounded-xl border text-xs flex gap-2 ${
                        calcs.recommendationSeverity === 'warning'
                          ? 'bg-rose-500/5 border-rose-500/10 text-rose-300'
                          : calcs.recommendationSeverity === 'success'
                            ? 'bg-emerald-500/5 border-emerald-500/10 text-[#00df89]'
                            : 'bg-[#03100c] border-[#0b2d25] text-slate-400'
                      }`}>
                        <Sparkles className="w-4 h-4 text-[#00df89] shrink-0 mt-0.5" />
                        <p className="leading-tight text-[10px] font-semibold">{calcs.recommendation}</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Calculations metrics bottom card */}
            {selectedProduct && calcs && (
              <div className="space-y-3 pt-4 border-t border-[#0b2c23]">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2 bg-[#03100c] rounded-xl border border-[#0b2d25]/60">
                    <span className="text-[8px] text-slate-500 uppercase block font-bold tracking-widest">Custo de Fábrica</span>
                    <span className="font-bold text-white font-mono text-sm">{formatCurrency(calcs.totalCost)}</span>
                  </div>
                  <div className="p-2 bg-[#03100c] rounded-xl border border-[#0b2d25]/60">
                    <span className="text-[8px] text-slate-500 uppercase block font-bold tracking-widest">Lucro Estimado</span>
                    <span className="font-bold text-[#00df89] font-mono text-sm">+{formatCurrency(calcs.estimatedProfit)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2 bg-[#03100c] rounded-xl border border-[#0b2d25]/60">
                    <span className="text-[8px] text-slate-500 uppercase block font-bold tracking-widest">Margem Operacional</span>
                    <span className="font-bold text-white font-mono">{calcs.margin.toFixed(1)}%</span>
                  </div>
                  <div className="p-2 bg-[#03100c] rounded-xl border border-[#0b2d25]/60 flex items-center justify-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span className="font-mono text-xs text-slate-300">{calcs.durationMinutes} min</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!calcs.sufficientStock}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                    calcs.sufficientStock
                      ? 'bg-[#00df89] hover:bg-[#00b36e] text-slate-950 shadow-[#00df89]/10'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/40'
                  }`}
                >
                  <Play className="w-4 h-4" />
                  <span>Iniciar Ordem de Serviço</span>
                </button>
              </div>
            )}
          </form>
        </div>

        {/* RIGHT PANEL: REAL-TIME STOCK VERIFICATION (7/12) */}
        <div className="lg:col-span-7 bg-[#051713] border border-[#0b2d25] rounded-2xl p-6">
          <h3 className="text-xs font-bold text-white uppercase tracking-widest pb-2 border-b border-[#0b2c23] mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Verificação em Tempo Real do Estoque de Insumos</span>
          </h3>

          <p className="text-xs text-slate-400 leading-relaxed mb-5">
            Abaixo estão as matérias-primas cadastradas no ERP. O sistema de MRP debita as quantidades calculadas de forma instantânea assim que uma nova ordem de produção é iniciada.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
            {rawMaterialsPool.map((rm) => {
              const isLow = rm.stock <= rm.minQuantity;

              return (
                <div
                  key={rm.id}
                  className="p-4 bg-[#03100c] border border-[#0b2d25] rounded-xl flex items-center justify-between hover:border-[#0b3c2e] transition-colors"
                >
                  <div className="space-y-1 max-w-[170px]">
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block">{rm.barcode}</span>
                    <span className="text-xs font-bold text-white block truncate">{rm.name}</span>
                    <span className="text-[9px] text-slate-500 font-semibold block flex items-center gap-1">
                      <Scale className="w-3 h-3" /> Peso Unitário: {rm.weight} kg
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black font-mono block text-white">{rm.stock} un</span>
                    {isLow ? (
                      <span className="text-[8px] font-bold uppercase tracking-wider text-rose-400 bg-rose-950/40 border border-rose-900/40 px-1.5 py-0.5 rounded-md mt-1 inline-block">
                        ABAIXO DO MÍNIMO
                      </span>
                    ) : (
                      <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-400 bg-[#0f241a] border border-emerald-900/30 px-1.5 py-0.5 rounded-md mt-1 inline-block">
                        NORMAL
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {rawMaterialsPool.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500 font-mono text-[10px] uppercase tracking-wider">
                Nenhum insumo de matéria-prima cadastrado.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
