/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { Category } from '../types';
import { 
  FolderPlus, 
  Trash2, 
  FolderOpen, 
  Layers, 
  Sparkles, 
  PlusCircle, 
  Boxes, 
  Tag, 
  ShoppingBag, 
  Database, 
  Package, 
  Flame, 
  Wrench, 
  Award, 
  Gift, 
  Percent, 
  Activity, 
  FlaskConical, 
  ShieldAlert, 
  Edit2, 
  X,
  MoreHorizontal,
  Check
} from 'lucide-react';

const CATEGORY_ICONS_LIST = [
  { name: 'Camadas', value: 'Layers' },
  { name: 'Caixas', value: 'Boxes' },
  { name: 'Insumos', value: 'Database' },
  { name: 'Etiqueta', value: 'Tag' },
  { name: 'Sacola', value: 'ShoppingBag' },
  { name: 'Brilho', value: 'Sparkles' },
  { name: 'Pacote', value: 'Package' },
  { name: 'Chama', value: 'Flame' },
  { name: 'Ferramenta', value: 'Wrench' },
  { name: 'Prêmio', value: 'Award' },
  { name: 'Presente', value: 'Gift' },
  { name: 'Percentual', value: 'Percent' },
  { name: 'Atividade', value: 'Activity' },
  { name: 'Laboratório', value: 'FlaskConical' },
  { name: 'Alerta', value: 'ShieldAlert' }
];

const renderIcon = (iconName: string, className = "w-4 h-4") => {
  switch (iconName) {
    case 'Layers': return <Layers className={className} />;
    case 'Boxes': return <Boxes className={className} />;
    case 'Database': return <Database className={className} />;
    case 'Tag': return <Tag className={className} />;
    case 'ShoppingBag': return <ShoppingBag className={className} />;
    case 'Sparkles': return <Sparkles className={className} />;
    case 'Package': return <Package className={className} />;
    case 'Flame': return <Flame className={className} />;
    case 'Wrench': return <Wrench className={className} />;
    case 'Award': return <Award className={className} />;
    case 'Gift': return <Gift className={className} />;
    case 'Percent': return <Percent className={className} />;
    case 'Activity': return <Activity className={className} />;
    case 'FlaskConical': return <FlaskConical className={className} />;
    case 'ShieldAlert': return <ShieldAlert className={className} />;
    default: return <Layers className={className} />;
  }
};

