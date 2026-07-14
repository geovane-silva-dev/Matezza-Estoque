/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { UserRole } from '../types';
import { Shield, Lock, Mail, UserPlus, KeyRound, CheckCircle } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { login } = useERP();
  const [email, setEmail] = useState('admin@matezza.com');
  const [role, setRole] = useState<UserRole>('Administrador');
  const [isRegister, setIsRegister] = useState(false);
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerRole, setRegisterRole] = useState<UserRole>('Funcionário');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoverySent, setRecoverySent] = useState(false);
  const [error, setError] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Por favor, informe seu email.');
      return;
    }
    const success = login(email, role);
    if (!success) {
      setError('Falha ao autenticar.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerName || !registerEmail) {
      setError('Preencha todos os campos.');
      return;
    }
    login(registerEmail, registerRole);
  };

  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail) return;
    setRecoverySent(true);
    setTimeout(() => {
      setRecoverySent(false);
      setShowRecovery(false);
      setRecoveryEmail('');
    }, 3000);
  };

  return (
    <div id="auth-container" className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-emerald-500 selection:text-black">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.08),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(99,102,241,0.05),transparent_50%)] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* LOGO */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-emerald-950/50 border border-emerald-500/30 rounded-2xl mb-3 shadow-lg shadow-emerald-950/20">
            <span className="text-emerald-400 font-bold text-2xl tracking-wider font-mono">M</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-widest font-sans">MATEZZA</h1>
          <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Industrial ERP & Control Hub</p>
        </div>

        {/* CARD CONTAINER */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl p-8">
          {!showRecovery ? (
            !isRegister ? (
              // LOGIN FORM
              <form onSubmit={handleLoginSubmit} className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Acesso ao Sistema</h2>
                  <p className="text-sm text-slate-400">Entre com as credenciais ou escolha um perfil simulado.</p>
                </div>

                {error && (
                  <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-400">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">E-mail Corporativo</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(''); }}
                        className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors"
                        placeholder="nome@matezza.com"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Nível de Permissão (Role)</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Administrador', 'Operador', 'Funcionário'] as UserRole[]).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRole(r)}
                          className={`py-2 px-1 text-xs font-semibold rounded-xl border transition-all ${
                            role === r
                              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-sm shadow-emerald-500/5'
                              : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold text-sm py-3 px-4 rounded-xl transition-colors shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Entrar no MATEZZA
                </button>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setShowRecovery(true)}
                    className="text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    Esqueceu a senha?
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsRegister(true)}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
                  >
                    Criar conta
                  </button>
                </div>
              </form>
            ) : (
              // REGISTER FORM
              <form onSubmit={handleRegisterSubmit} className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Cadastrar Conta</h2>
                  <p className="text-sm text-slate-400">Crie seu login corporativo no ERP MATEZZA.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Nome Completo</label>
                    <input
                      type="text"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 rounded-xl py-3 px-4 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors"
                      placeholder="Ex: Geovane Silva"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">E-mail Corporativo</label>
                    <input
                      type="email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 rounded-xl py-3 px-4 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors"
                      placeholder="seu.nome@matezza.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Função Inicial</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Administrador', 'Operador', 'Funcionário'] as UserRole[]).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRegisterRole(r)}
                          className={`py-2 px-1 text-xs font-semibold rounded-xl border transition-all ${
                            registerRole === r
                              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-sm shadow-emerald-500/5'
                              : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold text-sm py-3 px-4 rounded-xl transition-colors shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Cadastrar e Acessar
                </button>

                <div className="text-center pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsRegister(false)}
                    className="text-xs text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    Já tem conta? Voltar ao Login
                  </button>
                </div>
              </form>
            )
          ) : (
            // RECOVERY FORM
            <form onSubmit={handleRecoverySubmit} className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Recuperar Senha</h2>
                <p className="text-sm text-slate-400">Insira seu e-mail para receber as instruções de recuperação.</p>
              </div>

              {recoverySent ? (
                <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-emerald-400">Instruções enviadas!</h4>
                    <p className="text-xs text-slate-300 mt-1">Verifique sua caixa de entrada. Simulando e-mail enviado para <strong className="text-white">{recoveryEmail}</strong>.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">E-mail Cadastrado</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors"
                        placeholder="seu.email@matezza.com"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {!recoverySent && (
                <button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4" />
                  Enviar E-mail de Recuperação
                </button>
              )}

              <div className="text-center pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => { setShowRecovery(false); setRecoverySent(false); }}
                  className="text-xs text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  Voltar ao Login
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Demo credentials info */}
        <div className="mt-6 text-center text-xs text-slate-500 space-y-1">
          <p>Dica: Digite qualquer e-mail para simular o cadastro.</p>
          <p>E-mails sugeridos: <strong className="text-slate-400">admin@matezza.com</strong> | <strong className="text-slate-400">geovane.silvaa2010@gmail.com</strong></p>
        </div>
      </div>
    </div>
  );
};
