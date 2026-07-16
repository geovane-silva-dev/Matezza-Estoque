/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { Expense } from '../types';
import {
  DollarSign,
  Plus,
  Trash2,
  Edit3,
  Calendar,
  AlertTriangle,
  CheckCircle,
  FileText,
  Search,
  Filter,
  Check
} from 'lucide-react';

export const ExpensesView: React.FC = () => {
  const {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    showToast
  } = useERP();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Pago' | 'Pendente'>('all');

  // Modal States
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);

  // Form states
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'Funcionários' | 'Energia' | 'Água' | 'Internet' | 'Aluguel' | 'Matéria-Prima' | 'Outros'>('Outros');
  const [amount, setAmount] = useState(100);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<'Pago' | 'Pendente'>('Pago');

  const openAddModal = () => {
    setEditingExpense(null);
    setDescription('');
    setCategory('Outros');
    setAmount(150);
    setDate(new Date().toISOString().split('T')[0]);
    setStatus('Pago');
    setShowExpenseModal(true);
  };

  const openEditModal = (exp: Expense) => {
    setEditingExpense(exp);
    setDescription(exp.description);
    setCategory(exp.category);
    setAmount(exp.amount);
    setDate(exp.date);
    setStatus(exp.status);
    setShowExpenseModal(true);
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      description,
      category,
      amount: Number(amount),
      date,
      status
    };

    if (editingExpense) {
      updateExpense(editingExpense.id, payload);
    } else {
      addExpense(payload);
    }
    setShowExpenseModal(false);
  };

  // Calculations
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const pendingExpenses = expenses.filter(e => e.status === 'Pendente').reduce((sum, e) => sum + e.amount, 0);
  const paidExpenses = expenses.filter(e => e.status === 'Pago').reduce((sum, e) => sum + e.amount, 0);

  // Filter list
  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = e.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || e.category === selectedCategory;
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6 animate-fadeIn text-slate-100">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Custos & Despesas</h1>
          <p className="text-sm text-slate-400">Lance contas fixas, faturas de concessionárias, folhas de pagamento e despesas operacionais da planta.</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/10 transition-all flex items-center gap-2 cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Lançar Despesa</span>
        </button>
      </div>

      {/* METRIC SUB-CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Total Lançado</span>
          <h4 className="text-xl font-bold text-white font-mono mt-1">{formatCurrency(totalExpenses)}</h4>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Pago (Liquidado)</span>
          <h4 className="text-xl font-bold text-emerald-400 font-mono mt-1">{formatCurrency(paidExpenses)}</h4>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">A Pagar (Pendente)</span>
          <h4 className="text-xl font-bold text-amber-500 font-mono mt-1">{formatCurrency(pendingExpenses)}</h4>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar despesa por descrição..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-600 focus:outline-none"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-300 focus:outline-none cursor-pointer"
        >
          <option value="all">Categoria: Todas</option>
          <option value="Funcionários">Funcionários</option>
          <option value="Energia">Energia</option>
          <option value="Água">Água</option>
          <option value="Internet">Internet</option>
          <option value="Aluguel">Aluguel</option>
          <option value="Matéria-Prima">Matéria-Prima</option>
          <option value="Outros">Outros</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-300 focus:outline-none cursor-pointer"
        >
          <option value="all">Status: Todos</option>
          <option value="Pago">Pago</option>
          <option value="Pendente">Pendente</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/30">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                <th className="py-3 px-4">Descrição</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Vencimento</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Valor</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Nenhuma despesa ou custo lançado para este filtro.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-900/40 text-slate-300 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">{exp.description}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md font-semibold text-[10px] bg-slate-800 text-slate-300">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      {new Date(exp.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3.5 px-4">
                      {exp.status === 'Pago' ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-950/40 text-emerald-400 border border-emerald-900/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          Pago
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 bg-amber-950/40 text-amber-400 border border-amber-900/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            Pendente
                          </span>
                          <button
                            onClick={() => {
                              updateExpense(exp.id, { status: 'Pago' });
                              showToast('Despesa liquidada e marcada como Paga!', 'success');
                            }}
                            className="p-1 bg-[#0a352a]/60 hover:bg-[#00df89]/25 text-[#00df89] hover:text-white rounded-lg border border-[#0d4738] transition-all cursor-pointer flex items-center justify-center"
                            title="Marcar como Pago"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white font-mono">{formatCurrency(exp.amount)}</td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => openEditModal(exp)}
                        className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(exp)}
                        className="p-1 hover:bg-red-950/30 text-slate-400 hover:text-red-400 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EXPENSE FORM MODAL */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">
                {editingExpense ? 'Editar Lançamento' : 'Lançar Nova Despesa'}
              </h3>
              <button onClick={() => setShowExpenseModal(false)} className="text-slate-400 hover:text-white">Fechar</button>
            </div>

            <form onSubmit={handleExpenseSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Descrição / Justificativa</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white focus:outline-none"
                  placeholder="Ex: Fatura de luz Copel Ref Julho"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white focus:outline-none"
                  >
                    <option value="Funcionários">Funcionários</option>
                    <option value="Energia">Energia</option>
                    <option value="Água">Água</option>
                    <option value="Internet">Internet</option>
                    <option value="Aluguel">Aluguel</option>
                    <option value="Matéria-Prima">Matéria-Prima</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Vencimento</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white focus:outline-none"
                  >
                    <option value="Pago">Liquidado (Pago)</option>
                    <option value="Pendente">A pagar (Pendente)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 bg-slate-950 text-slate-300 rounded-xl text-xs border border-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 text-slate-950 rounded-xl text-xs font-bold"
                >
                  Confirmar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOM DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-slate-900 border border-rose-500/20 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-6 space-y-4">
              <div className="text-center space-y-2">
                <span className="text-rose-400 text-xs font-bold uppercase tracking-widest block">Excluir Lançamento</span>
                <p className="text-sm font-bold text-white">Deletar a despesa "{deleteTarget.description}"?</p>
                <p className="text-[10px] text-slate-400 leading-relaxed">Esta ação não pode ser desfeita e removerá este registro de despesa do fluxo financeiro.</p>
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
                    deleteExpense(deleteTarget.id);
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
