import { CarbonHabit, TelemetryHotspot, MissionControlStats } from "./types";

export const initialHabits: CarbonHabit[] = [
  {
    id: "ev_shift",
    name: "Aero EV Shift & Solar Charging",
    category: "mobility",
    baselineValue: 4100,
    reductionPotential: 3400,
    description: "Replace high-displacement internal combustion transport with an electric power unit charged via local photovoltaic arrays.",
    impactTier: "CRITICAL",
    active: false,
    f1MetricLabel: "E-BOOST APPLIED"
  },
  {
    id: "heat_pump",
    name: "Thermodynamic Grid Override",
    category: "energy",
    baselineValue: 2400,
    reductionPotential: 1900,
    description: "Decommission domestic natural gas combustion boilers in favor of intelligent, high-density reverse Carnot heat exchangers.",
    impactTier: "HIGH",
    active: false,
    f1MetricLabel: "THERMAL DEFICIT CONTROL"
  },
  {
    id: "aviation_drs",
    name: "Aviation Desaturation Protocol",
    category: "mobility",
    baselineValue: 2800,
    reductionPotential: 2100,
    description: "Subordinate commercial high-altitude jet travel to carbon-neutral virtual pipelines or magnetic levitation high-speed ground rail.",
    impactTier: "CRITICAL",
    active: false,
    f1MetricLabel: "AERO-DRAG MINIMIZED"
  },
  {
    id: "diet_deficit",
    name: "Biological Feedstock Optimization",
    category: "nutrition",
    baselineValue: 1540,
    reductionPotential: 1150,
    description: "Pivot primary nutritional mass away from high-methane beef and dairy feedstocks into structured bio-synthetic plant proteins.",
    impactTier: "HIGH",
    active: false,
    f1MetricLabel: "ORGANIC POWER OFFSET"
  },
  {
    id: "kinetic_solar",
    name: "Kinetic Microgrid Harvest",
    category: "energy",
    baselineValue: 2100,
    reductionPotential: 1650,
    description: "Deploy offline solid-state energy storage cells paired with micro-inverters for independent localized peak electricity shaving.",
    impactTier: "HIGH",
    active: false,
    f1MetricLabel: "MGU-K CHARGER ARMED"
  },
  {
    id: "circular_consumption",
    name: "Closed-Loop Component Cycle",
    category: "consumption",
    baselineValue: 1200,
    reductionPotential: 750,
    description: "Enforce strict design-for-disassembly standards and carbon-negative supply lines, curtailing new synthetic resource demand.",
    impactTier: "MODERATE",
    active: false,
    f1MetricLabel: "MATERIALS RECYCLING G-FORCE"
  }
];

export const planetaryHotspots: TelemetryHotspot[] = [
  {
    id: "shanghai_grid",
    name: "SHANGHAI MEGAPOLIS GRID",
    latitude: "31.2304° N",
    longitude: "121.4737° E",
    co2Output: "+138.4 Mt CO₂/yr",
    status: "CRITICAL",
    top: 42,
    left: 77,
    trend: "INCREASING"
  },
  {
    id: "permian_flare",
    name: "PERMIAN BASIN PETROLEUM FLARE",
    latitude: "31.8597° N",
    longitude: "102.3121° W",
    co2Output: "+64.2 Mt CO₂/yr",
    status: "CRITICAL",
    top: 38,
    left: 20,
    trend: "STABLE"
  },
  {
    id: "london_core",
    name: "GREATER LONDON CONURBATION",
    latitude: "51.5074° N",
    longitude: "0.1278° W",
    co2Output: "+16.8 Mt CO₂/yr",
    status: "WARNING",
    top: 25,
    left: 48,
    trend: "DECREASING"
  },
  {
    id: "amazon_fire",
    name: "AMAZON BASIN DEFRACTION MARGIN",
    latitude: "3.4653° S",
    longitude: "62.2159° W",
    co2Output: "+41.3 Mt CO₂/yr",
    status: "CRITICAL",
    top: 66,
    left: 31,
    trend: "INCREASING"
  },
  {
    id: "arctic_ice",
    name: "SVALBARD CRYOSPHERE DECAY",
    latitude: "78.2232° N",
    longitude: "15.6267° E",
    co2Output: "-12.4% Ice Thickness",
    status: "CRITICAL",
    top: 15,
    left: 51,
    trend: "INCREASING"
  }
];

export const defaultStats: MissionControlStats = {
  orbitalSpeed: "27,740 km/h",
  co2Concentration: 423.82,
  globalTempAnom: "+1.28°C",
  arcticIceExtent: "4.12M km²",
  oceanHeatContent: "+324 ZJ"
};
