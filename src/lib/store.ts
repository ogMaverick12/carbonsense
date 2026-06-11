import { z } from "zod";
import { 
  db, 
  auth,
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  deleteDoc,
  FirebaseUser
} from "./firebase";
import { UserProfile, ActivityLog, AIInsight, Challenge, Badge } from "../types";
import { EMISSION_FACTORS } from "../constants/emissionFactors";
import { SYSTEM_CONFIG } from "../config";
import { calculateCO2, calculateCarbonReduction, calculateTotalBaseline } from "../services/carbonEngine";
import { 
  checkChallengeUnlock, 
  updateStreak, 
  PRESETS_BADGES 
} from "../services/achievementEngine";
import { generateCertificateId, getVerificationUrl } from "../services/certificateEngine";

// Re-expose emission factors and default configurations for ease of compatibility
export { EMISSION_FACTORS, PRESETS_BADGES, calculateCO2 };

// Initial default profile for immediate, zero-friction local guest use
export const defaultGuestProfile: UserProfile = {
  uid: "guest",
  displayName: SYSTEM_CONFIG.defaultUsername,
  email: "guest@carbonsense.io",
  location: SYSTEM_CONFIG.indianCities[0],
  commuteMode: "petrolCar",
  commuteDistance: 25,
  diet: "vegetarianDairy",
  dailyBudgetKg: SYSTEM_CONFIG.dailyTargetLimitKg, // Annual 2.0 tonnes ceiling
  streakCount: 1,
  lastActiveDate: new Date().toISOString().split("T")[0],
  totalDaysLogged: 0,
  committedActionsCount: 0,
  daysUnderBudget: 0,
  dailyCO2History: []
};

// Default initial Challenges setup
export const defaultChallenges: Challenge[] = [
  {
    id: "ch_metro",
    title: "Metro Transition Protocol",
    description: "Displace private gasoline engines. Log 100 km of cumulative electric rail/metro transit.",
    category: "transport",
    targetValue: 100,
    requiredUnit: "km",
    rewardBadge: "GRID RUNNER",
    active: true,
    progress: 0,
    completed: false
  },
  {
    id: "ch_vegan",
    title: "Vegan Core Overdrive",
    description: "Shift dietary fuel inputs. Log 10 plant-based meals to bypass livestock methane emissions.",
    category: "food",
    targetValue: 10,
    requiredUnit: "meals",
    rewardBadge: "BIOMASS OPTIMIZER",
    active: true,
    progress: 0,
    completed: false
  },
  {
    id: "ch_solar",
    title: "Peak Solar Shaving",
    description: "Log 50 kWh of certified renewable solar power or active residential peaks offset.",
    category: "energy",
    targetValue: 50,
    requiredUnit: "kWh",
    rewardBadge: "SOLAR SHIELD",
    active: true,
    progress: 0,
    completed: false
  },
  {
    id: "ch_dry_waste",
    title: "Zero Landfill Segregation",
    description: "Divert wet/dry refuse. Accrue 20 kilograms of carefully composted or recycled dry waste.",
    category: "waste",
    targetValue: 20,
    requiredUnit: "kg",
    rewardBadge: "CIRCULAR MASTER",
    active: true,
    progress: 0,
    completed: false
  }
];

// CACHE/STORAGE CONTROLLER WITH SOLID PERSISTENCE
export class CarbonStore {
  private user: FirebaseUser | null = null;
  private listeners: (() => void)[] = [];

  constructor() {
    // Setup standard listener for Firebase Auth change
    auth.onAuthStateChanged(async (firebaseUser) => {
      this.user = firebaseUser;
      if (firebaseUser) {
        // Logged in: Sync cached local guest logs if present or load Firestore
        await this.syncAuthData();
      } else {
        // On guest startup, recalculate metrics from local storage logs
        this.recalculateActivityMetrics();
      }
      this.notifyListeners();
    });
  }

  public registerStateListener(cb: () => void): () => void {
    const cbStr = cb.toString().replace(/\s+/g, '');
    if (cbStr === '()=>{}' || cbStr === 'function(){}') {
      return () => {};
    }
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(cb => {
      try {
        cb();
      } catch (err) {
        console.error("Error calling store listener:", err);
      }
    });
  }

  public getIsLoggedIn(): boolean {
    return this.user !== null;
  }

  public getUserEmail(): string {
    return this.user?.email || "guest@carbonsense.io";
  }

  public getUserName(): string {
    return this.user?.displayName || this.getProfile().displayName;
  }

