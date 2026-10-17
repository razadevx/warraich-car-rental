"use server";

import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth/session";
import { carFormSchema } from "@/lib/validations/car";
import { revalidatePath } from "next/cache";
import { OperationalStatus } from "@/types";

export async function createCarAction(formData: any) {
  await requireAuth(["ADMIN", "STAFF"]);

  const validation = carFormSchema.safeParse(formData);
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0]?.message || "Invalid vehicle data" };
  }

  const data = validation.data;

  // Check unique registration and slug
  const existingReg = await prisma.car.findUnique({ where: { registrationNumber: data.registrationNumber } });
  if (existingReg) {
    return { success: false, error: "A car with this registration number already exists." };
  }

  const existingSlug = await prisma.car.findUnique({ where: { slug: data.slug } });
  if (existingSlug) {
    return { success: false, error: "A car with this URL slug already exists." };
  }

  try {
    const car = await prisma.car.create({
      data: {
        registrationNumber: data.registrationNumber,
        make: data.make,
        model: data.model,
        year: data.year,
        slug: data.slug,
        description: data.description,
        category: data.category,
        transmission: data.transmission,
        fuelType: data.fuelType,
        seatingCapacity: data.seatingCapacity,
        luggageCapacity: data.luggageCapacity,
        dailyRate: data.dailyRate,
        weeklyRate: data.weeklyRate,
        monthlyRate: data.monthlyRate,
        currency: data.currency,
        operationalStatus: data.operationalStatus,
        isPublished: data.isPublished,
        images: {
          create: data.imageUrls.map((url, index) => ({
            imageUrl: url,
            altText: `${data.make} ${data.model} photo ${index + 1}`,
            sortOrder: index,
          })),
        },
      },
    });

    revalidatePath("/admin/cars");
    revalidatePath("/cars");
    return { success: true, car };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create vehicle" };
  }
}

export async function updateCarAction(id: string, formData: any) {
  await requireAuth(["ADMIN", "STAFF"]);

  const validation = carFormSchema.safeParse(formData);
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0]?.message || "Invalid vehicle data" };
  }

  const data = validation.data;

  try {
    const car = await prisma.$transaction(async (tx) => {
      // Update car fields
      const updated = await tx.car.update({
        where: { id },
        data: {
          registrationNumber: data.registrationNumber,
          make: data.make,
          model: data.model,
          year: data.year,
          slug: data.slug,
          description: data.description,
          category: data.category,
          transmission: data.transmission,
          fuelType: data.fuelType,
          seatingCapacity: data.seatingCapacity,
          luggageCapacity: data.luggageCapacity,
          dailyRate: data.dailyRate,
          weeklyRate: data.weeklyRate,
          monthlyRate: data.monthlyRate,
          currency: data.currency,
          operationalStatus: data.operationalStatus,
          isPublished: data.isPublished,
        },
      });

      // If new images provided, recreate them
      if (data.imageUrls && data.imageUrls.length > 0) {
        await tx.carImage.deleteMany({ where: { carId: id } });
        await tx.carImage.createMany({
          data: data.imageUrls.map((url, index) => ({
            carId: id,
            imageUrl: url,
            altText: `${data.make} ${data.model} photo ${index + 1}`,
            sortOrder: index,
          })),
        });
      }

      return updated;
    });

    revalidatePath("/admin/cars");
    revalidatePath(`/cars/${data.slug}`);
    revalidatePath("/cars");
    return { success: true, car };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update vehicle" };
  }
}

export async function toggleCarPublishAction(id: string, isPublished: boolean) {
  await requireAuth(["ADMIN", "STAFF"]);

  try {
    await prisma.car.update({
      where: { id },
      data: { isPublished },
    });
    revalidatePath("/admin/cars");
    revalidatePath("/cars");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateCarOperationalStatusAction(id: string, operationalStatus: OperationalStatus) {
  await requireAuth(["ADMIN", "STAFF"]);

  try {
    await prisma.car.update({
      where: { id },
      data: { operationalStatus },
    });
    revalidatePath("/admin/cars");
    revalidatePath("/cars");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
