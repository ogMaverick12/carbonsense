import React, { useState, useEffect } from "react";
import { 
  carbonSenseStore, 
  calculateCO2, 
  EMISSION_FACTORS 
} from "../lib/store";
import { getAudioContextClass } from "../lib/audio";
import { Activity, Plus, Trash2, Zap, Car, Utensils, Lightbulb, ShoppingBag, Trash, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ActivityLog } from "../types";
import { activitySchema } from "../schemas/validation";

export function ActivityLogger() {
  const [logs, setLogs] = useState<ActivityLog[]>(() => carbonSenseStore.getActivities());
  const [category, setCategory] = useState<"transport" | "food" | "energy" | "shopping" | "waste">("transport");
  
  // Choose respective subcategory defaults
  const [subcategory, setSubcategory] = useState("petrolCar");
  const [quantity, setQuantity] = useState<number>(30);

  // Validation errors mapping
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Screen-reader announcer message
  const [lastLoggedMessage, setLastLoggedMessage] = useState("");

  // Synchronize on store changes
  useEffect(() => {
    const unsub = () => {
      setLogs(carbonSenseStore.getActivities());
    };
    const unsubscribe = carbonSenseStore.registerStateListener(unsub);
    return unsubscribe;
  }, []);

  // Sync subcategory selection default whenever parent category changes
  useEffect(() => {
    const defaultSubs: Record<string, string> = {
      transport: "petrolCar",
      food: "omnivoreStandard",
      energy: "indiaGridCoal",
      shopping: "fastFashionGarment",
      waste: "landfillUnsorted"
    };
    setSubcategory(defaultSubs[category]);
    
    const defaultQuants: Record<string, number> = {
      transport: 25,
      food: 3,
      energy: 15,
      shopping: 2,
      waste: 5
    };
    setQuantity(defaultQuants[category]);
    setValidationError(null);
  }, [category]);

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Run strict validation via Zod
    const validationResult = activitySchema.safeParse({
      category,
      subcategory,
      quantity
    });

    if (!validationResult.success) {
      const firstErr = validationResult.error.issues[0]?.message || "Invalid telemetry payload";
      setValidationError(firstErr);
      playAudioPing(400, 300, 0.25);
      return;
    }

    // Trigger store log save
    const currentActiveLogs = carbonSenseStore.getActivities();
    const newTotal = currentActiveLogs.reduce((sum, log) => sum + log.co2Kg, 0) + expectedCO2;
    setLastLoggedMessage(`Activity logged: ${getSubcategoryName(category, subcategory)} with output of ${expectedCO2.toFixed(1)} kg. Daily total is now ${newTotal.toFixed(1)} kg CO₂`);

    await carbonSenseStore.logActivity(category, subcategory, quantity);
    
    // Play short synthesized success beep sound
    playAudioPing(1400, 2000, 0.2);
  };

  const handleDeleteLog = async (id: string, co2Kg: number) => {
    await carbonSenseStore.deleteActivity(id);
    playAudioPing(600, 350, 0.15);
  };

  const playAudioPing = (f1: number, f2: number, dur: number) => {
    try {
      const AudioCtxClass = getAudioContextClass();
      if (AudioCtxClass) {
        const ctx = new AudioCtxClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(f1, ctx.currentTime);
        osc.frequency.setValueAtTime(f2, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.015, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
        osc.start();
        osc.stop(ctx.currentTime + dur + 0.02);
      }
    } catch (_) {
      // intentional: audio/storage failures are non-fatal; swallowing here is correct
    }
  };

  const getSubcategoryName = (cat: string, sub: string) => {
    const names: Record<string, Record<string, string>> = {
      transport: {
        petrolCar: "Gasoline Sedan",
        dieselCar: "Diesel SUV",
        electricVehicle: "Solar Charged EV",
        twoWheelerPetrol: "Petrol Two-Wheeler",
        trainMetro: "Electric Rail/Metro",
        cngAuto: "CNG Three-Wheeled Auto",
        aviationJet: "Commercial Plane flight"
      },
      food: {
        omnivoreStandard: "Omnivore meal",
        vegetarianDairy: "Heavy Vegetarian meal (dairy)",
        veganPlant: "Plant-Based organic dish",
        beefMethaneFeed: "Beef/Mutton high load",
        localOrganic: "Localized zero-waste meal"
      },
      energy: {
        indiaGridCoal: "Coal Heavy India Grid",
        lpgGasCylinder: "Cooking Gas Cylinder (LPG)",
        woodCoalCombustion: "Traditional firewood combustion",
        solarMicro: "Solar Micro-Cell generation"
      },
      shopping: {
        fastFashionGarment: "Fast Fashion clothing item",
        consumerElectronics: "Electronics appliance item",
        localHandloom: "Recycled local handloom",
        durableReusable: "Zero-waste reusable item"
      },
      waste: {
        landfillUnsorted: "Unsorted landfill dump",
        compostableSegregated: "Sorted backyard compost",
        dryRecyclableSegregated: "Sorted dry recyclables",
        zeroRefuseCircular: "Zero refuse closed loop"
      }
    };
    return names[cat]?.[sub] || sub;
  };

  // Live preview calculations
  const expectedCO2 = calculateCO2(category, subcategory, quantity);

  const categories = [
    { id: "transport", label: "Transit", icon: Car },
    { id: "food", label: "Nutrition", icon: Utensils },
    { id: "energy", label: "Energy", icon: Lightbulb },
    { id: "shopping", label: "Shopping", icon: ShoppingBag },
    { id: "waste", label: "Waste", icon: Trash }
  ] as const;

  return (
    <div id="activity-logger-panel" className="bg-transparent border-none p-0 flex flex-col gap-4 w-full relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-white/[0.01] to-transparent opacity-20 pointer-events-none"></div>

      <div className="flex items-center gap-2 border-b border-white/[0.05] pb-2">
        <Activity size={14} className="text-[#ffaa00]" />
        <span className="font-mono text-[10px] text-[#ffaa00] uppercase tracking-widest font-black">Recon Cockpit // Log Emissions Discharge</span>
      </div>

      {/* Two-column layout on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start w-full mt-2">
        {/* LEFT COLUMN: CATEGORIES & FORM INPUTS */}
        <div className="space-y-4">
          {/* CATEGORY SWITCH CHIPS */}
          <div className="grid grid-cols-5 gap-1">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = category === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    playAudioPing(1000, 1100, 0.08);
                    setCategory(cat.id);
                  }}
                  aria-label={`Select ${cat.label} category`}
                  className={`py-2 rounded flex flex-col items-center gap-1.5 transition-all duration-300 font-mono text-[8px] uppercase tracking-wider cursor-pointer ${
                    isActive 
                      ? "bg-white/10 text-white font-extrabold" 
                      : "bg-transparent text-zinc-400 hover:text-white"
                  }`}
                >
                  <Icon size={12} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* LOG FORM */}
          <form onSubmit={handleLogSubmit} className="space-y-3.5 text-xs" aria-label="Log Atmospheric Emission Discharge Form">
            {/* Subcategory Select Box */}
            <div className="space-y-1">
              <label htmlFor="activity-logger-subtype" className="font-mono text-[9px] text-zinc-400 uppercase tracking-widest block font-[750]">Activity Subtype</label>
              <select
                id="activity-logger-subtype"
                value={subcategory}
                onChange={(e) => {
                  playAudioPing(900, 1000, 0.05);
                  setSubcategory(e.target.value);
                }}
                className="w-full bg-black border border-white/10 rounded px-2.5 py-2 text-white focus:border-[#ffaa00] focus:ring-1 focus:ring-[#ffaa00] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a3e635] font-sans uppercase tracking-wider"
              >
                {Object.keys(EMISSION_FACTORS[category]).map((key) => (
                  <option key={key} value={key}>
                    {getSubcategoryName(category, key)}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantities slider & inputs */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center font-mono text-[9px]">
                <label htmlFor="activity-logger-quantity-slider" className="text-zinc-500 uppercase font-[750]">Discharge Volume</label>
                <span className="text-white font-[800]">
                  {quantity} {category === "transport" ? "km Transit path" : category === "food" ? "meals intake" : category === "energy" ? "kWh usage" : category === "shopping" ? "items purchased" : "kg refuse mass"}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <input
                  id="activity-logger-quantity-slider"
                  type="range"
                  min="1"
                  max={category === "transport" ? "400" : category === "energy" ? "150" : category === "food" ? "15" : "25"}
                  step="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  aria-label="Activity quantity"
                  aria-invalid={!!validationError}
                  aria-describedby={validationError ? "err-activity-quantity" : undefined}
                  className="flex-1 accent-[#ffaa00] bg-zinc-900 cursor-ew-resize h-1"
                />
                
                <input
                  id="activity-logger-quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  aria-label="Activity quantity numeric value"
                  aria-invalid={!!validationError}
                  aria-describedby={validationError ? "err-activity-quantity" : undefined}
                  className="w-16 bg-black border border-white/10 rounded py-1 px-1.5 text-center font-mono text-white focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a3e635] focus:border-[#ffaa00] focus:ring-1 focus:ring-[#ffaa00]"
                />
              </div>

              {validationError && (
                <p id="err-activity-quantity" className="text-[#ffaa00] font-mono text-[8.5px] mt-1 tracking-wide uppercase">
                  ⚠️ {validationError}
                </p>
              )}
            </div>

            {/* LIVE CO2 GRAPHICS PREVIEW FOOTPRINT */}
            <div className="py-3 px-0 bg-transparent border-none flex items-center justify-between">
              <div className="font-mono text-[9px] text-zinc-500 uppercase space-y-0.5">
                <span>Estimated Atmospheric load</span>
                <span className="text-[#39ff14] font-bold block text-[10px] uppercase">Recon Output Intensity</span>
              </div>
              
              <div className="text-right">
                <span className="font-display font-[900] text-xl text-[#ff3b30] text-glow-red tracking-tight block">
                  +{expectedCO2.toFixed(2)}
                </span>
                <span className="font-mono text-[8px] text-zinc-400 uppercase tracking-widest block leading-none mt-0.5">
                  kg CO₂ Equivalent
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-transparent text-white border border-[#ffaa00]/30 hover:border-[#ffaa00] hover:bg-[#ffaa00] hover:text-black font-mono text-[10px] tracking-[0.3em] font-extrabold uppercase transition-all duration-300 cursor-pointer text-center flex items-center justify-center gap-2"
            >
              <Plus size={12} />
              <span>Record Mass Discharge</span>
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: RECENT HISTORY RECORDS */}
        <div className="space-y-3.5 lg:border-l lg:border-white/5 lg:pl-8">
          {/* RECENT RECORDS LOG TABLE VIEW */}
          <div className="space-y-2">
            <span className="font-mono text-[9px] text-zinc-400 uppercase tracking-widest block font-[750]">
              Recent Emissions History Sec_Core ({logs.length})
            </span>

            {logs.length === 0 ? (
              <p className="text-[9px] font-mono text-zinc-500 text-center uppercase tracking-wider py-4">
                ⚠️ System log empty. No discharges recorded today.
              </p>
            ) : (
              <div className="space-y-1.5">
                <AnimatePresence>
                  {logs.slice(0, 5).map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 6 }}
                      className="py-2.5 bg-transparent border-none flex items-center justify-between text-[10px] font-mono group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm bg-transparent border-none p-1 rounded">
                          {log.category === "transport" && "🚗"}
                          {log.category === "food" && "🍛"}
                          {log.category === "energy" && "⚡"}
                          {log.category === "shopping" && "🛍️"}
                          {log.category === "waste" && "♻️"}
                        </span>
                        
                        <div>
                          <span className="font-bold text-zinc-200 block truncate max-w-[140px] uppercase">
                            {getSubcategoryName(log.category, log.subcategory)}
                          </span>
                          <span className="text-zinc-500 text-[8px] block mt-0.5 font-light">
                            Qty: {log.quantity} {log.unit} • {log.date}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-bold text-[#ff3b30]">
                          +{log.co2Kg.toFixed(1)} kg
                        </span>

                        <button
                          onClick={() => handleDeleteLog(log.id, log.co2Kg)}
                          aria-label="Delete activity log record"
                          className="text-zinc-600 hover:text-red-500 cursor-pointer p-1 transition-colors duration-200 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#a3e635] rounded"
                          title="Decompile record"
                          type="button"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Screen Reader Live Announcer */}
      <div aria-live="polite" aria-atomic="true" className="sr-only" id="co2-announcer">
        {lastLoggedMessage}
      </div>
    </div>
  );
}
