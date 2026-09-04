import React, { useRef, useState, useEffect } from 'react';
import { 
  PiggyBank, 
  Download, 
  Upload, 
  PlusCircle, 
  RotateCcw, 
  DownloadCloud,
  CheckCircle2
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface HeaderProps {
  onAddNewMonth: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onResetSample: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onAddNewMonth,
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-md shadow-emerald-950">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Finance Tracker</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 border border-emerald-500/20">
                  PWA
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">
                Asset & Wealth Dashboard
              </p>
            </div>
          </div>

          {/* Mobile quick action */}
          <div className="flex sm:hidden items-center gap-1.5">
            <button
              onClick={onAddNewMonth}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Month</span>
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          {/* Add New Month Button (Desktop) */}
          <button
            onClick={onAddNewMonth}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-950/40"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ New Month Record</span>
          </button>

          {/* Export JSON */}
          <button
            onClick={() => {
              onExport();
              triggerToast('Backup downloaded.');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/70 text-slate-300 hover:text-white text-xs font-medium transition-colors"
            title="Export data backup as JSON"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Export</span>
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/70 text-slate-300 hover:text-white text-xs font-medium transition-colors"
            title="Import data backup from JSON"
          >
            <Upload className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden md:inline">Import</span>
          </button>

          {/* Reset to sample data */}
          <button
            onClick={() => {
              if (confirm('Reset to standard sample data? Any unexported changes will be replaced.')) {
                onResetSample();
                triggerToast('Reset to demo sample data.');
              }
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/70 text-slate-400 hover:text-rose-300 text-xs font-medium transition-colors"
            title="Reset to initial sample data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* PWA Install Button */}
          {!isInstalled && (
            <button
              onClick={handleInstall}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600/30 to-cyan-600/30 hover:from-emerald-600/40 hover:to-cyan-600/40 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all"
              title="Install app to your home screen or desktop"
            >
              <DownloadCloud className="w-3.5 h-3.5 text-emerald-400" />
              <span>Install App</span>
            </button>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {showNotification && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-emerald-500 text-emerald-300 text-xs font-semibold shadow-2xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{showNotification}</span>
        </div>
      )}
    </header>
  );
};
