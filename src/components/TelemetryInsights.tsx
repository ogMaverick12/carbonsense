import React, { useState, useEffect } from "react";
import { defaultStats } from "../data";
import { MissionControlStats } from "../types";
import { TrendingUp, AlertCircle, RefreshCw, BarChart2, Thermometer, ShieldAlert, Zap, Compass, LineChart } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Lazy loaded component for optimized performance
const FutureProjection = React.lazy(() =>
  import("./FutureProjection").then((module) => ({ default: module.FutureProjection }))
);

const InsideLoader = () => (
  <div className="text-zinc-500 font-mono text-[10px] tracking-widest p-6 text-center animate-pulse" style={{ textTransform: 'uppercase' }}>
    Generating Atmospheric Trajectories...
  </div>
);
import { TypewriterText } from "./TypewriterText";

interface TelemetryInsightsProps {
  carbonReduction: number;
  totalBaseline: number;
}

export function TelemetryInsights({ carbonReduction, totalBaseline }: TelemetryInsightsProps) {
  const [insightView, setInsightView] = useState<"diagnostics" | "projection">("diagnostics");
  const currentEmission = totalBaseline - carbonReduction;
  const currentTonnes = (currentEmission / 1000).toFixed(2);
  const offsetTonnes = (carbonReduction / 1000).toFixed(2);

  const [liveCo2, setLiveCo2] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/climate-data")
      .then((res) => {
        if (!res.ok) throw new Error("HTTP failure");
        return res.json();
      })
      .then((data) => {
        if (active && data && typeof data.co2Ppm === "number") {
          setLiveCo2(data.co2Ppm);
        }
      })
      .catch((err) => {
        console.warn("Could not retrieve live global warming index in insights:", err);
      });
    return () => {
      active = false;
    };
  }, []);
  
  // Custom mock data for F1 sectors telemetry graphs
  const globalCarbonSinks = [
    { source: "Boreal Forests", capacity: "4.2 Gt/yr", status: "NOMINAL", utilization: "85%" },
    { source: "Ocean Phytoplankton", capacity: "11.1 Gt/yr", status: "WARNING", utilization: "92%" },
    { source: "Carbon Capture Fan-Cells", capacity: "0.08 Gt/yr", status: "CRITICAL", utilization: "74%" },
    { source: "Soil Carbon Retainers", capacity: "3.4 Gt/yr", status: "NOMINAL", utilization: "80%" }
  ];

  return (
    <div id="insights-panel" className="flex flex-col h-auto gap-8 py-6 w-full text-white z-10 pointer-events-auto select-text">
      
      {/* SECTION 1: Insights Title */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 font-mono text-[10px] text-[#ffaa00] uppercase tracking-[0.25em]" style={{ textTransform: 'uppercase' }}>
          <span>Sector 02: Planetary Insights</span>
          <span className="text-zinc-650">//</span>
          <span className="text-zinc-400" style={{ textTransform: 'uppercase' }}>Correlation Study</span>
        </div>

        <h1 className="font-display font-[800] text-[28px] sm:text-[44px] md:text-[52px] lg:text-[60px] xl:text-[68px] leading-[0.95] md:leading-[0.85] tracking-tighter uppercase break-words overflow-hidden">
          Atmospheric<br />
          <span className="text-transparent text-stroke-white">Saturation</span><br />
          Indices
        </h1>

        <p className="text-zinc-400 text-xs font-sans tracking-wide leading-relaxed font-light">
          Analyzing structural links between personal carbon deviations and feedback systems like ocean acidification and carbon sink absorption decay coefficients.
        </p>

        {/* High-tech Sub-tab Selector */}
        <div className="grid grid-cols-2 gap-2 bg-transparent border-none p-0 max-w-sm mt-1 select-none" role="tablist" aria-label="Insights category selectors">
          <button
            id="insight-diagnostics-btn"
            role="tab"
            aria-selected={insightView === "diagnostics"}
            aria-controls="diagnostics-content-panel"
            aria-label="Show Planetary Diagnostics metrics"
            onClick={() => setInsightView("diagnostics")}
            className={`py-2 px-3 rounded-md font-mono text-[9px] tracking-[0.15em] uppercase cursor-pointer text-center flex items-center justify-center gap-2 transition-all duration-300 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a3e635] focus:ring-1 focus:ring-white/50 ${
              insightView === "diagnostics"
                ? "bg-white/10 text-white border-none font-bold"
                : "text-zinc-500 hover:text-[#ffaa00] border-none bg-transparent"
            }`}
            style={{ textTransform: 'uppercase' }}
          >
            <Compass size={11} className={insightView === "diagnostics" ? "text-[#ffaa00]" : ""} />
            <span>Planetary Diagnostics</span>
          </button>

          <button
            id="insight-projection-btn"
            role="tab"
            aria-selected={insightView === "projection"}
            aria-controls="projection-content-panel"
            aria-label="Show 5-Year AI Forecast metric graphics"
            onClick={() => setInsightView("projection")}
            className={`py-2 px-3 rounded-md font-mono text-[9px] tracking-[0.15em] uppercase cursor-pointer text-center flex items-center justify-center gap-2 transition-all duration-300 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a3e635] focus:ring-1 focus:ring-white/50 ${
              insightView === "projection"
                ? "bg-white/15 text-white border-none font-bold"
                : "text-zinc-500 hover:text-[#39ff14] border-none bg-transparent"
            }`}
            style={{ textTransform: 'uppercase' }}
          >
            <LineChart size={11} className={insightView === "projection" ? "text-[#39ff14]" : ""} />
            <span>5-Year AI Forecast</span>
          </button>
        </div>
      </div>

      <div className="my-4 min-h-[380px] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {insightView === "diagnostics" ? (
            <motion.div
              key="diagnostics-subview"
              id="diagnostics-content-panel"
              role="tabpanel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* SECTION 2: F1 Telemetry Styled Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-transparent border-none p-0 flex flex-col gap-1.5 relative overflow-hidden">
                  <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider">CO₂ ppm concentration</span>
                  <span className="font-display font-extrabold text-3xl text-[#ff3b30] text-glow-red">
                    {liveCo2 !== null ? `${liveCo2.toFixed(1)}` : defaultStats.co2Concentration}
                  </span>
                  <span className="font-mono text-[8px] text-[#ff3b30] flex items-center gap-1 mt-1 font-semibold uppercase" style={{ textTransform: 'uppercase' }}>
                    <TrendingUp size={10} />
                    <span>+2.4 ppm Annual Incline</span>
                  </span>
                </div>

                <div className="bg-transparent border-none p-0 flex flex-col gap-1.5 relative overflow-hidden">
                  <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider">Global heat anomalies</span>
                  <span className="font-display font-extrabold text-3xl text-[#ffaa00]">{defaultStats.globalTempAnom}</span>
                  <span className="font-mono text-[8px] text-[#ffaa00] flex items-center gap-1 mt-1 font-semibold uppercase" style={{ textTransform: 'uppercase' }}>
                    <AlertCircle size={10} />
                    <span>Breaching Thermal Targets</span>
                  </span>
                </div>

                <div className="bg-transparent border-none p-0 flex flex-col gap-1.5 relative overflow-hidden">
                  <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider">Arctic Cryosphere Thickness</span>
                  <span className="font-display font-extrabold text-3xl text-white">{defaultStats.arcticIceExtent}</span>
                  <span className="font-mono text-[8px] text-zinc-500 flex items-center gap-1 mt-1 uppercase" style={{ textTransform: 'uppercase' }}>
                    <span>Decreasing -12.6% Decade</span>
                  </span>
                </div>

                <div className="bg-transparent border-none p-0 flex flex-col gap-1.5 relative overflow-hidden">
                  <span className="font-mono text-[#00f0ff] uppercase tracking-wider text-[9px]">Ocean Heat Content</span>
                  <span className="font-display font-extrabold text-3xl text-[#00f0ff] text-glow-cyan">{defaultStats.oceanHeatContent}</span>
                  <span className="font-mono text-[8px] text-[#00f0ff] flex items-center gap-1 mt-1 uppercase font-semibold" style={{ textTransform: 'uppercase' }}>
                    <span>Increasing Heat Loop Sink</span>
                  </span>
                </div>
              </div>

              {/* SECTION 3: Deep Orbital Carbon Sink Status Table */}
              <div className="bg-transparent border-none p-0 flex flex-col gap-3">
                <span className="font-mono text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider border-b border-white/[0.05] pb-1.5" style={{ textTransform: 'uppercase' }}>
                  Global Carbon Sink Feedback Status
                </span>

                <div className="flex flex-col gap-2">
                  {globalCarbonSinks.map((sink, i) => (
                    <div key={i} className="flex items-center justify-between py-1 border-b border-white/[0.03] text-[10px] font-mono">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          sink.status === "NOMINAL" ? "bg-[#39ff14]" : sink.status === "WARNING" ? "bg-[#ffaa00]" : "bg-[#ff3b30]"
                        }`}></span>
                        <span className="font-bold text-zinc-200 uppercase" style={{ textTransform: 'uppercase' }}>{sink.source}</span>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="text-zinc-500" style={{ textTransform: 'uppercase' }}>Utilization: <strong className="text-zinc-200 font-medium">{sink.utilization}</strong></span>
                        <span className="text-white font-bold">{sink.capacity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 4: Feedback Summary Story */}
              <div className="flex flex-col gap-3">
                <div className="text-[10px] font-mono text-zinc-400 leading-relaxed uppercase tracking-wider min-h-[50px]">
                  <span className="text-[#39ff14] font-bold mr-1" style={{ textTransform: 'uppercase' }}>* System Compiler Analysis:</span>
                  <TypewriterText 
                    text={`Cumulative personal mitigations currently prevent a projected greenhouse mass index density equivalent to ${offsetTonnes} Tonnes of atmospheric gases. Continue prioritizing DRS offsets to reduce atmospheric feedback saturation.`}
                    speed={25}
                    cursorColor="#39ff14"
                  />
                </div>

                {/* Action Link to Trigger Re-estimation */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => alert("RECONCILING FEEDBACK MODELS: Cross-referencing Scope 1-3 with global Copernicus Sentinel indicators...")}
                    aria-label="Re-evaluate dynamics using live Copernicus satellite feedback algorithms"
                    className="flex-1 max-w-sm py-4 rounded-none font-mono text-[10px] tracking-[0.4em] font-bold uppercase transition-all duration-300 cursor-pointer text-center flex items-center justify-center gap-4 group relative overflow-hidden bg-transparent text-white border border-white/20 hover:border-white hover:bg-white hover:text-black shadow-lg focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a3e635] focus:ring-2 focus:ring-white"
                    style={{ textTransform: 'uppercase' }}
                  >
                    <RefreshCw size={12} className="animate-spin" style={{ animationDuration: '6s' }} />
                    <span>Re-evaluate Dynamics</span>
                    {/* Decorative Corner markers */}
                    <div className="absolute -top-[1px] -left-[1px] w-1.5 h-1.5 bg-white"></div>
                    <div className="absolute -bottom-[1px] -right-[1px] w-1.5 h-1.5 bg-white"></div>
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="projections-subview"
              id="projection-content-panel"
              role="tabpanel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <React.Suspense fallback={<InsideLoader />}>
                <FutureProjection 
                  carbonReductionKg={carbonReduction} 
                  totalBaselineKg={totalBaseline} 
                />
              </React.Suspense>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
