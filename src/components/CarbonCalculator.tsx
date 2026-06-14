import React from "react";
import { CarbonHabit } from "../types";
import { Zap, ShieldCheck, HelpCircle, Flame, ArrowUpRight, CheckCircle2, ChevronRight, Activity } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

function MetricTooltip({ content }: { content: string }) {
  const [visible, setVisible] = React.useState(false);

  return (
    <div 
      className="relative inline-block ml-1.5 align-middle select-none"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onTouchStart={() => setVisible(!visible)}
    >
      <HelpCircle size={11} className="text-zinc-500 hover:text-[#00f0ff] transition-colors duration-200 cursor-pointer" />
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 3, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-1/2 -translate-x-1/2 bottom-5 z-50 w-52 p-2.5 bg-zinc-950 border border-[#00f0ff]/30 text-zinc-300 text-[8.5px] font-mono rounded shadow-[0_5px_15px_rgba(0,0,0,0.65),0_0_10px_rgba(0,240,255,0.06)] leading-normal tracking-wide uppercase pointer-events-none normal-case"
            style={{ textShadow: "none" }}
          >
            {/* Triangular pointer */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-[#00f0ff]/30"></div>
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface CarbonCalculatorProps {
  habits: CarbonHabit[];
  onToggleHabit: (id: string) => void;
  carbonReduction: number;
  totalBaseline: number;
  focusedIndex?: number;
  onFocusIndex?: (index: number) => void;
  showOnlyMetrics?: boolean;
  showOnlySwitches?: boolean;
  hideHeader?: boolean;
}

export function CarbonCalculator({ 
  habits, 
  onToggleHabit, 
  carbonReduction, 
  totalBaseline,
  focusedIndex = -1,
  onFocusIndex,
  showOnlyMetrics = false,
  showOnlySwitches = false,
  hideHeader = false
}: CarbonCalculatorProps) {
  const currentEmission = totalBaseline - carbonReduction;
  const currentTonnes = (currentEmission / 1000).toFixed(2);
  const targetTonnes = 2.00;
  const differenceToTarget = Number(currentTonnes) - targetTonnes;

  // Let's calculate daily carbon budget stats
  // Annual target of 2.0 tonnes is approx 5.48 kg per day
  // Annual current is currentEmission / 365
  const currentDailyKg = (currentEmission / 365).toFixed(2);
  const targetDailyLimit = 5.48; // 2000 kg / 365 days
  const dailyPercentage = Math.round((Number(currentDailyKg) / targetDailyLimit) * 100);

  // Group habits by impact tier
  const criticalActions = habits.filter(h => h.impactTier === "CRITICAL");
  const highActions = habits.filter(h => h.impactTier === "HIGH" || h.impactTier === "MODERATE");

  if (showOnlyMetrics) {
    return (
      <div id="calculator-panel-metrics" className="flex flex-col h-auto gap-6 py-2 w-full text-white z-10 pointer-events-auto select-text">
        {/* SECTION 2: Carbon Footprint Massive Metric */}
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest block font-medium">
            Projected Annual Discharge (Scope 1-3)
            <MetricTooltip content="Calculated as sum of baseline emission footprints (1200 kg fixed overhead + transportation, energy, nutrition, and materials) minus active overridden offsets." />
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span id="tonnes-metric-value" className={`font-display font-extrabold text-[54px] lg:text-[72px] leading-none tracking-tighter text-glow-cyan transition-colors duration-500 ${
              currentEmission > 5000 ? "text-white" : "text-[#39ff14]"
            }`}>
              {currentTonnes}
            </span>
            <span className="font-mono text-zinc-400 text-sm lg:text-lg tracking-wider font-semibold">
              TONNES CO₂e/yr
            </span>
          </div>
          {/* Target limit comparison feedback banner */}
          <div className="flex items-center gap-3 bg-transparent border-none px-0 py-2 rounded-md w-full font-mono text-[10px] tracking-wide mt-2">
            {differenceToTarget > 0 ? (
              <>
                <div className="h-2 w-2 rounded-full bg-[#ffaa00] animate-pulse"></div>
                <span className="text-zinc-400">
                  Planetary deviation fever: <strong className="text-[#ffaa00]">+{differenceToTarget.toFixed(2)} tonnes</strong> over stability budget.
                </span>
              </>
            ) : (
              <>
                <div className="h-2 w-2 rounded-full bg-[#39ff14]"></div>
                <span className="text-[#39ff14] font-semibold">
                  Stability nominal: individual carbon absorption capacity is in equilibrium.
                </span>
              </>
            )}
          </div>
        </div>

        {/* SECTION 3: Daily Carbon Budget Segment - Formula 1 Telemetry Style */}
        <div className="bg-transparent border-none p-0 flex flex-col gap-4 w-full my-4 relative overflow-hidden">
          {/* Subtle scanline overlay to represent CRM/monitor filter */}
          <div className="absolute inset-0 bg-[linear-to-b_from-transparent_via-white/[0.01]_to-transparent] opacity-35 pointer-events-none"></div>
          
          <div className="flex items-center justify-between font-mono text-[10px] tracking-wider border-b border-white/[0.05] pb-2 text-zinc-400 uppercase">
            <span className="font-semibold text-zinc-300">Daily Unit Burndown Rate</span>
            <span className="text-[#00f0ff] font-bold">Grid Limit: {dailyPercentage}%</span>
          </div>

          <div className="flex items-center justify-between gap-6 py-1">
            <div>
              <div className="font-mono text-[9px] text-zinc-500 uppercase flex items-center">
                <span>Expended Mass</span>
                <MetricTooltip content="Calculated dynamically: Projected Annual Discharge divided by 365 days. Represents your daily carbon burn output." />
              </div>
              <div className="font-display font-extrabold text-2xl text-white mt-1">
                {currentDailyKg} <span className="text-xs font-mono text-zinc-500 font-normal">kg CO₂e</span>
              </div>
              <div className="font-mono text-[10px] text-[#ff3b30] mt-0.5 flex items-center gap-1">
                <Flame size={10} />
                <span className="uppercase">CO₂ Thermal Load Recon</span>
              </div>
            </div>

            <div className="text-right">
              <div className="font-mono text-[9px] text-zinc-500 uppercase flex items-center justify-end">
                <span>Survival Reserve Limit</span>
                <MetricTooltip content="Stable daily quota target of 2,000 kg CO₂e / 365 days = 5.48 kg, the boundary index for global climate preservation." />
              </div>
              <div className="font-display font-extrabold text-2xl text-zinc-400 mt-1">
                {targetDailyLimit.toFixed(2)} <span className="text-xs font-mono text-zinc-500 font-normal">kg CO₂e</span>
              </div>
              <div className="font-mono text-[10px] text-[#39ff14] mt-0.5">
                <span className="uppercase">Nominal Desired Quota</span>
              </div>
            </div>
          </div>

          {/* Dynamic telemetry tire wrap style bar */}
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden relative">
            <div 
              className={`h-full transition-all duration-700 rounded-full ${
                dailyPercentage > 100 ? "bg-[#ff3b30]" : dailyPercentage > 70 ? "bg-[#ffaa00]" : "bg-[#39ff14]"
              }`}
              style={{ width: `${Math.min(100, dailyPercentage)}%` }}
            ></div>
          </div>

          <p className="font-mono text-[9px] text-zinc-500 leading-relaxed tracking-wide uppercase">
            * Budget calculation: 2,000 kg limit / 365 days. Expenditure of fuel exceeding 5.48 kg induces atmospheric degradation acceleration.
          </p>
        </div>
      </div>
    );
  }

  if (showOnlySwitches) {
    return (
      <div id="calculator-panel-switches" className="flex flex-col h-auto gap-6 py-2 w-full text-white z-10 pointer-events-auto select-text">
        {/* SECTION 4: Active Cockpit Switches (Actions Selector) */}
        <div className="flex flex-col gap-3 my-4">
          <div className="flex items-center justify-between font-mono text-[10px] text-zinc-400 uppercase tracking-widest border-b border-white/[0.05] pb-1.5" style={{ textTransform: 'uppercase' }}>
            <span>Manual Override Reconciliations</span>
            <span className="text-[#39ff14] font-bold">Drs / Feedback Activators</span>
          </div>

          {/* Group 1: Critical Mitigation Switches in a Wide elegant grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 w-full mt-1">
            {habits.map((habit, idx) => (
              <motion.button
                key={habit.id}
                id={`switch-${habit.id}`}
                role="switch"
                aria-checked={habit.active}
                tabIndex={0}
                onFocus={() => onFocusIndex?.(idx)}
                onBlur={() => {
                  if (focusedIndex === idx) {
                    onFocusIndex?.(-1);
                  }
                }}
                onClick={() => onToggleHabit(habit.id)}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.03 }}
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.985 }}
                className={`py-3 px-3 text-left cursor-pointer flex items-center justify-between group relative overflow-hidden transition-all duration-300 bg-[#070b13]/60 hover:bg-[#0d1421]/90 border border-white/5 shadow-none rounded-lg focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a3e635] focus:ring-1 focus:ring-[#00f0ff]/80 ${
                  idx === focusedIndex
                    ? "bg-[#0c1626] text-white ring-1 ring-[#00f0ff]/50"
                    : habit.active
                      ? "text-white"
                      : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {/* Highlight active gradient border left side */}
                {habit.active && (
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#39ff14]"></div>
                )}

                <div className="flex items-start gap-2.5 max-w-[80%]">
                  <div className={`mt-0.5 px-1 py-0.5 rounded-xs text-[8px] font-mono font-bold uppercase shrink-0 ${
                    habit.active ? "bg-[#39ff14]/20 text-[#39ff14]" : "bg-zinc-950 text-zinc-600"
                  }`}>
                    {habit.active ? "ON" : "OFF"}
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-[11px] uppercase text-zinc-200 group-hover:text-white tracking-wider flex items-center gap-1.5 leading-tight">
                      {habit.name}
                      {habit.impactTier === "CRITICAL" && (
                        <span className="text-[#ff3b30] text-[8px] font-mono border border-[#ff3b30]/30 px-1 py-0.2 rounded-xs uppercase shrink-0">Critical</span>
                      )}
                    </h3>
                    <p className="text-[10px] text-zinc-500 font-sans tracking-wide leading-relaxed font-light mt-0.5">
                      {habit.description}
                    </p>
                  </div>
                </div>

                {/* F1 Metric Tag and savings value */}
                <div className="text-right flex flex-col items-end gap-0.5 justify-center shrink-0">
                  <span className={`font-mono text-[9px] uppercase tracking-wider font-semibold ${
                    habit.active ? "text-[#39ff14]" : "text-zinc-500"
                  }`}>
                    {habit.active ? `-${habit.reductionPotential} kg` : `+${habit.reductionPotential} kg`}
                  </span>
                  <span className="font-mono text-[8px] text-zinc-550 scale-[0.85] origin-right tracking-tight uppercase max-w-[65px] truncate">
                    {habit.f1MetricLabel}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* SECTION 5: Supporting Microcopy & CTA */}
        <div className="mt-4 flex flex-col gap-3">
          {/* Dynamic environmental story impact summary message */}
          <p className="text-[10px] font-mono text-zinc-500 leading-relaxed uppercase tracking-wider w-full">
            {carbonReduction > 0 ? (
              <span>
                System status: Overrides offset <strong className="text-[#39ff14] font-bold">{(carbonReduction/1000).toFixed(2)} tonnes</strong> of atmospheric carbon. Your current daily deviation yields a cumulative depletion delta index of <strong className="text-white font-bold">{(currentEmission/2000).toFixed(1)}x</strong> Earth-budget capacity.
              </span>
            ) : (
              <span>
                System status: Warning. Zero mitigations active. Continued flight baseline burns global reserves, demanding <strong className="text-[#ff3b30] font-bold">4.24 planets</strong> to reconcile output. Overrides requested immediately.
              </span>
            )}
          </p>

          {/* Strong Launch Authorization Call to Action */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-2">
            {carbonReduction > 0 ? (
              <button
                id="auth-total-system-audit-btn"
                onClick={() => alert("MISSION SYSTEM AUDIT LOADED: Atmospheric carbon baseline compiled to Scope 1-3. Diagnostic report synced.")}
                aria-label="Initiate restoration mission audit"
                className="w-full sm:w-auto px-10 py-4 rounded-none font-mono text-[10px] tracking-[0.4em] font-bold uppercase transition-all duration-300 cursor-pointer text-center flex items-center justify-center gap-4 group relative overflow-hidden bg-transparent text-white border border-white/20 hover:border-white hover:bg-white hover:text-black"
                style={{ minWidth: "260px" }}
              >
                <span>Initiate Restoration</span>
                <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                {/* Decorative Corner markers */}
                <div className="absolute -top-[1px] -left-[1px] w-1.5 h-1.5 bg-white"></div>
                <div className="absolute -bottom-[1px] -right-[1px] w-1.5 h-1.5 bg-white"></div>
              </button>
            ) : (
              <button
                id="auth-total-system-audit-btn"
                disabled
                aria-label="Commit first override before starting restoration"
                className="w-full sm:w-auto px-10 py-4 rounded-none font-mono text-[10px] tracking-[0.2em] font-bold uppercase transition-all duration-300 text-center flex items-center justify-center gap-4 bg-zinc-900/40 text-zinc-500 border border-zinc-805 cursor-not-allowed relative"
                style={{ minWidth: "260px" }}
              >
                <span className="uppercase" style={{ textTransform: 'uppercase' }}>Commit First Override Above</span>
                {/* Decorative Corner markers */}
                <div className="absolute -top-[1px] -left-[1px] w-1.5 h-1.5 bg-zinc-800"></div>
                <div className="absolute -bottom-[1px] -right-[1px] w-1.5 h-1.5 bg-zinc-800"></div>
              </button>
            )}
            
            <div className="flex flex-col justify-center">
              <span className="font-mono text-[9px] text-[#39ff14] font-bold tracking-widest flex items-center gap-1 uppercase" style={{ textTransform: 'uppercase' }}>
                <CheckCircle2 size={10} />
                <span>Stability Protocol v4.18</span>
              </span>
              <span className="font-mono text-[8px] text-zinc-500 tracking-wider">
                PRECISION SHIELD: ±0.03 Mt
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="calculator-panel" className="flex flex-col h-auto gap-8 py-6 w-full text-white z-10 pointer-events-auto select-text">
      
      {/* SECTION 1: Editorial Column Header & Massive Headline */}
      {!hideHeader && (
        <div className="flex flex-col gap-4">
          {/* Subtle F1-style Telemetry Sector tag */}
          <div className="flex items-center gap-2 font-mono text-[10px] text-[#00f0ff] uppercase tracking-[0.25em]">
            <span>Sector 01: Human Telemetry</span>
            <span className="text-zinc-650">//</span>
            <span className="text-zinc-400">FLIGHT DIRECTORY</span>
          </div>

          {/* Massive climate-focused headline */}
          <h1 className="font-display font-[800] text-[38px] sm:text-[46px] md:text-[54px] lg:text-[62px] xl:text-[76px] leading-[0.95] md:leading-[0.85] tracking-tighter uppercase w-full mt-1">
            The Weight<br />
            <span className="text-transparent text-stroke-white">Of Our</span><br />
            Decisions
          </h1>

          {/* Editorial introductory subtitle (impeccable negative space) */}
          <p className="text-zinc-400 text-xs lg:text-sm font-sans tracking-wide leading-relaxed font-light mt-2 w-full">
            Welcome to Earth Mission Control. CarbonSense monitors, parses, and active-tunes your personal daily output. Check planetary diagnostics and override standard consumption protocols below.
          </p>
        </div>
      )}

      {/* SECTION 2: Carbon Footprint Massive Metric */}
      <div className={`${hideHeader ? "mt-2" : "my-8"} flex flex-col gap-2`}>
        <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest block font-medium">
          Projected Annual Discharge (Scope 1-3)
          <MetricTooltip content="Calculated as sum of baseline emission footprints (1200 kg fixed overhead + transportation, energy, nutrition, and materials) minus active overridden offsets." />
        </span>
        <div className="flex items-baseline gap-2 mt-1">
          <span id="tonnes-metric-value" className={`font-display font-extrabold text-[54px] lg:text-[72px] leading-none tracking-tighter text-glow-cyan transition-colors duration-500 ${
            currentEmission > 5000 ? "text-white" : "text-[#39ff14]"
          }`}>
            {currentTonnes}
          </span>
          <span className="font-mono text-zinc-400 text-sm lg:text-lg tracking-wider font-semibold">
            TONNES CO₂e/yr
          </span>
        </div>
        {/* Target limit comparison feedback banner */}
        <div className="flex items-center gap-3 bg-transparent border-none px-0 py-2 rounded-md w-full font-mono text-[10px] tracking-wide mt-2">
          {differenceToTarget > 0 ? (
            <>
              <div className="h-2 w-2 rounded-full bg-[#ffaa00] animate-pulse"></div>
              <span className="text-zinc-400">
                Planetary deviation fever: <strong className="text-[#ffaa00]">+{differenceToTarget.toFixed(2)} tonnes</strong> over stability budget.
              </span>
            </>
          ) : (
            <>
              <div className="h-2 w-2 rounded-full bg-[#39ff14]"></div>
              <span className="text-[#39ff14] font-semibold">
                Stability nominal: individual carbon absorption capacity is in equilibrium.
              </span>
            </>
          )}
        </div>
      </div>

      {/* SECTION 3: Daily Carbon Budget Segment - Formula 1 Telemetry Style */}
      <div className="bg-transparent border-none p-0 flex flex-col gap-4 w-full my-4 relative overflow-hidden">
        {/* Subtle scanline overlay to represent CRM/monitor filter */}
        <div className="absolute inset-0 bg-[linear-to-b_from-transparent_via-white/[0.01]_to-transparent] opacity-35 pointer-events-none"></div>
        
        <div className="flex items-center justify-between font-mono text-[10px] tracking-wider border-b border-white/[0.05] pb-2 text-zinc-400 uppercase">
          <span className="font-semibold text-zinc-300">Daily Unit Burndown Rate</span>
          <span className="text-[#00f0ff] font-bold">Grid Limit: {dailyPercentage}%</span>
        </div>

        <div className="flex items-center justify-between gap-6 py-1">
          <div>
            <div className="font-mono text-[9px] text-zinc-500 uppercase flex items-center">
              <span>Expended Mass</span>
              <MetricTooltip content="Calculated dynamically: Projected Annual Discharge divided by 365 days. Represents your daily carbon burn output." />
            </div>
            <div className="font-display font-extrabold text-2xl text-white mt-1">
              {currentDailyKg} <span className="text-xs font-mono text-zinc-500 font-normal">kg CO₂e</span>
            </div>
            <div className="font-mono text-[10px] text-[#ff3b30] mt-0.5 flex items-center gap-1">
              <Flame size={10} />
              <span className="uppercase">CO₂ Thermal Load Recon</span>
            </div>
          </div>

          <div className="text-right">
            <div className="font-mono text-[9px] text-zinc-500 uppercase flex items-center justify-end">
              <span>Survival Reserve Limit</span>
              <MetricTooltip content="Stable daily quota target of 2,000 kg CO₂e / 365 days = 5.48 kg, the boundary index for global climate preservation." />
            </div>
            <div className="font-display font-extrabold text-2xl text-zinc-400 mt-1">
              {targetDailyLimit.toFixed(2)} <span className="text-xs font-mono text-zinc-500 font-normal">kg CO₂e</span>
            </div>
            <div className="font-mono text-[10px] text-[#39ff14] mt-0.5">
              <span className="uppercase">Nominal Desired Quota</span>
            </div>
          </div>
        </div>

        {/* Dynamic telemetry tire wrap style bar */}
        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden relative">
          <div 
            className={`h-full transition-all duration-700 rounded-full ${
              dailyPercentage > 100 ? "bg-[#ff3b30]" : dailyPercentage > 70 ? "bg-[#ffaa00]" : "bg-[#39ff14]"
            }`}
            style={{ width: `${Math.min(100, dailyPercentage)}%` }}
          ></div>
        </div>

        <p className="font-mono text-[9px] text-zinc-500 leading-relaxed tracking-wide uppercase">
          * Budget calculation: 2,000 kg limit / 365 days. Expenditure of fuel exceeding 5.48 kg induces atmospheric degradation acceleration.
        </p>
      </div>

      {/* SECTION 4: Active Cockpit Switches (Actions Selector) */}
      <div className="flex flex-col gap-3 my-4">
        <div className="flex items-center justify-between font-mono text-[10px] text-zinc-400 uppercase tracking-widest border-b border-white/[0.05] pb-1.5" style={{ textTransform: 'uppercase' }}>
          <span>Manual Override Reconciliations</span>
          <span className="text-[#39ff14] font-bold">Drs / Feedback Activators</span>
        </div>

        {/* Group 1: Critical Mitigation Switches in a Wide elegant grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 w-full mt-1">
          {habits.map((habit, idx) => (
            <motion.button
              key={habit.id}
              id={`switch-${habit.id}`}
              role="switch"
              aria-checked={habit.active}
              tabIndex={0}
              onFocus={() => onFocusIndex?.(idx)}
              onBlur={() => {
                if (focusedIndex === idx) {
                  onFocusIndex?.(-1);
                }
              }}
              onClick={() => onToggleHabit(habit.id)}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.03 }}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.985 }}
              className={`py-3 px-3 text-left cursor-pointer flex items-center justify-between group relative overflow-hidden transition-all duration-300 bg-[#070b13]/60 hover:bg-[#0d1421]/90 border border-white/5 shadow-none rounded-lg focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a3e635] focus:ring-1 focus:ring-[#00f0ff]/80 ${
                idx === focusedIndex
                  ? "bg-[#0c1626] text-white ring-1 ring-[#00f0ff]/50"
                  : habit.active
                    ? "text-white"
                    : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {/* Highlight active gradient border left side */}
              {habit.active && (
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#39ff14]"></div>
              )}

              <div className="flex items-start gap-3 max-w-[80%]">
                <div className={`mt-0.5 p-1 rounded-sm text-xs font-mono font-bold uppercase ${
                  habit.active ? "bg-[#39ff14]/20 text-[#39ff14]" : "bg-zinc-950 text-zinc-600"
                }`}>
                  {habit.active ? "ON" : "OFF"}
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-[12px] uppercase text-zinc-200 group-hover:text-white tracking-wider flex items-center gap-1.5 leading-tight">
                    {habit.name}
                    {habit.impactTier === "CRITICAL" && (
                      <span className="text-[#ff3b30] text-[9px] font-mono border border-[#ff3b30]/30 px-1 py-0.2 rounded-xs uppercase">Critical</span>
                    )}
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-sans tracking-wide leading-relaxed font-light mt-0.5">
                    {habit.description}
                  </p>
                </div>
              </div>

              {/* F1 Metric Tag and savings value */}
              <div className="text-right flex flex-col items-end gap-0.5 justify-center">
                <span className={`font-mono text-[9px] uppercase tracking-wider font-semibold ${
                  habit.active ? "text-[#39ff14]" : "text-zinc-500"
                }`}>
                  {habit.active ? `-${habit.reductionPotential} kg` : `+${habit.reductionPotential} kg`}
                </span>
                <span className="font-mono text-[8px] text-zinc-500 scale-90 origin-right tracking-tight uppercase max-w-[80px] truncate">
                  {habit.f1MetricLabel}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* SECTION 5: Supporting Microcopy & CTA */}
      <div className="mt-4 flex flex-col gap-3">
        {/* Dynamic environmental story impact summary message */}
        <p className="text-[10px] font-mono text-zinc-500 leading-relaxed uppercase tracking-wider w-full">
          {carbonReduction > 0 ? (
            <span>
              System status: Overrides offset <strong className="text-[#39ff14] font-bold">{(carbonReduction/1000).toFixed(2)} tonnes</strong> of atmospheric carbon. Your current daily deviation yields a cumulative depletion delta index of <strong className="text-white font-bold">{(currentEmission/2000).toFixed(1)}x</strong> Earth-budget capacity.
            </span>
          ) : (
            <span>
              System status: Warning. Zero mitigations active. Continued flight baseline burns global reserves, demanding <strong className="text-[#ff3b30] font-bold">4.24 planets</strong> to reconcile output. Overrides requested immediately.
            </span>
          )}
        </p>

        {/* Strong Launch Authorization Call to Action */}
        <div className="flex items-center gap-4 mt-2">
          {carbonReduction > 0 ? (
            <button
              id="auth-total-system-audit-btn"
              onClick={() => alert("MISSION SYSTEM AUDIT LOADED: Atmospheric carbon baseline compiled to Scope 1-3. Diagnostic report synced.")}
              aria-label="Initiate restoration mission audit"
              className="flex-1 max-w-sm py-4.5 rounded-none font-mono text-[10px] tracking-[0.4em] font-bold uppercase transition-all duration-300 cursor-pointer text-center flex items-center justify-center gap-4 group relative overflow-hidden bg-transparent text-white border border-white/20 hover:border-white hover:bg-white hover:text-black"
            >
              <span>Initiate Restoration</span>
              <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
              {/* Decorative Corner markers */}
              <div className="absolute -top-[1px] -left-[1px] w-1.5 h-1.5 bg-white"></div>
              <div className="absolute -bottom-[1px] -right-[1px] w-1.5 h-1.5 bg-white"></div>
            </button>
          ) : (
            <button
              id="auth-total-system-audit-btn"
              disabled
              aria-label="Commit first override before starting restoration"
              className="flex-1 max-w-sm py-4.5 rounded-none font-mono text-[10px] tracking-[0.2em] font-bold uppercase transition-all duration-300 text-center flex items-center justify-center gap-4 bg-zinc-900/40 text-zinc-500 border border-zinc-805 cursor-not-allowed relative"
            >
              <span className="uppercase" style={{ textTransform: 'uppercase' }}>Commit First Override Above</span>
              {/* Decorative Corner markers */}
              <div className="absolute -top-[1px] -left-[1px] w-1.5 h-1.5 bg-zinc-800"></div>
              <div className="absolute -bottom-[1px] -right-[1px] w-1.5 h-1.5 bg-zinc-800"></div>
            </button>
          )}
          
          <div className="flex flex-col justify-center">
            <span className="font-mono text-[9px] text-[#39ff14] font-bold tracking-widest flex items-center gap-1 uppercase" style={{ textTransform: 'uppercase' }}>
              <CheckCircle2 size={10} />
              <span>Stability Protocol v4.18</span>
            </span>
            <span className="font-mono text-[8px] text-zinc-500 tracking-wider">
              PRECISION SHIELD: ±0.03 Mt
            </span>
          </div>
        </div>
      </div>
      
    </div>
  );
}
