import { useEffect, useState } from 'react';
import { 
  AreaChart, 
  TrendingUp, 
  Flame, 
  Sparkles, 
  Activity, 
  Utensils, 
  Waves, 
  CheckCircle2, 
  Info, 
  Percent, 
  CalendarDays,
  Zap,
  TrendingDown
} from 'lucide-react';
import { PlayerState, Quest } from '../types';

interface StatsProps {
  playerState: PlayerState;
  quests: Quest[];
  onSelectVerifyQuest: (quest: Quest) => void;
}

type CategoryType = 'stretching' | 'meals' | 'swim';

export default function Stats({ playerState, quests, onSelectVerifyQuest }: StatsProps) {
  const [animatedXp, setAnimatedXp] = useState(0);
  const [animatedStreak, setAnimatedStreak] = useState(0);
  const [selectedSubTab, setSelectedSubTab] = useState<CategoryType>('stretching');

  // Counter animation on load
  useEffect(() => {
    let xpStart = 0;
    const xpEnd = playerState.level * 100 + playerState.xp; // Approximate total cumulative XP
    const duration = 1200; // ms
    const increment = Math.ceil(xpEnd / (duration / 30));

    const xpTimer = setInterval(() => {
      xpStart += increment;
      if (xpStart >= xpEnd) {
        setAnimatedXp(xpEnd);
        clearInterval(xpTimer);
      } else {
        setAnimatedXp(xpStart);
      }
    }, 30);

    let streakStart = 0;
    const streakEnd = playerState.bestStreak;
    const streakTimer = setInterval(() => {
      streakStart += 1;
      if (streakStart >= streakEnd) {
        setAnimatedStreak(streakEnd);
        clearInterval(streakTimer);
      } else {
        setAnimatedStreak(streakStart);
      }
    }, 100);

    return () => {
      clearInterval(xpTimer);
      clearInterval(streakTimer);
    };
  }, [playerState]);

  // Extract quest streaks
  const stretchQuest = quests.find(q => q.id === 'stretching') || { streak: 0 };
  const mealsQuest = quests.find(q => q.id === 'meals') || { streak: 0 };
  const swimQuest = quests.find(q => q.id === 'swim') || { streak: 0 };

  // Setup dynamic chart arrays
  const daysOfWeek = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const stretchHistoryData = playerState.stretchingHistory || [1, 2, 0, 1, 1, 2, 1];
  const mealsHistoryData = playerState.mealsHistory || [2, 3, 2, 3, 1, 2, 2];
  const swimHistoryData = playerState.swimHistory || [0, 1, 0, 1, 1, 0, 1];

  // Pick active array based on selected tab
  let currentHistoryData = stretchHistoryData;
  let tabLabel = "Stretching Routines Logged";
  let themeColorClass = "bg-primary";
  let activeBorderClass = "border-primary";

  if (selectedSubTab === 'meals') {
    currentHistoryData = mealsHistoryData;
    tabLabel = "Clean Meals Logged";
    themeColorClass = "bg-amber-500";
    activeBorderClass = "border-amber-500";
  } else if (selectedSubTab === 'swim') {
    currentHistoryData = swimHistoryData;
    tabLabel = "Swim Training Sessions";
    themeColorClass = "bg-blue-400";
    activeBorderClass = "border-blue-400";
  }

  const maxVal = Math.max(...currentHistoryData, 1);

  // Computations for Category Metrics
  const getCompletionPercentage = (count: number, baseline: number) => {
    if (count === 0) return 0;
    return Math.min(100, Math.round((count / (count + baseline)) * 100));
  };

  const stretchingPercentage = getCompletionPercentage(playerState.stretchingCount ?? 8, 4);
  const mealsPercentage = getCompletionPercentage(playerState.mealsCount ?? 12, 5);
  const swimPercentage = getCompletionPercentage(playerState.swimCount ?? 5, 3);

  return (
    <div className="space-y-6 animate-[fadeInUp_0.5s_ease]">
      
      {/* Screen Title */}
      <div className="flex items-center gap-4 py-1">
        <div className="p-2 rounded-lg bg-surface-container-high border border-outline-variant text-primary">
          <AreaChart className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface">Analytics Hub</h2>
          <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Historical Biometrics & Habits Data</span>
        </div>
      </div>

      {/* Dynamic Streak Booster Info Panel */}
      <section className="bg-gradient-to-br from-surface-container to-surface-container-high rounded-xl p-4 border border-outline-variant/60 shadow flex flex-col gap-3 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 opacity-[0.03] text-primary pointer-events-none">
          <Zap className="w-32 h-32" />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 px-1.5 rounded bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 fill-primary text-primary" />
              <span className="text-[11px] font-bold font-mono">{(playerState.multiplier ?? 1.0).toFixed(1)}x</span>
            </div>
            <div>
              <span className="text-xs font-bold font-sans text-on-surface block leading-tight">Reward Coin Boost Active</span>
              <span className="text-[9px] text-on-surface-variant font-medium block uppercase font-mono tracking-wider">
                {playerState.consecutiveDays ?? 0} Consecutive Days Logged
              </span>
            </div>
          </div>

          <div className="text-right">
            {playerState.multiplier && playerState.multiplier > 1.0 ? (
              <span className="text-[9px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                Active Multiplier
              </span>
            ) : (
              <span className="text-[9px] bg-surface-variant text-on-surface-variant border border-outline-variant px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                Normal Rate
              </span>
            )}
          </div>
        </div>

        <div className="text-xs font-sans text-on-surface-variant leading-relaxed">
          {playerState.consecutiveDays && playerState.consecutiveDays >= 5 ? (
            <span>🔥 Maximum Coin Boost enabled! Consecutive streak grants <strong>1.5x coin rewards</strong> on all logged activities. Keep loading habits to sustain this.</span>
          ) : playerState.consecutiveDays && playerState.consecutiveDays >= 2 ? (
            <span>🚀 Silver booster active! consecutive logging streak gives <strong>1.2x coin rewards</strong>. Log <strong>{5 - playerState.consecutiveDays} more days</strong> to reach maximum <strong>1.5x coin boost</strong>!</span>
          ) : (
            <span>⚡ Coin boost dormant. Complete habits on consecutively separated days to claim coin multipliers (<strong>2 days consecutive: 1.2x boost</strong>, <strong>5 days consecutive: 1.5x boost</strong>). Missing a day drops you back to 1.0x!</span>
          )}
        </div>
      </section>

      {/* Interactive Chart Section with Filter Tabs */}
      <section className="space-y-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-on-surface-variant text-[11px] uppercase tracking-wider font-bold">Historical Daily Logs</span>
            <span className="text-[10px] text-secondary font-mono bg-secondary/10 px-2 py-0.5 rounded-full font-bold">7-Day Matrix</span>
          </div>

          {/* Subtab Selectors */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-surface-container rounded-lg border border-outline-variant/40">
            <button
              onClick={() => setSelectedSubTab('stretching')}
              className={`py-1.5 rounded text-[10px] font-bold uppercase tracking-wide leading-none transition-all flex items-center justify-center gap-1 ${
                selectedSubTab === 'stretching' ? 'bg-primary text-on-primary shadow shadow-primary/30' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Activity className="w-3 h-3" />
              Stretches
            </button>
            <button
              onClick={() => setSelectedSubTab('meals')}
              className={`py-1.5 rounded text-[10px] font-bold uppercase tracking-wide leading-none transition-all flex items-center justify-center gap-1 ${
                selectedSubTab === 'meals' ? 'bg-amber-500 text-slate-950 shadow shadow-amber-500/30' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Utensils className="w-3 h-3" />
              Meals
            </button>
            <button
              onClick={() => setSelectedSubTab('swim')}
              className={`py-1.5 rounded text-[10px] font-bold uppercase tracking-wide leading-none transition-all flex items-center justify-center gap-1 ${
                selectedSubTab === 'swim' ? 'bg-blue-400 text-slate-950 shadow shadow-blue-400/30' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Waves className="w-3 h-3" />
              Swims
            </button>
          </div>
        </div>

        {/* Dynamic Column Height Chart */}
        <div className="bg-surface-container-high rounded-xl p-5 border-2 border-outline-variant/60 shadow-inner relative">
          <div className="absolute left-3 top-3 text-[9px] font-mono text-on-surface-variant/75 uppercase font-semibold">
            {tabLabel}
          </div>
          <div className="flex items-end justify-between h-36 gap-2.5 px-1 pt-6">
            {daysOfWeek.map((dayName, idx) => {
              const val = currentHistoryData[idx] ?? 0;
              const ratio = val / maxVal;
              const heightPct = Math.max(8, Math.round(ratio * 100));
              
              return (
                <div key={idx} className="flex flex-col items-center gap-2 flex-1 group">
                  {/* Outer column container */}
                  <div className="w-full bg-surface-variant/40 hover:bg-surface-variant/60 border border-outline-variant/20 relative h-[100px] rounded-t-lg overflow-hidden flex flex-col justify-end">
                    
                    {/* The Fill bar */}
                    <div 
                      className={`w-full ${themeColorClass} rounded-t-sm transition-all duration-700 ease-out-back relative`}
                      style={{ height: `${heightPct}%` }}
                    >
                      {/* Interactive popup height count */}
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-surface text-on-surface text-[8px] font-mono font-bold py-0.5 px-1 rounded shadow border border-outline opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30">
                        {val} logs
                      </div>
                    </div>
                  </div>
                  
                  <span className="font-label-sm text-[9px] uppercase font-mono font-bold tracking-wider text-on-surface-variant">
                    {dayName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Numeric Habit Counts Bento Grid */}
      <section className="space-y-3">
        <h3 className="font-label-md text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">Category Metrics Breakdown</h3>
        
        <div className="grid grid-cols-1 gap-3">
          
          {/* Daily Stretching Row */}
          <div className="bg-surface-container rounded-xl p-4 border border-outline-variant shadow flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm text-on-surface block leading-none mb-1">Clean Stretching</span>
                <span className="text-[10px] text-on-surface-variant uppercase font-mono font-bold tracking-wider">
                  Total Logs: {playerState.stretchingCount ?? 8}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="font-mono text-xs text-on-surface-variant block uppercase leading-none mb-1 font-bold">Streak</span>
                <span className="font-headline-sm font-bold font-mono text-primary">{(stretchQuest as any).streak ?? 0}d</span>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs text-on-surface-variant block uppercase leading-none mb-1 font-bold">Log Ratio</span>
                <span className="font-headline-sm font-bold font-mono text-green-400">{stretchingPercentage}%</span>
              </div>
            </div>
          </div>

          {/* Clean Meals Row */}
          <div className="bg-surface-container rounded-xl p-4 border border-outline-variant shadow flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm text-on-surface block leading-none mb-1">Nutrition Tracker</span>
                <span className="text-[10px] text-on-surface-variant uppercase font-mono font-bold tracking-wider">
                  Total Logs: {playerState.mealsCount ?? 12}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="font-mono text-xs text-on-surface-variant block uppercase leading-none mb-1 font-bold">Streak</span>
                <span className="font-headline-sm font-bold font-mono text-amber-500">{(mealsQuest as any).streak ?? 0}d</span>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs text-on-surface-variant block uppercase leading-none mb-1 font-bold">Log Ratio</span>
                <span className="font-headline-sm font-bold font-mono text-green-400">{mealsPercentage}%</span>
              </div>
            </div>
          </div>

          {/* Swim Training Row */}
          <div className="bg-surface-container rounded-xl p-4 border border-outline-variant shadow flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-400/10 border border-blue-400/20 flex items-center justify-center text-blue-400">
                <Waves className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm text-on-surface block leading-none mb-1">Swim Training</span>
                <span className="text-[10px] text-on-surface-variant uppercase font-mono font-bold tracking-wider">
                  Total Logs: {playerState.swimCount ?? 5}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="font-mono text-xs text-on-surface-variant block uppercase leading-none mb-1 font-bold">Streak</span>
                <span className="font-headline-sm font-bold font-mono text-blue-400">{(swimQuest as any).streak ?? 0}d</span>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs text-on-surface-variant block uppercase leading-none mb-1 font-bold">Log Ratio</span>
                <span className="font-headline-sm font-bold font-mono text-green-400">{swimPercentage}%</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Global Cumulative Achievements Bento Cards */}
      <section className="grid grid-cols-2 gap-4">
        
        {/* Cumulative XP Card */}
        <div className="bg-surface-container p-4 rounded-xl border border-outline-variant flex flex-col justify-between shadow">
          <div>
            <span className="font-label-sm text-on-surface-variant uppercase tracking-wider text-[10px] block mb-1">Cumulative XP</span>
            <span className="font-headline-lg text-[22px] text-primary tracking-tight font-mono font-bold">{animatedXp}</span>
          </div>
          <div className="text-[10px] text-on-surface-variant font-mono mt-1">
            Level {playerState.level} total
          </div>
        </div>

        {/* Tokens Spent Card */}
        <div className="bg-surface-container p-4 rounded-xl border border-outline-variant flex flex-col justify-between shadow">
          <div>
            <span className="font-label-sm text-on-surface-variant uppercase tracking-wider text-[10px] block mb-1">Cumulative Coins Spent</span>
            <span className="font-headline-lg text-[22px] text-amber-500 tracking-tight font-mono font-bold">$ {playerState.tokensSpent}</span>
          </div>
          <div className="flex items-center justify-between text-on-surface-variant text-[10px] font-mono mt-1">
            <span>Spent in Store</span>
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Perfect Days Count */}
        <div className="bg-surface-container p-4 rounded-xl border border-outline-variant flex flex-col justify-between shadow">
          <div>
            <span className="font-label-sm text-on-surface-variant uppercase tracking-wider text-[10px] block mb-1">Perfect All-Quest Days</span>
            <span className="font-headline-lg text-[22px] text-green-400 tracking-tight font-mono font-bold">{playerState.perfectDaysCount} d</span>
          </div>
          <div className="text-[10px] text-on-surface-variant font-mono mt-1">
             All check-offs logged
          </div>
        </div>

        {/* Global Best Streak */}
        <div className="bg-surface-container p-4 rounded-xl border border-outline-variant flex flex-col justify-between shadow">
          <div>
            <span className="font-label-sm text-on-surface-variant uppercase tracking-wider text-[10px] block mb-1">Best Daily Streak</span>
            <span className="font-headline-lg text-[22px] text-error tracking-tight font-mono font-bold">{animatedStreak} d</span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-error mt-1">
            <span>Max Consecutive</span>
            <Flame className="w-3.5 h-3.5 fill-error text-error" />
          </div>
        </div>

      </section>

      {/* Per-Habit Verification Record Row */}
      <section className="space-y-3">
        <h3 className="font-label-md text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">Biometric Quest Records</h3>
        <p className="text-[11px] text-on-surface-variant leading-relaxed">
          Launch live sensors, cameras, or narratives directly to verify workout patterns and secure level advancement:
        </p>

        <div className="space-y-2.5">
          {quests.map(q => (
            <button
              key={q.id}
              onClick={() => onSelectVerifyQuest(q)}
              className="w-full text-left flex items-center justify-between p-3.5 bg-surface-container-high hover:bg-surface-container-highest rounded-xl border border-outline-variant transition-all hover:scale-[1.005] active:scale-95 text-xs font-sans group"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className={`w-4 h-4 ${q.completedToday ? 'text-green-400' : 'text-on-surface-variant group-hover:text-primary'}`} />
                <span className="font-bold text-on-surface group-hover:text-primary transition-colors">{q.name}</span>
              </div>

              {q.completedToday ? (
                <span className="text-[9px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded font-bold font-mono uppercase tracking-wide">
                  Verified Today
                </span>
              ) : (
                <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 px-2 py-0.5 rounded font-bold font-mono uppercase tracking-wide animate-pulse">
                  Unverified
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

    </div>
  );
}
