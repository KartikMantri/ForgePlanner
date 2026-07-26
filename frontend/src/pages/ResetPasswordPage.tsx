import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) {
        setHasSession(!!session);
        setReady(true);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setDone(true);
      setTimeout(() => navigate('/'), 1500);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-military flex items-center justify-center p-4 selection:bg-[var(--color-arc-cyan)] selection:text-black">
      <div className="w-full max-w-sm bg-black/70 backdrop-blur-xl border border-[var(--color-arc-cyan)]/30 rounded-2xl p-6 sm:p-8 shadow-[0_0_40px_rgba(0,0,0,0.8)] text-center">
        <h1 className="font-display font-black text-2xl tracking-tighter mb-1 drop-shadow-[0_0_15px_rgba(0,212,255,0.8)]">
          RESET PASSWORD
        </h1>

        {!ready && (
          <div className="py-8 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--color-arc-cyan)]" />
          </div>
        )}

        {ready && !hasSession && (
          <div className="mt-4">
            <p className="text-white/70 text-sm mb-6">
              This reset link is invalid or has expired. Request a new one from the login page.
            </p>
            <Link
              to="/login"
              className="inline-block px-6 py-3 bg-[var(--color-arc-cyan)]/10 text-[var(--color-arc-cyan)] border border-[var(--color-arc-cyan)] hover:bg-[var(--color-arc-cyan)] hover:text-black rounded font-display tracking-widest font-bold transition-all text-sm"
            >
              BACK TO LOGIN
            </Link>
          </div>
        )}

        {ready && hasSession && !done && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-3 text-left">
            <p className="text-white/60 text-xs tracking-widest mb-4 text-center">
              CHOOSE A NEW PASSWORD
            </p>

            {error && (
              <div className="mb-2 px-4 py-2 text-xs font-display tracking-wide text-red-400 border border-red-500/30 bg-red-500/10 rounded">
                {error}
              </div>
            )}

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-arc-cyan)]/50" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-[var(--color-arc-cyan)]/30 focus:border-[var(--color-arc-cyan)] rounded text-sm text-white placeholder:text-white/30 focus:outline-none transition-colors"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-arc-cyan)]/50" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-[var(--color-arc-cyan)]/30 focus:border-[var(--color-arc-cyan)] rounded text-sm text-white placeholder:text-white/30 focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 mt-2 px-6 py-3 bg-[var(--color-arc-cyan)]/10 text-[var(--color-arc-cyan)] border border-[var(--color-arc-cyan)] hover:bg-[var(--color-arc-cyan)] hover:text-black rounded font-display tracking-widest font-bold transition-all text-sm disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              SET NEW PASSWORD
            </button>
          </form>
        )}

        {done && (
          <div className="mt-6 flex flex-col items-center gap-3">
            <CheckCircle2 className="w-10 h-10 text-[#4ADE80]" />
            <p className="text-[#4ADE80] text-sm font-display tracking-widest">PASSWORD UPDATED</p>
            <p className="text-white/50 text-xs">Redirecting…</p>
          </div>
        )}
      </div>
    </div>
  );
}
