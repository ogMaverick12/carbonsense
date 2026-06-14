import React from "react";
import { Orbit, Compass, Activity, ShieldAlert, Sparkles, AlertCircle, Award, BookOpen } from "lucide-react";
import { motion } from "motion/react";
import { getAudioContextClass } from "../lib/audio";

interface CommandDockProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  carbonReduction: number;
  totalBaseline: number;
}

export function CommandDock({ activeTab, onTabChange, carbonReduction, totalBaseline }: CommandDockProps) {
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: Orbit },
    { id: "insights", label: "Insights", icon: Compass },
    { id: "actions", label: "Actions", icon: Activity },
    { id: "progress", label: "Progress", icon: ShieldAlert },
    { id: "certificate", label: "Certificate", icon: Award },
    { id: "methodology", label: "Methodology", icon: BookOpen },
  ];

  const currentEmission = totalBaseline - carbonReduction;

  // Web Audio cockpit tactile response sounds
  const playTabClickSound = () => {
    try {
      const AudioContextClass = getAudioContextClass();
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = "triangle";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (_) {
      // intentional: audio/storage failures are non-fatal; swallowing here is correct
    }
  };

  const playHoverTick = () => {
    try {
      const AudioContextClass = getAudioContextClass();
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(2000, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.003, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.02);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.03);
    } catch (_) {
      // intentional: audio/storage failures are non-fatal; swallowing here is correct
    }
  };

  return (
    <div id="command-dock-wrapper" className="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-auto max-w-[95vw] sm:max-w-none w-auto">
      <div className="bg-white/[0.03] hover:bg-white/[0.05] backdrop-blur-xl border border-white/10 rounded-full px-2 sm:px-4 py-1.5 sm:py-2 flex items-center gap-2 sm:gap-6 shadow-[0_15px_40px_rgba(0,0,0,0.8)] transition-colors duration-500 relative max-w-full overflow-x-auto scrollbar-hide md:overflow-visible">
        {/* Brand Logo with tiny rotating indicator - hidden on small mobile to maximize space */}
        <div className="hidden md:flex items-center gap-2 pl-2">
          <div className="relative">
            <div className="w-4 h-4 rounded-full border border-white flex items-center justify-center rotate-45">
              <div className="w-1.5 h-1.5 bg-white"></div>
            </div>
          </div>
          <span className="font-display font-extrabold text-white tracking-[0.25em] text-[11px] uppercase select-none" style={{ textTransform: 'uppercase' }}>
            Carbon<span className="opacity-50">Sense</span>
          </span>
        </div>

        {/* Divider - hidden on small mobile */}
        <span className="hidden md:block h-4 w-[1px] bg-white/10"></span>

        {/* Floating Navigation Links */}
        <nav className="flex items-center gap-0.5 sm:gap-1">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-${tab.id}`}
                onClick={() => {
                  playTabClickSound();
                  onTabChange(tab.id);
                }}
                onMouseEnter={playHoverTick}
                aria-label={`Navigate to the ${tab.label.toLowerCase()} screen section`}
                aria-current={isActive ? "page" : undefined}
                className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-full font-sans text-[9px] sm:text-[10px] tracking-[0.1em] sm:tracking-[0.2em] uppercase transition-all duration-300 relative group cursor-pointer shrink-0 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a3e635] focus:ring-2 focus:ring-white/40 focus:ring-offset-1 focus:ring-offset-black/20 ${
                  isActive
                    ? "text-black font-extrabold"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabBackground"
                    className="absolute inset-0 bg-white rounded-full z-0 shadow-[0_4px_12px_rgba(255,255,255,0.15)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="flex items-center gap-1 sm:gap-1.5 relative z-10">
                  <IconComponent size={10} className={isActive ? "text-black" : "text-zinc-500 group-hover:text-zinc-300"} />
                  <span className="hidden sm:inline uppercase" style={{ textTransform: 'uppercase' }}>{tab.label}</span>
                </span>
              </button>
            );
          })}
        </nav>

        {/* Divider - hidden on smaller devices */}
        <span className="hidden xl:block h-4 w-[1px] bg-white/10"></span>

        {/* Floating Live Telemetry Counter */}
        <div className="hidden xl:flex items-center gap-3 font-mono text-[9px] text-zinc-400 pr-2">
          <div className="text-right">
            <span className="text-zinc-500 uppercase block scale-90 origin-right text-[7px] tracking-widest font-light" style={{ textTransform: 'uppercase' }}>Projected Footprint</span>
            <span className="font-bold text-white text-xs">{(currentEmission / 1000).toFixed(2)}t <span className="text-zinc-500 text-[8px] font-normal">CO₂e/yr</span></span>
          </div>
          <div className="bg-white/5 w-12 h-1 rounded-full overflow-hidden relative border border-white/10">
            <div 
              className="h-full bg-white transition-all duration-500 rounded-full"
              style={{ width: `${Math.min(100, (currentEmission / totalBaseline) * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
