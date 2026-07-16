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
  FolderOpen,
  Save,
  X,
  MoreHorizontal
} from 'lucide-react';

const EMOJI_CATEGORIES = [
  {
    name: '🧉 Chimarrão & Bebidas',
    emojis: ['🧉', '🍵', '☕', '🥤', '🍼', '🥛', '🍺', '🍻', '🥂', '🍷', '🥃', '🍹', '🫖', '🧉']
  },
  {
    name: '🌿 Insumos & Plantas',
    emojis: ['🧪', '🍂', '🪴', '🌿', '🪵', '🌾', '🌱', '🍃', '🌻', '🌼', '🍀', '🍁', '🍄', '🪵', '🌵']
  },
  {
    name: '📦 Logística & Embalagem',
    emojis: ['📦', '🔋', '💧', '🧱', '🛡️', '📥', '📤', '✉️', '🏷️', '🚚', '🚛', '🛒', '🏭', '🏗️', '💼']
  },
  {
    name: '🍋 Alimentos & Frutas',
    emojis: ['🍋', '🍊', '🍎', '🍏', '🍇', '🍉', '🍒', '🍓', '🍑', '🍍', '🥥', '🍯', '🧂', '🍪', '🍫']
  },
  {
    name: '⚙️ Ferramentas & Indústria',
    emojis: ['🛠️', '🔧', '⚙️', '🔬', '⚖️', '📏', '📎', '🔒', '🔑', '📊', '📈', '📋', '🖨️', '💻', '⏱️']
  },
  {
    name: '⭐ Símbolos & Cores',
    emojis: ['⭐', '🌟', '🔥', '💧', '⚡', '💡', '✅', '❌', '⚠️', '🚩', '🎯', '🏆', '💎', '🟢', '🔴']
  }
];

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
  const [unit, setUnit] = useState('Lata / Litro (L)');
  const [productType, setProductType] = useState<'final' | 'raw' | 'both'>('final');
  const [selectedEmoji, setSelectedEmoji] = useState('🧪');
  const [showMoreEmojis, setShowMoreEmojis] = useState(false);
  const [customEmojiInput, setCustomEmojiInput] = useState('');

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
    setBarcode('BM-' + Math.floor(100 + Math.random() * 900).toString());
    setWeight(0.5);
    setDescription('');
    setStock(20);
    setMinQuantity(5);
    setIsRawMaterial(false);
    setUnit('Lata / Litro (L)');
    setProductType('final');
    setSelectedEmoji('🧪');
    setShowMoreEmojis(false);
    setCustomEmojiInput('');
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
    setUnit(p.unit || 'Lata / Litro (L)');
    setProductType(p.productType || (p.isRawMaterial ? 'raw' : 'final'));
    setSelectedEmoji(p.image || '🧪');
    setShowMoreEmojis(false);
    setCustomEmojiInput('');
    setShowProductModal(true);
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const marginCalc = price > 0 ? Math.round(((price - cost) / price) * 100) : 0;
    const isRaw = productType === 'raw';

    const productPayload = {
      name: name.trim(),
      price: isRaw ? 0 : price,
      cost,
      margin: isRaw ? 0 : marginCalc,
      supplier: supplier.trim() || 'Indefinido',
      category,
      barcode: barcode.trim(),
      weight,
      description: description.trim(),
      stock,
      minQuantity,
      isRawMaterial: isRaw,
      unit,
      productType,
      image: selectedEmoji
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
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl p-1.5 bg-[#03100c] rounded-xl border border-[#0b2d25] flex items-center justify-center shrink-0 w-9 h-9">
                          {(!p.image || p.image.startsWith('http')) ? '📦' : p.image}
                        </span>
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest block">{p.category}</span>
                          <h3 className="text-sm font-bold text-white leading-snug line-clamp-1">{p.name}</h3>
                        </div>
                      </div>
                      <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        p.isRawMaterial ? 'bg-[#0f241a] text-[#00df89] border border-emerald-900/30' : 'bg-blue-950/40 text-blue-400 border border-blue-900/30'
                      }`}>
                        {p.isRawMaterial ? 'M-Prima' : p.productType === 'both' ? 'Ambos' : 'Acabado'}
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
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#051713] border border-[#0b2d25] rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-[#0b2c23]/40 flex items-center justify-between">
              <h3 className="text-sm font-black text-white uppercase tracking-wider font-sans">
                {editingProduct ? 'EDITAR PRODUTO' : 'CADASTRAR NOVO PRODUTO'}
              </h3>
              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer p-1.5 rounded-lg hover:bg-[#03100c]/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="p-6 space-y-5 max-h-[85vh] overflow-y-auto custom-scrollbar">
              
              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-[#00df89] mb-1.5 uppercase tracking-wide">Nome do Produto *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#03100c] border border-[#0b2d25] rounded-xl py-2.5 px-4 text-xs font-medium text-white focus:border-[#00df89]/60 focus:outline-none placeholder-slate-600 transition-all"
                  placeholder="ex: Biomate Organic Booster"
                />
              </div>

              {/* SKU & Unit row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#00df89] mb-1.5 uppercase tracking-wide">Código SKU *</label>
                  <input
                    type="text"
                    required
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="w-full bg-[#03100c] border border-[#0b2d25] rounded-xl py-2.5 px-4 text-xs font-mono text-white focus:border-[#00df89]/60 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#00df89] mb-1.5 uppercase tracking-wide">Unidade *</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-[#03100c] border border-[#0b2d25] rounded-xl py-2.5 px-4 text-xs font-medium text-white focus:border-[#00df89]/60 focus:outline-none cursor-pointer transition-all appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2300df89%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_16px_center] bg-no-repeat pr-10"
                  >
                    <option value="Lata / Litro (L)">Lata / Litro (L)</option>
                    <option value="Quilo (Kg)">Quilo (Kg)</option>
                    <option value="Unidade (Un)">Unidade (Un)</option>
                    <option value="Pacote (Pct)">Pacote (Pct)</option>
                    <option value="Grama (g)">Grama (g)</option>
                    <option value="Mililitro (ml)">Mililitro (ml)</option>
                  </select>
                </div>
              </div>

              {/* Product Type segmented */}
              <div>
                <label className="block text-xs font-bold text-[#00df89] mb-2 uppercase tracking-wide">Tipo do Produto *</label>
                <div className="grid grid-cols-3 gap-3">
                  {/* Option 1: Produto Final */}
                  <button
                    type="button"
                    onClick={() => {
                      setProductType('final');
                      if (price === 0) setPrice(100);
                    }}
                    className={`p-3 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all border ${
                      productType === 'final'
                        ? 'bg-[#00df89] border-[#00df89] text-[#051713]'
                        : 'bg-[#03100c]/40 border-[#0b2d25] text-slate-400 hover:border-[#0c3a2f]/80'
                    }`}
                  >
                    <span className="text-xs font-bold block">Produto Final</span>
                    <span className={`text-[9px] font-medium block mt-0.5 ${
                      productType === 'final' ? 'text-[#051713]/85' : 'text-slate-500'
                    }`}>
                      Fabricável / Venda
                    </span>
                  </button>

                  {/* Option 2: Insumo */}
                  <button
                    type="button"
                    onClick={() => {
                      setProductType('raw');
                    }}
                    className={`p-3 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all border ${
                      productType === 'raw'
                        ? 'bg-[#00df89] border-[#00df89] text-[#051713]'
                        : 'bg-[#03100c]/40 border-[#0b2d25] text-slate-400 hover:border-[#0c3a2f]/80'
                    }`}
                  >
                    <span className="text-xs font-bold block">Insumo</span>
                    <span className={`text-[9px] font-medium block mt-0.5 ${
                      productType === 'raw' ? 'text-[#051713]/85' : 'text-slate-500'
                    }`}>
                      Apenas receita
                    </span>
                  </button>

                  {/* Option 3: Ambos */}
                  <button
                    type="button"
                    onClick={() => {
                      setProductType('both');
                      if (price === 0) setPrice(100);
                    }}
                    className={`p-3 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all border ${
                      productType === 'both'
                        ? 'bg-[#00df89] border-[#00df89] text-[#051713]'
                        : 'bg-[#03100c]/40 border-[#0b2d25] text-slate-400 hover:border-[#0c3a2f]/80'
                    }`}
                  >
                    <span className="text-xs font-bold block">Ambos</span>
                    <span className={`text-[9px] font-medium block mt-0.5 ${
                      productType === 'both' ? 'text-[#051713]/85' : 'text-slate-500'
                    }`}>
                      Fabricável e insumo
                    </span>
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-[#00df89] mb-1.5 uppercase tracking-wide">Descrição do Produto</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-[#03100c] border border-[#0b2d25] rounded-xl py-2.5 px-4 text-xs font-medium text-white focus:border-[#00df89]/60 focus:outline-none placeholder-slate-600 resize-none transition-all"
                  placeholder="Digite detalhes do produto, destinação, notas de qualidade..."
                />
              </div>

              {/* Category & Icon / Emoji */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#00df89] mb-1.5 uppercase tracking-wide">Categoria *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#03100c] border border-[#0b2d25] rounded-xl py-2.5 px-4 text-xs font-medium text-white focus:border-[#00df89]/60 focus:outline-none cursor-pointer transition-all appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2300df89%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_16px_center] bg-no-repeat pr-10"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#00df89] mb-1.5 uppercase tracking-wide">Selecione o Ícone / Emoji</label>
                  <div className="flex items-center gap-3">
                    {/* Live Preview of Selected Emoji */}
                    <div className="w-11 h-11 rounded-xl bg-[#03100c] border border-[#0b2d25] flex items-center justify-center text-2xl font-sans shrink-0 shadow-inner">
                      {selectedEmoji}
                    </div>

                    {/* Grid of quick emojis and the More button */}
                    <div className="grid grid-cols-5 gap-1.5 flex-1 max-w-[200px]">
                      {['🧪', '🛡️', '🍂', '🪴', '📦', '🔋', '💧', '🌿', '🪵'].map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            setSelectedEmoji(emoji);
                            setCustomEmojiInput('');
                          }}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm cursor-pointer transition-all border font-sans ${
                            selectedEmoji === emoji
                              ? 'bg-[#00df89] border-[#00df89] text-slate-950 scale-105 shadow-sm shadow-[#00df89]/20'
                              : 'bg-white border-transparent text-slate-800 hover:bg-slate-200'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}

                      {/* Three-dots button to open advanced custom picker */}
                      <button
                        type="button"
                        onClick={() => setShowMoreEmojis(true)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm cursor-pointer transition-all border ${
                          showMoreEmojis
                            ? 'bg-[#00df89] border-[#00df89] text-slate-950 scale-105 shadow-sm shadow-[#00df89]/20'
                            : 'bg-[#03100c] border-[#0b2d25] text-[#00df89] hover:bg-[#00df89]/15'
                        }`}
                        title="Outros Emojis"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Inputs (Cost and Sale Prices) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#00df89] mb-1.5 uppercase tracking-wide">Preço de Custo (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={cost === 0 ? '' : cost}
                    onChange={(e) => setCost(Number(e.target.value))}
                    className="w-full bg-[#03100c] border border-[#0b2d25] rounded-xl py-2.5 px-4 text-xs text-white focus:border-[#00df89]/60 focus:outline-none font-mono"
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#00df89] mb-1.5 uppercase tracking-wide">Preço de Venda (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required={productType !== 'raw'}
                    disabled={productType === 'raw'}
                    value={productType === 'raw' ? '0' : (price === 0 ? '' : price)}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className={`w-full border rounded-xl py-2.5 px-4 text-xs font-mono focus:outline-none transition-all ${
                      productType === 'raw'
                        ? 'bg-[#020d0a] border-[#0b2d25]/50 text-slate-500 cursor-not-allowed'
                        : 'bg-[#03100c] border-[#0b2d25] text-white focus:border-[#00df89]/60'
                    }`}
                    placeholder="0,00"
                  />
                </div>
              </div>

              {/* Stock and Min Quantity alerts */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#00df89] mb-1.5 uppercase tracking-wide">
                    Estoque Inicial ({(() => {
                      const suffix = unit.match(/\(([^)]+)\)/);
                      return suffix ? suffix[1] : 'un';
                    })()}) *
                  </label>
                  <input
                    type="number"
                    required
                    disabled={!!editingProduct}
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className={`w-full border rounded-xl py-2.5 px-4 text-xs font-mono focus:outline-none transition-all ${
                      editingProduct
                        ? 'bg-[#020d0a] border-[#0b2d25]/50 text-slate-500 cursor-not-allowed'
                        : 'bg-[#03100c] border-[#0b2d25] text-white focus:border-[#00df89]/60'
                    }`}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#00df89] mb-1.5 uppercase tracking-wide">
                    Apenas Alerta se estoque abaixo de *
                  </label>
                  <input
                    type="number"
                    required
                    value={minQuantity}
                    onChange={(e) => setMinQuantity(Number(e.target.value))}
                    className="w-full bg-[#03100c] border border-[#0b2d25] rounded-xl py-2.5 px-4 text-xs text-white focus:border-[#00df89]/60 focus:outline-none font-mono"
                    placeholder="10"
                  />
                </div>
              </div>

              {/* Bottom Buttons */}
              <div className="pt-4 border-t border-[#0b2c23]/40 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-5 py-2.5 bg-[#03100c] hover:bg-[#051c17] text-slate-300 rounded-xl text-xs font-bold border border-[#0b2d25] cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#00df89] hover:bg-[#00b36e] text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#00df89]/10 cursor-pointer transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingProduct ? 'Salvar Especificações' : 'Cadastrar Produto'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EXPANDED EMOJI PICKER MODAL */}
      {showMoreEmojis && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#051713] border border-[#0b2d25] rounded-[24px] w-full max-w-md overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-[#0b2c23]/40 flex items-center justify-between">
              <h4 className="text-xs font-black text-white uppercase tracking-wider font-sans">
                SELECIONAR EMOJI DO PRODUTO
              </h4>
              <button
                type="button"
                onClick={() => setShowMoreEmojis(false)}
                className="text-slate-400 hover:text-white cursor-pointer p-1 rounded-lg hover:bg-[#03100c]/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
              
              {/* Custom search or direct text input to get ANY emoji */}
              <div className="space-y-1.5 bg-[#03100c]/40 p-3 rounded-xl border border-[#0b2d25]">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Digite ou Cole qualquer Emoji
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={2}
                    value={customEmojiInput}
                    onChange={(e) => {
                      const val = e.target.value.trim();
                      setCustomEmojiInput(val);
                      if (val) {
                        setSelectedEmoji(val);
                      }
                    }}
                    placeholder="Ex: 🧉"
                    className="w-16 bg-[#03100c] border border-[#0b2d25] rounded-lg py-1.5 text-center text-lg text-white focus:border-[#00df89]/60 focus:outline-none transition-all font-sans"
                  />
                  <div className="text-[10px] text-slate-500 flex items-center leading-normal">
                    Pressione Win + . (Windows) ou Cmd + Ctrl + Espaço (Mac) para abrir o teclado de emojis do seu sistema.
                  </div>
                </div>
              </div>

              {/* Categorized Emojis */}
              <div className="space-y-4 pt-1">
                {EMOJI_CATEGORIES.map((cat, i) => (
                  <div key={i} className="space-y-1.5">
                    <span className="text-[10px] font-bold text-emerald-400 block tracking-wider uppercase">
                      {cat.name}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.emojis.map((emoji, idx) => (
                        <button
                          key={`${emoji}-${idx}`}
                          type="button"
                          onClick={() => {
                            setSelectedEmoji(emoji);
                            setCustomEmojiInput(emoji);
                            setShowMoreEmojis(false);
                          }}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-base cursor-pointer transition-all border font-sans ${
                            selectedEmoji === emoji
                              ? 'bg-[#00df89] border-[#00df89] text-slate-950 scale-105 shadow-sm shadow-[#00df89]/20'
                              : 'bg-[#03100c]/60 border-[#0b2d25]/60 text-white hover:bg-slate-700 hover:scale-105'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#0b2c23]/40 flex justify-end">
              <button
                type="button"
                onClick={() => setShowMoreEmojis(false)}
                className="px-4 py-1.5 bg-[#00df89] hover:bg-[#00b36e] text-slate-950 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-md shadow-[#00df89]/10"
              >
                Concluir
              </button>
            </div>
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
