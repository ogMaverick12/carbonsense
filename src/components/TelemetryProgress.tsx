import React, { useState } from "react";
import { CheckCircle2, ShieldAlert, Sparkles, Orbit, Award, AlertCircle, TrendingDown, Info } from "lucide-react";
import { motion } from "motion/react";
import { CarbonHabit } from "../types";

interface TelemetryProgressProps {
  activeTab: "actions" | "progress";
  carbonReduction: number;
  totalBaseline: number;
  onViewCertificate?: () => void;
  habits?: CarbonHabit[];
}

export function TelemetryProgress({ activeTab, carbonReduction, totalBaseline, onViewCertificate, habits }: TelemetryProgressProps) {
  const [compilingState, setCompilingState] = useState<"idle" | "compiling" | "completed">("idle");
  const [simulationCertificateId, setSimulationCertificateId] = useState<string>("");

  const currentEmission = totalBaseline - carbonReduction;
  const currentTonnes = (currentEmission / 1000).toFixed(2);
  const offsetTonnes = (carbonReduction / 1000).toFixed(2);
  const offsetPercent = Math.min(100, Math.round((carbonReduction / totalBaseline) * 100));

  // Milestones representing flight achievements towards climate stability
  const objectives = [
    {
      phase: "Phase 01: Emission Equilibrium",
      status: currentEmission <= 5000 ? "Completed" : "In Progress",
      description: "Reduce annual projected footprint below safety margin limit (5.0 tonnes per individual global quota).",
      indicator: "Cap Parity"
    },
    {
      phase: "Phase 02: High-E-Boost Transport Offset",
      status: carbonReduction >= 3400 ? "Completed" : "Locked",
      description: "Sustained shift away from organic fossil engine fuels into zero-emittance battery/kinetic power units.",
      indicator: "Zero Petrol"
    },
    {
      phase: "Phase 03: Deficit Biomass Nutrition",
      status: carbonReduction >= 4500 ? "Completed" : "Locked",
      description: "Commit full shift in nutritional sourcing, eliminating cattle mass feedstock emissions.",
      indicator: "Methane Sink"
    },
    {
      phase: "Phase 04: Total Grid Desaturation (MGU-K)",
      status: carbonReduction >= 9000 ? "Completed" : "Locked",
      description: "Decommission synthetic grid carbon dependencies through solid-state solar microgrid arrays.",
      indicator: "Net Independence"
    }
  ];

  const triggerCertificateCompilation = () => {
    if (compilingState !== "idle") return;
    setCompilingState("compiling");
    setTimeout(() => {
      setCompilingState("completed");
      const hex = Math.floor(Math.random() * 0xffffff).toString(16).toUpperCase().padStart(6, "0");
      setSimulationCertificateId(`CS-SEC3-${hex}`);
    }, 2400);
  };

  return (
    <div id="progress-panel" className="flex flex-col h-auto gap-8 py-6 max-w-[580px] text-white z-10 pointer-events-auto select-text">
      
      {/* SECTION 1: Dynamic Headers based on selected tab */}
      <div className="flex flex-col gap-4">
        {activeTab === "actions" ? (
          <>
            <div className="flex items-center gap-2 font-mono text-[10px] text-[#39ff14] uppercase tracking-[0.25em]">
              <span>Sector 03: Mitigation Actions</span>
              <span className="text-zinc-650">//</span>
              <span className="text-zinc-400 uppercase" style={{ textTransform: 'uppercase' }}>Decision Core</span>
            </div>
            <h1 className="font-display font-[800] text-[26px] sm:text-[42px] md:text-[50px] lg:text-[58px] xl:text-[66px] leading-[0.95] md:leading-[0.85] tracking-tighter uppercase break-words overflow-hidden">
              Reconciler<br />
              <span className="text-transparent text-stroke-white">Core</span><br />
              Override
            </h1>
            <p className="text-zinc-400 text-xs font-sans tracking-wide leading-relaxed font-light">
              Commit structural lifestyle offsets to override standard carbon trajectories. Each committed decision immediately updates Earth's atmospheric pressure telemetry.
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 font-mono text-[10px] text-[#00f0ff] uppercase tracking-[0.25em]">
              <span>Sector 04: Orbital Milestones</span>
              <span className="text-zinc-650">//</span>
              <span className="text-zinc-400 uppercase" style={{ textTransform: 'uppercase' }}>Flight Progress Audit</span>
            </div>
            <h1 className="font-display font-[800] text-[26px] sm:text-[42px] md:text-[50px] lg:text-[58px] xl:text-[66px] leading-[0.95] md:leading-[0.85] tracking-tighter uppercase break-words overflow-hidden">
              Mission<br />
              <span className="text-transparent text-stroke-white">Milestone</span><br />
              Metrics
            </h1>
            <p className="text-zinc-400 text-xs font-sans tracking-wide leading-relaxed font-light">
              Tracking personal environmental contributions against cumulative targets. Complete goals to decrease planetary risk triggers.
            </p>
          </>
        )}
      </div>

      {/* SECTION 2: Interactive visual offset dials/percent representing the user's flight performance */}
      <div className="my-6 border border-white/5 bg-zinc-950/20 p-5 rounded-lg flex items-center justify-between gap-6 backdrop-blur-md relative overflow-hidden">
        {/* Subtle decorative mesh background */}
        <div className="absolute right-0 bottom-0 w-32 h-32 bg-[#00f0ff]/5 rounded-full blur-2xl pointer-events-none"></div>

        {carbonReduction === 0 ? (
          <div>
            <span className="font-mono text-[9px] text-[#00f0ff] uppercase tracking-wider font-bold" style={{ textTransform: 'uppercase' }}>Potential Carbon Reduction</span>
            <span className="text-xs font-sans text-zinc-400 block mt-0.5">Commit to actions below to see your impact</span>
            <div className="font-display font-extrabold text-xl sm:text-2xl text-[#39ff14] mt-2 leading-none uppercase">
              Up to {((habits ? habits.reduce((sum, h) => sum + h.reductionPotential, 0) : 10950) / 1000).toFixed(2)} tonnes/yr savings available
            </div>
            <p className="font-mono text-[9px] text-zinc-500 uppercase mt-1.5 font-semibold" style={{ textTransform: 'uppercase' }}>
              savings available under full override
            </p>
          </div>
        ) : (
          <div>
            <span className="font-mono text-[9px] text-zinc-500 uppercase" style={{ textTransform: 'uppercase' }}>Personal Carbon Reduction Index</span>
            <div className="font-display font-extrabold text-4xl text-white mt-1">
              {offsetPercent}% <span className="text-xs font-mono font-normal text-zinc-400 uppercase" style={{ textTransform: 'uppercase' }}>Savings Applied</span>
            </div>
            <div className="font-mono text-[10px] text-[#39ff14] font-semibold mt-1.5 flex flex-col gap-1 uppercase">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-[#39ff14]" />
                <span>Saves {offsetTonnes} Tonnes CO₂e / Year</span>
              </span>
              {habits && habits.some(h => !h.active) && (
                <span className="text-zinc-500 font-normal normal-case mt-1.5 text-[9.5px] leading-relaxed block">
                  + Additional <strong className="text-[#00f0ff] font-bold">{(habits.filter(h => !h.active).reduce((sum, h) => sum + h.reductionPotential, 0) / 1000).toFixed(2)} tonnes/yr</strong> potential available from uncommitted overrides
                </span>
              )}
            </div>
          </div>
        )}

        <div className="relative flex items-center justify-center">
          {/* Circular telemetry indicator */}
          <svg className="w-18 h-18 transform -rotate-90">
            <circle cx="36" cy="36" r="32" stroke="rgba(255,255,255,0.05)" strokeWidth="4" fill="transparent" />
            <circle 
              cx="36" 
              cy="36" 
              r="32" 
              stroke={carbonReduction === 0 ? "rgba(57, 255, 20, 0.25)" : "#00f0ff"} 
              strokeWidth="4" 
              fill="transparent" 
              strokeDasharray={`${2 * Math.PI * 32}`}
              strokeDashoffset={`${2 * Math.PI * 32 * (1 - (carbonReduction === 0 ? 100 : offsetPercent) / 100)}`}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <span className="absolute font-mono text-[10px] font-extrabold text-white">
            {carbonReduction === 0 ? "100%" : `${offsetPercent}%`}
          </span>
        </div>
      </div>

      {/* SECTION 3: Detailed Milestones Board */}
      <div className="flex flex-col gap-3 my-4">
        <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest border-b border-white/[0.05] pb-1" style={{ textTransform: 'uppercase' }}>
          {activeTab === "actions" ? "Embedded Cockpit Recon Actions" : "Atmosphere Target Objectives"}
        </span>

        {activeTab === "actions" ? (
          <div className="bg-zinc-950/30 border border-white/[0.04] p-4 rounded-lg font-mono text-[10px] flex flex-col gap-3">
            <div className="flex items-center gap-2 text-[#39ff14] uppercase" style={{ textTransform: 'uppercase' }}>
              <Award size={14} />
              <span>System Commit Verdict</span>
            </div>
            <p className="text-zinc-400 leading-relaxed font-sans text-xs">
              Any overrides selected on the dashboard panel are saved on your localized digital core. To commit these, request an audit certificate below to prove your deficit contribution.
            </p>
            <div className="border border-dashed border-zinc-800 p-2.5 rounded bg-black/40 text-[9px] flex justify-between text-zinc-400 items-center">
              <span className="uppercase" style={{ textTransform: 'uppercase' }}>Reducer Certificate Status:</span>
              <span className={`${compilingState === "completed" ? "text-[#00f0ff]" : "text-[#39ff14]"} font-bold uppercase`} style={{ textTransform: 'uppercase' }}>
                {compilingState === "idle" && "Ready to Compile"}
                {compilingState === "compiling" && "Compiling Core..."}
                {compilingState === "completed" && "Persisted Sec Core"}
              </span>
            </div>

            {compilingState === "completed" && (
              <div className="p-2 border border-[#00f0ff]/20 bg-[#00f0ff]/5 rounded text-[8px] text-zinc-300 mt-1 flex flex-col gap-0.5 font-mono">
                <div className="flex items-center gap-1.5 text-[#00f0ff] font-bold uppercase tracking-wider" style={{ textTransform: 'uppercase' }}>
                  <Info size={10} />
                  <span>Decentralized Enviro-Log Successful</span>
                </div>
                <span style={{ textTransform: 'uppercase' }}>Unique Record Identification: <strong className="text-white font-[800]">{simulationCertificateId}</strong></span>
                <span style={{ textTransform: 'uppercase' }}>Status: Applied to active CO₂e projected curve re-optimizer.</span>
                {onViewCertificate && (
                  <button
                    onClick={onViewCertificate}
                    className="mt-2 text-center text-[10px] text-white hover:text-[#00f0ff] font-bold underline uppercase cursor-pointer focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a3e635]"
                    style={{ textTransform: 'uppercase' }}
                  >
                    Launch Certificate Studio ↗
                  </button>
                )}
              </div>
            )}

            <button
              onClick={triggerCertificateCompilation}
              disabled={compilingState === "compiling"}
              className="py-4 rounded-none font-mono text-[10px] tracking-[0.4em] font-bold uppercase transition-all duration-300 cursor-pointer text-center flex items-center justify-center gap-4 group relative overflow-hidden bg-transparent text-white border border-white/20 hover:border-white hover:bg-white hover:text-black shadow-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a3e635] focus:ring-2 focus:ring-white"
              style={{ textTransform: 'uppercase' }}
            >
              <span>
                {compilingState === "idle" && "Compile Certificate"}
                {compilingState === "compiling" && "Compiling, Please Wait..."}
                {compilingState === "completed" && "Re-Compile Certificate"}
              </span>
              {/* Decorative Corner markers */}
              <div className="absolute -top-[1px] -left-[1px] w-1.5 h-1.5 bg-white"></div>
              <div className="absolute -bottom-[1px] -right-[1px] w-1.5 h-1.5 bg-white"></div>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {objectives.map((obj, index) => {
              const isDone = obj.status === "Completed";
              return (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`p-3 rounded-md border flex flex-col gap-1 transition-all duration-300 ${
                    isDone 
                      ? "bg-[#00f0ff]/5 border-[#00f0ff]/20" 
                      : "bg-black/30 border-white/[0.03] opacity-65"
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className={`font-extrabold tracking-wider ${isDone ? "text-white" : "text-zinc-400"}`}>
                      {obj.phase}
                    </span>
                    <span className={`px-1.5 rounded-xs font-semibold ${
                      isDone ? "bg-[#39ff14]/10 text-[#39ff14]" : "bg-zinc-900 text-zinc-500"
                    }`}>
                      {obj.status}
                    </span>
                  </div>
                  <p className="text-zinc-400 text-[11px] font-sans font-light leading-relaxed mt-0.5">
                    {obj.description}
                  </p>
                  <div className="flex justify-between items-center text-[8px] font-mono mt-1 text-zinc-500 uppercase tracking-widest" style={{ textTransform: 'uppercase' }}>
                    <span>Sector Criteria:</span>
                    <span className={isDone ? "text-[#00f0ff]" : "text-zinc-650"}>{obj.indicator}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 4: Microcopy Actions */}
      <div className="mt-4 flex flex-col gap-3">
        <p className="text-[10px] font-mono text-zinc-500 leading-relaxed uppercase tracking-wider">
          {activeTab === "actions" ? (
            <span>* <span className="uppercase" style={{ textTransform: 'uppercase' }}>Decision Note</span>: Committing mitigations offsets Scope 1 heating footprint. Real-time visual feedback updates the planetary CO₂ haze dynamically.</span>
          ) : (
            <span>* <span className="uppercase" style={{ textTransform: 'uppercase' }}>Audit Note</span>: Stabilizing target criteria below 1.5 degrees Celsius requires completing Phase 01 & Phase 02 by 2031-12-31 to preserve global feedback tolerances.</span>
          )}
        </p>
      </div>

    </div>
  );
}
