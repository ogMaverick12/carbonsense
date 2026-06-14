import React, { useState, useRef, useEffect, useMemo } from "react";
import { Download, Share2, Award, User, RefreshCw, CheckCircle2, ShieldAlert, Cpu, Check, HelpCircle, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { certificateNameSchema } from "../schemas/validation";
import { carbonSenseStore } from "../lib/store";
import { auth } from "../lib/firebase";
import { checkCertificateEligibility } from "../services/certificateEngine";
import { UserActivityData, CertificateEligibility } from "../types";
import { AnnualCarbonHeroCelebration } from "./AnnualCarbonHeroCelebration";
import healthyEarth from "../assets/images/healthy_earth_1781010556530.png";
import { getAudioContextClass } from "../lib/audio";

interface CertificatePageProps {
  carbonReduction: number;
  totalBaseline: number;
  onNavigateToTab?: (tab: string) => void;
}

export function CertificatePage({ carbonReduction, totalBaseline, onNavigateToTab }: CertificatePageProps) {
  const [profile, setProfile] = useState(() => carbonSenseStore.getProfile());
  const [activities, setActivities] = useState(() => carbonSenseStore.getActivities());

  // Listen to store updates to keep profile and activities fresh in real-time
  useEffect(() => {
    const triggerUpdate = () => {
      setProfile(carbonSenseStore.getProfile());
      setActivities(carbonSenseStore.getActivities());
    };
    const unsub = carbonSenseStore.registerStateListener(triggerUpdate);
    return unsub;
  }, []);

  // Compute UserActivityData from local states
  const userData: UserActivityData = useMemo(() => {
    const totalDaysLogged = profile.totalDaysLogged || 0;
    const committedActionsCount = profile.committedActionsCount || 0;

    // Derived dailyCO2History from current activities log of the store
    const dailyMap = new Map<string, number>();
    activities.forEach(log => {
      dailyMap.set(log.date, (dailyMap.get(log.date) || 0) + log.co2Kg);
    });
    
    const dailyCO2History = Array.from(dailyMap.entries()).map(([date, totalKg]) => ({
      date,
      totalKg: Number(totalKg.toFixed(2))
    })).sort((a, b) => b.date.localeCompare(a.date));

    return {
      totalDaysLogged,
      committedActionsCount,
      dailyCO2History
    };
  }, [profile, activities]);

  // Compute current eligibility parameters
  const eligibility: CertificateEligibility = useMemo(() => {
    return checkCertificateEligibility(userData);
  }, [userData]);

  const [userName, setUserName] = useState(() => {
    return auth.currentUser?.displayName || profile.displayName || "Pilot Candidate";
  });
  
  const [certificateId, setCertificateId] = useState(() => {
    const tierStr = (eligibility?.tier || "bronze").toUpperCase();
    const uidStr = (auth.currentUser?.uid || profile?.uid || "guest").slice(0, 8).toUpperCase();
    let hash = 0;
    for (let i = 0; i < uidStr.length; i++) {
      hash = (hash << 5) - hash + uidStr.charCodeAt(i);
      hash |= 0;
    }
    const stableId = Math.abs(hash) % 10000;
    return `CS-${tierStr}-${uidStr}-${stableId}`;
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasCopiedLink, setHasCopiedLink] = useState(false);
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [nameError, setNameError] = useState("");

  // Populate dynamic stable Certificate ID once the tier or UID details resolve
  useEffect(() => {
    const tierStr = (eligibility.tier || "bronze").toUpperCase();
    const uidStr = (auth.currentUser?.uid || profile.uid || "guest").slice(0, 8).toUpperCase();
    let hash = 0;
    for (let i = 0; i < uidStr.length; i++) {
      hash = (hash << 5) - hash + uidStr.charCodeAt(i);
      hash |= 0;
    }
    const stableId = Math.abs(hash) % 10000;
    setCertificateId(`CS-${tierStr}-${uidStr}-${stableId}`);
  }, [eligibility.tier, profile.uid]);

  // Handle automatic celebration when a certificate becomes unlocked for the user
  useEffect(() => {
    if (eligibility.isEligible) {
      const hasCelebrated = localStorage.getItem(`celebrated_${eligibility.tier}`);
      if (hasCelebrated !== "true") {
        setShowCelebrate(true);
        localStorage.setItem(`celebrated_${eligibility.tier}`, "true");
      }
    }
  }, [eligibility.isEligible, eligibility.tier]);

  const handleNameChange = (val: string) => {
    setUserName(val);
    const parsed = certificateNameSchema.safeParse(val);
    if (!parsed.success) {
      setNameError(parsed.error.issues[0].message);
    } else {
      setNameError("");
    }
  };

  // Stats outputs
  const tier = eligibility.tier;
  const isGold = tier === 'gold';
  const isSilver = tier === 'silver';
  const isBronze = tier === 'bronze';

  const tierColor = isGold ? "#ffe57f" : isSilver ? "#00f0ff" : "#f59e0b"; // bronze/silver/gold themes
  const tierGlow = isGold ? "rgba(212, 175, 55, 0.45)" : isSilver ? "rgba(0, 240, 255, 0.45)" : "rgba(249, 115, 22, 0.45)";
  const tierNameLabel = isGold ? "Planetary Guardian" : isSilver ? "Emission Sentinel" : "Carbon Cadet";
  const tierHeaderLabel = isGold ? "PLANETARY SHIELD ARCHITECTURE" : isSilver ? "ATMOSPHERIC SHIELD PROTOCOL" : "CARBON CADET COCKPIT SENSE";

  // Dynamic values calculated exactly
  const annualOffset = eligibility.progress.carbonOffsetKg;
  const daysLogged = eligibility.progress.daysLogged;
  const equivalentTrees = Number((annualOffset / 21.8).toFixed(1));
  const energyKwhSaved = Math.round(annualOffset * 1.6); // 1.6 kWh saved per kg avoided on grid

  // Canvas ref for 4K rendering
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate QR code helper for on-canvas drawing
  const drawVectorQRCode = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) => {
    ctx.save();
    ctx.fillStyle = color;
    
    // Draw outer boundary ring
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.strokeRect(x, y, size, size);
    
    // Draw 3 classic QR anchors/position corners
    const anchorSize = size * 0.25;
    
    // Top Left
    ctx.fillRect(x + 6, y + 6, anchorSize, anchorSize);
    ctx.fillStyle = "#010204";
    ctx.fillRect(x + 10, y + 10, anchorSize - 8, anchorSize - 8);
    ctx.fillStyle = color;
    ctx.fillRect(x + 13, y + 13, anchorSize - 14, anchorSize - 14);

    // Top Right
    ctx.fillRect(x + size - anchorSize - 6, y + 6, anchorSize, anchorSize);
    ctx.fillStyle = "#010204";
    ctx.fillRect(x + size - anchorSize - 2, y + 10, anchorSize - 8, anchorSize - 8);
    ctx.fillStyle = color;
    ctx.fillRect(x + size - anchorSize + 1, y + 13, anchorSize - 14, anchorSize - 14);

    // Bottom Left
    ctx.fillRect(x + 6, y + size - anchorSize - 6, anchorSize, anchorSize);
    ctx.fillStyle = "#010204";
    ctx.fillRect(x + 10, y + size - anchorSize - 2, anchorSize - 8, anchorSize - 8);
    ctx.fillStyle = color;
    ctx.fillRect(x + 13, y + size - anchorSize + 1, anchorSize - 14, anchorSize - 14);

    // Fill with bit payload
    const bitSize = 8;
    const padding = anchorSize + 10;
    
    for (let bx = padding; bx < size - 6; bx += bitSize) {
      for (let by = 6; by < size - 6; by += bitSize) {
        if (bx > size - padding && by > size - padding) continue;
        if (bx < padding && by > size - padding) continue;
        if (bx > size - padding && by < padding) continue;

        const seed = Math.sin(bx * 0.5 + by * 2.1) * 10000;
        if (seed - Math.floor(seed) > 0.45) {
          ctx.fillStyle = color;
          ctx.fillRect(x + bx, y + by, bitSize - 1, bitSize - 1);
        }
      }
    }

    ctx.fillStyle = color;
    ctx.fillRect(x + size - 24, y + size - 24, 12, 12);
    ctx.fillStyle = "#010204";
    ctx.fillRect(x + size - 20, y + size - 20, 4, 4);

    ctx.restore();
  };

  const renderCertificateToCanvas = (): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        resolve("");
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve("");
        return;
      }

      // 4K Target Dimensions
      canvas.width = 3840;
      canvas.height = 2160;

      // 1. BASE BACKGROUND: Deep interstellar cosmic gradient matching tier atmosphere
      const bgGrad = ctx.createRadialGradient(1920, 1080, 200, 1920, 1080, 2200);
      if (isGold) {
        bgGrad.addColorStop(0, "#1c1a0c"); // Gold core glow
        bgGrad.addColorStop(0.5, "#0b0a04");
        bgGrad.addColorStop(1, "#010204");
      } else if (isSilver) {
        bgGrad.addColorStop(0, "#061524"); // Cyan space core
        bgGrad.addColorStop(0.5, "#030810");
        bgGrad.addColorStop(1, "#010204");
      } else {
        bgGrad.addColorStop(0, "#191206"); // Bronze orange twilight
        bgGrad.addColorStop(0.5, "#0a0703");
        bgGrad.addColorStop(1, "#010204");
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 3840, 2160);

      // 2. FINE PARALLAX STARFIELD LAYER: Cosmic stellar particles
      ctx.save();
      for (let i = 0; i < 400; i++) {
        const x = Math.abs(Math.sin(i * 14.5) * 3840);
        const y = Math.abs(Math.cos(i * 29.35) * 2160);
        const size = (Math.sin(i * 3.7) + 1) * 1.5 + 0.5;
        const opacity = (Math.cos(i * 5.9) + 1) / 2 * 0.8 + 0.2;

        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();

        if (i % 20 === 0) {
          ctx.fillStyle = `${tierColor}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
          ctx.beginPath();
          ctx.arc(x, y, size * 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      // 3. ULTRA-REALISTIC EARTH AND ATHMOSPHERE CO₂ GLOW: Centered at Right
      const earthX = 2750;
      const earthY = 1080;
      const earthRadius = 880;

      // Atmospheric outer gas bloom ring
      ctx.save();
      const glowGrad = ctx.createRadialGradient(earthX, earthY, earthRadius - 50, earthX, earthY, earthRadius + 220);
      if (isGold) {
        glowGrad.addColorStop(0, "rgba(212, 175, 55, 0.45)");
        glowGrad.addColorStop(0.3, "rgba(16, 185, 129, 0.2)");
        glowGrad.addColorStop(0.7, "rgba(212, 175, 55, 0.05)");
      } else if (isSilver) {
        glowGrad.addColorStop(0, "rgba(59, 130, 246, 0.45)");
        glowGrad.addColorStop(0.3, "rgba(0, 240, 255, 0.22)");
        glowGrad.addColorStop(0.7, "rgba(59, 130, 246, 0.05)");
      } else {
        glowGrad.addColorStop(0, "rgba(249, 115, 22, 0.45)");
        glowGrad.addColorStop(0.3, "rgba(245, 158, 11, 0.2)");
        glowGrad.addColorStop(0.7, "rgba(249, 115, 22, 0.05)");
      }
      glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(earthX, earthY, earthRadius + 300, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Target tactical vector circles
      ctx.save();
      ctx.strokeStyle = `${tierColor}25`;
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 20]);
      ctx.beginPath();
      ctx.arc(earthX, earthY, earthRadius + 40, 0, Math.PI * 2);
      ctx.stroke();

      // Exterior compass tick marks around Earth perimeter
      ctx.restore();
      ctx.save();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 1.5;
      for (let angle = 0; angle < 360; angle += 15) {
        const rad = (angle * Math.PI) / 180;
        const startR = earthRadius + 50;
        const endR = earthRadius + (angle % 45 === 0 ? 75 : 62);
        
        ctx.beginPath();
        ctx.moveTo(earthX + Math.cos(rad) * startR, earthY + Math.sin(rad) * startR);
        ctx.lineTo(earthX + Math.cos(rad) * endR, earthY + Math.sin(rad) * endR);
        ctx.stroke();
      }
      ctx.restore();

      // Render actual high-res healthy Earth image onto canvas safely
      const earthImage = new Image();
      earthImage.src = healthyEarth;
      earthImage.crossOrigin = "anonymous";
      earthImage.onload = () => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(earthX, earthY, earthRadius, 0, Math.PI * 2);
        ctx.clip();
        
        ctx.drawImage(earthImage, earthX - earthRadius, earthY - earthRadius, earthRadius * 2, earthRadius * 2);
        
        // Overlay terminator shadow
        const shadowGrad = ctx.createRadialGradient(
          earthX - 450, earthY - 450, earthRadius - 200, 
          earthX, earthY, earthRadius + 200
        );
        shadowGrad.addColorStop(0, "rgba(255, 255, 255, 0.08)");
        shadowGrad.addColorStop(0.4, "rgba(0, 0, 0, 0.2)");
        shadowGrad.addColorStop(0.8, "rgba(0, 0, 0, 0.85)");
        shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0.98)");
        
        ctx.fillStyle = shadowGrad;
        ctx.beginPath();
        ctx.arc(earthX, earthY, earthRadius + 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 4. CERTIFICATE BORDERS
        ctx.save();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
        ctx.lineWidth = 3;
        ctx.strokeRect(100, 100, 3640, 1960);

        ctx.strokeStyle = `${tierColor}45`;
        ctx.lineWidth = 1;
        ctx.strokeRect(115, 115, 3610, 1930);

        // Corner crosshairs
        const drawCrosshair = (cx: number, cy: number) => {
          ctx.strokeStyle = `${tierColor}80`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(cx - 30, cy); ctx.lineTo(cx + 30, cy);
          ctx.moveTo(cx, cy - 30); ctx.lineTo(cx, cy + 30);
          ctx.stroke();
        };
        drawCrosshair(100, 100);
        drawCrosshair(3740, 100);
        drawCrosshair(100, 2060);
        drawCrosshair(3740, 2060);
        ctx.restore();

        // 5. COMMENDATION TYPOGRAPHY
        const leftColX = 220;

        ctx.save();
        ctx.font = "bold 26px 'JetBrains Mono', monospace";
        ctx.fillStyle = tierColor;
        ctx.shadowColor = tierGlow;
        ctx.shadowBlur = 10;
        ctx.fillText(`// ${tierHeaderLabel}`, leftColX, 260);
        ctx.shadowBlur = 0;

        ctx.font = "bold 18px 'JetBrains Mono', monospace";
        ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
        ctx.fillText(`VERIFIED ${tierNameLabel.toUpperCase()} CO₂ REDUCTION STATUS • CARBON_SENSE_REGISTRY`, leftColX, 300);

        // Huge Title: FLIGHT DECREE
        ctx.font = "900 86px 'Inter', sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.fillText("PLANETARY COMMENDATION", leftColX, 420);

        ctx.font = "900 86px 'Inter', sans-serif";
        ctx.strokeStyle = tierColor;
        ctx.lineWidth = 3;
        ctx.strokeText(tierNameLabel.toUpperCase(), leftColX + 2, 510);
        ctx.fillText(tierNameLabel.toUpperCase(), leftColX, 510);

        // Separator line
        ctx.strokeStyle = `${tierColor}60`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(leftColX, 560);
        ctx.lineTo(leftColX + 850, 560);
        ctx.stroke();

        // Body message explanation
        ctx.font = "300 24px 'Inter', sans-serif";
        ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
        const textLines = [
          `This certificate officially confirms that the pilot named below has earned the verified`,
          `CarbonSense status of ${tierNameLabel}. By successfully logging ${daysLogged} days inside`,
          `the carbon ledger, remaining under optimal emission limits, and contributing verified structural`,
          `avoidance actions, the recipient has recorded substantial and real ecological relief.`
        ];
        textLines.forEach((line, idx) => {
          ctx.fillText(line, leftColX, 630 + idx * 42);
        });

        // Recipient label
        ctx.font = "bold 22px 'JetBrains Mono', monospace";
        ctx.fillStyle = tierColor;
        ctx.fillText("CRITICAL COMMENDATION GRANTED TO:", leftColX, 860);

        // Candidate Recipient Name
        ctx.font = "bold 72px 'Inter', sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "rgba(255, 255, 255, 0.15)";
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 4;
        ctx.fillText(userName.toUpperCase(), leftColX, 950);
        ctx.shadowColor = "transparent";

        // Verified Metrics Header
        ctx.font = "bold 22px 'JetBrains Mono', monospace";
        ctx.fillStyle = tierColor;
        ctx.fillText("VERIFIED ON-SITE ECO-SYSTEM FLIGHT METRICS //", leftColX, 1080);

        // Three Grid-Aligned Data Stat Blocks
        const drawDataBlock = (bx: number, by: number, width: number, height: number, label: string, val: string, metricUnit: string) => {
          ctx.save();
          ctx.fillStyle = "rgba(2, 4, 8, 0.9)";
          ctx.fillRect(bx, by, width, height);

          ctx.strokeStyle = `${tierColor}30`;
          ctx.lineWidth = 1;
          ctx.strokeRect(bx, by, width, height);

          ctx.fillStyle = tierColor;
          ctx.fillRect(bx, by, 6, height);

          ctx.font = "bold 18px 'JetBrains Mono', monospace";
          ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
          ctx.fillText(label.toUpperCase(), bx + 30, by + 40);

          ctx.font = "bold 44px 'Inter', sans-serif";
          ctx.fillStyle = "#ffffff";
          ctx.fillText(val, bx + 30, by + 105);

          ctx.font = "bold 18px 'JetBrains Mono', monospace";
          ctx.fillStyle = tierColor;
          ctx.fillText(metricUnit, bx + 30 + ctx.measureText(val).width + 12, by + 98);

          ctx.restore();
        };

        const blockY = 1120;
        const bWidth = 470;
        const bHeight = 160;

        drawDataBlock(leftColX, blockY, bWidth, bHeight, "Annual Net Carbon Avoided", `${(annualOffset / 1000).toFixed(2)}`, "TONNES CO₂e");
        drawDataBlock(leftColX + bWidth + 30, blockY, bWidth, bHeight, "Equivalent Trees Energized", `${equivalentTrees}`, "MATURE TREES / YR");
        drawDataBlock(leftColX + (bWidth * 2) + 60, blockY, bWidth, bHeight, "Annual Clean Electricity Saved", `${energyKwhSaved.toLocaleString()}`, "KWH ENERGY");

        // Footer Metadata, Verification details, ID, QR code
        const footerY = 1430;

        ctx.font = "bold 18px 'JetBrains Mono', monospace";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(`UNIQUE CONTRACT IDENTIFICATION: ${certificateId}`, leftColX, footerY);

        ctx.font = "300 18px 'Inter', sans-serif";
        ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
        ctx.fillText("VALIDATION STATE: SECURED AND VERIFIED VIA DECENTRALIZED LEO-ORBIT SENSE SYSTEM", leftColX, footerY + 30);

        // Verification QR code
        const qrSize = 210;
        const qrX = leftColX + 1150;
        const qrY = footerY - 50;
        drawVectorQRCode(ctx, qrX, qrY, qrSize, tierColor);

        // Label for QR code
        ctx.font = "bold 14px 'JetBrains Mono', monospace";
        ctx.fillStyle = tierColor;
        ctx.fillText("SECURE METRIC VERIFICATION", qrX, qrY + qrSize + 28);

        // Signatures
        const sigLineY = 1750;

        // Signature 1: CarbonSense
        const sigLineX = leftColX;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(sigLineX, sigLineY);
        ctx.lineTo(sigLineX + 380, sigLineY);
        ctx.stroke();

        ctx.font = "bold italic 22px 'Inter', sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.fillText("Verified by CarbonSense", sigLineX + 20, sigLineY - 18);

        ctx.font = "bold 16px 'JetBrains Mono', monospace";
        ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
        ctx.fillText("ATMOSPHERIC VERIFICATION GROUP", sigLineX, sigLineY + 30);

        // Signature 2: Earth Systems Optimization Chair
        const sigLineX2 = leftColX + 500;
        ctx.beginPath();
        ctx.moveTo(sigLineX2, sigLineY);
        ctx.lineTo(sigLineX2 + 380, sigLineY);
        ctx.stroke();

        ctx.font = "bold italic 22px 'Inter', sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.fillText("Leo-Sense Registry board", sigLineX2 + 20, sigLineY - 18);

        ctx.font = "bold 16px 'JetBrains Mono', monospace";
        ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
        ctx.fillText("CHAIR OF GLOBAL REDUCTION", sigLineX2, sigLineY + 30);

        ctx.restore();
        resolve(canvas.toDataURL("image/png"));
      };
    });
  };

  const handleDownloadPNG = () => {
    if (nameError || !userName) return;
    setIsGenerating(true);
    
    // Play sound effects
    try {
      const AudioContextClass = getAudioContextClass();
      if (AudioContextClass) {
        const audioCtx = new AudioContextClass();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(1100, audioCtx.currentTime);
        osc.frequency.setValueAtTime(1800, audioCtx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.38);
      }
    } catch (_) {
      // intentional: audio/storage failures are non-fatal; swallowing here is correct
    }

    setTimeout(async () => {
      try {
        const pngDataUri = await renderCertificateToCanvas();
        const downloadLink = document.createElement("a");
        downloadLink.href = pngDataUri;
        downloadLink.download = `CarbonSense_PlanetaryCommendation_${userName.replace(/\s+/g, "_")}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      } catch (e) {
        console.error("Failed compiling png export", e);
      } finally {
        setIsGenerating(false);
      }
    }, 400);
  };

  const handleDownloadPDF = () => {
    if (nameError || !userName) return;
    setIsGenerating(true);
    
    try {
      const AudioContextClass = getAudioContextClass();
      if (AudioContextClass) {
        const audioCtx = new AudioContextClass();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(900, audioCtx.currentTime);
        osc.frequency.setValueAtTime(1500, audioCtx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.32);
      }
    } catch (_) {
      // intentional: audio/storage failures are non-fatal; swallowing here is correct
    }

    setTimeout(async () => {
      try {
        const pngDataUri = await renderCertificateToCanvas();
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>CarbonSense Premium Certificate Commendation</title>
                <style>
                  body {
                    margin: 0;
                    background: #010204;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                  }
                  img {
                    width: 100%;
                    max-width: 100%;
                    object-fit: contain;
                    border: none;
                  }
                  @page {
                    size: landscape;
                    margin: 0;
                  }
                  @media print {
                    body { background: #010204; -webkit-print-color-adjust: exact; }
                    img { width: 100vw; height: 100vh; object-fit: contain; }
                  }
                </style>
              </head>
              <body>
                <img src="${pngDataUri}" alt="CarbonSense verified certificate for printing" onload="window.print(); window.close();" />
              </body>
            </html>
          `);
          printWindow.document.close();
        }
      } catch (e) {
        console.error("Failed compiling print document", e);
      } finally {
        setIsGenerating(false);
      }
    }, 400);
  };

  const handleShare = () => {
    setHasCopiedLink(true);
    try {
      navigator.clipboard.writeText(window.location.href);
      const AudioContextClass = getAudioContextClass();
      if (AudioContextClass) {
        const audioCtx = new AudioContextClass();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(1400, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.1);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.12);
      }
    } catch (_) {
      // intentional: audio/storage failures are non-fatal; swallowing here is correct
    }
    setTimeout(() => {
      setHasCopiedLink(false);
    }, 2000);
  };

  // ----------------------------------------------------
  // Render Gate / Routing guard
  // Show STATE A (Locked State / Progress Gate View) if not eligible!
  // ----------------------------------------------------
  if (!eligibility.isEligible) {
    const nextTier = eligibility.nextTierName || "Carbon Cadet (Bronze)";
    const reqs = eligibility.nextTierRequirements;
    
    // Calculate projected date based on current daily logging pace
    const uniqueDates = Array.from(new Set(activities.map(a => a.date)));
    let daysDiff = 1;
    if (uniqueDates.length > 1) {
      const dates = uniqueDates.map(d => new Date(d).getTime());
      const minDate = Math.min(...dates);
      const maxDate = Math.max(...dates);
      daysDiff = Math.max(1, Math.round((maxDate - minDate) / (1000 * 60 * 60 * 24)));
    }
    
    const loggingPace = uniqueDates.length > 0 ? (uniqueDates.length / daysDiff) : 0; // average unique log days per calendar day
    const daysLogged = eligibility.progress.daysLogged;
    const daysRequiredValue = eligibility.progress.daysRequired;
    const daysRemaining = Math.max(0, daysRequiredValue - daysLogged);
    
    let formattedProjection = "";
    if (loggingPace > 0) {
      const projectedDaysNeeded = Math.ceil(daysRemaining / loggingPace);
      const projDate = new Date();
      projDate.setDate(projDate.getDate() + projectedDaysNeeded);
      formattedProjection = projDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } else {
      formattedProjection = "Log your first activity to start calendar projection";
    }
    
    // Requirements breakdown
    const requirementsRows = [
      {
        id: "days-logged",
        label: "Days Active Tracking",
        current: eligibility.progress.daysLogged,
        required: eligibility.progress.daysRequired,
        unit: "days",
        isMet: eligibility.progress.daysLogged >= eligibility.progress.daysRequired,
        barPct: Math.min(100, (eligibility.progress.daysLogged / eligibility.progress.daysRequired) * 100),
        statusText: eligibility.progress.daysLogged >= eligibility.progress.daysRequired 
          ? "Requirement met!" 
          : `${eligibility.progress.daysRequired - eligibility.progress.daysLogged} more days required`
      },
      {
        id: "actions-committed",
        label: "Cooperative Actions Committed",
        current: eligibility.progress.actionsCommitted,
        required: eligibility.progress.actionsRequired,
        unit: "actions",
        isMet: eligibility.progress.actionsCommitted >= eligibility.progress.actionsRequired,
        barPct: Math.min(100, (eligibility.progress.actionsCommitted / eligibility.progress.actionsRequired) * 100),
        statusText: eligibility.progress.actionsCommitted >= eligibility.progress.actionsRequired
          ? "Requirement met!" 
          : `Commit ${eligibility.progress.actionsRequired - eligibility.progress.actionsCommitted} more action swaps in Action Hub`
      },
      {
        id: "avg-co2",
        label: "Average Daily CO₂ Emissions",
        current: eligibility.progress.avgCO2,
        required: eligibility.progress.avgCO2Required,
        unit: "kg/day",
        isMet: eligibility.progress.avgCO2 > 0 && eligibility.progress.avgCO2 < eligibility.progress.avgCO2Required,
        // Lower is better: design bar such that it fills up to 100% when below the limit
        barPct: eligibility.progress.avgCO2 === 0 ? 0 : Math.min(100, Math.max(10, (eligibility.progress.avgCO2Required / eligibility.progress.avgCO2) * 80)),
        statusText: (eligibility.progress.avgCO2 > 0 && eligibility.progress.avgCO2 < eligibility.progress.avgCO2Required)
          ? "Footprint Optimized!"
          : eligibility.progress.avgCO2 === 0 
            ? "Log activities to establish your daily average" 
            : `Currently ${(eligibility.progress.avgCO2 - eligibility.progress.avgCO2Required).toFixed(1)} kg over safe daily threshold`
      },
      {
        id: "days-under",
        label: "Logged Days Under 6.8 kg Budget",
        current: eligibility.progress.daysUnderBudget,
        required: eligibility.progress.daysUnderBudgetRequired,
        unit: "days",
        isMet: eligibility.progress.daysUnderBudget >= eligibility.progress.daysUnderBudgetRequired,
        barPct: eligibility.progress.daysUnderBudgetRequired === 0 ? 100 : Math.min(100, (eligibility.progress.daysUnderBudget / eligibility.progress.daysUnderBudgetRequired) * 100),
        statusText: eligibility.progress.daysUnderBudget >= eligibility.progress.daysUnderBudgetRequired
          ? "Requirement met!"
          : `${eligibility.progress.daysUnderBudgetRequired - eligibility.progress.daysUnderBudget} more optimal days required`
      }
    ];

    const avgCO2Val = eligibility.progress.avgCO2;
    const isBronzeUnlocked = daysLogged >= 7 && eligibility.progress.actionsCommitted >= 1 && avgCO2Val > 0 && avgCO2Val < 8.0;
    const isSilverUnlocked = daysLogged >= 21 && eligibility.progress.actionsCommitted >= 3 && avgCO2Val > 0 && avgCO2Val < 6.8 && eligibility.progress.daysUnderBudget >= 5;
    const isGoldUnlocked = daysLogged >= 30 && eligibility.progress.actionsCommitted >= 5 && avgCO2Val > 0 && avgCO2Val < 5.2 && eligibility.progress.daysUnderBudget >= 10 && eligibility.progress.carbonOffsetKg > 0;

    return (
      <div className="w-full bg-[#020306]/90 border border-white/5 p-6 md:p-10 rounded-xl backdrop-blur-md max-w-5xl mx-auto select-text pointer-events-auto">
        <div className="flex flex-col items-center text-center space-y-6 max-w-2xl mx-auto">
          
          <div className="relative">
            <div className="absolute inset-[-10px] rounded-full bg-[#f97316]/10 blur-xl animate-pulse"></div>
            <div className="w-16 h-16 rounded-full border border-[#f97316]/30 flex items-center justify-center text-[#f97316] bg-black/40">
              <ShieldAlert size={32} />
            </div>
          </div>

          <div className="space-y-2">
            <span className="font-mono text-[10px] text-[#f59e0b] tracking-[0.25em] block uppercase font-bold" style={{ textTransform: 'uppercase' }}>
              Secure Access Decree Locked
            </span>
            <h2 className="font-display font-[850] text-3xl text-white uppercase tracking-wider">
              Certificate Eligibility Gated
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed font-light">
              CarbonSense credentials require **EARNED** eligibility. Live landscape 4K certificate exports are restricted until you complete the required tracking milestones.
            </p>
          </div>

          {/* 3-Tier Horizontal Progression Ladder */}
          <div className="w-full bg-zinc-950/80 border border-white/5 rounded-lg p-6 text-left">
            <span className="font-mono text-[8.5px] text-zinc-500 block uppercase tracking-widest font-bold mb-4" style={{ textTransform: 'uppercase' }}>
              Certificate Eligibility Ladder
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              {/* Bronze Tier Card */}
              <div className={`p-4 rounded border transition-all duration-300 ${
                isBronzeUnlocked 
                  ? "bg-amber-950/25 border-amber-500/40 text-amber-200" 
                  : "bg-black/40 border-white/5 text-zinc-400"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[9px] uppercase tracking-wider font-bold" style={{ textTransform: 'uppercase' }}>Tier 01: Bronze</span>
                  {isBronzeUnlocked ? (
                    <CheckCircle2 size={14} className="text-amber-400" />
                  ) : (
                    <ShieldAlert size={14} className="text-zinc-600" />
                  )}
                </div>
                <h3 className="text-white text-sm font-bold tracking-wide">Carbon Cadet</h3>
                <ul className="mt-3 space-y-1 font-mono text-[9.5px] leading-relaxed">
                  <li className={daysLogged >= 7 ? "text-[#39ff14]" : "text-zinc-500"}>
                    • Days Logged: {daysLogged}/7
                  </li>
                  <li className={eligibility.progress.actionsCommitted >= 1 ? "text-[#39ff14]" : "text-zinc-500"}>
                    • Action Hub Swaps: {eligibility.progress.actionsCommitted}/1
                  </li>
                  <li className={(avgCO2Val > 0 && avgCO2Val < 8.0) ? "text-[#39ff14]" : "text-zinc-500"}>
                    • Avg CO₂: {avgCO2Val > 0 ? `${avgCO2Val.toFixed(1)}` : "0"}/8.0 kg
                  </li>
                </ul>
              </div>

              {/* Silver Tier Card */}
              <div className={`p-4 rounded border transition-all duration-300 ${
                isSilverUnlocked 
                  ? "bg-cyan-950/25 border-cyan-500/40 text-cyan-200" 
                  : "bg-black/40 border-white/5 text-zinc-400"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[9px] uppercase tracking-wider font-bold" style={{ textTransform: 'uppercase' }}>Tier 02: Silver</span>
                  {isSilverUnlocked ? (
                    <CheckCircle2 size={14} className="text-[#00f0ff]" />
                  ) : (
                    <ShieldAlert size={14} className="text-zinc-600" />
                  )}
                </div>
                <h3 className="text-white text-sm font-bold tracking-wide">Emission Sentinel</h3>
                <ul className="mt-3 space-y-1 font-mono text-[9.5px] leading-relaxed">
                  <li className={daysLogged >= 21 ? "text-[#39ff14]" : "text-zinc-500"}>
                    • Days Logged: {daysLogged}/21
                  </li>
                  <li className={eligibility.progress.actionsCommitted >= 3 ? "text-[#39ff14]" : "text-zinc-500"}>
                    • Action Hub Swaps: {eligibility.progress.actionsCommitted}/3
                  </li>
                  <li className={(avgCO2Val > 0 && avgCO2Val < 6.8) ? "text-[#39ff14]" : "text-zinc-500"}>
                    • Avg CO₂: {avgCO2Val > 0 ? `${avgCO2Val.toFixed(1)}` : "0"}/6.8 kg
                  </li>
                  <li className={eligibility.progress.daysUnderBudget >= 5 ? "text-[#39ff14]" : "text-zinc-500"}>
                    • Budget Days: {eligibility.progress.daysUnderBudget}/5
                  </li>
                </ul>
              </div>

              {/* Gold Tier Card */}
              <div className={`p-4 rounded border transition-all duration-300 ${
                isGoldUnlocked 
                  ? "bg-yellow-950/25 border-yellow-500/40 text-yellow-250" 
                  : "bg-black/40 border-white/5 text-zinc-400"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[9px] uppercase tracking-wider font-bold" style={{ textTransform: 'uppercase' }}>Tier 03: Gold</span>
                  {isGoldUnlocked ? (
                    <CheckCircle2 size={14} className="text-yellow-300" />
                  ) : (
                    <ShieldAlert size={14} className="text-zinc-600" />
                  )}
                </div>
                <h3 className="text-white text-sm font-bold tracking-wide">Planetary Guardian</h3>
                <ul className="mt-3 space-y-1 font-mono text-[9.5px] leading-relaxed">
                  <li className={daysLogged >= 30 ? "text-[#39ff14]" : "text-zinc-500"}>
                    • Days Logged: {daysLogged}/30
                  </li>
                  <li className={eligibility.progress.actionsCommitted >= 5 ? "text-[#39ff14]" : "text-zinc-500"}>
                    • Action Hub Swaps: {eligibility.progress.actionsCommitted}/5
                  </li>
                  <li className={(avgCO2Val > 0 && avgCO2Val < 5.2) ? "text-[#39ff14]" : "text-zinc-500"}>
                    • Avg CO₂: {avgCO2Val > 0 ? `${avgCO2Val.toFixed(1)}` : "0"}/5.2 kg
                  </li>
                  <li className={eligibility.progress.daysUnderBudget >= 10 ? "text-[#39ff14]" : "text-zinc-500"}>
                    • Budget Days: {eligibility.progress.daysUnderBudget}/10
                  </li>
                  <li className={eligibility.progress.carbonOffsetKg > 0 ? "text-[#39ff14]" : "text-zinc-500"}>
                    • Offset: {eligibility.progress.carbonOffsetKg.toFixed(0)}/1 kg
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Target Tier Requirements Panel */}
          <div className="w-full space-y-4 text-left border-y border-white/5 py-6">
            <h3 className="font-mono text-[11px] text-white tracking-[0.2em] uppercase font-extrabold flex items-center gap-2" style={{ textTransform: 'uppercase' }}>
              <Cpu size={14} className="text-[#f97316]" />
              <span>Milestone Requirements to Unlock</span>
            </h3>

            <div className="space-y-4">
              {requirementsRows.map((row) => (
                <div key={row.id} className="space-y-1.5">
                  <div className="flex justify-between items-end text-xs">
                    <div className="flex items-center gap-2">
                      {row.isMet ? (
                        <CheckCircle2 size={13} className="text-[#39ff14] shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-zinc-600/60 shrink-0" />
                      )}
                      <span className="text-white font-medium">{row.label}</span>
                    </div>
                    <span className="font-mono text-zinc-400 text-[11px]">
                      {row.current.toLocaleString()} {row.unit} <span className="text-zinc-600 font-normal">/ {row.required} {row.unit}</span>
                    </span>
                  </div>

                  <div className="w-full bg-black border border-white/[0.03] h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${row.isMet ? "bg-[#39ff14]" : "bg-[#f97316]"}`}
                      style={{ width: `${row.barPct}%` }}
                    />
                  </div>
                  <span className="font-mono text-[9px] text-zinc-500 uppercase block tracking-wider font-light" style={{ textTransform: 'uppercase' }}>
                    {row.statusText}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tactical calendar projection */}
          <div className="w-full bg-[#f97316]/5 border border-[#f97316]/10 p-4 rounded-lg text-left">
            <span className="font-mono text-[8.5px] text-[#f97316] uppercase tracking-widest font-bold block" style={{ textTransform: 'uppercase' }}>
              Tactical Calendar Projection
            </span>
            <div className="md:flex justify-between items-center mt-1">
              <span className="text-white text-sm font-semibold">
                Projected Achievement Date for {nextTier.split(" ")[0]}:
              </span>
              <span className="font-semibold text-[#f59e0b] text-sm md:text-right mt-1 md:mt-0 block">
                {formattedProjection}
              </span>
            </div>
          </div>

          {/* CTA Trigger redirection back to cockpit */}
          <div className="pt-4 w-full">
            <button
              onClick={() => onNavigateToTab?.("logger")}
              className="w-full py-4 bg-white text-black hover:bg-[#f97316] hover:text-black font-mono text-[11px] tracking-[0.25em] font-extrabold uppercase transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a3e635]"
              style={{ textTransform: 'uppercase' }}
            >
              <span>Log an Activity Today</span>
              <ArrowRight size={14} />
            </button>
          </div>

        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // STATE B (Eligible State / REDESIGNED PREVIEW EDITOR)
  // ----------------------------------------------------
  return (
    <div className="w-full flex flex-col xl:flex-row gap-8 py-5 h-full z-10 relative select-text pointer-events-auto">
      {/* Offscreen 4K landscape high fidelity drawing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Confetti & Sound Fanfare Celebration */}
      <AnnualCarbonHeroCelebration 
        isOpen={showCelebrate}
        onClose={() => setShowCelebrate(false)}
        carbonReductionKg={annualOffset}
      />

      {/* LEFT: Redesigned dynamic controls */}
      <div className="w-full xl:w-[380px] bg-zinc-950/40 border border-white/5 p-6 rounded-lg backdrop-blur-md flex flex-col justify-between">
        <div className="space-y-6">
          <div className="space-y-2 animate-fade-in">
            <div 
              style={{ color: tierColor }} 
              className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider font-bold"
            >
              <Award size={12} />
              <span>{tierNameLabel} Eligibility Verified</span>
            </div>
            <h2 className="font-display font-[800] text-xl text-white uppercase tracking-wider">
              Earned Credential
            </h2>
            <p className="text-zinc-400 text-xs leading-relaxed font-sans font-light">
              {tier === "bronze" && "Congratulations Pilot Cadet! Your consistent initial tracking efforts have established your first verified baseline. Keep shifting your habits to reach higher tiers."}
              {tier === "silver" && "Outstanding work, Sentinel! By successfully maintaining a low daily carbon footprint and adopting active sustainability options, you are actively healing the atmosphere."}
              {tier === "gold" && "Salutations, Guardian! You have achieved the peak level of environmental stewardship. Your long-term commitment and significant net-negative carbon offsets represent true planetary leadership."}
            </p>
          </div>

          {/* INPUT: Dynamic User Name */}
          <div className="space-y-2">
            <label htmlFor="cert-candidate-name" className="font-mono text-[9px] text-zinc-500 tracking-widest font-bold block uppercase flex items-center gap-1">
              <User size={10} />
              <span>Recon Recipient Name</span>
            </label>
            <input
              id="cert-candidate-name"
              type="text"
              value={userName}
              onChange={(e) => handleNameChange(e.target.value)}
              aria-label="Certificate recipient name"
              aria-invalid={!!nameError}
              aria-describedby={nameError ? "err-cert-name" : undefined}
              className={`w-full bg-black border rounded px-3.5 py-2.5 text-xs font-sans text-white focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a3e635] focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]/30 transition-all duration-300 uppercase tracking-wider ${
                nameError ? "border-red-500" : "border-white/10"
              }`}
              placeholder="e.g. Alexis Vance"
            />
            {nameError && (
              <p id="err-cert-name" className="text-red-500 font-mono text-[8.5px] tracking-wide uppercase">
                ⚠️ {nameError}
              </p>
            )}
          </div>

          <div className="space-y-3 border-t border-white/5 pt-4">
            <span className="font-mono text-[8px] text-zinc-500 block uppercase tracking-widest font-bold">
              Verified Flight Instrumentation Blueprint
            </span>
            
            <div className="grid grid-cols-3 gap-2 font-mono text-[9px]">
              <div className="bg-black/40 border border-white/[0.03] p-2 rounded">
                <span className="text-zinc-500 block uppercase leading-none">CO₂ Saved</span>
                <span className="text-white font-bold block mt-1.5 text-[11px]">
                  {(annualOffset / 1000).toFixed(2)}t/yr
                </span>
              </div>
              <div className="bg-black/40 border border-white/[0.03] p-2 rounded">
                <span className="text-zinc-500 block uppercase leading-none">Trees Seeds</span>
                <span className="text-white font-bold block mt-1.5 text-[11px]">
                  {equivalentTrees}
                </span>
              </div>
              <div className="bg-black/40 border border-white/[0.03] p-2 rounded">
                <span className="text-zinc-500 block uppercase leading-none">kWh Commonly</span>
                <span className="text-white font-bold block mt-1.5 text-[11px]">
                  {energyKwhSaved.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2 border-t border-white/5 pt-4">
            <span className="font-mono text-[8px] text-zinc-500 block uppercase tracking-widest font-bold">
              Qualified Tier Requirements
            </span>
            <div className="space-y-1.5 font-mono text-[9px] text-zinc-400">
              <div className="flex justify-between">
                <span>Days tracking logged:</span>
                <span className="text-white font-bold">{daysLogged} days</span>
              </div>
              <div className="flex justify-between">
                <span>Committed core index:</span>
                <span className="text-white font-bold">{eligibility.progress.actionsCommitted} actions</span>
              </div>
              <div className="flex justify-between">
                <span>Calculated daily CO₂:</span>
                <span className="text-white font-bold">{eligibility.progress.avgCO2.toFixed(1)} kg/day</span>
              </div>
            </div>
          </div>

        </div>

        {/* Dynamic download triggers */}
        <div className="space-y-3 mt-6">
          <button
            onClick={handleDownloadPNG}
            disabled={isGenerating || !!nameError}
            className="w-full py-4 text-black hover:text-black font-mono text-[10px] tracking-[0.3em] font-extrabold uppercase transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a3e635]"
            style={{ backgroundColor: tierColor, textTransform: 'uppercase' }}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Compiling 4K PNG...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download 4K PNG</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={isGenerating || !!nameError}
            className="w-full py-3 border border-white/20 text-white hover:border-white hover:bg-white/5 font-mono text-[9px] tracking-[0.2em] font-semibold uppercase transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a3e635]"
            style={{ textTransform: 'uppercase' }}
          >
            <Cpu className="w-3.5 h-3.5" style={{ color: tierColor }} />
            <span>Export Vector PDF</span>
          </button>

          <button
            onClick={handleShare}
            disabled={!!nameError}
            className="w-full py-3 text-zinc-400 hover:text-white font-mono text-[9px] tracking-[0.2em] uppercase transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a3e635]"
            style={{ textTransform: 'uppercase' }}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{hasCopiedLink ? "Contract Link Copied" : "Share Credential Contract"}</span>
          </button>
        </div>
      </div>

      {/* RIGHT: Live Responsive 4K Aspect Ratio Preview Frame */}
      <div className="flex-1 flex flex-col justify-center items-center">
        <div 
          className="w-full max-w-[850px] aspect-[16/9] bg-[#020306] rounded-lg shadow-2xl relative overflow-hidden flex flex-col justify-between p-6 sm:p-10 select-none group/view border transition-all duration-500"
          style={{ borderColor: `${tierColor}45` }}
        >
          {/* Subtle cosmic space textures inside preview */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#0a1324]/80 via-[#040710]/95 to-[#010204]/98 pointer-events-none z-0"></div>
          
          <div className="absolute inset-4 border border-white/5 pointer-events-none z-[1]"></div>
          <div className="absolute inset-5 border pointer-events-none z-[1]" style={{ borderColor: `${tierColor}12` }}></div>

          {/* TOP SECTIONS */}
          <div className="flex justify-between items-start relative z-10 w-full animate-fade-in">
            <div>
              <div 
                className="flex items-center gap-1.5 font-mono text-[7px] sm:text-[9px] font-bold uppercase tracking-[0.2em]"
                style={{ color: tierColor }}
              >
                <Award size={12} />
                <span>{tierHeaderLabel}</span>
              </div>
              <h3 className="font-display font-[800] text-sm sm:text-lg text-white mt-1 uppercase tracking-wide" style={{ textTransform: 'uppercase' }}>
                Planetary Commendation
              </h3>
            </div>
            
            <div className="font-mono text-right text-[6px] sm:text-[8px] text-zinc-500 uppercase tracking-widest leading-none hidden sm:block" style={{ textTransform: 'uppercase' }}>
              Pilot Rank: {tierNameLabel.toUpperCase()}<br />
              Sector Security: Active
            </div>
          </div>

          {/* CENTER: Planet rotating depending on tier colors */}
          <div className="absolute top-1/2 -right-20 -translate-y-1/2 w-[340px] h-[340px] sm:w-[460px] sm:h-[460px] rounded-full pointer-events-none z-[2] flex items-center justify-center">
            <div 
              className="absolute inset-[-10%] rounded-full blur-2xl transition-all duration-500"
              style={{ backgroundColor: `${tierColor}18` }}
            ></div>
            
            <div className="absolute inset-[-4%] rounded-full border border-dashed animate-spin-slow" style={{ borderColor: `${tierColor}15` }}></div>

            <img
              src={healthyEarth}
              alt="Earth"
              width={460}
              height={460}
              className="w-full h-full object-cover rounded-full opacity-85 shadow-[inset_0_0_50px_rgba(0,0,0,0.95)]"
            />
          </div>

          {/* LEFT: Commendation Recipient Text details */}
          <div className="relative z-10 max-w-[65%] space-y-3 sm:space-y-4 my-auto">
            <div className="space-y-0.5">
              <span className="font-mono text-[6px] sm:text-[8px] text-zinc-500 uppercase tracking-widest font-semibold block" style={{ textTransform: 'uppercase' }}>
                This Certificate Is Officially Concurrent To
              </span>
              <h1 className="font-display font-extrabold text-[#ffffff] text-xl sm:text-2xl md:text-3.5xl uppercase tracking-wider leading-none drop-shadow">
                {userName || "Pilot Candidate"}
              </h1>
            </div>

            <p className="text-zinc-300 font-sans text-[7.5px] sm:text-[9.5px] leading-relaxed font-light">
              For executing exceptional structural lifestyle overrule actions causing real-time verified carbon footprint deficits, thereby stabilizing essential low-Earth orbital telemetry arrays and contributing to cooperative global ecosystem restoration goals.
            </p>

            {/* Dynamic visual stats panels in preview */}
            <div className="grid grid-cols-2 gap-2 max-w-[320px] font-mono text-[7px] sm:text-[9px] pt-1">
              <div className="bg-black/70 p-1.5 rounded flex items-center justify-between text-zinc-400 border" style={{ borderColor: `${tierColor}15` }}>
                <span className="text-[7.5px] uppercase animate-none" style={{ textTransform: 'uppercase' }}>Carbon Deployed:</span>
                <span className="font-bold ml-1" style={{ color: tierColor }}>{(annualOffset / 1000).toFixed(2)}t/yr</span>
              </div>

              <div className="bg-black/70 p-1.5 rounded flex items-center justify-between text-zinc-400 border" style={{ borderColor: `${tierColor}15` }}>
                <span className="text-[7.5px] uppercase animate-none" style={{ textTransform: 'uppercase' }}>Trees Energized:</span>
                <span className="font-bold ml-1 text-white">{equivalentTrees}</span>
              </div>
            </div>
          </div>

          {/* BOTTOM SECTION */}
          <div className="flex justify-between items-end relative z-10 w-full pt-2 border-t border-white/5">
            <div className="space-y-1 text-left font-mono">
              <span className="text-[6px] sm:text-[8px] text-zinc-400 font-semibold block" style={{ textTransform: 'uppercase' }}>
                Verified Contract ID:
              </span>
              <span className="text-white text-[7px] sm:text-[9px] font-extrabold block selection:bg-[#00f0ff]/30">
                {certificateId || "CS-NASA-C08FC2-38B"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right font-mono text-[6px] sm:text-[8px] text-zinc-500 hidden md:block" style={{ textTransform: 'uppercase' }}>
                <span>Verification Status: CONFIRMED</span>
              </div>
              
              {/* Mini representation of QR matrix */}
              <div className="w-10 h-10 p-0.5 rounded bg-black/80 flex items-center justify-center border" style={{ borderColor: `${tierColor}30` }}>
                <div className="grid grid-cols-5 gap-0.5 w-full h-full opacity-80">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`rounded-xs`} 
                      style={{ 
                        backgroundColor: (i % 3 === 0 || i % 4 === 1 || i === 0 || i === 4 || i === 20 || i === 24) ? tierColor : "transparent" 
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom microcopy */}
        <p className="text-[9px] font-mono text-zinc-600 mt-3 text-center uppercase tracking-wider">
          * Cinematic 4K preview is auto-fitted. Downloads are written raw at 3840×2160 pixels.
        </p>
      </div>
    </div>
  );
}
