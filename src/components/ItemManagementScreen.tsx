import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Plus, Trash2, Edit2, LogOut, Check, X, AlertCircle, Sparkles, Database, KeyRound, Loader2, RefreshCw } from 'lucide-react';

interface Item {
  id: number;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface ItemManagementScreenProps {
  user: any;
  onOpenSql: () => void;
  onOpenConfig: () => void;
}

export const ItemManagementScreen: React.FC<ItemManagementScreenProps> = ({ user, onOpenSql, onOpenConfig }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  // Delete confirmation state
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const fetchItems = useeeeCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm.trim()) {
        query = query.ilike('name', `%${searchTerm.trim()}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setItems(data || []);
    } catch (err: any) {
      console.error('Error fetching items:', err);
      // If table doesn't exist yet, show friendly guidance
      if (
        err.code === '42P01' || 
        err.message?.includes('does not exist') || 
        err.message?.includes('schema cache') ||
        err.message?.includes('public.items')
      ) {
        showToast('Could not find table public.items in the schema cache. Please run SQL Schema setup.', 'error');
      } else {
        showToast(err.message || 'Failed to fetch items', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newItemName.trim();
    if (!trimmedName) {
      showToast('Item name cannot be empty.', 'error');
      return;
    }

    try {
      setAdding(true);
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('items')
        .insert({
          user_id: currentUser.id,
          name: trimmedName,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505' || error.message?.includes('unique constraint')) {
          throw new Error('Item already exists.');
        }
        if (
          error.code === '42P01' || 
          error.message?.includes('schema cache') || 
          error.message?.includes('does not exist') ||
          error.message?.includes('public.items')
        ) {
          throw new Error('Could not find table public.items in the schema cache. Please run SQL Schema setup.');
        }
        throw error;
      }

      setNewItemName('');
      showToast('Item added successfully.');
      fetchItems();
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('schema cache') || msg.includes('does not exist') || msg.includes('42P01') || msg.includes('public.items')) {
        showToast('Could not find table public.items in the schema cache. Please run SQL Schema setup.', 'error');
      } else {
        showToast(msg || 'Failed to add item', 'error');
      }
    } finally {
      setAdding(false);
    }
  };

  const handleStartEdit = (item: Item) => {
    setEditingId(item.id);
    setEditName(item.name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleSaveEdit = async (itemId: number) => {
    const trimmed = editName.trim();
    if (!trimmed) {
      showToast('Item name cannot be empty.', 'error');
      return;
    }

    try {
      const { error } = await supabase
        .from('items')
        .update({
          name: trimmed,
          updated_at: new Date().toISOString(),
        })
        .eq('id', itemId);

      if (error) {
        if (error.code === '23505' || error.message?.includes('unique constraint')) {
          throw new Error('Item already exists.');
        }
        throw error;
      }

      setEditingId(null);
      setEditName('');
      showToast('Item updated successfully.');
      fetchItems();
    } catch (err: any) {
      showToast(err.message || 'Failed to update item', 'error');
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      setDeletingId(null);
      showToast('Item deleted successfully.');
      fetchItems();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete item', 'error');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-medium ${
            toast.type === 'success' 
              ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200' 
              : 'bg-rose-950/90 border-rose-500/30 text-rose-200'
          }`}>
            {toast.type === 'success' ? <Sparkles className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-none">Bubbleframe</h1>
              <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSql}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition border border-slate-700"
            >
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              SQL Schema
            </button>
            <button
              onClick={onOpenConfig}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition border border-slate-700"
            >
              <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
              Config
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold transition border border-rose-500/20 ml-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 space-y-6">
        {/* Banner if items table is not created */}
        <div className="bg-indigo-950/30 border border-indigo-900/50 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Item Management CRUD & RLS</h3>
              <p className="text-xs text-slate-400">Manage your items securely with Supabase RLS isolation per user.</p>
            </div>
          </div>
          <button
            onClick={onOpenSql}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-xl transition shadow-md shadow-indigo-600/20 shrink-0"
          >
            View SQL Schema Setup
          </button>
        </div>

        {/* Add Item & Search Bar Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Add Item Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">Add New Item</h2>
            <form onSubmit={handleAddItem} className="flex gap-2">
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Enter item name..."
                className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition placeholder:text-slate-600"
              />
              <button
                type="submit"
                disabled={adding}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition shadow-lg shadow-indigo-600/20 text-sm flex items-center gap-2 disabled:opacity-50 shrink-0 cursor-pointer"
              >
                {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>Add Item</span>
              </button>
            </form>
          </div>

          {/* Search Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">Search Items</h2>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search items..."
                className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition placeholder:text-slate-600"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Items List Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">My Items</h2>
              <p className="text-xs text-slate-400">Showing items belonging to your user ID</p>
            </div>
            <button
              onClick={fetchItems}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Refresh list"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loading && items.length === 0 ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
              <p className="text-xs">Loading your items from Supabase...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-600">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-300">No items found</p>
                <p className="text-xs text-slate-500 mt-1">
                  {searchTerm ? `No results matching "${searchTerm}"` : 'Get started by adding your first item above.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {items.map((item) => (
                <div key={item.id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-850 transition group">
                  {editingId === item.id ? (
                    <div className="flex-1 flex items-center gap-2 mr-4">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-3.5 py-2 bg-slate-950 border border-indigo-500 rounded-xl text-white text-sm focus:outline-none"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(item.id);
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                      />
                      <button
                        onClick={() => handleSaveEdit(item.id)}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 pr-4">
                        <span className="text-sm font-medium text-white">{item.name}</span>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Created: {new Date(item.created_at).toLocaleString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition">
                        <button
                          onClick={() => handleStartEdit(item)}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1 transition border border-slate-700"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-indigo-400" />
                          Edit
                        </button>
                        <button
                          onClick={() => setDeletingId(item.id)}
                          className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-medium flex items-center gap-1 transition border border-rose-500/20"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deletingId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white">Delete Item</h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to delete this item? This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteItem(deletingId)}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-rose-600/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
