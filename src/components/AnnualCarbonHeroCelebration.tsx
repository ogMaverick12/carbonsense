import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Award, Sparkles, ShieldCheck, Check, Star, Zap, Flame } from "lucide-react";
import confetti from "canvas-confetti";
import { getAudioContextClass } from "../lib/audio";

interface AnnualCarbonHeroProps {
  isOpen: boolean;
  onClose: () => void;
  carbonReductionKg: number;
}

export function AnnualCarbonHeroCelebration({ isOpen, onClose, carbonReductionKg }: AnnualCarbonHeroProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowContent(true);

      // 1. Fire premium eco-green and golden organic confetti shower
      try {
        const duration = 3 * 1000;
        const end = Date.now() + duration;

        const frame = () => {
          confetti({
            particleCount: 4,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ["#39ff14", "#ffee00", "#00f0ff", "#ffffff"]
          });
          confetti({
            particleCount: 4,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ["#39ff14", "#ffee00", "#00f0ff", "#ffffff"]
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        };
        frame();
      } catch (_) {
        // intentional: audio/storage failures are non-fatal; swallowing here is correct
      }

      // 2. Synthesize majestic futuristic cockpit triumph fanfare chord sequence
      try {
        const AudioContextClass = getAudioContextClass();
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          const playNote = (freq: number, start: number, duration: number, type: OscillatorType = "sine") => {
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            osc.connect(gainNode);
            gainNode.connect(ctx.destination);

            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
            
            gainNode.gain.setValueAtTime(0.001, ctx.currentTime + start);
            gainNode.gain.exponentialRampToValueAtTime(0.04, ctx.currentTime + start + 0.05);
            gainNode.gain.setValueAtTime(0.04, ctx.currentTime + start + duration - 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);

            osc.start(ctx.currentTime + start);
            osc.stop(ctx.currentTime + start + duration);
          };

          // Rising golden chord triad fanfare
          playNote(261.63, 0.0, 0.4, "sine");     // C4
          playNote(329.63, 0.15, 0.4, "sine");    // E4
          playNote(392.00, 0.3, 0.4, "sine");     // G4
          playNote(523.25, 0.45, 1.2, "sine");    // C5
          playNote(659.25, 0.6, 1.0, "triangle"); // E5 extra harmonic shimmer
          playNote(783.99, 0.75, 0.82, "sine");   // G5 high crown sweep
        }
      } catch (_) {
        // intentional: audio/storage failures are non-fatal; swallowing here is correct
      }
    } else {
      setShowContent(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {showContent && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Immersive blur-heavy background shield overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
          />

          {/* Core Sci-Fi Celebrator Hologram Block */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 30 }}
            transition={{ type: "spring", damping: 20, stiffness: 120 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="carbon-hero-dialog-title"
            className="relative bg-zinc-950/90 border border-amber-500/30 rounded-2xl p-6 sm:p-10 max-w-lg w-full text-center shadow-[0_0_80px_rgba(255,215,0,0.18)] backdrop-blur-2xl overflow-hidden"
          >
            {/* Cybernetic UI target guides */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-amber-400"></div>
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-amber-400"></div>
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-amber-400"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-amber-400"></div>

            {/* Glowing Golden circular grid system */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-amber-500/5 pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-dashed border-amber-500/10 pointer-events-none animate-spin-slow"></div>

            {/* Icon Group */}
            <div className="relative mb-6 flex justify-center">
              {/* Outer halo ripple */}
              <motion.div 
                animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 m-auto w-24 h-24 rounded-full bg-amber-500/20 blur-xl"
              />
              
              {/* Spinning star wreath */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute w-28 h-28 border border-dashed border-amber-500/30 rounded-full flex items-center justify-center"
              >
                {[...Array(6)].map((_, i) => (
                  <div 
                    key={i} 
                    className="absolute text-[10px] text-amber-400"
                    style={{ transform: `rotate(${i * 60}deg) translateY(-54px)` }}
                  >
                    ★
                  </div>
                ))}
              </motion.div>

              {/* Central Premium Trophy Icon */}
              <motion.div
                initial={{ rotate: -15, scale: 0.5 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", delay: 0.1, stiffness: 200, damping: 10 }}
                className="relative z-10 w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 p-0.5 shadow-[0_0_30px_rgba(245,158,11,0.5)] border border-amber-200"
              >
                <div className="w-full h-full bg-zinc-950 rounded-[14px] flex items-center justify-center text-amber-400">
                  <Award size={36} className="animate-pulse" />
                </div>
              </motion.div>
            </div>

            {/* Title / Description */}
            <div className="relative z-10">
              <span className="font-mono text-[9px] text-amber-400 font-extrabold tracking-[0.3em] uppercase flex items-center justify-center gap-1.5 justify-center mb-1 bg-amber-500/10 border border-amber-500/15 py-1 px-3 rounded-full w-max mx-auto" style={{ textTransform: 'uppercase' }}>
                <Sparkles size={10} className="text-amber-300" />
                <span>CO₂ Savings Milestone Cleared</span>
              </span>

              <h2 id="carbon-hero-dialog-title" className="font-display font-[900] text-2xl sm:text-3xl text-white uppercase tracking-wider leading-tight mt-3" style={{ textTransform: 'uppercase' }}>
                Annual Carbon Hero
              </h2>
              
              <div className="w-12 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto my-3"></div>

              <p className="text-zinc-300 font-sans text-xs sm:text-[13px] font-light leading-relaxed max-w-md mx-auto">
                Congratulations Officer! Your cumulative active switches prevent a calculated baseline footprint of over <strong className="text-amber-300 font-medium font-mono">3,500 kg-CO₂e/yr</strong>. Your stewardship directly relieves resource limits.
              </p>
            </div>

            {/* Performance Stats Overlay Cards */}
            <div className="grid grid-cols-2 gap-3 mt-6 relative z-10 font-mono">
              <div className="bg-zinc-900/60 border border-white/5 rounded-lg p-3 text-left">
                <span className="text-[7.5px] text-zinc-500 block uppercase">Captured Reduction</span>
                <span className="text-lg font-bold text-[#39ff14]">{carbonReductionKg.toLocaleString()} kg</span>
                <span className="text-[7px] text-zinc-600 block mt-0.5 uppercase">Annual target cleared</span>
              </div>
              <div className="bg-zinc-900/60 border border-white/5 rounded-lg p-3 text-left">
                <span className="text-[7.5px] text-zinc-500 block uppercase">365-Day Quotient</span>
                <span className="text-lg font-bold text-amber-400">{(carbonReductionKg / 1000).toFixed(2)}t</span>
                <span className="text-[7px] text-zinc-600 block mt-0.5 uppercase">Carbon equivalents</span>
              </div>
            </div>

            {/* Action Affirmation Button */}
            <div className="mt-8 relative z-10">
              <button
                onClick={onClose}
                className="w-full py-4 rounded-md font-mono text-[10px] tracking-[0.3em] font-extrabold uppercase transition-all duration-300 cursor-pointer bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 border border-amber-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Check size={12} strokeWidth={3} />
                <span>Resume Mission Flights</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
