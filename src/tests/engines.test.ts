import { describe, test, expect } from "vitest";
import {
  calculateCO2,
  calculateTotalBaseline,
  calculateCarbonReduction,
  getDailyEmissionKg,
  getDailyBudgetPercentage,
  getTonneValue,
  aggregateDailyEmissions,
  aggregateWeeklyEmissions,
  getBudgetStatus,
  annualizeDailyAverage
} from "../services/carbonEngine";
import {
  checkMilestoneUnlock,
  checkChallengeUnlock,
  updateStreak,
  PRESETS_BADGES
} from "../services/achievementEngine";
import {
  generateCertificateId,
  getVerificationUrl,
  getCertificateStats,
  checkCertificateEligibility,
  calculateCertificateOffset
} from "../services/certificateEngine";
import { UserProfile, Challenge, CarbonHabit } from "../types";

describe("CARBON ENGINE COMPREHENSIVE TESTS", () => {
  test("Test every single transport emission factor calculation", () => {
    // Petrol Car: 0.18
    expect(calculateCO2("transport", "petrolCar", 10)).toBe(1.8);
    // Diesel Car: 0.151
    expect(calculateCO2("transport", "dieselCar", 10)).toBe(1.51);
    // EV: 0.025
    expect(calculateCO2("transport", "electricVehicle", 10)).toBe(0.25);
    // Two wheeler: 0.05
    expect(calculateCO2("transport", "twoWheelerPetrol", 10)).toBe(0.5);
    // Train/Metro: 0.015
    expect(calculateCO2("transport", "trainMetro", 10)).toBe(0.15);
    // CNG Auto: 0.07
    expect(calculateCO2("transport", "cngAuto", 10)).toBe(0.7);
    // Aviation Jet: 0.12
    expect(calculateCO2("transport", "aviationJet", 100)).toBe(12.0);
  });

  test("Test every single food emission factor calculation", () => {
    // omnivoreStandard: 2.1
    expect(calculateCO2("food", "omnivoreStandard", 2)).toBe(4.2);
    // vegetarianDairy: 1.2
    expect(calculateCO2("food", "vegetarianDairy", 2)).toBe(2.4);
    // veganPlant: 0.4
    expect(calculateCO2("food", "veganPlant", 2)).toBe(0.8);
    // beefMethaneFeed: 6.0
    expect(calculateCO2("food", "beefMethaneFeed", 2)).toBe(12.0);
    // localOrganic: 0.3
    expect(calculateCO2("food", "localOrganic", 2)).toBe(0.6);
  });

  test("Test every single energy emission factor calculation", () => {
    // indiaGridCoal: 0.82
    expect(calculateCO2("energy", "indiaGridCoal", 10)).toBe(8.2);
    // lpgGasCylinder: 2.9
    expect(calculateCO2("energy", "lpgGasCylinder", 10)).toBe(29.0);
    // woodCoalCombustion: 3.2
    expect(calculateCO2("energy", "woodCoalCombustion", 10)).toBe(32.0);
    // solarMicro: 0.0
    expect(calculateCO2("energy", "solarMicro", 10)).toBe(0.0);
  });

  test("Test every single shopping emission factor calculation", () => {
    // fastFashionGarment: 8.5
    expect(calculateCO2("shopping", "fastFashionGarment", 2)).toBe(17.0);
    // consumerElectronics: 45.0
    expect(calculateCO2("shopping", "consumerElectronics", 2)).toBe(90.0);
    // localHandloom: 1.2
    expect(calculateCO2("shopping", "localHandloom", 2)).toBe(2.4);
    // durableReusable: 0.2
    expect(calculateCO2("shopping", "durableReusable", 2)).toBe(0.4);
  });

  test("Test every single waste emission factor calculation", () => {
    // landfillUnsorted: 1.8
    expect(calculateCO2("waste", "landfillUnsorted", 10)).toBe(18.0);
    // compostableSegregated: -0.05
    expect(calculateCO2("waste", "compostableSegregated", 10)).toBe(-0.5);
    // dryRecyclableSegregated: -0.1
    expect(calculateCO2("waste", "dryRecyclableSegregated", 10)).toBe(-1.0);
    // zeroRefuseCircular: 0.0
    expect(calculateCO2("waste", "zeroRefuseCircular", 10)).toBe(0.0);
  });

  test("Test with unknown categories or subcategories", () => {
    expect(calculateCO2("invalid" as unknown as Parameters<typeof calculateCO2>[0], "something", 10)).toBe(0);
    expect(calculateCO2("transport", "invalid_vehicle", 10)).toBe(0);
  });

  test("Test with quantity = 0 should return 0 for all categories", () => {
    expect(calculateCO2("transport", "petrolCar", 0)).toBe(0);
    expect(calculateCO2("food", "veganPlant", 0)).toBe(0);
    expect(calculateCO2("energy", "indiaGridCoal", 0)).toBe(0);
    expect(calculateCO2("shopping", "fastFashionGarment", 0)).toBe(0);
    expect(calculateCO2("waste", "landfillUnsorted", 0)).toBe(0);
  });

  test("Test negative emission factors (recycling/composting should reduce totals)", () => {
    const compostCO2 = calculateCO2("waste", "compostableSegregated", 20); // -1.0
    const landfillCO2 = calculateCO2("waste", "landfillUnsorted", 5); // 9.0

    expect(compostCO2).toBeLessThan(0);
    expect(landfillCO2 + compostCO2).toBe(8.0); // 9.0 - 1.0 = 8.0
  });

  test("Test daily total aggregation across multiple activities", () => {
    const activities = [
      { category: "transport" as const, subcategory: "petrolCar", quantity: 15 }, // 2.7
      { category: "food" as const, subcategory: "veganPlant", quantity: 3 }, // 1.2
      { category: "waste" as const, subcategory: "compostableSegregated", quantity: 10 }, // -0.5
    ];
    // Total should be 2.7 + 1.2 - 0.5 = 3.4
    expect(aggregateDailyEmissions(activities)).toBe(3.4);
  });

  test("Test weekly total aggregation", () => {
    const dailyTotals = [5.5, 4.2, 6.1, 3.8, 4.9, 5.0, 3.1];
    // Sum = 32.6
    expect(aggregateWeeklyEmissions(dailyTotals)).toBe(32.6);
  });

  test("Test budget percentage calculation (test 50%, 100%, 120% cases)", () => {
    // target is 5.48 kg
    // 50% case (2.74)
    expect(getDailyBudgetPercentage(2.74)).toBe(50);
    // 100% case (5.48)
    expect(getDailyBudgetPercentage(5.48)).toBe(100);
    // 120% case (6.576)
    expect(getDailyBudgetPercentage(6.576)).toBe(120);
  });

  test("Test getBudgetStatus: good (<70%), warning (70-89%), danger (90%+)", () => {
    expect(getBudgetStatus(0)).toBe("good");
    expect(getBudgetStatus(69)).toBe("good");
    expect(getBudgetStatus(70)).toBe("warning");
    expect(getBudgetStatus(85)).toBe("warning");
    expect(getBudgetStatus(89)).toBe("warning");
    expect(getBudgetStatus(90)).toBe("danger");
    expect(getBudgetStatus(120)).toBe("danger");
  });

  test("Test boundary values exactly at 70 and 90", () => {
    expect(getBudgetStatus(70)).toBe("warning");
    expect(getBudgetStatus(90)).toBe("danger");
    expect(getBudgetStatus(69.99)).toBe("good");
    expect(getBudgetStatus(89.99)).toBe("warning");
  });

  test("Test annualizeDailyAverage", () => {
    expect(annualizeDailyAverage(10)).toBe(3650);
    expect(annualizeDailyAverage(5.48)).toBe(2000.2);
  });

  test("Test calculateTotalBaseline with diverse habits", () => {
    const habits: CarbonHabit[] = [
      { id: "h1", name: "Habit 1", category: "energy", baselineValue: 500, reductionPotential: 100, description: "", impactTier: "MODERATE", active: false, f1MetricLabel: "" },
      { id: "h2", name: "Habit 2", category: "mobility", baselineValue: 800, reductionPotential: 200, description: "", impactTier: "HIGH", active: true, f1MetricLabel: "" }
    ];
    // total baseline has overhead: 500 + 800 + 1200 = 2500
    expect(calculateTotalBaseline(habits)).toBe(2500);
  });

  test("Test calculateCarbonReduction displays correct sums of active potentials", () => {
    const habits: CarbonHabit[] = [
      { id: "h1", name: "Habit 1", category: "energy", baselineValue: 500, reductionPotential: 150, description: "", impactTier: "MODERATE", active: false, f1MetricLabel: "" },
      { id: "h2", name: "Habit 2", category: "mobility", baselineValue: 800, reductionPotential: 250, description: "", impactTier: "HIGH", active: true, f1MetricLabel: "" }
    ];
    expect(calculateCarbonReduction(habits)).toBe(250);
  });

  test("Test getDailyEmissionKg and getTonneValue utilities", () => {
    expect(getDailyEmissionKg(3650)).toBe(10);
    expect(getTonneValue(1250)).toBe("1.25");
  });
});

