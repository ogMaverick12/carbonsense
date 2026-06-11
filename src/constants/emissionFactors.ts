// INDIA-SPECIFIC EMISSION COEFFICIENTS (in kg CO2e per unit)
export const EMISSION_FACTORS = {
  transport: {
    petrolCar: 0.18,      // per km
    dieselCar: 0.151,     // per km
    electricVehicle: 0.025, // per km (weighted grid mix)
    twoWheelerPetrol: 0.05, // per km
    trainMetro: 0.015,     // per km
    cngAuto: 0.07,        // per km
    aviationJet: 0.12     // per km
  },
  food: {
    omnivoreStandard: 2.1,  // per meal
    vegetarianDairy: 1.2,   // per meal (curds/paneer intensive)
    veganPlant: 0.4,       // per meal
    beefMethaneFeed: 6.0,  // per meal (beef/mutton high load)
    localOrganic: 0.3      // per meal
  },
  energy: {
    indiaGridCoal: 0.82,    // per kWh
    lpgGasCylinder: 2.9,    // per kg fuel
    woodCoalCombustion: 3.2, // per kg
    solarMicro: 0.0         // zero emissions
  },
  shopping: {
    fastFashionGarment: 8.5,  // per item
    consumerElectronics: 45.0, // per item
    localHandloom: 1.2,       // per item
    durableReusable: 0.2      // per item
  },
  waste: {
    landfillUnsorted: 1.8,    // per kg wet waste
    compostableSegregated: -0.05, // per kg (offset)
    dryRecyclableSegregated: -0.1, // per kg (offset)
    zeroRefuseCircular: 0.0    // per kg
  }
};
