/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { User, UserRole } from '../types';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Search,
  Mail,
  Shield,
  Clock,
  UserCheck,
  X,
  AlertCircle
} from 'lucide-react';

export const EmployeesView: React.FC = () => {
  const {
    users,
    registerUser,
    updateUser,
    deleteUser,
    currentUser,
    showToast
  } = useERP();

  const [search, setSearch] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Funcionário');

  const openAddModal = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setRole('Funcionário');
    setShowModal(true);
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setRole(u.role);
    setShowModal(true);
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      showToast('Por favor, preencha todos os campos.', 'error');
      return;
    }

    if (editingUser) {
      updateUser(editingUser.id, { name, email, role });
      showToast('Funcionário atualizado com sucesso!', 'success');
    } else {
      // Check if email already registered
      const emailExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
      if (emailExists) {
        showToast('Este e-mail já está cadastrado para outro funcionário.', 'error');
        return;
      }
      registerUser(name, email, role);
      showToast('Funcionário cadastrado com sucesso!', 'success');
    }
    setShowModal(false);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    if (currentUser && currentUser.id === deleteTarget.id) {
      showToast('Você não pode excluir a si mesmo!', 'error');
      setDeleteTarget(null);
      return;
    }
    deleteUser(deleteTarget.id);
    showToast('Funcionário excluído com sucesso!', 'success');
    setDeleteTarget(null);
  };

  // Filter users/employees
  const filteredEmployees = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fadeIn text-slate-100">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#051713] border border-[#0b2d25] p-6 rounded-[28px]">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="bg-[#00df89]/15 text-[#00df89] border border-[#00df89]/20 text-[9px] font-black tracking-widest px-2.5 py-1 rounded-md uppercase font-mono">
              RECURSOS HUMANOS
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans">Controle de Funcionários</h1>
          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            Cadastre, edite e gerencie as pessoas da equipe que realizam as operações industriais. Elas estarão disponíveis como responsáveis na execução de ordens de produção.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-[#00df89] hover:bg-[#00b36e] text-slate-950 px-5 py-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-[#00df89]/10 uppercase font-sans tracking-wide shrink-0 self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Funcionário</span>
        </button>
      </div>

      {/* FILTER & STATS AREA */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Buscar por nome, email ou cargo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#03100c] border border-[#0b2d25] rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#00df89]/50 transition-colors"
          />
        </div>

        {/* Stats Grid */}
        <div className="flex items-center gap-4 bg-[#03100c]/40 border border-[#0b2d25]/60 px-4 py-2 rounded-2xl">
          <div className="text-xs">
            <span className="text-slate-500 font-medium uppercase tracking-wider text-[9px] block">TOTAL DE EQUIPE</span>
            <span className="text-white font-mono font-bold text-sm">{users.length} Colaboradores</span>
          </div>
          <div className="h-6 w-px bg-[#0b2d25]" />
          <div className="text-xs">
            <span className="text-slate-500 font-medium uppercase tracking-wider text-[9px] block">OPERADORES / FUNCIONÁRIOS</span>
            <span className="text-emerald-400 font-mono font-bold text-sm">
              {users.filter(u => u.role !== 'Administrador').length} ativos
            </span>
          </div>
        </div>
      </div>

      {/* EMPLOYEES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEmployees.map(emp => {
          return (
            <div
              key={emp.id}
              className="bg-[#051713] border border-[#0b2d25] rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-[#00df89]/30 transition-all group"
            >
              <div className="space-y-4">
                {/* Header info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00b36e]/20 to-[#00df89]/20 border border-[#00df89]/30 flex items-center justify-center text-[#00df89] font-black text-sm shadow-md">
                      {emp.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-mono text-[#00df89] font-bold uppercase">{emp.id}</span>
                      <h3 className="text-xs font-black text-white group-hover:text-[#00df89] transition-colors">{emp.name}</h3>
                    </div>
                  </div>

                  <span className={`text-[9px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider border ${
                    emp.role === 'Administrador'
                      ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                      : emp.role === 'Operador'
                        ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                        : 'bg-emerald-500/10 border-emerald-500/20 text-[#00df89]'
                  }`}>
                    {emp.role}
                  </span>
                </div>

                {/* Details list */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Cadastrado em {new Date(emp.createdAt || Date.now()).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>

              {/* Actions row */}
              <div className="pt-4 border-t border-[#0b2c23]/50 flex justify-end gap-2">
                <button
                  onClick={() => openEditModal(emp)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#03100c] border border-transparent hover:border-[#0b2d25] transition-all cursor-pointer flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider"
                  title="Editar Funcionário"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#00df89]" />
                  <span>Editar</span>
                </button>

                <button
                  onClick={() => setDeleteTarget(emp)}
                  disabled={currentUser?.id === emp.id}
                  className={`p-2 rounded-lg border border-transparent transition-all flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${
                    currentUser?.id === emp.id
                      ? 'text-slate-600 cursor-not-allowed'
                      : 'text-slate-400 hover:text-rose-400 hover:bg-[#1f0b0b] hover:border-rose-950/50 cursor-pointer'
                  }`}
                  title={currentUser?.id === emp.id ? "Você não pode deletar você mesmo" : "Remover Funcionário"}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Excluir</span>
                </button>
              </div>
            </div>
          );
        })}

        {filteredEmployees.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-500 font-mono text-xs uppercase tracking-wider bg-[#051713]/40 border border-dashed border-[#0b2d25] rounded-2xl">
            Nenhum funcionário encontrado com estes filtros de busca.
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 z-40 animate-fadeIn">
          <div className="bg-[#051713] border border-[#0b2d25] rounded-[28px] w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#0b2c23]/40 flex items-center justify-between bg-[#03100c]/40">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#00df89]" />
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider font-sans">
                    {editingUser ? 'Editar Funcionário' : 'Novo Funcionário'}
                  </h3>
                  <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider block">Dados Cadastrais</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer p-1.5 rounded-lg hover:bg-[#03100c]/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleUserSubmit} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João da Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#03100c] border border-[#0b2d25] rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#00df89]"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">E-mail</label>
                <input
                  type="email"
                  required
                  placeholder="Ex: joao@matezza.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#03100c] border border-[#0b2d25] rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#00df89]"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Cargo / Função</label>
                <select
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-[#03100c] border border-[#0b2d25] rounded-xl py-2.5 px-3 text-xs font-bold text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="Funcionário">Funcionário</option>
                  <option value="Operador">Operador</option>
                  <option value="Administrador">Administrador</option>
                </select>
              </div>

              {/* Actions Footer */}
              <div className="flex gap-2.5 pt-4 border-t border-[#0b2c23]/30">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 bg-[#03100c] hover:bg-[#07241b] border border-[#0b2d25] text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#00df89] hover:bg-[#00b36e] text-slate-950 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md text-center"
                >
                  {editingUser ? 'Salvar Alterações' : 'Confirmar Cadastro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#051713] border border-[#0b2d25] rounded-[24px] w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="p-6 space-y-4">
              <div className="text-center space-y-2">
                <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
                <span className="text-rose-400 text-xs font-bold uppercase tracking-widest block">Remover Funcionário</span>
                <p className="text-sm font-bold text-white">Deletar permanentemente {deleteTarget.name}?</p>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Esta ação irá remover o colaborador de nossos cadastros de pessoal ativo.
                </p>
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
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
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
