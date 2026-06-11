import React, { useState, useEffect, useMemo, useCallback } from "react";
import { TelemetryOverlay } from "./components/TelemetryOverlay";
import { CommandDock } from "./components/CommandDock";
import { CarbonCalculator } from "./components/CarbonCalculator";
import { TelemetryInsights } from "./components/TelemetryInsights";
import { TelemetryProgress } from "./components/TelemetryProgress";
import { EarthVisualizer } from "./components/EarthVisualizer";
import { ParallaxStarfield } from "./components/ParallaxStarfield";
import { MissionBriefing } from "./components/MissionBriefing";
import { AchievementToast, Achievement } from "./components/AchievementToast";
import { PilotProfile } from "./components/PilotProfile";
import { AnnualCarbonHeroCelebration } from "./components/AnnualCarbonHeroCelebration";
import { ActivityLogger } from "./components/ActivityLogger";
import { carbonSenseStore } from "./lib/store";
import { initialHabits } from "./data";
import { auth } from "./lib/firebase";
import { Orbit, Compass, Cpu, AlertTriangle, ShieldCheck, User, Settings, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { VerifiedCertificate } from "./components/VerifiedCertificate";
import { OnboardingModal } from "./components/OnboardingModal";
import { SignInPrompt } from "./components/SignInPrompt";

// Lazy loaded heavy components for optimized Lighthouse scores
const CertificatePage = React.lazy(() =>
  import("./components/CertificatePage").then((module) => ({ default: module.CertificatePage }))
);
const CarbonMethodology = React.lazy(() =>
  import("./components/CarbonMethodology").then((module) => ({ default: module.CarbonMethodology }))
);
const GlobalLeaderboard = React.lazy(() =>
  import("./components/GlobalLeaderboard").then((module) => ({ default: module.GlobalLeaderboard }))
);

const LoadingScreen = () => (
  <div className="flex flex-col items-center justify-center p-12 text-zinc-400 font-mono text-[10px] tracking-[0.2em] gap-2 animate-pulse w-full">
    <div className="w-4 h-4 rounded-full border border-[#00f0ff] border-t-transparent animate-spin"></div>
    <span>Compliance Stream Load...</span>
  </div>
);

const MILESTONES: Achievement[] = [
  {
    id: "equilibrium",
    title: "Emission Equilibrium Achieved",
    description: "You successfully overruled high-carbon baseline paths to bring projected carbon outputs down under standard safety quotas.",
    metric: "Cap Parity Matched",
    badgeColor: "#39ff14",
    threshold: 1500,
  },
  {
    id: "transport-offset",
    title: "Zero-Petrol Sector Cleared",
    description: "Sustained lifestyle shifting into clean battery / kinetic charging overrules logged. Low levels of CO₂ tracking successfully.",
    metric: "Zero Petrol Delta",
    badgeColor: "#00f0ff",
    threshold: 3400,
  },
  {
    id: "biomass-synced",
    title: "Methane Sink Active",
    description: "Full nutritional biomass transformation applied. Mass feedstock methane loads minimized over major agricultural coordinate blocks.",
    metric: "Methane Corridor Active",
    badgeColor: "#ffaa00",
    threshold: 5000,
  },
  {
    id: "grid-desat",
    title: "Grid Desaturation Master",
    description: "Complete net-zero microgrid autonomy verified. Solid-state grid transitions online. Atmospheric risk minimized.",
    metric: "Net Autonomy Active",
    badgeColor: "#39ff14",
    threshold: 8000,
  }
];

// Progressive stagger animation configurations for impeccable editorial entrance
const mainContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
};

const mainChildVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const cockpitSplitVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const cockpitChildVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

