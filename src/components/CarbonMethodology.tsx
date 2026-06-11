import React from "react";
import { EMISSION_FACTORS } from "../constants/emissionFactors";
import { SYSTEM_CONFIG } from "../config";
import { BookOpen, HelpCircle, Shield, Award, Cpu, BarChart2 } from "lucide-react";
import { motion } from "motion/react";

export function CarbonMethodology() {
  return (
    <div id="methodology-panel" className="w-full max-w-4xl mx-auto text-white z-10 pointer-events-auto select-text space-y-8 bg-zinc-950/40 p-6 sm:p-10 border border-white/5 rounded-2xl backdrop-blur-md">
      
      {/* Page Header */}
      <div className="flex flex-col gap-4 border-b border-white/5 pb-6">
        <div className="flex items-center gap-2 font-mono text-[10px] text-[#00f0ff] uppercase tracking-[0.25em]">
          <BookOpen size={12} />
          <span>Section 06: Carbon Methodology</span>
          <span className="text-zinc-600">//</span>
          <span className="text-zinc-400">Atmospheric Recon Calculations</span>
        </div>

        <h1 className="font-display font-[800] text-3xl sm:text-4xl uppercase tracking-tight">
          Telemetry & Emission <span className="text-transparent text-stroke-white text-glow-cyan">Methodologies</span>
        </h1>

        <p className="text-zinc-400 text-xs sm:text-sm font-sans tracking-wide leading-relaxed font-light">
          A transparent audit listing of emission multipliers, baseline equations, equivalence conversions, and regional data references utilized by the CarbonSense calculation engines.
        </p>
      </div>

      {/* Grid of Formulas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Core Formula 1 */}
        <div className="border border-white/5 bg-zinc-950/20 p-5 rounded-lg space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-[#ffaa00] uppercase font-bold">
            <Cpu size={14} />
            <span>Atmospheric Carbon Baseline Formula</span>
          </div>
          <p className="font-mono text-zinc-300 text-sm bg-black/60 p-3 rounded border border-white/5 font-semibold text-center">
            Emission = CumulativeHabits + 1200kg (Overhead)
          </p>
          <p className="text-zinc-400 text-[11px] leading-relaxed">
            Standard India urban demographics dictate a minimum human base infrastructure emission overhead of 1.2 Tonnes (1200 kg) CO₂e annually, covering common utilities, grid backup operations, and secondary transit leakage.
          </p>
        </div>

        {/* Core Formula 2 */}
        <div className="border border-white/5 bg-zinc-950/20 p-5 rounded-lg space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-[#39ff14] uppercase font-bold">
            <BarChart2 size={14} />
            <span>Equivalency Factor Derivations</span>
          </div>
          <div className="font-mono text-zinc-300 text-[11px] bg-black/60 p-3 rounded border border-white/5 space-y-1">
            <div>• 1 Tree absorption = 21.8 kg CO₂ / Year</div>
            <div>• 1 kWh Saved Energy = 1.6 kg CO₂ Offset</div>
          </div>
          <p className="text-zinc-400 text-[11px] leading-relaxed">
            Tree absorption conversions align with standard EPA forest carbon sink variables assuming mature broadleaf regional species. Grid electricity variables utilize India central grid average coal-mix baselines.
          </p>
        </div>
      </div>

      {/* Emission Factor Directory Table */}
      <div className="space-y-4">
        <h3 className="font-mono text-xs text-white uppercase tracking-wider font-bold border-b border-white/5 pb-1">
          CURRENT COEFFICIENTS DIRECTORY (Scope 1 & Scope 2)
        </h3>

        <div className="overflow-x-auto border border-white/5 rounded-lg bg-black/20">
          <table className="w-full text-left font-mono text-[11px] border-collapse">
            <thead>
              <tr className="bg-white/5 text-zinc-400 uppercase tracking-wider text-[10px] border-b border-white/5">
                <th className="p-3">Category Scope</th>
                <th className="p-3">Logged Activity Type</th>
                <th className="p-3 text-right">Coefficient Weight</th>
                <th className="p-3">Equivalent Scale Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03] text-zinc-300">
              {/* Transport */}
              <tr>
                <td className="p-3 text-white font-bold uppercase" rowSpan={6}>TRANSPORT (km)</td>
                <td className="p-3">Gasoline Sedan vehicle</td>
                <td className="p-3 text-right text-[#ff3b30]">{EMISSION_FACTORS.transport.petrolCar} kg</td>
                <td className="p-3 text-zinc-500">per Km traveled</td>
              </tr>
              <tr>
                <td className="p-3">Diesel Heavy vehicle</td>
                <td className="p-3 text-right text-[#ff3b30]">{EMISSION_FACTORS.transport.dieselCar} kg</td>
                <td className="p-3 text-zinc-500">per Km traveled</td>
              </tr>
              <tr>
                <td className="p-3">CNG Auto Rickshaw</td>
                <td className="p-3 text-right text-[#ffaa00]">{EMISSION_FACTORS.transport.cngAuto} kg</td>
                <td className="p-3 text-zinc-500">per Km traveled</td>
              </tr>
              <tr>
                <td className="p-2">Motorcycle 2-Wheeler</td>
                <td className="p-3 text-right text-zinc-400">{EMISSION_FACTORS.transport.twoWheelerPetrol} kg</td>
                <td className="p-3 text-zinc-500">per Km traveled</td>
              </tr>
              <tr>
                <td className="p-3">Electric Sedan (Weighted grid mix)</td>
                <td className="p-3 text-right text-[#39ff14]">{EMISSION_FACTORS.transport.electricVehicle} kg</td>
                <td className="p-3 text-zinc-500">per Km traveled</td>
              </tr>
              <tr>
                <td className="p-3">Metro/Electric Rail transit</td>
                <td className="p-3 text-right text-[#39ff14]">{EMISSION_FACTORS.transport.trainMetro} kg</td>
                <td className="p-3 text-zinc-500">per Km traveled</td>
              </tr>

              {/* Food */}
              <tr className="border-t border-white/5">
                <td className="p-4 text-white font-bold uppercase" rowSpan={4}>PROTEIN FEED (Meal)</td>
                <td className="p-3">High Methane Livestock feed (Beef/Mutton)</td>
                <td className="p-3 text-right text-[#ff3b30]">{EMISSION_FACTORS.food.beefMethaneFeed} kg</td>
                <td className="p-4 text-zinc-500">per meal consumed</td>
              </tr>
              <tr>
                <td className="p-3">Omnivore standard dairy-crop mix</td>
                <td className="p-3 text-right text-zinc-400">{EMISSION_FACTORS.food.omnivoreStandard} kg</td>
                <td className="p-3 text-zinc-500">per meal consumed</td>
              </tr>
              <tr>
                <td className="p-3">Light vegetarian food</td>
                <td className="p-3 text-right text-[#ffaa00]">{EMISSION_FACTORS.food.vegetarianDairy} kg</td>
                <td className="p-3 text-zinc-500">per meal consumed</td>
              </tr>
              <tr>
                <td className="p-3">Pure vegan organic flora feedstock</td>
                <td className="p-3 text-right text-[#39ff14]">{EMISSION_FACTORS.food.veganPlant} kg</td>
                <td className="p-3 text-zinc-500">per meal consumed</td>
              </tr>

              {/* Energy */}
              <tr className="border-t border-white/5">
                <td className="p-3 text-white font-bold uppercase" rowSpan={3}>ENERGY (kWh / kg)</td>
                <td className="p-3">India Grid average coal-mix baselines</td>
                <td className="p-3 text-right text-[#ff3b30]">{EMISSION_FACTORS.energy.indiaGridCoal} kg</td>
                <td className="p-3 text-zinc-500">per kWh utilized</td>
              </tr>
              <tr>
                <td className="p-3">LPG Household cooking cylinders</td>
                <td className="p-3 text-right text-zinc-400">{EMISSION_FACTORS.energy.lpgGasCylinder} kg</td>
                <td className="p-3 text-zinc-500">per kg fuel burnt</td>
              </tr>
              <tr>
                <td className="p-3">Rooftop Solar cells (Micro-generation)</td>
                <td className="p-3 text-right text-[#39ff14]">{EMISSION_FACTORS.energy.solarMicro} kg</td>
                <td className="p-3 text-zinc-500">zero emission autonomy</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Assumptions & Citations */}
      <div className="space-y-4 pt-4 border-t border-white/5 text-[11px] font-sans text-zinc-400 leading-relaxed space-y-2">
        <div className="flex items-center gap-1.5 font-mono text-white text-[10px] uppercase font-bold" style={{ textTransform: 'uppercase' }}>
          <Shield size={12} className="text-[#00f0ff]" />
          <span>Data Integrity Assertions</span>
        </div>
        <p>
          1. <strong>Indian Power Grid Emissions:</strong> India’s electricity emission coefficients are modeled on the Central Electricity Authority (CEA) baselines, reflecting coal-intensive generation alongside growing solar and hydro installations.
        </p>
        <p>
          2. <strong>Commuter Multipliers:</strong> Transit averages have been derived using standard urban mileage surveys with real-world density modifiers to reflect high metropolitan idle times in Indian traffic clusters.
        </p>
        <p>
          3. <strong>Trace Sinks & Feedbacks:</strong> Cryosphere ice data is extracted dynamically from the NSIDC (National Snow and Ice Data Center), and atmospheric CO₂ levels are reconciled against NOAA global marine surface readings.
        </p>
      </div>

    </div>
  );
}