  // --- PROFILE MANAGEMENT ---
  public getProfile(): UserProfile {
    const local = localStorage.getItem("cs_profile");
    if (local) {
      try {
        return JSON.parse(local);
      } catch (_) {}
    }
    return defaultGuestProfile;
  }

  public async updateProfile(fields: Partial<UserProfile>): Promise<UserProfile> {
    const current = this.getProfile();
    const updated = { ...current, ...fields };
    localStorage.setItem("cs_profile", JSON.stringify(updated));

    if (this.user) {
      try {
        const userDocRef = doc(db, "users", this.user.uid);
        await setDoc(userDocRef, { ...updated, uid: this.user.uid }, { merge: true });
      } catch (e) {
        console.error("Firestore Save Error for Profile:", e);
      }
    }

    this.notifyListeners();
    return updated;
  }

  // --- ACTIVITY LOGGING ---
  public getActivities(): ActivityLog[] {
    const logs = localStorage.getItem("cs_activity_logs");
    if (logs) {
      try {
        return JSON.parse(logs);
      } catch (_) {}
    }
    return [];
  }

  public async logActivity(
    category: "transport" | "food" | "energy" | "shopping" | "waste",
    subcategory: string,
    quantity: number
  ): Promise<ActivityLog> {
    const unitMap: Record<string, string> = {
      transport: "km",
      food: "meals",
      energy: "kWh",
      shopping: "items",
      waste: "kg"
    };

    // Calculate dynamic CO2 output using coefficients through our custom carbonEngine
    const co2Val = calculateCO2(category, subcategory, quantity);
    const dateStr = new Date().toISOString().split("T")[0];
    
    const newLog: ActivityLog = {
      id: "log_" + Date.now().toString(16),
      category,
      subcategory,
      quantity,
      unit: unitMap[category] || "units",
      co2Kg: co2Val,
      date: dateStr
    };

    // Local append
    const currentLogs = this.getActivities();
    const updatedLogs = [newLog, ...currentLogs];
    localStorage.setItem("cs_activity_logs", JSON.stringify(updatedLogs));

    // Update streak helper using achievementEngine
    this.updateStreakMetrics(dateStr);

    // Challenge check using achievementEngine
    this.updateChallengeProgress(category, subcategory, quantity);

    // Save online if auth exists
    if (this.user) {
      try {
        const activityDocRef = doc(db, "users", this.user.uid, "activities", newLog.id);
        await setDoc(activityDocRef, newLog);
      } catch (e) {
        console.error("Firestore Save Error for Activity Log:", e);
      }
    }

    this.recalculateActivityMetrics();

    this.notifyListeners();
    return newLog;
  }

  public async deleteActivity(id: string): Promise<void> {
    const currentLogs = this.getActivities();
    const filtered = currentLogs.filter(log => log.id !== id);
    localStorage.setItem("cs_activity_logs", JSON.stringify(filtered));

    if (this.user) {
      try {
        const activityDocRef = doc(db, "users", this.user.uid, "activities", id);
        await deleteDoc(activityDocRef);
      } catch (e) {
        console.error("Firestore delete error:", e);
      }
    }

    this.recalculateActivityMetrics();

    this.notifyListeners();
  }

