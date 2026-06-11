import { MissionControlStats } from "../types";

export const SYSTEM_CONFIG = {
  annualBaselineOverhead: 1200, // adding baseline other overheads (1.2 tonnes CO2)
  annualTargetLimitTonnes: 2.00,
  dailyTargetLimitKg: 5.48, // 2000 kg / 365 days
  defaultUsername: "Pilot",
  indianCities: [
    "Mumbai (West Coalition Grid)",
    "Delhi NCR (Coal heavy Northern Grid)",
    "Bangalore (Southern Eco Grid)",
    "Chennai (Tamil Monsoon Grid)",
    "Kolkata (East Silt intensive Grid)",
    "Hyderabad (Central Deccan Grid)"
  ]
};

export const DEFAULT_STATS: MissionControlStats = {
  orbitalSpeed: "27,740 km/h",
  co2Concentration: 423.82,
  globalTempAnom: "+1.28°C",
  arcticIceExtent: "4.12M km²",
  oceanHeatContent: "+324 ZJ"
};
