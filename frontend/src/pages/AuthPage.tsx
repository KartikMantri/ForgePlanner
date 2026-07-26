import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Lock, Mail, User as UserIcon } from 'lucide-react';
import ArcReactorScene from '../components/three/ArcReactorScene';
import { supabase } from '../lib/supabaseClient';

type Mode = 'signin' | 'signup';

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        navigate('/');
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username: username || email.split('@')[0] } },
        });
        if (signUpError) throw signUpError;
        if (data.session) {
          navigate('/');
        } else {
          setNotice('Account created — check your email to confirm, then sign in.');
          setMode('signin');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-foreground font-military selection:bg-[var(--color-arc-cyan)] selection:text-black">
      <ArcReactorScene revealAt={0.3}>
        <div className="max-w-sm mx-auto text-center bg-black/70 backdrop-blur-xl border border-[var(--color-arc-cyan)]/30 rounded-2xl p-6 sm:p-8 shadow-[0_0_40px_rgba(0,0,0,0.8)]">
          <div className="w-12 h-12 mx-auto mb-4 border border-[var(--color-arc-cyan)] rounded-full flex items-center justify-center relative overflow-hidden shadow-[0_0_15px_rgba(0,212,255,0.6)]">
            <img src="/forge-logo.png" alt="Forge Logo" className="w-full h-full object-cover rounded-full" />
          </div>
          <h1 className="font-display font-black text-3xl md:text-4xl text-white tracking-tighter mb-1 drop-shadow-[0_0_15px_rgba(0,212,255,0.8)]">
            FORGE
          </h1>
          <p className="text-white/90 font-display text-xs tracking-widest mb-8">
            {mode === 'signin' ? 'SYSTEM ACCESS — IDENTIFY YOURSELF' : 'NEW OPERATOR REGISTRATION'}
          </p>

          {notice && (
            <div className="mb-4 px-4 py-2 text-xs font-display tracking-wide text-[#4ADE80] border border-[#4ADE80]/30 bg-[#4ADE80]/10 rounded">
              {notice}
            </div>
          )}
          {error && (
            <div className="mb-4 px-4 py-2 text-xs font-display tracking-wide text-red-400 border border-red-500/30 bg-red-500/10 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 text-left">
            {mode === 'signup' && (
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-arc-cyan)]/50" />
                <input
                  type="text"
                  placeholder="Callsign (username)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-[var(--color-arc-cyan)]/30 focus:border-[var(--color-arc-cyan)] rounded text-sm text-white placeholder:text-white/30 focus:outline-none transition-colors"
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-arc-cyan)]/50" />
              <input
                type="email"
                required
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-[var(--color-arc-cyan)]/30 focus:border-[var(--color-arc-cyan)] rounded text-sm text-white placeholder:text-white/30 focus:outline-none transition-colors"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-arc-cyan)]/50" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-[var(--color-arc-cyan)]/30 focus:border-[var(--color-arc-cyan)] rounded text-sm text-white placeholder:text-white/30 focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 mt-2 px-6 py-3 bg-[var(--color-arc-cyan)]/10 text-[var(--color-arc-cyan)] border border-[var(--color-arc-cyan)] hover:bg-[var(--color-arc-cyan)] hover:text-black rounded font-display tracking-widest font-bold transition-all text-sm shadow-[0_0_15px_rgba(0,212,255,0.2)] hover:shadow-[0_0_25px_rgba(0,212,255,0.6)] disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === 'signin' ? 'AUTHENTICATE' : 'INITIALIZE'}
            </button>
          </form>

          <button
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); setNotice(null); }}
            className="mt-6 text-xs font-display tracking-widest text-white/70 hover:text-[var(--color-arc-cyan)] transition-colors"
          >
            {mode === 'signin' ? "NO ACCOUNT? REGISTER" : 'ALREADY REGISTERED? SIGN IN'}
          </button>
        </div>
      </ArcReactorScene>
    </div>
  );
}
