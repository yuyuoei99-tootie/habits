import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Info, Trash2, Sun, Moon, ToggleLeft, ToggleRight, Share2, Users, ArrowLeft, RefreshCw, Sparkles } from 'lucide-react';
import { PlayerState } from '../types';

interface SettingsProps {
  playerState: PlayerState;
  onResetData: () => void;
  onSyncData?: () => void;
  onSimulateTime?: (type: 'consecutive' | 'missed') => void;
}

export default function Settings({ playerState, onResetData, onSyncData, onSimulateTime }: SettingsProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [erasing, setErasing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  // Sync theme selection with system classes
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  const handleThemeToggle = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      setDarkMode(true);
    }
  };

  const handleResetAction = () => {
    setErasing(true);
    setTimeout(() => {
      onResetData();
      setErasing(false);
      setShowConfirmModal(false);
      alert("Game Data successfully erased from local storage mainframe safely.");
    }, 1800);
  };

  const triggerSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      alert("HydroPulse database synced successfully + Biometrics cached.");
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-[fadeInUp_0.4s_ease]">
      
      {/* Screen Title */}
      <div className="flex items-center gap-4 py-1">
        <div className="p-2 rounded-lg bg-surface-container-high border border-outline-variant text-primary">
          <SettingsIcon className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
        </div>
        <h2 className="font-headline-md text-headline-md text-on-surface">Configuration</h2>
      </div>

      {/* Visual Theme Toggler */}
      <section className="bg-surface-container rounded-xl p-5 border-t-2 border-surface-bright flex flex-col gap-4 shadow">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-surface-container-high border border-outline-variant flex items-center justify-center text-primary">
              {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </div>
            <div>
              <span className="font-headline-md text-[16px] text-on-surface block leading-tight">Visual Theme</span>
              <span className="text-[10px] text-on-surface-variant uppercase font-medium leading-none">High Contrast Modes</span>
            </div>
          </div>

          <button 
            onClick={handleThemeToggle}
            className="relative inline-flex h-8 w-14 items-center rounded-full bg-surface-variant transition-all ring-2 ring-primary p-1 focus:outline-none"
          >
            <span 
              className={`inline-block h-6 w-6 transform rounded-full bg-primary transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0'}`} 
            />
          </button>
        </div>
        <p className="text-on-surface-variant text-xs font-sans leading-relaxed">
          Toggle between dark deep-sea colors and classic crisp layouts to optimize display visibility on workout areas.
        </p>
      </section>

      {/* Sync and Community Social Actions */}
      <section className="grid grid-cols-2 gap-4">
        
        {/* Sync Card */}
        <button 
          onClick={triggerSync}
          disabled={syncing}
          className="bg-surface-container rounded-xl p-4 flex flex-col items-center gap-2 border-t-2 border-surface-bright hover:bg-surface-variant transition-colors active:scale-95 group focus:outline-none text-center"
        >
          <RefreshCw className={`w-5 h-5 text-primary ${syncing ? 'animate-spin' : 'group-hover:scale-110 transition-transform'}`} />
          <span className="font-label-md text-xs text-on-surface-variant font-bold uppercase tracking-wider leading-none mt-1">
            {syncing ? "SYNCING..." : "SYNC BIOMETRICS"}
          </span>
        </button>

        {/* Community Card */}
        <button 
          onClick={() => alert("HydroPulse Slack & Discord community portal joining link coming soon!")}
          className="bg-surface-container rounded-xl p-4 flex flex-col items-center gap-2 border-t-2 border-surface-bright hover:bg-surface-variant transition-colors active:scale-95 group focus:outline-none text-center"
        >
          <Users className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
          <span className="font-label-md text-xs text-on-surface-variant font-bold uppercase tracking-wider leading-none mt-1">
            JOIN GUILD
          </span>
        </button>

      </section>

      {/* Systems Information Cards */}
      <section className="bg-surface-container-high rounded-xl p-5 border-t-2 border-surface-bright relative overflow-hidden shadow">
        <div className="absolute -top-4 -right-4 opacity-5 text-primary">
          <Info className="w-32 h-32" />
        </div>

        <h3 className="font-headline-md text-headline-md text-primary mb-3 uppercase flex items-center gap-1.5 leading-none">
          <Info className="w-4 h-4 text-primary" />
          App Terminal Info
        </h3>
        
        <div className="space-y-2.5 relative z-10 font-mono text-[11px]">
          <div className="flex justify-between border-b border-outline-variant/30 pb-1.5">
            <span className="text-on-surface-variant">Version Registry</span>
            <span className="text-on-surface font-bold">v2.4.0-pixel-edition</span>
          </div>
          <div className="flex justify-between border-b border-outline-variant/30 pb-1.5">
            <span className="text-on-surface-variant">Active Core Build</span>
            <span className="text-on-surface font-bold">8BIT_AT_2026_AI</span>
          </div>
          <div className="flex justify-between pb-0.5">
            <span className="text-on-surface-variant">Gamification Engine</span>
            <span className="text-on-surface font-bold text-primary">RetroPulse v1.2</span>
          </div>
        </div>
      </section>

      {/* Calendar Time-Travel Simulator */}
      {onSimulateTime && (
        <section className="bg-surface-container rounded-xl p-5 border-t-2 border-primary-container shadow">
          <h3 className="font-headline-md text-[14px] text-primary mb-2 uppercase flex items-center gap-1.5 leading-none">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            STREAK MULTIPLIER SIMULATOR
          </h3>
          <p className="text-on-surface-variant text-[11px] font-sans leading-relaxed mb-4">
            Test the live <strong>streak multiplier</strong> rewards logic instantly by simulating consecutive days of habit logging or a calendar drop-back:
          </p>
          
          <div className="grid grid-cols-2 gap-2.5">
            <button 
              onClick={() => onSimulateTime('consecutive')}
              className="py-2.5 bg-primary/15 border border-primary/35 hover:bg-primary/25 text-primary font-bold text-[11px] rounded-lg transition-all text-center flex items-center justify-center gap-1 leading-none uppercase"
            >
              🚀 Simulate Next Day
            </button>
            <button 
              onClick={() => onSimulateTime('missed')}
              className="py-2.5 bg-error/15 border border-error/35 hover:bg-error/25 text-error font-bold text-[11px] rounded-lg transition-all text-center flex items-center justify-center gap-1 leading-none uppercase"
            >
              ⚠️ Miss Day (Reset)
            </button>
          </div>
          
          <div className="mt-4 pt-3 border-t border-outline-variant/30 text-[11px] font-mono text-on-surface-variant space-y-1">
            <div className="flex justify-between">
              <span>Active Multiplier</span>
              <span className="text-secondary font-bold">{(playerState.multiplier ?? 1.0).toFixed(1)}x boost</span>
            </div>
            <div className="flex justify-between">
              <span>Consecutive Logging Days</span>
              <span className="text-secondary font-bold">{playerState.consecutiveDays ?? 0} days</span>
            </div>
          </div>
        </section>
      )}

      {/* Dangerous Wipe Actions Card */}
      <section className="bg-surface-container rounded-xl p-5 border-t-2 border-error/30 shadow">
        <h3 className="font-headline-md text-headline-md text-error mb-2 uppercase">Danger Zone</h3>
        
        <div className="p-4 bg-error-container/10 border border-error/25 rounded-lg">
          <p className="text-on-surface-variant text-[11px] font-sans leading-relaxed mb-4">
            Resetting your HydroPulse cache forces absolute deletion of your current levels, cumulative XP records, shop equippables, and streak counts back to the baseline.
          </p>
          <button 
            onClick={() => setShowConfirmModal(true)}
            className="w-full py-3 bg-error text-on-error font-headline-md text-sm rounded-lg pixel-button-shadow hover:bg-opacity-95 transition-all text-xs font-bold leading-none uppercase"
          >
            Reset Game Data
          </button>
        </div>
      </section>

      {/* Dynamic Visual Confirmation Overlay Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[110] bg-surface-dim/80 backdrop-blur-md flex items-center justify-center p-gutter">
          <div className="bg-surface-container-high w-full max-w-[310px] rounded-lg p-6 border-2 border-error shadow-2xl scale-100 transition-transform duration-200">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="h-12 w-12 rounded-full bg-error/10 flex items-center justify-center text-error animate-bounce">
                <Trash2 className="w-6 h-6" />
              </div>
              <h4 className="font-headline-md text-headline-md text-on-surface">ARE YOU CERTAIN?</h4>
              <p className="text-xs text-on-surface-variant font-sans px-1">
                This process cannot be rolled back of the central HydroPulse mainframe registry database.
              </p>
              
              <div className="flex flex-col w-full gap-2.5 mt-2">
                <button 
                  onClick={handleResetAction}
                  disabled={erasing}
                  className="w-full py-3 bg-error text-on-error font-headline-md text-sm rounded-lg flex items-center justify-center gap-1.5"
                >
                  {erasing ? (
                    <>
                      <Trash2 className="w-4 h-4 animate-spin" />
                      ERASING DATA...
                    </>
                  ) : (
                    "DELETE ALL PROGRESS"
                  )}
                </button>
                <button 
                  onClick={() => setShowConfirmModal(false)}
                  disabled={erasing}
                  className="w-full py-2.5 bg-surface-variant text-on-surface-variant text-xs font-bold rounded-lg border border-outline hover:bg-surface-container-highest transition-colors"
                >
                  ABORT MISSION
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
