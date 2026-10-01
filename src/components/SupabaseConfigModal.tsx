import React, { useState } from 'react';
import { saveSupabaseConfig } from '../lib/supabase';
import { Key, Globe, Shield, ExternalLink, AlertCircle } from 'lucide-react';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ isOpen }) => {
  const [url, setUrl] = useState(localStorage.getItem('bubbleframe_supabase_url') || '');
  const [anonKey, setAnonKey] = useState(localStorage.getItem('bubbleframe_supabase_anon_key') || '');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !anonKey.trim()) {
      setError('Please provide both Supabase Project URL and Anon API Key.');
      return;
    }
    if (!url.startsWith('http')) {
      setError('Supabase URL must start with https://');
      return;
    }
    saveSupabaseConfig(url, anonKey);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-800 text-center relative">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto mb-3 shadow-inner">
            <Globe className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Connect Supabase Project</h2>
          <p className="text-xs text-slate-400 mt-1">
            Enter your Supabase credentials to enable secure Auth and Item Management CRUD.
          </p>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Supabase Project URL
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Globe className="w-4 h-4" />
              </div>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-project-id.supabase.co"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition placeholder:text-slate-600 font-mono text-xs"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Supabase Anon / Public Key
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Key className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition placeholder:text-slate-600 font-mono text-xs"
                required
              />
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 text-xs text-slate-400 space-y-1.5">
            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Where to find these keys?</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Go to your Supabase Dashboard → Project Settings → API to copy your Project URL and <code className="text-emerald-400 font-mono">anon/public</code> key.
            </p>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium pt-1"
            >
              Open Supabase Dashboard <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition shadow-lg shadow-emerald-600/20 text-sm mt-2"
          >
            Save & Connect Supabase
          </button>
        </form>
      </div>
    </div>
  );
};
