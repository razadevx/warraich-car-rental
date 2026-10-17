import { BookingStatus } from "@/types";

export interface StatusTransitionRule {
  allowedTo: BookingStatus[];
  description: string;
}

export const BOOKING_TRANSITIONS: Record<BookingStatus, StatusTransitionRule> = {
  PENDING: {
    allowedTo: ["CONFIRMED", "CANCELLED"],
    description: "Pending booking can be confirmed upon review or cancelled.",
  },
  CONFIRMED: {
    allowedTo: ["ACTIVE", "CANCELLED"],
    description: "Confirmed booking becomes active when customer picks up the vehicle, or can be cancelled.",
  },
  ACTIVE: {
    allowedTo: ["COMPLETED", "CANCELLED"],
    description: "Active rental is completed upon vehicle return and inspection.",
  },
  COMPLETED: {
    allowedTo: [],
    description: "Completed bookings are historical and cannot change status.",
  },
  CANCELLED: {
    allowedTo: [],
    description: "Cancelled bookings cannot be reactivated; a new booking must be created.",
  },
};

export function canTransitionBooking(from: BookingStatus, to: BookingStatus): boolean {
  if (from === to) return true;
  return BOOKING_TRANSITIONS[from].allowedTo.includes(to);
}

export function validateBookingTransition(from: BookingStatus, to: BookingStatus): void {
  if (!canTransitionBooking(from, to)) {
    throw new Error(
      `Invalid booking transition from ${from} to ${to}. Allowed transitions: ${BOOKING_TRANSITIONS[from].allowedTo.join(", ") || "none (terminal state)"}`
    );
  }
}
