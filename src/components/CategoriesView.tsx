/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { Category } from '../types';
import { FolderPlus, Trash2, FolderOpen, Layers, Sparkles, PlusCircle } from 'lucide-react';

export const CategoriesView: React.FC = () => {
  const { categories, products, addCategory, deleteCategory } = useERP();
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('emerald');
  const [newCatIcon, setNewCatIcon] = useState('Layers');
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

  const iconOptions = [
    { name: 'Camadas', value: 'Layers' },
    { name: 'Caixas', value: 'Boxes' },
    { name: 'Prateleiras', value: 'Database' },
    { name: 'Etiqueta', value: 'Tag' },
    { name: 'Sacola', value: 'ShoppingBag' }
  ];

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    if (categories.some(c => c.name.toLowerCase() === newCatName.trim().toLowerCase())) {
      alert('Uma categoria com este nome já existe!');
      return;
    }

    addCategory({
      name: newCatName.trim(),
      icon: newCatIcon,
      color: newCatColor
    });

    setNewCatName('');
    setNewCatColor('emerald');
    setNewCatIcon('Layers');
    alert('Nova categoria industrial registrada com sucesso!');
  };

  const getProductCountByCategory = (catName: string) => {
    return products.filter(p => p.category === catName).length;
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
            <h3 className="text-xs font-bold text-white uppercase tracking-widest pb-3 border-b border-[#0b2c23] flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-emerald-400" />
              <span>Nova Classificação</span>
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
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Ícone Identificador</label>
              <div className="grid grid-cols-5 gap-2">
                {iconOptions.map((icon) => (
                  <button
                    type="button"
                    key={icon.value}
                    onClick={() => setNewCatIcon(icon.value)}
                    className={`py-2 rounded-lg border text-xs font-semibold block text-center transition-all cursor-pointer ${
                      newCatIcon === icon.value
                        ? 'bg-[#00df89]/10 border-[#00df89] text-[#00df89]'
                        : 'bg-[#03100c] border-[#0b2d25] text-slate-400 hover:text-white hover:bg-[#051c16]'
                    }`}
                    title={icon.name}
                  >
                    <Layers className="w-4 h-4 mx-auto" />
                  </button>
                ))}
              </div>
            </div>

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

            {/* Submit button */}
            <button
              type="submit"
              className="w-full py-2 bg-[#00df89] hover:bg-[#00b36e] text-slate-950 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Fixar Classificação</span>
            </button>
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
                    className="p-4 bg-[#03100c] border border-[#0b2d25] rounded-xl flex items-center justify-between hover:border-[#0b3c2e] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl bg-[#051c17] border border-[#0b382c] flex items-center justify-center ${colorText}`}>
                        <Layers className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-white">{c.name}</span>
                        <span className="text-[10px] text-slate-500 font-semibold block">{count} {count === 1 ? 'produto associado' : 'produtos associados'}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
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
                      className="text-slate-600 hover:text-rose-400 hover:bg-[#1f0b0b]/50 border border-transparent hover:border-[#441818]/40 p-1.5 rounded-lg transition-all cursor-pointer"
                      title="Deletar Categoria"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      {/* CUSTOM DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-rose-500/20 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
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
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold border border-slate-800 cursor-pointer transition-colors"
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
