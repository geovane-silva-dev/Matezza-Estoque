/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { Client } from '../types';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Search,
  Mail,
  Phone,
  FileText,
  DollarSign,
  Briefcase
} from 'lucide-react';

export const ClientsView: React.FC = () => {
  const {
    clients,
    sales,
    addClient,
    updateClient,
    deleteClient
  } = useERP();

  const [search, setSearch] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [balance, setBalance] = useState(0);
  const [status, setStatus] = useState<'Ativo' | 'Inativo'>('Ativo');

  // Detail panel state (to show selected client purchase history)
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingClient(null);
    setName('');
    setCpfCnpj('');
    setEmail('');
    setPhone('');
    setBalance(0);
    setStatus('Ativo');
    setShowModal(true);
  };

  const openEditModal = (c: Client) => {
    setEditingClient(c);
    setName(c.name);
    setCpfCnpj(c.cpfCnpj);
    setEmail(c.email);
    setPhone(c.phone);
    setBalance(c.balance);
    setStatus(c.status);
    setShowModal(true);
  };

  const handleClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      cpfCnpj,
      email,
      phone,
      balance: Number(balance),
      status
    };

    if (editingClient) {
      updateClient(editingClient.id, payload);
    } else {
      addClient(payload);
    }
    setShowModal(false);
  };

  // Filter clients
  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.cpfCnpj.includes(search) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const getClientSales = (cId: string) => {
    return sales.filter(s => s.clientId === cId);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Stats
  const totalClientsCount = clients.length;
  const activeClientsCount = clients.filter(c => c.status === 'Ativo').length;
  const totalBalancesAmount = clients.reduce((sum, c) => sum + c.balance, 0);
  const clientSalesVolume = sales.filter(s => s.clientId).reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="space-y-6 animate-fadeIn text-slate-100">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Gestão de Clientes & CRM</h1>
          <p className="text-sm text-slate-400">Monitore carteiras de compradores corporativos, analise faturamentos e acompanhe contas correntes.</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/10 transition-all flex items-center gap-2 cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Cadastrar Cliente</span>
        </button>
      </div>

      {/* STATS SUMMARY GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#03110d] border border-[#08241d]/70 p-4 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 bg-[#00df89]/10 border border-[#00df89]/20 rounded-xl flex items-center justify-center text-[#00df89]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">Clientes Ativos / Total</span>
            <span className="text-lg font-black text-white leading-tight font-mono">
              {activeClientsCount} <span className="text-xs text-slate-500">/ {totalClientsCount}</span>
            </span>
          </div>
        </div>

        <div className="bg-[#03110d] border border-[#08241d]/70 p-4 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-400">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">Créditos em Aberto</span>
            <span className="text-lg font-black text-white leading-tight font-mono">
              {formatCurrency(totalBalancesAmount)}
            </span>
          </div>
        </div>

        <div className="bg-[#03110d] border border-[#08241d]/70 p-4 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">Faturamento Integrado</span>
            <span className="text-lg font-black text-white leading-tight font-mono">
              {formatCurrency(clientSalesVolume)}
            </span>
          </div>
        </div>

        <div className="bg-[#03110d] border border-[#08241d]/70 p-4 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 bg-[#00df89]/10 border border-[#00df89]/20 rounded-xl flex items-center justify-center text-[#00df89]">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">Média por Cliente</span>
            <span className="text-lg font-black text-white leading-tight font-mono">
              {formatCurrency(totalClientsCount > 0 ? clientSalesVolume / totalClientsCount : 0)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CLIENTS LIST */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar cliente por nome, e-mail ou documento..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/40 rounded-xl py-2.5 pl-11 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredClients.length === 0 ? (
              <div className="col-span-full py-16 bg-slate-900 border border-dashed border-slate-800 text-center rounded-2xl">
                <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-white">Nenhum cliente cadastrado</h3>
              </div>
            ) : (
              filteredClients.map((c) => {
                const clientSales = getClientSales(c.id);
                const clientSalesCount = clientSales.length;
                const totalSpent = clientSales.reduce((sum, s) => sum + s.total, 0);
                
                return (
                  <div
                    key={c.id}
                    className={`bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all hover:border-slate-700 ${
                      selectedClientId === c.id ? 'border-emerald-500/40 ring-1 ring-emerald-500/20' : 'border-slate-800'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-bold text-white text-sm leading-tight">{c.name}</h4>
                          <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">DOC: {c.cpfCnpj}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          c.status === 'Ativo' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/20' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {c.status}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-400 pt-1.5 border-t border-slate-800/60">
                        <span className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-slate-600 shrink-0" /> {c.email}</span>
                        <span className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-600 shrink-0" /> {c.phone}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-800/60 text-center text-[10px]">
                      <div className="bg-slate-950/40 p-1.5 border border-slate-800/40 rounded-xl">
                        <span className="text-[8px] text-slate-500 block uppercase font-bold">Saldo</span>
                        <span className={`font-bold font-mono block truncate ${c.balance > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                          {formatCurrency(c.balance)}
                        </span>
                      </div>
                      <div className="bg-slate-950/40 p-1.5 border border-slate-800/40 rounded-xl">
                        <span className="text-[8px] text-slate-500 block uppercase font-bold">Compras</span>
                        <span className="font-bold text-white font-mono block">{clientSalesCount} un</span>
                      </div>
                      <div className="bg-slate-950/40 p-1.5 border border-slate-800/40 rounded-xl">
                        <span className="text-[8px] text-slate-500 block uppercase font-bold">Faturado</span>
                        <span className="font-bold text-emerald-400 font-mono block truncate">{formatCurrency(totalSpent)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        onClick={() => setSelectedClientId(selectedClientId === c.id ? null : c.id)}
                        className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                      >
                        {selectedClientId === c.id ? 'Fechar Histórico' : 'Ver Compras'}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(c)}
                          className="p-1 hover:bg-red-950/30 text-slate-400 hover:text-red-400 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* DETAILS PANEL: COMPRAS HISTORIC (1/3) */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-800 mb-4 flex items-center gap-2">
            <Briefcase className="w-4.5 h-4.5 text-emerald-400" />
            <span>Painel Histórico do Cliente</span>
          </h3>

          {!selectedClientId ? (
            <div className="text-center py-20 text-slate-500">
              <Users className="w-10 h-10 text-slate-700 mx-auto mb-2" />
              <p className="text-xs font-semibold">Nenhum cliente selecionado.</p>
              <p className="text-[10px] text-slate-600 mt-0.5">Clique em "Ver Compras" em um cliente para abrir a ficha de histórico consolidada.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(() => {
                const client = clients.find(c => c.id === selectedClientId);
                if (!client) return null;
                const clientSales = getClientSales(client.id);

                return (
                  <>
                    <div>
                      <h4 className="font-bold text-white text-base leading-tight">{client.name}</h4>
                      <p className="text-xs text-slate-400 mt-1">Histórico financeiro com {clientSales.length} notas faturadas.</p>
                    </div>

                    <div className="space-y-2.5 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
                      {clientSales.length === 0 ? (
                        <p className="text-xs text-slate-500 py-6 text-center">Nenhuma transação anterior registrada.</p>
                      ) : (
                        clientSales.map((sale) => (
                          <div key={sale.id} className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs space-y-1">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-mono font-bold text-slate-400">{sale.receiptId}</span>
                              <span className="text-slate-500">{new Date(sale.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center justify-between font-bold pt-1">
                              <span className="text-slate-300">Total Faturado:</span>
                              <span className="text-emerald-400 font-mono">{formatCurrency(sale.total)}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-900 truncate">
                              Itens: {sale.products.map(p => `${p.quantity}x ${p.name.split(' ')[0]}`).join(', ')}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* CLIENT ADD/EDIT FORM MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">
                {editingClient ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">Fechar</button>
            </div>

            <form onSubmit={handleClientSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Razão Social / Nome Completo</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white focus:outline-none"
                  placeholder="Ex: Paraná Mate Distribuidora S.A."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">CPF / CNPJ</label>
                <input
                  type="text"
                  required
                  value={cpfCnpj}
                  onChange={(e) => setCpfCnpj(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white focus:outline-none font-mono"
                  placeholder="Ex: 00.000.000/0001-00"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">E-mail</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white focus:outline-none"
                    placeholder="comercial@parana.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Telefone</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white focus:outline-none"
                    placeholder="(41) 99888-1122"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Saldo Corrente / Crédito (R$)</label>
                  <input
                    type="number"
                    value={balance}
                    onChange={(e) => setBalance(Number(e.target.value))}
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
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-950 text-slate-300 rounded-xl text-xs border border-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 text-slate-950 rounded-xl text-xs font-bold"
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
          <div className="bg-slate-900 border border-rose-500/20 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-6 space-y-4">
              <div className="text-center space-y-2">
                <span className="text-rose-400 text-xs font-bold uppercase tracking-widest block">Confirmar Exclusão</span>
                <p className="text-sm font-bold text-white">Deseja remover definitivamente o cliente "{deleteTarget.name}"?</p>
                <p className="text-[10px] text-slate-400 leading-relaxed">Esta ação não pode ser desfeita e removerá o cliente e seu saldo associado do sistema.</p>
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
                    deleteClient(deleteTarget.id);
                    if (selectedClientId === deleteTarget.id) setSelectedClientId(null);
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
