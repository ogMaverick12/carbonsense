import React, { useState, useEffect } from "react";
import { 
  carbonSenseStore, 
  PRESETS_BADGES, 
  EMISSION_FACTORS 
} from "../lib/store";
import { User, LogIn, LogOut, Settings, ShieldCheck, Award, Flame, Zap, Check, HelpCircle, FlameKindling, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { auth, googleProvider, signInWithPopup, signOut } from "../lib/firebase";
import { pilotProfileSchema } from "../schemas/validation";

interface PilotProfileProps {
  isOpen: boolean;
  onClose: () => void;
  carbonReduction: number;
}

export function PilotProfile({ isOpen, onClose, carbonReduction }: PilotProfileProps) {
  const [profile, setProfile] = useState(() => carbonSenseStore.getProfile());
  const [isLogged, setIsLogged] = useState(() => carbonSenseStore.getIsLoggedIn());
  const [badges, setBadges] = useState(() => carbonSenseStore.getBadges());
  const [isLoading, setIsLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  // Form states matching Indian telemetry guidelines
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [location, setLocation] = useState(profile.location);
  const [commuteMode, setCommuteMode] = useState(profile.commuteMode);
  const [commuteDistance, setCommuteDistance] = useState(profile.commuteDistance);
  const [diet, setDiet] = useState(profile.diet);
  const [dailyBudgetKg, setDailyBudgetKg] = useState(profile.dailyBudgetKg);

  // Zod manual validation errors mapping
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Sync profile update when store changes
  useEffect(() => {
    const unsub = carbonSenseStore.registerStateListener(() => {
      setProfile(carbonSenseStore.getProfile());
      setIsLogged(carbonSenseStore.getIsLoggedIn());
      setBadges(carbonSenseStore.getBadges());
    });
    return unsub;
  }, []);

  // Update initial form parameters whenever cached profile changes
  useEffect(() => {
    setDisplayName(profile.displayName);
    setLocation(profile.location);
    setCommuteMode(profile.commuteMode);
    setCommuteDistance(profile.commuteDistance);
    setDiet(profile.diet);
    setDailyBudgetKg(profile.dailyBudgetKg);
    setValidationErrors({});
  }, [profile]);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      // Audio cue
      playBeep(1200, 1600, 0.25);
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error("Google Auth popup failed:", e);
      alert("Google Login connection failed. Please ensure popups are disabled or reload current tab.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      playBeep(900, 600, 0.2);
      await signOut(auth);
      setProfile(carbonSenseStore.getProfile());
      setIsLogged(false);
    } catch (e) {
      console.error("Signout error:", e);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    playBeep(1000, 1400, 0.15);

    // Zod Validation Check
    const validationResult = pilotProfileSchema.safeParse({
      displayName,
      location,
      commuteMode,
      commuteDistance,
      diet,
      dailyBudgetKg
    });

    if (!validationResult.success) {
      const errorsMap: Record<string, string> = {};
      validationResult.error.issues.forEach((err) => {
        if (err.path[0]) {
          errorsMap[err.path[0].toString()] = err.message;
        }
      });
      setValidationErrors(errorsMap);
      playBeep(450, 350, 0.3); // Error buzz
      return;
    }

    setValidationErrors({});

    // Update in central storage (online Firestore synchronizer gets auto-triggered)
    const updated = await carbonSenseStore.updateProfile({
      displayName,
      location,
      commuteMode,
      commuteDistance,
      diet,
      dailyBudgetKg
    });

    setProfile(updated);
    setShowConfig(false);
  };

  const playBeep = (f1: number, f2: number, dur: number) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(f1, ctx.currentTime);
        osc.frequency.setValueAtTime(f2, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.012, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
        osc.start();
        osc.stop(ctx.currentTime + dur + 0.02);
      }
    } catch (_) {}
  };

  const indianCities = [
    "Mumbai (West Coalition Grid)",
    "Delhi NCR (Coal heavy Northern Grid)",
    "Bangalore (Southern Eco Grid)",
    "Chennai (Tamil Monsoon Grid)",
    "Kolkata (East Silt intensive Grid)",
    "Hyderabad (Central Deccan Grid)"
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="pilot-profile-modal" className="fixed inset-0 z-[150] flex justify-end pointer-events-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs cursor-pointer z-10"
          />

          {/* Drawer Body - F1 Telemetry Styling - Accessible dialog */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 33, stiffness: 280 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="pilot-profile-dialog-title"
            className="relative w-full max-w-[460px] h-full bg-[#03060c] border-l border-white/10 z-25 flex flex-col justify-between p-6 overflow-y-auto overflow-x-hidden text-white"
          >
            {/* Header */}
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#00f0ff] animate-ping"></div>
                  <span id="pilot-profile-dialog-title" className="font-mono text-[9px] text-[#00f0ff] uppercase tracking-[0.25em]">Sec Command Core // Pilot</span>
                </div>
                <button 
                  onClick={onClose} 
                  aria-label="Close Pilot Profile Core drawer"
                  className="font-mono text-[9px] text-zinc-500 hover:text-white uppercase tracking-wider cursor-pointer focus:outline-none focus:ring-1 focus:ring-white/40 p-1 rounded"
                >
                  [ Close ]
                </button>
              </div>

              {/* Profile Card Summary */}
              <div className="bg-white/[0.01] border border-white/5 p-4 rounded-lg relative overflow-hidden backdrop-blur-md">
                <div className="absolute top-0 right-0 p-3 opacity-15">
                  <User size={64} className="text-[#00f0ff]" />
                </div>

                <div className="flex gap-4 items-center">
                  <div className="h-[52px] w-[52px] rounded-full border-2 border-dashed border-[#00f0ff] flex items-center justify-center bg-black/50 overflow-hidden shrink-0">
                    {auth.currentUser?.photoURL ? (
                      <img 
                        src={auth.currentUser.photoURL} 
                        alt="Pilot Avatar" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-display font-[800] text-lg text-white">
                        {displayName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <span className="font-mono text-[8px] text-zinc-500 uppercase tracking-widest font-bold block">Flight System Pilot</span>
                    <h3 className="font-display font-extrabold text-white text-base truncate uppercase max-w-[240px]">
                      {displayName}
                    </h3>
                    <span className="font-mono text-[9px] text-zinc-400 block max-w-[240px] truncate">
                      {auth.currentUser?.email || profile.email}
                    </span>
                    {auth.currentUser?.metadata.creationTime && (
                      <span className="font-mono text-[8px] text-zinc-500 block max-w-[240px] truncate mt-1">
                        Joined mission: {auth.currentUser.metadata.creationTime}
                      </span>
                    )}
                  </div>
                </div>

                {/* Authentication Switches */}
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between gap-4">
                  {isLogged ? (
                    <>
                      <div className="flex items-center gap-1.5 font-mono text-[9px] text-[#39ff14] uppercase" style={{ textTransform: 'uppercase' }}>
                        <ShieldCheck size={12} />
                        <span>Synchronized With Cloud</span>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="py-1 px-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-mono text-[9px] tracking-wider uppercase transition-colors duration-300 cursor-pointer flex items-center gap-1.5 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a3e635]"
                      >
                        <LogOut size={10} />
                        <span>Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-1.5 font-mono text-[9px] text-[#ff9500] uppercase font-bold" style={{ textTransform: 'uppercase' }}>
                        <FlameKindling size={11} className="animate-bounce" />
                        <span>Offline Guest Cache</span>
                      </div>
                      <button
                        onClick={handleLogin}
                        disabled={isLoading}
                        className="py-2 px-4 bg-white text-black hover:bg-[#00f0ff] font-mono text-[9px] tracking-widest font-[800] uppercase transition-all duration-300 cursor-pointer flex items-center gap-1.5 shadow-md focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a3e635]"
                      >
                        <LogIn size={11} />
                        <span className="uppercase" style={{ textTransform: 'uppercase' }}>{isLoading ? "Linking..." : "Sync With Google"}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Telemetry Stats Rows */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-black/60 border border-white/[0.04] p-3 rounded">
                  <span className="text-zinc-500 block text-[9px] uppercase">Tracking Streak</span>
                  <span className="text-white text-lg font-bold block mt-1">
                    ⚡ {profile.streakCount} <span className="text-[10px] text-zinc-500">Consecutive Days</span>
                  </span>
                </div>
                <div className="bg-black/60 border border-white/[0.04] p-3 rounded">
                  <span className="text-zinc-500 block text-[9px] uppercase">Daily Allowance</span>
                  <span className="text-white text-lg font-bold block mt-1">
                    {dailyBudgetKg.toFixed(2)} <span className="text-[10px] text-zinc-500">kg CO₂e</span>
                  </span>
                </div>
              </div>

              {/* ACHIEVEMENTS / UNLOCKED HYPER BADGES */}
              <div className="space-y-3">
                <span className="font-mono text-[9px] text-zinc-400 uppercase tracking-widest border-b border-white/5 pb-1 block">
                  Unlocked Flight Log Badges ({badges.length} / 6)
                </span>

                {badges.length === 0 ? (
                  <div className="p-4 border border-dashed border-zinc-800 rounded bg-black/20 text-center font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
                    ⚠️ System Diagnostic: No Commendation Badges Unlocked. Complete Action challenges!
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {badges.map((badge) => (
                      <div 
                        key={badge.id}
                        className={`p-2 rounded bg-gradient-to-b border border-white/10 flex flex-col items-center text-center relative overflow-hidden backdrop-blur-xs group/badge shadow-lg ${badge.badgeClass}`}
                      >
                        <span className="text-2xl mt-1 block">{badge.icon}</span>
                        <span className="font-mono text-[7.5px] font-[800] tracking-wider uppercase block mt-1 truncate w-full">
                          {badge.title}
                        </span>
                        <span className="text-[6.5px] text-zinc-400 block tracking-tight truncate w-full mt-0.5">
                          {badge.dateUnlocked}
                        </span>
                        
                        {/* Tooltip detail hover pop */}
                        <div className="absolute inset-0 bg-black/95 opacity-0 group-hover/badge:opacity-100 transition-opacity duration-300 p-1 flex items-center justify-center text-[7px] leading-tight text-zinc-300 font-mono font-medium">
                          {badge.description}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* PREFERENCES MANUAL SWITCH OVERRIDE FORM */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-white/10 pb-1">
                  <span className="font-mono text-[9px] text-zinc-400 uppercase tracking-widest block font-bold">
                    Pilot Sustainability Coefficients
                  </span>
                  
                  <button
                    onClick={() => {
                      playBeep(800, 1000, 0.1);
                      setShowConfig(!showConfig);
                    }}
                    className="text-[9px] font-mono text-[#00f0ff] hover:underline cursor-pointer"
                  >
                    {showConfig ? "[ HIDE ENGINE ]" : "[ RETUNE PARAMETERS ]"}
                  </button>
                </div>

                {!showConfig ? (
                  <div className="bg-[#020408] border border-white/5 rounded-lg p-4 font-mono text-[10px] space-y-2">
                    <div className="flex justify-between border-b border-white/[0.03] pb-1">
                      <span className="text-zinc-500">Coefficient City:</span>
                      <span className="text-white font-[800] truncate max-w-[240px]">{location}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/[0.03] pb-1">
                      <span className="text-zinc-500">Commute Transit:</span>
                      <span className="text-[#39ff14] font-bold">
                        {commuteMode === "petrolCar" && "Gasoline Car (0.18 kg)"}
                        {commuteMode === "dieselCar" && "Diesel Car (0.15 kg)"}
                        {commuteMode === "electricVehicle" && "Electric Vehicle (0.02 kg)"}
                        {commuteMode === "twoWheelerPetrol" && "Motorcycle (0.05 kg)"}
                        {commuteMode === "trainMetro" && "Electric Metro (0.01 kg)"}
                        {commuteMode === "cngAuto" && "CNG Auto Rickshaw (0.07 kg)"}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-white/[0.03] pb-1">
                      <span className="text-zinc-500">Daily Commute Path:</span>
                      <span className="text-white font-bold">{commuteDistance} km / day</span>
                    </div>
                    <div className="flex justify-between pb-0.5">
                      <span className="text-zinc-500">Primary Protein Feed:</span>
                      <span className="text-[#00f0ff] font-bold capitalize">
                        {diet === "omnivoreStandard" && "Omnivore (2.1 kg)"}
                        {diet === "vegetarianDairy" && "Heavy Vegetarian (1.2 kg)"}
                        {diet === "veganPlant" && "Vegan Organic (0.4 kg)"}
                        {diet === "beefMethaneFeed" && "High Methane Livestock (6.0 kg)"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <motion.form 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSaveConfig} 
                    className="p-4 bg-zinc-950 border border-[#00f0ff]/20 rounded-lg space-y-4 text-xs font-sans"
                    aria-label="Pilot Telemetry Coefficients Configurations"
                  >
                    {/* Display name */}
                    <div className="space-y-1">
                      <label htmlFor="pref-pilot-name" className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider block">Pilot Callsign</label>
                      <input 
                        id="pref-pilot-name"
                        type="text" 
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        aria-invalid={!!validationErrors.displayName}
                        aria-describedby={validationErrors.displayName ? "err-pilot-name" : undefined}
                        className={`w-full bg-black border rounded px-2.5 py-1.5 font-sans uppercase tracking-wider text-white focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a3e635] ${
                          validationErrors.displayName ? "border-red-500" : "border-white/10"
                        }`}
                        required
                      />
                      {validationErrors.displayName && (
                        <p id="err-pilot-name" className="text-red-500 font-mono text-[8.5px] mt-1 tracking-wide uppercase">
                          ⚠️ {validationErrors.displayName}
                        </p>
                      )}
                    </div>

                    {/* City Location */}
                    <div className="space-y-1">
                      <label htmlFor="pref-pilot-location" className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider block">Target Coordinates City</label>
                      <select 
                        id="pref-pilot-location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded px-2.5 py-1.5 text-white focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a3e635]"
                      >
                        {indianCities.map(city => <option key={city} value={city}>{city}</option>)}
                      </select>
                    </div>

                    {/* Commute Mode */}
                    <div className="space-y-1">
                      <label htmlFor="pref-pilot-commute" className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider block">Primary Commute Vehicle</label>
                      <select 
                        id="pref-pilot-commute"
                        value={commuteMode}
                        onChange={(e) => setCommuteMode(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded px-2.5 py-1.5 text-white focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a3e635]"
                      >
                        <option value="petrolCar">Gasoline Sedan Car</option>
                        <option value="dieselCar">Diesel Heavy Engine</option>
                        <option value="electricVehicle">Electric Vehicle (Charged on Solar-eco grid)</option>
                        <option value="twoWheelerPetrol">Motorcycle (Petrol Two Wheeler)</option>
                        <option value="trainMetro">Electric Rail Transit (Metro/Local Subways)</option>
                        <option value="cngAuto">CNG Three-Wheel Auto Rickshaw</option>
                      </select>
                    </div>

                    {/* Commute Distance slider */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center font-mono text-[9px]">
                        <label htmlFor="pref-pilot-distance" className="text-zinc-500 uppercase">Commute Path Distance</label>
                        <span className="text-white font-bold">{commuteDistance} km / day</span>
                      </div>
                      <input 
                        id="pref-pilot-distance"
                        type="range" 
                        min="0" 
                        max="120" 
                        step="2"
                        value={commuteDistance}
                        onChange={(e) => setCommuteDistance(parseInt(e.target.value))}
                        aria-invalid={!!validationErrors.commuteDistance}
                        aria-describedby={validationErrors.commuteDistance ? "err-pilot-distance" : undefined}
                        className="w-full accent-[#00f0ff] bg-zinc-900 cursor-ew-resize h-1 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a3e635]"
                      />
                      {validationErrors.commuteDistance && (
                        <p id="err-pilot-distance" className="text-red-500 font-mono text-[8.5px] mt-1 tracking-wide uppercase">
                          ⚠️ {validationErrors.commuteDistance}
                        </p>
                      )}
                    </div>

                    {/* Dietary */}
                    <div className="space-y-1">
                      <label htmlFor="pref-pilot-diet" className="font-mono text-[9px] text-zinc-500 uppercase tracking-wider block">Dietary Feedstock Category</label>
                      <select 
                        id="pref-pilot-diet"
                        value={diet}
                        onChange={(e) => setDiet(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded px-2.5 py-1.5 text-white focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a3e635]"
                      >
                        <option value="omnivoreStandard">Omnivore Diet (Average meat and crops)</option>
                        <option value="vegetarianDairy">Vegetarian Diet (Lactose and curds heavy)</option>
                        <option value="veganPlant">100% Vegan Diet (Pure crops biomass)</option>
                        <option value="beefMethaneFeed">Livestock Methane Intensive (Beef/Lamb heavy)</option>
                      </select>
                    </div>

                    {/* Daily target budget factor slider */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center font-mono text-[9px]">
                        <label htmlFor="pref-pilot-budget" className="text-zinc-500 uppercase">Atmosphere Guard Daily Quota</label>
                        <span className="text-[#39ff14] font-bold">{dailyBudgetKg.toFixed(2)} kg CO₂e</span>
                      </div>
                      <input 
                        id="pref-pilot-budget"
                        type="range" 
                        min="2" 
                        max="12" 
                        step="0.1"
                        value={dailyBudgetKg}
                        onChange={(e) => setDailyBudgetKg(parseFloat(e.target.value))}
                        aria-invalid={!!validationErrors.dailyBudgetKg}
                        aria-describedby={validationErrors.dailyBudgetKg ? "err-pilot-budget" : undefined}
                        className="w-full accent-[#39ff14] bg-zinc-900 cursor-ew-resize h-1 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a3e635]"
                      />
                      {validationErrors.dailyBudgetKg && (
                        <p id="err-pilot-budget" className="text-red-500 font-mono text-[8.5px] mt-1 tracking-wide uppercase">
                          ⚠️ {validationErrors.dailyBudgetKg}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      aria-label="Commit and retune pilot coefficients settings"
                      className="w-full py-2.5 bg-white text-black hover:bg-[#00f0ff] hover:text-black font-mono text-[9px] tracking-widest font-extrabold uppercase transition-all duration-300 cursor-pointer text-center flex items-center justify-center gap-1 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a3e635]"
                    >
                      <Check size={11} />
                      <span>Commit retuning coefficients</span>
                    </button>
                  </motion.form>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-white/5 pt-4 mt-6 text-[8px] font-mono text-zinc-600 flex items-center justify-between">
              <span>PILOT ID PROFILE RECON v4.18</span>
              <span>CO₂ EQUIVALENT SYSTEM LEVEL 8</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
