import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldAlert, Terminal, Play, CircleAlert, Globe, Server, Check } from "lucide-react";
import { TypewriterText } from "./TypewriterText";
import { getAudioContextClass } from "../lib/audio";

interface MissionBriefingProps {
  onDismiss: () => void;
}

export function MissionBriefing({ onDismiss }: MissionBriefingProps) {
  const [bootStep, setBootStep] = useState(0);
  const [bootLogs, setBootLogs] = useState<string[]>([]);
  const [fullyLoaded, setFullyLoaded] = useState(false);

  const logs = [
    "LOG: Initializing CarbonSensing Satellite Array v1.0.9-beta...",
    "SEC_LINK: Connecting with EU Copernicus Sentinel Atmosphere monitors...",
    "GEODATA: Ground telemetry stations at Mauna Loa online...",
    "GRID: Analyzing atmospheric CO₂ dry air mole fraction coefficient...",
    "WARNING: Peak concentration reading: 423.81 ppm! Critical threshold exceeded.",
    "DECISION: Injecting CarbonSense Real-Time Reconstructor Core parameters...",
    "REST_OK: Stabilization simulation engine initialized. Readout ready."
  ];

  // Progressive terminal boot logs
  useEffect(() => {
    if (bootStep < logs.length) {
      const delay = bootStep === 0 ? 500 : bootStep === 4 ? 900 : 400;
      const t = setTimeout(() => {
        setBootLogs((prev) => [...prev, logs[bootStep]]);
        
        // Play programatic keystroke frequency synthesizer beep sound for each step!
        try {
          const AudioContextClass = getAudioContextClass();
          if (AudioContextClass) {
            const ctx = new AudioContextClass();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            // Short high click frequency beep
            osc.frequency.setValueAtTime(bootStep === 4 ? 900 : 1500, ctx.currentTime);
            gain.gain.setValueAtTime(0.015, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
            
            osc.start();
            osc.stop(ctx.currentTime + 0.06);
          }
        } catch (_) {
          // intentional: audio/storage failures are non-fatal; swallowing here is correct
        }

        setBootStep((s) => s + 1);
      }, delay);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setFullyLoaded(true);
        // Play success tone
        try {
          const AudioContextClass = getAudioContextClass();
          if (AudioContextClass) {
            const ctx = new AudioContextClass();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.type = "sine";
            osc.frequency.setValueAtTime(1000, ctx.currentTime);
            osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.08);
            gain.gain.setValueAtTime(0.02, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
            
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
          }
        } catch (_) {
          // intentional: audio/storage failures are non-fatal; swallowing here is correct
        }
      }, 700);
      return () => clearTimeout(t);
    }
  }, [bootStep]);

  const handleDismissAndSound = () => {
    // Play terminal confirm chime
    try {
      const AudioContextClass = getAudioContextClass();
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.32);
      }
    } catch (_) {
      // intentional: audio/storage failures are non-fatal; swallowing here is correct
    }
    onDismiss();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      {/* Dynamic Cyber Punk Grid Overlays */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,35,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,35,0.2)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-50"></div>
      
      {/* Scanning lines effect typical of CRT screens */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] z-[101]"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="briefing-dialog-title"
        className="w-full max-w-[720px] bg-zinc-950 border border-white/10 rounded px-6 py-7 relative shadow-[0_0_50px_rgba(0,0,0,0.95)] overflow-hidden text-white"
      >
        {/* Corner alignment bracket decors */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white/40"></div>
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-white/40"></div>
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-white/40"></div>
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white/40"></div>
 
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 border border-[#ffaa00]/20 bg-[#ffaa00]/5 text-[#ffaa00]">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="font-mono text-[9px] text-[#ffaa00] font-bold block tracking-widest leading-none" style={{ textTransform: 'uppercase' }}>System Breach Detected</span>
              <h2 id="briefing-dialog-title" className="font-display font-[800] text-lg uppercase tracking-wider text-white mt-1" style={{ textTransform: 'uppercase' }}>Carbon Sense Briefing Terminal</h2>
            </div>
          </div>
          <div className="font-mono text-[9px] text-zinc-500 text-right uppercase tracking-widest hidden sm:block">
            STATION_ID: CLD_MCON_4K<br />
            SEC_LVL: LEVEL_8
          </div>
        </div>

        {/* Terminal Screen Console */}
        <div className="bg-[#020406] border border-zinc-900 p-4 rounded font-mono text-[10px] text-zinc-400 overflow-y-auto max-h-[190px] flex flex-col gap-1.5 leading-relaxed selection:bg-[#00f0ff]/25 scrollbar-thin">
          {bootLogs.map((log, idx) => {
            const isWarning = log.includes("WARNING") || log.includes("Critical");
            const isSec = log.startsWith("SEC_LINK");
            return (
              <div 
                key={idx}
                className={`flex gap-2 ${
                  isWarning ? "text-[#ff3b30]" : isSec ? "text-[#00f0ff]" : "text-zinc-300"
                }`}
              >
                <span className="text-zinc-600 select-none">[{idx.toString().padStart(2, "0")}]</span>
                <span>{log}</span>
              </div>
            );
          })}
          {!fullyLoaded && (
            <div className="flex items-center gap-2 text-zinc-500 animate-pulse mt-0.5">
              <span>&gt; SYSTEM CORE RUNNING COMMS SYNC</span>
              <span className="w-1.5 h-3 bg-zinc-500 animate-blink"></span>
            </div>
          )}
        </div>

        {/* Objectives Box Reveal */}
        <AnimatePresence>
          {fullyLoaded && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-5 space-y-4"
            >
              <div className="bg-white/[0.01] border border-white/5 p-4 rounded-md">
                <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-semibold block mb-3" style={{ textTransform: 'uppercase' }}>Mission Objectives Recon</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1.5 p-2 bg-black/50 border border-white/[0.03] rounded">
                    <div className="flex items-center gap-1.5 font-bold font-mono text-[10px] text-[#39ff14] uppercase" style={{ textTransform: 'uppercase' }}>
                      <Server className="w-3.5 h-3.5" />
                      <span>01. Overrule</span>
                    </div>
                    <p className="text-[9.5px] leading-relaxed text-zinc-400 font-sans">
                      Toggle ecological choices inside the cockpit panel to track projected carbon offsets.
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5 p-2 bg-black/50 border border-white/[0.03] rounded">
                    <div className="flex items-center gap-1.5 font-bold font-mono text-[10px] text-[#00f0ff] uppercase" style={{ textTransform: 'uppercase' }}>
                      <Globe className="w-3.5 h-3.5" />
                      <span>02. Diagnose</span>
                    </div>
                    <p className="text-[9.5px] leading-relaxed text-zinc-400 font-sans">
                      Inspect carbon emissions directly on Earth by switching spectral detectors and hovering regions.
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5 p-2 bg-black/50 border border-white/[0.03] rounded">
                    <div className="flex items-center gap-1.5 font-bold font-mono text-[10px] text-[#ffaa00] uppercase" style={{ textTransform: 'uppercase' }}>
                      <Check className="w-3.5 h-3.5" />
                      <span>03. Compile</span>
                    </div>
                    <p className="text-[9.5px] leading-relaxed text-zinc-400 font-sans">
                      Verify offsets and construct global certificates under Milestones to prove deficit mitigation.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action trigger button */}
              <div className="flex items-center justify-between gap-4 pt-1">
                <div className="flex items-center gap-2 font-mono text-[9px] text-zinc-500 tracking-wider" style={{ textTransform: 'uppercase' }}>
                  <div className="w-2 h-2 rounded-full bg-[#39ff14] animate-pulse"></div>
                  <span>Link Ready Console Established</span>
                </div>
                <button
                  id="briefing-terminal-dismiss-btn"
                  onClick={handleDismissAndSound}
                  aria-label="Dismiss mission briefing"
                  className="py-3 px-6 rounded-none font-mono text-[10px] tracking-[0.3em] font-bold uppercase transition-all duration-300 cursor-pointer text-center relative overflow-hidden bg-white text-black hover:bg-[#39ff14] hover:text-black hover:shadow-[0_0_20px_rgba(57,255,20,0.4)] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a3e635]"
                  style={{ textTransform: 'uppercase' }}
                >
                  <span>Override Critical Decision Panel</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
