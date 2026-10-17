"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function updateBusinessSettingsAction(formData: {
  companyName: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  currency: string;
  timezone: string;
  turnaroundBufferHours: number;
  blockingStatuses: string;
  defaultRentalRules: string;
  bookingPolicy: string;
  cancellationPolicy: string;
}) {
  // Only ADMIN can modify business settings
  await requireAuth(["ADMIN"]);

  try {
    const settings = await prisma.businessSettings.upsert({
      where: { id: 1 },
      update: {
        companyName: formData.companyName,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,
        address: formData.address,
        currency: formData.currency,
        timezone: formData.timezone,
        turnaroundBufferHours: Number(formData.turnaroundBufferHours),
        blockingStatuses: formData.blockingStatuses,
        defaultRentalRules: formData.defaultRentalRules,
        bookingPolicy: formData.bookingPolicy,
        cancellationPolicy: formData.cancellationPolicy,
      },
      create: {
        id: 1,
        companyName: formData.companyName,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,
        address: formData.address,
        currency: formData.currency,
        timezone: formData.timezone,
        turnaroundBufferHours: Number(formData.turnaroundBufferHours),
        blockingStatuses: formData.blockingStatuses,
        defaultRentalRules: formData.defaultRentalRules,
        bookingPolicy: formData.bookingPolicy,
        cancellationPolicy: formData.cancellationPolicy,
      },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/");
    revalidatePath("/terms");
    revalidatePath("/contact");

    return { success: true, settings };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update business settings" };
  }
}
