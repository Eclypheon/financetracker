import React, { useState, useEffect } from 'react';
import { getSupabaseClient } from '../utils/supabase';
import { 
  X, 
  Mail, 
  Lock, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Link
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
  initialError?: string | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess, initialError }) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'magic'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(initialError || null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialError) {
      setErrorMsg(initialError);
    }
  }, [initialError]);

  // Helper to compute clean redirect URL
  const getCleanRedirectUrl = () => {
    const origin = window.location.origin;
    let pathname = window.location.pathname.replace(/\/index\.html$/, '');
    if (!pathname.endsWith('/')) {
      pathname += '/';
    }
    return origin + pathname;
  };

  if (!isOpen) return null;

  // Sign in with Google
  const handleGoogleSignIn = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setErrorMsg('Cloud database connection not configured yet.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const redirectUrl = getCleanRedirectUrl();
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
      setErrorMsg('Cloud database connection not configured yet.');
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
      setErrorMsg('Cloud database connection not configured yet.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const redirectUrl = getCleanRedirectUrl();
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

  return (
    <div 
      style={{
        paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0px))',
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))',
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-[370px] max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-4 text-slate-100 space-y-3">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-1.5">
            <div className="p-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white tracking-wide">
                Cloud Sync &amp; Login
              </h3>
              <p className="text-[9px] text-slate-400">
                Sync cards securely across all your devices
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
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

        <div className="space-y-3">
          {/* 1. SEAMLESS GOOGLE SIGN IN BUTTON */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs transition-all shadow-md active:scale-98 disabled:opacity-50 cursor-pointer"
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
              className={`flex-1 py-1 rounded-md font-medium transition-all cursor-pointer ${
                authMode === 'signin' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('signup')}
              className={`flex-1 py-1 rounded-md font-medium transition-all cursor-pointer ${
                authMode === 'signup' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('magic')}
              className={`flex-1 py-1 rounded-md font-medium transition-all cursor-pointer ${
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
                className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
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
                className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-1 cursor-pointer"
              >
                <Link className="w-3 h-3" />
                <span>{loading ? 'Sending link...' : 'Send Magic Link'}</span>
              </button>
            </form>
          )}

          {/* Footer security note */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-center text-[9px] text-slate-500">
            <span>All data secured with Postgres Row Level Security</span>
          </div>
        </div>
      </div>
    </div>
  );
};
