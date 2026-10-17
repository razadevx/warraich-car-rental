import { z } from "zod";

export const carFormSchema = z.object({
  registrationNumber: z.string().min(2, "Registration number is required").toUpperCase(),
  make: z.string().min(1, "Make is required (e.g. Toyota, Honda, Hyundai)"),
  model: z.string().min(1, "Model is required (e.g. Corolla, Civic, Tucson)"),
  year: z.number().int().min(1990).max(new Date().getFullYear() + 2),
  slug: z.string().min(2, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens"),
  description: z.string().min(10, "Please provide a detailed vehicle description"),
  category: z.string().min(1, "Category is required"),
  transmission: z.string().min(1, "Transmission is required"),
  fuelType: z.string().min(1, "Fuel type is required"),
  seatingCapacity: z.number().int().min(1).max(20),
  luggageCapacity: z.number().int().min(0).max(10),
  dailyRate: z.number().positive("Daily rate must be greater than 0"),
  weeklyRate: z.number().positive("Weekly rate must be greater than 0"),
  monthlyRate: z.number().positive("Monthly rate must be greater than 0"),
  currency: z.string().default("PKR"),
  operationalStatus: z.enum(["AVAILABLE", "RENTED", "MAINTENANCE", "INACTIVE"]).default("AVAILABLE"),
  isPublished: z.boolean().default(true),
  imageUrls: z.array(z.string().url("Must be a valid image URL")).default([]),
});

export const customerUpdateSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(7, "Phone number is required"),
  email: z.string().email("Valid email is required"),
  address: z.string().optional(),
  drivingLicenceDetails: z.string().optional(),
  internalNotes: z.string().optional(),
});
