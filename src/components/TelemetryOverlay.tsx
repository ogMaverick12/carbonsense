import React, { useEffect, useState, memo } from "react";
import { Activity, ShieldAlert, Cpu, Orbit, BatteryCharging, Radio } from "lucide-react";

export const TelemetryOverlay = memo(function TelemetryOverlay() {
  const [ticker, setTicker] = useState(0);
  const [systemTime, setSystemTime] = useState("");
  const [riskCountdown, setRiskCountdown] = useState({
    years: 5,
    days: 142,
    hours: 8,
    minutes: 42,
    seconds: 19
  });

  // Keep live timers and telemetry updates ticking
  useEffect(() => {
    const timer = setInterval(() => {
      setTicker((t) => t + 1);
      
      const now = new Date();
      setSystemTime(now.getUTCFullYear() + "." + 
                    String(now.getUTCMonth() + 1).padStart(2, "0") + "." + 
                    String(now.getUTCDate()).padStart(2, "0") + " " + 
                    String(now.getUTCHours()).padStart(2, "0") + ":" + 
                    String(now.getUTCMinutes()).padStart(2, "0") + ":" + 
                    String(now.getUTCSeconds()).padStart(2, "0") + " UTC");
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Slowly tick down the climate target timeline (2031 limit)
  useEffect(() => {
    const timeTimer = setInterval(() => {
      setRiskCountdown((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        } else {
          return { ...prev, years: Math.max(0, prev.years - 1), days: 364 };
        }
      });
    }, 1000);
    return () => clearInterval(timeTimer);
  }, []);

  return (
    <div id="telemetry-root" aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none font-mono">
      {/* Editorial NASA Space Grid background lines */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#00f0ff]/15 to-transparent"></div>
      <div className="absolute inset-y-0 left-12 w-[1px] bg-[#222222]/40 border-l border-dashed border-white/[0.04]"></div>
      <div className="absolute inset-y-0 right-12 w-[1px] bg-[#222222]/40 border-r border-dashed border-white/[0.04]"></div>

      {/* Grid coordinates dots */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid-dots" width="80" height="80" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="#00f0ff" />
            <line x1="10" y1="20" x2="20" y2="20" stroke="#00f0ff" strokeWidth="0.5" opacity="0.3" />
            <line x1="20" y1="10" x2="20" y2="20" stroke="#00f0ff" strokeWidth="0.5" opacity="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-dots)" />
      </svg>

      {/* Orbit Circle Telemetry Visualizer */}
      <div className="absolute top-[35%] left-[75vw] -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] rounded-full border border-[#00f0ff]/[0.03] flex items-center justify-center animate-spin-slow pointer-events-none">
        <div className="w-[740px] h-[740px] rounded-full border border-dashed border-white/[0.03]"></div>
        <div className="w-[580px] h-[580px] rounded-full border border-[#ffaa00]/[0.02]"></div>
        <div className="absolute top-0 right-1/4 w-3 h-3 rounded-full bg-[#00f0ff]/30 blur-xs"></div>
        <div className="absolute bottom-1/3 left-10 w-2 h-2 rounded-full bg-[#39ff14]/20"></div>
      </div>

      {/* Compass Reticles & Corner Indicators */}
      <div id="telemetry-hud-indicators" className="absolute top-20 left-6 right-6 sm:left-16 sm:right-16 hidden sm:flex items-center justify-between gap-4 font-mono text-[9px] sm:text-[10px] tracking-wider pointer-events-none z-10">
        {/* Left HUD Sector */}
        <div id="telemetry-left-sector" className="flex items-center gap-2 sm:gap-3 text-zinc-500">
          <span className="flex h-1.5 w-1.5 sm:h-2 sm:w-2 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00f0ff]/80 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-[#00f0ff]"></span>
          </span>
          <span className="whitespace-nowrap font-semibold text-zinc-400">SYS.TELEMETRY: ONLINE</span>
          <span className="text-zinc-700 hidden lg:inline">|</span>
          <span className="text-zinc-400 hidden lg:inline whitespace-nowrap">LAT: 0.00° EQUATORIAL</span>
          <span className="text-zinc-700 hidden xl:inline">|</span>
          <span className="text-zinc-400 hidden xl:inline whitespace-nowrap">FPS: 60.00</span>
        </div>

        {/* Right HUD Sector */}
        <div id="telemetry-right-sector" className="flex items-center gap-3 sm:gap-4 text-[#00f0ff]/80 tracking-widest justify-end">
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Radio size={9} className="text-[#39ff14] animate-pulse" />
            <span className="whitespace-nowrap font-medium">LIVE RECON</span>
          </div>
          <span className="text-zinc-600 hidden md:inline">//</span>
          <span className="text-zinc-300 font-bold hidden md:inline whitespace-nowrap">{systemTime || "2026.06.09 13:08:25 UTC"}</span>
        </div>
      </div>

      {/* Orbital Mechanics Flight data bottom bar */}
      <div className="absolute bottom-6 left-16 font-mono text-[9px] text-zinc-500 tracking-wider hidden min-[1400px]:flex items-center gap-12 z-[5]">
        <div className="flex flex-col gap-0.5">
          <span className="text-zinc-600 font-semibold uppercase">Sensor Range Vector</span>
          <span className="text-zinc-300 font-medium">SYS.RANGE_LIMIT_E.381</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-zinc-600 font-semibold uppercase">Global Delta V</span>
          <span className="text-zinc-300 font-medium">+104.2 m/s [ATMOSPHERE STRESS]</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-zinc-600 font-semibold uppercase">Carbon Sink Gain</span>
          <span className="text-zinc-300 font-medium">FEEDBACK_LOOPS_ACTIVE [WARNING]</span>
        </div>
      </div>

      {/* NASA Mission Control Countdown Timer in Left Margin */}
      <div className="absolute top-[280px] left-8 border-l border-[#ffaa00]/30 pl-4 py-2 flex flex-col gap-1.5 pointer-events-auto hidden min-[1680px]:flex z-[5]">
        <div className="flex items-center gap-2 font-mono text-[10px] text-[#ffaa00] tracking-widest font-bold">
          <ShieldAlert size={12} className="animate-pulse" />
          <span>ATMOSPHERE LIMIT DECAY</span>
        </div>
        <div className="flex items-baseline gap-1.5 font-mono text-zinc-300 font-medium">
          <span className="text-2xl font-bold tracking-tight text-white">{riskCountdown.years}y</span>
          <span className="text-xl text-zinc-400">{String(riskCountdown.days).padStart(3, "0")}d</span>
          <span className="text-lg text-zinc-500">{String(riskCountdown.hours).padStart(2, "0")}h</span>
          <span className="text-sm text-zinc-600">{String(riskCountdown.minutes).padStart(2, "0")}m</span>
          <span className="text-xs text-[#ff3b30] animate-pulse">{String(riskCountdown.seconds).padStart(2, "0")}s</span>
        </div>
        <div className="text-[10px] font-mono text-zinc-500 max-w-[200px] leading-relaxed">
          ESTIMATED TIME REMAINING UNTIL THE CARBON BUDGET EXCEEDS THE GLOBAL TARGET TEMPERATURE (1.5°C SHIELD BREAK).
        </div>
      </div>

      {/* Crosshair indicators representing space telemetry targeting */}
      <div className="absolute top-1/4 left-1/4 w-8 h-8 pointer-events-none opacity-20">
        <div className="absolute top-0 left-4 w-[1px] h-8 bg-[#00f0ff]"></div>
        <div className="absolute top-4 left-0 w-8 h-[1px] bg-[#00f0ff]"></div>
        <span className="absolute top-4 left-5 text-[8px] font-mono text-[#00f0ff]">+RECON-3</span>
      </div>
      <div className="absolute bottom-1/4 left-[68vw] w-8 h-8 pointer-events-none opacity-25">
        <div className="absolute top-0 left-4 w-[1px] h-8 bg-[#39ff14]"></div>
        <div className="absolute top-4 left-0 w-8 h-[1px] bg-[#39ff14]"></div>
        <span className="absolute top-4 left-5 text-[8px] font-mono text-[#39ff14]">+RECON-8</span>
      </div>
    </div>
  );
});
