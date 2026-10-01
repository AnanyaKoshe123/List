import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, Mail, ArrowRight, AlertCircle, Loader2, KeyRound, Sparkles, Database, HelpCircle } from 'lucide-react';

interface LoginScreenProps {
  onOpenConfig: () => void;
  onOpenSql: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onOpenConfig, onOpenSql }) => {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTestInfo, setShowTestInfo] = useState(true);
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResetSent(false);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        throw authError;
      }
      // Successful auth triggers onAuthStateChange in App.tsx
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError('Please enter your email address first.');
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      setResetSent(true);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  const fillTestCredentials = () => {
    setEmail('test@example.com');
    setPassword('Password123!');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Top Header tools */}
      <div className="absolute top-6 right-6 flex items-center gap-3 z-10">
        <button
          onClick={onOpenSql}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium transition shadow-sm"
        >
          <Database className="w-3.5 h-3.5 text-indigo-400" />
          SQL Schema
        </button>
        <button
          onClick={onOpenConfig}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium transition shadow-sm"
        >
          <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
          Supabase Config
        </button>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo / Branding */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-600/20 border border-indigo-400/30">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Bubbleframe Item Manager</h1>
          <p className="text-sm text-slate-400 mt-1">Sign in with Supabase Authentication to manage your items</p>
        </div>

        {/* Test User Credentials Helper Banner */}
        {showTestInfo && (
          <div className="mb-6 bg-indigo-950/40 border border-indigo-800/50 rounded-2xl p-4 text-xs space-y-2.5 relative">
            <button
              onClick={() => setShowTestInfo(false)}
              className="absolute top-3 right-3 text-indigo-300/60 hover:text-indigo-200 text-xs"
            >
              ✕
            </button>
            <div className="flex items-center gap-2 text-indigo-300 font-semibold">
              <KeyRound className="w-4 h-4 text-indigo-400" />
              <span>Test User Quick Fill</span>
            </div>
            <p className="text-indigo-200/80 leading-relaxed">
              Create a test user in <code className="bg-indigo-900/60 px-1.5 py-0.5 rounded text-indigo-200 font-mono">Supabase Dashboard → Authentication → Users → Add User</code>:
            </p>
            <div className="bg-indigo-950/80 rounded-xl p-2.5 font-mono text-[11px] text-indigo-200 space-y-1 border border-indigo-900">
              <div>Test Email: <span className="text-white font-semibold">test@example.com</span></div>
              <div>Test Password: <span className="text-white font-semibold">&lt;SET_IN_SUPABASE_AUTH&gt;</span></div>
            </div>
            <button
              type="button"
              onClick={fillTestCredentials}
              className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition shadow-sm"
            >
              Fill Test Email
            </button>
          </div>
        )}

        {/* Login Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {resetSent && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Password reset instructions sent to your email.</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition placeholder:text-slate-600"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition placeholder:text-slate-600"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-2xl transition shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center mt-6 text-xs text-slate-500">
          Bubbleframe Supabase CRUD Integration • Secure RLS Enabled
        </div>
      </div>
    </div>
  );
};
