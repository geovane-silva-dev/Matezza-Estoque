/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { Message } from '../types';
import {
  MessageSquare,
  Plus,
  Pin,
  Trash2,
  Edit2,
  AlertOctagon,
  PinOff,
  BellRing
} from 'lucide-react';

export const MuralView: React.FC = () => {
  const {
    messages,
    addMessage,
    updateMessage,
    deleteMessage,
    currentUser
  } = useERP();

  const [showModal, setShowModal] = useState(false);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'normal' | 'attention' | 'urgent'>('normal');
  const [pinned, setPinned] = useState(false);

  const openAddModal = () => {
    setEditingMessage(null);
    setTitle('');
    setContent('');
    setPriority('normal');
    setPinned(false);
    setShowModal(true);
  };

  const openEditModal = (m: Message) => {
    setEditingMessage(m);
    setTitle(m.title);
    setContent(m.content);
    setPriority(m.priority);
    setPinned(m.pinned);
    setShowModal(true);
  };

  const handleMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title,
      content,
      priority,
      pinned,
      createdBy: currentUser?.name || 'Administrador'
    };

    if (editingMessage) {
      updateMessage(editingMessage.id, payload);
    } else {
      addMessage(payload);
    }
    setShowModal(false);
  };

  // Sort messages: Pinned first, then by date desc
  const sortedMessages = [...messages].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-6 animate-fadeIn text-slate-100">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Mural de Recados</h1>
          <p className="text-sm text-slate-400">Quadro informativo interno para alinhamento de turnos, metas industriais e avisos de segurança.</p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/10 transition-all flex items-center gap-2 cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Escrever Recado</span>
        </button>
      </div>

      {/* MESSAGES LISTING */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sortedMessages.length === 0 ? (
          <div className="col-span-full py-16 bg-slate-900 border border-dashed border-slate-800 text-center rounded-2xl">
            <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-white">Nenhum aviso no mural</h3>
            <p className="text-xs text-slate-400 mt-1">Seja o primeiro a escrever um aviso para toda a equipe fabril.</p>
          </div>
        ) : (
          sortedMessages.map((msg) => (
            <div
              key={msg.id}
              className={`bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between gap-4 relative overflow-hidden transition-all hover:border-slate-700 ${
                msg.pinned ? 'border-amber-500/30 ring-1 ring-amber-500/10' : 'border-slate-800'
              }`}
            >
              {/* Priority Ribbon indicator */}
              <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none overflow-hidden">
                <div className={`absolute transform rotate-45 text-[8px] font-bold text-center uppercase tracking-widest text-slate-950 py-1 w-24 -right-6 top-3 ${
                  msg.priority === 'urgent' 
                    ? 'bg-rose-500 text-slate-950 font-black' 
                    : msg.priority === 'attention' 
                      ? 'bg-amber-500 text-slate-950 font-black' 
                      : 'bg-emerald-500 text-slate-950 font-black'
                }`}>
                  {msg.priority}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 pr-12">
                  {msg.pinned && <Pin className="w-4.5 h-4.5 text-amber-500 shrink-0" />}
                  <h3 className="text-base font-bold text-white leading-tight">{msg.title}</h3>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{msg.content}</p>
              </div>

              {/* Message Footer metadata */}
              <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                <div>
                  <span className="block text-slate-400 font-bold">{msg.createdBy}</span>
                  <span className="block text-[10px] text-slate-500 mt-0.5 font-mono">
                    {new Date(msg.createdAt).toLocaleDateString('pt-BR')} às {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Edit Controls */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(msg)}
                    className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded"
                    title="Editar Recado"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Deseja realmente apagar este aviso do mural?')) {
                        deleteMessage(msg.id);
                      }
                    }}
                    className="p-1.5 hover:bg-red-950/30 text-slate-400 hover:text-red-400 rounded"
                    title="Remover Recado"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MESSAGE WRITE/EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">
                {editingMessage ? 'Editar Recado' : 'Escrever Novo Aviso'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">Fechar</button>
            </div>

            <form onSubmit={handleMessageSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Título do Aviso</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white focus:outline-none"
                  placeholder="Ex: Novo turno da prensa hidráulica"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Conteúdo do Recado</label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white focus:outline-none resize-none"
                  placeholder="Escreva detalhadamente o comunicado para a equipe corporativa..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nível de Alerta</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-white focus:outline-none"
                  >
                    <option value="normal">Normal (Informativo)</option>
                    <option value="attention">Atenção (Importante)</option>
                    <option value="urgent">Urgente (Imediato)</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Fixar no Topo?</label>
                  <label className="flex items-center gap-2 text-xs text-slate-300 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pinned}
                      onChange={(e) => setPinned(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 cursor-pointer"
                    />
                    <span>Manter no topo</span>
                  </label>
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
                  Publicar no Quadro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
