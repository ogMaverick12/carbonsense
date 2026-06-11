export interface CarbonHabit {
  id: string;
  name: string;
  category: "energy" | "mobility" | "nutrition" | "consumption";
  baselineValue: number; // kg CO2e / week or year
  reductionPotential: number; // kg CO2e / year saved if activated
  description: string;
  impactTier: "CRITICAL" | "HIGH" | "MODERATE";
  active: boolean;
  f1MetricLabel: string; // e.g., "DRS ACTIVATED" or "FUEL STRATEGY"
}

export interface TelemetryHotspot {
  id: string;
  name: string;
  latitude: string;
  longitude: string;
  co2Output: string; // e.g., "+42.4 Mt/yr"
  status: "CRITICAL" | "WARNING" | "NOMINAL";
  top: number; // percentage from top of container
  left: number; // percentage from left of container
  trend: "INCREASING" | "STABLE" | "DECREASING";
}

export interface MissionControlStats {
  orbitalSpeed: string;
  co2Concentration: number; // e.g., 421.78 ppm
  globalTempAnom: string; // e.g., "+1.48 °C"
  arcticIceExtent: string; // e.g., "4.31M km²"
  oceanHeatContent: string; // e.g., "Zettajoules +312"
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  location: string;
  commuteMode: string;
  commuteDistance: number;
  diet: string;
  dailyBudgetKg: number;
  streakCount: number;
  lastActiveDate: string;
  totalDaysLogged?: number;
  committedActionsCount?: number;
  daysUnderBudget?: number;
  dailyCO2History?: { date: string; totalKg: number }[];
}

export interface ActivityLog {
  id: string;
  category: "transport" | "food" | "energy" | "shopping" | "waste";
  subcategory: string;
  quantity: number;
  unit: string;
  co2Kg: number;
  date: string;
}

export interface AIInsight {
  id: string;
  title: string;
  body: string;
  generatedAt: string;
  category: string;
  co2ImpactKg?: number;
  icon?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: "transport" | "food" | "energy" | "shopping" | "waste";
  targetValue: number;
  rewardBadge: string;
  requiredUnit: string;
  active: boolean;
  progress: number;
  completed: boolean;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  dateUnlocked?: string;
  icon: string;
  badgeClass: string; // e.g. holographic styling classes
}

export interface UserActivityData {
  totalDaysLogged: number;
  committedActionsCount: number;
  dailyCO2History: { date: string; totalKg: number }[];
}

export interface CertificateEligibility {
  isEligible: boolean;
  tier: 'bronze' | 'silver' | 'gold' | null;
  unmetRequirements: string[]; // human-readable list of what's still needed
  progress: {
    daysLogged: number;        daysRequired: number;
    actionsCommitted: number;  actionsRequired: number;
    avgCO2: number;            avgCO2Required: number;
    daysUnderBudget: number;   daysUnderBudgetRequired: number;
    carbonOffsetKg: number;
  };
  nextTierName: string | null;
  nextTierRequirements: string[];
}


