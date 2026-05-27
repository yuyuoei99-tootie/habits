import { useState, useEffect } from 'react';
import { AlertCircle, ShieldAlert, Sparkles, Check, Clock, ChevronRight, Zap } from 'lucide-react';
import { Quest, PlayerState, QuestType } from '../types';
import { getAvatarUrl, getStanceName } from '../utils/avatar';

interface ArenaProps {
  playerState: PlayerState;
  quests: Quest[];
  onToggleQuest: (questId: string, customXp?: number, customTokens?: number) => void;
  onOpenAIVerify: (quest: Quest) => void;
}

export default function Arena({ playerState, quests, onToggleQuest, onOpenAIVerify }: ArenaProps) {
  const [countdown, setCountdown] = useState("04:12:45");

  // Determine active Boss / beast name and illustration asset matching the player tier
  let bossName = "Sir Puffernox";
  let bossImg = "https://res.cloudinary.com/diputd1zo/image/upload/q_auto/f_auto/v1779874892/Screenshot_2026-05-27_at_16.38.26-removebg-preview_qke7oa.png";

  if (playerState.level === 2) {
    bossName = "Alligatorax";
    bossImg = "https://res.cloudinary.com/diputd1zo/image/upload/q_auto/f_auto/v1779874920/Screenshot_2026-05-27_at_16.40.46-removebg-preview_hrcisj.png";
  } else if (playerState.level >= 3) {
    bossName = "Michael Phelps";
    bossImg = "https://res.cloudinary.com/diputd1zo/image/upload/q_auto/f_auto/v1779875503/Screenshot_2026-05-27_at_16.50.38-removebg-preview_xof7ux.png";
  }

  // Retro countdown timer logic
  useEffect(() => {
    let hours = 4, mins = 12, secs = 45;
    const interval = setInterval(() => {
      secs--;
      if (secs < 0) {
        secs = 59;
        mins--;
      }
      if (mins < 0) {
        mins = 59;
        hours--;
      }
      if (hours < 0) {
        hours = 23; // Loop
      }
      setCountdown(
        `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Dynamic Evolution Player Header Banner */}
      <div className="p-4 bg-surface-container rounded-xl border-t-2 border-surface-bright flex items-center justify-between shadow">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="absolute -top-1.5 -right-1 px-1 bg-secondary text-on-secondary font-bold text-[8px] rounded uppercase tracking-wider z-10 leading-none">
              LVL {playerState.level}
            </span>
            <div className="w-12 h-12 bg-surface-variant rounded-lg overflow-hidden border-2 border-primary">
              <img 
                src={getAvatarUrl(playerState.level)}
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div>
            <h3 className="font-headline-md text-[16px] text-primary uppercase">
              {getStanceName(playerState.level)}
            </h3>
            <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider leading-none">
              Cosmetic items equipped: {playerState.equippedCosmetics.length}
            </span>
          </div>
        </div>
        
        {/* Equipped Cosmetic Overlays Display */}
        {playerState.equippedCosmetics.length > 0 && (
          <div className="flex gap-1">
            {playerState.equippedCosmetics.map(id => {
              let icon = "🎒";
              if (id === 'floaties') icon = "🛟";
              if (id === 'cool_water') icon = "💧";
              if (id === 'dolphin') icon = "🐬";
              if (id === 'rainbow_aura') icon = "🌈";
              return (
                <span key={id} title={id} className="text-sm bg-surface-variant p-1 rounded border border-outline-variant animate-pulse">
                  {icon}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Global XP Progress Bar (Retro Stepped) */}
      <div className="bg-surface-container/30 px-3 py-2 rounded-xl border border-outline-variant/50">
        <div className="flex justify-between items-center mb-1.5">
          <span className="font-label-sm text-label-sm text-on-surface-variant">LEVEL {playerState.level}</span>
          <span className="font-label-sm text-label-sm text-on-surface-variant tracking-wider font-mono">
            {playerState.xp} / {playerState.xpToNextLevel} XP
          </span>
        </div>
        <div className="h-4.5 w-full bg-surface-container-high border-2 border-outline-variant relative overflow-hidden rounded-md">
          <div 
            className="h-full bg-primary stepped-progress transition-all duration-700 ease-out" 
            style={{ width: `${Math.min(100, (playerState.xp / playerState.xpToNextLevel) * 100)}%` }}
          />
        </div>
      </div>

      {/* Attack Alert Banner */}
      {playerState.xpFreeze && (
        <div className="p-4 bg-error-container text-on-error-container border-2 border-error/30 rounded-lg flex items-start gap-3 animate-pulse">
          <ShieldAlert className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-label-md text-label-md font-bold uppercase tracking-wider">Yesterday's missed habits triggered an XP freeze!</p>
            <p className="text-xs opacity-80 mt-0.5 font-sans leading-relaxed">Complete and verify today's AI validation quests immediately to lift the lock.</p>
          </div>
        </div>
      )}

      {/* Active Boss Fight Panel */}
      <section className="relative bg-surface-container p-6 rounded-xl border-t-2 border-white/5 pixel-shadow overflow-hidden">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-surface-bright border-2 border-outline-variant rounded-full">
          <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest text-[10px]">Active Boss Fight</span>
        </div>

        <div className="flex flex-col items-center py-4">
          {/* Floating Neon Boss Sprite */}
          <div className="relative w-45 h-45 mb-4 transition-transform duration-500 hover:scale-105 flex items-center justify-center">
            <img 
              alt={bossName} 
              className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(172,242,247,0.35)] animate-[float_3s_ease-in-out_infinite]"
              src={bossImg}
              referrerPolicy="no-referrer"
            />
            {playerState.bossHp <= 0 ? (
              <div className="absolute inset-0 bg-error/20 flex items-center justify-center rounded-full backdrop-blur-sm z-10">
                <span className="font-headline-md text-error bg-surface-dim border-2 border-error p-2 rounded uppercase text-md rotate-12">SLAYED!</span>
              </div>
            ) : (
              <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse" />
            )}
          </div>

          {/* Boss Stats */}
          <div className="w-full">
            <div className="flex justify-between items-end mb-1.5">
              <span className="font-headline-md text-headline-md text-primary tracking-tight uppercase">{bossName}</span>
              <span className="font-label-md text-label-md text-error-container font-mono">{playerState.bossHp}% HP</span>
            </div>
            
            <div className="h-3 w-full bg-surface-container-low border border-outline-variant overflow-hidden rounded-sm">
              <div 
                className="h-full bg-error stepped-progress transition-all duration-500 ease-in-out" 
                style={{ width: `${playerState.bossHp}%` }}
              />
            </div>
            <p className="text-[10px] text-on-surface-variant mt-1.5 text-center font-mono uppercase tracking-wider">
              {playerState.bossHp > 0 
                ? "Every checked habit drains the boss. AI verifications strike twice as hard!" 
                : `${bossName} Defeated! New rival spawns in next quest rotation.`}
            </p>
          </div>
        </div>
      </section>

      {/* Daily Quests Checklist */}
      <section className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-headline-md text-headline-md text-on-surface">Daily Quests</h2>
          <div className="flex items-center gap-2 bg-surface-container-high px-3 py-1 rounded-lg border border-outline-variant">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span className="font-label-sm text-label-sm text-primary tracking-wider" id="countdown">{countdown}</span>
          </div>
        </div>

        <div className="space-y-3">
          {quests.map((quest) => (
            <div 
              key={quest.id}
              className={`w-full group bg-surface-container-high p-4 rounded-xl border-t-2 border-white/5 flex flex-col justify-between hover:bg-surface-container-highest transition-all pixel-shadow relative ${quest.completedToday ? 'opacity-75' : ''}`}
            >
              <div className="flex items-start justify-between w-full">
                <div className="flex gap-3 items-start">
                  
                  {/* Custom Checkbox Button */}
                  <button 
                    onClick={() => onToggleQuest(quest.id)}
                    className={`mt-1 h-9 w-9 border-2 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 ${quest.completedToday ? 'bg-primary/20 border-primary text-primary' : 'bg-surface-container border-primary-fixed-dim hover:bg-surface-variant'}`}
                  >
                    {quest.completedToday && <Check className="w-5 h-5 text-primary stroke-[3]" />}
                  </button>

                  <div>
                    <h3 className="font-body-lg text-body-lg font-bold text-on-surface leading-tight">
                      {quest.name}
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-0.5">{quest.description}</p>
                    
                    <div className="flex gap-3 mt-2">
                      <span className="font-label-sm text-label-sm text-primary">+{quest.xpReward} XP Base</span>
                      {quest.streakBonusText && (
                        <span className="font-label-sm text-label-sm text-secondary">{quest.streakBonusText}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 min-w-[60px]">
                  <div className="font-label-sm text-label-sm text-on-surface-variant leading-none">STREAK</div>
                  <div className="font-headline-md text-headline-md text-primary">{quest.streak}D</div>
                </div>
              </div>

              {/* Verified AI Trigger Ribbon */}
              {!quest.completedToday && (
                <div className="mt-3 pt-3 border-t border-outline-variant/30 flex justify-end">
                  <button
                    onClick={() => onOpenAIVerify(quest)}
                    className="py-1.5 px-3 bg-primary-container/10 border border-primary/25 rounded-md hover:bg-primary-container/25 text-primary font-label-md text-[11px] uppercase tracking-wider flex items-center gap-1.5 animate-pulse"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Launch AI Verification Quest
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