  // --- CHALLENGES & UNLOCKED BADGES ---
  public getChallenges(): Challenge[] {
    const cached = localStorage.getItem("cs_challenges");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (_) {}
    }
    // Seed initial
    localStorage.setItem("cs_challenges", JSON.stringify(defaultChallenges));
    return defaultChallenges;
  }

  public getBadges(): Badge[] {
    const cached = localStorage.getItem("cs_badges_unlocked");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (_) {}
    }
    return [];
  }

  private updateChallengeProgress(category: string, subcategory: string, quantity: number) {
    const challenges = this.getChallenges();
    const badges = this.getBadges();
    const badgeIds = badges.map(b => b.id);

    // Invoke clean achievementEngine checking
    const { updatedChallenges, newBadgeToUnlock } = checkChallengeUnlock(
      challenges,
      category,
      subcategory,
      quantity,
      badgeIds
    );

    if (newBadgeToUnlock) {
      this.unlockBadge(newBadgeToUnlock.id);
    }

    // Always update challenge values
    localStorage.setItem("cs_challenges", JSON.stringify(updatedChallenges));

    // Trigger badge for first log of any category
    if (!badgeIds.includes("first_log")) {
      this.unlockBadge("first_log");
    }
  }

  public unlockBadge(badgeId: string) {
    const preset = PRESETS_BADGES.find(b => b.id === badgeId || b.title === badgeId);
    if (!preset) return;

    const currentOwned = this.getBadges();
    if (currentOwned.find(b => b.id === preset.id)) return; // Already unlocked

    const newBadge: Badge = {
      ...preset,
      dateUnlocked: new Date().toISOString().split("T")[0]
    };

    const updated = [newBadge, ...currentOwned];
    localStorage.setItem("cs_badges_unlocked", JSON.stringify(updated));

    // Custom browser audio trigger for premium gaming sensory effect!
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const audioCtx = new AudioContextClass();
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(520, audioCtx.currentTime); // Chord lift
        osc.frequency.setValueAtTime(660, audioCtx.currentTime + 0.1);
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.015, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.55);
      }
    } catch (_) {}

    // Dispatch a browser event so App can render a global nice celebration confetti layout
    window.dispatchEvent(new CustomEvent("badge-unlocked", { detail: newBadge }));
  }

  // --- STREAK COUNTERS ---
  private updateStreakMetrics(todayStr: string) {
    const profile = this.getProfile();
    const { updatedProfile, unlockStreakBadge } = updateStreak(profile, todayStr);
    
    this.updateProfile(updatedProfile);

    if (unlockStreakBadge) {
      this.unlockBadge("streak_commander");
    }
  }

  // --- CERTIFICATE VERIFICATION REGISTRY ---
  public async getVerifiedCertificate(id: string): Promise<any | null> {
    try {
      const docRef = doc(db, "certificates", id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data();
      }
    } catch (e) {
      console.error("Firestore get verified certificate error:", e);
    }
    return null;
  }

  public async saveVerifiedCertificate(cert: any): Promise<void> {
    try {
      const docRef = doc(db, "certificates", cert.id);
      await setDoc(docRef, cert);
    } catch (e) {
      console.error("Firestore save verified certificate error:", e);
    }
  }

  // --- SYNC ENGINE ON WORKSPACE LOGINS ---
  private async syncAuthData() {
    if (!this.user) return;

    try {
      // 1. Sync User Profile document
      const userDocRef = doc(db, "users", this.user.uid);
      const userDocSnap = await getDoc(userDocRef);

      let mergedProfile = this.getProfile();
      if (userDocSnap.exists()) {
        const onlineProfile = userDocSnap.data() as UserProfile;
        mergedProfile = { ...mergedProfile, ...onlineProfile, uid: this.user.uid };
        localStorage.setItem("cs_profile", JSON.stringify(mergedProfile));
      } else {
        // New user — push local profile to Firestore
        const newDisplayName = this.user.displayName || "Pilot";
        await setDoc(userDocRef, { ...mergedProfile, uid: this.user.uid, displayName: newDisplayName }, { merge: true });
      }

      // 2. Fetch or merge logged activities
      const activitiesColRef = collection(db, "users", this.user.uid, "activities");
      const onlineSnap = await getDocs(activitiesColRef);
      const localLogs = this.getActivities();

      const mergedLogsMap = new Map<string, ActivityLog>();
      // seed locals
      localLogs.forEach(l => mergedLogsMap.set(l.id, l));
      // override with cloud
      onlineSnap.forEach(docSnap => {
        const item = docSnap.data() as ActivityLog;
        mergedLogsMap.set(item.id, item);
      });

      const mergedList = Array.from(mergedLogsMap.values()).sort((a, b) => b.id.localeCompare(a.id));
      localStorage.setItem("cs_activity_logs", JSON.stringify(mergedList));

      // Recalculate metrics based on merged logs
      this.recalculateActivityMetrics();

      // upload local gaps
      for (const localLog of localLogs) {
        const existsOnline = onlineSnap.docs.some(d => d.id === localLog.id);
        if (!existsOnline) {
          const gapDocRef = doc(db, "users", this.user.uid, "activities", localLog.id);
          await setDoc(gapDocRef, localLog);
        }
      }

    } catch (e) {
      console.error("Critical Profile Synchronization Failure: Grid locked.", e);
    }
  }

  // --- GEMINI WEB-API DISPATCH OVER EXPRESS ---
  public async compileAIRecommendedCourse(): Promise<AIInsight[]> {
    try {
      const active = this.getActivities();
      const profile = this.getProfile();
      const challenges = this.getChallenges();
      
      const res = await fetch("/api/ai-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          activities: active,
          challenges,
          totalReductionKg: active.reduce((sum, current) => sum + current.co2Kg, 0)
        })
      });

      if (!res.ok) throw new Error("Telemetry compile failed on backend");
      
      const payload = await res.json();

      // Client-side Zod validation of response payload
      const ClientAIInsightSchema = z.object({
        title: z.string().min(1).max(100),
        body: z.string().min(1).max(1000),
        category: z.string().min(1).max(100),
        co2ImpactKg: z.number().nonnegative().optional(),
        icon: z.string().max(10).optional()
      });

      const ClientAIInsightsResponseSchema = z.object({
        insights: z.array(ClientAIInsightSchema)
      });

      const parsed = ClientAIInsightsResponseSchema.safeParse(payload);
      if (parsed.success) {
        return parsed.data.insights.map((insight, idx) => ({
          id: `insight_${idx}_${Date.now()}`,
          title: insight.title,
          body: insight.body,
          generatedAt: new Date().toISOString(),
          category: insight.category,
          co2ImpactKg: insight.co2ImpactKg || 12,
          icon: insight.icon || "🌱"
        }));
      } else {
        console.warn("Client-side API payload validation errors, falling back safely:", parsed.error);
        if (payload && Array.isArray(payload.insights)) {
          return payload.insights.map((item: any, idx: number) => ({
            id: `insight_fb_${idx}_${Date.now()}`,
            title: String(item.title || "TELEMETRY ADVISOR"),
            body: String(item.body || "Planetary resource depletion offset analysis active."),
            generatedAt: new Date().toISOString(),
            category: String(item.category || "transport"),
            co2ImpactKg: Number(item.co2ImpactKg) || 12,
            icon: String(item.icon || "🛰️")
          }));
        }
        return [];
      }
    } catch (err) {
      console.warn("Express proxy unreachable or failed. Resolving local mock recommendations.", err);
      // Failsafe local fallbacks tailored dynamically to active profile sectors
      const logs = this.getActivities();
      const categoriesLogged = logs.map(l => l.category);
      
      const highestCount = (arr: string[]) => {
        return arr.sort((a,b) => arr.filter(v => v===a).length - arr.filter(v => v===b).length).pop();
      };
      const dominantSector = highestCount(categoriesLogged) || "transport";

      if (dominantSector === "transport") {
        return [
          {
            id: "local_tr_1",
            title: "MGU-K ELEC TRANSIT ROUTING",
            body: "Your transport emissions are elevated. Defer private driving. We recommend charging EV nodes via regional solar power grids. Switch 2 commutes to Metro this week.",
            category: "transport",
            co2ImpactKg: 35,
            icon: "🚝",
            generatedAt: new Date().toISOString()
          },
          {
            id: "local_tr_2",
            title: "CNG AUTO THROTTLE OVERRIDE",
            body: "Substituting gasoline sedans for high-efficiency compressed natural gas three-wheelers prevents trace combustion overheads.",
            category: "transport",
            co2ImpactKg: 15,
            icon: "🛺",
            generatedAt: new Date().toISOString()
          }
        ];
      }

      return [
        {
          id: "local_df_1",
          title: "STANDBY REGEN INTENSITY",
          body: "Peak thermal cycles detected in residential block. Unplug standby network hardware and adaptors for 4 hours daily to shave overhead footprint metrics.",
          category: "energy",
          co2ImpactKg: 10,
          icon: "⚡",
          generatedAt: new Date().toISOString()
        },
        {
          id: "local_df_2",
          title: "SOY PROTEIN SWITCH SENSE",
          body: "Livestock methane sectors produce massive greenhouse impacts. Transitioning to crops protein feeds guarantees direct relief.",
          category: "food",
          co2ImpactKg: 20,
          icon: "🥗",
          generatedAt: new Date().toISOString()
        }
      ];
    }
  }

  public recalculateActivityMetrics() {
    const activities = this.getActivities();
    const dailyMap = new Map<string, number>();
    activities.forEach(log => {
      dailyMap.set(log.date, (dailyMap.get(log.date) || 0) + log.co2Kg);
    });
    
    const dailyCO2History = Array.from(dailyMap.entries()).map(([date, totalKg]) => ({
      date,
      totalKg: Number(totalKg.toFixed(2))
    })).sort((a, b) => b.date.localeCompare(a.date));

    const totalDaysLogged = dailyCO2History.length;
    const daysUnderBudget = dailyCO2History.filter(h => h.totalKg < 6.8).length;

    this.updateProfile({
      dailyCO2History,
      totalDaysLogged,
      daysUnderBudget
    });
  }

  public setCommittedActionsCount(count: number) {
    const profile = this.getProfile();
    if (profile.committedActionsCount !== count) {
      this.updateProfile({ committedActionsCount: count });
    }
  }
}

export const carbonSenseStore = new CarbonStore();