// Custom hook for keyboard/Tab navigation over habits toggles
function useHabitsKeyboardNavigation(
  habits: typeof initialHabits,
  onToggleHabit: (id: string) => void,
  activeTab: string
) {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  useEffect(() => {
    if (activeTab !== "dashboard") {
      setFocusedIndex(-1);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target?.tagName === "INPUT" || 
        target?.tagName === "TEXTAREA" || 
        target?.isContentEditable
      ) {
        return;
      }

      const key = e.key;
      if (key === "Tab") {
        if (e.shiftKey) {
          if (focusedIndex > 0) {
            e.preventDefault();
            const nextIdx = focusedIndex - 1;
            setFocusedIndex(nextIdx);
            const el = document.getElementById(`switch-${habits[nextIdx].id}`);
            el?.focus();
          } else if (focusedIndex === 0) {
            setFocusedIndex(-1);
          }
        } else {
          if (focusedIndex >= -1 && focusedIndex < habits.length - 1) {
            e.preventDefault();
            const nextIdx = focusedIndex + 1;
            setFocusedIndex(nextIdx);
            const el = document.getElementById(`switch-${habits[nextIdx].id}`);
            el?.focus();
          } else if (focusedIndex === habits.length - 1) {
            setFocusedIndex(-1);
          }
        }
      } else if (key === "ArrowDown") {
        e.preventDefault();
        const nextIdx = (focusedIndex + 1) % habits.length;
        setFocusedIndex(nextIdx);
        const el = document.getElementById(`switch-${habits[nextIdx].id}`);
        el?.focus();
      } else if (key === "ArrowUp") {
        e.preventDefault();
        const nextIdx = (focusedIndex - 1 + habits.length) % habits.length;
        setFocusedIndex(nextIdx);
        const el = document.getElementById(`switch-${habits[nextIdx].id}`);
        el?.focus();
      } else if (key === "Enter" || key === " ") {
        if (focusedIndex >= 0 && focusedIndex < habits.length) {
          e.preventDefault();
          onToggleHabit(habits[focusedIndex].id);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusedIndex, habits, onToggleHabit, activeTab]);

  return [focusedIndex, setFocusedIndex] as const;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [habits, setHabits] = useState(initialHabits);
  const [showBriefing, setShowBriefing] = useState<boolean>(false);
  const [showProfile, setShowProfile] = useState<boolean>(false);
  const [userName, setUserName] = useState(() => auth.currentUser?.displayName || carbonSenseStore.getUserName() || "Pilot");
  const [verifiedId, setVerifiedId] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingSuggestedName, setOnboardingSuggestedName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(() => carbonSenseStore.getIsLoggedIn());

  const [activeAchievement, setActiveAchievement] = useState<Achievement | null>(null);
  const [revealedIds, setRevealedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("cs-triggered-milestones");
      return saved ? JSON.parse(saved) : [];
    } catch (_) {
      return [];
    }
  });

  const [showCarbonHeroAnimation, setShowCarbonHeroAnimation] = useState(false);
  const [hasClearedHeroMilestone, setHasClearedHeroMilestone] = useState(() => {
    try {
      return localStorage.getItem("cs-hero-milestone-unlocked") === "true";
    } catch (_) {
      return false;
    }
  });

  // API Integration for real-time NASA CO2 index
  const [liveCo2, setLiveCo2] = useState<number | null>(null);
  const [dataSource, setDataSource] = useState<string>("NASA / NOAA calibrated");

  useEffect(() => {
    let active = true;
    fetch("/api/climate-data")
      .then((res) => {
        if (!res.ok) throw new Error("HTTP failure");
        return res.json();
      })
      .then((data) => {
        if (active && data && typeof data.co2Ppm === "number") {
          setLiveCo2(data.co2Ppm);
          if (data.source) {
            setDataSource(data.source);
          }
        }
      })
      .catch((err) => {
        console.warn("Could not retrieve live global warming index in App.tsx:", err);
      });
    return () => {
      active = false;
    };
  }, []);

  // Client-side Router mapping for Certificates
  useEffect(() => {
    const match = window.location.pathname.match(/\/certificate\/([A-Za-z0-9-]+)/);
    if (match) {
      setVerifiedId(match[1]);
    }
  }, []);

  // Track profile store registration (auth state + name sync)
  useEffect(() => {
    const unsub = carbonSenseStore.registerStateListener(() => {
      setUserName(auth.currentUser?.displayName || carbonSenseStore.getUserName() || "Pilot");
      setIsLoggedIn(carbonSenseStore.getIsLoggedIn());
    });
    return unsub;
  }, []);

  // Synchronize committedActionsCount in the store/Firestore whenever habits change
  const activeHabitsCount = useMemo(() => {
    return habits.filter((h) => h.active).length;
  }, [habits]);

  useEffect(() => {
    carbonSenseStore.setCommittedActionsCount(activeHabitsCount);
  }, [activeHabitsCount]);

  // Global keyboard listeners for true Mission Control cockpit mode!
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target?.tagName === "INPUT" || 
        target?.tagName === "TEXTAREA" || 
        target?.isContentEditable
      ) {
        return; // Skip when typing in credentials / textareas
      }

      const key = e.key.toLowerCase();
      if (key === "d") setActiveTab("dashboard");
      else if (key === "i") setActiveTab("insights");
      else if (key === "a") setActiveTab("actions");
      else if (key === "p") setActiveTab("progress");
      else if (key === "c") setActiveTab("certificate");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Redirect logger tab to dashboard and scroll to Activity Logger panel
  useEffect(() => {
    if (activeTab === "logger") {
      setActiveTab("dashboard");
      setTimeout(() => {
        const el = document.getElementById("activity-logger-panel");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          const firstBtn = el.querySelector("button, input, select");
          (firstBtn as HTMLElement)?.focus();
        }
      }, 200);
    }
  }, [activeTab]);

  // Check first load briefing state on mount
  useEffect(() => {
    const hasSeen = localStorage.getItem("cs-briefing-seen");
    if (hasSeen !== "true") {
      setShowBriefing(true);
    }
  }, []);

  // Toggle habit and update carbon score states dynamically - Memoized!
  const handleToggleHabit = useCallback((id: string) => {
    setHabits((prev) =>
      prev.map((habit) =>
        habit.id === id ? { ...habit, active: !habit.active } : habit
      )
    );
  }, []);

  const [focusedHabitIndex, setFocusedHabitIndex] = useHabitsKeyboardNavigation(
    habits,
    handleToggleHabit,
    activeTab
  );

  // Compute total baseline and total reduction potential - Memoized for Phase 3!
  const totalBaseline = useMemo(() => {
    return habits.reduce((sum, h) => sum + h.baselineValue, 0) + 1200;
  }, [habits]);

  const carbonReduction = useMemo(() => {
    return habits
      .filter((h) => h.active)
      .reduce((sum, h) => sum + h.reductionPotential, 0);
  }, [habits]);

  // Check automated milestones achievements
  useEffect(() => {
    const newlyCompleted = MILESTONES.find(
      (m) => carbonReduction >= m.threshold && !revealedIds.includes(m.id)
    );

    if (newlyCompleted) {
      setActiveAchievement(newlyCompleted);
      setRevealedIds((prev) => {
        const next = [...prev, newlyCompleted.id];
        localStorage.setItem("cs-triggered-milestones", JSON.stringify(next));
        return next;
      });
    }
  }, [carbonReduction, revealedIds]);

  // Annual Carbon Hero threshold monitoring trigger
  useEffect(() => {
    if (carbonReduction >= 3500 && !hasClearedHeroMilestone) {
      // Award badge in global state store
      carbonSenseStore.unlockBadge("annual_carbon_hero");
      setShowCarbonHeroAnimation(true);
      setHasClearedHeroMilestone(true);
      try {
        localStorage.setItem("cs-hero-milestone-unlocked", "true");
      } catch (_) {}
    } else if (carbonReduction < 3500 && hasClearedHeroMilestone) {
      setHasClearedHeroMilestone(false);
      try {
        localStorage.removeItem("cs-hero-milestone-unlocked");
      } catch (_) {}
    }
  }, [carbonReduction, hasClearedHeroMilestone]);

  if (verifiedId) {
    return (
      <div className="relative min-h-screen bg-[#020408] text-white">
        <ParallaxStarfield />
        <VerifiedCertificate id={verifiedId} />
      </div>
    );
  }

  return (
    <div id="carbon-sense-root" className="min-h-screen bg-[#020408] bg-[radial-gradient(circle_at_70%_50%,_rgba(10,30,60,0.35)_0%,_transparent_60%),_radial-gradient(circle_at_20%_20%,_rgba(0,0,0,1)_0%,_transparent_100%)] text-[#f4f4f5] font-sans antialiased relative overflow-x-hidden flex flex-col justify-between selection:bg-[#00f0ff]/20 selection:text-[#00f0ff]">
      <a
        href="#main-content"
        className="skip-nav"
        style={{
          position: 'absolute',
          left: '-9999px',
          top: 'auto',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}
        onFocus={(e) => {
          e.currentTarget.style.cssText = 
            'position:fixed;top:16px;left:16px;padding:8px 16px;background:#a3e635;color:#040708;z-index:9999;border-radius:4px;font-weight:600;left:auto;width:auto;height:auto;overflow:visible;';
        }}
        onBlur={(e) => {
          e.currentTarget.style.cssText = 
            'position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden;';
        }}
      >
        Skip to main content
      </a>

      {/* Visual Noise/Grain for Editorial Aesthetic */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] z-[99]" style={{ backgroundImage: `url('data:image/svg+xml,%3Csvg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noiseFilter)"/%3E%3C/svg%3E')` }}></div>

      {/* 1. INTERACTIVE CINEMATIC PARALLAX BACKGROUND */}
      <ParallaxStarfield />

      {/* 2. NASA MISSION CONTROL OVERLAYS & CANVAS FIELDS */}
      <TelemetryOverlay />

      {/* 2.5 FLOATING HUD ACTION HEADER */}
      <header className="absolute top-6 left-0 right-0 w-full max-w-[1920px] mx-auto px-8 sm:px-16 flex justify-between items-center z-[130] pointer-events-none">
        <div aria-label="Mission Status: Nominal // CO₂ Recon Flight Active" className="font-mono text-[9px] text-[#00f0ff]/40 tracking-[0.3em] uppercase hidden md:block" style={{ textTransform: 'uppercase' }}>
          Mission Status: Nominal // CO₂ Recon Flight Active
        </div>
        
        <button
          onClick={() => {
            setShowProfile(true);
            try {
              const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
              if (AudioCtx) {
                const ctx = new AudioCtx();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.setValueAtTime(1200, ctx.currentTime);
                gain.gain.setValueAtTime(0.01, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
                osc.start();
                osc.stop(ctx.currentTime + 0.13);
              }
            } catch (_) {}
          }}
          aria-label="View Pilot Profile and Settings"
          className="pointer-events-auto bg-black/60 backdrop-blur-md border border-[#00f0ff]/10 hover:border-[#00f0ff]/40 px-4 py-2 rounded-full flex items-center gap-2.5 font-mono text-[9px] uppercase tracking-[0.15em] text-white hover:text-[#00f0ff] cursor-pointer shadow-lg transition-all duration-300 ml-auto group border-glow font-medium"
        >
          <div className="relative">
            <User size={11} className="text-[#00f0ff]" />
            <span className="absolute -top-[1px] -right-[1px] h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse"></span>
          </div>
          <span>Pilot: {userName}</span>
          <Settings size={10} className="text-zinc-500 group-hover:rotate-45 transition-transform duration-300 ml-1" />
        </button>
      </header>

      {/* Main Container tailored to premium 4K composition (3840x2160) which scales beautifully down to normal displays with standard fluid layouts */}
      <motion.main 
        id="main-content" 
        variants={mainContainerVariants}
        initial="hidden"
        animate="visible"
        className="w-full mx-auto px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-28 pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-24 sm:pb-28 md:pb-32 lg:pb-36 xl:pb-40 gap-6 sm:gap-8 md:gap-10 lg:gap-12 xl:gap-16 flex flex-col items-center justify-start relative z-10 h-auto min-h-fit"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.015) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.015) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          backgroundPosition: "center top",
        }}
      >
        
        {/* SPECTRAL SENSOR ANALYSIS HEADER BAR (SPANNING FULL PAGE WIDTH) */}
        <motion.div 
          variants={mainChildVariants}
          className="w-full bg-zinc-950/40 border border-white/5 rounded-xl p-4 md:px-6 md:py-3.5 backdrop-blur-md flex flex-row justify-between items-center gap-x-6 z-40 select-text overflow-x-auto scrollbar-hide text-zinc-400 min-w-0 animate-fade-in"
        >
          {/* Left section: sensor name & dynamic readings */}
          <div className="flex items-center gap-4 min-w-0 shrink-0">
            <div className="flex flex-col gap-0.5 border-l border-[#00f0ff] pl-3 font-mono text-[9px] sm:text-[10px]">
              <span className="text-[#00f0ff] font-extrabold uppercase tracking-widest flex items-center gap-1.5 leading-none" style={{ textTransform: 'uppercase' }}>
                <span className="flex h-1.5 w-1.5 relative shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00f0ff] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#00f0ff]"></span>
                </span>
                Spectral Sensor Analysis
              </span>
              <div className="flex items-center gap-x-2.5 mt-1 text-[8px] sm:text-[9.5px]">
                <span className="whitespace-nowrap uppercase" style={{ textTransform: 'uppercase' }}>
                  CO₂ Ratio:{" "}
                  <strong className="text-glow-red text-[#ff3333] font-bold font-mono">
                    {liveCo2 !== null ? `${liveCo2.toFixed(2)} ppm` : "423.82 ppm"}
                  </strong>
                </span>
                <span className="text-zinc-800">|</span>
                <span className="text-[#39ff14]/85 whitespace-nowrap uppercase" style={{ textTransform: 'uppercase' }}>
                  Source: {dataSource}
                </span>
              </div>
            </div>
          </div>

          {/* Right section: Real-time orbital details / NASA Telemetry stats in a single row */}
          <div className="flex flex-row items-center justify-end gap-x-2 sm:gap-x-4 md:gap-x-8 font-mono text-[9px] sm:text-[10px] shrink-0">
            <div className="hidden sm:flex flex-col">
              <span className="text-zinc-600 uppercase text-[7px] lg:text-[8px] tracking-wider leading-none">Range</span>
              <span className="font-semibold text-white whitespace-nowrap leading-tight mt-0.5 uppercase" style={{ textTransform: 'uppercase' }}>Leo Range</span>
            </div>
            <div className="hidden sm:block h-6 w-[1px] bg-zinc-800/40"></div>
            <div className="hidden md:flex flex-col">
              <span className="text-zinc-600 uppercase text-[7px] lg:text-[8px] tracking-wider leading-none">Recon Rotation</span>
              <span className="font-semibold text-[#00f0ff] whitespace-nowrap leading-tight mt-0.5 uppercase" style={{ textTransform: 'uppercase' }}>7.67 km/s</span>
            </div>
            <div className="hidden md:block h-6 w-[1px] bg-zinc-800/40"></div>
            <div className="flex flex-col">
              <span className="text-zinc-600 uppercase text-[7px] lg:text-[8px] tracking-wider leading-none">Temp Anomaly</span>
              <span className="font-semibold text-[#ffaa00] whitespace-nowrap leading-tight mt-0.5">+1.28 °C</span>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === "certificate" ? (
            <motion.div
              key="certificate-tab"
              layout
              variants={mainChildVariants}
              exit={{ opacity: 0, scale: 0.98, y: -15 }}
              className="w-full"
            >
              <React.Suspense fallback={<LoadingScreen />}>
                <CertificatePage
                  carbonReduction={carbonReduction}
                  totalBaseline={totalBaseline}
                  onNavigateToTab={setActiveTab}
                />
              </React.Suspense>
            </motion.div>
          ) : activeTab === "methodology" ? (
            <motion.div
              key="methodology-tab"
              layout
              variants={mainChildVariants}
              exit={{ opacity: 0, scale: 0.98, y: -15 }}
              className="w-full"
            >
              <React.Suspense fallback={<LoadingScreen />}>
                <CarbonMethodology />
              </React.Suspense>
            </motion.div>
          ) : (
            <motion.div
              key="cockpit-split"
              layout
              variants={cockpitSplitVariants}
              exit={{ opacity: 0, y: -20 }}
              className="w-full flex flex-col gap-10"
            >
              {activeTab === "dashboard" ? (
                <div id="dashboard-cockpit-layout" className="flex flex-col gap-10 w-full h-auto min-h-fit overflow-visible">
                  {/* HERO HEADER SECTION - 100% Width, Zero Overlaps */}
                  <div id="dashboard-hero-header" className="w-full relative z-20 flex flex-col gap-4 select-text pointer-events-auto border-b border-white/[0.04] pb-6 h-auto min-h-fit overflow-visible">
                    {/* Subtle F1-style Telemetry Sector tag */}
                    <div className="flex items-center gap-2 font-mono text-[10px] text-[#00f0ff] uppercase tracking-[0.25em]">
                      <span>Sector 01: Human Telemetry</span>
                      <span className="text-zinc-650">//</span>
                      <span className="text-zinc-400 uppercase" style={{ textTransform: 'uppercase' }}>Flight Directory</span>
                    </div>

                    {/* Massive climate-focused headline */}
                    <h1 className="font-display font-[800] text-[32px] sm:text-[52px] md:text-[64px] lg:text-[76px] xl:text-[88px] leading-[0.9] tracking-tighter uppercase w-full mt-1 break-words overflow-hidden">
                      The Weight<br />
                      <span className="text-transparent text-stroke-white">Of Our</span><br />
                      Decisions
                    </h1>

                    {/* Editorial introductory subtitle */}
                    <p className="text-zinc-400 text-xs sm:text-sm font-sans tracking-wide leading-relaxed font-light mt-2 max-w-4xl">
                      Welcome to Earth Mission Control. CarbonSense monitors, parses, and active-tunes your personal daily output. Check planetary diagnostics and override standard consumption protocols below.
                    </p>
                  </div>

                  {/* EARTH VISUALIZER MODULE - Centered, Beautiful, completely unconstrained, 100% Width */}
                  <motion.div 
                    variants={cockpitChildVariants}
                    className="w-full hidden md:flex flex-col items-center justify-center relative z-10 h-auto min-h-fit overflow-visible py-4"
                  >
                    <EarthVisualizer
                      carbonReduction={carbonReduction}
                      totalBaseline={totalBaseline}
                    />
                  </motion.div>

                  {/* COCKPIT COMPILER & OVERRIDES PANEL - Unified, multi-column grid, expands naturally downwards */}
                  <motion.div
                    variants={cockpitChildVariants}
                    layout
                    className="w-full select-text pointer-events-auto border-t border-white/[0.04] pt-8 h-auto overflow-visible"
                  >
                    <CarbonCalculator
                      habits={habits}
                      onToggleHabit={handleToggleHabit}
                      carbonReduction={carbonReduction}
                      totalBaseline={totalBaseline}
                      focusedIndex={focusedHabitIndex}
                      onFocusIndex={setFocusedHabitIndex}
                      hideHeader={true}
                    />
                  </motion.div>

                  {/* ACTIVITY LOGGER ROW - Flowing naturally downwards */}
                  <motion.div
                    variants={cockpitChildVariants}
                    layout
                    className="w-full select-text pointer-events-auto border-t border-white/[0.04] pt-8 h-auto overflow-visible"
                  >
                    <ActivityLogger />
                  </motion.div>

                  {/* GLOBAL LEADERBOARD SECTION */}
                  <motion.div
                    variants={cockpitChildVariants}
                    layout
                    className="w-full z-10 border-t border-white/[0.04] pt-12 select-text pointer-events-auto flex justify-center h-auto overflow-visible"
                  >
                    <div className="w-full">
                      <React.Suspense fallback={<LoadingScreen />}>
                        <GlobalLeaderboard
                          userReductionKg={carbonReduction}
                          userName={userName}
                          userLocation={carbonSenseStore.getProfile().location}
                        />
                      </React.Suspense>
                    </div>
                  </motion.div>
                </div>
              ) : (
                <div className="w-full grid grid-cols-1 md:grid-cols-[minmax(300px,1fr)_minmax(300px,auto)] gap-8 md:gap-12 xl:gap-16 2xl:gap-24 items-start min-h-0">
                  {/* LEFT SIDE: DYNAMIC COCKPIT PANEL WITH VERTICAL EDITORIAL COMPOSITION */}
                  <motion.div 
                    layout 
                    variants={cockpitChildVariants}
                    className="w-full relative z-20 min-h-0 flex flex-col justify-start order-2 md:order-1"
                  >
                    <AnimatePresence mode="wait">
                      {activeTab === "insights" && (
                        <motion.div
                          key="insights"
                          layout
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -15 }}
                          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                          className="w-full"
                        >
                          <TelemetryInsights
                            carbonReduction={carbonReduction}
                            totalBaseline={totalBaseline}
                          />
                        </motion.div>
                      )}

                      {activeTab === "actions" && (
                        <motion.div
                          key="actions"
                          layout
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -15 }}
                          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                          className="w-full"
                        >
                          <TelemetryProgress
                            activeTab="actions"
                            carbonReduction={carbonReduction}
                            totalBaseline={totalBaseline}
                            onViewCertificate={() => setActiveTab("certificate")}
                            habits={habits}
                          />
                        </motion.div>
                      )}

                      {activeTab === "progress" && (
                        <motion.div
                          key="progress"
                          layout
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -15 }}
                          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                          className="w-full"
                        >
                          <TelemetryProgress
                            activeTab="progress"
                            carbonReduction={carbonReduction}
                            totalBaseline={totalBaseline}
                            onViewCertificate={() => setActiveTab("certificate")}
                            habits={habits}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* RIGHT SIDE: THE MASSIVE INTERACTIVE EARTH VISUALIZER DOMINATING COMPOSITION */}
                  <motion.div 
                    variants={cockpitChildVariants}
                    className="w-full hidden md:flex flex-col gap-8 relative z-10 min-h-0 md:sticky md:top-12 self-start order-1 md:order-2"
                  >
                    <div className="flex items-start justify-center w-full">
                      <EarthVisualizer
                        carbonReduction={carbonReduction}
                        totalBaseline={totalBaseline}
                      />
                    </div>
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </motion.main>

      {/* FLOATING COMMAND LEVEL COCKPIT DOCK (NAVIGATION CONTROL LEVEL) */}
      <CommandDock
        activeTab={activeTab}
        onTabChange={setActiveTab}
        carbonReduction={carbonReduction}
        totalBaseline={totalBaseline}
      />

      {/* Manual Mission Briefing Re-launch Link */}
      <div className="absolute bottom-6 right-16 z-20 hidden min-[1400px]:block">
        <button
          id="relaunch-briefing-btn"
          onClick={() => setShowBriefing(true)}
          className="font-mono text-[9px] text-[#00f0ff]/50 hover:text-[#00f0ff] uppercase tracking-[0.2em] cursor-pointer border border-[#00f0ff]/10 hover:border-[#00f0ff]/40 px-3 py-1.5 rounded bg-black/40 backdrop-blur-md transition-all duration-350 pointer-events-auto"
        >
          Launch System Briefing
        </button>
      </div>

      {/* Overlay system terminal mission briefing */}
      <AnimatePresence>
        {showBriefing && (
          <MissionBriefing 
            onDismiss={() => {
              localStorage.setItem("cs-briefing-seen", "true");
              setShowBriefing(false);
            }} 
          />
        )}
      </AnimatePresence>

      {/* Cinematic automated Mission Achievement cards */}
      <AchievementToast
        achievement={activeAchievement}
        onClose={() => setActiveAchievement(null)}
      />

      {/* Pilot profile management drawer */}
      <PilotProfile
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        carbonReduction={carbonReduction}
        onNewUser={(googleName) => {
          setOnboardingSuggestedName(googleName);
          setShowOnboarding(true);
        }}
      />

      {/* First-time callsign onboarding modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        suggestedName={onboardingSuggestedName}
        onConfirm={async (callsign) => {
          await carbonSenseStore.updateProfile({ displayName: callsign });
          setUserName(callsign);
          setShowOnboarding(false);
        }}
        onSkip={() => setShowOnboarding(false)}
      />

      {/* Auto sign-in invite for guest users — appears 3s after load */}
      <SignInPrompt
        isLoggedIn={isLoggedIn}
        onSignInClick={() => setShowProfile(true)}
      />

      {/* Exquisite 'Annual Carbon Hero' celebration popup overlay */}
      <AnnualCarbonHeroCelebration
        isOpen={showCarbonHeroAnimation}
        onClose={() => setShowCarbonHeroAnimation(false)}
        carbonReductionKg={carbonReduction}
      />

      {/* Decorative ultra-thin visual border rails fitting premium aesthetic */}
      <div className="absolute top-0 bottom-0 left-[2.5rem] w-[1px] bg-white/[0.02] pointer-events-none z-0"></div>
      <div className="absolute top-0 bottom-0 right-[2.5rem] w-[1px] bg-white/[0.02] pointer-events-none z-0"></div>
    </div>
  );
}
