/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { Product } from '../types';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Barcode,
  Boxes,
  Percent,
  Scale,
  ClipboardList,
  FolderOpen
} from 'lucide-react';

export const ProductsView: React.FC = () => {
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct
  } = useERP();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'finished' | 'raw'>('all');

  // Modal States
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  // Form states for Product
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [cost, setCost] = useState(0);
  const [supplier, setSupplier] = useState('');
  const [category, setCategory] = useState('');
  const [barcode, setBarcode] = useState('');
  const [weight, setWeight] = useState(0.5);
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState(20);
  const [minQuantity, setMinQuantity] = useState(5);
  const [isRawMaterial, setIsRawMaterial] = useState(false);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setPrice(0);
    setCost(0);
    setSupplier('');
    setCategory(categories[0]?.name || 'Geral');
    setBarcode(Math.floor(1000000000000 + Math.random() * 9000000000000).toString());
    setWeight(0.5);
    setDescription('');
    setStock(20);
    setMinQuantity(5);
    setIsRawMaterial(false);
    setShowProductModal(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setPrice(p.price);
    setCost(p.cost);
    setSupplier(p.supplier);
    setCategory(p.category);
    setBarcode(p.barcode);
    setWeight(p.weight);
    setDescription(p.description);
    setStock(p.stock);
    setMinQuantity(p.minQuantity);
    setIsRawMaterial(p.isRawMaterial);
    setShowProductModal(true);
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const marginCalc = price > 0 ? Math.round(((price - cost) / price) * 100) : 0;

    const productPayload = {
      name: name.trim(),
      price: isRawMaterial ? 0 : price,
      cost,
      margin: isRawMaterial ? 0 : marginCalc,
      supplier: supplier.trim() || 'Indefinido',
      category,
      barcode: barcode.trim(),
      weight,
      description: description.trim(),
      stock,
      minQuantity,
      isRawMaterial
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productPayload);
      alert('Especificações do item atualizadas com sucesso!');
    } else {
      addProduct({
        ...productPayload,
        id: 'P-' + Math.random().toString(36).substr(2, 9).toUpperCase()
      });
      alert('Novo item inserido no portfólio mercantil!');
    }

    setShowProductModal(false);
  };

  // Filtered list
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search);
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    
    let matchesType = true;
    if (typeFilter === 'finished') matchesType = !p.isRawMaterial;
    if (typeFilter === 'raw') matchesType = p.isRawMaterial;

    return matchesSearch && matchesCategory && matchesType;
  });

  return (
    <div className="space-y-8 animate-fadeIn text-slate-100">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Portfólio de Itens Mercantis</h1>
          <p className="text-xs text-emerald-400/80 font-medium">Cadastre insumos base (matérias-primas) e defina preços de venda de lotes acabados.</p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-[#00df89] hover:bg-[#00b36e] text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#00df89]/10 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Item</span>
        </button>
      </div>

      {/* FILTER CONTROL PANEL */}
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
              placeholder="Pesquisar por nome ou código..."
            />
          </div>

          {/* CHIPS AND FILTER DROPDOWNS */}
          <div className="flex flex-wrap gap-3 w-full lg:w-auto items-center">
            
            {/* Type selector */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-500 mr-1">Tipo:</span>
              {(['all', 'finished', 'raw'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    typeFilter === type
                      ? 'bg-emerald-500/10 border-[#00df89]/40 text-[#00df89]'
                      : 'bg-[#03100c] border-[#0b2d25] text-slate-400 hover:text-white'
                  }`}
                >
                  {type === 'all' ? 'Todos' : type === 'finished' ? 'Acabados' : 'M-Primas'}
                </button>
              ))}
            </div>

            {/* Category Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <FolderOpen className="w-3.5 h-3.5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-[#03100c] border border-[#0b2d25] rounded-xl py-1.5 px-3 text-xs text-slate-300 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="all">TODAS CATEGORIAS</option>
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name.toUpperCase()}</option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* PRODUCTS CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-[#03100c]/30 rounded-2xl border border-dashed border-[#0b2d25]">
              <Boxes className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-mono uppercase tracking-wider">Nenhum item mercantil encontrado</p>
            </div>
          ) : (
            filteredProducts.map((p) => {
              const isLow = p.stock <= p.minQuantity;

              return (
                <div
                  key={p.id}
                  className="bg-[#051713] border border-[#0b2d25] hover:border-[#0c3a2f] rounded-2xl overflow-hidden transition-all flex flex-col justify-between"
                >
                  <div className="p-5 space-y-4">
                    {/* Badge and title */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">{p.category}</span>
                        <h3 className="text-sm font-bold text-white leading-snug line-clamp-1">{p.name}</h3>
                      </div>
                      <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        p.isRawMaterial ? 'bg-[#0f241a] text-[#00df89] border border-emerald-900/30' : 'bg-blue-950/40 text-blue-400 border border-blue-900/30'
                      }`}>
                        {p.isRawMaterial ? 'M-Prima' : 'Acabado'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed min-h-8">
                      {p.description || 'Nenhuma especificação mercantil cadastrada.'}
                    </p>

                    {/* Stats & prices */}
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#0b2c23]">
                      <div className="bg-[#03100c] p-2 rounded-xl border border-[#0b2d25]/60">
                        <span className="text-[8px] text-slate-500 uppercase tracking-widest font-bold block">Preço de Venda</span>
                        <span className="text-xs font-bold text-white font-mono">
                          {p.isRawMaterial ? '—' : formatCurrency(p.price)}
                        </span>
                      </div>
                      <div className="bg-[#03100c] p-2 rounded-xl border border-[#0b2d25]/60">
                        <span className="text-[8px] text-slate-500 uppercase tracking-widest font-bold block">Custo Base</span>
                        <span className="text-xs font-bold text-slate-300 font-mono">{formatCurrency(p.cost)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[#03100c] p-2 rounded-xl border border-[#0b2d25]/60 flex items-center justify-between">
                        <div>
                          <span className="text-[8px] text-slate-500 uppercase tracking-widest font-bold block">Estoque</span>
                          <span className="text-xs font-bold text-white font-mono">{p.stock} un</span>
                        </div>
                        <span className="text-[9px] text-slate-500">Mín: {p.minQuantity}</span>
                      </div>
                      <div className="bg-[#03100c] p-2 rounded-xl border border-[#0b2d25]/60">
                        <span className="text-[8px] text-slate-500 uppercase tracking-widest font-bold block">Rentabilidade</span>
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-0.5 mt-0.5">
                          <Percent className="w-3 h-3" /> {p.isRawMaterial ? '0' : p.margin}%
                        </span>
                      </div>
                    </div>

                    {/* Technical details bar */}
                    <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1 font-semibold font-mono border-t border-[#0b2c23]/30">
                      <span className="inline-flex items-center gap-1"><Barcode className="w-3.5 h-3.5 text-slate-600" /> {p.barcode}</span>
                      <span className="inline-flex items-center gap-1"><Scale className="w-3.5 h-3.5 text-slate-600" /> {p.weight} kg</span>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="px-5 py-3 bg-[#03100c]/40 border-t border-[#0b2c23] flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-semibold truncate max-w-[120px]">Fornecedor: {p.supplier}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 hover:bg-[#06241c] text-slate-400 hover:text-[#00df89] rounded-lg transition-colors cursor-pointer"
                        title="Editar especificações"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(p)}
                        className="p-1.5 hover:bg-[#1f0b0b]/60 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                        title="Remover do catálogo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* PRODUCT REGISTER MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#051713] border border-[#0b2d25] rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-[#0b2c23] flex items-center justify-between bg-[#03100c]/20">
              <h3 className="text-md font-bold text-white uppercase tracking-wider">
                {editingProduct ? 'Editar Especificações' : 'Cadastrar Item Mercantil'}
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer font-bold text-xs"
              >
                FECHAR ✕
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="p-6 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Nome do Produto / Insumo</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#03100c] border border-[#0b2d25] rounded-xl py-2 px-3 text-xs text-white focus:border-emerald-500/40 focus:outline-none"
                    placeholder="Ex: Cuia de Cerâmica Térmica Matezza"
                  />
                </div>

                {/* Raw Material Flag Toggle */}
                <div className="sm:col-span-2 bg-[#03100c] p-3 rounded-xl border border-[#0b2d25] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">Este item é Matéria-Prima (Insumo)?</span>
                    <span className="text-[10px] text-slate-500">Insumos são consumidos no processo produtivo e não possuem faturamento de venda direto.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isRawMaterial}
                    onChange={(e) => setIsRawMaterial(e.target.checked)}
                    className="w-5 h-5 accent-emerald-500 cursor-pointer"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#03100c] border border-[#0b2d25] rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Barcode SKU */}
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Código SKU / Registro</label>
                  <input
                    type="text"
                    required
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="w-full bg-[#03100c] border border-[#0b2d25] rounded-xl py-2 px-3 text-xs text-white focus:outline-none font-mono"
                  />
                </div>

                {/* Weight */}
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Peso Unitário (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full bg-[#03100c] border border-[#0b2d25] rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                  />
                </div>

                {/* Supplier */}
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Fornecedor Técnico</label>
                  <input
                    type="text"
                    required
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    className="w-full bg-[#03100c] border border-[#0b2d25] rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                    placeholder="Ex: BASF S.A. ou Ambev Insumos"
                  />
                </div>

                {/* Price (Only if finished product) */}
                {!isRawMaterial && (
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Preço Unitário de Venda (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full bg-[#03100c] border border-[#0b2d25] rounded-xl py-2 px-3 text-xs text-white focus:outline-none font-mono"
                    />
                  </div>
                )}

                {/* Cost */}
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Custo Base de Aquisição (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={cost}
                    onChange={(e) => setCost(Number(e.target.value))}
                    className="w-full bg-[#03100c] border border-[#0b2d25] rounded-xl py-2 px-3 text-xs text-white focus:outline-none font-mono"
                  />
                </div>

                {/* Stock Initial */}
                {!editingProduct && (
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Volume Inicial Estoque</label>
                    <input
                      type="number"
                      required
                      value={stock}
                      onChange={(e) => setStock(Number(e.target.value))}
                      className="w-full bg-[#03100c] border border-[#0b2d25] rounded-xl py-2 px-3 text-xs text-white focus:outline-none font-mono"
                    />
                  </div>
                )}

                {/* Min Quantity Limit */}
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Limite de Estoque Mínimo</label>
                  <input
                    type="number"
                    required
                    value={minQuantity}
                    onChange={(e) => setMinQuantity(Number(e.target.value))}
                    className="w-full bg-[#03100c] border border-[#0b2d25] rounded-xl py-2 px-3 text-xs text-white focus:outline-none font-mono"
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Descrição Comercial / Detalhes</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full bg-[#03100c] border border-[#0b2d25] rounded-xl py-2 px-3 text-xs text-white focus:outline-none resize-none"
                    placeholder="Descreva as especificações, materiais ou aplicações do item..."
                  />
                </div>
              </div>

              {/* Form buttons */}
              <div className="pt-4 border-t border-[#0b2c23] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 bg-[#03100c] hover:bg-[#051c17] text-slate-300 rounded-xl text-xs font-semibold border border-[#0b2d25] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#00df89] hover:bg-[#00b36e] text-slate-950 rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Confirmar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOM DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#051713] border border-rose-500/20 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-6 space-y-4">
              <div className="text-center space-y-2">
                <span className="text-rose-400 text-xs font-bold uppercase tracking-widest block">Confirmar Exclusão</span>
                <p className="text-sm font-bold text-white">Deseja remover definitivamente o produto "{deleteTarget.name}"?</p>
                <p className="text-[10px] text-slate-400 leading-relaxed">Esta ação não pode ser desfeita e removerá o item do portfólio mercantil.</p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 bg-[#03100c] hover:bg-[#051c17] text-slate-300 rounded-xl text-xs font-semibold border border-[#0b2d25] cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteProduct(deleteTarget.id);
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
