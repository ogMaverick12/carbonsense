import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Rocket, SkipForward, Check, User } from "lucide-react";

interface OnboardingModalProps {
  isOpen: boolean;
  suggestedName: string;
  onConfirm: (callsign: string) => void;
  onSkip: () => void;
}

export function OnboardingModal({ isOpen, suggestedName, onConfirm, onSkip }: OnboardingModalProps) {
  const [callsign, setCallsign] = useState(suggestedName);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Pre-fill with suggested name whenever it changes
  useEffect(() => {
    setCallsign(suggestedName);
  }, [suggestedName]);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleConfirm = () => {
    const trimmed = callsign.trim();
    if (!trimmed) {
      setError("Callsign cannot be empty.");
      return;
    }
    if (trimmed.length < 2) {
      setError("Callsign must be at least 2 characters.");
      return;
    }
    if (trimmed.length > 32) {
      setError("Callsign must be 32 characters or fewer.");
      return;
    }
    setError("");
    onConfirm(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleConfirm();
    if (e.key === "Escape") onSkip();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="onboarding-title"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onSkip}
          />

          {/* Modal Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="relative w-full max-w-md bg-[#03060c] border border-[#00f0ff]/20 rounded-2xl p-8 shadow-2xl shadow-black/60 z-10 overflow-hidden"
          >
            {/* Glow accent */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-[#00f0ff]/60 to-transparent" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-16 bg-[#00f0ff]/5 blur-2xl rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-full border border-[#00f0ff]/30 bg-[#00f0ff]/5 flex items-center justify-center shrink-0">
                <Rocket size={18} className="text-[#00f0ff]" />
              </div>
              <div>
                <p className="font-mono text-[9px] text-[#00f0ff] uppercase tracking-[0.25em]">
                  Mission Auth Verified
                </p>
                <h2
                  id="onboarding-title"
                  className="font-display font-extrabold text-white text-lg uppercase leading-tight tracking-tight"
                >
                  Welcome, Pilot
                </h2>
              </div>
            </div>

            {/* Body */}
            <p className="font-mono text-[10px] text-zinc-400 leading-relaxed mb-6">
              You've been cleared for entry into Earth Mission Control. Set your
              pilot callsign — this is how you'll appear on the{" "}
              <span className="text-[#00f0ff]">Global Leaderboard</span> and your{" "}
              <span className="text-[#39ff14]">Carbon Certificate</span>.
            </p>

            {/* Input */}
            <div className="space-y-1.5 mb-6">
              <label
                htmlFor="onboarding-callsign"
                className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest flex items-center gap-1.5"
              >
                <User size={9} />
                Pilot Callsign
              </label>
              <input
                ref={inputRef}
                id="onboarding-callsign"
                type="text"
                value={callsign}
                onChange={(e) => {
                  setCallsign(e.target.value);
                  setError("");
                }}
                onKeyDown={handleKeyDown}
                maxLength={32}
                placeholder="e.g. MAVERICK-12"
                className={`w-full bg-black border rounded-lg px-3.5 py-2.5 font-mono text-sm uppercase tracking-wider text-white placeholder:text-zinc-700 focus:outline-none focus:ring-1 transition-colors duration-200 ${
                  error
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/30"
                    : "border-white/10 focus:border-[#00f0ff] focus:ring-[#00f0ff]/20"
                }`}
                aria-invalid={!!error}
                aria-describedby={error ? "onboarding-error" : undefined}
              />
              <div className="flex items-center justify-between">
                {error ? (
                  <p
                    id="onboarding-error"
                    className="font-mono text-[8.5px] text-red-400 uppercase tracking-wide"
                  >
                    ⚠ {error}
                  </p>
                ) : (
                  <p className="font-mono text-[8px] text-zinc-600 uppercase">
                    2–32 characters · shown publicly
                  </p>
                )}
                <span className="font-mono text-[8px] text-zinc-700">
                  {callsign.length}/32
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button
                onClick={handleConfirm}
                className="w-full py-3 bg-white text-black hover:bg-[#00f0ff] font-mono text-[10px] tracking-widest font-extrabold uppercase transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00f0ff]"
              >
                <Check size={12} />
                Confirm Callsign & Launch
              </button>

              <button
                onClick={onSkip}
                className="w-full py-2.5 bg-transparent text-zinc-500 hover:text-zinc-300 font-mono text-[9px] tracking-widest uppercase transition-colors duration-200 cursor-pointer flex items-center justify-center gap-1.5 focus:outline-none"
              >
                <SkipForward size={10} />
                Skip for now — use Google name
              </button>
            </div>

            {/* Footer note */}
            <p className="mt-4 font-mono text-[8px] text-zinc-700 text-center leading-relaxed">
              You can always change your callsign later in{" "}
              <span className="text-zinc-500">Pilot Profile → Retune Parameters</span>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
