import { z } from "zod";

// 1. Activity Logging Schema
export const activitySchema = z.object({
  category: z.enum(["transport", "food", "energy", "shopping", "waste"]),
  subcategory: z.string()
    .min(1, "Subcategory description is required")
    .max(100, "Subcategory description cannot exceed 100 characters"),
  quantity: z.number()
    .positive("Quantity must be a positive non-zero value")
    .max(100000, "Quantity exceeds realistic physical carbon parameters"),
});

// 2. Pilot Name / Profile Edit Schema
export const pilotNameSchema = z.string()
  .min(2, "Pilot callsign/name must be at least 2 characters")
  .max(100, "Pilot name cannot exceed 100 characters")
  .regex(/^[a-zA-Z0-9\s-]+$/, "Pilot name must contain only alphanumeric characters, spaces, or hyphens");

export const pilotProfileSchema = z.object({
  displayName: pilotNameSchema,
  location: z.string().min(1, "Location remains mandatory"),
  commuteMode: z.string().min(1, "Commute mode is required"),
  commuteDistance: z.number().min(0, "Distance cannot be negative").max(120, "Distance cannot exceed 120 km"),
  diet: z.string().min(1, "Diet choice is critical"),
  dailyBudgetKg: z.number().min(2, "Allowance daily quota must be at least 2 kg").max(12, "Daily budget limit is 12 kg"),
});

// 3. Certificate Name Schema
export const certificateNameSchema = z.string()
  .min(2, "Certificate name must be at least 2 characters")
  .max(35, "Name cannot exceed 35 characters")
  .regex(/^[a-zA-Z0-9\s-]+$/, "Certificate name must contain only alphanumeric characters, spaces, or hyphens");
