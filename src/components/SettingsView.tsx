/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { UserRole } from '../types';
import {
  Settings,
  Database,
  Building,
  Users,
  ShieldAlert,
  Moon,
  Sun,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Lock,
  UserCheck
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    users,
    updateUserRole,
    exportDatabase,
    importDatabase,
    clearDatabase,
    auditLogs
  } = useERP();

  const [companyName, setCompanyName] = useState(settings.companyName);
  const [companyLogo, setCompanyLogo] = useState(settings.companyLogo || '');
  const [jsonPaste, setJsonPaste] = useState('');
  const [showJsonInput, setShowJsonInput] = useState(false);
  const [showExported, setShowExported] = useState(false);
  const [exportedJson, setExportedJson] = useState('');

  const handleCompanySave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      companyName,
      companyLogo: companyLogo || undefined
    });
    alert('Configurações institucionais salvas com sucesso!');
  };

  const handleExport = () => {
    const json = exportDatabase();
    setExportedJson(json);
    setShowExported(true);
    
    // Auto download
    try {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup_matezza_erp_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
    } catch (err) {
      console.error(err);
    }
  };

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jsonPaste) return;
    const success = importDatabase(jsonPaste);
    if (success) {
      alert('Banco de dados restaurado com sucesso! Recarregando módulos...');
      setJsonPaste('');
      setShowJsonInput(false);
      window.location.reload();
    } else {
      alert('Falha na importação. JSON com formatação inválida.');
    }
  };

  const handleReset = () => {
    if (confirm('ATENÇÃO: Isso irá DELETAR todos os dados (vendas, produções, despesas, alertas, recados) e restaurar o sistema aos dados padrão de fábrica MATEZZA. Deseja realmente prosseguir?')) {
      clearDatabase();
      alert('Sistema restaurado de fábrica! Recarregando...');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn text-slate-100">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Configurações do ERP</h1>
        <p className="text-sm text-slate-400">Gerencie a identidade corporativa, controle acessos/funções e manipule backups estruturados de dados.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* COMPANY DETAILS CARD */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
          <form onSubmit={handleCompanySave} className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-400" />
              <span>Identidade Corporativa</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Razão Social da Empresa</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-emerald-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">URL da Logomarca (PNG/SVG)</label>
              <input
                type="text"
                value={companyLogo}
                onChange={(e) => setCompanyLogo(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-emerald-500/40"
                placeholder="Ex: link da imagem da empresa"
              />
            </div>

            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Esquema de Cores Ativo</span>
                <span className="text-[10px] text-slate-500">MATEZZA utiliza a paleta Dark Metálico por padrão.</span>
              </div>
              <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => updateSettings({ darkMode: true })}
                  className={`p-1.5 rounded ${settings.darkMode ? 'bg-slate-950 text-emerald-400' : 'text-slate-500 hover:text-white'}`}
                  title="Modo Escuro"
                >
                  <Moon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => updateSettings({ darkMode: false })}
                  className={`p-1.5 rounded ${!settings.darkMode ? 'bg-slate-950 text-amber-400' : 'text-slate-500 hover:text-white'}`}
                  title="Modo Claro"
                >
                  <Sun className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl uppercase tracking-wider transition-all self-start"
            >
              Salvar Identidade
            </button>
          </form>
        </div>

        {/* DATABASE BACKUP AND RESET */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Gerenciamento de Backup (JSON)</span>
            </h3>
            <p className="text-xs text-slate-400">Exporte ou importe a estrutura completa do ERP local para fins de replicação rápida e backups externos.</p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleExport}
                className="py-3 px-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Exportar Dados</span>
              </button>

              <button
                type="button"
                onClick={() => setShowJsonInput(!showJsonInput)}
                className="py-3 px-4 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4 text-sky-400" />
                <span>Restaurar Backup</span>
              </button>
            </div>

            {/* Pasting Backup Form */}
            {showJsonInput && (
              <form onSubmit={handleImport} className="space-y-2 pt-2 animate-fadeIn">
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Cole o JSON do Backup abaixo:</label>
                <textarea
                  required
                  rows={3}
                  value={jsonPaste}
                  onChange={(e) => setJsonPaste(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-[11px] text-slate-300 font-mono focus:outline-none"
                  placeholder='{"users": [...], "products": [...]}'
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowJsonInput(false)}
                    className="text-slate-500 hover:text-white text-xs px-2 py-1"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs px-3 py-1 rounded-lg"
                  >
                    Importar e Recarregar
                  </button>
                </div>
              </form>
            )}

            {/* Export view modal snippet */}
            {showExported && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[10px] font-mono text-slate-400 relative">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(exportedJson);
                    alert('Copiado para a área de transferência!');
                  }}
                  className="absolute right-2 top-2 bg-slate-900 border border-slate-800 text-emerald-400 px-1.5 py-0.5 rounded text-[9px]"
                >
                  Copiar
                </button>
                <p className="truncate max-w-[280px]">Backup gerado com sucesso: {exportedJson.substring(0, 100)}...</p>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-slate-800 mt-4">
            <button
              type="button"
              onClick={handleReset}
              className="w-full py-3 px-4 bg-red-950/25 hover:bg-red-950 text-red-400 border border-red-900/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Limpar Sistema & Reiniciar ERP</span>
            </button>
          </div>
        </div>
      </div>

      {/* USER MANAGEMENT & ROLES SCHEDULER */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-800 mb-4 flex items-center gap-2">
          <Users className="w-4.5 h-4.5 text-emerald-400" />
          <span>Controle de Acesso / Funções de Usuários</span>
        </h3>
        <p className="text-xs text-slate-400 mb-5">Atribua permissões operacionais e de administração a contas corporativas. Usuários não autorizados terão guias ocultas automaticamente em conformidade com as políticas internas.</p>

        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/30">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                  <th className="py-3 px-4">Nome</th>
                  <th className="py-3 px-4">E-mail</th>
                  <th className="py-3 px-4">Função / Nível de Acesso</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-xs">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/40 text-slate-300 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">{u.name}</td>
                    <td className="py-3 px-4 font-mono">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                        u.role === 'Administrador' 
                          ? 'bg-rose-950/40 text-rose-400 border border-rose-900/20' 
                          : u.role === 'Operador'
                            ? 'bg-amber-950/40 text-amber-400 border border-amber-900/20'
                            : 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/20'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <select
                        value={u.role}
                        onChange={(e) => updateUserRole(u.id, e.target.value as UserRole)}
                        className="bg-slate-950 border border-slate-800 rounded-lg py-1 px-2 text-[11px] text-slate-300 focus:outline-none focus:border-emerald-500 cursor-pointer"
                      >
                        <option value="Administrador">Administrador</option>
                        <option value="Operador">Operador</option>
                        <option value="Funcionário">Funcionário</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
