import { Award, Zap, Trophy, Flame, CheckCircle, ChevronUp, TrendingUp } from 'lucide-react';
import { PlayerState, LeaderboardEntry, Challenge } from '../types';
import { getAvatarUrl } from '../utils/avatar';

interface RankProps {
  playerState: PlayerState;
}

export default function Rank({ playerState }: RankProps) {
  
  // Dynamic leaderboard matching user status
  const leaderboard: LeaderboardEntry[] = [
    {
      rank: 1,
      name: "MichaelPhelpsJr",
      avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAEqMB_Hemx9dlHKIyEIJlm7TIwin8-plY5L5JBkbFCwW06qM0HxY_-nBygOKJwvhhxd2BV3VW0cuC4nBYMbhd3CHwMIK2qbB495Cn6q73PNPDGp6DQbfM-PPZqpJPDkdfW45DugR07KZoI5MnWk6NL9sd_TrAX78ELMTdYsL3W2X0O2GQR0imG2FAStM9T5_cZSmFm8QY_y2SmIc6rZFVcz-7opp8TGlppx8El4_Ue-Wv9JpqenQ20zJ2OFNr6GACQkJer-CHsZLk",
      xp: 12450,
      level: 42
    },
    {
      rank: 2,
      name: "Hydro_Aura",
      avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuB7GYxIjykUY-1gCvwFSkyNcIK5lwTzzGS0Z8e2ReNWfncJHyM7b5NK7wtZRnc7rg-zgKuPA3nBEJ5J_fBqR27c4Uocb2aPIgsYPBwqNAgANniDEKujyL5AaiI3wKh61YMx_3MJChJP7BzSnwzTJ7WfQ13XRPVf9nx5mwxcAWq78MoYn769peJBFJACbve-rwvhV45L0Gys4UBMVOE_5WJtVpQWkHvBUKlFka5ykzRXm4aWwMJvedZZ6Mg8XFrKRjFd2GBR_rEzeHc",
      xp: 8900,
      level: 29
    },
    {
      rank: 3,
      name: "AquaBeastSlayer",
      avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBPADWtd-W0MUF12t_xtPmkj2HaGJgDBLJzBMpHyg4Cc4ASZ4n5fiwSeet5_VzWZjMVHkM_zXhAGBsHe-qTMHXUYu974WbC75cjNHObQVdCc76fgZXLbmh3SJpYPgOUSqciuBuDTR98EGOjGytt76R1aMpkUSR7MUgG7RP02YTQt6ewX2DVuSPTJL2hGULHa1_CfP3QmGVDbDuI8WajW8zCHaxKejGeDcfWQ3FamRotQjc6jvXgeXvB3RGf4y6BUnVr4xoc3M5H25M",
      xp: 3400,
      level: 25
    },
    {
      rank: 4,
      name: "You (Warrior)",
      avatarUrl: getAvatarUrl(playerState.level),
      xp: playerState.level * 100 + playerState.xp,
      level: playerState.level,
      isCurrentUser: true
    }
  ];

  // Daily Challenge logic based on player's current progression
  const challenges: Challenge[] = [
    {
      id: 'ai_verify',
      title: 'AI Verification Scholar',
      description: 'Complete at least 1 habit today using the AI Verification Quest.',
      targetCount: 1,
      currentCount: playerState.perfectDaysCount > 0 ? 1 : 0, // Mock progress based on play history
      completed: playerState.perfectDaysCount > 0,
      xpReward: 30,
      tokenReward: 10
    },
    {
      id: 'defeat_pufferfish',
      title: 'Tame the Aquatic Deeps',
      description: 'Slay the Aqua-Behemoth by draining its HP bar to 0% (Check off daily habits).',
      targetCount: 0,
      currentCount: playerState.bossHp <= 0 ? 0 : 70 - playerState.bossHp, // Simulated HP damage
      completed: playerState.bossHp <= 0,
      xpReward: 100,
      tokenReward: 50
    },
    {
      id: 'spend_tokens',
      title: 'Gear Up',
      description: 'Purchase any cosmetic gear skin or booster power-up in the Gear Shop.',
      targetCount: 1,
      currentCount: playerState.purchasedItemIds.length > 0 ? 1 : 0,
      completed: playerState.purchasedItemIds.length > 0,
      xpReward: 50,
      tokenReward: 15
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Daily Challenges Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-l-4 border-primary pl-3">
          <h3 className="font-headline-md text-headline-md text-on-surface">CHALLENGES</h3>
          <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest text-[9px]">DAILY BONUSES</span>
        </div>

        <div className="space-y-3">
          {challenges.map((c) => (
            <div 
              key={c.id}
              className={`p-4 bg-surface-container-high rounded-xl border-t-2 border-white/5 pixel-shadow relative ${c.completed ? 'opacity-80 border-t-2 border-primary/20' : ''}`}
            >
              <div className="flex justify-between items-start gap-3">
                <div className="space-y-1">
                  <h4 className="font-body-lg text-body-lg font-bold text-on-surface flex items-center gap-1.5 leading-tight">
                    {c.completed ? (
                      <CheckCircle className="w-4.5 h-4.5 text-primary" />
                    ) : (
                      <TrendingUp className="w-4.5 h-4.5 text-secondary" />
                    )}
                    {c.title}
                  </h4>
                  <p className="text-[11px] text-on-surface-variant font-sans leading-relaxed">
                    {c.description}
                  </p>
                </div>

                {/* Reward pill */}
                <div className="flex flex-col items-end flex-shrink-0">
                  <span className="text-[10px] font-bold text-primary font-mono leading-none">+{c.xpReward} XP</span>
                  <span className="text-[10px] font-bold text-secondary font-mono leading-none mt-1">+$ {c.tokenReward}</span>
                </div>
              </div>

              {/* Progress slider bar */}
              <div className="mt-3">
                <div className="flex justify-between text-[9px] font-mono mb-1 text-on-surface-variant">
                  <span>PROGRESS</span>
                  <span>{c.completed ? 'COMPLETED' : `${c.currentCount}/${c.targetCount}`}</span>
                </div>
                <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${c.completed ? 'bg-primary' : 'bg-secondary'}`}
                    style={{ width: c.completed ? '100%' : `${(c.currentCount / (c.targetCount || 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Leaderboards Sections */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-l-4 border-secondary pl-3">
          <h3 className="font-headline-md text-headline-md text-on-surface">LEADERBOARDS</h3>
          <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest text-[9px]">GLOBAL STATUS</span>
        </div>

        <div className="bg-surface-container rounded-xl border border-outline-variant/35 overflow-hidden divide-y divide-outline-variant/20 shadow">
          {leaderboard.map((user) => (
            <div 
              key={user.rank}
              className={`p-3.5 flex items-center justify-between transition-colors ${user.isCurrentUser ? 'bg-primary/10 border-y-2 border-primary/25' : 'hover:bg-surface-container-high'}`}
            >
              <div className="flex items-center gap-3">
                
                {/* Ranking Medals/Numbers */}
                <div className="w-7 text-center flex justify-center items-center">
                  {user.rank === 1 ? (
                    <Trophy className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ) : user.rank === 2 ? (
                    <Award className="w-5 h-5 text-slate-300" />
                  ) : user.rank === 3 ? (
                    <Award className="w-5 h-5 text-amber-600" />
                  ) : (
                    <span className="font-headline-md text-[14px] text-on-surface-variant font-mono">{user.rank}</span>
                  )}
                </div>

                {/* Avatar Pic */}
                <div className="w-9 h-9 rounded bg-surface-variant border border-outline-variant overflow-hidden flex-shrink-0">
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                </div>

                {/* User Info */}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className={`font-body-md font-bold leading-none ${user.isCurrentUser ? 'text-primary' : 'text-on-surface'}`}>
                      {user.name}
                    </span>
                    {user.isCurrentUser && (
                      <span className="text-[8px] bg-primary/20 text-primary border border-primary/30 px-1 rounded uppercase font-bold tracking-wide scale-90">YOU</span>
                    )}
                  </div>
                  <span className="text-[10px] text-on-surface-variant/80 font-semibold font-sans">
                    Level {user.level} Fighter
                  </span>
                </div>

              </div>

              {/* XP Value Standing */}
              <div className="text-right">
                <span className="font-headline-md text-[13px] text-primary font-mono block">
                  {user.xp} <span className="text-[9px] text-secondary">XP</span>
                </span>
                <span className="text-[9px] text-on-surface-variant uppercase font-bold leading-none font-sans flex items-center gap-0.5 justify-end">
                  <ChevronUp className="w-3 h-3 text-primary" />
                  STABLE
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
