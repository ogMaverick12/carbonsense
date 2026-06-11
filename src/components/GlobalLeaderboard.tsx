import React, { useMemo, useState, useEffect } from "react";
import { Globe, TrendingDown, Calendar, ClipboardList, Lock, Activity } from "lucide-react";
import { carbonSenseStore } from "../lib/store";

interface GlobalLeaderboardProps {
  userReductionKg: number;
  userName: string;
  userLocation: string;
}

export function GlobalLeaderboard({ userReductionKg, userName, userLocation }: GlobalLeaderboardProps) {
  const [profile, setProfile] = useState(() => carbonSenseStore.getProfile());
  const [activities, setActivities] = useState(() => carbonSenseStore.getActivities());

  useEffect(() => {
    const unsub = carbonSenseStore.registerStateListener(() => {
      setProfile(carbonSenseStore.getProfile());
      setActivities(carbonSenseStore.getActivities());
    });
    return unsub;
  }, []);

  const totalCo2TrackedKg = useMemo(() => {
    return activities.reduce((sum, act) => sum + act.co2Kg, 0);
  }, [activities]);

  const daysLogged = profile.totalDaysLogged || 0;
  const actionsCommitted = profile.committedActionsCount || 0;

  return (
    <div id="global-leaderboard-panel" className="w-full flex flex-col gap-6 bg-zinc-950/40 p-5 sm:p-7 border border-white/5 rounded-2xl backdrop-blur-md relative select-text text-white">
      {/* Absolute Neon Glow Border Line */}
      <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-[#00f0ff]/35 to-transparent"></div>

      {/* Header telemetry blocks */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 font-mono text-[9px] text-[#00f0ff] uppercase tracking-[0.2em]" style={{ textTransform: 'uppercase' }}>
          <Globe size={11} className="animate-spin" style={{ animationDuration: "12s" }} />
          <span>Section 05: Personal Telemetry & Mission Stats</span>
          <span className="text-zinc-700">//</span>
          <span className="text-zinc-400" style={{ textTransform: 'uppercase' }}>Planetary Trajectory Monitor</span>
        </div>

        <h2 className="font-display font-[800] text-xl sm:text-2xl uppercase tracking-tight">
          Your Mission <span className="text-transparent text-stroke-white text-glow-cyan">Statistics</span>
        </h2>
      </div>

      {/* Grid: 4 columns of personal statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {/* Days Logged */}
        <div className="bg-black/50 border border-white/5 rounded-lg p-4 font-mono flex flex-col justify-between gap-3 relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-[8px] text-zinc-500 uppercase block tracking-wider" style={{ textTransform: 'uppercase' }}>Days Active Tracking</span>
            <div className="text-2xl font-bold text-white flex items-center gap-2 mt-1">
              <Calendar size={18} className="text-[#00f0ff]" />
              <span>{daysLogged}</span>
            </div>
          </div>
          <span className="text-[7.5px] text-zinc-650 block leading-tight uppercase" style={{ textTransform: 'uppercase' }}>
            Ledger log history depth
          </span>
        </div>

        {/* Total CO2 Tracked */}
        <div className="bg-black/50 border border-white/5 rounded-lg p-4 font-mono flex flex-col justify-between gap-3 relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-[8px] text-zinc-500 uppercase block tracking-wider" style={{ textTransform: 'uppercase' }}>Total CO₂ Tracked</span>
            <div className="text-2xl font-bold text-white flex items-center gap-2 mt-1">
              <Activity size={18} className="text-amber-500" />
              <span>
                {totalCo2TrackedKg >= 1000 
                  ? `${(totalCo2TrackedKg / 1000).toFixed(2)} t` 
                  : `${totalCo2TrackedKg.toFixed(1)} kg`}
              </span>
            </div>
          </div>
          <span className="text-[7.5px] text-zinc-650 block leading-tight uppercase" style={{ textTransform: 'uppercase' }}>
            Cumulative footprint logged
          </span>
        </div>

        {/* Actions Committed */}
        <div className="bg-black/50 border border-white/5 rounded-lg p-4 font-mono flex flex-col justify-between gap-3 relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-[8px] text-zinc-500 uppercase block tracking-wider" style={{ textTransform: 'uppercase' }}>Actions Committed</span>
            <div className="text-2xl font-bold text-white flex items-center gap-2 mt-1">
              <ClipboardList size={18} className="text-[#39ff14]" />
              <span>{actionsCommitted}</span>
            </div>
          </div>
          <span className="text-[7.5px] text-zinc-650 block leading-tight uppercase" style={{ textTransform: 'uppercase' }}>
            Active dashboard overrides
          </span>
        </div>

        {/* Personal Offset */}
        <div className="bg-black/50 border border-white/5 rounded-lg p-4 font-mono flex flex-col justify-between gap-3 relative overflow-hidden">
          <div className="space-y-1">
            <span className="text-[8px] text-zinc-500 uppercase block tracking-wider" style={{ textTransform: 'uppercase' }}>Personal Avoided Offset</span>
            <div className="text-2xl font-bold text-[#39ff14] text-glow-cyan flex items-center gap-2 mt-1">
              <TrendingDown size={18} />
              <span>
                {userReductionKg >= 1000 
                  ? `${(userReductionKg / 1000).toFixed(2)} t` 
                  : `${userReductionKg.toFixed(1)} kg`}
              </span>
            </div>
          </div>
          <span className="text-[7.5px] text-zinc-650 block leading-tight uppercase" style={{ textTransform: 'uppercase' }}>
            Annualized offset intensity
          </span>
        </div>
      </div>

      {/* Leaderboard Notice Banner (High-tech layout) */}
      <div className="w-full bg-[#00f0ff]/5 border border-[#00f0ff]/10 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 font-mono text-[10px]">
        <div className="flex gap-2.5 items-start">
          <Lock size={16} className="text-[#00f0ff] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-white font-bold block uppercase" style={{ textTransform: 'uppercase' }}>Competitive Standings Gated</span>
            <p className="text-zinc-400 leading-relaxed font-sans text-xs">
              Community leaderboard launches after 30 days of tracking. Continue logging daily activity logs to sync your telemetry with regional coalition pilots.
            </p>
          </div>
        </div>
        <div className="text-[8.5px] text-zinc-500 tracking-wider text-right shrink-0 uppercase" style={{ textTransform: 'uppercase' }}>
          Progress: {Math.min(30, daysLogged)} / 30 Days Logged
        </div>
      </div>

    </div>
  );
}
