import React, { useEffect, useRef, useState, useMemo } from "react";
import { TrendingDown, Sparkles, Cpu, AlertTriangle, ShieldCheck, Activity, Milestone } from "lucide-react";
import gsap from "gsap";

interface FutureProjectionProps {
  carbonReductionKg: number;
  totalBaselineKg: number;
}

export function FutureProjection({ carbonReductionKg, totalBaselineKg }: FutureProjectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathUnmitigatedRef = useRef<SVGPathElement>(null);
  const pathMitigatedRef = useRef<SVGPathElement>(null);
  const [activeHoverPoint, setActiveHoverPoint] = useState<number | null>(null);
  const [projectionModel, setProjectionModel] = useState<"linear" | "compounded">("linear");

  const baselineTonnes = totalBaselineKg / 1000;
  const reductionTonnes = carbonReductionKg / 1000;
  const currentTonnes = baselineTonnes - reductionTonnes;

  // Compute Future savings over 5 and 10 years based on habit selection
  const savings5Year = useMemo(() => {
    if (projectionModel === "linear") {
      return reductionTonnes * 5;
    } else {
      // Tech-Adoption Model: compounding efficiency gain of 4% annually (saves 4% more each year)
      let cumulative = 0;
      for (let i = 0; i < 5; i++) {
        cumulative += reductionTonnes * Math.pow(1.04, i);
      }
      return cumulative;
    }
  }, [reductionTonnes, projectionModel]);

  const savings10Year = useMemo(() => {
    if (projectionModel === "linear") {
      return reductionTonnes * 10;
    } else {
      let cumulative = 0;
      for (let i = 0; i < 10; i++) {
        cumulative += reductionTonnes * Math.pow(1.04, i);
      }
      return cumulative;
    }
  }, [reductionTonnes, projectionModel]);

  // Environmental equivalents based on EPA ratios
  const treeSeedlingsValue = Math.round(savings10Year * 15.2);
  const coalAvoidedLbsValue = Math.round(savings10Year * 1102.3);
  const gallonsGasAvoidedValue = Math.round(savings10Year * 112.5);

  // Compute 5-Year Data Points
  // Years: 2026 (current), 2027, 2028, 2029, 2030
  const forecastData = useMemo(() => {
    const years = [2026, 2027, 2028, 2029, 2030];
    return years.map((year, index) => {
      // Unmitigated path: slight standard drift upwards from baseline
      const unmitigated = baselineTonnes + (index * 0.15);
      
      // Mitigated path under current actions:
      // Drop immediate of reductionTonnes, then compounding tech efficiency savings of 4% annually
      let mitigated = baselineTonnes;
      if (index > 0) {
        mitigated = currentTonnes * Math.pow(0.92, index);
      } else {
        mitigated = currentTonnes;
      }
      // Guarantee doesn't go below absolute zero
      mitigated = Math.max(0.4, mitigated);

      return {
        year,
        unmitigated,
        mitigated,
        saved: Math.max(0, unmitigated - mitigated),
      };
    });
  }, [baselineTonnes, currentTonnes]);

  // SVG dimensions for D3 mapping
  const graphWidth = 520;
  const graphHeight = 220;
  const paddingX = 40;
  const paddingY = 30;

  // Determine Max Tonnes for Y scale range
  const maxEmissionsValue = Math.max(...forecastData.map(d => d.unmitigated)) + 1.5;

  // D3-style scale functions
  const xScale = (index: number) => {
    const step = (graphWidth - paddingX * 2) / (forecastData.length - 1);
    return paddingX + index * step;
  };

  const yScale = (val: number) => {
    const rangeY = graphHeight - paddingY * 2;
    // Map val [0, maxEmissionsValue] to [paddingY + rangeY, paddingY]
    const ratio = val / maxEmissionsValue;
    return paddingY + rangeY - (ratio * rangeY);
  };

  // Compile path generators (similar to d3.line())
  const unmitigatedPathData = useMemo(() => {
    return forecastData.map((d, i) => `${i === 0 ? "M" : "L"}${xScale(i)},${yScale(d.unmitigated)}`).join(" ");
  }, [forecastData, maxEmissionsValue]);

  const mitigatedPathData = useMemo(() => {
    return forecastData.map((d, i) => `${i === 0 ? "M" : "L"}${xScale(i)},${yScale(d.mitigated)}`).join(" ");
  }, [forecastData, maxEmissionsValue]);

  // GSAP animation on mount or when data changes to simulate dynamic flight plotting
  useEffect(() => {
    if (!pathMitigatedRef.current || !pathUnmitigatedRef.current) return;

    // Direct trace draw effect using stroke-dasharray & stroke-dashoffset
    const animatePath = (path: SVGPathElement) => {
      const length = path.getTotalLength();
      gsap.killTweensOf(path);
      
      gsap.set(path, {
        strokeDasharray: length,
        strokeDashoffset: length,
        opacity: 0.8
      });

      gsap.to(path, {
        strokeDashoffset: 0,
        opacity: 1,
        duration: 2.2,
        ease: "power2.out"
      });
    };

    animatePath(pathUnmitigatedRef.current);
    animatePath(pathMitigatedRef.current);

    // Minor slide-in nodes effect
    const dots = containerRef.current?.querySelectorAll(".projection-node");
    if (dots) {
      gsap.fromTo(dots, 
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.8, stagger: 0.1, ease: "back.out(1.7)", delay: 0.3 }
      );
    }
  }, [forecastData]);

  // Total 5-year sum metrics
  const cumulativeSavedTons = forecastData.reduce((sum, d) => sum + d.saved, 0);

  // Dynamic AI feedback based on compound efficiencies
  const aiForecastBriefing = useMemo(() => {
    if (carbonReductionKg < 1500) {
      return {
        status: "Grid Warning",
        color: "text-amber-500",
        bg: "bg-amber-500/10 border-amber-500/15",
        text: `ATMOSPHERIC ACCUMULATION THREAT: Standard lifestyle protocols yield ${cumulativeSavedTons.toFixed(2)} Tonnes of carbon offsets over 5 cycles. This trajectory falls short of Google virtual prompt goals. Active override recommended in Transport or Solar sectors.`
      };
    } else if (carbonReductionKg < 4000) {
      return {
        status: "Stability Nominal",
        color: "text-[#00f0ff]",
        bg: "bg-[#00f0ff]/10 border-[#00f0ff]/15",
        text: `TRAJECTORY STABILIZATION ACTIVE: Projected offsets aggregate to ${cumulativeSavedTons.toFixed(2)} Metric Tonnes by 2030. Cumulative warming loops shaved. Compounding efficiency index suggests level-1 Carbon Officer threshold cleared. Continue maintaining DRS states.`
      };
    } else {
      return {
        status: "Atmospheric Dominance Clear",
        color: "text-[#39ff14]",
        bg: "bg-[#39ff14]/10 border-[#39ff14]/15",
        text: `CRITICAL MASS MITIGATION ACHIEVED: Overrules yield a staggering ${cumulativeSavedTons.toFixed(2)} Metric Tonnes in cumulative air displacement. Solid-state climate balance maintained. Grid autonomy matches carbon neutral standard. Leaderboard threshold surpassed.`
      };
    }
  }, [carbonReductionKg, cumulativeSavedTons]);

  return (
    <div ref={containerRef} className="w-full flex flex-col gap-5 select-text font-sans">
      
      {/* AI Header */}
      <div className={`p-4 rounded-lg border ${aiForecastBriefing.bg} flex gap-3 text-[11px] leading-relaxed transition-all duration-500`}>
        <Cpu size={18} className={`${aiForecastBriefing.color} shrink-0 mt-0.5 animate-pulse`} />
        <div>
          <div className="font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1 text-white">
            <span>Planetary AI Cognition Forecast</span>
            <span className="text-zinc-650">//</span>
            <span className={`${aiForecastBriefing.color} uppercase`} style={{ textTransform: 'uppercase' }}>{aiForecastBriefing.status}</span>
          </div>
          <p className="text-zinc-300 font-light text-xs sm:text-[11px]">
            {aiForecastBriefing.text}
          </p>
        </div>
      </div>

      {/* SVG Carbon Trajectory Line Graph */}
      <div className="bg-transparent border-none p-0 relative overflow-hidden flex flex-col gap-1.5">
        
        {/* Graph Legend */}
        <div className="flex items-center justify-between font-mono text-[8px] sm:text-[9px] text-zinc-500 border-b border-white/5 pb-2 uppercase" style={{ textTransform: 'uppercase' }}>
          <span>Atmospheric Discharge Vector (2026 - 2030)</span>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-[1.5px] bg-[#ff3b30] block"></span>
              <span>Unmitigated Trace</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-[1.5px] bg-[#39ff14] block"></span>
              <span>Mitigated Cycle</span>
            </div>
          </div>
        </div>

        {/* The Graphic Canvas Container */}
        <div className="relative w-full overflow-x-auto scrollbar-hide py-3">
          <svg 
            width={graphWidth} 
            height={graphHeight} 
            className="mx-auto block overflow-visible text-white"
          >
            {/* Draw Y Gridlines & Labels */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const val = ratio * maxEmissionsValue;
              const y = yScale(val);
              return (
                <g key={i} className="opacity-15">
                  <line 
                    x1={paddingX} 
                    y1={y} 
                    x2={graphWidth - paddingX} 
                    y2={y} 
                    stroke="#ffffff" 
                    strokeWidth={0.5} 
                    strokeDasharray="2,3" 
                  />
                  <text 
                    x={paddingX - 8} 
                    y={y + 3} 
                    fill="#ffffff" 
                    fontSize={8} 
                    fontFamily="monospace" 
                    textAnchor="end"
                  >
                    {val.toFixed(1)}t
                  </text>
                </g>
              );
            })}

            {/* Draw X Labels */}
            {forecastData.map((d, index) => {
              const x = xScale(index);
              return (
                <text 
                  key={index} 
                  x={x} 
                  y={graphHeight - paddingY + 14} 
                  fill="rgba(255,255,255,0.4)" 
                  fontSize={8} 
                  fontFamily="monospace" 
                  textAnchor="middle"
                >
                  {d.year}
                </text>
              );
            })}

            {/* Gradient Mask Area below Mitigated Plot */}
            <defs>
              <linearGradient id="mitigatedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#39ff14" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#39ff14" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            <path 
              d={`
                M${xScale(0)},${yScale(0)}
                ${forecastData.map((d, i) => `L${xScale(i)},${yScale(d.mitigated)}`).join(" ")}
                L${xScale(forecastData.length - 1)},${yScale(0)}
                Z
              `}
              fill="url(#mitigatedGrad)"
              className="pointer-events-none opacity-50"
            />

            {/* Path 1: Unmitigated Trend (Pure Red Dash) */}
            <path 
              ref={pathUnmitigatedRef}
              d={unmitigatedPathData}
              fill="none"
              stroke="#ff3b30"
              strokeWidth={1.5}
              strokeDasharray="4,4"
              className="transition-all duration-300"
            />

            {/* Path 2: Mitigated Action Trend (Solid Cyber Green) */}
            <path 
              ref={pathMitigatedRef}
              d={mitigatedPathData}
              fill="none"
              stroke="#39ff14"
              strokeWidth={2}
              className="transition-all duration-300"
              filter="drop-shadow(0 0 4px rgba(57,255,20,0.3))"
            />

            {/* Interaction Hover Vertical Guideline */}
            {activeHoverPoint !== null && (
              <line 
                x1={xScale(activeHoverPoint)} 
                y1={paddingY} 
                x2={xScale(activeHoverPoint)} 
                y2={graphHeight - paddingY} 
                stroke="#00f0ff" 
                strokeWidth={1} 
                strokeDasharray="3,3" 
                className="opacity-40" 
              />
            )}

            {/* Nodes/Circles on Year Points */}
            {forecastData.map((d, index) => {
              const cx = xScale(index);
              const cyUn = yScale(d.unmitigated);
              const cyMit = yScale(d.mitigated);
              const isHovered = activeHoverPoint === index;

              return (
                <g 
                  key={index} 
                  className="cursor-pointer"
                  onMouseEnter={() => setActiveHoverPoint(index)}
                  onMouseLeave={() => setActiveHoverPoint(null)}
                >
                  {/* Invisible wide mouse sensor column */}
                  <rect 
                    x={cx - 15} 
                    y={paddingY} 
                    width={30} 
                    height={graphHeight - paddingY * 2} 
                    fill="transparent" 
                  />

                  {/* Red node (Unmitigated) */}
                  <circle 
                    cx={cx} 
                    cy={cyUn} 
                    r={isHovered ? 4.5 : 3} 
                    fill="#ff3b30" 
                    className="projection-node transition-all duration-200" 
                  />

                  {/* Green node (Mitigated) */}
                  <circle 
                    cx={cx} 
                    cy={cyMit} 
                    r={isHovered ? 5.5 : 4} 
                    fill="#39ff14" 
                    stroke="black"
                    strokeWidth={1}
                    className="projection-node transition-all duration-200" 
                    filter="drop-shadow(0 0 2px rgba(57,255,20,0.5))"
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Dynamic Detail Floating Tooltip */}
        <div className="h-14 flex items-center justify-center font-mono text-[9px] bg-transparent p-2.5 border-none">
          {activeHoverPoint !== null ? (
            <div className="grid grid-cols-3 gap-6 text-center w-full">
              <div>
                <span className="text-zinc-500 block uppercase scale-90">Forecast Cycle</span>
                <span className="text-white font-bold">{forecastData[activeHoverPoint].year}</span>
              </div>
              <div>
                <span className="text-zinc-500 block uppercase scale-90">If No Action</span>
                <span className="text-[#ff3b30] font-bold">{forecastData[activeHoverPoint].unmitigated.toFixed(2)}t CO₂e</span>
              </div>
              <div>
                <span className="text-zinc-500 block uppercase scale-90">Action Offset Path</span>
                <span className="text-[#39ff14] font-bold">{forecastData[activeHoverPoint].mitigated.toFixed(2)}t CO₂e</span>
              </div>
            </div>
          ) : (
            <div className="text-zinc-400 text-center animate-pulse tracking-[0.1em] uppercase text-[8px]" style={{ textTransform: 'uppercase' }}>
              Hover over the corresponding year cycle target paths to retrieve comparative analytics
            </div>
          )}
        </div>
      </div>

      {/* Interactive 'Future Impact' projection card module */}
      <div className="bg-transparent border-none p-0 flex flex-col gap-3 relative overflow-hidden">
        <div className="flex items-center justify-between font-mono text-[9px] text-zinc-400 border-b border-white/5 pb-2 uppercase" style={{ textTransform: 'uppercase' }}>
          <span className="font-bold flex items-center gap-1.5 uppercase text-[#00f0ff] tracking-wide">
            <Milestone size={11} className="text-[#00f0ff]" />
            Sector Projections: Future Impact
          </span>

          <div className="flex bg-black/40 border border-white/10 rounded overflow-hidden select-none">
            <button
              onClick={() => setProjectionModel("linear")}
              className={`px-2 py-1 text-[8px] uppercase tracking-wider font-mono cursor-pointer transition-all focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a3e635] ${
                projectionModel === "linear" ? "bg-white/10 text-[#00f0ff] font-bold" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Linear Model
            </button>
            <button
              onClick={() => setProjectionModel("compounded")}
              className={`px-2 py-1 text-[8px] uppercase tracking-wider font-mono cursor-pointer transition-all focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a3e635] ${
                projectionModel === "compounded" ? "bg-white/10 text-[#00f0ff] font-bold" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Compounded Tech
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 my-0.5">
          {/* 5-Year Impact */}
          <div className="bg-transparent border-none p-0 relative group transition-all duration-300">
            <span className="font-mono text-[8px] text-zinc-500 block uppercase tracking-wider">Projected 5-Year Savings</span>
            <div className="font-display font-extrabold text-2xl text-[#39ff14] mt-1 flex items-baseline gap-1 select-text">
              <span>{savings5Year.toFixed(2)}</span>
              <span className="text-[9px] font-mono text-zinc-400 font-normal">tonnes CO₂e</span>
            </div>
            <p className="text-[7.5px] font-mono text-zinc-400 mt-1.5 leading-normal uppercase">
              • equiv: {gallonsGasAvoidedValue.toLocaleString()} Gal gasoline saved
            </p>
          </div>

          {/* 10-Year Impact */}
          <div className="bg-transparent border-none p-0 relative group transition-all duration-300">
            <span className="font-mono text-[8px] text-zinc-500 block uppercase tracking-wider">Projected 10-Year Savings</span>
            <div className="font-display font-extrabold text-2xl text-[#00f0ff] mt-1 flex items-baseline gap-1 select-text">
              <span>{savings10Year.toFixed(2)}</span>
              <span className="text-[9px] font-mono text-zinc-400 font-normal">tonnes CO₂e</span>
            </div>
            <p className="text-[7.5px] font-mono text-zinc-400 mt-1.5 leading-normal uppercase">
              • equiv: {treeSeedlingsValue.toLocaleString()} seedlings grown
            </p>
          </div>
        </div>

        {/* Dynamic environmental story impact summary message for 10-yr scale */}
        <div className="text-[8px] font-mono leading-relaxed tracking-wide bg-transparent border-none p-0 text-zinc-400 uppercase select-text min-h-[36px]">
          {reductionTonnes > 0 ? (
            <span>
              ★ Decade prediction audit: Under current mitigations, your decade footprint recon offset quantifies to <strong className="text-[#00f0ff]">{savings10Year.toFixed(2)} tonnes</strong>, equidistant to avoiding burn emissions of <strong className="text-[#39ff14]">{coalAvoidedLbsValue.toLocaleString()} lbs</strong> of coal.
            </span>
          ) : (
            <span className="text-[#ff3b30] animate-pulse">
              ▲ Pilot threat level red: Zero individual habit sweep switches active. 10-Year offset burndown remains at 0.0 kg. Baseline atmospheric deterioration coefficient will advance unabated.
            </span>
          )}
        </div>
      </div>

      {/* Trajectory Metrics Footer */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-transparent border-none p-0 font-mono">
          <span className="text-[8px] text-zinc-500 block uppercase tracking-wider">Cumulative 5-Yr Overlook Deviation</span>
          <span className="text-lg font-bold text-[#ff3b30]">+{(forecastData.reduce((sum, d) => sum + d.unmitigated, 0)).toFixed(2)} T</span>
          <p className="text-[7px] text-zinc-600 block mt-1 leading-none uppercase">Total At-Risk Atmosphere if Overrides are Suspended</p>
        </div>

        <div className="bg-transparent border-none p-0 font-mono">
          <span className="text-[8px] text-zinc-500 block uppercase tracking-wider">Prevented Cumulative Volume</span>
          <span className="text-lg font-bold text-[#39ff14] text-glow-cyan">-{cumulativeSavedTons.toFixed(2)} T</span>
          <p className="text-[7px] text-zinc-600 block mt-1 leading-none uppercase">Total Offsets Captured Under Combined Efficiency Scheme</p>
        </div>
      </div>

    </div>
  );
}
