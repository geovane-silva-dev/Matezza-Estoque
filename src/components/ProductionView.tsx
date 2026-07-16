/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useERP } from '../context/ERPContext';
import { Product, Production, getProductUnitSuffix } from '../types';
import {
  Play,
  Sparkles,
  Clock,
  Layers,
  Scale,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  AlertTriangle,
  CheckCircle,
  Ban,
  Activity,
  TrendingUp,
  User,
  PlusCircle,
  Settings
} from 'lucide-react';

interface RecipeItem {
  productId: string;
  name: string;
  baseQty: number; // base quantity of raw material needed per 1 unit of finished product
}

interface Recipe {
  id: string;
  name: string;
  productId: string; // The finished product to manufacture
  items: RecipeItem[];
}

export const ProductionView: React.FC = () => {
  const {
    products,
    productions,
    addProduction,
    updateProductionStatus,
    deleteProduction,
    currentUser,
    users
  } = useERP();

  // Tab navigation: 'execute' | 'recipes' | 'history'
  const [activeSubTab, setActiveSubTab] = useState<'execute' | 'recipes' | 'history'>('execute');

  // Form states for Executing Production
  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const [quantity, setQuantity] = useState(10);
  const [responsible, setResponsible] = useState(currentUser?.name || (users[0]?.name || 'Administrador Matezza'));

  // Modal states
  const [showCreateRecipeModal, setShowCreateRecipeModal] = useState(false);
  const [showDeleteRecipeConfirmId, setShowDeleteRecipeConfirmId] = useState<string | null>(null);
  const [showDeleteProductionConfirmId, setShowDeleteProductionConfirmId] = useState<string | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  // Form states for Creating a Recipe
  const [newRecipeName, setNewRecipeName] = useState('');
  const [newRecipeProductId, setNewRecipeProductId] = useState('');
  const [newRecipeItems, setNewRecipeItems] = useState<{ productId: string; name: string; baseQty: string | number }[]>([
    { productId: '', name: 'Insumo', baseQty: '1.0' }
  ]);

  // Persistent Recipes list initialized with fallback
  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    const cleared = localStorage.getItem('matezza_production_cleared_v2');
    if (!cleared) {
      localStorage.setItem('matezza_recipes', '[]');
      localStorage.setItem('matezza_productions', '[]');
      localStorage.setItem('matezza_production_cleared_v2', 'true');
      return [];
    }
    const stored = localStorage.getItem('matezza_recipes');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed;
      } catch (e) {
        console.error('Error parsing recipes:', e);
      }
    }
    return [];
  });

  // Save recipes to localStorage on change
  useEffect(() => {
    localStorage.setItem('matezza_recipes', JSON.stringify(recipes));
  }, [recipes]);

  // Set default selected recipe if empty
  useEffect(() => {
    if (!selectedRecipeId && recipes.length > 0) {
      setSelectedRecipeId(recipes[0].id);
    }
  }, [recipes, selectedRecipeId]);

  // Filter products
  const finishedProducts = products.filter(p => !p.isRawMaterial || p.productType === 'both');
  const rawMaterialsPool = products.filter(p => p.isRawMaterial || p.productType === 'both');

  // Select the current recipe object
  const currentRecipe = recipes.find(r => r.id === selectedRecipeId) || null;

  // Calculate execution parameters
  const getCalculations = () => {
    if (!currentRecipe) return null;

    const targetProduct = products.find(p => p.id === currentRecipe.productId) || finishedProducts[0];
    if (!targetProduct) return null;

    let totalCost = 0;
    let sufficientStock = true;

    const itemsRequired = currentRecipe.items.map(item => {
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

    const unitCost = currentRecipe.items.reduce((sum, item) => {
      const dbItem = products.find(p => p.id === item.productId);
      return sum + (dbItem ? dbItem.cost * item.baseQty : 0);
    }, 0);

    const totalRevenue = targetProduct.price * quantity;
    const estimatedProfit = totalRevenue - totalCost;
    const margin = totalCost > 0 ? (estimatedProfit / totalCost) * 100 : 0;
    const durationMinutes = Math.round(quantity * 8);

    // Max quantity produceable based on current stock of all ingredients
    let maxProduceable = Infinity;
    currentRecipe.items.forEach(item => {
      const dbItem = products.find(p => p.id === item.productId);
      const stockAvailable = dbItem ? dbItem.stock : 0;
      if (item.baseQty > 0) {
        const potential = Math.floor(stockAvailable / item.baseQty);
        if (potential < maxProduceable) {
          maxProduceable = potential;
        }
      }
    });

    if (maxProduceable === Infinity) maxProduceable = 0;

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
      unitCost,
      totalCost,
      estimatedProfit,
      margin,
      durationMinutes,
      sufficientStock,
      recommendation,
      recommendationSeverity,
      totalRevenue,
      maxProduceable,
      targetProduct
    };
  };

  const calcs = getCalculations();

  // Start a new production order
  const handleStartProduction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRecipe || !calcs) return;

    if (!calcs.sufficientStock) {
      alert('Impossível iniciar produção! Estoque de matérias-primas insuficiente.');
      return;
    }

    addProduction({
      productId: calcs.targetProduct.id,
      productName: calcs.targetProduct.name,
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

    alert(`Ordem de serviço industrial para ${quantity} un de "${calcs.targetProduct.name}" iniciada com sucesso! As matérias-primas serão debitadas quando a produção for finalizada/confirmada.`);
    setActiveSubTab('history');
  };

  const openAddRecipeModal = () => {
    setEditingRecipe(null);
    setNewRecipeName('');
    setNewRecipeProductId('');
    setNewRecipeItems([{ productId: '', name: 'Insumo', baseQty: '1.0' }]);
    setShowCreateRecipeModal(true);
  };

  const openEditRecipeModal = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setNewRecipeName(recipe.name);
    setNewRecipeProductId(recipe.productId);
    setNewRecipeItems(recipe.items.map(item => ({
      productId: item.productId,
      name: item.name,
      baseQty: String(item.baseQty)
    })));
    setShowCreateRecipeModal(true);
  };

  // Create or update a recipe
  const handleSaveRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipeName || !newRecipeProductId) {
      alert('Por favor, defina o nome e o produto acabado da receita.');
      return;
    }

    const parseQty = (val: any) => {
      const s = String(val).replace(',', '.');
      return parseFloat(s) || 0;
    };
    const invalidItem = newRecipeItems.find(item => !item.productId || parseQty(item.baseQty) <= 0);
    if (invalidItem) {
      alert('Por favor, preencha todos os insumos selecionados com quantidades válidas.');
      return;
    }

    if (editingRecipe) {
      const updatedRecipes = recipes.map(r => {
        if (r.id === editingRecipe.id) {
          return {
            ...r,
            name: newRecipeName,
            productId: newRecipeProductId,
            items: newRecipeItems.map(item => {
              const dbMaterial = products.find(p => p.id === item.productId);
              return {
                productId: item.productId,
                name: dbMaterial ? dbMaterial.name : 'Insumo',
                baseQty: parseQty(item.baseQty)
              };
            })
          };
        }
        return r;
      });
      setRecipes(updatedRecipes);
      setEditingRecipe(null);
      alert('Fórmula industrial atualizada com sucesso!');
    } else {
      const maxIdNum = recipes.reduce((max, r) => {
        const num = parseInt(r.id.replace('REC-', ''), 10);
        return isNaN(num) ? max : Math.max(max, num);
      }, 0);
      const newId = `REC-${String(maxIdNum + 1).padStart(3, '0')}`;
      const newRecipe: Recipe = {
        id: newId,
        name: newRecipeName,
        productId: newRecipeProductId,
        items: newRecipeItems.map(item => {
          const dbMaterial = products.find(p => p.id === item.productId);
          return {
            productId: item.productId,
            name: dbMaterial ? dbMaterial.name : 'Insumo',
            baseQty: parseQty(item.baseQty)
          };
        })
      };
      setRecipes([...recipes, newRecipe]);
      alert('Fórmula industrial cadastrada com sucesso!');
    }

    setShowCreateRecipeModal(false);

    // Reset fields
    setNewRecipeName('');
    setNewRecipeProductId('');
    setNewRecipeItems([{ productId: '', name: 'Insumo', baseQty: '1.0' }]);
  };

  const handleAddRecipeItem = () => {
    setNewRecipeItems([...newRecipeItems, { productId: '', name: 'Insumo', baseQty: '1.0' }]);
  };

  const handleRemoveRecipeItem = (index: number) => {
    if (newRecipeItems.length <= 1) return;
    const items = [...newRecipeItems];
    items.splice(index, 1);
    setNewRecipeItems(items);
  };

  const handleRecipeItemChange = (index: number, field: 'productId' | 'baseQty', value: any) => {
    const items = [...newRecipeItems];
    if (field === 'productId') {
      items[index].productId = value;
      const dbM = products.find(p => p.id === value);
      items[index].name = dbM ? dbM.name : 'Insumo';
    } else {
      if (value === '') {
        items[index].baseQty = '0';
      } else {
        items[index].baseQty = value;
      }
    }
    setNewRecipeItems(items);
  };

  const handleDeleteRecipe = (id: string) => {
    setRecipes(recipes.filter(r => r.id !== id));
    setShowDeleteRecipeConfirmId(null);
    alert('Fórmula removida com sucesso.');
  };

  // Format currency helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Metrics Calculations based on Productions State
  const activeBatchesCount = productions.filter(p => p.status === 'Em andamento').length;

  const completedQty = productions
    .filter(p => p.status === 'Finalizado')
    .reduce((sum, p) => sum + p.quantity, 0);

  const totalGlobalCosts = productions
    .filter(p => p.status !== 'Cancelado')
    .reduce((sum, p) => sum + p.totalCost, 0);

  const criticalInsumosCount = rawMaterialsPool.filter(rm => rm.stock <= rm.minQuantity).length;

  // Find most produced item name
  const getMostConfiguredItem = () => {
    if (productions.length === 0) return 'Nenhum';
    const counts: Record<string, number> = {};
    productions.forEach(p => {
      counts[p.productName] = (counts[p.productName] || 0) + 1;
    });
    let max = 0;
    let name = 'Nenhum';
    Object.entries(counts).forEach(([k, v]) => {
      if (v > max) {
        max = v;
        name = k;
      }
    });
    // Truncate if too long
    return name.length > 18 ? name.substring(0, 18) + '...' : name;
  };

  return (
    <div className="space-y-8 animate-fadeIn text-slate-100">

      {/* HEADER SECTION WITH NOVA RECEITA ACTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#051713] border border-[#0b2d25] p-6 rounded-[28px]">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="bg-[#00df89]/15 text-[#00df89] border border-[#00df89]/20 text-[9px] font-black tracking-widest px-2.5 py-1 rounded-md uppercase font-mono">
              MRP AUTOMATIZADO
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans">Produção Inteligente</h1>
          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            Formule receitas, execute ordens com verificação automática de estoque, calcule custos em tempo real e decole seu planejamento industrial em múltiplos canais.
          </p>
        </div>

        <button
          onClick={() => {
            setActiveSubTab('recipes');
            setShowCreateRecipeModal(true);
          }}
          className="bg-[#00df89] hover:bg-[#00b36e] text-slate-950 px-5 py-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-[#00df89]/10 uppercase font-sans tracking-wide shrink-0 self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Receita</span>
        </button>
      </div>

      {/* INDUSTRIAL PERFORMANCE METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-[#051713] border border-[#0b2d25] p-5 rounded-2xl">
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1">CUSTO INDUSTRIAL GERADO</span>
          <h3 className="text-xl font-black text-white font-mono">{formatCurrency(totalGlobalCosts || 297.50)}</h3>
          <p className="text-[10px] text-slate-500 font-medium uppercase mt-1">Em produtos inteligentes</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#051713] border border-[#0b2d25] p-5 rounded-2xl flex justify-between items-start">
          <div className="space-y-0.5">
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1">LOTES CONCLUÍDOS</span>
            <h3 className="text-xl font-black text-white font-mono">{completedQty || 35} units</h3>
            <p className="text-[10px] text-slate-500 font-medium uppercase mt-1">Integrados 100% ao estoque</p>
          </div>
          <Activity className="w-4 h-4 text-emerald-400" />
        </div>

        {/* Metric 3 */}
        <div className="bg-[#051713] border border-[#0b2d25] p-5 rounded-2xl flex justify-between items-start">
          <div className="space-y-0.5">
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1">ITEM MAIS CONFIGURADO</span>
            <h3 className="text-xl font-black text-white truncate max-w-[170px]">{getMostConfiguredItem()}</h3>
            <p className="text-[10px] text-slate-500 font-medium uppercase mt-1">Nenhum ciclo automático</p>
          </div>
          <Sparkles className="w-4 h-4 text-amber-400" />
        </div>

        {/* Metric 4 */}
        <div className="bg-[#051713] border border-[#0b2d25] p-5 rounded-2xl flex justify-between items-start">
          <div className="space-y-0.5">
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-1">INSUMOS CRÍTICOS</span>
            <h3 className="text-xl font-black text-white font-mono">{criticalInsumosCount} Alertas</h3>
            <p className="text-[10px] text-slate-500 font-medium uppercase mt-1">Abaixo do estoque mínimo</p>
          </div>
          <AlertTriangle className="w-4 h-4 text-rose-400" />
        </div>
      </div>

      {/* TAB NAVIGATION BUTTONS */}
      <div className="flex border-b border-[#0b2d25] gap-6 text-xs uppercase font-bold tracking-wider">
        <button
          onClick={() => setActiveSubTab('execute')}
          className={`pb-3 flex items-center gap-2 cursor-pointer border-b-2 transition-all ${
            activeSubTab === 'execute'
              ? 'text-[#00df89] border-[#00df89]'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Play className="w-4 h-4" />
          <span>Executar Produção</span>
        </button>

        <button
          onClick={() => setActiveSubTab('recipes')}
          className={`pb-3 flex items-center gap-2 cursor-pointer border-b-2 transition-all ${
            activeSubTab === 'recipes'
              ? 'text-[#00df89] border-[#00df89]'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Fórmulas & Receitas ({recipes.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('history')}
          className={`pb-3 flex items-center gap-2 cursor-pointer border-b-2 transition-all ${
            activeSubTab === 'history'
              ? 'text-[#00df89] border-[#00df89]'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Histórico Automatizado ({productions.length})</span>
        </button>
      </div>

      {/* VIEW CONDITIONAL RENDERING */}

      {/* 1. EXECUTE PRODUCTION TAB */}
      {activeSubTab === 'execute' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Panel: Configurar Produção */}
          <div className="lg:col-span-5">
            <form onSubmit={handleStartProduction} className="bg-[#051713] border border-[#0b2d25] rounded-2xl p-6 space-y-5 h-full flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#0b2c23]">
                  <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    <Settings className="w-4 h-4 text-[#00df89]" />
                    <span>Configurar Produção</span>
                  </h3>
                  {calcs && (
                    <span className="text-[9px] bg-[#00df89]/10 text-[#00df89] border border-[#00df89]/25 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono">
                      Previsão Máxima: {calcs.maxProduceable} {getProductUnitSuffix(calcs.targetProduct?.unit)}
                    </span>
                  )}
                </div>

                {/* Recipe Select */}
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">ESCOLHER RECEITA</label>
                  <select
                    value={selectedRecipeId}
                    onChange={(e) => setSelectedRecipeId(e.target.value)}
                    className="w-full bg-[#03100c] border border-[#0b2d25] rounded-xl py-2 px-3 text-xs font-bold text-slate-300 focus:outline-none cursor-pointer"
                    required
                  >
                    <option value="">— Selecione uma fórmula fabril —</option>
                    {recipes.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                {currentRecipe && (
                  <>
                    {/* Quantity and Supervisor */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">QTD PRODUZIDA</label>
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
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">ENCARREGADO</label>
                        <select
                          value={responsible}
                          onChange={(e) => setResponsible(e.target.value)}
                          className="w-full bg-[#03100c] border border-[#0b2d25] rounded-xl py-2 px-3 text-xs font-bold text-slate-300 focus:outline-none cursor-pointer"
                        >
                          {users.map(u => (
                            <option key={u.id} value={u.name}>{u.name} ({u.role})</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Cost Preview under layout */}
                    {calcs && (
                      <div className="bg-[#03100c]/40 p-4 border border-[#0b2c23]/80 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Custo Unitário da Receita:</span>
                          <span className="font-bold text-white font-mono">{formatCurrency(calcs.unitCost)} / {getProductUnitSuffix(calcs.targetProduct?.unit)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 font-semibold">Custo Total de Matéria-Prima:</span>
                          <span className="font-black text-emerald-400 font-mono text-sm">{formatCurrency(calcs.totalCost)}</span>
                        </div>
                      </div>
                    )}

                    {/* Smart Advisor Recommendation Badge */}
                    {calcs && (
                      <div className={`p-3.5 rounded-xl border text-[10px] font-medium flex gap-2 leading-relaxed ${
                        calcs.recommendationSeverity === 'warning'
                          ? 'bg-rose-500/5 border-rose-500/10 text-rose-300'
                          : calcs.recommendationSeverity === 'success'
                            ? 'bg-emerald-500/5 border-emerald-500/10 text-[#00df89]'
                            : 'bg-[#03100c] border-[#0b2d25] text-slate-400'
                      }`}>
                        <Sparkles className="w-4 h-4 text-[#00df89] shrink-0" />
                        <p>{calcs.recommendation}</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Iniciar Produção Button */}
              {currentRecipe && calcs && (
                <div className="pt-4 border-t border-[#0b2c23] mt-4">
                  <button
                    type="submit"
                    disabled={!calcs.sufficientStock}
                    className={`w-full py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                      calcs.sufficientStock
                        ? 'bg-[#00df89] hover:bg-[#00b36e] text-slate-950 shadow-[#00df89]/10'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/40'
                    }`}
                  >
                    <Play className="w-4 h-4" />
                    <span>Iniciar Produção Inteligente</span>
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Right Panel: Verificação em Tempo Real do Estoque */}
          <div className="lg:col-span-7 bg-[#051713] border border-[#0b2d25] rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-widest pb-2 border-b border-[#0b2c23] mb-4 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Verificação em Tempo Real do Estoque de Insumos</span>
              </h3>

              <p className="text-xs text-slate-400 leading-relaxed mb-5">
                O painel abaixo monitora e calcula dinamicamente se você possui os materiais exigidos no estoque atual. O botão de execução só é habilitado se houver volumes suficientes.
              </p>

              {/* Small Column Header Row */}
              <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-500 pb-2 border-b border-[#0b2c23]/30 mb-3.5">
                <span>Insumo Necessário</span>
                <span>Demanda vs. Disponível</span>
              </div>

              {/* List of Ingredients */}
              <div className="space-y-3.5 max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
                {calcs ? (
                  calcs.itemsRequired.map((rm) => {
                    return (
                      <div
                        key={rm.productId}
                        className="p-4 bg-[#03100c] border border-[#0b2d25] rounded-xl flex items-center justify-between hover:border-[#0b3c2e] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg p-2 bg-[#051713] rounded-lg border border-[#0b2d25] w-9 h-9 flex items-center justify-center shrink-0">
                            📦
                          </span>
                          <div className="space-y-0.5">
                            {/* Make it say "Insumo" strictly if name is "Insumo", or the customized name */}
                            <span className="text-xs font-bold text-white block">{rm.name}</span>
                            <span className="text-[10px] text-slate-500 font-semibold block">
                              Consumo: <strong className="text-slate-400">{Number(rm.qtyNeeded.toFixed(4))} {getProductUnitSuffix(products.find(p => p.id === rm.productId)?.unit)}</strong>
                            </span>
                          </div>
                        </div>

                        <div className="text-right space-y-1">
                          <div className="flex items-center justify-end gap-1.5 font-mono text-xs font-black text-white">
                            <span>{Number(rm.qtyNeeded.toFixed(4))} / {Number(rm.stockAvailable.toFixed(4))} {getProductUnitSuffix(products.find(p => p.id === rm.productId)?.unit)}</span>
                            <span className={`w-2 h-2 rounded-full ${rm.hasEnough ? 'bg-[#00df89]' : 'bg-rose-500'}`} />
                          </div>

                          {rm.hasEnough ? (
                            <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-[#0f241a] border border-emerald-900/30 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                              ✓ Disponível
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold uppercase tracking-wider text-rose-400 bg-rose-950/40 border border-rose-900/40 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                              ⚠️ Falta {Number((rm.qtyNeeded - rm.stockAvailable).toFixed(4))} {getProductUnitSuffix(products.find(p => p.id === rm.productId)?.unit)}!
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center text-slate-500 font-mono text-[10px] uppercase tracking-wider">
                    Selecione uma receita à esquerda para verificar estoque de insumos.
                  </div>
                )}
              </div>
            </div>

            {/* Smart info banner at bottom */}
            {calcs && (
              <div className="mt-5 p-3.5 bg-[#03100c]/60 rounded-xl border border-[#0b2d25] flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
                <span className="text-[10px] text-slate-400 leading-snug font-medium">
                  <strong>Previsão Inteligente de Fornecimento:</strong> {
                    calcs.sufficientStock
                      ? `Você pode iniciar este lote com total segurança de matérias-primas.`
                      : `Produção bloqueada! Há falta crítica de insumos. Adicione matérias-primas no Almoxarifado.`
                  }
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. FORMULAS & RECIPES TAB */}
      {activeSubTab === 'recipes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-md font-bold text-white uppercase tracking-wider">Fórmulas e Receitas Industriais Cadastradas</h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Gerenciamento de ingredientes para consumo automatizado do MRP</p>
            </div>
            <button
              onClick={openAddRecipeModal}
              className="px-4 py-2 bg-[#00df89] hover:bg-[#00b36e] text-slate-950 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Receita</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recipes.map(recipe => {
              const targetProduct = products.find(p => p.id === recipe.productId);
              const totalCostVal = recipe.items.reduce((sum, item) => {
                const dbM = products.find(p => p.id === item.productId);
                return sum + (dbM ? dbM.cost * item.baseQty : 0);
              }, 0);

              return (
                <div key={recipe.id} className="bg-[#051713] border border-[#0b2d25] rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-[#00df89]/30 transition-all">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-mono text-[#00df89] font-bold uppercase">{recipe.id}</span>
                        <h3 className="text-xs font-black text-white">{recipe.name}</h3>
                        <p className="text-[10px] text-slate-400 font-semibold">
                          Produz: <strong className="text-slate-200">{targetProduct ? targetProduct.name : 'Produto Desconhecido'}</strong>
                        </p>
                      </div>

                      <div className="flex gap-1">
                        <button
                          onClick={() => openEditRecipeModal(recipe)}
                          className="text-slate-500 hover:text-[#00df89] p-1.5 rounded-lg hover:bg-[#07241b] transition-all cursor-pointer"
                          title="Editar Receita"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setShowDeleteRecipeConfirmId(recipe.id)}
                          className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-[#1f0b0b] transition-all cursor-pointer"
                          title="Remover Receita"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="bg-[#03100c]/60 rounded-xl p-3 border border-[#0b2d25]/60 space-y-1.5">
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block pb-1 border-b border-[#0b2c23]/30">Insumos Necessários (por unidade)</span>
                      <div className="space-y-1 text-xs">
                        {recipe.items.map((it, index) => {
                          const dbM = products.find(p => p.id === it.productId);
                          return (
                            <div key={index} className="flex justify-between text-[10px] text-slate-300">
                              <span>• {it.name === 'Insumo' && dbM ? dbM.name : it.name}</span>
                              <span className="font-mono text-emerald-400 font-bold">{it.baseQty} {getProductUnitSuffix(dbM?.unit)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#0b2c23]/50 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-[8px] text-slate-500 uppercase font-bold block">Custo p/ Unidade</span>
                      <span className="font-mono text-white font-bold">{formatCurrency(totalCostVal)}</span>
                    </div>

                    {targetProduct && (
                      <div className="text-right">
                        <span className="text-[8px] text-slate-500 uppercase font-bold block">Margem de Contribuição</span>
                        <span className="font-mono text-[#00df89] font-black">
                          {totalCostVal > 0 ? (((targetProduct.price - totalCostVal) / totalCostVal) * 100).toFixed(0) : '0'}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {recipes.length === 0 && (
              <div className="col-span-full py-16 text-center text-slate-500 font-mono text-xs uppercase tracking-wider">
                Nenhuma receita fabril cadastrada. Clique em "+ Nova Receita" para registrar.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. HISTORY LOG TAB */}
      {activeSubTab === 'history' && (
        <div className="bg-[#051713] border border-[#0b2d25] rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#0b2c23]">
            <div>
              <h2 className="text-md font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
                <span>Controle Industrial e O.S.</span>
              </h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Históricos de fabricação, rendimento por insumo biológico e status de O.S.</p>
            </div>
          </div>

          <div className="border border-[#0b2c23] rounded-xl overflow-hidden bg-[#03100c]/40">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#03100c] border-b border-[#0b2c23] text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    <th className="py-4 px-4">LOTE ID</th>
                    <th className="py-4 px-4">DATA MANUFATURA</th>
                    <th className="py-4 px-4">PRODUTO ACABADO</th>
                    <th className="py-4 px-4 text-center">STATUS</th>
                    <th className="py-4 px-4 text-center">VOLUME</th>
                    <th className="py-4 px-4 text-center">CUSTO TOTAL</th>
                    <th className="py-4 px-4">RESPONSÁVEL</th>
                    <th className="py-4 px-4 text-right">AÇÕES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0b2c23] text-xs">
                  {productions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500 font-mono text-[10px] uppercase tracking-wider">
                        Nenhuma ordem de produção em andamento ou concluída no histórico.
                      </td>
                    </tr>
                  ) : (
                    [...productions].reverse().map((prod) => {
                      return (
                        <tr key={prod.id} className="hover:bg-[#051c17] text-slate-300 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-[#00df89]">{prod.id}</td>
                          <td className="py-3.5 px-4 text-slate-400">
                            {new Date(prod.createdAt).toLocaleDateString('pt-BR')} - {new Date(prod.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-white">{prod.productName}</td>
                          <td className="py-3.5 px-4 text-center">
                            {prod.status === 'Finalizado' ? (
                              <span className="bg-[#0f241a] text-emerald-400 border border-emerald-900/30 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase inline-flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Finalizado
                              </span>
                            ) : prod.status === 'Cancelado' ? (
                              <span className="bg-rose-950/40 text-rose-400 border border-rose-900/30 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase inline-flex items-center gap-1">
                                <Ban className="w-3 h-3" /> Cancelado
                              </span>
                            ) : (
                              <span className="bg-amber-950/40 text-amber-400 border border-amber-900/30 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase inline-flex items-center gap-1 animate-pulse">
                                <Clock className="w-3 h-3" /> Em Curso
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-white">
                            {prod.quantity} {getProductUnitSuffix(products.find(p => p.id === prod.productId)?.unit)}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono text-emerald-400 font-semibold">
                            {formatCurrency(prod.totalCost)}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-slate-300">{prod.responsible}</td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {prod.status === 'Em andamento' ? (
                                <>
                                  <button
                                    onClick={() => {
                                      updateProductionStatus(prod.id, 'Cancelado');
                                      alert('Ordem de serviço industrial cancelada com sucesso!');
                                    }}
                                    className="px-2 py-1 bg-[#1f0b0b] hover:bg-rose-950/60 border border-[#441818] rounded-lg text-rose-400 font-bold text-[9px] uppercase transition-all cursor-pointer"
                                  >
                                    Cancelar
                                  </button>
                                  <button
                                    onClick={() => {
                                      updateProductionStatus(prod.id, 'Finalizado');
                                      alert('Campanha industrial finalizada! Lotes de produtos acabados foram adicionados ao estoque e matérias-primas foram debitadas.');
                                    }}
                                    className="px-2 py-1 bg-[#06241c] hover:bg-[#0a352a] border border-[#0d4738] rounded-lg text-[#00df89] font-bold text-[9px] uppercase transition-all cursor-pointer"
                                  >
                                    Finalizar
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => {
                                    setShowDeleteProductionConfirmId(prod.id);
                                  }}
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
      )}

      {/* CREATE RECIPE MODAL */}
      {showCreateRecipeModal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 z-40 animate-fadeIn">
          <div className="bg-[#051713] border border-[#0b2d25] rounded-[28px] w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#0b2c23]/40 flex items-center justify-between bg-[#03100c]/40">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider font-sans">
                    {editingRecipe ? 'Editar Fórmula Industrial' : 'Cadastrar Nova Fórmula'}
                  </h3>
                  <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider block">
                    {editingRecipe ? 'Editar Receita de Produção' : 'Receita de Produção'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateRecipeModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer p-1.5 rounded-lg hover:bg-[#03100c]/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveRecipe} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
              {/* Recipe Name */}
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Nome da Receita / Fórmula</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Fórmulas Tereré Completo (unidades)"
                  value={newRecipeName}
                  onChange={(e) => setNewRecipeName(e.target.value)}
                  className="w-full bg-[#03100c] border border-[#0b2d25] rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#00df89]"
                />
              </div>

              {/* Product Produced */}
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Produto Acabado Resultante</label>
                <select
                  required
                  value={newRecipeProductId}
                  onChange={(e) => setNewRecipeProductId(e.target.value)}
                  className="w-full bg-[#03100c] border border-[#0b2d25] rounded-xl py-2 px-3 text-xs font-bold text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="">— Selecione o produto gerado —</option>
                  {finishedProducts.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Ingredients List */}
              <div className="space-y-3.5">
                <div className="flex items-center justify-between border-b border-[#0b2c23]/30 pb-1.5">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Matérias-Primas Requeridas (por unidade)</label>
                  <button
                    type="button"
                    onClick={handleAddRecipeItem}
                    className="text-[9px] text-emerald-400 font-bold uppercase tracking-wide flex items-center gap-1 hover:text-[#00df89]"
                  >
                    <Plus className="w-3 h-3" /> Adicionar Insumo
                  </button>
                </div>

                <div className="space-y-3 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
                  {newRecipeItems.map((item, index) => (
                    <div key={index} className="flex gap-2.5 items-center">
                      <select
                        required
                        value={item.productId}
                        onChange={(e) => handleRecipeItemChange(index, 'productId', e.target.value)}
                        className="flex-1 bg-[#03100c] border border-[#0b2d25] rounded-xl py-2 px-3 text-xs font-bold text-slate-300 focus:outline-none cursor-pointer"
                      >
                        <option value="">— Insumo / Matéria-prima —</option>
                        {rawMaterialsPool.map(m => (
                          <option key={m.id} value={m.id}>{m.name} (Estoque: {m.stock} {getProductUnitSuffix(m.unit)})</option>
                        ))}
                      </select>

                      <div className="w-24 shrink-0 flex items-center bg-[#03100c] border border-[#0b2d25] rounded-xl overflow-hidden pr-2">
                        <input
                          type="text"
                          required
                          value={item.baseQty}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9.,]/g, '');
                            handleRecipeItemChange(index, 'baseQty', val);
                          }}
                          className="w-full bg-transparent py-2 px-3 text-xs text-white font-mono focus:outline-none text-right"
                          placeholder="0"
                        />
                        <span className="text-[9px] text-[#00df89] font-bold uppercase">
                          {getProductUnitSuffix(products.find(p => p.id === item.productId)?.unit)}
                        </span>
                      </div>

                      <button
                        type="button"
                        disabled={newRecipeItems.length <= 1}
                        onClick={() => handleRemoveRecipeItem(index)}
                        className={`text-slate-400 hover:text-rose-400 p-2 rounded-xl hover:bg-[#1f0b0b] border border-transparent transition-all cursor-pointer ${
                          newRecipeItems.length <= 1 ? 'opacity-45 cursor-not-allowed' : ''
                        }`}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex gap-2.5 pt-4 border-t border-[#0b2c23]/30">
                <button
                  type="button"
                  onClick={() => setShowCreateRecipeModal(false)}
                  className="flex-1 py-2 bg-[#03100c] hover:bg-[#07241b] border border-[#0b2d25] text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#00df89] hover:bg-[#00b36e] text-slate-950 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md text-center"
                >
                  {editingRecipe ? 'Salvar Alterações' : 'Confirmar Cadastro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE RECIPE CONFIRM MODAL */}
      {showDeleteRecipeConfirmId && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#051713] border border-[#0b2d25] rounded-[24px] w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-6 space-y-4">
              <div className="text-center space-y-2">
                <span className="text-rose-400 text-xs font-bold uppercase tracking-widest block">Excluir Fórmula</span>
                <p className="text-sm font-bold text-white">Deletar permanentemente esta fórmula?</p>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Esta ação é irreversível. O MRP não poderá mais consumir matérias-primas por este template de fabricação.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteRecipeConfirmId(null)}
                  className="px-4 py-2 bg-[#03100c] hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold border border-[#0b2d25] cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteRecipe(showDeleteRecipeConfirmId)}
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Confirmar Exclusão
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE PRODUCTION CONFIRM MODAL */}
      {showDeleteProductionConfirmId && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#051713] border border-[#0b2d25] rounded-[24px] w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-6 space-y-4">
              <div className="text-center space-y-2">
                <span className="text-rose-400 text-xs font-bold uppercase tracking-widest block">Excluir Registro</span>
                <p className="text-sm font-bold text-white">Deseja excluir permanentemente este registro?</p>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Esta ação excluirá permanentemente o registro de Ordem de Serviço (O.S.) do histórico de produção.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteProductionConfirmId(null)}
                  className="px-4 py-2 bg-[#03100c] hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold border border-[#0b2d25] cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (showDeleteProductionConfirmId) {
                      deleteProduction(showDeleteProductionConfirmId);
                      setShowDeleteProductionConfirmId(null);
                    }
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
    </div>
  );
};
