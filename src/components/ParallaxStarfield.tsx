import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

export function ParallaxStarfield() {
  const [stars, setStars] = useState<{ x: number; y: number; size: number; opacity: number }[]>([]);
  const [constellations, setConstellations] = useState<{ x: number; y: number; r: number }[]>([]);

  // Framer Motion Springs for silky-smooth lag/interpolated movement (GSAP level feel)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 40, stiffness: 150, mass: 1 };
  const starXDeep = useSpring(mouseX, springConfig);
  const starYDeep = useSpring(mouseY, springConfig);

  const starXMid = useSpring(useMotionValue(0), springConfig);
  const starYMid = useSpring(useMotionValue(0), springConfig);

  const starXFore = useSpring(useMotionValue(0), springConfig);
  const starYFore = useSpring(useMotionValue(0), springConfig);

  useEffect(() => {
    // Generate static stars once on mount to prevent layout shifts
    const generatedStars = Array.from({ length: 120 }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.6 + 0.2,
    }));
    setStars(generatedStars);

    const generatedConstellations = Array.from({ length: 8 }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      r: Math.random() * 40 + 20,
    }));
    setConstellations(generatedConstellations);

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      // Get normal coords (-0.5 to 0.5)
      const xNorm = (e.clientX / innerWidth) - 0.5;
      const yNorm = (e.clientY / innerHeight) - 0.5;

      // Map to pixel shift amounts at different depths
      mouseX.set(xNorm * -15);
      mouseY.set(yNorm * -15);

      // Deep, Mid, Fore relations
      const midXVal = xNorm * -35;
      const midYVal = yNorm * -35;
      const foreXVal = xNorm * -60;
      const foreYVal = yNorm * -60;

      // Update inner motion values
      starXMid.set(midXVal);
      starYMid.set(midYVal);
      starXFore.set(foreXVal);
      starYFore.set(foreYVal);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* LAYER 1: Deep Stars (Very small, moves slowly) */}
      <motion.div
        className="absolute inset-[-10%] opacity-40"
        style={{
          x: starXDeep,
          y: starYDeep,
        }}
      >
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {stars.slice(0, 50).map((star, idx) => (
            <circle
              key={`deep-${idx}`}
              cx={`${star.x}%`}
              cy={`${star.y}%`}
              r={star.size * 0.6}
              fill="#ffffff"
              opacity={star.opacity}
            />
          ))}
        </svg>
      </motion.div>

      {/* LAYER 2: Midground Stars (Medium size, responsive movement) */}
      <motion.div
        className="absolute inset-[-20%] opacity-60"
        style={{
          x: starXMid,
          y: starYMid,
        }}
      >
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {stars.slice(50, 100).map((star, idx) => (
            <circle
              key={`mid-${idx}`}
              cx={`${star.x}%`}
              cy={`${star.y}%`}
              r={star.size * 1.0}
              fill="#00f0ff"
              opacity={star.opacity * 0.7}
              className={idx % 4 === 0 ? "animate-pulse" : ""}
              style={{ animationDuration: `${2 + (idx % 3)}s` }}
            />
          ))}
        </svg>
      </motion.div>

      {/* LAYER 3: Foreground Constellations and Dust Sparkles */}
      <motion.div
        className="absolute inset-[-30%] opacity-30"
        style={{
          x: starXFore,
          y: starYFore,
        }}
      >
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          {/* Subtle connecting lines */}
          {constellations.map((constell, idx) => (
            <g key={`con-${idx}`}>
              <circle
                cx={`${constell.x}%`}
                cy={`${constell.y}%`}
                r="1.5"
                fill="#39ff14"
                className="animate-pulse"
                style={{ animationDuration: "1.5s" }}
              />
              <circle
                cx={`${constell.x}%`}
                cy={`${constell.y}%`}
                r={constell.r}
                fill="none"
                stroke="#00f0ff"
                strokeWidth="0.5"
                strokeDasharray="4 8"
                opacity="0.1"
              />
            </g>
          ))}
          {stars.slice(100).map((star, idx) => (
            <circle
              key={`fore-${idx}`}
              cx={`${star.x}%`}
              cy={`${star.y}%`}
              r={star.size * 1.4}
              fill="#ffffff"
              opacity={star.opacity * 1.2}
              className="animate-pulse"
              style={{ animationDuration: "1s" }}
            />
          ))}
        </svg>
      </motion.div>
    </div>
  );
}
