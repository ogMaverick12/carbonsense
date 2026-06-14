import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LogIn, X, ShieldCheck } from "lucide-react";

interface SignInPromptProps {
  isLoggedIn: boolean;
  onSignInClick: () => void;
}

export function SignInPrompt({ isLoggedIn, onSignInClick }: SignInPromptProps) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem("cs-signin-prompt-dismissed") === "true";
    } catch (_) {
      return false;
    }
  });

  useEffect(() => {
    // Show after 3 seconds if guest and not previously dismissed
    if (isLoggedIn || dismissed) return;
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, [isLoggedIn, dismissed]);

  // Hide if user logs in
  useEffect(() => {
    if (isLoggedIn) setVisible(false);
  }, [isLoggedIn]);

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    try {
      localStorage.setItem("cs-signin-prompt-dismissed", "true");
    } catch (_) {
      // intentional: audio/storage failures are non-fatal; swallowing here is correct
    }
  };

  const handleSignIn = () => {
    setVisible(false);
    onSignInClick();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[140] w-[calc(100%-2rem)] max-w-sm"
          role="status"
          aria-live="polite"
        >
          <div className="relative bg-[#03060c]/95 backdrop-blur-xl border border-[#00f0ff]/20 rounded-2xl p-4 shadow-2xl shadow-black/60 overflow-hidden">
            {/* Top glow line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-[#00f0ff]/50 to-transparent" />

            {/* Dismiss button */}
            <button
              onClick={handleDismiss}
              aria-label="Dismiss sign-in prompt"
              className="absolute top-3 right-3 text-zinc-600 hover:text-zinc-300 transition-colors cursor-pointer focus:outline-none"
            >
              <X size={13} />
            </button>

            <div className="flex items-start gap-3 pr-4">
              <div className="h-9 w-9 rounded-full border border-[#00f0ff]/30 bg-[#00f0ff]/5 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck size={16} className="text-[#00f0ff]" />
              </div>
              <div className="min-w-0">
                <p className="font-mono text-[9px] text-[#00f0ff] uppercase tracking-[0.2em] mb-0.5">
                  Guest Mode Active
                </p>
                <p className="font-mono text-[10px] text-zinc-300 leading-snug">
                  Sign in to sync your data, appear on the{" "}
                  <span className="text-[#39ff14]">Global Leaderboard</span>, and earn a{" "}
                  <span className="text-[#ffaa00]">Carbon Certificate</span>.
                </p>

                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={handleSignIn}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black hover:bg-[#00f0ff] font-mono text-[9px] font-extrabold uppercase tracking-widest rounded-lg transition-all duration-200 cursor-pointer focus:outline-none"
                  >
                    <LogIn size={10} />
                    Sign In with Google
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="font-mono text-[9px] text-zinc-600 hover:text-zinc-400 uppercase tracking-wider transition-colors cursor-pointer focus:outline-none"
                  >
                    Maybe later
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
