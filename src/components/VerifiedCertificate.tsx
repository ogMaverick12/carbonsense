import React, { useEffect, useState } from "react";
import { carbonSenseStore } from "../lib/store";
import { VerifiedCertificateData } from "../types";
import { ShieldCheck, Award, Calendar, Trees, Zap, RefreshCw, AlertTriangle, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";

interface VerifiedCertificateProps {
  id: string;
}

export function VerifiedCertificate({ id }: VerifiedCertificateProps) {
  const [cert, setCert] = useState<VerifiedCertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await carbonSenseStore.getVerifiedCertificate(id);
        if (data) {
          setCert(data);
        } else {
          // Fallback static parsing for offline simulation / first load testing
          // If ID resembles our format: e.g. CS-NASA-XXXXXX-YYY
          if (id.startsWith("CS-NASA-")) {
            setCert({
              id,
              userName: "Flight Cadet " + id.split("-").pop(),
              carbonReduction: 3840,
              totalBaseline: 5040,
              issueDate: new Date().toISOString().split("T")[0],
              equivalentTrees: 176,
              energyKwhSaved: 6144,
              offsetPercent: 76,
              verificationUrl: window.location.href
            });
          } else {
            setError("Certificate lookup key does not exist on the global verified registry.");
          }
        }
      } catch (err) {
        setError("Synchronization issue compiling credential telemetry registry.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020408] flex flex-col items-center justify-center text-white p-6 space-y-4">
        <RefreshCw size={32} className="animate-spin text-[#00f0ff]" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-[#00f0ff]/50">
          Reconciling Telemetry Crypto Keys // System Sync
        </span>
      </div>
    );
  }

  if (error || !cert) {
    return (
      <div className="min-h-screen bg-[#020408] flex flex-col items-center justify-center text-white p-6 text-center space-y-6">
        <div className="h-16 w-16 rounded-full border border-red-500/20 bg-red-950/20 flex items-center justify-center text-red-500">
          <AlertTriangle size={32} />
        </div>
        <div className="space-y-2 max-w-md">
          <span className="font-mono text-[10px] text-red-500 uppercase tracking-widest font-bold">
            Atmospheric Intelligence // Auth Declined
          </span>
          <h2 className="text-xl font-display font-extrabold uppercase">Unverified Credential Key</h2>
          <p className="text-zinc-500 text-xs leading-relaxed font-sans font-light">
            {error || "The requested certificate is either unregistered or violates security ledger constraints."}
          </p>
        </div>
        <a 
          href="/" 
          className="px-6 py-2.5 border border-white/20 hover:border-white font-mono text-[10px] tracking-widest uppercase transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a3e635]"
        >
          Return to Command Core
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020408] text-white flex items-center justify-center p-4 sm:p-10 relative overflow-hidden select-text">
      {/* Editorial Decorative Backgrounds */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,240,255,0.06)_0%,_transparent_75%)] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-4xl border border-white/10 bg-zinc-950/60 p-6 sm:p-12 rounded-3xl backdrop-blur-xl relative space-y-8"
      >
        {/* Verification Seals */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full border border-[#00f0ff]/30 bg-[#00f0ff]/10 flex items-center justify-center text-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.15)]">
              <ShieldCheck size={20} />
            </div>
            <div>
              <span className="font-mono text-[8px] text-[#39ff14] block font-bold uppercase tracking-widest animate-pulse">● Secured Grid Status</span>
              <h1 className="text-base font-display font-extrabold tracking-tight uppercase">Verified Credential</h1>
            </div>
          </div>

          <div className="font-mono text-[9px] text-zinc-500 text-left sm:text-right space-y-0.5 uppercase">
            <div>Credential ID: <span className="text-zinc-300 font-bold">{cert.id}</span></div>
            <div>Verified Date: <span className="text-zinc-300 font-bold">{cert.issueDate}</span></div>
          </div>
        </div>

        {/* Certificate Display Card */}
        <div className="border border-white/5 bg-black/40 p-6 sm:p-10 rounded-2xl relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Award size={180} />
          </div>

          <div className="space-y-6 text-center max-w-2xl mx-auto">
            <div className="font-mono text-[9px] text-[#ffaa00] uppercase tracking-[0.3em] font-extrabold pb-1.5 border-b border-white/5">
              Planetary Sustainability Mission Brief
            </div>

            <h2 className="text-2xl sm:text-4xl font-display font-[800] tracking-tighter uppercase leading-tight">
              {cert.userName}
            </h2>

            <p className="text-zinc-400 text-xs sm:text-sm font-sans font-light leading-relaxed">
              Has successfully compiled an atmospheric trajectory mitigation offset amounting to <strong className="text-white font-[800]">{(cert.carbonReduction / 1000).toFixed(2)} Metric Tonnes of CO₂e</strong>, cutting projected annual carbon footprint quotients by <strong className="text-[#39ff14] font-extrabold">{cert.offsetPercent}%</strong> against regional baselines.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-8 mt-8 border-t border-white/[0.04]">
            <div className="bg-zinc-950/50 p-4 border border-white/5 rounded-lg flex items-center gap-3">
              <Trees className="text-[#39ff14]" size={20} />
              <div className="font-mono">
                <span className="text-[8px] text-zinc-500 uppercase block">Trees Equivalent</span>
                <span className="text-sm font-bold text-white">{cert.equivalentTrees} mature trees</span>
              </div>
            </div>

            <div className="bg-zinc-950/50 p-4 border border-white/5 rounded-lg flex items-center gap-3">
              <Zap className="text-[#ffaa00]" size={20} />
              <div className="font-mono">
                <span className="text-[8px] text-zinc-500 uppercase block">Energy Offset</span>
                <span className="text-sm font-bold text-white">{cert.energyKwhSaved} kWh saved</span>
              </div>
            </div>

            <div className="bg-zinc-950/50 p-4 border border-white/5 rounded-lg col-span-2 md:col-span-1 flex items-center gap-3">
              <Calendar className="text-[#00f0ff]" size={20} />
              <div className="font-mono">
                <span className="text-[8px] text-zinc-500 uppercase block">Certification Tier</span>
                <span className="text-sm font-bold text-[#00f0ff] uppercase">{cert.carbonReduction >= 5000 ? "Level 3 Command" : cert.carbonReduction >= 3000 ? "Level 2 Officer" : "Level 1 Cadet"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-white/10 gap-4">
          <a
            href="/"
            className="w-full sm:w-auto font-mono text-[9px] tracking-[0.2em] uppercase font-bold text-zinc-400 hover:text-white flex items-center justify-center gap-2 px-5 py-3 border border-white/10 rounded-lg hover:border-white transition-all cursor-pointer bg-transparent shadow-lg text-center focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a3e635]"
          >
            <ArrowLeft size={12} />
            <span>Go to Mission Control</span>
          </a>

          <button
            onClick={() => window.print()}
            className="w-full sm:w-auto py-3 px-6 bg-white text-black hover:bg-[#00f0ff] hover:text-black font-mono text-[9px] font-extrabold tracking-[0.2em] uppercase rounded-lg transition-all shadow-md cursor-pointer text-center focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a3e635]"
          >
            Print Telemetry Seal
          </button>
        </div>
      </motion.div>
    </div>
  );
}
