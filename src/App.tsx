import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { LoginScreen } from './components/LoginScreen';
import { ItemManagementScreen } from './components/ItemManagementScreen';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { SqlSchemaModal } from './components/SqlSchemaModal';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showSqlModal, setShowSqlModal] = useState(false);

  useEffect(() => {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      setShowConfigModal(true);
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-xs font-medium">Loading Bubbleframe App...</p>
      </div>
    );
  }

  return (
    <>
      <SupabaseConfigModal isOpen={showConfigModal || !isSupabaseConfigured()} />
      <SqlSchemaModal isOpen={showSqlModal} onClose={() => setShowSqlModal(false)} />

      {!session ? (
        <LoginScreen
          onOpenConfig={() => setShowConfigModal(true)}
          onOpenSql={() => setShowSqlModal(true)}
        />
      ) : (
        <ItemManagementScreen
          user={session.user}
          onOpenSql={() => setShowSqlModal(true)}
          onOpenConfig={() => setShowConfigModal(true)}
        />
      )}
    </>
  );
}
