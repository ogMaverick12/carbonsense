import { EMISSION_FACTORS } from "../constants/emissionFactors";
import { SYSTEM_CONFIG } from "../config";
import { CarbonHabit } from "../types";

/**
 * Calculates CO2 equivalent emissions in kg for a given category, subcategory and quantity.
 */
export function calculateCO2(
  category: "transport" | "food" | "energy" | "shopping" | "waste",
  subcategory: string,
  quantity: number
): number {
  const factors = (EMISSION_FACTORS as any)[category];
  if (!factors) return 0;
  const multiplier = factors[subcategory] || 0;
  return Number((quantity * multiplier).toFixed(3));
}

/**
 * Computes the total annual emission baseline based on default habits.
 */
export function calculateTotalBaseline(habits: CarbonHabit[]): number {
  const habitsBaseline = habits.reduce((sum, h) => sum + h.baselineValue, 0);
  return habitsBaseline + SYSTEM_CONFIG.annualBaselineOverhead;
}

/**
 * Calculates total annual carbon saved by activated switches.
 */
export function calculateCarbonReduction(habits: CarbonHabit[]): number {
  return habits
    .filter((h) => h.active)
    .reduce((sum, h) => sum + h.reductionPotential, 0);
}

/**
 * Derives daily emission rate in kg from annual emission.
 */
export function getDailyEmissionKg(totalEmissionAnnual: number): number {
  return Number((totalEmissionAnnual / 365).toFixed(2));
}

/**
 * Calculates daily carbon budget percentage versus target.
 */
export function getDailyBudgetPercentage(dailyKg: number): number {
  return Math.round((dailyKg / SYSTEM_CONFIG.dailyTargetLimitKg) * 100);
}

/**
 * Converts kg values to tonnes displaying with 2 decimals.
 */
export function getTonneValue(kg: number): string {
  return (kg / 1000).toFixed(2);
}

export interface MinimalActivity {
  category: "transport" | "food" | "energy" | "shopping" | "waste";
  subcategory: string;
  quantity: number;
}

/**
 * Dynamically aggregates daily emissions across multiple activities.
 */
export function aggregateDailyEmissions(activities: MinimalActivity[]): number {
  const sum = activities.reduce((total, act) => {
    return total + calculateCO2(act.category, act.subcategory, act.quantity);
  }, 0);
  return Number(sum.toFixed(3));
}

/**
 * Aggregates weekly emissions from daily totals.
 */
export function aggregateWeeklyEmissions(dailyTotals: number[]): number {
  const sum = dailyTotals.reduce((total, val) => total + val, 0);
  return Number(sum.toFixed(3));
}

/**
 * Returns budget safety status badge.
 */
export function getBudgetStatus(percentage: number): "good" | "warning" | "danger" {
  if (percentage < 70) return "good";
  if (percentage < 90) return "warning";
  return "danger";
}

/**
 * Converts a daily average back to serialized annual values.
 */
export function annualizeDailyAverage(averageDailyKg: number): number {
  return Number((averageDailyKg * 365).toFixed(2));
}
