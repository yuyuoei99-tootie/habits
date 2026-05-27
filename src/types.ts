export type QuestType = 'stretching' | 'clean_meals' | 'swim' | 'custom';

export interface Quest {
  id: string;
  name: string;
  description: string;
  xpReward: number;
  tokenReward: number;
  streak: number;
  completedToday: boolean;
  type: QuestType;
  streakBonusText?: string;
}

export interface PlayerState {
  level: number;
  xp: number;
  tokens: number;
  xpToNextLevel: number;
  bossHp: number;
  xpFreeze: boolean;
  tokensSpent: number;
  perfectDaysCount: number;
  bestStreak: number;
  equippedCosmetics: string[];
  purchasedItemIds: string[];
  lastCheckedDate?: string; // For managing daily resets
  
  // Analytics Tracking
  stretchingCount: number;
  mealsCount: number;
  swimCount: number;
  
  stretchingHistory: number[]; // Last 7 periods
  mealsHistory: number[];
  swimHistory: number[];
  
  // Multiplier States
  multiplier: number; // 1.0, 1.2, 1.5
  consecutiveDays: number; // consecutive calendar days logged
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  icon: string; // lucide class or emoji/material icon
  category: 'booster' | 'cosmetic';
  tag?: string;
  locked?: boolean;
  image?: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  avatarUrl: string;
  xp: number;
  level: number;
  isCurrentUser?: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  targetCount: number;
  currentCount: number;
  completed: boolean;
  xpReward: number;
  tokenReward: number;
}
