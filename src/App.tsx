import { useState, useEffect } from 'react';
import { Home as HomeIcon, BarChart3, ShoppingCart, Award, Settings as SettingsIcon, Sparkles, CheckCircle2, Zap, Swords, Trophy, LogIn, LogOut, Compass } from 'lucide-react';
import { PlayerState, Quest, QuestType } from './types';
import { getAvatarUrl, MAX_AVATAR_LEVEL, getStanceName } from './utils/avatar';

// Modular Page imports
import HomePage from './components/Home';
import Arena from './components/Arena';
import Stats from './components/Stats';
import Shop from './components/Shop';
import Trophies from './components/Trophies';
import Rank from './components/Rank';
import Settings from './components/Settings';
import AIVerificationModal from './components/AIVerificationModal';
import QuestVerificationPage from './components/QuestVerificationPage';

// Import Firebase dynamic integration clients
import { 
  setupAuthListener, 
  loginWithGoogle, 
  logoutUser, 
  savePlayerStateToCloud, 
  loadPlayerStateFromCloud,
  isFirebaseReady,
  initializeFirebaseClient
} from './lib/firebaseClient';
import { User } from 'firebase/auth';

const LOCAL_STORAGE_PLAYER_KEY = 'hydropulse_player_state_v1';
const LOCAL_STORAGE_QUESTS_KEY = 'hydropulse_quests_state_v1';

const DEFAULT_PLAYER_STATE: PlayerState = {
  level: 1,
  xp: 0, 
  tokens: 120,
  xpToNextLevel: 100,
  bossHp: 70,
  xpFreeze: true,
  tokensSpent: 450,
  perfectDaysCount: 12,
  bestStreak: 8,
  equippedCosmetics: ['cool_water'],
  purchasedItemIds: ['avatar_badge'],
  lastCheckedDate: '2026-05-26', // yesterday
  stretchingCount: 8,
  mealsCount: 12,
  swimCount: 5,
  stretchingHistory: [1, 2, 0, 1, 1, 2, 1],
  mealsHistory: [2, 3, 2, 3, 1, 2, 2],
  swimHistory: [0, 1, 0, 1, 1, 0, 1],
  multiplier: 1.2,
  consecutiveDays: 3
};

