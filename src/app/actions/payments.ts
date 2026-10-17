"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth/session";
import { addPaymentSchema } from "@/lib/validations/booking";
import { revalidatePath } from "next/cache";

export async function recordPaymentAction(input: {
  bookingId: string;
  amount: number;
  paymentMethod: "CASH" | "BANK_TRANSFER" | "CREDIT_CARD" | "POS" | "CHEQUE";
  paymentType: "RENTAL" | "DEPOSIT" | "REFUND" | "DAMAGE_CHARGE";
  transactionReference?: string;
  notes?: string;
}) {
  const staff = await requireAuth(["ADMIN", "STAFF"]);

  const validation = addPaymentSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0]?.message || "Invalid payment details" };
  }

  const booking = await prisma.booking.findUnique({
    where: { id: input.bookingId },
  });

  if (!booking) {
    return { success: false, error: "Booking not found" };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create payment entry
      const payment = await tx.payment.create({
        data: {
          bookingId: input.bookingId,
          amount: input.amount,
          currency: booking.currency,
          paymentMethod: input.paymentMethod,
          paymentType: input.paymentType,
          status: "COMPLETED",
          transactionReference: input.transactionReference || null,
          notes: input.notes || null,
        },
      });

      // 2. Adjust booking amountPaid (refund subtracts, rental/deposit adds)
      const currentPaid = Number(booking.amountPaid);
      const adjustment = input.paymentType === "REFUND" ? -input.amount : input.amount;
      const newPaid = Math.max(0, currentPaid + adjustment);

      const updatedBooking = await tx.booking.update({
        where: { id: input.bookingId },
        data: { amountPaid: newPaid },
      });

      // 3. Write audit log
      await tx.bookingAuditLog.create({
        data: {
          bookingId: input.bookingId,
          userId: staff.id,
          action: "PAYMENT_RECORDED",
          details: `Recorded ${input.paymentType} payment of ${input.amount} ${booking.currency} via ${input.paymentMethod}. Recorded by ${staff.name}.`,
        },
      });

      return { payment, updatedBooking };
    });

    revalidatePath("/admin/bookings");
    revalidatePath("/admin/payments");
    revalidatePath("/admin");

    return { success: true, payment: result.payment };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to record payment" };
  }
}
