import { z } from "zod";

export const dateAvailabilitySchema = z
  .object({
    pickupDateTime: z.string().datetime({ message: "Invalid pickup date and time format" }),
    returnDateTime: z.string().datetime({ message: "Invalid return date and time format" }),
  })
  .refine(
    (data) => new Date(data.returnDateTime).getTime() > new Date(data.pickupDateTime).getTime(),
    {
      message: "Return date and time must be strictly after pickup date and time",
      path: ["returnDateTime"],
    }
  );

export const createBookingRequestSchema = z
  .object({
    carId: z.string().min(1, "Please select a vehicle"),
    pickupDateTime: z.string().datetime({ message: "Invalid pickup date format" }),
    returnDateTime: z.string().datetime({ message: "Invalid return date format" }),
    pickupLocation: z.string().min(2, "Pickup location is required"),
    returnLocation: z.string().min(2, "Return location is required"),
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Valid email address is required"),
    phone: z.string().min(7, "Valid phone number is required"),
    address: z.string().optional(),
    nationalIdOrPassport: z.string().optional(),
    customerNotes: z.string().max(1000, "Notes cannot exceed 1000 characters").optional(),
    extras: z
      .array(
        z.object({
          extraId: z.string(),
          quantity: z.number().int().positive().default(1),
        })
      )
      .optional()
      .default([]),
  })
  .refine(
    (data) => new Date(data.returnDateTime).getTime() > new Date(data.pickupDateTime).getTime(),
    {
      message: "Return date must be strictly after pickup date",
      path: ["returnDateTime"],
    }
  );

export const bookingStatusUpdateSchema = z.object({
  bookingId: z.string().min(1),
  status: z.enum(["PENDING", "CONFIRMED", "ACTIVE", "COMPLETED", "CANCELLED"]),
  reason: z.string().optional(),
  internalNotes: z.string().optional(),
});

export const addPaymentSchema = z.object({
  bookingId: z.string().min(1),
  amount: z.number().positive("Payment amount must be greater than 0"),
  paymentMethod: z.enum(["CASH", "BANK_TRANSFER", "CREDIT_CARD", "POS", "CHEQUE"]),
  paymentType: z.enum(["RENTAL", "DEPOSIT", "REFUND", "DAMAGE_CHARGE"]),
  transactionReference: z.string().optional(),
  notes: z.string().optional(),
});