describe("ACHIEVEMENT ENGINE COMPREHENSIVE TESTS", () => {
  test("Test that achievements unlock at correct thresholds", () => {
    // threshold: 1500 -> equilibrium
    const milestone1 = checkMilestoneUnlock(1500, []);
    expect(milestone1?.id).toBe("equilibrium");

    // threshold: 3400 -> transport-offset
    const milestone2 = checkMilestoneUnlock(3400, []);
    expect(milestone2?.id).toBe("equilibrium"); // equilibrium comes first because it matches first in list 1500 < 3400

    // check specific thresholds sequentially by excluding already unlocked
    const milestone3 = checkMilestoneUnlock(3400, ["equilibrium"]);
    expect(milestone3?.id).toBe("transport-offset");

    const milestone4 = checkMilestoneUnlock(5000, ["equilibrium", "transport-offset"]);
    expect(milestone4?.id).toBe("biomass-synced");

    const milestone5 = checkMilestoneUnlock(8000, ["equilibrium", "transport-offset", "biomass-synced"]);
    expect(milestone5?.id).toBe("grid-desat");
  });

  test("Test streak calculation (consecutive days)", () => {
    const profile: UserProfile = {
      uid: "test_user",
      displayName: "Pilot",
      email: "test@test.com",
      location: "Grid",
      commuteMode: "petrolCar",
      commuteDistance: 20,
      diet: "omnivoreStandard",
      dailyBudgetKg: 5.48,
      streakCount: 3,
      lastActiveDate: "2026-06-08"
    };

    const { updatedProfile, unlockStreakBadge } = updateStreak(profile, "2026-06-09");
    expect(updatedProfile.streakCount).toBe(4);
    expect(updatedProfile.lastActiveDate).toBe("2026-06-09");
    expect(unlockStreakBadge).toBe(false);
  });

  test("Test streak triggers standard commander badge at 7 days consecutive", () => {
    const profile: UserProfile = {
      uid: "test_user",
      displayName: "Pilot",
      email: "test@test.com",
      location: "Grid",
      commuteMode: "petrolCar",
      commuteDistance: 20,
      diet: "omnivoreStandard",
      dailyBudgetKg: 5.48,
      streakCount: 6,
      lastActiveDate: "2026-06-08"
    };

    const { updatedProfile, unlockStreakBadge } = updateStreak(profile, "2026-06-09");
    expect(updatedProfile.streakCount).toBe(7);
    expect(unlockStreakBadge).toBe(true);
  });

  test("Test streak triggers standard commander badge above 7 days consecutive", () => {
    const profile: UserProfile = {
      uid: "test_user",
      displayName: "Pilot",
      email: "test@test.com",
      location: "Grid",
      commuteMode: "petrolCar",
      commuteDistance: 20,
      diet: "omnivoreStandard",
      dailyBudgetKg: 5.48,
      streakCount: 7,
      lastActiveDate: "2026-06-08"
    };

    const { updatedProfile, unlockStreakBadge } = updateStreak(profile, "2026-06-09");
    expect(updatedProfile.streakCount).toBe(8);
    expect(unlockStreakBadge).toBe(true);
  });

  test("Test that non-consecutive days do not count as streaks", () => {
    const profile: UserProfile = {
      uid: "test_user",
      displayName: "Pilot",
      email: "test@test.com",
      location: "Grid",
      commuteMode: "petrolCar",
      commuteDistance: 20,
      diet: "omnivoreStandard",
      dailyBudgetKg: 5.48,
      streakCount: 15,
      lastActiveDate: "2026-06-01" // Gap of 8 days
    };

    const { updatedProfile, unlockStreakBadge } = updateStreak(profile, "2026-06-09");
    expect(updatedProfile.streakCount).toBe(1);
    expect(updatedProfile.lastActiveDate).toBe("2026-06-09");
    expect(unlockStreakBadge).toBe(false);
  });

  test("Test that same day logging doesn't change streak", () => {
    const profile: UserProfile = {
      uid: "test_user",
      displayName: "Pilot",
      email: "test@test.com",
      location: "Grid",
      commuteMode: "petrolCar",
      commuteDistance: 20,
      diet: "omnivoreStandard",
      dailyBudgetKg: 5.48,
      streakCount: 4,
      lastActiveDate: "2026-06-09"
    };

    const { updatedProfile, unlockStreakBadge } = updateStreak(profile, "2026-06-09");
    expect(updatedProfile.streakCount).toBe(4);
    expect(updatedProfile.lastActiveDate).toBe("2026-06-09");
    expect(unlockStreakBadge).toBe(false);
  });

  test("Test achievement persistence (already-unlocked achievements don't re-trigger)", () => {
    // 4000 carbon reduction, but "equilibrium" is already unlocked, so we should unlock "transport-offset"
    const milestone = checkMilestoneUnlock(4000, ["equilibrium"]);
    expect(milestone?.id).toBe("transport-offset");

    // Both are already unlocked, should return null
    const noMilestone = checkMilestoneUnlock(4000, ["equilibrium", "transport-offset"]);
    expect(noMilestone).toBeNull();
  });

  test("Test list-level interactive challenge unlocks and badging", () => {
    const ch_metro: Challenge = {
      id: "ch_metro",
      title: "Metro Transition",
      description: "",
      category: "transport",
      targetValue: 100,
      rewardBadge: "GRID RUNNER",
      requiredUnit: "km",
      active: true,
      progress: 50,
      completed: false
    };

    const ch_vegan: Challenge = {
      id: "ch_vegan",
      title: "Vegan Transition",
      description: "",
      category: "food",
      targetValue: 10,
      rewardBadge: "BIOMASS OPTIMIZER",
      requiredUnit: "meals",
      active: true,
      progress: 9,
      completed: false
    };

    const ch_solar: Challenge = {
      id: "ch_solar",
      title: "Solar Decap",
      description: "",
      category: "energy",
      targetValue: 50,
      rewardBadge: "SOLAR SHIELD",
      requiredUnit: "kWh",
      active: true,
      progress: 40,
      completed: false
    };

    const ch_dry_waste: Challenge = {
      id: "ch_dry_waste",
      title: "Circular Waste",
      description: "",
      category: "waste",
      targetValue: 20,
      rewardBadge: "CIRCULAR MASTER",
      requiredUnit: "kg",
      active: true,
      progress: 10,
      completed: false
    };

    const ch_completed: Challenge = {
      id: "ch_completed",
      title: "Alt Completed",
      description: "",
      category: "transport",
      targetValue: 10,
      rewardBadge: "GRID RUNNER",
      requiredUnit: "km",
      active: true,
      progress: 10,
      completed: true
    };

    const challenges_pool = [ch_metro, ch_vegan, ch_solar, ch_dry_waste, ch_completed];

    // Case 1: Match subcategory for metro mismatch
    const r1 = checkChallengeUnlock(challenges_pool, "transport", "petrolCar", 10, []);
    expect(r1.updatedChallenges[0].progress).toBe(50); // no transition since petrolCar is not trainMetro

    // Case 2: Correct subcategory match for metro complete
    const r2 = checkChallengeUnlock(challenges_pool, "transport", "trainMetro", 60, []);
    expect(r2.updatedChallenges[0].completed).toBe(true);
    expect(r2.updatedChallenges[0].progress).toBe(100);
    expect(r2.newBadgeToUnlock?.title).toBe("GRID RUNNER");

    // Case 3: Reject non-veganPlant mismatch
    const r3 = checkChallengeUnlock(challenges_pool, "food", "omnivoreStandard", 5, []);
    expect(r3.updatedChallenges[1].progress).toBe(9); 

    // Case 4: Correct vegan plant match with completed preset badge of option
    const r4 = checkChallengeUnlock(challenges_pool, "food", "veganPlant", 1, []);
    expect(r4.updatedChallenges[1].completed).toBe(true);
    expect(r4.newBadgeToUnlock?.title).toBe("BIOMASS OPTIMIZER");

    // Case 5: Reject organic food when already matching veganPlant
    const r5 = checkChallengeUnlock(challenges_pool, "food", "localOrganic", 1, []);
    expect(r5.updatedChallenges[1].progress).toBe(9);

    // Case 6: Correct solar unlock complete
    const r6 = checkChallengeUnlock(challenges_pool, "energy", "solarMicro", 15, []);
    expect(r6.updatedChallenges[2].completed).toBe(true);
    expect(r6.newBadgeToUnlock?.title).toBe("SOLAR SHIELD");

    // Case 7: Mismatch solar on non-solar inputs
    const r7 = checkChallengeUnlock(challenges_pool, "energy", "indiaGridCoal", 10, []);
    expect(r7.updatedChallenges[2].progress).toBe(40);

    // Case 8: Waste unsorted mismatch
    const r8 = checkChallengeUnlock(challenges_pool, "waste", "landfillUnsorted", 5, []);
    expect(r8.updatedChallenges[3].progress).toBe(10); // dry waste excludes unsorted

    // Case 9: Waste compostable match
    const r9 = checkChallengeUnlock(challenges_pool, "waste", "compostableSegregated", 22, []);
    expect(r9.updatedChallenges[3].completed).toBe(true);

    // Case 10: Badge is already unlocked, must not award it again
    const r10 = checkChallengeUnlock(challenges_pool, "energy", "solarMicro", 15, ["solar_power"]);
    expect(r10.newBadgeToUnlock).toBeNull();
  });

  test("Test challenge unlock with an invalid/non-existent badge reward name to cover falsy matchedPreset branch", () => {
    const ch_invalid_badge: Challenge = {
      id: "ch_invalid_badge",
      title: "Invalid Badge Challenge",
      description: "",
      category: "transport",
      targetValue: 10,
      rewardBadge: "NON_EXISTENT_BADGE",
      requiredUnit: "km",
      active: true,
      progress: 0,
      completed: false
    };

    const r = checkChallengeUnlock([ch_invalid_badge], "transport", "trainMetro", 10, []);
    expect(r.updatedChallenges[0].completed).toBe(true);
    expect(r.newBadgeToUnlock).toBeNull();
  });

  test("Does not add duplicate badge when badge is already unlocked", () => {
    // This test covers the branch: matchedPreset && !unlockedBadgeIds.includes(matchedPreset.id)
    // Specifically the FALSE path: badge IS already in unlockedBadgeIds.
    const ch_metro: Challenge = {
      id: "ch_metro",
      title: "Metro Transition Protocol",
      description: "",
      category: "transport",
      targetValue: 100,
      rewardBadge: "GRID RUNNER",
      requiredUnit: "km",
      active: true,
      progress: 90,
      completed: false
    };

    const alreadyUnlockedBadgeIds = PRESETS_BADGES
      .filter((badge) => badge.id === "metro_transit")
      .map((badge) => badge.id);
    expect(alreadyUnlockedBadgeIds).toEqual(["metro_transit"]);

    const result = checkChallengeUnlock(
      [ch_metro],
      "transport",
      "trainMetro",
      10,
      alreadyUnlockedBadgeIds
    );

    expect(result.updatedChallenges[0].completed).toBe(true);
    expect(result.newBadgeToUnlock).toBeNull();
  });

  test("Does not unlock a badge when a matching challenge is still incomplete", () => {
    const ch_metro: Challenge = {
      id: "ch_metro",
      title: "Metro Transition Protocol",
      description: "",
      category: "transport",
      targetValue: 100,
      rewardBadge: "GRID RUNNER",
      requiredUnit: "km",
      active: true,
      progress: 20,
      completed: false
    };

    const result = checkChallengeUnlock(
      [ch_metro],
      "transport",
      "trainMetro",
      10,
      []
    );

    expect(result.updatedChallenges[0].completed).toBe(false);
    expect(result.updatedChallenges[0].progress).toBe(30);
    expect(result.newBadgeToUnlock).toBeNull();
  });
});

