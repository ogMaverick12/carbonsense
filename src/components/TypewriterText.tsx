import React, { useState, useEffect } from "react";
import { motion } from "motion/react";

interface TypewriterTextProps {
  text: string;
  speed?: number; // Milliseconds per character
  delay?: number; // Delay before typing starts
  className?: string;
  cursorColor?: string;
  showCursor?: boolean;
  onComplete?: () => void;
}

export function TypewriterText({
  text,
  speed = 30,
  delay = 0,
  className = "",
  cursorColor = "#00f0ff",
  showCursor = true,
  onComplete,
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);

  // Handle delay before typing starts
  useEffect(() => {
    const startTimeout = setTimeout(() => {
      setIsStarted(true);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [delay]);

  useEffect(() => {
    if (!isStarted) return;
    
    // Reset displayed text on text change
    setDisplayedText("");
    setCurrentIndex(0);
  }, [text, isStarted]);

  useEffect(() => {
    if (!isStarted) return;
    if (currentIndex >= text.length) {
      if (onComplete) onComplete();
      return;
    }

    const nextChar = text[currentIndex];
    const timer = setTimeout(() => {
      setDisplayedText((prev) => prev + nextChar);
      setCurrentIndex((prev) => prev + 1);

      // Play soft tactile mechanical keyboard typing sounds occasionally
      if (currentIndex % 2 === 0) {
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            const ctx = new AudioContextClass();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            // Generate mechanical keystroke click
            osc.type = "sine";
            const pitch = 1400 + Math.random() * 600;
            osc.frequency.setValueAtTime(pitch, ctx.currentTime);
            gain.gain.setValueAtTime(0.003, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.02);
            
            osc.start();
            osc.stop(ctx.currentTime + 0.03);
          }
        } catch (_) {}
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [text, currentIndex, speed, isStarted, onComplete]);

  return (
    <span className={`${className} inline-flex items-center flex-wrap`}>
      <span>{displayedText}</span>
      {showCursor && currentIndex < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 0.6, ease: "steps(2)" }}
          style={{ backgroundColor: cursorColor }}
          className="inline-block w-[6px] h-[11px] ml-0.5 align-middle shadow-[0_0_6px_var(--cursor-color)]"
        />
      )}
    </span>
  );
}
