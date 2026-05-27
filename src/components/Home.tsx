import { useState, useEffect } from 'react';
import { Home as HomeIcon, Award, ShieldAlert, Sparkles, Check, Clock, ChevronRight, Lock, Calendar, BookOpen, Layers, Zap } from 'lucide-react';
import { PlayerState, Quest } from '../types';
import { getAvatarUrl, getStanceName } from '../utils/avatar';

interface HomeProps {
  playerState: PlayerState;
  quests: Quest[];
  onToggleQuest: (questId: string, customXp?: number, customTokens?: number) => void;
  onNavigate: (tab: 'arena' | 'stats' | 'shop' | 'rank' | 'settings') => void;
  onSkipLevel: () => void;
  onLevelDown: () => void;
}

export default function Home({ playerState, quests, onToggleQuest, onNavigate, onSkipLevel, onLevelDown }: HomeProps) {
  // Determine dynamic boss name and image to match current player state level
  let bossName = "Sir Puffernox";
  let bossImg = "https://res.cloudinary.com/diputd1zo/image/upload/q_auto/f_auto/v1779874892/Screenshot_2026-05-27_at_16.38.26-removebg-preview_qke7oa.png";

  if (playerState.level === 2) {
    bossName = "Alligatorax";
    bossImg = "https://res.cloudinary.com/diputd1zo/image/upload/q_auto/f_auto/v1779874920/Screenshot_2026-05-27_at_16.40.46-removebg-preview_hrcisj.png";
  } else if (playerState.level >= 3) {
    bossName = "Michael Phelps";
    bossImg = "https://res.cloudinary.com/diputd1zo/image/upload/q_auto/f_auto/v1779875503/Screenshot_2026-05-27_at_16.50.38-removebg-preview_xof7ux.png";
  }

  // Helper to find quest states
  const stretchingQuest = quests.find(q => q.type === 'stretching');
  const mealsQuest = quests.find(q => q.type === 'clean_meals');
  const swimQuest = quests.find(q => q.type === 'swim');

  // Let's create beautiful dynamic values representing current progress
  const stretchingDone = stretchingQuest?.completedToday ?? false;
  const mealsDone = mealsQuest?.completedToday ?? false;
  const swimDone = swimQuest?.completedToday ?? false;

  // Render 20 individual ticks for the retro segmented XP progress bar
  const totalTicks = 20;
  const currentProgressPercent = Math.min(100, (playerState.xp / playerState.xpToNextLevel) * 100);
  const activeTicksCount = Math.round((currentProgressPercent / 100) * totalTicks);

  return (
    <div className="space-y-5 animate-[fadeInUp_0.4s_ease]">
      
      {/* 1. Header Level Progress Area */}
      <section className="bg-surface-container rounded-xl p-5 border-t-2 border-surface-bright shadow relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* XP Progress Titles */}
          <div className="flex-1 space-y-1.5">
            <div className="flex justify-between items-baseline mb-1">
              <span className="font-headline text-[13px] text-on-surface uppercase tracking-wider">XP PROGRESS</span>
              <span className="text-[11px] font-mono text-on-surface-variant font-bold leading-none">
                XP: {playerState.xp} | Level {playerState.level} Warrior | {playerState.xpToNextLevel} XP to Next Tier
              </span>
            </div>

            {/* Custom Pixel Segmented Progress Bar */}
            <div className="flex items-center gap-[4px] p-1 bg-[#011424] rounded-lg border-2 border-outline-variant relative">
              {Array.from({ length: totalTicks }).map((_, i) => {
                const isActive = i < activeTicksCount;
                return (
                  <div 
                    key={i} 
                    className={`h-4.5 flex-1 rounded-[2px] transition-all duration-300 ${
                      isActive 
                        ? 'bg-gradient-to-t from-primary/80 to-primary shadow-[0_0_8px_rgba(172,242,247,0.4)]' 
                        : 'bg-[#031d33]'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Wallet / Tokens Display */}
          <div className="flex-shrink-0 flex items-center gap-3 bg-[#011a31] border border-outline-variant/50 p-2.5 rounded-lg px-4 hover:bg-[#022340] cursor-pointer transition-colors" onClick={() => onNavigate('shop')}>
            {/* Custom Retro Wallet Visual representation matching screenshot */}
            <div className="relative w-12 h-10 bg-amber-800 rounded-lg flex items-center justify-center border-t-2 border-amber-600 shadow-md">
              {/* Wallet fold line */}
              <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-amber-950 opacity-60" />
              {/* Metal snap / Gold badge */}
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded bg-amber-300 border border-amber-950 shadow" />
              {/* Golden Coins peeking out */}
              <div className="absolute -top-1.5 left-1.5 w-3 h-3 rounded-full bg-amber-400 border border-amber-950 flex items-center justify-center text-[6px] font-bold text-amber-950">
                ★
              </div>
              <div className="absolute -top-2 left-4 w-3.5 h-3.5 rounded-full bg-yellow-400 border border-amber-900 shadow" />
            </div>

            <div className="flex flex-col">
              <span className="text-secondary text-lg font-headline leading-tight font-extrabold pr-1">
                ${playerState.tokens}
              </span>
              <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold leading-none">
                Tokens
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Main Grid Layout mirroring the image columns */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Left Column (DAILY HABIT SYNC) - Span 12 on mobile, Span 4 on md */}
        <div className="md:col-span-4 bg-[#05203b] rounded-xl p-4.5 border border-outline-variant/35 flex flex-col justify-between shadow">
          <div>
            <div className="text-center pb-2 mb-3 border-b border-outline-variant/20">
              <h3 className="font-headline text-[13px] tracking-wide text-on-surface">
                DAILY HABIT SYNC
              </h3>
            </div>

            <div className="space-y-4 pt-1">
              {/* Row 1: Stretching */}
              <div 
                className="flex items-center gap-3 group cursor-pointer"
                onClick={() => onToggleQuest('stretching')}
                title="Click to toggle Stretching task"
              >
                {/* Visual Stickman icon */}
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform flex-shrink-0">
                  <span className="text-md font-bold">🧘</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-xs uppercase font-bold text-on-surface truncate">Stretching</span>
                    <span className="text-[10px] font-mono font-bold text-on-surface-variant">
                      {stretchingDone ? '20m/20m' : '12m/20m'}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[#011424] rounded overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: stretchingDone ? '100%' : '60%' }}
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Meals */}
              <div 
                className="flex items-center gap-3 group cursor-pointer"
                onClick={() => onToggleQuest('meals')}
                title="Click to toggle Diet protein task"
              >
                {/* Visual Fork & Knife icon */}
                <div className="w-10 h-10 rounded-lg bg-orange-400/10 border border-orange-400/20 flex items-center justify-center text-orange-400 group-hover:scale-105 transition-transform flex-shrink-0">
                  <span className="text-md">🍽️</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-xs uppercase font-bold text-on-surface truncate">Meals</span>
                    <span className="text-[10px] font-mono font-bold text-on-surface-variant">
                      {mealsDone ? '3/3' : '2/3'}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[#011424] rounded overflow-hidden">
                    <div 
                      className="h-full bg-orange-400 rounded-full transition-all duration-500"
                      style={{ width: mealsDone ? '100%' : '66.6%' }}
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Swim */}
              <div 
                className="flex items-center gap-3 group cursor-pointer"
                onClick={() => onToggleQuest('swim')}
                title="Click to toggle Swimming task"
              >
                {/* Visual Ocean wave swimmer icon */}
                <div className="w-10 h-10 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary group-hover:scale-105 transition-transform flex-shrink-0 font-bold">
                  🏊
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-xs uppercase font-bold text-on-surface truncate">Swim</span>
                    <span className="text-[10px] font-mono font-bold text-on-surface-variant">
                      {swimDone ? 'Completed' : 'Not Started'}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-[#011424] rounded overflow-hidden">
                    <div 
                      className="h-full bg-secondary rounded-full transition-all duration-500 animate-pulse"
                      style={{ width: swimDone ? '100%' : '0%' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3.5 border-t border-outline-variant/20">
            <p className="text-[10.5px] text-on-surface-variant font-sans leading-relaxed text-center">
              Tap any habit above to quickly toggle completion and gain instant rewards!
            </p>
          </div>
        </div>

        {/* Middle Column (MAIN GLOWING AVATAR VIEW) - Span 12 on mobile, Span 5 on md */}
        <div className="md:col-span-5 flex flex-col gap-3">
          
          {/* Neon Double-Bordered Frame containing Lotus Pose meditating girl */}
          <div className="bg-[#031c36] rounded-xl p-5 border-2 border-primary/40 relative shadow-[0_0_15px_rgba(172,242,247,0.15)] flex flex-col items-center justify-center flex-1">
            
            {/* Meditating Stance Character Graphic Wrapper with Glow Effect */}
            <div className="relative w-44 h-44 mb-3 transition-transform duration-500 hover:scale-[1.03] overflow-visible">
              {/* Backglow Circle */}
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl animate-pulse" />
              
              <img 
                key={playerState.level}
                src={getAvatarUrl(playerState.level)} 
                alt="Lotus Zen Master Avatar" 
                className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(172,242,247,0.4)] animate-[float_3.5s_ease-in-out_infinite] transition-all duration-700 ease-out animate-[scaleIn_0.5s_ease-out] [animation-composition:accumulate]"
              />
            </div>

            {/* Current Stance label in Space Mono font */}
            <div className="mt-1">
              <span className="font-headline text-[13px] text-primary tracking-wide text-center uppercase block font-bold">
                CURRENT STANCE: {getStanceName(playerState.level)}
              </span>
            </div>
          </div>

          {/* ACTIVE BATTLE arcade styled button */}
          <button 
            onClick={() => onNavigate('arena')}
            className="w-full py-3.5 bg-[#0e3b66] hover:bg-[#154b7c] text-primary font-headline text-sm rounded-xl border border-primary/20 pixel-shadow active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase tracking-wide cursor-pointer text-center"
          >
            <Zap className="w-4 h-4 fill-primary" />
            <span>ACTIVE BATTLE</span>
          </button>

        </div>

        {/* Right Column (EVOLUTION & BATTLE STATS) - Span 12 on mobile, Span 3 on md */}
        <div className="md:col-span-3 flex flex-col gap-4">
          
          {/* AVATAR EVOLUTION CARD */}
          <div className="bg-[#05203b] rounded-xl p-4 border border-outline-variant/35 flex-1 shadow">
            <h3 className="font-headline text-[12px] text-on-surface text-center mb-3 pb-2 border-b border-outline-variant/20 tracking-wide">
              AVATAR EVOLUTION
            </h3>

            <div className="flex items-center justify-center gap-2.5 py-1">
              {/* Current Stage */}
              <div className="flex flex-col items-center">
                <div className="w-[68px] h-[68px] bg-[#021427] border border-primary/30 rounded-lg overflow-hidden p-1 flex items-center justify-center">
                  <img 
                    src={getAvatarUrl(playerState.level)} 
                    alt="Current Avatar Stage" 
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>
                <span className="text-[10px] font-bold text-primary mt-1.5 uppercase font-headline truncate max-w-[80px] text-center block">
                  {getStanceName(playerState.level).split(' ').pop()}
                </span>
              </div>

              {/* Progress Arrow */}
              <ChevronRight className="w-5 h-5 text-on-surface-variant flex-shrink-0 animate-pulse mt-[-10px]" />

              {/* Locked Next Stage */}
              <div className="flex flex-col items-center">
                {playerState.level < 3 ? (
                  <>
                    <div className="w-[68px] h-[68px] bg-black/40 border border-outline/30 rounded-lg overflow-hidden flex flex-col items-center justify-center relative select-none">
                      <Lock className="w-4 h-4 text-on-surface-variant/70 z-10" />
                      <img 
                        src={getAvatarUrl(playerState.level + 1)} 
                        alt="Locked Stance Shape" 
                        className="absolute inset-[4px] w-[58px] h-[58px] object-cover rounded-md filter brightness-0 opacity-15 overflow-hidden"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-on-surface-variant/80 mt-1.5 uppercase font-headline">
                      {getStanceName(playerState.level + 1).split(' ').pop()}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-[68px] h-[68px] bg-primary/10 border border-primary/40 rounded-lg overflow-hidden flex flex-col items-center justify-center relative select-none animate-pulse">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-[10px] font-bold text-primary mt-1.5 uppercase font-headline animate-pulse">
                      ASCENDED
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ACTIVE BATTLE CARD */}
          <div className="bg-[#05203b] rounded-xl p-4 border border-outline-variant/35 flex-1 shadow">
            <h3 className="font-headline text-[12px] text-on-surface text-center mb-3 pb-2 border-b border-outline-variant/20 tracking-wide">
              ACTIVE BATTLE
            </h3>

            <div 
              className="flex items-center gap-3 bg-[#011425] p-2 rounded-lg border border-outline-variant/40 hover:bg-[#02213b] cursor-pointer transition-colors"
              onClick={() => onNavigate('arena')}
            >
              <div className="w-12 h-12 rounded bg-[#00172e] border-2 border-error/40 flex-shrink-0 overflow-hidden relative flex items-center justify-center p-1">
                <img 
                  src={bossImg} 
                  alt={bossName} 
                  className="w-full h-full object-contain filter drop-shadow-[0_0_5px_rgba(255,100,100,0.3)]"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-[11px] font-bold text-on-surface truncate pr-1">{bossName}</span>
                  <span className="text-[11px] font-mono font-bold text-error">{playerState.bossHp}%</span>
                </div>
                <div className="h-2 w-full bg-[#021321] rounded overflow-hidden">
                  <div 
                    className="h-full bg-error transition-all duration-500"
                    style={{ width: `${playerState.bossHp}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Floating Bottom Center Level Controls Debug/Testing Trigger Buttons */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[80] w-full max-w-[480px] px-6 py-2 pointer-events-none flex justify-center gap-3">
        <button
          onClick={onLevelDown}
          disabled={playerState.level <= 1}
          className={`pointer-events-auto px-5 py-2 rounded-full font-headline font-bold text-[11px] uppercase tracking-wider transition-all shadow-[0_4px_12px_rgba(0,0,0,0.5)] border-2 ${
            playerState.level <= 1
              ? 'bg-neutral-800/90 text-[#64748b] border-neutral-700/40 cursor-not-allowed'
              : 'bg-[#1b2b40]/90 text-on-surface border-outline-variant/55 hover:scale-[1.03] active:scale-[0.97]'
          }`}
        >
          Level Down
        </button>

        <button
          onClick={onSkipLevel}
          disabled={playerState.level >= 3}
          className={`pointer-events-auto px-5 py-2 rounded-full font-headline font-bold text-[11px] uppercase tracking-wider transition-all shadow-[0_4px_12px_rgba(0,0,0,0.5)] border-2 ${
            playerState.level >= 3
              ? 'bg-neutral-800/90 text-neutral-500 border-neutral-700/40 cursor-not-allowed'
              : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white border-amber-400 hover:scale-[1.03] active:scale-[0.97]'
          }`}
        >
          {playerState.level >= 3 ? "Max Level Reached" : "Skip Level"}
        </button>
      </div>

    </div>
  );
}
