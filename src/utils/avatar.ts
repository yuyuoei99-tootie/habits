export interface AvatarMilestone {
  level: number;
  name: string;
  imgUrl: string;
}

export const AVATAR_MILESTONES: AvatarMilestone[] = [
  {
    level: 1,
    name: "Rookie Warrior",
    imgUrl: "https://res.cloudinary.com/diputd1zo/image/upload/q_auto/f_auto/v1779767452/Screenshot_2026-05-26_at_10.50.30-removebg-preview_aicryj.png"
  },
  {
    level: 2,
    name: "Elite Athlete",
    imgUrl: "https://res.cloudinary.com/diputd1zo/image/upload/q_auto/f_auto/v1779768330/Screenshot_2026-05-26_at_11.04.01-removebg-preview_tuzeht.png"
  },
  {
    level: 3,
    name: "Lotus Zen Master",
    imgUrl: "https://res.cloudinary.com/diputd1zo/image/upload/q_auto/f_auto/v1779768497/Screenshot_2026-05-26_at_11.06.44-removebg-preview_ei4pjm.png"
  }
];

export const MAX_AVATAR_LEVEL = 3;

/**
 * Returns the appropriate avatar image URL based on the player's level.
 * Falls back to the maximum milestone if the level exceeds the milestones.
 */
export function getAvatarUrl(level: number): string {
  if (level <= 1) {
    return AVATAR_MILESTONES[0].imgUrl;
  }
  if (level === 2) {
    return AVATAR_MILESTONES[1].imgUrl;
  }
  return AVATAR_MILESTONES[2].imgUrl;
}

/**
 * Returns a title status / stance name matching the current level milestone.
 */
export function getStanceName(level: number): string {
  if (level <= 1) {
    return "ROOKIE WARRIOR";
  }
  if (level === 2) {
    return "ELITE ATHLETE";
  }
  return "ZEN MASTER";
}
