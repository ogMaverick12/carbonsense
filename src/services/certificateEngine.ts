import { makeCertId } from "./certificateHelpers";
import { CertificateEligibility, UserActivityData } from "../types";

export interface Certificate {
  id: string;
  userName: string;
  carbonReduction: number;
  totalBaseline: number;
  issueDate: string;
  equivalentTrees: number;
  energyKwhSaved: number;
  offsetPercent: number;
  verificationUrl: string;
}

export function generateCertificateId(): string {
  return makeCertId();
}

export function getVerificationUrl(certificateId: string): string {
  const base = typeof window !== "undefined" ? window.location.origin : "https://carbonsense.io";
  return `${base}/certificate/${certificateId}`;
}

export function getCertificateStats(carbonReduction: number, totalBaseline: number) {
  const treesEquivalent = Math.round(carbonReduction / 21.8);
  const energyKwhSaved = Math.round(carbonReduction * 1.6);
  const offsetPercent = Math.min(
    100,
    Math.round((carbonReduction / (totalBaseline > 0 ? totalBaseline : 10000)) * 100)
  );

  return {
    treesEquivalent,
    energyKwhSaved,
    offsetPercent
  };
}

export function calculateCertificateOffset(averageDailyEmission: number, daysActive: number): number {
  const indiaBaseline = 5.2;
  const offset = (indiaBaseline - averageDailyEmission) * daysActive;
  return Number(offset.toFixed(2));
}

function getTierRequirementsList(
  tierName: 'bronze' | 'silver' | 'gold',
  data: { daysLogged: number; actionsCommitted: number; avgCO2: number; daysUnderBudget: number; carbonOffsetKg: number }
): string[] {
  const reqs: string[] = [];
  const { daysLogged, actionsCommitted, avgCO2, daysUnderBudget, carbonOffsetKg } = data;
  if (tierName === 'bronze') {
    if (daysLogged < 7) reqs.push(`At least 7 days of logged activities (currently ${daysLogged}/7)`);
    if (actionsCommitted < 1) reqs.push(`At least 1 active action committed (currently ${actionsCommitted}/1)`);
    if (avgCO2 >= 8.0) reqs.push(`Average daily CO₂ below 8.0 kg/day (currently ${avgCO2.toFixed(2)} kg)`);
  } else if (tierName === 'silver') {
    if (daysLogged < 21) reqs.push(`At least 21 days of logged activities (currently ${daysLogged}/21)`);
    if (actionsCommitted < 3) reqs.push(`At least 3 active actions committed (currently ${actionsCommitted}/3)`);
    if (avgCO2 >= 6.8) reqs.push(`Average daily CO₂ below 6.8 kg/day (currently ${avgCO2.toFixed(2)} kg)`);
    if (daysUnderBudget < 5) reqs.push(`At least 5 days where daily total was under 6.8 kg (currently ${daysUnderBudget}/5)`);
  } else if (tierName === 'gold') {
    if (daysLogged < 30) reqs.push(`At least 30 days of logged activities (currently ${daysLogged}/30)`);
    if (actionsCommitted < 5) reqs.push(`At least 5 active actions committed (currently ${actionsCommitted}/5)`);
    if (avgCO2 >= 5.2) reqs.push(`Average daily CO₂ below 5.2 kg/day (currently ${avgCO2.toFixed(2)} kg)`);
    if (daysUnderBudget < 10) reqs.push(`At least 10 days under budget of 6.8 kg (currently ${daysUnderBudget}/10)`);
    if (carbonOffsetKg <= 0) reqs.push(`Carbon offset > 0 (currently ${carbonOffsetKg.toFixed(2)} kg)`);
  }
  return reqs;
}

export function checkCertificateEligibility(userData: UserActivityData): CertificateEligibility {
  const { totalDaysLogged, committedActionsCount, dailyCO2History } = userData;

  const totalDays = dailyCO2History.length;
  const totalCO2 = dailyCO2History.reduce((sum, h) => sum + h.totalKg, 0);
  const avgCO2 = totalDays > 0 ? Number((totalCO2 / totalDays).toFixed(2)) : 0;
  
  // offsetKgPerYear = Math.max(0, (5.2 - userDailyAvgKg) * 365)
  const carbonOffsetKg = Math.max(0, (5.2 - avgCO2) * 365);
  const daysUnderBudget = dailyCO2History.filter(h => h.totalKg < 6.8).length;

  const isBronze = totalDaysLogged >= 7 && committedActionsCount >= 1 && avgCO2 < 8.0;
  const isSilver = totalDaysLogged >= 21 && committedActionsCount >= 3 && avgCO2 < 6.8 && daysUnderBudget >= 5;
  const isGold = totalDaysLogged >= 30 && committedActionsCount >= 5 && avgCO2 < 5.2 && daysUnderBudget >= 10 && carbonOffsetKg > 0;

  let tier: 'bronze' | 'silver' | 'gold' | null = null;
  if (isGold) {
    tier = 'gold';
  } else if (isSilver) {
    tier = 'silver';
  } else if (isBronze) {
    tier = 'bronze';
  }

  const isEligible = tier !== null;

  // Next tier determination
  let nextTierName: string | null = null;
  let nextTierRequirements: string[] = [];
  let daysRequired = 7;
  let actionsRequired = 1;
  let avgCO2Required = 8.0;
  let daysUnderBudgetRequired = 0;

  const dataValues = {
    daysLogged: totalDaysLogged,
    actionsCommitted: committedActionsCount,
    avgCO2,
    daysUnderBudget,
    carbonOffsetKg
  };

  if (tier === null) {
    nextTierName = 'Carbon Cadet (Bronze)';
    nextTierRequirements = getTierRequirementsList('bronze', dataValues);
    daysRequired = 7;
    actionsRequired = 1;
    avgCO2Required = 8.0;
    daysUnderBudgetRequired = 0;
  } else if (tier === 'bronze') {
    nextTierName = 'Emission Sentinel (Silver)';
    nextTierRequirements = getTierRequirementsList('silver', dataValues);
    daysRequired = 21;
    actionsRequired = 3;
    avgCO2Required = 6.8;
    daysUnderBudgetRequired = 5;
  } else if (tier === 'silver') {
    nextTierName = 'Planetary Guardian (Gold)';
    nextTierRequirements = getTierRequirementsList('gold', dataValues);
    daysRequired = 30;
    actionsRequired = 5;
    avgCO2Required = 5.2;
    daysUnderBudgetRequired = 10;
  } else {
    // gold
    nextTierName = null;
    nextTierRequirements = [];
    daysRequired = 30;
    actionsRequired = 5;
    avgCO2Required = 5.2;
    daysUnderBudgetRequired = 10;
  }

  const unmetRequirements = nextTierRequirements;

  return {
    isEligible,
    tier,
    unmetRequirements,
    progress: {
      daysLogged: totalDaysLogged,
      daysRequired,
      actionsCommitted: committedActionsCount,
      actionsRequired,
      avgCO2,
      avgCO2Required,
      daysUnderBudget,
      daysUnderBudgetRequired,
      carbonOffsetKg
    },
    nextTierName,
    nextTierRequirements
  };
}
