import { Badge, Challenge, UserProfile } from "../types";

export interface Milestone {
  id: string;
  title: string;
  description: string;
  metric: string;
  badgeColor: string;
  threshold: number;
}

export const MILESTONES: Milestone[] = [
  {
    id: "equilibrium",
    title: "Emission Equilibrium Achieved",
    description: "You successfully overruled high-carbon baseline paths to bring projected carbon outputs down under standard safety quotas.",
    metric: "CAP PARITY MATCHED",
    badgeColor: "#39ff14",
    threshold: 1500,
  },
  {
    id: "transport-offset",
    title: "Zero-Petrol Sector Cleared",
    description: "Sustained lifestyle shifting into clean battery / kinetic charging overrules logged. Low levels of CO₂ tracking successfully.",
    metric: "ZERO PETROL DELTA",
    badgeColor: "#00f0ff",
    threshold: 3400,
  },
  {
    id: "biomass-synced",
    title: "Methane Sink Active",
    description: "Full nutritional biomass transformation applied. Mass feedstock methane loads minimized over major agricultural coordinate blocks.",
    metric: "METHANE CORRIDOR ACTIVE",
    badgeColor: "#ffaa00",
    threshold: 5000,
  },
  {
    id: "grid-desat",
    title: "Grid Desaturation Master",
    description: "Complete net-zero microgrid autonomy verified. Solid-state grid transitions online. Atmospheric risk minimized.",
    metric: "NET Autonomy ACTIVE",
    badgeColor: "#39ff14",
    threshold: 8000,
  }
];

export const PRESETS_BADGES: Badge[] = [
  {
    id: "first_log",
    title: "TECTONIC IGNITION",
    description: "Successfully logged your very first atmospheric flight diagnostic activity.",
    icon: "☄️",
    badgeClass: "from-[#ff3b30] to-[#ffaa00] text-red-100 shadow-[0_0_15px_rgba(255,59,48,0.3)] animate-pulse"
  },
  {
    id: "metro_transit",
    title: "GRID RUNNER",
    description: "Accrued 100 km of low-carbon high-speed mag-rail electric transit logs.",
    icon: "🚝",
    badgeClass: "from-[#00f0ff] to-[#0072ff] text-cyan-100 shadow-[0_0_15px_rgba(0,240,255,0.3)] border border-[#00f0ff]/50"
  },
  {
    id: "vegan_protein",
    title: "BIOMASS OPTIMIZER",
    description: "Consolidated a streak of nutritious organic plant feedstock fuel inputs.",
    icon: "🍀",
    badgeClass: "from-[#39ff14] to-[#00b0ff] text-green-100 shadow-[0_0_15px_rgba(57,255,20,0.3)] border border-[#39ff14]/50"
  },
  {
    id: "solar_power",
    title: "SOLAR SHIELD",
    description: "Successfully decoupled peak household load demands using decentralized micro-cells.",
    icon: "☀️",
    badgeClass: "from-[#ff9500] to-[#ffcc00] text-orange-100 shadow-[0_0_15px_rgba(255,149,0,0.3)]"
  },
  {
    id: "circular_master",
    title: "CIRCULAR MASTER",
    description: "Maintained closed-loop household disassembly, sorting, recycling, and composting.",
    icon: "♻️",
    badgeClass: "from-[#af52de] to-[#ff2d55] text-purple-100 shadow-[0_0_15px_rgba(175,82,222,0.3)]"
  },
  {
    id: "streak_commander",
    title: "STREAK COMMANDER",
    description: "Maintained a 7-day sustainable lifestyle logging streak at Earth Mission Control.",
    icon: "👑",
    badgeClass: "from-[#fff] to-[#ffd700] text-yellow-900 border-2 border-yellow-400 shadow-[0_0_20px_rgba(255,215,0,0.5)] bg-radial"
  },
  {
    id: "annual_carbon_hero",
    title: "ANNUAL CARBON HERO",
    description: "Exceeded the high-level milestone of 3,500 kg of annual CO₂ reduction offsets over a 365-day period.",
    icon: "🏆",
    badgeClass: "from-[#ffea00] via-[#ffaa00] to-[#ff5e00] text-amber-100 shadow-[0_0_25px_rgba(255,215,0,0.5)] border-2 border-amber-400 animate-pulse font-bold"
  }
];

/**
 * Checks if a net carbon reduction milestones can be triggered.
 */
export function checkMilestoneUnlock(carbonReduction: number, unlockedMilestoneIds: string[]): Milestone | null {
  const matched = MILESTONES.find(
    (m) => carbonReduction >= m.threshold && !unlockedMilestoneIds.includes(m.id)
  );
  return matched || null;
}

/**
 * Updates challenges based on logged activity category and registers potential badge triggers.
 */
export function checkChallengeUnlock(
  challenges: Challenge[],
  category: string,
  subcategory: string,
  quantity: number,
  unlockedBadgeIds: string[]
): { updatedChallenges: Challenge[]; newBadgeToUnlock: Badge | null } {
  let newBadgeToUnlock: Badge | null = null;
  
  const updatedChallenges = challenges.map((ch) => {
    if (ch.category === category && !ch.completed) {
      if (ch.id === "ch_metro" && subcategory !== "trainMetro") return ch;
      if (ch.id === "ch_vegan" && subcategory !== "veganPlant") return ch;
      if (ch.id === "ch_solar" && subcategory !== "solarMicro") return ch;
      if (ch.id === "ch_dry_waste" && subcategory === "landfillUnsorted") return ch;

      const newProg = Math.min(ch.targetValue, ch.progress + quantity);
      const isComplete = newProg >= ch.targetValue;

      if (isComplete && !ch.completed) {
        const matchedPreset = PRESETS_BADGES.find((b) => b.title === ch.rewardBadge || b.id === ch.rewardBadge);
        if (matchedPreset && !unlockedBadgeIds.includes(matchedPreset.id)) {
          newBadgeToUnlock = matchedPreset;
        }
      }

      return { ...ch, progress: newProg, completed: isComplete };
    }
    return ch;
  });

  return { updatedChallenges, newBadgeToUnlock };
}

/**
 * Evaluates active tracing days and updates tracking sequences.
 */
export function updateStreak(
  profile: UserProfile,
  todayStr: string
): { updatedProfile: UserProfile; unlockStreakBadge: boolean } {
  const lastActive = profile.lastActiveDate;
  if (lastActive === todayStr) {
    return { updatedProfile: profile, unlockStreakBadge: false };
  }

  const yesterday = new Date(todayStr);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  let newStreak = profile.streakCount;
  let unlockStreakBadge = false;

  if (lastActive === yesterdayStr) {
    newStreak += 1;
    if (newStreak >= 7) {
      unlockStreakBadge = true;
    }
  } else {
    newStreak = 1;
  }

  const updatedProfile: UserProfile = {
    ...profile,
    streakCount: newStreak,
    lastActiveDate: todayStr
  };

  return { updatedProfile, unlockStreakBadge };
}