export const CategoriesView: React.FC = () => {
  const { categories, products, addCategory, updateCategory, deleteCategory } = useERP();
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('emerald');
  const [newCatIcon, setNewCatIcon] = useState('Layers');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showMoreIcons, setShowMoreIcons] = useState(false);
  const [selectedCategoryForProducts, setSelectedCategoryForProducts] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const colorOptions = [
    { name: 'Esmeralda', value: 'emerald' },
    { name: 'Azul', value: 'blue' },
    { name: 'Indigo', value: 'indigo' },
    { name: 'Roxo', value: 'violet' },
    { name: 'Rosa', value: 'rose' },
    { name: 'Laranja', value: 'orange' },
    { name: 'Amarelo', value: 'amber' }
  ];

  const quickIcons = [
    { name: 'Camadas', value: 'Layers' },
    { name: 'Pacote', value: 'Package' },
    { name: 'Etiqueta', value: 'Tag' },
    { name: 'Ferramenta', value: 'Wrench' }
  ];

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const existing = categories.find(c => c.name.toLowerCase() === newCatName.trim().toLowerCase());
    if (existing && (!editingCategory || existing.id !== editingCategory.id)) {
      alert('Uma categoria com este nome já existe!');
      return;
    }

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: newCatName.trim(),
        icon: newCatIcon,
        color: newCatColor
      });
      alert('Categoria atualizada com sucesso!');
    } else {
      addCategory({
        name: newCatName.trim(),
        icon: newCatIcon,
        color: newCatColor
      });
      alert('Nova categoria registrada com sucesso!');
    }

    cancelEditCategory();
  };

  const startEditCategory = (c: Category) => {
    setEditingCategory(c);
    setNewCatName(c.name);
    setNewCatColor(c.color || 'emerald');
    setNewCatIcon(c.icon || 'Layers');
    setShowMoreIcons(false);
  };

  const cancelEditCategory = () => {
    setEditingCategory(null);
    setNewCatName('');
    setNewCatColor('emerald');
    setNewCatIcon('Layers');
    setShowMoreIcons(false);
  };

  const getProductCountByCategory = (catName: string) => {
    return products.filter(p => p.category === catName).length;
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-8 animate-fadeIn text-slate-100">
      
      {/* HEADER SECTION */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Categorias Mercantis</h1>
        <p className="text-xs text-emerald-400/80 font-medium font-mono uppercase tracking-wider">
          Classificação hierárquica e organização fiscal de produtos acabados e insumos fabris.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT PANEL: NEW CATEGORY REGISTER (4/12) */}
        <div className="lg:col-span-4 h-fit">
          <form onSubmit={handleAddCategory} className="bg-[#051713] border border-[#0b2d25] rounded-2xl p-6 space-y-5">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest pb-3 border-b border-[#0b2c23] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-emerald-400" />
                <span>{editingCategory ? 'Editar Classificação' : 'Nova Classificação'}</span>
              </div>
              {editingCategory && (
                <button
                  type="button"
                  onClick={cancelEditCategory}
                  className="text-[9px] px-2 py-0.5 bg-[#1a2d26] text-emerald-400 font-bold uppercase rounded-md hover:bg-emerald-500 hover:text-slate-950 transition-all cursor-pointer"
                >
                  Novo Cadastro
                </button>
              )}
            </h3>

            {/* Name Input */}
            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Nome da Categoria</label>
              <input
                type="text"
                required
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="w-full bg-[#03100c] border border-[#0b2d25] rounded-xl py-2 px-3 text-xs text-white font-medium focus:outline-none focus:border-emerald-500/40"
                placeholder="Ex: Reagentes Químicos, Fertilizantes..."
              />
            </div>

            {/* Icon Select */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Ícone Identificador</label>
                {!quickIcons.some(q => q.value === newCatIcon) && (
                  <span className="text-[9px] text-emerald-400 font-bold font-mono">Personalizado</span>
                )}
              </div>
              <div className="grid grid-cols-5 gap-2">
                {quickIcons.map((icon) => (
                  <button
                    type="button"
                    key={icon.value}
                    onClick={() => {
                      setNewCatIcon(icon.value);
                      setShowMoreIcons(false);
                    }}
                    className={`py-2 rounded-lg border text-xs font-semibold block text-center transition-all cursor-pointer ${
                      newCatIcon === icon.value
                        ? 'bg-[#00df89]/10 border-[#00df89] text-[#00df89]'
                        : 'bg-[#03100c] border-[#0b2d25] text-slate-400 hover:text-white hover:bg-[#051c16]'
                    }`}
                    title={icon.name}
                  >
                    {renderIcon(icon.value, "w-4 h-4 mx-auto")}
                  </button>
                ))}
                
                {/* 3 dots button for more icons */}
                <button
                  type="button"
                  onClick={() => setShowMoreIcons(!showMoreIcons)}
                  className={`py-2 rounded-lg border text-xs font-semibold block text-center transition-all cursor-pointer flex items-center justify-center ${
                    showMoreIcons || !quickIcons.some(q => q.value === newCatIcon)
                      ? 'bg-[#00df89]/20 border-[#00df89] text-[#00df89]'
                      : 'bg-[#03100c] border-[#0b2d25] text-slate-400 hover:text-white hover:bg-[#051c16]'
                  }`}
                  title="Mais Ícones"
                >
                  {!quickIcons.some(q => q.value === newCatIcon) ? (
                    renderIcon(newCatIcon, "w-4 h-4 mx-auto")
                  ) : (
                    <MoreHorizontal className="w-4 h-4 mx-auto" />
                  )}
                </button>
              </div>
            </div>

            {/* Collapsible Expanded Icons Grid */}
            {showMoreIcons && (
              <div className="bg-[#03100c] p-3 rounded-xl border border-[#0b2d25] space-y-2 animate-fadeIn">
                <span className="block text-[8px] font-black text-emerald-400 uppercase tracking-widest pb-1 border-b border-[#0b2c23]/30">
                  Banco Completo de Ícones
                </span>
                <div className="grid grid-cols-5 gap-1.5 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
                  {CATEGORY_ICONS_LIST.map((icon) => (
                    <button
                      type="button"
                      key={icon.value}
                      onClick={() => {
                        setNewCatIcon(icon.value);
                        setShowMoreIcons(false);
                      }}
                      className={`p-2 rounded-lg border text-xs font-semibold block text-center transition-all cursor-pointer ${
                        newCatIcon === icon.value
                          ? 'bg-[#00df89]/20 border-[#00df89] text-[#00df89] scale-105'
                          : 'bg-[#051713]/50 border-[#0b2d25]/60 text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                      title={icon.name}
                    >
                      {renderIcon(icon.value, "w-4 h-4 mx-auto")}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Select */}
            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Cor Temática de Badge</label>
              <div className="flex flex-wrap gap-2.5">
                {colorOptions.map((c) => {
                  const isSelected = newCatColor === c.value;
                  const colorBg = 
                    c.value === 'emerald' ? 'bg-emerald-500' :
                    c.value === 'blue' ? 'bg-blue-500' :
                    c.value === 'indigo' ? 'bg-indigo-500' :
                    c.value === 'violet' ? 'bg-violet-500' :
                    c.value === 'rose' ? 'bg-rose-500' :
                    c.value === 'orange' ? 'bg-orange-500' : 'bg-amber-500';

                  return (
                    <button
                      type="button"
                      key={c.value}
                      onClick={() => setNewCatColor(c.value)}
                      className={`w-6 h-6 rounded-full ${colorBg} flex items-center justify-center transition-all hover:scale-110 shadow-md border cursor-pointer ${
                        isSelected ? 'border-white scale-110' : 'border-transparent'
                      }`}
                      title={c.name}
                    />
                  );
                })}
              </div>
            </div>

            {/* Submit & Cancel buttons */}
            <div className="flex gap-2.5 pt-1">
              {editingCategory && (
                <button
                  type="button"
                  onClick={cancelEditCategory}
                  className="flex-1 py-2 bg-[#03100c] hover:bg-[#07241b] border border-[#0b2d25] text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                className={`py-2 bg-[#00df89] hover:bg-[#00b36e] text-slate-950 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5 ${
                  editingCategory ? 'flex-1' : 'w-full'
                }`}
              >
                {editingCategory ? <Check className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                <span>{editingCategory ? 'Salvar' : 'Fixar Classificação'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT PANEL: LIST OF CATEGORIES (8/12) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-[#051713] border border-[#0b2d25] rounded-2xl p-6">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest pb-3 border-b border-[#0b2c23] mb-5 flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-emerald-400" />
              <span>Categorias Registradas no Sistema</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map((c) => {
                const count = getProductCountByCategory(c.name);
                const colorText = 
                  c.color === 'emerald' ? 'text-emerald-400' :
                  c.color === 'blue' ? 'text-blue-400' :
                  c.color === 'indigo' ? 'text-indigo-400' :
                  c.color === 'violet' ? 'text-violet-400' :
                  c.color === 'rose' ? 'text-rose-400' :
                  c.color === 'orange' ? 'text-orange-400' : 'text-amber-400';

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCategoryForProducts(c)}
                    className="p-4 bg-[#03100c] border border-[#0b2d25] rounded-xl flex items-center justify-between hover:border-[#00df89]/40 cursor-pointer transition-all hover:scale-[1.01] hover:bg-[#03130f]"
                    title="Clique para ver os produtos nesta categoria"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl bg-[#051c17] border border-[#0b382c] flex items-center justify-center ${colorText}`}>
                        {renderIcon(c.icon || 'Layers', "w-4 h-4")}
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-white">{c.name}</span>
                        <span className="text-[10px] text-slate-500 font-semibold block">
                          {count} {count === 1 ? 'produto' : 'produtos'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Edit button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditCategory(c);
                        }}
                        className="text-slate-500 hover:text-emerald-400 hover:bg-[#00df89]/10 border border-transparent hover:border-[#00df89]/20 p-1.5 rounded-lg transition-all cursor-pointer"
                        title="Editar Categoria"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (categories.length <= 1) {
                            alert('O ERP necessita de ao menos uma categoria mercantil ativa.');
                            return;
                          }
                          if (count > 0) {
                            alert(`Não é possível deletar a categoria "${c.name}" porque existem ${count} produtos vinculados a ela. Reatribua os produtos antes.`);
                            return;
                          }
                          setDeleteTarget(c);
                        }}
                        className="text-slate-500 hover:text-rose-400 hover:bg-[#1f0b0b]/50 border border-transparent hover:border-[#441818]/40 p-1.5 rounded-lg transition-all cursor-pointer"
                        title="Deletar Categoria"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* PRODUCTS BY CATEGORY MODAL */}
      {selectedCategoryForProducts && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 z-40 animate-fadeIn">
          <div className="bg-[#051713] border border-[#0b2d25] rounded-[28px] w-full max-w-2xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-[#0b2c23]/40 flex items-center justify-between bg-[#03100c]/40">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-[#051c17] border border-[#0b382c] flex items-center justify-center ${
                  selectedCategoryForProducts.color === 'emerald' ? 'text-emerald-400' :
                  selectedCategoryForProducts.color === 'blue' ? 'text-blue-400' :
                  selectedCategoryForProducts.color === 'indigo' ? 'text-indigo-400' :
                  selectedCategoryForProducts.color === 'violet' ? 'text-violet-400' :
                  selectedCategoryForProducts.color === 'rose' ? 'text-rose-400' :
                  selectedCategoryForProducts.color === 'orange' ? 'text-orange-400' : 'text-amber-400'
                }`}>
                  {renderIcon(selectedCategoryForProducts.icon, "w-5 h-5")}
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider font-sans">
                    {selectedCategoryForProducts.name}
                  </h3>
                  <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                    Produtos Vinculados
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCategoryForProducts(null)}
                className="text-slate-400 hover:text-white cursor-pointer p-1.5 rounded-lg hover:bg-[#03100c]/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
              
              {/* Category stats row */}
              {(() => {
                const catProducts = products.filter(p => p.category === selectedCategoryForProducts.name);
                const totalStock = catProducts.reduce((sum, p) => sum + p.stock, 0);
                const totalCostValuation = catProducts.reduce((sum, p) => sum + (p.stock * p.cost), 0);
                
                return (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-[#03100c]/60 rounded-xl border border-[#0b2d25] text-center">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Total Itens</span>
                      <span className="text-sm font-black text-white">{catProducts.length}</span>
                    </div>
                    <div className="p-3 bg-[#03100c]/60 rounded-xl border border-[#0b2d25] text-center">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Volume Estoque</span>
                      <span className="text-sm font-black text-emerald-400">{totalStock}</span>
                    </div>
                    <div className="p-3 bg-[#03100c]/60 rounded-xl border border-[#0b2d25] text-center">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Avaliação (Custo)</span>
                      <span className="text-sm font-black text-white">{formatCurrency(totalCostValuation)}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Products list or warning */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Lista de Itens</span>
                {(() => {
                  const catProducts = products.filter(p => p.category === selectedCategoryForProducts.name);
                  if (catProducts.length === 0) {
                    return (
                      <div className="p-8 text-center bg-[#03100c]/30 rounded-2xl border border-dashed border-[#0b2d25] space-y-2">
                        <Package className="w-8 h-8 text-slate-600 mx-auto" />
                        <p className="text-xs text-slate-400 font-medium">Nenhum produto cadastrado nesta classificação.</p>
                      </div>
                    );
                  }
                  return (
                    <div className="space-y-2.5 max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
                      {catProducts.map(p => (
                        <div key={p.id} className="p-3.5 bg-[#03100c] border border-[#0b2d25] rounded-xl flex items-center justify-between hover:border-[#0b3a2e] transition-colors">
                          <div className="flex items-center gap-3">
                            <span className="text-lg p-1 bg-[#051713] rounded-lg border border-[#0b2d25] w-8 h-8 flex items-center justify-center shrink-0">
                              {(!p.image || p.image.startsWith('http')) ? '📦' : p.image}
                            </span>
                            <div>
                              <span className="text-xs font-bold text-white block leading-snug">{p.name}</span>
                              <span className="text-[9px] font-mono text-slate-500 block">SKU: {p.barcode || 'N/A'}</span>
                            </div>
                          </div>
                          <div className="text-right space-y-0.5">
                            <span className="text-[10px] font-semibold text-slate-400 block">
                              Estoque: <strong className="text-white font-black">{p.stock}</strong> <span className="text-slate-500 text-[9px]">{p.unit ? p.unit.split(' ')[0] : 'un'}</span>
                            </span>
                            <span className="text-[9px] font-bold text-emerald-400 block font-mono">
                              {p.isRawMaterial ? `Custo: ${formatCurrency(p.cost)}` : `Venda: ${formatCurrency(p.price)}`}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-[#03100c]/20 border-t border-[#0b2c23]/40 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCategoryForProducts(null)}
                className="px-5 py-2 bg-[#00df89] hover:bg-[#00b36e] text-slate-950 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-[#00df89]/10"
              >
                Concluído
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#051713] border border-[#0b2d25] rounded-[24px] w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-6 space-y-4">
              <div className="text-center space-y-2">
                <span className="text-rose-400 text-xs font-bold uppercase tracking-widest block">Excluir Categoria</span>
                <p className="text-sm font-bold text-white">Deletar a categoria "{deleteTarget.name}"?</p>
                <p className="text-[10px] text-slate-400 leading-relaxed">Esta ação não pode ser desfeita e removerá esta categoria mercantil do sistema.</p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 bg-[#03100c] hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold border border-[#0b2d25] cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteCategory(deleteTarget.id);
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
    </div>
  );
};
