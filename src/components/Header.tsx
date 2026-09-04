import React, { useRef, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { 
  PiggyBank, 
  Download, 
  Upload, 
  CheckCircle2,
  Cloud,
  LogOut,
  Smartphone
} from 'lucide-react';
import { IosInstallModal } from './IosInstallModal';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface HeaderProps {
  currentUser: User | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onAddNewBlankCard?: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onOpenAuth,
  onSignOut,
  onExport,
  onImport,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);
  const [showNotification, setShowNotification] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true
    ) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const isIOS = () => {
    return (
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    );
  };

  const handleInstall = async () => {
    if (isIOS()) {
      setShowIosModal(true);
      return;
    }

    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        triggerToast('App installed successfully!');
      }
      setInstallPrompt(null);
      return;
    }

    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true
    ) {
      triggerToast('Finance Tracker is already installed.');
      setIsInstalled(true);
      return;
    }

    triggerToast('Use browser menu (⋮) to "Install App" or "Add to Home Screen".');
  };

  const triggerToast = (msg: string) => {
    setShowNotification(msg);
    setTimeout(() => setShowNotification(null), 3500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      triggerToast('CSV data imported successfully!');
      // Reset input value so re-importing same file triggers change
      e.target.value = '';
    }
  };

  const getUserDisplayName = () => {
    if (!currentUser) return '';
    const meta = currentUser.user_metadata || {};
    const rawName = meta.full_name || meta.name || meta.user_name || currentUser.email?.split('@')[0] || 'User';
    const firstName = rawName.trim().split(' ')[0];
    return firstName.charAt(0).toUpperCase() + firstName.slice(1);
  };

  return (
    <>
      <header 
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        className="sticky top-0 z-30 w-full backdrop-blur-xl bg-slate-950/85 border-b border-slate-800/80 transition-all"
      >
        <div className="max-w-[500px] mx-auto px-3 py-2 flex items-center justify-between gap-2">
          {/* Brand */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className="p-1.5 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-sm shadow-emerald-950">
              <PiggyBank className="w-4 h-4" />
            </div>
            <h1 className="text-xs font-bold text-white tracking-tight hidden sm:inline">
              Finance Tracker
            </h1>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-1.5">
            {/* Cloud Auth / User Profile Button with Hi, [Name] and status badge */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[10px] font-semibold transition-all hover:bg-emerald-900/50 shadow-sm active:scale-98"
                  title={`Signed in as ${currentUser.email}`}
                >
                  {/* Live pulsing online dot badge */}
                  <span className="relative flex h-2 w-2 flex-shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="truncate max-w-[85px]">
                    Hi, {getUserDisplayName()}
                  </span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-1.5 w-48 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 text-[10px] z-50 animate-fade-in space-y-1.5">
                    <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-950 border border-slate-800/80">
                      <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/30 flex-shrink-0">
                        {getUserDisplayName().charAt(0)}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-white truncate text-[11px] leading-tight">
                          {getUserDisplayName()}
                        </p>
                        <p className="text-[9px] text-slate-400 truncate leading-tight">
                          {currentUser.email}
                        </p>
                      </div>
                    </div>

                    <div className="px-1.5 py-0.5 text-[9px] text-emerald-400/90 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                      <span>Postgres Cloud Sync Active</span>
                    </div>

                    <div className="h-px bg-slate-800 my-1"></div>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onSignOut();
                      }}
                      className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-rose-400 hover:bg-rose-500/10 font-semibold transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 hover:text-white text-[10px] font-medium transition-all"
                title="Sign in with Google or Email to sync across devices"
              >
                <Cloud className="w-3 h-3 text-cyan-400" />
                <span>Sign In / Sync</span>
              </button>
            )}

            {/* Export CSV (Excel Compatible) */}
            <button
              onClick={() => {
                onExport();
                triggerToast('CSV exported for Excel & Sheets!');
              }}
              className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/70 text-slate-300 hover:text-white transition-colors"
              title="Export as CSV (opens in Excel & Google Sheets)"
            >
              <Download className="w-3 h-3 text-cyan-400" />
            </button>

            {/* Import CSV */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.json"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/70 text-slate-300 hover:text-white transition-colors"
              title="Import CSV (or JSON backup)"
            >
              <Upload className="w-3 h-3 text-purple-400" />
            </button>

            {/* PWA Install Button with Smartphone Icon */}
            {!isInstalled && (
              <button
                onClick={handleInstall}
                className="p-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all"
                title="Install Finance Tracker on your device (PWA)"
              >
                <Smartphone className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Toast Notification */}
        {showNotification && (
          <div className="fixed bottom-4 right-4 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-emerald-500 text-emerald-300 text-[10px] font-semibold shadow-2xl animate-fade-in">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span>{showNotification}</span>
          </div>
        )}
      </header>

      {/* iOS PWA Installation Guide Modal */}
      <IosInstallModal
        isOpen={showIosModal}
        onClose={() => setShowIosModal(false)}
      />
    </>
  );
};