describe("CERTIFICATE ENGINE COMPREHENSIVE TESTS", () => {
  test("Test Bronze eligibility: 7 days + 1 action + avg < 8.0 kg/day -> eligible", () => {
    const result = checkCertificateEligibility({
      totalDaysLogged: 7,
      committedActionsCount: 1,
      dailyCO2History: [{ date: "2026-06-01", totalKg: 7.5 }]
    });
    expect(result.isEligible).toBe(true);
    expect(result.tier).toBe("bronze");
  });

  test("Test Silver eligibility: 21 days + 3 actions + avg < 6.8 kg/day -> eligible", () => {
    const result = checkCertificateEligibility({
      totalDaysLogged: 21,
      committedActionsCount: 3,
      dailyCO2History: Array.from({ length: 21 }).map((_, i) => ({
        date: `2026-06-${(i + 1).toString().padStart(2, '0')}`,
        totalKg: 6.5
      }))
    });
    expect(result.isEligible).toBe(true);
    expect(result.tier).toBe("silver");
  });

  test("Test Gold eligibility: 30 days + 5 actions + avg < 5.2 kg/day -> eligible", () => {
    const result = checkCertificateEligibility({
      totalDaysLogged: 30,
      committedActionsCount: 5,
      dailyCO2History: Array.from({ length: 30 }).map((_, i) => ({
        date: `2026-06-${(i + 1).toString().padStart(2, '0')}`,
        totalKg: 5.0
      }))
    });
    expect(result.isEligible).toBe(true);
    expect(result.tier).toBe("gold");
  });

  test("Test that insufficient days -> not eligible", () => {
    const result = checkCertificateEligibility({
      totalDaysLogged: 6,
      committedActionsCount: 10,
      dailyCO2History: Array.from({ length: 6 }).map((_, i) => ({
        date: `2026-06-${(i + 1).toString().padStart(2, '0')}`,
        totalKg: 4.0
      }))
    });
    expect(result.isEligible).toBe(false);
    expect(result.tier).toBeNull();
    expect(result.unmetRequirements.length).toBeGreaterThan(0);
  });

  test("Test that insufficient actions -> not eligible", () => {
    const result = checkCertificateEligibility({
      totalDaysLogged: 15,
      committedActionsCount: 0,
      dailyCO2History: Array.from({ length: 15 }).map((_, i) => ({
        date: `2026-06-${(i + 1).toString().padStart(2, '0')}`,
        totalKg: 4.0
      }))
    });
    expect(result.isEligible).toBe(false);
    expect(result.tier).toBeNull();
    expect(result.unmetRequirements.length).toBeGreaterThan(0);
  });

  test("Test that too-high emissions -> not eligible", () => {
    const result = checkCertificateEligibility({
      totalDaysLogged: 10,
      committedActionsCount: 2,
      dailyCO2History: Array.from({ length: 10 }).map((_, i) => ({
        date: `2026-06-${(i + 1).toString().padStart(2, '0')}`,
        totalKg: 8.5
      }))
    });
    expect(result.isEligible).toBe(false);
    expect(result.tier).toBeNull();
    expect(result.unmetRequirements.length).toBeGreaterThan(0);
  });

  test("Test carbon offset calculation: (India baseline 5.2 - your avg) x days", () => {
    // (5.2 - 3.2) * 10 = 20.0
    const offset = calculateCertificateOffset(3.2, 10);
    expect(offset).toBe(20.0);

    // Negative offset where user exceeds India baseline
    // (5.2 - 6.2) * 10 = -10.0
    const negativeOffset = calculateCertificateOffset(6.2, 10);
    expect(negativeOffset).toBe(-10.0);
  });

  test("Test generateCertificateId returns dynamic and structured sequence IDs", () => {
    const id = generateCertificateId();
    expect(id).toMatch(/^CS-NASA-[A-Z0-9]+-[A-Z0-9]+$/);
  });

  test("Test getVerificationUrl creates absolute links under diverse global window environments", () => {
    // Branch 1: Window defined
    const originalWindow = global.window;
    
    // Ensure mock window with origin
    global.window = { location: { origin: "https://custom-test-registry.co" } } as unknown as Window & typeof globalThis;
    const linkWithWindow = getVerificationUrl("TEST-ID-123");
    expect(linkWithWindow).toBe("https://custom-test-registry.co/certificate/TEST-ID-123");

    // Branch 2: Window undefined
     
    // @ts-expect-error -- intentionally deleting global.window to test fallback URL generation
    delete global.window;
    const linkWithoutWindow = getVerificationUrl("TEST-ID-123");
    expect(linkWithoutWindow).toBe("https://carbonsense.io/certificate/TEST-ID-123");

    // Restore original
    global.window = originalWindow;
  });

  test("Test getCertificateStats calculations under standard and zero baselines", () => {
    const stats = getCertificateStats(218, 5000);
    expect(stats.treesEquivalent).toBe(10);
    expect(stats.energyKwhSaved).toBe(349); // 218 * 1.6 = 348.8, rounded to 349
    expect(stats.offsetPercent).toBe(4); // (218 / 5000) * 100 = 4.36, rounded to 4

    // Test zero baseline branch coverage
    const zeroBaselineStats = getCertificateStats(500, 0);
    expect(zeroBaselineStats.offsetPercent).toBe(5); // (500 / 10000) * 100 = 5
  });

  // --- BEGIN NEW GET_TIER_REQUIREMENTS_LIST BRANCH COVERAGE TESTS ---

  test("getTierRequirementsList: Bronze edge cases (empty history / 0 avg)", () => {
    const result = checkCertificateEligibility({
      totalDaysLogged: 0,
      committedActionsCount: 0,
      dailyCO2History: []
    });
    expect(result.isEligible).toBe(false);
    expect(result.tier).toBeNull();
    // Requirements: daysLogged < 7 (true), actionsCommitted < 1 (true), avgCO2 >= 8.0 (false since avgCO2 is 0)
    expect(result.unmetRequirements).toContain("At least 7 days of logged activities (currently 0/7)");
    expect(result.unmetRequirements).toContain("At least 1 active action committed (currently 0/1)");
    expect(result.unmetRequirements).not.toContain("Average daily CO₂ below 8.0 kg/day");
  });

  test("getTierRequirementsList: Bronze edge cases (sufficient days/actions, but avgCO2 >= 8.0)", () => {
    const result = checkCertificateEligibility({
      totalDaysLogged: 8,
      committedActionsCount: 2,
      dailyCO2History: [{ date: "2026-06-01", totalKg: 8.5 }]
    });
    expect(result.isEligible).toBe(false);
    // Requirements: daysLogged < 7 (false), actionsCommitted < 1 (false), avgCO2 >= 8.0 (true)
    expect(result.unmetRequirements).not.toContain("At least 7 days of logged activities");
    expect(result.unmetRequirements).not.toContain("At least 1 active action committed");
    expect(result.unmetRequirements).toContain("Average daily CO₂ below 8.0 kg/day (currently 8.50 kg)");
  });

  test("getTierRequirementsList: Silver next tier requirements (Bronze eligible, all Silver requirements unmet)", () => {
    const result = checkCertificateEligibility({
      totalDaysLogged: 8,
      committedActionsCount: 2,
      dailyCO2History: [{ date: "2026-06-01", totalKg: 7.0 }]
    });
    expect(result.isEligible).toBe(true);
    expect(result.tier).toBe("bronze");
    expect(result.nextTierName).toBe("Emission Sentinel (Silver)");
    // Requirements: daysLogged < 21 (true), actionsCommitted < 3 (true), avgCO2 >= 6.8 (true), daysUnderBudget < 5 (true since daysUnderBudget is 0)
    expect(result.nextTierRequirements).toContain("At least 21 days of logged activities (currently 8/21)");
    expect(result.nextTierRequirements).toContain("At least 3 active actions committed (currently 2/3)");
    expect(result.nextTierRequirements).toContain("Average daily CO₂ below 6.8 kg/day (currently 7.00 kg)");
    expect(result.nextTierRequirements).toContain("At least 5 days where daily total was under 6.8 kg (currently 0/5)");
  });

  test("getTierRequirementsList: Silver next tier requirements (Bronze eligible, some Silver requirements met/unmet)", () => {
    // daysLogged = 22, actionsCommitted = 4, avgCO2 = 6.9, daysUnderBudget = 6
    const result = checkCertificateEligibility({
      totalDaysLogged: 22,
      committedActionsCount: 4,
      dailyCO2History: [
        ...Array.from({ length: 6 }).map((_, i) => ({ date: `2026-06-${(i + 1).toString().padStart(2, '0')}`, totalKg: 6.0 })), // under 6.8
        ...Array.from({ length: 16 }).map((_, i) => ({ date: `2026-06-${(i + 7).toString().padStart(2, '0')}`, totalKg: 7.24 })) // over 6.8
      ]
    });
    // avgCO2 calculation: (6 * 6.0 + 16 * 7.24) / 22 = (36 + 115.84) / 22 = 151.84 / 22 = 6.90 kg
    expect(result.isEligible).toBe(true);
    expect(result.tier).toBe("bronze");
    expect(result.nextTierName).toBe("Emission Sentinel (Silver)");
    // Requirements: daysLogged < 21 (false), actionsCommitted < 3 (false), avgCO2 >= 6.8 (true since 6.90 >= 6.8), daysUnderBudget < 5 (false since 6 >= 5)
    expect(result.nextTierRequirements).not.toContain("At least 21 days of logged activities");
    expect(result.nextTierRequirements).not.toContain("At least 3 active actions committed");
    expect(result.nextTierRequirements).toContain("Average daily CO₂ below 6.8 kg/day (currently 6.90 kg)");
    expect(result.nextTierRequirements).not.toContain("At least 5 days where daily total was under 6.8 kg");
  });

  test("getTierRequirementsList: Silver next tier requirements (Bronze eligible, avgCO2 < 6.8 met but actions < 3)", () => {
    // daysLogged = 22, actionsCommitted = 2, avgCO2 = 6.0, daysUnderBudget = 22
    const result = checkCertificateEligibility({
      totalDaysLogged: 22,
      committedActionsCount: 2,
      dailyCO2History: Array.from({ length: 22 }).map((_, i) => ({
        date: `2026-06-${(i + 1).toString().padStart(2, '0')}`,
        totalKg: 6.0
      }))
    });
    expect(result.isEligible).toBe(true);
    expect(result.tier).toBe("bronze");
    // Requirements: daysLogged < 21 (false), actionsCommitted < 3 (true), avgCO2 >= 6.8 (false), daysUnderBudget < 5 (false)
    expect(result.nextTierRequirements).not.toContain("At least 21 days of logged activities");
    expect(result.nextTierRequirements).toContain("At least 3 active actions committed (currently 2/3)");
    expect(result.nextTierRequirements).not.toContain("Average daily CO₂ below 6.8 kg/day");
    expect(result.nextTierRequirements).not.toContain("At least 5 days where daily total was under 6.8 kg");
  });

  test("getTierRequirementsList: Gold next tier requirements (Silver eligible, all Gold requirements unmet)", () => {
    // daysLogged = 22, actionsCommitted = 4, avgCO2 = 6.0, daysUnderBudget = 22
    // offset = Max(0, (5.2 - 6.0) * 365) = 0
    const result = checkCertificateEligibility({
      totalDaysLogged: 22,
      committedActionsCount: 4,
      dailyCO2History: Array.from({ length: 22 }).map((_, i) => ({
        date: `2026-06-${(i + 1).toString().padStart(2, '0')}`,
        totalKg: 6.0
      }))
    });
    expect(result.isEligible).toBe(true);
    expect(result.tier).toBe("silver");
    expect(result.nextTierName).toBe("Planetary Guardian (Gold)");
    // Requirements: daysLogged < 30 (true), actionsCommitted < 5 (true), avgCO2 >= 5.2 (true since 6.0 >= 5.2), daysUnderBudget < 10 (false since 22 >= 10), carbonOffsetKg <= 0 (true since carbonOffsetKg is 0)
    expect(result.nextTierRequirements).toContain("At least 30 days of logged activities (currently 22/30)");
    expect(result.nextTierRequirements).toContain("At least 5 active actions committed (currently 4/5)");
    expect(result.nextTierRequirements).toContain("Average daily CO₂ below 5.2 kg/day (currently 6.00 kg)");
    expect(result.nextTierRequirements).not.toContain("At least 10 days under budget of 6.8 kg");
    expect(result.nextTierRequirements).toContain("Carbon offset > 0 (currently 0.00 kg)");
  });

  test("getTierRequirementsList: Gold next tier requirements (Silver eligible, some Gold requirements met)", () => {
    // daysLogged = 31, actionsCommitted = 6, avgCO2 = 6.48, daysUnderBudget = 8
    // offset = Max(0, (5.2 - 6.48) * 365) = 0
    const result = checkCertificateEligibility({
      totalDaysLogged: 31,
      committedActionsCount: 6,
      dailyCO2History: [
        ...Array.from({ length: 8 }).map((_, i) => ({ date: `2026-06-${(i + 1).toString().padStart(2, '0')}`, totalKg: 5.0 })),
        ...Array.from({ length: 23 }).map((_, i) => ({ date: `2026-06-${(i + 9).toString().padStart(2, '0')}`, totalKg: 7.0 }))
      ]
    });
    expect(result.isEligible).toBe(true);
    expect(result.tier).toBe("silver");
    // avgCO2 is 6.48 kg (>= 5.2: true), daysLogged = 31 (<30: false), actions = 6 (<5: false), daysUnderBudget = 8 (<10: true), carbonOffsetKg = 0 (<=0: true)
    expect(result.nextTierRequirements).not.toContain("At least 30 days of logged activities");
    expect(result.nextTierRequirements).not.toContain("At least 5 active actions committed");
    expect(result.nextTierRequirements).toContain("Average daily CO₂ below 5.2 kg/day (currently 6.48 kg)");
    expect(result.nextTierRequirements).toContain("At least 10 days under budget of 6.8 kg (currently 8/10)");
    expect(result.nextTierRequirements).toContain("Carbon offset > 0 (currently 0.00 kg)");
  });

  test("getTierRequirementsList: Gold next tier requirements (Silver eligible, offset > 0 and avgCO2 < 5.2 met, but daysLogged < 30 and actions < 5)", () => {
    // daysLogged = 25, actionsCommitted = 4, avgCO2 = 5.0, daysUnderBudget = 25
    // offset = Max(0, (5.2 - 5.0) * 365) = 73 > 0
    const result = checkCertificateEligibility({
      totalDaysLogged: 25,
      committedActionsCount: 4,
      dailyCO2History: Array.from({ length: 25 }).map((_, i) => ({
        date: `2026-06-${(i + 1).toString().padStart(2, '0')}`,
        totalKg: 5.0
      }))
    });
    expect(result.isEligible).toBe(true);
    expect(result.tier).toBe("silver");
    // avgCO2 is 5.0 (>= 5.2: false), daysLogged = 25 (<30: true), actions = 4 (<5: true), daysUnderBudget = 25 (<10: false), carbonOffsetKg = 73 (<=0: false)
    expect(result.nextTierRequirements).toContain("At least 30 days of logged activities (currently 25/30)");
    expect(result.nextTierRequirements).toContain("At least 5 active actions committed (currently 4/5)");
    expect(result.nextTierRequirements).not.toContain("Average daily CO₂ below 5.2 kg/day");
    expect(result.nextTierRequirements).not.toContain("At least 10 days under budget of 6.8 kg");
    expect(result.nextTierRequirements).not.toContain("Carbon offset > 0");
  });

  test("getTierRequirementsList: Gold tier reached (next tier requirements is empty)", () => {
    const result = checkCertificateEligibility({
      totalDaysLogged: 30,
      committedActionsCount: 5,
      dailyCO2History: Array.from({ length: 30 }).map((_, i) => ({
        date: `2026-06-${(i + 1).toString().padStart(2, '0')}`,
        totalKg: 5.0
      }))
    });
    expect(result.isEligible).toBe(true);
    expect(result.tier).toBe("gold");
    expect(result.nextTierName).toBeNull();
    expect(result.nextTierRequirements).toEqual([]);
  });

  test("Returns correct requirement messages for silver tier", () => {
    const result = checkCertificateEligibility({
      totalDaysLogged: 7,
      committedActionsCount: 1,
      dailyCO2History: [{ date: "2026-06-01", totalKg: 7.0 }]
    });
    const requirements = result.nextTierRequirements;

    expect(result.tier).toBe("bronze");
    expect(requirements.some(r => r.includes("21 days"))).toBe(true);
    expect(requirements.some(r => r.includes("3 active actions"))).toBe(true);
    expect(requirements.some(r => r.includes("6.8 kg"))).toBe(true);
    expect(requirements.some(r => r.includes("5 days"))).toBe(true);
  });

  test("Returns correct requirement messages for gold tier", () => {
    const result = checkCertificateEligibility({
      totalDaysLogged: 21,
      committedActionsCount: 3,
      dailyCO2History: [
        ...Array.from({ length: 5 }).map((_, i) => ({
          date: `2026-06-${(i + 1).toString().padStart(2, '0')}`,
          totalKg: 5.0
        })),
        ...Array.from({ length: 16 }).map((_, i) => ({
          date: `2026-06-${(i + 6).toString().padStart(2, '0')}`,
          totalKg: 7.0
        }))
      ]
    });
    const requirements = result.nextTierRequirements;

    expect(result.tier).toBe("silver");
    expect(requirements.some(r => r.includes("30 days"))).toBe(true);
    expect(requirements.some(r => r.includes("5 active actions"))).toBe(true);
    expect(requirements.some(r => r.includes("5.2 kg"))).toBe(true);
    expect(requirements.some(r => r.includes("10 days"))).toBe(true);
  });

  // --- END NEW GET_TIER_REQUIREMENTS_LIST BRANCH COVERAGE TESTS ---
});
