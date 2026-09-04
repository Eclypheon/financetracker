import React from 'react';
import { X, Share, PlusSquare, Smartphone, CheckCircle2 } from 'lucide-react';

interface IosInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IosInstallModal: React.FC<IosInstallModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      style={{
        paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0px))',
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))',
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-[340px] rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-4 text-slate-100 space-y-3.5">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-1.5">
            <div className="p-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white tracking-wide">
                Install on iPhone / iPad
              </h3>
              <p className="text-[9px] text-slate-400">
                Add to your home screen as a standalone app
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

        {/* Steps */}
        <div className="space-y-2 text-[10px]">
          {/* Step 1 */}
          <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-950 border border-slate-800/80">
            <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 flex-shrink-0 mt-0.5">
              <Share className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-semibold text-white">1. Tap the Share button</p>
              <p className="text-[9px] text-slate-400 mt-0.5">
                In Safari, tap the <span className="text-blue-400 font-medium">Share</span> icon in the toolbar at the bottom of your screen.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-950 border border-slate-800/80">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 flex-shrink-0 mt-0.5">
              <PlusSquare className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-semibold text-white">2. Tap "Add to Home Screen"</p>
              <p className="text-[9px] text-slate-400 mt-0.5">
                Scroll down in the share menu and select <span className="text-emerald-400 font-medium">Add to Home Screen</span>.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-950 border border-slate-800/80">
            <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 flex-shrink-0 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-semibold text-white">3. Tap "Add"</p>
              <p className="text-[9px] text-slate-400 mt-0.5">
                Confirm by tapping <span className="text-purple-400 font-medium">Add</span> in the top-right corner of your screen.
              </p>
            </div>
          </div>
        </div>

        {/* Benefits banner */}
        <div className="p-2 rounded-xl bg-slate-950/50 border border-slate-800/50 text-[9px] text-slate-400 text-center">
          Runs full-screen like a native app with offline caching and instant launch!
        </div>

        {/* Button */}
        <button
          onClick={onClose}
          className="w-full py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-sm"
        >
          Got it!
        </button>
      </div>
    </div>
  );
};
