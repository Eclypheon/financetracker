import React, { useState } from 'react';
import { 
  getSupabaseClient, 
  getStoredSupabaseConfig, 
  saveSupabaseConfig 
} from '../utils/supabase';
import { 
  X, 
  Mail, 
  Lock, 
  Sparkles, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound, 
  Link,
  Copy,
  Check
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'magic' | 'config'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  // Config fields
  const currentConfig = getStoredSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(currentConfig.url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(currentConfig.anonKey);

  const isConfigured = Boolean(currentConfig.url && currentConfig.anonKey);

  if (!isOpen) return null;

  // Sign in with Google
  const handleGoogleSignIn = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setAuthMode('config');
      setErrorMsg('Please connect your Supabase project credentials first.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const redirectUrl = window.location.origin + window.location.pathname;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    }
  };

  // Sign in / Sign up with Email & Password
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = getSupabaseClient();
    if (!supabase) {
      setAuthMode('config');
      setErrorMsg('Please connect your Supabase project credentials first.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (authMode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        setErrorMsg(error.message);
      } else {
        if (data.session) {
          setSuccessMsg('Account created & signed in!');
          onAuthSuccess();
          setTimeout(onClose, 800);
        } else {
          setSuccessMsg('Verification email sent! Check your inbox to confirm.');
        }
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setErrorMsg(error.message);
      } else if (data.session) {
        setSuccessMsg('Signed in successfully!');
        onAuthSuccess();
        setTimeout(onClose, 800);
      }
    }

    setLoading(false);
  };

  // Sign in with Magic Link
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = getSupabaseClient();
    if (!supabase) {
      setAuthMode('config');
      setErrorMsg('Please connect your Supabase project credentials first.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const redirectUrl = window.location.origin + window.location.pathname;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg('Magic login link sent! Check your email to sign in.');
    }
    setLoading(false);
  };

  // Save Supabase Configuration
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrl.trim() || !supabaseAnonKey.trim()) {
      setErrorMsg('Both Supabase URL and Anon Key are required.');
      return;
    }

    saveSupabaseConfig({
      url: supabaseUrl.trim(),
      anonKey: supabaseAnonKey.trim(),
    });

    setSuccessMsg('Supabase credentials saved successfully!');
    setAuthMode('signin');
    setErrorMsg(null);
  };

  const sqlSetupCode = `-- Run this in Supabase SQL Editor:
create table if not exists cards (
  id text primary key,
  user_id uuid references auth.users not null default auth.uid(),
  month_year text not null,
  created_at bigint not null,
  data jsonb not null,
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security (RLS)
alter table cards enable row level security;

-- Allow users to manage only their own financial cards
create policy "Users can only access their own cards"
  on cards for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlSetupCode);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-[360px] rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-4 text-slate-100 space-y-3">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-1.5">
            <div className="p-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white tracking-wide">
                Cloud Sync & Login
              </h3>
              <p className="text-[9px] text-slate-400">
                Sync cards securely across all your devices
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Status Alerts */}
        {errorMsg && (
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-rose-950/40 border border-rose-800/50 text-rose-300 text-[10px]">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-[10px]">
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Prompt if Supabase config is missing */}
        {!isConfigured && authMode !== 'config' && (
          <div className="p-2 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-300 text-[10px] space-y-1">
            <p className="font-semibold flex items-center gap-1">
              <KeyRound className="w-3 h-3" /> Supabase Connection Needed
            </p>
            <p className="text-slate-300 text-[9px]">
              Connect your free Supabase project to enable cross-device sync.
            </p>
            <button
              onClick={() => setAuthMode('config')}
              className="text-[9px] text-amber-400 font-bold underline hover:text-amber-300"
            >
              Enter Project URL & Key &rarr;
            </button>
          </div>
        )}

        {/* Tab Selector */}
        {authMode !== 'config' ? (
          <div className="space-y-3">
            {/* 1. SEAMLESS GOOGLE SIGN IN BUTTON */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs transition-all shadow-md active:scale-98 disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="flex items-center gap-2 text-slate-600 text-[9px] uppercase font-bold tracking-wider">
              <div className="flex-1 h-px bg-slate-800"></div>
              <span>or email</span>
              <div className="flex-1 h-px bg-slate-800"></div>
            </div>

            {/* Email form toggles */}
            <div className="flex items-center justify-center gap-1 p-0.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px]">
              <button
                type="button"
                onClick={() => setAuthMode('signin')}
                className={`flex-1 py-1 rounded-md font-medium transition-all ${
                  authMode === 'signin' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('signup')}
                className={`flex-1 py-1 rounded-md font-medium transition-all ${
                  authMode === 'signup' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('magic')}
                className={`flex-1 py-1 rounded-md font-medium transition-all ${
                  authMode === 'magic' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Magic Link
              </button>
            </div>

            {/* Password Form (Sign In / Sign Up) */}
            {authMode !== 'magic' ? (
              <form onSubmit={handleEmailAuth} className="space-y-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 focus-within:border-emerald-500">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="email"
                      required
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 focus-within:border-emerald-500">
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-sm disabled:opacity-50"
                >
                  {loading ? 'Processing...' : authMode === 'signup' ? 'Create Account' : 'Sign In'}
                </button>
              </form>
            ) : (
              /* Magic Link Form */
              <form onSubmit={handleMagicLink} className="space-y-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 focus-within:border-emerald-500">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="Enter email for magic link"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  <Link className="w-3 h-3" />
                  <span>{loading ? 'Sending link...' : 'Send Magic Link'}</span>
                </button>
              </form>
            )}

            {/* Footer Settings link */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[9px] text-slate-500">
              <span>All data secured with Postgres RLS</span>
              <button
                type="button"
                onClick={() => setAuthMode('config')}
                className="text-slate-400 hover:text-emerald-400 flex items-center gap-0.5"
              >
                <Database className="w-2.5 h-2.5" />
                <span>DB Settings</span>
              </button>
            </div>
          </div>
        ) : (
          /* ================= DATABASE CONFIG TAB ================= */
          <form onSubmit={handleSaveConfig} className="space-y-2.5 text-[10px]">
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="text-[10px] font-bold text-slate-300 flex items-center gap-1">
                <Database className="w-3 h-3 text-cyan-400" />
                <span>Supabase Project Settings</span>
              </div>
              <p className="text-[9px] text-slate-400">
                Create a free project at <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-emerald-400 underline">supabase.com</a>, then copy your Project URL & Anon Key from <strong>Settings &gt; API</strong>.
              </p>

              <div>
                <label className="text-[9px] text-slate-400 font-medium">Project URL:</label>
                <input
                  type="text"
                  placeholder="https://xyz.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="w-full mt-0.5 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-white text-[10px] font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[9px] text-slate-400 font-medium">Anon Key (Public API Key):</label>
                <input
                  type="text"
                  placeholder="eyJhbGciOi..."
                  value={supabaseAnonKey}
                  onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  className="w-full mt-0.5 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-white text-[10px] font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            {/* SQL Table Creation snippet */}
            <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 text-[9px] space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300">Database SQL Setup:</span>
                <button
                  type="button"
                  onClick={copySql}
                  className="flex items-center gap-0.5 text-emerald-400 hover:text-emerald-300"
                >
                  {copiedSql ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                  <span>{copiedSql ? 'Copied' : 'Copy SQL'}</span>
                </button>
              </div>
              <p className="text-[8px] text-slate-500">
                Paste into Supabase <strong>SQL Editor</strong> and click "Run".
              </p>
            </div>

            <div className="flex items-center gap-1.5 pt-1">
              <button
                type="submit"
                className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] transition-colors"
              >
                Save Credentials
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('signin')}
                className="px-2 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-[10px]"
              >
                Back
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
