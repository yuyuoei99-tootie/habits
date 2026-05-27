import { Trophy as TrophyIcon, Lock, Sparkles, Flame, Award, CheckCircle2 } from 'lucide-react';
import { PlayerState } from '../types';

interface TrophiesProps {
  playerState: PlayerState;
}

export default function Trophies({ playerState }: TrophiesProps) {
  // Built list of trophies
  const trophyList = [
    {
      id: 'swimming_mastery',
      name: 'Mastery of Swimming',
      description: 'Conquer the waves with unmatched biomechanical swimming form.',
      rewardText: 'Unlocked at Level 2 (Elite Athlete)',
      image: 'https://res.cloudinary.com/diputd1zo/image/upload/q_auto/f_auto/v1779876632/Screenshot_2026-05-27_at_17.10.01-removebg-preview_jzymqf.png',
      isUnlocked: playerState.level >= 2,
      category: 'Level Ascension',
      conditionText: 'Reach Level 2 (Elite Athlete)',
      currentVal: `Level ${playerState.level}`,
      targetVal: 'Level 2'
    },
    {
      id: 'mystical_athlete',
      name: 'Mystical Athlete',
      description: 'Ascend to cosmic state with highly attuned focus and breathing endurance.',
      rewardText: 'Unlocked at Level 3 (Zen Master)',
      image: 'https://res.cloudinary.com/diputd1zo/image/upload/q_auto/f_auto/v1779876805/Screenshot_2026-05-27_at_17.12.49-removebg-preview_tuhlio.png',
      isUnlocked: playerState.level >= 3,
      category: 'Level Ascension',
      conditionText: 'Reach Level 3 (Zen Master)',
      currentVal: `Level ${playerState.level}`,
      targetVal: 'Level 3'
    },
    {
      id: 'streak_master',
      name: '7-Day Streak Master',
      description: 'Maintain high momentum by checking off training routines consecutively.',
      rewardText: 'Achieve a 7-day personal best habit streak',
      isUnlocked: playerState.bestStreak >= 7,
      category: 'Habit Mastery',
      conditionText: 'Best Streak of 7+ days',
      currentVal: `${playerState.bestStreak} days`,
      targetVal: '7 days',
      isCustomIcon: true,
      iconType: 'flame'
    }
  ];

  const unlockedCount = trophyList.filter(t => t.isUnlocked).length;

  return (
    <div className="space-y-6 animate-[fadeInUp_0.4s_ease]">
      
      {/* Trophy Section Header */}
      <section className="bg-surface-container rounded-xl p-5 border-t-2 border-primary shadow relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 translate-x-4 -translate-y-4 scale-150 rotate-12">
          <TrophyIcon className="w-40 h-40 text-primary" />
        </div>

        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex items-center gap-2 border-l-4 border-primary pl-3">
            <TrophyIcon className="w-5 h-5 text-primary animate-pulse" />
            <h2 className="font-headline-md text-headline-sm uppercase tracking-tight text-on-surface">TROPHY ROOM</h2>
          </div>
          
          <p className="text-xs text-on-surface-variant font-sans leading-relaxed">
            Unlike expendable shop items, these prestigious dynamic badges are permanently displayed upon your profile as proof of ultimate habit mastery and level ascension.
          </p>

          <div className="flex items-center gap-2 bg-[#011a31] border border-outline-variant/65 p-2 rounded-lg mt-1 w-fit px-3">
            <span className="text-[11px] font-bold text-primary font-mono uppercase tracking-[0.05em]">
              🏆 Mastery standing: {unlockedCount} / {trophyList.length} Unlocked
            </span>
          </div>
        </div>
      </section>

      {/* Trophies Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-l-4 border-secondary pl-3">
          <h3 className="font-headline-md text-headline-md text-on-surface">MASTERY TROPHIES</h3>
          <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest text-[9px]">YOUR ACHIEVEMENTS</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {trophyList.map((t) => (
            <div 
              key={t.id}
              className={`p-4 rounded-xl border transition-all duration-300 relative overflow-hidden flex gap-4 ${
                t.isUnlocked
                  ? 'bg-[#021f3a] border-primary/40 shadow-[0_0_15px_rgba(172,242,247,0.15)] ring-1 ring-primary/20'
                  : 'bg-surface-container-high/80 border-outline-variant/40 opacity-75'
              }`}
            >
              {/* Left Column: Image/Icon frame */}
              <div className="w-20 h-20 bg-[#001426] rounded-xl border border-outline-variant/50 flex-shrink-0 flex items-center justify-center p-2 relative shadow-inner overflow-hidden">
                {t.isUnlocked ? (
                  t.image ? (
                    <img 
                      src={t.image} 
                      alt={t.name} 
                      className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,255,255,0.25)] scale-[1.05]" 
                      referrerPolicy="no-referrer"
                    />
                  ) : t.iconType === 'flame' ? (
                    <Flame className="w-10 h-10 text-orange-400 fill-orange-500 animate-bounce" />
                  ) : (
                    <Award className="w-10 h-10 text-primary animate-pulse" />
                  )
                ) : (
                  <>
                    {/* Locked state representation */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                      <Lock className="w-5 h-5 text-on-surface-variant/80" />
                    </div>
                    {t.image ? (
                      <img 
                        src={t.image} 
                        alt={t.name} 
                        className="w-full h-full object-contain filter grayscale brightness-50" 
                        referrerPolicy="no-referrer"
                      />
                    ) : t.iconType === 'flame' ? (
                      <Flame className="w-10 h-10 text-neutral-600 fill-neutral-700" />
                    ) : (
                      <Award className="w-10 h-10 text-neutral-600" />
                    )}
                  </>
                )}
              </div>

              {/* Right Column: Text content */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2.5">
                    <span className="text-[10px] font-bold text-secondary uppercase font-mono tracking-wider leading-none">
                      {t.category}
                    </span>
                    {t.isUnlocked && (
                      <span className="text-[8px] font-mono font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse border border-primary/30 flex items-center gap-1">
                        <Sparkles className="w-2 h-2" /> Unlocked
                      </span>
                    )}
                  </div>
                  
                  <h4 className={`font-headline-md text-[15px] font-bold mt-1 tracking-tight leading-tight uppercase ${
                    t.isUnlocked ? 'text-primary' : 'text-on-surface-variant'
                  }`}>
                    {t.name}
                  </h4>
                  
                  <p className="text-[11px] text-on-surface-variant leading-normal mt-1 font-sans">
                    {t.description}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-outline-variant/20 flex flex-wrap justify-between items-center gap-2">
                  <span className="text-[10px] text-on-surface/90 font-medium">
                    {t.isUnlocked ? 'Requirement met!' : `Requirement: ${t.conditionText}`}
                  </span>

                  {/* Tiny progress pill */}
                  <div className="text-[9px] font-mono bg-[#011424] px-2 py-0.5 rounded border border-outline-variant">
                    <span className="text-on-surface-variant">Status: </span>
                    <span className={t.isUnlocked ? "text-primary font-bold" : "text-secondary font-bold"}>
                      {t.isUnlocked ? "COMPLETE" : `${t.currentVal} / ${t.targetVal}`}
                    </span>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