const DEFAULT_QUESTS: Quest[] = [
  {
    id: 'stretching',
    name: 'Daily Stretching',
    description: 'Hamstring alignment, spinal flexibility, and posture cooling exercises.',
    xpReward: 5,
    tokenReward: 10,
    streak: 3,
    completedToday: false,
    type: 'stretching',
    streakBonusText: '+10 Tokens (5d Bonus)'
  },
  {
    id: 'meals',
    name: 'Clean Meals',
    description: 'Ensure 3 high-protein, calorie-balanced, vegetable-dense meals.',
    xpReward: 10,
    tokenReward: 15,
    streak: 0,
    completedToday: false,
    type: 'clean_meals'
  },
  {
    id: 'swim',
    name: 'Swim Training',
    description: 'Laps, pacing exercises, or cardio oxygen threshold swim drills.',
    xpReward: 15,
    tokenReward: 25,
    streak: 1,
    completedToday: false,
    type: 'swim'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'arena' | 'stats' | 'shop' | 'trophies' | 'rank' | 'settings'>('home');
  const [playerState, setPlayerState] = useState<PlayerState>(DEFAULT_PLAYER_STATE);
  const [quests, setQuests] = useState<Quest[]>(DEFAULT_QUESTS);
  
  // Firebase Auth states
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [firebaseActive, setFirebaseActive] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Modal for AI verifications
  const [verifyQuest, setVerifyQuest] = useState<Quest | null>(null);
  const [activeVerifyQuest, setActiveVerifyQuest] = useState<Quest | null>(null);

  // Success toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Level Up Celebrations
  const [levelUpOverlay, setLevelUpOverlay] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState<any[]>([]);

  const getTodayString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const getYesterdayString = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const checkDailyReset = (loadedState: PlayerState, loadedQuests: Quest[]) => {
    const todayStr = getTodayString();
    const lastDate = loadedState.lastCheckedDate || '';
    
    if (!lastDate) {
      return { 
        updatedPlayer: { ...loadedState, lastCheckedDate: todayStr }, 
        updatedQuests: loadedQuests 
      };
    }
    
    if (lastDate === todayStr) {
      return { updatedPlayer: loadedState, updatedQuests: loadedQuests };
    }
    
    const resetQuests = loadedQuests.map(q => ({
      ...q,
      completedToday: false
    }));
    
    const yesterdayStr = getYesterdayString();
    if (lastDate === yesterdayStr) {
      return {
        updatedPlayer: {
          ...loadedState,
          lastCheckedDate: todayStr
        },
        updatedQuests: resetQuests
      };
    } else {
      return {
        updatedPlayer: {
          ...loadedState,
          lastCheckedDate: todayStr,
          multiplier: 1.0,
          consecutiveDays: 0
        },
        updatedQuests: resetQuests
      };
    }
  };

  const updateDailyLogStreakAndStats = (questId: string, isChecking: boolean, currentState: PlayerState): PlayerState => {
    const todayStr = getTodayString();
    const yesterdayStr = getYesterdayString();
    
    let consec = currentState.consecutiveDays ?? 0;
    let mult = currentState.multiplier ?? 1.0;
    let lastChecked = currentState.lastCheckedDate || '';
    
    if (isChecking) {
      if (!lastChecked || lastChecked !== todayStr) {
        if (lastChecked === yesterdayStr) {
          consec = consec + 1;
        } else {
          consec = 1;
        }
        
        if (consec >= 5) {
          mult = 1.5;
        } else if (consec >= 2) {
          mult = 1.2;
        } else {
          mult = 1.0;
        }
        
        lastChecked = todayStr;
      }
    }
    
    let stretchCountVal = currentState.stretchingCount ?? 0;
    let mealsCountVal = currentState.mealsCount ?? 0;
    let swimCountVal = currentState.swimCount ?? 0;
    
    const stretchHist = currentState.stretchingHistory ? [...currentState.stretchingHistory] : [0,0,0,0,0,0,0];
    const mealsHist = currentState.mealsHistory ? [...currentState.mealsHistory] : [0,0,0,0,0,0,0];
    const swimHist = currentState.swimHistory ? [...currentState.swimHistory] : [0,0,0,0,0,0,0];
    
    const indexToIncrement = 6;
    
    if (questId === 'stretching') {
      if (isChecking) {
        stretchCountVal += 1;
        stretchHist[indexToIncrement] = (stretchHist[indexToIncrement] || 0) + 1;
      } else {
        stretchCountVal = Math.max(0, stretchCountVal - 1);
        stretchHist[indexToIncrement] = Math.max(0, (stretchHist[indexToIncrement] || 0) - 1);
      }
    } else if (questId === 'meals') {
      if (isChecking) {
        mealsCountVal += 1;
        mealsHist[indexToIncrement] = (mealsHist[indexToIncrement] || 0) + 1;
      } else {
        mealsCountVal = Math.max(0, mealsCountVal - 1);
        mealsHist[indexToIncrement] = Math.max(0, (mealsHist[indexToIncrement] || 0) - 1);
      }
    } else if (questId === 'swim') {
      if (isChecking) {
        swimCountVal += 1;
        swimHist[indexToIncrement] = (swimHist[indexToIncrement] || 0) + 1;
      } else {
        swimCountVal = Math.max(0, swimCountVal - 1);
        swimHist[indexToIncrement] = Math.max(0, (swimHist[indexToIncrement] || 0) - 1);
      }
    }
    
    return {
      ...currentState,
      consecutiveDays: consec,
      multiplier: mult,
      lastCheckedDate: lastChecked,
      stretchingCount: stretchCountVal,
      mealsCount: mealsCountVal,
      swimCount: swimCountVal,
      stretchingHistory: stretchHist,
      mealsHistory: mealsHist,
      swimHistory: swimHist
    };
  };

  // Simulate advancing the calendar day consecutive vs non-consecutive
  const handleSimulateTime = (type: 'consecutive' | 'missed') => {
    if (type === 'consecutive') {
      const yesterdayStr = getYesterdayString();
      const nextPlayerState: PlayerState = {
        ...playerState,
        lastCheckedDate: yesterdayStr,
      };
      
      const resetQuests = quests.map(q => ({
        ...q,
        completedToday: false
      }));
      
      setPlayerState(nextPlayerState);
      setQuests(resetQuests);
      syncToLocalStorage(nextPlayerState, resetQuests);
      showToast("📅 Simulated Tomorrow: Consecutive habit logs yield multipliers!");
    } else {
      const longAgoStr = '2026-01-01';
      const nextPlayerState: PlayerState = {
        ...playerState,
        lastCheckedDate: longAgoStr,
        consecutiveDays: 0,
        multiplier: 1.0
      };
      
      const resetQuests = quests.map(q => ({
        ...q,
        completedToday: false
      }));
      
      setPlayerState(nextPlayerState);
      setQuests(resetQuests);
      syncToLocalStorage(nextPlayerState, resetQuests);
      showToast("⚠️ Missed Day Simulated: Multiplier dropped to 1.0x!");
    }
  };

  // Auth State Listener setup
  useEffect(() => {
    initializeFirebaseClient().then((active) => {
      setFirebaseActive(active);
      setupAuthListener((firebaseUser) => {
        setUser(firebaseUser);
        setAuthLoading(false);
      });
    });
  }, []);

  // Sync profile when user changes
  useEffect(() => {
    if (!user) return;
    
    setAuthLoading(true);
    loadPlayerStateFromCloud(user.uid)
      .then((cloudData) => {
        if (cloudData) {
          const { updatedPlayer, updatedQuests } = checkDailyReset(cloudData.playerState, cloudData.quests);
          setPlayerState(updatedPlayer);
          setQuests(updatedQuests);
          // Sync back in case of checkDailyReset update
          savePlayerStateToCloud(user.uid, updatedPlayer, updatedQuests);
          showToast(`☁️ Welcome, ${user.displayName || 'Warrior'}! Profiles synced.`);
        } else {
          // Initialize fresh player file in Cloud for user
          const { updatedPlayer, updatedQuests } = checkDailyReset(DEFAULT_PLAYER_STATE, DEFAULT_QUESTS);
          setPlayerState(updatedPlayer);
          setQuests(updatedQuests);
          savePlayerStateToCloud(user.uid, updatedPlayer, updatedQuests);
          showToast(`✨ Created cloud profile for ${user.displayName}!`);
        }
      })
      .catch((err) => {
        console.error("Cloud document load failed:", err);
        showToast("⚠️ Standalone mode: using offline cache copy.");
      })
      .finally(() => {
        setAuthLoading(false);
      });
  }, [user]);

  // Unified save state helper which persistence saves both locally and in firebase
  const syncStateBoth = (newPlayer: PlayerState, newQuests: Quest[]) => {
    localStorage.setItem(LOCAL_STORAGE_PLAYER_KEY, JSON.stringify(newPlayer));
    localStorage.setItem(LOCAL_STORAGE_QUESTS_KEY, JSON.stringify(newQuests));
    if (user) {
      savePlayerStateToCloud(user.uid, newPlayer, newQuests);
    }
  };

  // Sync back state modifications to local store fallback
  const syncToLocalStorage = (newPlayer: PlayerState, newQuests: Quest[]) => {
    syncStateBoth(newPlayer, newQuests);
  };

  // Toast utility trigger
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Slay Boss check & Level Up Checks
  const adjustRewards = (xpIn: number, tokensIn: number, isAI: boolean) => {
    let newXp = playerState.xp + xpIn;
    let newTokens = playerState.tokens + tokensIn;
    let newLvl = playerState.level;
    const reqXp = playerState.xpToNextLevel;
    let isLeveling = false;

    // Remove active XP freeze if they verify
    let xpFreezeState = playerState.xpFreeze;
    if (xpFreezeState && isAI) {
      xpFreezeState = false;
      showToast("🔐 XP FREEZE UNLOCKED! AI Verification complete.");
    }

    if (newXp >= reqXp) {
      newLvl += 1;
      newXp = newXp - reqXp;
      isLeveling = true;
    }

    // Damage Boss! Manual shrinks boss by 10%, AI checks hit by 20%
    const dmg = isAI ? 20 : 10;
    const finalBossHp = Math.max(0, playerState.bossHp - dmg);

    const updatedState: PlayerState = {
      ...playerState,
      xp: newXp,
      level: newLvl,
      tokens: newTokens,
      bossHp: finalBossHp,
      xpFreeze: xpFreezeState
    };

    setPlayerState(updatedState);
    syncToLocalStorage(updatedState, quests);

    if (isLeveling) {
      triggerLevelUpSequence(newLvl);
    }
  };

  // Custom visual Level-up sparkle and confetti
  const triggerLevelUpSequence = (newLvl: number) => {
    setLevelUpOverlay(true);
    
    // Set 80 randomized virtual pieces of confetti styled inline with beautiful colors
    const particles = Array.from({ length: 80 }).map((_, idx) => ({
      id: idx,
      left: Math.random() * 100,
      color: ['#f59e0b', '#ec4899', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#acf2f7', '#ffdad6'][idx % 8],
      delay: Math.random() * 1.8,
      size: 5 + Math.random() * 10
    }));
    setConfettiPieces(particles);

    setTimeout(() => {
      setLevelUpOverlay(false);
      setConfettiPieces([]);
    }, 5500);
  };

  // Quest toggle logic (Checkbox)
  const handleToggleQuest = (questId: string, customXp?: number, customTokens?: number) => {
    const clickedQ = quests.find(q => q.id === questId);
    if (!clickedQ) return;
    const nextStatus = !clickedQ.completedToday;
    
    // 1. Calculate stats and consecutive streak
    const nextState = updateDailyLogStreakAndStats(questId, nextStatus, playerState);
    
    // 2. Adjust rewards (using the updated multiplier in nextState.multiplier!)
    const xpRewardVal = customXp !== undefined ? customXp : clickedQ.xpReward;
    const tokenRewardVal = customTokens !== undefined ? customTokens : clickedQ.tokenReward;
    
    const xpDelta = nextStatus ? xpRewardVal : -xpRewardVal;
    const rawTokenDelta = nextStatus ? tokenRewardVal : -tokenRewardVal;
    
    let finalTokensReward = rawTokenDelta;
    if (rawTokenDelta > 0) {
      finalTokensReward = Math.round(rawTokenDelta * nextState.multiplier);
    } else if (rawTokenDelta < 0) {
      finalTokensReward = Math.round(rawTokenDelta * playerState.multiplier); // deduct based on previous multiplier
    }
    
    let newXp = playerState.xp + xpDelta;
    let newTokens = playerState.tokens + finalTokensReward;
    let newLvl = playerState.level;
    const reqXp = playerState.xpToNextLevel;
    let isLeveling = false;
    
    if (newXp >= reqXp) {
      newLvl += 1;
      newXp = newXp - reqXp;
      isLeveling = true;
    }
    
    const dmg = 10;
    const finalBossHp = Math.max(0, playerState.bossHp - dmg);
    
    const updatedState: PlayerState = {
      ...nextState,
      xp: newXp,
      level: newLvl,
      tokens: Math.max(0, newTokens),
      bossHp: finalBossHp
    };
    
    const updatedQuests = quests.map(q => {
      if (q.id === questId) {
        return {
          ...q,
          completedToday: nextStatus,
          streak: nextStatus ? q.streak + 1 : Math.max(0, q.streak - 1)
        };
      }
      return q;
    });
    
    // Check perfect day
    let isPerfectDayNow = false;
    const checks = updatedQuests.filter(qu => qu.completedToday).length;
    if (checks === updatedQuests.length) {
      updatedState.perfectDaysCount += 1;
      updatedState.bestStreak = Math.max(updatedState.bestStreak, updatedState.consecutiveDays);
      isPerfectDayNow = true;
    }
    
    setPlayerState(updatedState);
    setQuests(updatedQuests);
    syncToLocalStorage(updatedState, updatedQuests);
    
    if (isLeveling) {
      triggerLevelUpSequence(newLvl);
    }
    
    if (nextStatus) {
      if (isPerfectDayNow) {
        showToast(`🏆 PERFECT DAY! Multiplier ${nextState.multiplier}x applied ($${finalTokensReward} earned)`);
      } else {
        showToast(`Quest Checked: +${xpRewardVal} XP & $${finalTokensReward} Coins (${nextState.multiplier}x)`);
      }
    }
  };
 
  // AI verify success handler
  const handleAIVerifySuccess = (xpAwarded: number, tokenReward: number, extraMsg: string) => {
    if (!verifyQuest) return;
 
    const targetId = verifyQuest.id;
    const nextState = updateDailyLogStreakAndStats(targetId, true, playerState);
    
    const finalTokensReward = Math.round(tokenReward * nextState.multiplier);
    
    let newXp = playerState.xp + xpAwarded;
    let newTokens = playerState.tokens + finalTokensReward;
    let newLvl = playerState.level;
    const reqXp = playerState.xpToNextLevel;
    let isLeveling = false;
    
    // Remove active XP freeze if they verify
    let xpFreezeState = playerState.xpFreeze;
    xpFreezeState = false; // AI unlock
    
    if (newXp >= reqXp) {
      newLvl += 1;
      newXp = newXp - reqXp;
      isLeveling = true;
    }
    
    const dmg = 20; // AI checks hit harder
    const finalBossHp = Math.max(0, playerState.bossHp - dmg);
    
    const updatedQuests = quests.map(q => {
      if (q.id === targetId) {
        return {
          ...q,
          completedToday: true,
          streak: q.streak + 1
        };
      }
      return q;
    });
 
    const updatedState: PlayerState = {
      ...nextState,
      xp: newXp,
      level: newLvl,
      tokens: Math.max(0, newTokens),
      bossHp: finalBossHp,
      xpFreeze: xpFreezeState
    };
    
    const checks = updatedQuests.filter(q => q.completedToday).length;
    if (checks === updatedQuests.length) {
      updatedState.perfectDaysCount += 1;
      updatedState.bestStreak = Math.max(updatedState.bestStreak, updatedState.consecutiveDays);
    }
 
    setPlayerState(updatedState);
    setQuests(updatedQuests);
    syncToLocalStorage(updatedState, updatedQuests);
 
    if (isLeveling) {
      triggerLevelUpSequence(newLvl);
    }
 
    showToast(`💰 Multiplier: ${nextState.multiplier}x coin applied ($${finalTokensReward} earned!)`);
  };
 
  const handleVerifyPageSuccess = (questId: string, xpAwarded: number, tokenReward: number, eventMsg: string) => {
    const nextState = updateDailyLogStreakAndStats(questId, true, playerState);
    
    const finalTokensReward = Math.round(tokenReward * nextState.multiplier);
    
    let newXp = playerState.xp + xpAwarded;
    let newTokens = playerState.tokens + finalTokensReward;
    let newLvl = playerState.level;
    const reqXp = playerState.xpToNextLevel;
    let isLeveling = false;
    
    if (newXp >= reqXp) {
      newLvl += 1;
      newXp = newXp - reqXp;
      isLeveling = true;
    }
    
    const dmg = 20; 
    const finalBossHp = Math.max(0, playerState.bossHp - dmg);
    
    const updatedQuests = quests.map(q => {
      if (q.id === questId) {
        return {
          ...q,
          completedToday: true,
          streak: q.streak + 1
        };
      }
      return q;
    });
 
    const updatedState: PlayerState = {
      ...nextState,
      xp: newXp,
      level: newLvl,
      tokens: Math.max(0, newTokens),
      bossHp: finalBossHp
    };
 
    const checks = updatedQuests.filter(qu => qu.completedToday).length;
    if (checks === updatedQuests.length) {
      updatedState.perfectDaysCount += 1;
      updatedState.bestStreak = Math.max(updatedState.bestStreak, updatedState.consecutiveDays);
    }
 
    setPlayerState(updatedState);
    setQuests(updatedQuests);
    syncToLocalStorage(updatedState, updatedQuests);
 
    if (isLeveling) {
      triggerLevelUpSequence(newLvl);
    }
 
    showToast(`💰 Multiplier: ${nextState.multiplier}x coin applied ($${finalTokensReward} earned!)`);
    setActiveVerifyQuest(null);
  };

  // Buy Booster or Cosmetics from Shop
  const handleBuyItem = (itemId: string, cost: number, isCosmetic: boolean) => {
    const updatedPurchased = [...playerState.purchasedItemIds, itemId];
    let updatedEquipped = [...playerState.equippedCosmetics];
    
    // Auto-equip purchased skin cosmetics safely
    if (isCosmetic && !updatedEquipped.includes(itemId)) {
      updatedEquipped.push(itemId);
    }

    const updatedState: PlayerState = {
      ...playerState,
      tokens: playerState.tokens - cost,
      tokensSpent: playerState.tokensSpent + cost,
      purchasedItemIds: updatedPurchased,
      equippedCosmetics: updatedEquipped
    };

    setPlayerState(updatedState);
    syncToLocalStorage(updatedState, quests);
    showToast(`🛒 Item Unlocked: Equipped successfully onto biometrics card!`);
  };

  // Toggle active equips of physical skins
  const handleEquipCosmetic = (itemId: string) => {
    let updated = [...playerState.equippedCosmetics];
    if (updated.includes(itemId)) {
      updated = updated.filter(id => id !== itemId);
    } else {
      updated.push(itemId);
    }

    const updatedState = {
      ...playerState,
      equippedCosmetics: updated
    };

    setPlayerState(updatedState);
    syncToLocalStorage(updatedState, quests);
  };

  // Clear localStorage and reset gameplay status to rookie level 1 Warrior
  const handleResetData = () => {
    const freshPlayer: PlayerState = {
      level: 1,
      xp: 0,
      tokens: 80,
      xpToNextLevel: 100,
      bossHp: 100,
      xpFreeze: false,
      tokensSpent: 0,
      perfectDaysCount: 0,
      bestStreak: 1,
      equippedCosmetics: [],
      purchasedItemIds: [],
      lastCheckedDate: '',
      stretchingCount: 0,
      mealsCount: 0,
      swimCount: 0,
      stretchingHistory: [0, 0, 0, 0, 0, 0, 0],
      mealsHistory: [0, 0, 0, 0, 0, 0, 0],
      swimHistory: [0, 0, 0, 0, 0, 0, 0],
      multiplier: 1.0,
      consecutiveDays: 0
    };
 
    const freshQuests = DEFAULT_QUESTS.map(q => ({
      ...q,
      completedToday: false,
      streak: 0
    }));
 
    setPlayerState(freshPlayer);
    setQuests(freshQuests);
    syncToLocalStorage(freshPlayer, freshQuests);
    setActiveTab('home');
  };

  // Skip level debug/test trigger
  const handleSkipLevel = () => {
    if (playerState.level >= MAX_AVATAR_LEVEL) {
      showToast("⚠️ Max Avatar level (Level 3) already reached!");
      return;
    }
    const nextLevel = playerState.level + 1;
    const updatedState: PlayerState = {
      ...playerState,
      level: nextLevel,
      xp: 0 // restart XP on manual skips for neatness
    };

    setPlayerState(updatedState);
    syncToLocalStorage(updatedState, quests);
    triggerLevelUpSequence(nextLevel);
    showToast(`⚡ Skipper: Advanced to Level ${nextLevel}!`);
  };

  // Level down debug/test trigger
  const handleLevelDown = () => {
    if (playerState.level <= 1) {
      showToast("⚠️ Already at Level 1!");
      return;
    }
    const nextLevel = playerState.level - 1;
    const updatedState: PlayerState = {
      ...playerState,
      level: nextLevel,
      xp: 0
    };

    setPlayerState(updatedState);
    syncToLocalStorage(updatedState, quests);
    showToast(`👇 Reset Level down to Level ${nextLevel}!`);
  };

  if (authLoading) {
    return (
      <div className="fixed inset-0 bg-[#000f21] text-[#d2e4ff] flex flex-col justify-center items-center font-sans animate-[fadeIn_0.3s_ease]">
        <div className="relative w-24 h-24 mb-6">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
          <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
        </div>
        <h3 className="font-headline text-[14px] uppercase tracking-widest text-primary animate-pulse">
          Synchronizing Biometrics...
        </h3>
        <p className="text-[#869cb8] text-[11px] mt-2 font-mono">Loading dynamic cloud state...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="fixed inset-0 bg-[#000f21] text-[#d2e4ff] flex justify-center items-center overflow-hidden font-sans">
        <div className="w-full max-w-[480px] h-full sm:h-[92vh] sm:max-h-[850px] sm:rounded-[42px] sm:border-8 sm:border-outline-variant/80 bg-[#00142a] relative shadow-2xl flex flex-col justify-center px-10 py-12 select-none overflow-y-auto sm:ring-4 sm:ring-black border border-outline-variant/30">
          
          <div className="space-y-8 flex flex-col items-center justify-center h-full">
            {/* Logo area */}
            <div className="relative text-center w-full">
              <div className="relative w-32 h-32 bg-gradient-to-tr from-primary/15 to-secondary/15 rounded-full flex items-center justify-center mx-auto border border-primary/40 shadow-[0_0_24px_rgba(172,242,247,0.15)] mb-4">
                <Sparkles className="w-14 h-14 text-primary animate-pulse" />
              </div>
              <h1 className="font-headline text-3xl text-primary uppercase font-extrabold tracking-tight leading-none text-center">HydroPulse</h1>
              <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] font-mono leading-none mt-2 block text-center">Habit RPG Portal</span>
            </div>

            {/* Prompt */}
            <div className="bg-surface-container/60 rounded-2xl p-5 border border-outline-variant/40 space-y-3.5 text-center w-full max-w-sm">
              <h3 className="font-headline text-[12px] text-primary uppercase tracking-wider">Ascension Protocol</h3>
              <p className="text-on-surface-variant text-[11px] font-sans leading-relaxed">
                Connect your Google Account to progress-secure your character level, custom stances, custom habits, physical assets, and streak coin multipliers.
              </p>
              <div className="text-[10px] font-mono text-secondary bg-secondary/10 py-1.5 px-3 rounded-md inline-block uppercase font-bold tracking-wider">
                🛡️ Persistent Cloud Mode Active
              </div>
            </div>

            {/* Error if login failed */}
            {authError && (
              <div className="p-3.5 bg-error/10 border border-error/20 text-error rounded-xl text-[11px] font-semibold text-center w-full">
                ⚠️ {authError}
              </div>
            )}

            {/* Action buttons (Sign in with Google) */}
            <div className="space-y-3 w-full max-w-sm">
              <button
                onClick={async () => {
                  setAuthError(null);
                  try {
                    await loginWithGoogle();
                  } catch (err: any) {
                    setAuthError(err.message || "Authentication Cancelled");
                  }
                }}
                className="w-full h-[52px] bg-primary text-on-primary font-headline text-xs rounded-xl hover:opacity-95 transition-all active:scale-95 flex items-center justify-center gap-3 shadow-md tracking-wider uppercase cursor-pointer"
              >
                <LogIn className="w-4.5 h-4.5" />
                <span>Sign in with Google</span>
              </button>

              {/* Developer Standalone Bypass Trigger */}
              <button
                onClick={() => {
                  setUser({
                    uid: 'demo_developer_warrior',
                    displayName: 'Demo Warrior',
                    email: 'demo@hydropulse.com',
                    emailVerified: true
                  } as any);
                  setFirebaseActive(false);
                  showToast("⚡ Standing in Offline Demo Mode!");
                }}
                className="w-full h-[46px] bg-surface-container hover:bg-surface-container-high text-on-surface-variant text-[11px] font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 border border-outline-variant/50 uppercase cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                <span>Enter Standalone Sandbox</span>
              </button>
            </div>

            {/* Footer indicator */}
            <span className="text-[9px] text-on-surface-variant/60 font-mono uppercase tracking-widest block pt-2 text-center">
              {firebaseActive ? "● Cloud Synced Gateway Ready" : "○ Waiting for Platform Setup"}
            </span>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#000f21] text-[#d2e4ff] flex justify-center items-center overflow-hidden font-sans selection:bg-primary selection:text-on-primary">
      
      {/* Phone boundaries container */}
      <div className="w-full max-w-[480px] h-full sm:h-[92vh] sm:max-h-[850px] sm:rounded-[36px] sm:border-8 sm:border-[#1a2d42] bg-[#00142a] relative shadow-2xl flex flex-col overflow-hidden sm:ring-4 sm:ring-black border-x border-outline-variant/30">
        
        {/* Pinned App Header (HUD) */}
        <header className="h-[64px] flex-shrink-0 border-b-2 border-outline-variant bg-surface-container/90 backdrop-blur-sm flex justify-between items-center px-5 z-20">
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => setActiveTab('settings')}
              className="relative w-10 h-10 border-2 border-primary rounded-lg overflow-hidden bg-surface-variant active:scale-90 transition-transform cursor-pointer"
              title="Click to view Settings"
            >
              <img 
                src={getAvatarUrl(playerState.level)} 
                alt="Warrior Portrait" 
                className="w-full h-full object-cover"
              />
            </button>
            <div className="flex flex-col">
              <span className="font-headline text-[14px] font-bold text-primary tracking-tight leading-none">HydroPulse</span>
              <span className="text-[9px] font-mono font-bold text-secondary uppercase tracking-[0.15em] leading-none mt-1">
                Level {playerState.level} {getStanceName(playerState.level).split(' ').pop()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Cloud Sync active indicator dots */}
            <span 
              className={`w-2.5 h-2.5 rounded-full ${isFirebaseReady() ? 'bg-green-400 animate-pulse' : 'bg-amber-500 animate-pulse'}`}
              title={isFirebaseReady() ? 'Cloud Sync Online' : 'Local Offline Standalone Session'} 
            />
            <div className="bg-surface-variant flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-outline-variant scale-90 hover:scale-95 transition-all">
              <span className="text-primary font-bold text-[10.5px] font-mono">XP: {playerState.xp}</span>
              <span className="text-secondary font-bold text-[10.5px] font-mono">| ${playerState.tokens}</span>
            </div>
          </div>
        </header>

        {/* Live Toast micro-notifications */}
        {toastMessage && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[100] animate-[fadeInUp_0.3s_ease] w-[80%]">
            <div className="bg-primary text-on-primary px-4 py-2.5 rounded-xl shadow-2xl border border-white/20 flex items-center justify-center gap-2.5">
              <CheckCircle2 className="w-4.5 h-4.5 text-on-primary animate-bounce flex-shrink-0" />
              <span className="text-[10.5px] font-bold font-sans uppercase tracking-wide text-center">{toastMessage}</span>
            </div>
          </div>
        )}

        {/* Scrolling Middle Panel (Main Content Router) */}
        <main className="flex-1 overflow-y-auto px-5 py-4 scrollbar-thin scroll-smooth relative">
          {activeVerifyQuest ? (
            <QuestVerificationPage
              quest={activeVerifyQuest}
              onSuccess={handleVerifyPageSuccess}
              onClose={() => setActiveVerifyQuest(null)}
            />
          ) : (
            <>
              {activeTab === 'home' && (
                <HomePage 
                  playerState={playerState}
                  quests={quests}
                  onToggleQuest={handleToggleQuest}
                  onNavigate={(tab) => setActiveTab(tab)}
                  onSkipLevel={handleSkipLevel}
                  onLevelDown={handleLevelDown}
                />
              )}

              {activeTab === 'arena' && (
                <Arena 
                  playerState={playerState}
                  quests={quests}
                  onToggleQuest={handleToggleQuest}
                  onOpenAIVerify={(q) => setVerifyQuest(q)}
                />
              )}

              {activeTab === 'stats' && (
                <Stats 
                  playerState={playerState} 
                  quests={quests}
                  onSelectVerifyQuest={(q) => setActiveVerifyQuest(q)}
                />
              )}

              {activeTab === 'shop' && (
                <Shop 
                  playerState={playerState}
                  onBuyItem={handleBuyItem}
                  onEquipCosmetic={handleEquipCosmetic}
                />
              )}

              {activeTab === 'trophies' && (
                <Trophies playerState={playerState} />
              )}

              {activeTab === 'rank' && (
                <Rank playerState={playerState} />
              )}

              {activeTab === 'settings' && (
                <div className="space-y-4">
                  {/* User Account Info Info Panel at top of settings */}
                  <div className="bg-surface-container rounded-xl p-4 border border-outline-variant shadow hover:border-primary/20 transition-all flex items-center justify-between">
                    <div className="flex items-center gap-3 select-none">
                      <div className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden bg-surface-variant flex-shrink-0">
                        <img 
                          src={user.photoURL || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.displayName}`} 
                          alt="Google Avatar" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-xs text-on-surface block leading-none truncate">{user.displayName || 'Demo Warrior'}</span>
                        <span className="text-[9px] text-[#869cb8] font-mono truncate max-w-[180px] block mt-1.5">{user.email || 'standalone-warrior'}</span>
                      </div>
                    </div>
                    <button 
                      onClick={async () => {
                        await logoutUser();
                        setUser(null);
                        showToast("🚪 Successfully logged out of RPG Portal.");
                      }}
                      className="py-1 px-3 bg-error/15 text-error rounded-lg text-[10px] font-bold uppercase tracking-wide border border-error/30 active:scale-95 transition-all h-[36px] min-w-[36px] flex items-center gap-1 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>

                  <Settings 
                    playerState={playerState}
                    onResetData={handleResetData}
                    onSimulateTime={handleSimulateTime}
                  />
                </div>
              )}
            </>
          )}
        </main>

        {/* Fixed Footer Menu bar with Lower padding Buffer */}
        <nav className="h-auto flex-shrink-0 border-t-2 border-outline-variant bg-surface-container-lowest/90 backdrop-blur-sm shadow-[0_-4px_16px_rgba(0,0,0,0.3)] pt-2.5 pb-5 px-2 z-20">
          <div className="flex justify-around items-center h-full gap-1">
            
            {/* Home Tab */}
            <button 
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center justify-center min-h-[48px] py-1 rounded-xl transition-all active:scale-90 flex-1 ${activeTab === 'home' ? 'bg-primary-container text-on-primary-container ring-1 ring-primary' : 'text-on-surface-variant hover:bg-surface-variant/40'}`}
              title="Home Screen"
            >
              <HomeIcon className="w-4.5 h-4.5" />
              <span className="text-[8px] font-bold font-sans tracking-wide mt-1 animate-[fadeIn_0.15s]">Home</span>
            </button>

            {/* Arena Tab */}
            <button 
              onClick={() => setActiveTab('arena')}
              className={`flex flex-col items-center justify-center min-h-[48px] py-1 rounded-xl transition-all active:scale-90 flex-1 ${activeTab === 'arena' ? 'bg-primary-container text-on-primary-container ring-1 ring-primary' : 'text-on-surface-variant hover:bg-surface-variant/40'}`}
              title="Arena Battles"
            >
              <Swords className="w-4.5 h-4.5" />
              <span className="text-[8px] font-bold font-sans tracking-wide mt-1">Arena</span>
            </button>

            {/* Stats Tab */}
            <button 
              onClick={() => setActiveTab('stats')}
              className={`flex flex-col items-center justify-center min-h-[48px] py-1 rounded-xl transition-all active:scale-90 flex-1 ${activeTab === 'stats' ? 'bg-primary-container text-on-primary-container ring-1 ring-primary' : 'text-on-surface-variant hover:bg-surface-variant/40'}`}
              title="Data Analytics"
            >
              <BarChart3 className="w-4.5 h-4.5" />
              <span className="text-[8px] font-bold font-sans tracking-wide mt-1">Analytics</span>
            </button>

            {/* Shop Tab */}
            <button 
              onClick={() => setActiveTab('shop')}
              className={`flex flex-col items-center justify-center min-h-[48px] py-1 rounded-xl transition-all active:scale-90 flex-1 ${activeTab === 'shop' ? 'bg-primary-container text-on-primary-container ring-1 ring-primary' : 'text-on-surface-variant hover:bg-surface-variant/40'}`}
              title="Item Store"
            >
              <ShoppingCart className="w-4.5 h-4.5" />
              <span className="text-[8px] font-bold font-sans tracking-wide mt-1">Shop</span>
            </button>

            {/* Trophies Tab */}
            <button 
              onClick={() => setActiveTab('trophies')}
              className={`flex flex-col items-center justify-center min-h-[48px] py-1 rounded-xl transition-all active:scale-90 flex-1 ${activeTab === 'trophies' ? 'bg-primary-container text-on-primary-container ring-1 ring-primary' : 'text-on-surface-variant hover:bg-surface-variant/40'}`}
              title="Trophy Cases"
            >
              <Trophy className="w-4.5 h-4.5" />
              <span className="text-[8px] font-bold font-sans tracking-wide mt-1">Trophies</span>
            </button>

            {/* Rank Tab */}
            <button 
              onClick={() => setActiveTab('rank')}
              className={`flex flex-col items-center justify-center min-h-[48px] py-1 rounded-xl transition-all active:scale-90 flex-1 ${activeTab === 'rank' ? 'bg-primary-container text-on-primary-container ring-1 ring-primary' : 'text-on-surface-variant hover:bg-surface-variant/40'}`}
              title="Leaderboard Ranks"
            >
              <Award className="w-4.5 h-4.5" />
              <span className="text-[8px] font-bold font-sans tracking-wide mt-1">Rank</span>
            </button>

            {/* Settings Tab */}
            <button 
              onClick={() => setActiveTab('settings')}
              className={`flex flex-col items-center justify-center min-h-[48px] py-1 rounded-xl transition-all active:scale-90 flex-1 ${activeTab === 'settings' ? 'bg-primary-container text-on-primary-container ring-1 ring-primary' : 'text-on-surface-variant hover:bg-surface-variant/40'}`}
              title="Account Settings"
            >
              <SettingsIcon className="w-4.5 h-4.5" />
              <span className="text-[8px] font-bold font-sans tracking-wide mt-1">Settings</span>
            </button>

          </div>
        </nav>

        {/* AI verification wizard modal screen */}
        {verifyQuest && (
          <AIVerificationModal 
            quest={verifyQuest}
            playerState={playerState}
            onClose={() => setVerifyQuest(null)}
            onVerifySuccess={(xp, tokens, msg) => {
              handleAIVerifySuccess(xp, tokens, msg);
              setVerifyQuest(null);
            }}
          />
        )}

        {/* Global persistent falling confetti shower when leveling up */}
        {confettiPieces.length > 0 && (
          <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none overflow-hidden z-[100]">
            {confettiPieces.map(p => (
              <div 
                key={`global-confet-${p.id}`}
                className="absolute animate-[confetti_3s_ease-out_forwards]"
                style={{
                  left: `${p.left}%`,
                  top: `-20px`,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  borderRadius: p.id % 2 === 0 ? '50%' : '0px',
                  backgroundColor: p.color,
                  animationDelay: `${p.delay}s`
                }}
              />
            ))}
          </div>
        )}

        {/* level up celebration overlay cards */}
        {levelUpOverlay && (
          <div className="absolute inset-0 z-[120] bg-surface-dim/95 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 select-none animate-[fadeIn_0.4s_ease]">
            
            {/* Custom styled particle elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {confettiPieces.map(p => (
                <div 
                  key={p.id}
                  className="absolute animate-[confetti_3s_ease-out_forwards]"
                  style={{
                    left: `${p.left}%`,
                    top: `-20px`,
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    borderRadius: p.id % 2 === 0 ? '50%' : '0px',
                    backgroundColor: p.color,
                    animationDelay: `${p.delay}s`
                  }}
                />
              ))}
            </div>

            <div className="relative text-center space-y-6">
              <div className="relative w-32 h-32 bg-gradient-to-tr from-primary/30 to-secondary/30 rounded-full flex items-center justify-center mx-auto border-4 border-primary animate-pulse">
                <Sparkles className="w-14 h-14 text-primary animate-spin" style={{ animationDuration: '4s' }} />
              </div>
              
              <div className="space-y-2">
                <span className="text-secondary font-bold text-[10px] uppercase tracking-[0.3em] font-mono leading-none">WARRIOR ASCENSION</span>
                <h2 className="font-headline text-2xl text-primary uppercase font-extrabold tracking-tight animate-bounce leading-none">LEVEL UP!</h2>
                <p className="text-white text-xs font-bold font-mono">YOU REACHED LEVEL <span className="text-primary text-sm">{playerState.level}!</span></p>
              </div>

              <div className="p-3 bg-surface-container rounded-xl border border-outline-variant max-w-[280px] mx-auto">
                <p className="text-[10px] text-on-surface-variant font-sans leading-relaxed">
                  Your biometric capacity increased. Slay statistics raised! Power rewards unlocked in the Gear Shop. Keep forming awesome habits!
                </p>
              </div>

              <button 
                onClick={() => setLevelUpOverlay(false)}
                className="py-2.5 px-6 bg-primary text-on-primary font-headline text-xs rounded-lg pixel-border hover:opacity-95"
              >
                PROCEED TO ARENA
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
