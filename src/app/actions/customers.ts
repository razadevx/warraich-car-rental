"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth/session";
import { customerUpdateSchema } from "@/lib/validations/car";
import { revalidatePath } from "next/cache";

export async function updateCustomerAction(id: string, formData: any) {
  await requireAuth(["ADMIN", "STAFF"]);

  const validation = customerUpdateSchema.safeParse(formData);
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0]?.message || "Invalid customer data" };
  }

  const data = validation.data;

  try {
    const customer = await prisma.customer.update({
      where: { id },
      data: {
        fullName: data.fullName,
        phone: data.phone,
        email: data.email.toLowerCase().trim(),
        address: data.address || null,
        drivingLicenceDetails: data.drivingLicenceDetails || null,
        internalNotes: data.internalNotes || null,
      },
    });

    revalidatePath("/admin/customers");
    return { success: true, customer };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update customer" };
  }
}

export async function createCustomerAction(formData: any) {
  await requireAuth(["ADMIN", "STAFF"]);

  const validation = customerUpdateSchema.safeParse(formData);
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0]?.message || "Invalid customer data" };
  }

  const data = validation.data;

  try {
    const customer = await prisma.customer.create({
      data: {
        fullName: data.fullName,
        phone: data.phone,
        email: data.email.toLowerCase().trim(),
        address: data.address || null,
        drivingLicenceDetails: data.drivingLicenceDetails || null,
        internalNotes: data.internalNotes || null,
      },
    });

    revalidatePath("/admin/customers");
    return { success: true, customer };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create customer" };
  }
}
