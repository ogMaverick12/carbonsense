import React, { useRef, useState, useEffect, useCallback, memo } from "react";
import { planetaryHotspots } from "../data";
import { TelemetryHotspot } from "../types";
import { Globe, AlertTriangle, Eye, ShieldAlert, Crosshair, HelpCircle, Flame, ArrowDown, Activity } from "lucide-react";
import gsap from "gsap";
import healthyEarth from "../assets/images/healthy_earth_1781010556530.png";
import pollutedEarth from "../assets/images/polluted_earth_1781010577732.png";
import { getAudioContextClass } from "../lib/audio";

interface EarthVisualizerProps {
  carbonReduction: number;
  totalBaseline: number;
}

export const EarthVisualizer = memo(function EarthVisualizer({ carbonReduction, totalBaseline }: EarthVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const pollutedEarthRef = useRef<HTMLDivElement>(null);
  const loupeRef = useRef<HTMLDivElement>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [sensorView, setSensorView] = useState<"visible" | "infrared">("visible");
  const [hoveredHotspot, setHoveredHotspot] = useState<TelemetryHotspot | null>(null);
  const [lensRadius, setLensRadius] = useState(150); // radius in px
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>(["Diagnostics initialized"]);
  const addLog = useCallback((msg: string) => {
    setDebugLogs((prev) => [...prev.slice(-3), msg]);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsCoarsePointer(window.matchMedia("(pointer: coarse)").matches);
    }
  }, []);

  // High-frequency programmatic NASA data-ping sound
  const playDataPing = useCallback(() => {
    try {
      const AudioContextClass = getAudioContextClass();
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(1500, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(750, ctx.currentTime + 0.12);
      
      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch (_) {
      // intentional: audio/storage failures are non-fatal; swallowing here is correct
    }
  }, []);

  // Breathing pulse rates linked to current CO2 reduction levels (higher reduction = slower pulse)
  useEffect(() => {
    if (!glowRef.current) return;
    const performanceRatio = totalBaseline > 0 ? (carbonReduction / totalBaseline) : 0;
    // Slower breathing animation dynamically when we reduce carbon more (duration maps from 1.5s to 4.5s)
    const duration = 1.5 + performanceRatio * 3.0;

    gsap.killTweensOf(glowRef.current);
    gsap.set(glowRef.current, { scale: 1.0, opacity: 0.7 });

    gsap.to(glowRef.current, {
      scale: 1.15,
      opacity: 0.95,
      duration: duration / 2,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut"
    });

    return () => {
      gsap.killTweensOf(glowRef.current);
    };
  }, [carbonReduction, totalBaseline]);

  // Track cursor position directly in refs to circumvent state-driven re-renders (60 FPS Performance optimization)
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Apply radial clean vs polluted mask image style directly to bypassed ref elements
    if (pollutedEarthRef.current) {
      const maskString = `radial-gradient(circle ${lensRadius}px at ${x}% ${y}%, ${
        sensorView === "infrared" ? "transparent 0%, transparent 60%, black 100%" : "black 0%, black 60%, transparent 100%"
      })`;
      pollutedEarthRef.current.style.maskImage = maskString;
      pollutedEarthRef.current.style.webkitMaskImage = maskString;
    }

    if (loupeRef.current) {
      loupeRef.current.style.left = `calc(${x}% - ${lensRadius}px)`;
      loupeRef.current.style.top = `calc(${y}% - ${lensRadius}px)`;
    }
  }, [lensRadius, sensorView]);

  // Mobile / Touch devices target scanning handler at perfect 60 FPS
  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;

    if (x >= 0 && x <= 100 && y >= 0 && y <= 100) {
      if (pollutedEarthRef.current) {
        const maskString = `radial-gradient(circle ${lensRadius}px at ${x}% ${y}%, ${
          sensorView === "infrared" ? "transparent 0%, transparent 60%, black 100%" : "black 0%, black 60%, transparent 100%"
        })`;
        pollutedEarthRef.current.style.maskImage = maskString;
        pollutedEarthRef.current.style.webkitMaskImage = maskString;
      }

      if (loupeRef.current) {
        loupeRef.current.style.left = `calc(${x}% - ${lensRadius}px)`;
        loupeRef.current.style.top = `calc(${y}% - ${lensRadius}px)`;
      }
    }
  }, [lensRadius, sensorView]);

  // Move the mask and loupe coordinates programmatically when keying through buttons/hotspots
  const moveReconCoordsTo = useCallback((pctX: number, pctY: number) => {
    if (pollutedEarthRef.current) {
      const maskString = `radial-gradient(circle ${lensRadius}px at ${pctX}% ${pctY}%, ${
        sensorView === "infrared" ? "transparent 0%, transparent 60%, black 100%" : "black 0%, black 60%, transparent 100%"
      })`;
      pollutedEarthRef.current.style.maskImage = maskString;
      pollutedEarthRef.current.style.webkitMaskImage = maskString;
    }
    if (loupeRef.current) {
      loupeRef.current.style.left = `calc(${pctX}% - ${lensRadius}px)`;
      loupeRef.current.style.top = `calc(${pctY}% - ${lensRadius}px)`;
    }
  }, [lensRadius, sensorView]);

  // Slowly expand lens on scroll or slider, or keep interactive custom adjustment
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.stopPropagation();
    setLensRadius((prev) => Math.max(80, Math.min(300, prev + (e.deltaY > 0 ? -10 : 10))));
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    playDataPing();
  }, [playDataPing]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    setIsHovered(true);
    playDataPing();

    if (!containerRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;

    if (x >= 0 && x <= 100 && y >= 0 && y <= 100) {
      if (pollutedEarthRef.current) {
        const maskString = `radial-gradient(circle ${lensRadius}px at ${x}% ${y}%, ${
          sensorView === "infrared" ? "transparent 0%, transparent 60%, black 100%" : "black 0%, black 60%, transparent 100%"
        })`;
        pollutedEarthRef.current.style.maskImage = maskString;
        pollutedEarthRef.current.style.webkitMaskImage = maskString;
      }

      if (loupeRef.current) {
        loupeRef.current.style.left = `calc(${x}% - ${lensRadius}px)`;
        loupeRef.current.style.top = `calc(${y}% - ${lensRadius}px)`;
      }
    }
  }, [lensRadius, sensorView, playDataPing]);

  const handleTouchEnd = useCallback(() => {
    setIsHovered(false);
  }, []);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Canvas-based orbit trajectory overlay indicating live user-override data streams
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let resizeObserver: ResizeObserver;

    // Stream trajectories configuration (representing NASA telemetry links)
    interface Stream {
      radiusX: number;
      radiusY: number;
      tilt: number;
      speed: number;
      color: string;
      glowColor: string;
      label: string;
      progress: number;
    }

    const streams: Stream[] = [
      {
        radiusX: 0.58, // fraction of container element
        radiusY: 0.22,
        tilt: -Math.PI / 6,
        speed: 0.007,
        color: "rgba(0, 240, 255, 0.15)",
        glowColor: "#00f0ff",
        label: "GRID CORE RECON SYNC",
        progress: 0.1,
      },
      {
        radiusX: 0.68,
        radiusY: 0.16,
        tilt: Math.PI / 4,
        speed: 0.005,
        color: "rgba(57, 255, 20, 0.15)",
        glowColor: "#39ff14",
        label: "#02 SPECTRAL VECTOR LINK",
        progress: 0.4,
      },
      {
        radiusX: 0.74,
        radiusY: 0.12,
        tilt: -Math.PI / 16,
        speed: 0.006,
        color: "rgba(255, 170, 0, 0.15)",
        glowColor: "#ffaa00",
        label: "VEHICLE OVERLAY DEFICIT",
        progress: 0.7,
      },
    ];

    const resize = (width: number, height: number) => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    if (containerRef.current) {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          resize(width, height);
        }
      });
      resizeObserver.observe(containerRef.current);
    }

    // Set initial custom size
    resize(canvas.clientWidth, canvas.clientHeight);

    // Check screen width for performance-sensitive mobile optimizations (no heavy canvas shadow blending)
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const shadowGlowRadius = isMobile ? 0 : 8;

    let pulseSign = 1;
    let pulseOpacity = 0.5;

    const animate = () => {
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      // Pulse rate maps to overall offset achievements.
      // Slower, calmer breathing represents highly optimized stabilized Atmosphere Grid.
      const performanceRatio = totalBaseline > 0 ? (carbonReduction / totalBaseline) : 0;
      const animSpeedMultiplier = 1.0 - (performanceRatio * 0.65);

      pulseOpacity += 0.012 * pulseSign * animSpeedMultiplier;
      if (pulseOpacity >= 0.85) {
        pulseOpacity = 0.85;
        pulseSign = -1;
      } else if (pulseOpacity <= 0.3) {
        pulseOpacity = 0.3;
        pulseSign = 1;
      }

      streams.forEach((stream, idx) => {
        const rx = w * stream.radiusX;
        const ry = h * stream.radiusY;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(stream.tilt);

        // 1. Draw dashed vector ellipse
        ctx.strokeStyle = stream.color;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 10]);
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();

        // 2. Increment particle progress
        stream.progress += stream.speed * animSpeedMultiplier;
        if (stream.progress > 1) stream.progress -= 1;

        const t = stream.progress * Math.PI * 2;
        const px = rx * Math.cos(t);
        const py = ry * Math.sin(t);

        // 3. Draw streaming glowing signal packet
        ctx.shadowColor = stream.glowColor;
        ctx.shadowBlur = shadowGlowRadius;
        ctx.fillStyle = stream.glowColor;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();

        // 4. Draw smaller trail particles
        ctx.shadowBlur = 0;
        for (let i = 1; i <= 3; i++) {
          const trailT = t - (i * 0.08);
          const tx = rx * Math.cos(trailT);
          const ty = ry * Math.sin(trailT);
          ctx.beginPath();
          ctx.fillStyle = stream.glowColor;
          ctx.globalAlpha = (0.55 / i) * pulseOpacity;
          ctx.arc(tx, ty, 2 - (i * 0.4), 0, Math.PI * 2);
          ctx.fill();
        }

        // 5. Render orbital telemetry labels on peaks
        ctx.globalAlpha = pulseOpacity * 0.8;
        ctx.font = "italic 300 6.5px 'JetBrains Mono', monospace";
        ctx.fillStyle = stream.glowColor;
        if (idx === 0) {
          ctx.fillText(stream.label, rx - 100, -8);
        } else if (idx === 1) {
          ctx.fillText(stream.label, -rx + 15, 12);
        }

        ctx.restore();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [carbonReduction, totalBaseline]);

  // Determine current atmospheric carbon saturation factor based on user mitigation offsets
  const currentEmission = totalBaseline - carbonReduction;
  const healthPercent = Math.round((currentEmission / totalBaseline) * 100);

  return (
    <div className="flex flex-col items-center pt-0 pb-6 relative z-10 pointer-events-auto w-full">
      {/* SECTION 2: Massive Earth Visualizer Container */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        onTouchMove={handleTouchMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        role="img"
        aria-label="Interactive 3D Earth visualization showing global carbon emission hotspots"
        className="w-[180px] h-[180px] sm:w-[240px] sm:h-[240px] md:w-[440px] md:h-[440px] lg:w-[420px] lg:h-[420px] xl:w-[500px] xl:h-[500px] 2xl:w-[640px] 2xl:h-[640px] mt-0 mb-4 rounded-full relative flex items-center justify-center cursor-crosshair select-none group/earth transition-transform duration-500 hover:scale-[1.01] will-change-transform transform-gpu"
        style={{
          boxShadow: `0 0 100px rgba(0, 240, 255, 0.05), inset 0 0 80px rgba(0, 240, 255, 0.03)`
        }}
      >
        {/* Trajectory stream canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-[-10%] w-[120%] h-[120%] pointer-events-none z-[4]"
        />

        {/* Subtle decorative target scope rings */}
        <div className="absolute inset-[-4%] rounded-full border border-[#00f0ff]/[0.02] pointer-events-none animate-spin-slow"></div>
        <div className="absolute inset-[-8%] rounded-full border border-dashed border-zinc-900 pointer-events-none"></div>

        {/* Real compass reticle marks */}
        <div className="absolute top-1/2 left-[-15px] w-4 h-[1px] bg-zinc-600"></div>
        <div className="absolute top-1/2 right-[-15px] w-4 h-[1px] bg-zinc-600"></div>
        <div className="absolute top-[-15px] left-1/2 w-[1px] h-4 bg-zinc-600"></div>
        <div className="absolute bottom-[-15px] left-1/2 w-[1px] h-4 bg-zinc-600"></div>

        <span className="absolute left-[-45px] top-1/2 -translate-y-1/2 font-mono text-[8px] text-zinc-500 tracking-widest leading-none">W 90°00'</span>
        <span className="absolute right-[-45px] top-1/2 -translate-y-1/2 font-mono text-[8px] text-zinc-500 tracking-widest leading-none">E 90°00'</span>
        <span className="absolute top-[-35px] left-1/2 -translate-x-1/2 font-mono text-[8px] text-zinc-500 tracking-widest leading-none">N 0°00'</span>

        {/* Atmosphere Glow aligned with design's blue space halo (rgba(59,130,246,0.22)) */}
        <div 
          ref={glowRef}
          className="absolute w-[120%] h-[120%] rounded-full bg-[radial-gradient(circle,_rgba(59,130,246,0.22)_0%,_transparent_70%)] blur-3xl pointer-events-none z-0 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        ></div>

        {/* 1. LAYER A: PRISTINE EARTH (Healthy state) */}
        <div className="absolute inset-0 rounded-full overflow-hidden flex items-center justify-center">
          <img
            src={healthyEarth}
            alt="Pristine Earth showing healthy blue ocean networks and cloud cover structure"
            width={512}
            height={512}
            className="w-full h-full object-cover rounded-full select-none max-w-full block"
            onLoad={() => addLog("Pristine Earth: Loaded successfully")}
            onError={(e) => addLog("Pristine Earth: Failed to load URL: " + e.currentTarget.src)}
          />
        </div>

        {/* 2. LAYER B: POLLUTED CO2-CHOKED EARTH
            Uses the interactive mask radial to reveal itself on cursor hover position!
            Optimized via pollutedEarthRef to completely skip React state re-renders during mouse tracking.
        */}
        <div 
          ref={pollutedEarthRef}
          className="absolute inset-0 rounded-full overflow-hidden flex items-center justify-center transition-opacity duration-300 pointer-events-none"
          style={{
            opacity: sensorView === "infrared" ? 1 : (isHovered ? 1 : 0),
          }}
        >
          <img
            src={pollutedEarth}
            alt="Atmospheric greenhouse gas simulation mask showing heat anomalies"
            width={512}
            height={512}
            className="w-full h-full object-cover rounded-full select-none"
            onLoad={() => addLog("Polluted Earth: Loaded successfully")}
            onError={(e) => addLog("Polluted Earth: Failed to load URL: " + e.currentTarget.src)}
          />
        </div>

        {/* Atmospheric glowing lens ring (Planet Limbs) */}
        <div className="absolute inset-0 rounded-full pointer-events-none border border-white/5 shadow-[inset_0_0_60px_rgba(0,240,255,0.1),_0_0_50px_rgba(0,240,255,0.05)]"></div>

        {/* Tactical interactive hotspot targets (fully accessible via keyboard navigation alone) */}
        {planetaryHotspots.map((hotspot) => {
          const isTargetHovered = hoveredHotspot?.id === hotspot.id;
          return (
            <div
              key={hotspot.id}
              style={{ top: `${hotspot.top}%`, left: `${hotspot.left}%` }}
              className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 z-10"
              onMouseEnter={() => {
                setHoveredHotspot(hotspot);
                moveReconCoordsTo(hotspot.left, hotspot.top);
              }}
              onMouseLeave={() => setHoveredHotspot(null)}
            >
              <div className="relative group/tag">
                {/* Outward pulsing radar ring */}
                <div className={`absolute -inset-2.5 rounded-full border animate-ping pointer-events-none ${
                  hotspot.status === "CRITICAL" ? "border-red-500/30" : "border-amber-500/30"
                }`}></div>

                {/* Target central dot button - fully keyboard reachable */}
                <button
                  id={`hotspot-btn-${hotspot.id}`}
                  aria-label={`Inspect planetary hotspot telemetry: ${hotspot.name}, status ${hotspot.status}`}
                  tabIndex={0}
                  onFocus={() => {
                    setHoveredHotspot(hotspot);
                    moveReconCoordsTo(hotspot.left, hotspot.top);
                  }}
                  onBlur={() => setHoveredHotspot(null)}
                  className={`relative w-4 h-4 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-125 focus:scale-130 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a3e635] focus:ring-2 focus:ring-white bg-black border-2 ${
                    hotspot.status === "CRITICAL" ? "border-[#ff3b30]" : "border-[#ffaa00]"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    hotspot.status === "CRITICAL" ? "bg-[#ff3b30] animate-pulse" : "bg-[#ffaa00]"
                  }`}></span>
                </button>

                {/* Hotspot details hover card (elegant Formula 1 telemetry layout) */}
                <div 
                  id={`hotspot-card-${hotspot.id}`}
                  className={`absolute top-6 left-1/2 -translate-x-1/2 w-52 bg-black/95 border backdrop-blur-md rounded px-3 py-2.5 shadow-2xl font-mono text-[9px] tracking-wider leading-relaxed transition-all duration-300 pointer-events-none flex flex-col gap-1.5 ${
                    isTargetHovered 
                      ? "opacity-100 translate-y-0 scale-100 border-[#ff3b30]" 
                      : "opacity-0 translate-y-1 scale-95 border-zinc-800"
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-1">
                    <span className="font-extrabold text-white text-[10px] uppercase truncate max-w-[130px]">{hotspot.name}</span>
                    <span className={`px-1.5 rounded-xs scale-90 ${
                      hotspot.status === "CRITICAL" ? "bg-[#ff3b30]/15 text-[#ff3b30]" : "bg-[#ffaa00]/15 text-[#ffaa00]"
                    }`}>
                      {hotspot.status}
                    </span>
                  </div>

                  <div className="flex justify-between text-zinc-400">
                    <span className="uppercase" style={{ textTransform: 'uppercase' }}>Coordinates:</span>
                    <span className="text-zinc-300">{hotspot.latitude}</span>
                  </div>

                  <div className="flex justify-between text-zinc-400">
                    <span className="uppercase" style={{ textTransform: 'uppercase' }}>Grid Output:</span>
                    <span className="text-[#ff3b30] font-bold text-glow-red">{hotspot.co2Output}</span>
                  </div>

                  <div className="flex justify-between text-zinc-400 border-t border-white/[0.05] pt-1">
                    <span className="uppercase" style={{ textTransform: 'uppercase' }}>Vector Trend:</span>
                    <span className={`${
                      hotspot.trend === "INCREASING" ? "text-[#ff3b30]" : hotspot.trend === "DECREASING" ? "text-[#39ff14]" : "text-zinc-400"
                    } font-bold`}>
                      {hotspot.trend}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* RADIAL LOUPE OVERLAY (Tactile lens tracker indicating actual scanning cursor position) */}
        <div 
          ref={loupeRef}
          className="absolute rounded-full border border-[#00f0ff]/40 shadow-[0_0_20px_rgba(0,240,255,0.3)] pointer-events-none flex items-center justify-center transition-opacity duration-250 ease-out"
          style={{
            width: `${lensRadius * 2}px`,
            height: `${lensRadius * 2}px`,
            opacity: isHovered ? 1 : 0,
            left: "calc(50% - " + lensRadius + "px)",
            top: "calc(50% - " + lensRadius + "px)",
          }}
        >
          {/* Subtle digital coordinate ticks inside the lens tool */}
          <div className="absolute top-1 w-full flex justify-between px-2 font-mono text-[8px] text-[#00f0ff] opacity-40">
            <span>SCANNER_CH.{lensRadius}</span>
            <span>LENS: {sensorView === "visible" ? "RECON_CO2" : "RECON_SAFE"}</span>
          </div>
        </div>
      </div>

      {/* SECTION 3: Spectrum Interactive Selection Control Bar */}
      <div className="w-full max-w-lg bg-zinc-950/60 border border-white/[0.05] p-3 rounded-lg flex flex-col gap-2 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest font-semibold" style={{ textTransform: 'uppercase' }}>Spectrometer Detector Recon</span>
          <span className="font-mono text-[8px] text-[#00f0ff]" style={{ textTransform: 'uppercase' }}>Lens Diameter: {lensRadius * 2}nm</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mt-1">
          <button
            id="spectrometer-visible-btn"
            aria-label="Set Earth spectrometer wavelength to visible light mode (380 to 750 nanometer bounds)"
            onClick={() => setSensorView("visible")}
            className={`py-2 px-3 rounded-md font-mono text-[10px] tracking-wider cursor-pointer text-center flex items-center justify-center gap-1.5 transition-all duration-300 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a3e635] focus:ring-1 focus:ring-white/40 ${
              sensorView === "visible"
                ? "bg-zinc-900 text-white border border-white/10"
                : "text-zinc-500 hover:text-zinc-300 border border-transparent"
            }`}
          >
            <Eye size={12} className={sensorView === "visible" ? "text-[#00f0ff]" : ""} />
            <span className="uppercase" style={{ textTransform: 'uppercase' }}>Visible Spectrum (380-750nm)</span>
          </button>

          <button
            id="spectrometer-infrared-btn"
            aria-label="Set Earth spectrometer wavelength to infrared greenhouse carbon diagnostic sensor view"
            onClick={() => setSensorView("infrared")}
            className={`py-2 px-3 rounded-md font-mono text-[10px] tracking-wider cursor-pointer text-center flex items-center justify-center gap-1.5 transition-all duration-300 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a3e635] focus:ring-1 focus:ring-white/40 ${
              sensorView === "infrared"
                ? "bg-zinc-800 text-white border border-white/15 shadow-[0_0_10px_rgba(255,170,0,0.15)]"
                : "text-zinc-500 hover:text-zinc-300 border border-transparent"
            }`}
          >
            <Flame size={12} className={sensorView === "infrared" ? "text-[#ffaa00]" : ""} />
            <span className="uppercase" style={{ textTransform: 'uppercase' }}>CO₂ Infrared Detector (15µm)</span>
          </button>
        </div>

        {/* Dynamic educational feedback explanation based on active visual spectrum modes */}
        <p className="font-mono text-[9px] text-zinc-500 text-center leading-relaxed mt-0.5 select-none font-sans">
          {sensorView === "visible"
            ? `REST MODE (VISIBLE LIGHT): Earth shows its natural state. ${isCoarsePointer ? "Tap to reveal CO₂ haze" : "Hover to reveal CO₂ haze"}.`
            : `THERMAL CORE RECON INDEX: Complete 15µm wavelength filters activated. Earth is engulfed by synthetic heat loops. ${isCoarsePointer ? "Tap" : "Hover"} to locate nominal carbon sinks.`}
        </p>

        {/* Diagnostics Panel */}
        <div className="mt-2 p-2 border border-zinc-800 bg-zinc-950/90 rounded font-mono text-[8px] text-zinc-500 w-full select-text text-left">
          <div className="font-bold text-zinc-400 mb-1">// SYSTEM DIAGNOSTICS:</div>
          <div className="space-y-0.5">
            {debugLogs.map((log, i) => (
              <div key={i}>• {log}</div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
});
