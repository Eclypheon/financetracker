import React, { useRef, useState, useEffect } from 'react';
import { 
  PiggyBank, 
  Download, 
  Upload, 
  Plus, 
  RotateCcw, 
  DownloadCloud,
  CheckCircle2
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface HeaderProps {
  onAddNewBlankCard: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onResetSample: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onAddNewBlankCard,
  onExport,
  onImport,
  onResetSample,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showNotification, setShowNotification] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) {
      triggerToast('Use your browser menu to "Add to Home Screen" or install.');
      return;
    }
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setIsInstalled(true);
      triggerToast('App installed successfully!');
    }
    setInstallPrompt(null);
  };

  const triggerToast = (msg: string) => {
    setShowNotification(msg);
    setTimeout(() => setShowNotification(null), 3500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      triggerToast('Data imported successfully!');
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 transition-all">
      <div className="max-w-[500px] mx-auto px-3 py-2 flex items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center gap-1.5">
          <div className="p-1.5 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-sm shadow-emerald-950">
            <PiggyBank className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs font-bold text-white tracking-tight flex items-center gap-1">
              <span>Finance Tracker</span>
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          {/* + Card Button */}
          <button
            onClick={onAddNewBlankCard}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold transition-all shadow-sm shadow-emerald-950/40"
            title="Add a new blank card"
          >
            <Plus className="w-3 h-3" />
            <span>+ Card</span>
          </button>

          {/* Export JSON */}
          <button
            onClick={() => {
              onExport();
              triggerToast('Backup downloaded.');
            }}
            className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/70 text-slate-300 hover:text-white transition-colors"
            title="Export data backup as JSON"
          >
            <Download className="w-3 h-3 text-cyan-400" />
          </button>

          {/* Import JSON */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/70 text-slate-300 hover:text-white transition-colors"
            title="Import data backup from JSON"
          >
            <Upload className="w-3 h-3 text-purple-400" />
          </button>

          {/* Reset to sample data */}
          <button
            onClick={() => {
              if (confirm('Reset to sample data? Unsaved custom data will be replaced.')) {
                onResetSample();
                triggerToast('Reset to demo sample data.');
              }
            }}
            className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/70 text-slate-400 hover:text-rose-300 transition-colors"
            title="Reset to demo sample"
          >
            <RotateCcw className="w-3 h-3" />
          </button>

          {/* PWA Install Button */}
          {!isInstalled && (
            <button
              onClick={handleInstall}
              className="p-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all"
              title="Install PWA"
            >
              <DownloadCloud className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {showNotification && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-emerald-500 text-emerald-300 text-[10px] font-semibold shadow-2xl">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{showNotification}</span>
        </div>
      )}
    </header>
  );
};
