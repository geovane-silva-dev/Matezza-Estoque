/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { Sale, Product, Client, getProductUnitSuffix } from '../types';
import { jsPDF } from 'jspdf';
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  Receipt,
  User,
  CreditCard,
  DollarSign,
  Calendar,
  FileText,
  Printer,
  ChevronDown,
  X,
  BadgeAlert,
  Check,
  Download
} from 'lucide-react';

interface CartItem {
  product: Product;
  quantity: number;
}

export const SalesView: React.FC = () => {
  const {
    sales,
    products,
    clients,
    addSale,
    deleteSale,
    clearSalesHistory,
    updateSaleStatus,
    showToast
  } = useERP();

  // Cart/PDV State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [customClientName, setCustomClientName] = useState('');
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'Dinheiro' | 'Cartão' | 'Boleto'>('PIX');
  const [saleStatus, setSaleStatus] = useState<'Paga' | 'Pendente'>('Paga');
  const [description, setDescription] = useState('');
  const [paymentTerm, setPaymentTerm] = useState('');

  // Sales History filter states
  const [historySearch, setHistorySearch] = useState('');
  const [historyPeriod, setHistoryPeriod] = useState<'all' | 'today' | '30days'>('all');

  // Receipt Modal State
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);
  const [refundTarget, setRefundTarget] = useState<Sale | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Sale | null>(null);
  const [showClearHistoryConfirm, setShowClearHistoryConfirm] = useState(false);

  // Filter products that are available for sale (non-raw material, has positive price)
  const sellableProducts = products.filter(p => !p.isRawMaterial);

  // PDV Actions
  const addToCart = (p: Product) => {
    if (p.stock <= 0) {
      showToast(`O produto "${p.name}" está temporariamente esgotado no estoque!`, 'error');
      return;
    }

    const existing = cart.find(item => item.product.id === p.id);
    if (existing) {
      if (existing.quantity >= p.stock) {
        showToast(`Não é possível adicionar mais unidades. Limite de estoque físico atingido (${p.stock} ${getProductUnitSuffix(p.unit)}).`, 'error');
        return;
      }
      setCart(cart.map(item => item.product.id === p.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { product: p, quantity: 1 }]);
    }
  };

  const updateCartQuantity = (pId: string, amount: number) => {
    const item = cart.find(i => i.product.id === pId);
    if (!item) return;

    const newQty = item.quantity + amount;
    if (newQty <= 0) {
      setCart(cart.filter(i => i.product.id !== pId));
      return;
    }

    if (newQty > item.product.stock) {
      showToast(`Limite de estoque físico atingido (${item.product.stock} ${getProductUnitSuffix(item.product.unit)}).`, 'error');
      return;
    }

    setCart(cart.map(i => i.product.id === pId ? { ...i, quantity: newQty } : i));
  };

  const setCartQuantity = (pId: string, qty: number) => {
    const item = cart.find(i => i.product.id === pId);
    if (!item) return;

    const targetQty = Math.max(0, qty);

    if (targetQty > item.product.stock) {
      showToast(`Limite de estoque físico atingido (${item.product.stock} ${getProductUnitSuffix(item.product.unit)}).`, 'error');
      setCart(cart.map(i => i.product.id === pId ? { ...i, quantity: item.product.stock } : i));
      return;
    }

    setCart(cart.map(i => i.product.id === pId ? { ...i, quantity: targetQty } : i));
  };

  const removeFromCart = (pId: string) => {
    setCart(cart.filter(i => i.product.id !== pId));
  };

  // Calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const cartTotal = Math.max(0, cartSubtotal - discount + tax);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      showToast('Seu carrinho está vazio!', 'error');
      return;
    }

    const invalidItems = cart.filter(item => item.quantity <= 0);
    if (invalidItems.length > 0) {
      showToast('Existem itens no carrinho com quantidade inválida (menor ou igual a zero). Remova-os ou ajuste a quantidade antes de finalizar.', 'error');
      return;
    }

    let clientName = 'Cliente Consumidor';
    let clientId = '';

    if (selectedClientId) {
      const found = clients.find(c => c.id === selectedClientId);
      if (found) {
        clientName = found.name;
        clientId = found.id;
      }
    } else if (customClientName) {
      clientName = customClientName;
    }

    const saleProducts = cart.map(item => ({
      productId: item.product.id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
      cost: item.product.cost
    }));

    addSale({
      clientId,
      clientName,
      products: saleProducts,
      discount,
      tax,
      total: cartTotal,
      paymentMethod,
      status: saleStatus,
      description: description || undefined,
      paymentTerm: saleStatus === 'Pendente' ? (paymentTerm || undefined) : undefined
    });

    // Clear Cart
    setCart([]);
    setSelectedClientId('');
    setCustomClientName('');
    setDiscount(0);
    setTax(0);
    setPaymentMethod('PIX');
    setSaleStatus('Paga');
    setDescription('');
    setPaymentTerm('');

    showToast('Venda finalizada com sucesso! Recibo gerado.', 'success');
  };

  // Filter history
  const filteredSales = sales.filter(s => {
    const matchesSearch = s.clientName.toLowerCase().includes(historySearch.toLowerCase()) ||
                          s.receiptId.toLowerCase().includes(historySearch.toLowerCase()) ||
                          s.id.toLowerCase().includes(historySearch.toLowerCase());

    let matchesPeriod = true;
    if (historyPeriod === 'today') {
      const todayStr = new Date().toDateString();
      matchesPeriod = new Date(s.createdAt).toDateString() === todayStr;
    } else if (historyPeriod === '30days') {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      matchesPeriod = new Date(s.createdAt) >= thirtyDaysAgo;
    }

    return matchesSearch && matchesPeriod;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    if (!viewingSale) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Color definitions
    const primaryColor = [15, 23, 42]; // Slate 900
    const secondaryColor = [100, 116, 139]; // Slate 500
    const lightBg = [248, 250, 252]; // Slate 50
    const borderLineColor = [226, 232, 240]; // Slate 200

    // Set font style
    doc.setFont("helvetica", "bold");
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("MATEZZA", 20, 25);
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text("MATEZZA INDUSTRIAL LTDA", 20, 30);
    
    doc.setFont("helvetica", "normal");
    doc.text("CNPJ: 63.988.590/0001-22 | Tel: (42) 8807-9911", 20, 34);
    doc.text("São Mateus do Sul, PR", 20, 38);

    // Right header side: Receipt ID & Date
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(140, 18, 50, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.text("RECIBO DE VENDA", 144, 23.5);

    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(11);
    doc.text(viewingSale.receiptId, 144, 31);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    const saleDate = new Date(viewingSale.createdAt);
    doc.text(`${saleDate.toLocaleDateString()} às ${saleDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`, 144, 36);

    // Divider
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.5);
    doc.line(20, 44, 190, 44);

    // Client Info Box
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.rect(20, 49, 170, 18, "F");
    doc.setDrawColor(borderLineColor[0], borderLineColor[1], borderLineColor[2]);
    doc.setLineWidth(0.2);
    doc.rect(20, 49, 170, 18, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text("DADOS DO CLIENTE", 24, 54);

    doc.setFontSize(10);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(viewingSale.clientName, 24, 59);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`Status da Transação: ${viewingSale.status === 'Paga' ? 'CONFIRMADA / FATURADA' : 'PENDENTE DE PAGAMENTO'}`, 24, 63);

    // Products table header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text("DISCRIMINAÇÃO DOS PRODUTOS", 20, 75);

    // Table Header Line
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.4);
    doc.line(20, 78, 190, 78);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Item", 22, 82);
    doc.text("Qtd", 110, 82);
    doc.text("P. Unit", 140, 82);
    doc.text("Subtotal", 170, 82);

    doc.line(20, 84, 190, 84);

    // Table Rows
    doc.setFont("helvetica", "normal");
    let currentY = 89;
    viewingSale.products.forEach((item) => {
      doc.text(item.name, 22, currentY);
      doc.text(String(item.quantity), 110, currentY);
      doc.text(formatCurrency(item.price), 140, currentY);
      doc.setFont("helvetica", "bold");
      doc.text(formatCurrency(item.price * item.quantity), 170, currentY);
      doc.setFont("helvetica", "normal");
      
      // row line
      doc.setDrawColor(borderLineColor[0], borderLineColor[1], borderLineColor[2]);
      doc.setLineWidth(0.15);
      doc.line(20, currentY + 2, 190, currentY + 2);
      
      currentY += 7;
    });

    // Totals calculations
    currentY += 3;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text("Descontos aplicados:", 120, currentY);
    doc.text(`-${formatCurrency(viewingSale.discount)}`, 170, currentY);

    currentY += 5;
    doc.text("Taxas / Adicionais:", 120, currentY);
    doc.text(`+${formatCurrency(viewingSale.tax)}`, 170, currentY);

    currentY += 6;
    // total divider line
    doc.setDrawColor(borderLineColor[0], borderLineColor[1], borderLineColor[2]);
    doc.setLineWidth(0.3);
    doc.line(120, currentY - 3, 190, currentY - 3);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Total Líquido:", 120, currentY);
    doc.setFontSize(10);
    doc.text(formatCurrency(viewingSale.total), 170, currentY);

    doc.setFontSize(8);
    currentY += 5;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text("Método Liquidação:", 120, currentY);
    doc.text(viewingSale.paymentMethod, 170, currentY);

    if (viewingSale.paymentTerm) {
      currentY += 4;
      doc.text("Prazo de Pagamento:", 120, currentY);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(viewingSale.paymentTerm, 170, currentY);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    }

    if (viewingSale.description) {
      currentY += 10;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text("OBSERVAÇÕES DO DOCUMENTO", 20, currentY);

      currentY += 4;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      
      const splitText = doc.splitTextToSize(viewingSale.description, 170);
      doc.text(splitText, 20, currentY);
      
      currentY += (splitText.length * 4.5);
    }

    // Signatures Area
    currentY = Math.max(currentY + 15, 185); // ensure it sits at a clean vertical position
    
    doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setLineWidth(0.25);
    
    // Line 1: Vendedor
    doc.line(25, currentY, 95, currentY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Assinatura do Vendedor", 42, currentY + 4);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text("Representante Matezza", 44, currentY + 7);

    // Line 2: Cliente
    doc.line(115, currentY, 185, currentY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Assinatura do Cliente", 133, currentY + 4);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text("Recebedor Autorizado", 135, currentY + 7);

    // Footer
    currentY += 22;
    doc.setDrawColor(borderLineColor[0], borderLineColor[1], borderLineColor[2]);
    doc.setLineWidth(0.2);
    doc.line(20, currentY, 190, currentY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.text("Obrigado pela preferência! MATEZZA ERP Corporativo.", 65, currentY + 5);
    doc.setFontSize(6.5);
    doc.text("Comprovante de faturamento eletrônico gerado de forma segura.", 68, currentY + 8);

    // Save
    doc.save(`recibo-${viewingSale.receiptId}.pdf`);
  };

  return (
    <div className="space-y-8 animate-fadeIn text-slate-100">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Vendas & Ponto de Venda (PDV)</h1>
        <p className="text-sm text-slate-400">Registre saídas de produtos acabados, conceda descontos corporativos e gere recibos industriais.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: PRODUCT SELECTION & PDV CART (8/12) */}
        <div className="lg:col-span-8 space-y-6">
          {/* CART SELECTION GRID */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
            <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
              <ShoppingCart className="w-4.5 h-4.5 text-emerald-400" />
              <span>Produtos para Venda Direta</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[340px] overflow-y-auto custom-scrollbar pr-1">
              {sellableProducts.map((p) => {
                const isOutOfStock = p.stock <= 0;
                const isLow = p.stock <= p.minQuantity && p.stock > 0;
                
                return (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className="p-3 bg-slate-950/50 hover:bg-slate-950 border border-slate-800 hover:border-emerald-500/30 rounded-xl flex flex-col justify-between text-left transition-all h-36 group relative"
                  >
                    <div className="space-y-1.5 w-full">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[9px] text-slate-500 font-bold truncate uppercase">{p.category}</span>
                        {isOutOfStock ? (
                          <span className="text-[8px] bg-red-950/60 text-red-400 border border-red-900/30 px-1 rounded font-bold uppercase">Esgotado</span>
                        ) : isLow ? (
                          <span className="text-[8px] bg-amber-950/60 text-amber-400 border border-amber-900/30 px-1 rounded font-bold uppercase">Baixo</span>
                        ) : null}
                      </div>
                      <h4 className="text-xs font-bold text-slate-200 line-clamp-2 leading-tight group-hover:text-emerald-400 transition-colors">{p.name}</h4>
                    </div>

                    <div className="w-full pt-1 border-t border-slate-900 flex items-center justify-between text-xs mt-auto">
                      <span className="font-bold text-emerald-400">{formatCurrency(p.price)}</span>
                      <span className="text-[10px] text-slate-500 font-mono">Qtd: {p.stock} {getProductUnitSuffix(p.unit)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ACTIVE PDV CART LIST */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between min-h-[300px]">
            <div>
              <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
                <span>Carrinho de Compra Ativo</span>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-0.5 rounded-full font-bold">{cart.length} itens</span>
              </h3>

              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-semibold">O carrinho está vazio.</p>
                  <p className="text-[10px] text-slate-600 mt-0.5">Selecione produtos acima para iniciar o faturamento.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-800/80 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                  {cart.map((item) => (
                    <div key={item.product.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-white block truncate leading-tight">{item.product.name}</span>
                        <span className="text-[10px] text-slate-500 mt-1 block">Preço unitário: {formatCurrency(item.product.price)}</span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, -1)}
                          className="w-7 h-7 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          min={0}
                          max={item.product.stock}
                          value={item.quantity === 0 ? '' : item.quantity}
                          placeholder="0"
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setCartQuantity(item.product.id, isNaN(val) ? 0 : val);
                          }}
                          className="w-12 text-center font-bold font-mono text-white text-xs bg-slate-950 border border-slate-800 rounded-lg py-1 focus:outline-none focus:border-emerald-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          onClick={() => updateCartQuantity(item.product.id, 1)}
                          className="w-7 h-7 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Item total & remove */}
                      <div className="text-right min-w-[70px]">
                        <span className="font-bold text-emerald-400 block">{formatCurrency(item.product.price * item.quantity)}</span>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-slate-600 hover:text-red-400 p-1.5 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CLIENT & BILLING SETTINGS (4/12) */}
        <div className="lg:col-span-4">
          <form onSubmit={handleCheckout} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 h-full flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">Checkout / Pagamento</h3>

              {/* Select Client */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Cliente Vinculado</label>
                <select
                  value={selectedClientId}
                  onChange={(e) => {
                    setSelectedClientId(e.target.value);
                    if (e.target.value) setCustomClientName('');
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs font-semibold text-slate-300 focus:outline-none"
                >
                  <option value="">— Cliente Não Cadastrado / Consumidor —</option>
                  {clients.filter(c => c.status === 'Ativo').map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.cpfCnpj})</option>
                  ))}
                </select>
              </div>

              {/* Custom client text if not selected */}
              {!selectedClientId && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nome do Cliente Avulso</label>
                  <input
                    type="text"
                    value={customClientName}
                    onChange={(e) => setCustomClientName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-600 focus:outline-none"
                    placeholder="Nome do cliente consumidor..."
                  />
                </div>
              )}

              {/* Payment Method */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Método de Liquidação</label>
                <div className="grid grid-cols-2 gap-2">
                  {['PIX', 'Dinheiro', 'Cartão', 'Boleto'].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method as any)}
                      className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all ${
                        paymentMethod === method
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Term Options */}
              {saleStatus === 'Pendente' && (
                <div className="space-y-2.5 animate-fadeIn p-3.5 bg-slate-950/40 border border-slate-800/80 rounded-2xl">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Prazo de Vencimento / Pagamento</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['30 dias', '30/60 dias', '30/60/90 dias'].map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => setPaymentTerm(term)}
                        className={`py-1.5 px-2 text-[10px] font-bold rounded-lg border transition-all ${
                          paymentTerm === term
                            ? 'bg-emerald-500/15 border-emerald-500/80 text-emerald-400'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={paymentTerm}
                    onChange={(e) => setPaymentTerm(e.target.value)}
                    placeholder="Outro prazo (ex: 15 dias, 45 dias...)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/40"
                  />
                </div>
              )}

              {/* Sale status toggle */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Status do Lançamento</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Paga', 'Pendente'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setSaleStatus(st as any)}
                      className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all ${
                        saleStatus === st
                          ? st === 'Paga' 
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                            : 'bg-amber-500/10 border-amber-500 text-amber-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {st === 'Paga' ? 'Paga (Faturada)' : 'Pendente (A prazo)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description Option */}
              <div className="space-y-1.5 animate-fadeIn">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Descrição / Observações da Venda</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Condições de pagamento, observações de entrega, detalhes adicionais..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/40 resize-none"
                />
              </div>

              {/* Discount and tax */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Desconto (R$)</label>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Encargos/Frete (R$)</label>
                  <input
                    type="number"
                    value={tax}
                    onChange={(e) => setTax(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Calculations Summary */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Subtotal do Carrinho:</span>
                <span className="font-mono">{formatCurrency(cartSubtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex items-center justify-between text-xs text-red-400">
                  <span>Descontos:</span>
                  <span className="font-mono">-{formatCurrency(discount)}</span>
                </div>
              )}
              {tax > 0 && (
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Taxas / Adicionais:</span>
                  <span className="font-mono">+{formatCurrency(tax)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm font-bold text-white pt-1">
                <span>Total a Pagar:</span>
                <span className="text-lg text-emerald-400 font-mono">{formatCurrency(cartTotal)}</span>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold text-xs py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer mt-2"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Confirmar e Emitir Recibo</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* SALES HISTORY LIST */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-md font-semibold text-white">Histórico de Faturamento</h3>
            <p className="text-xs text-slate-400">Acompanhe lançamentos, reembolse pedidos e emita vias de notas/recibos.</p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Filtrar faturamentos..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl py-1.5 pl-9 pr-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/40"
              />
            </div>
            <select
              value={historyPeriod}
              onChange={(e) => setHistoryPeriod(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-xl py-1.5 px-2.5 text-xs text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="all">Todo Histórico</option>
              <option value="today">Hoje</option>
              <option value="30days">Últimos 30 Dias</option>
            </select>
            {sales.length > 0 && (
              <button
                type="button"
                onClick={() => setShowClearHistoryConfirm(true)}
                className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/30 text-red-400 border border-red-900/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                title="Apagar todo o histórico de faturamento"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpar Histórico</span>
              </button>
            )}
          </div>
        </div>

        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/30">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                  <th className="py-3 px-4">Recibo ID</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Método</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Total faturado</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-xs">
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      Nenhuma venda faturada encontrada.
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-900/40 text-slate-300 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-white">{sale.receiptId}</td>
                      <td className="py-3.5 px-4 font-semibold">{sale.clientName}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md font-semibold text-[10px] bg-slate-800 text-slate-300">
                          {sale.paymentMethod}{sale.paymentTerm ? ` (${sale.paymentTerm})` : ''}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {sale.status === 'Paga' ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-950/40 text-emerald-400 border border-emerald-900/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            Faturada
                          </span>
                        ) : sale.status === 'Cancelada' ? (
                          <span className="inline-flex items-center gap-1 bg-rose-950/40 text-rose-400 border border-rose-900/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            Cancelada
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 bg-amber-950/40 text-amber-400 border border-amber-900/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                              Pendente
                            </span>
                            <button
                              onClick={() => {
                                updateSaleStatus(sale.id, 'Paga');
                                showToast('Venda faturada e liquidada com sucesso!', 'success');
                              }}
                              className="p-1 bg-[#0a352a]/60 hover:bg-[#00df89]/25 text-[#00df89] hover:text-white rounded-lg border border-[#0d4738] transition-all cursor-pointer flex items-center justify-center"
                              title="Marcar como Pago"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white font-mono">{formatCurrency(sale.total)}</td>
                      <td className="py-3.5 px-4 text-right space-x-1.5">
                        <button
                          onClick={() => setViewingSale(sale)}
                          className="px-2.5 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-300 rounded-lg text-[10px] font-semibold transition-all cursor-pointer inline-flex items-center"
                        >
                          Ver Recibo
                        </button>
                        {sale.status !== 'Cancelada' && (
                          <button
                            onClick={() => setRefundTarget(sale)}
                            className="px-2.5 py-1 bg-slate-900 border border-slate-800 hover:border-amber-900 hover:bg-amber-950/10 text-slate-400 hover:text-amber-400 rounded-lg text-[10px] font-semibold transition-all cursor-pointer inline-flex items-center"
                          >
                            Estornar
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteTarget(sale)}
                          className="p-1 bg-slate-900 border border-slate-800 hover:border-rose-900 hover:bg-rose-950/20 text-slate-400 hover:text-rose-400 rounded-lg transition-all inline-flex items-center justify-center cursor-pointer align-middle"
                          title="Excluir Registro"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* DETAILED RECEIPT MODAL (INVOICE STYLE) */}
      {viewingSale && (
        <div id="receipt-modal-overlay" className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative">
            
            {/* Action buttons (fixed outside print area) */}
            <div className="absolute right-4 top-4 flex items-center gap-2 z-10 print:hidden">
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-950/80 border border-emerald-800/60 hover:bg-emerald-900 text-emerald-400 hover:text-emerald-200 rounded-xl transition-all cursor-pointer text-xs font-bold"
                title="Baixar PDF"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>
              <button
                onClick={handlePrint}
                className="p-1.5 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 rounded-xl transition-colors cursor-pointer"
                title="Imprimir"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewingSale(null)}
                className="p-1.5 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Print area */}
            <div id="printable-receipt" className="p-8 space-y-6 bg-white text-slate-950 print:p-0">
              {/* Receipt Header */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-950 text-white rounded-lg flex items-center justify-center font-bold font-mono">M</div>
                    <span className="text-xl font-black tracking-widest text-slate-950 font-sans">MATEZZA</span>
                  </div>
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">MATEZZA INDUSTRIAL LTDA</span>
                  <p className="text-[10px] text-slate-500 mt-1 max-w-[200px]">CNPJ: 63.988.590/0001-22 | Tel: (42) 8807-9911 | São Mateus do Sul, PR</p>
                </div>
                <div className="text-right">
                  <span className="text-xs bg-slate-950 text-white font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">Recibo de Venda</span>
                  <h4 className="text-sm font-bold text-slate-950 font-mono mt-2">{viewingSale.receiptId}</h4>
                  <span className="text-[10px] text-slate-500 block">{new Date(viewingSale.createdAt).toLocaleDateString()} às {new Date(viewingSale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              {/* Client Info */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Dados do Cliente</span>
                <p className="font-bold text-slate-900">{viewingSale.clientName}</p>
                <p className="text-[10px] text-slate-500">Status da Transação: 
                  <strong className={viewingSale.status === 'Paga' ? ' text-emerald-600 ml-1' : ' text-amber-600 ml-1'}>
                    {viewingSale.status === 'Paga' ? 'CONFIRMADA / FATURADA' : 'PENDENTE DE PAGAMENTO'}
                  </strong>
                </p>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Discriminação dos Produtos</span>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-900 font-bold text-slate-800">
                      <th className="py-2">Item</th>
                      <th className="py-2 text-center">Qtd</th>
                      <th className="py-2 text-right">P.Unit</th>
                      <th className="py-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {viewingSale.products.map((item, idx) => (
                      <tr key={idx} className="text-slate-700">
                        <td className="py-2.5 max-w-[180px] truncate">{item.name}</td>
                        <td className="py-2.5 text-center font-mono">{item.quantity}</td>
                        <td className="py-2.5 text-right font-mono">{formatCurrency(item.price)}</td>
                        <td className="py-2.5 text-right font-mono text-slate-950 font-bold">{formatCurrency(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total calculations */}
              <div className="border-t border-slate-200 pt-4 text-xs flex justify-end">
                <div className="w-56 space-y-1.5 font-semibold">
                  <div className="flex justify-between text-slate-500">
                    <span>Descontos aplicados:</span>
                    <span className="font-mono">-{formatCurrency(viewingSale.discount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Taxas / Adicionais:</span>
                    <span className="font-mono">+{formatCurrency(viewingSale.tax)}</span>
                  </div>
                  <div className="flex justify-between text-slate-950 font-bold pt-1.5 border-t border-slate-300">
                    <span>Total Líquido:</span>
                    <span className="text-sm font-black font-mono">{formatCurrency(viewingSale.total)}</span>
                  </div>
                   <div className="flex justify-between text-[10px] text-slate-500 pt-1">
                    <span>Método Liquidação:</span>
                    <span className="uppercase">{viewingSale.paymentMethod}</span>
                  </div>
                  {viewingSale.paymentTerm && (
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Prazo de Pagamento:</span>
                      <span className="font-bold text-slate-900">{viewingSale.paymentTerm}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Document Description / Observations */}
              {viewingSale.description && (
                <div className="border-t border-slate-200 pt-4 pb-1 text-left">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Observações do Documento</span>
                  <p className="text-[10.5px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 leading-relaxed italic">
                    {viewingSale.description}
                  </p>
                </div>
              )}

              {/* Signatures Area */}
              <div className="grid grid-cols-2 gap-6 pt-8 pb-4 border-t border-slate-100">
                <div className="text-center space-y-1">
                  <div className="border-b border-slate-300 w-full h-8"></div>
                  <span className="text-[9px] font-bold text-slate-700 block uppercase tracking-wider">Assinatura do Vendedor</span>
                  <span className="text-[8px] text-slate-400 block">Representante Matezza</span>
                </div>
                <div className="text-center space-y-1">
                  <div className="border-b border-slate-300 w-full h-8"></div>
                  <span className="text-[9px] font-bold text-slate-700 block uppercase tracking-wider">Assinatura do Cliente</span>
                  <span className="text-[8px] text-slate-400 block">Recebedor Autorizado</span>
                </div>
              </div>

              {/* Footer signature */}
              <div className="pt-8 text-center text-[10px] text-slate-400 border-t border-dashed border-slate-300">
                <p>Obrigado pela preferência! MATEZZA ERP Corporativo.</p>
                <p className="mt-0.5 text-[8px]">Comprovante de faturamento eletrônico gerado de forma segura.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM REFUND/CANCEL CONFIRMATION MODAL */}
      {refundTarget && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-rose-500/20 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-6 space-y-4">
              <div className="text-center space-y-2">
                <span className="text-rose-400 text-xs font-bold uppercase tracking-widest block">Estornar Venda</span>
                <p className="text-sm font-bold text-white">Cancelar faturamento "{refundTarget.receiptId}"?</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Atenção: Cancelar esta venda irá estornar de volta ao estoque físico todos os produtos faturados nela. Esta operação altera os relatórios financeiros.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRefundTarget(null)}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold border border-slate-800 cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateSaleStatus(refundTarget.id, 'Cancelada');
                    setRefundTarget(null);
                  }}
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Confirmar Estorno
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-rose-500/20 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-6 space-y-4">
              <div className="text-center space-y-2">
                <span className="text-rose-400 text-xs font-bold uppercase tracking-widest block">Excluir Registro</span>
                <p className="text-sm font-bold text-white">Deletar venda "{deleteTarget.receiptId}"?</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Atenção: Deseja apagar este registro de venda permanentemente? Isso irá estornar o estoque correspondente de volta aos produtos.
                </p>
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
                    deleteSale(deleteTarget.id);
                    setDeleteTarget(null);
                    showToast('Registro de venda excluído!', 'info');
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

      {/* CUSTOM CLEAR ALL HISTORY CONFIRMATION MODAL */}
      {showClearHistoryConfirm && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-red-500/25 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-scaleIn">
            <div className="p-6 space-y-4">
              <div className="text-center space-y-2">
                <span className="text-rose-400 text-xs font-bold uppercase tracking-widest block font-sans">Limpar Histórico</span>
                <p className="text-sm font-bold text-white">Limpar todo o faturamento?</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Atenção: Tem certeza de que deseja APAGAR TODO o histórico de faturamento de vendas? Esta ação é irreversível e apagará todos os registros salvos de vendas.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClearHistoryConfirm(false)}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold border border-slate-800 cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearSalesHistory();
                    setShowClearHistoryConfirm(false);
                    showToast('Histórico de faturamento de vendas limpo com sucesso!', 'info');
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Confirmar Limpeza
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
