"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { MaintenanceStatus } from "@/types";

export async function createMaintenanceAction(formData: {
  carId: string;
  startDateTime: string;
  endDateTime?: string;
  description: string;
  cost?: number;
  status: MaintenanceStatus;
}) {
  await requireAuth(["ADMIN", "STAFF"]);

  if (!formData.carId || !formData.description || !formData.startDateTime) {
    return { success: false, error: "Please fill all required fields" };
  }

  try {
    const record = await prisma.$transaction(async (tx) => {
      const rec = await tx.maintenanceRecord.create({
        data: {
          carId: formData.carId,
          startDateTime: new Date(formData.startDateTime),
          endDateTime: formData.endDateTime ? new Date(formData.endDateTime) : null,
          description: formData.description,
          cost: formData.cost || null,
          status: formData.status,
        },
      });

      // If status is IN_PROGRESS, mark vehicle operationalStatus as MAINTENANCE
      if (formData.status === "IN_PROGRESS") {
        await tx.car.update({
          where: { id: formData.carId },
          data: { operationalStatus: "MAINTENANCE" },
        });
      }

      return rec;
    });

    revalidatePath("/admin/maintenance");
    revalidatePath("/admin/cars");
    return { success: true, record };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to schedule maintenance" };
  }
}

export async function updateMaintenanceStatusAction(id: string, status: MaintenanceStatus) {
  await requireAuth(["ADMIN", "STAFF"]);

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const rec = await tx.maintenanceRecord.update({
        where: { id },
        data: { status },
      });

      if (status === "COMPLETED") {
        // If no other maintenance is IN_PROGRESS, set car back to AVAILABLE
        const ongoing = await tx.maintenanceRecord.count({
          where: { carId: rec.carId, status: "IN_PROGRESS" },
        });
        if (ongoing === 0) {
          await tx.car.update({
            where: { id: rec.carId },
            data: { operationalStatus: "AVAILABLE" },
          });
        }
      } else if (status === "IN_PROGRESS") {
        await tx.car.update({
          where: { id: rec.carId },
          data: { operationalStatus: "MAINTENANCE" },
        });
      }

      return rec;
    });

    revalidatePath("/admin/maintenance");
    revalidatePath("/admin/cars");
    return { success: true, record: updated };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update maintenance record" };
  }
}
