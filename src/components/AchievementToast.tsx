import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Award, CheckCircle2, ChevronRight, X, Sparkles, AlertCircle } from "lucide-react";
import { getAudioContextClass } from "../lib/audio";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  metric: string;
  badgeColor: string;
  threshold: number;
}

interface AchievementToastProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export function AchievementToast({ achievement, onClose }: AchievementToastProps) {
  // Synthesize cinematic futuristic milestone award sound
  useEffect(() => {
    if (achievement) {
      try {
        const AudioContextClass = getAudioContextClass();
        if (AudioContextClass) {
          const ctx = new AudioContextClass();
          
          // Primary synth tone
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gainNode = ctx.createGain();

          osc1.connect(gainNode);
          osc2.connect(gainNode);
          gainNode.connect(ctx.destination);

          osc1.type = "sine";
          osc1.frequency.setValueAtTime(329.63, ctx.currentTime); // E4
          osc1.frequency.setValueAtTime(440.00, ctx.currentTime + 0.12); // A4
          osc1.frequency.setValueAtTime(554.37, ctx.currentTime + 0.24); // C#5
          osc1.frequency.setValueAtTime(659.25, ctx.currentTime + 0.36); // E5

          osc2.type = "triangle";
          osc2.frequency.setValueAtTime(164.81, ctx.currentTime); // E3
          osc2.frequency.setValueAtTime(220.00, ctx.currentTime + 0.12); // A3
          osc2.frequency.setValueAtTime(277.18, ctx.currentTime + 0.24); // C#4
          osc2.frequency.setValueAtTime(329.63, ctx.currentTime + 0.36); // E4

          gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.04, ctx.currentTime + 0.1);
          gainNode.gain.setValueAtTime(0.04, ctx.currentTime + 0.4);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

          osc1.start();
          osc2.start();

          osc1.stop(ctx.currentTime + 1.3);
          osc2.stop(ctx.currentTime + 1.3);

          // Atmospheric hum/reverb simulation using brief noise filter
          const bufferSize = ctx.sampleRate * 1.5;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }

          const noise = ctx.createBufferSource();
          noise.buffer = buffer;

          const filter = ctx.createBiquadFilter();
          filter.type = "lowpass";
          filter.frequency.setValueAtTime(600, ctx.currentTime);
          filter.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 1.5);

          const noiseGain = ctx.createGain();
          noiseGain.gain.setValueAtTime(0.015, ctx.currentTime);
          noiseGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.5);

          noise.connect(filter);
          filter.connect(noiseGain);
          noiseGain.connect(ctx.destination);

          noise.start();
          noise.stop(ctx.currentTime + 1.6);
        }
      } catch (_) {
        // intentional: audio/storage failures are non-fatal; swallowing here is correct
      }
    }
  }, [achievement]);

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.9, x: "-50%" }}
          animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
          exit={{ opacity: 0, y: 50, scale: 0.95, x: "-50%" }}
          transition={{ type: "spring", damping: 25, stiffness: 180 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[90] w-[90%] max-w-[480px] pointer-events-auto selection:bg-[#39ff14]/20"
        >
          {/* Main Container */}
          <div className="relative bg-zinc-950/95 border border-white/10 rounded-lg p-5 shadow-[0_15px_50px_rgba(35,255,100,0.12)] backdrop-blur-xl overflow-hidden group">
            {/* Corner cybernetic decors */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#39ff14]/70"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#39ff14]/70"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#39ff14]/70"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#39ff14]/70"></div>

            {/* Background flashing glow halo */}
            <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-[#39ff14]/10 rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>

            <div className="flex items-start gap-4">
              {/* Animated Glowing Icon Wrapper */}
              <div className="p-3 bg-[#39ff14]/10 border border-[#39ff14]/30 rounded text-[#39ff14] relative overflow-hidden flex-shrink-0 flex items-center justify-center">
                <Award size={20} className="relative z-10" />
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border border-dashed border-[#39ff14]/50 rounded-full scale-[1.4]"
                />
              </div>

              {/* Information Body */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 font-mono text-[9px] text-[#39ff14] font-bold tracking-[0.2em] uppercase" style={{ textTransform: 'uppercase' }}>
                  <Sparkles size={10} className="animate-spin-slow" />
                  <span>Mission Achieved</span>
                </div>
                <h3 className="font-display font-[800] text-sm text-white uppercase tracking-wider leading-tight mt-0.5 select-none truncate">
                  {achievement.title}
                </h3>
                <p className="text-zinc-400 font-sans text-xs font-light leading-relaxed mt-1">
                  {achievement.description}
                </p>

                {/* Metric Display */}
                <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2 font-mono text-[9px]">
                  <span className="text-zinc-500 uppercase" style={{ textTransform: 'uppercase' }}>Telemetry Delta:</span>
                  <span className="text-[#39ff14] font-extrabold flex items-center gap-1">
                    <CheckCircle2 size={10} />
                    {achievement.metric}
                  </span>
                </div>
              </div>

              {/* Dismiss Button */}
              <button
                onClick={onClose}
                aria-label="Dismiss Achievement Notification"
                className="p-1 text-zinc-500 hover:text-white hover:bg-white/5 rounded transition-all duration-300 cursor-pointer self-start"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
