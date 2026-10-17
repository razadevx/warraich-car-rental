"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth/session";
import { createBookingRequestSchema, bookingStatusUpdateSchema } from "@/lib/validations/booking";
import { createBookingSafe, BookingConflictError, CarNotRentableError } from "@/lib/booking-engine/availability";
import { validateBookingTransition } from "@/lib/booking-engine/state-machine";
import { revalidatePath } from "next/cache";
import { BookingStatus } from "@/types";

export async function submitPublicBookingAction(formData: {
  carId: string;
  pickupDateTime: string;
  returnDateTime: string;
  pickupLocation: string;
  returnLocation: string;
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  nationalIdOrPassport?: string;
  customerNotes?: string;
  extras?: Array<{ extraId: string; quantity: number }>;
}) {
  const validation = createBookingRequestSchema.safeParse(formData);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors[0]?.message || "Invalid booking data",
    };
  }

  try {
    const booking = await createBookingSafe({
      carId: formData.carId,
      pickupDateTime: formData.pickupDateTime,
      returnDateTime: formData.returnDateTime,
      pickupLocation: formData.pickupLocation,
      returnLocation: formData.returnLocation,
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      nationalIdOrPassport: formData.nationalIdOrPassport,
      customerNotes: formData.customerNotes,
      extras: formData.extras,
    });

    revalidatePath("/admin/bookings");
    revalidatePath("/admin");

    return {
      success: true,
      bookingReference: booking.bookingReference,
      bookingId: booking.id,
      totalAmount: Number(booking.totalAmount),
      currency: booking.currency,
    };
  } catch (error: any) {
    if (error instanceof BookingConflictError || error instanceof CarNotRentableError) {
      return {
        success: false,
        error: error.message,
      };
    }
    console.error("Booking creation error:", error);
    return {
      success: false,
      error: error.message || "Failed to process booking request. Please try again.",
    };
  }
}

export async function updateBookingStatusAction(input: {
  bookingId: string;
  status: BookingStatus;
  reason?: string;
  internalNotes?: string;
}) {
  const staffUser = await requireAuth(["ADMIN", "STAFF"]);

  const validation = bookingStatusUpdateSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors[0]?.message || "Invalid status update data",
    };
  }

  const existingBooking = await prisma.booking.findUnique({
    where: { id: input.bookingId },
    include: { car: true },
  });

  if (!existingBooking) {
    return { success: false, error: "Booking not found" };
  }

  try {
    validateBookingTransition(existingBooking.status as BookingStatus, input.status);

    const updated = await prisma.$transaction(async (tx) => {
      // If moving to ACTIVE, we can update the car's operational status to RENTED
      if (input.status === "ACTIVE") {
        await tx.car.update({
          where: { id: existingBooking.carId },
          data: { operationalStatus: "RENTED" },
        });
      } else if (input.status === "COMPLETED" || input.status === "CANCELLED") {
        // If car was rented, free it back to AVAILABLE if no other active booking
        const activeBookingsCount = await tx.booking.count({
          where: {
            carId: existingBooking.carId,
            id: { not: existingBooking.id },
            status: "ACTIVE",
          },
        });
        if (activeBookingsCount === 0) {
          await tx.car.update({
            where: { id: existingBooking.carId },
            data: { operationalStatus: "AVAILABLE" },
          });
        }
      }

      const booking = await tx.booking.update({
        where: { id: input.bookingId },
        data: {
          status: input.status,
          internalNotes: input.internalNotes !== undefined ? input.internalNotes : existingBooking.internalNotes,
          auditLogs: {
            create: {
              userId: staffUser.id,
              action: `STATUS_CHANGE_TO_${input.status}`,
              fromStatus: existingBooking.status,
              toStatus: input.status,
              details: input.reason || `Status updated by ${staffUser.name}`,
            },
          },
        },
      });

      return booking;
    });

    revalidatePath("/admin/bookings");
    revalidatePath("/admin");
    revalidatePath(`/booking/${existingBooking.bookingReference}`);

    return { success: true, booking: updated };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update booking status" };
  }
}
