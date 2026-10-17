import { prisma } from "@/lib/db";
import { AvailabilityResult, BookingStatus } from "@/types";
import { calculateBookingPrice, calculateRentalDays, ExtraInput } from "./pricing";
import { generateBookingReference } from "@/lib/utils";

export class BookingConflictError extends Error {
  constructor(message: string, public conflictingId?: string) {
    super(message);
    this.name = "BookingConflictError";
  }
}

export class CarNotRentableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CarNotRentableError";
  }
}

/**
 * Checks whether a car is available for the given [pickup, return) interval,
 * taking into account blocking booking statuses and business turnaround buffer.
 */
export async function checkCarAvailability(
  carId: string,
  pickupDateTime: Date,
  returnDateTime: Date,
  options?: {
    excludeBookingId?: string;
    bufferHours?: number;
    blockingStatuses?: BookingStatus[];
  }
): Promise<AvailabilityResult> {
  const pickup = new Date(pickupDateTime);
  const returnDate = new Date(returnDateTime);

  if (returnDate.getTime() <= pickup.getTime()) {
    return {
      isAvailable: false,
      carId,
      reason: "Return date must be strictly after pickup date",
    };
  }

  // 1. Check car existence and published/operational status
  const car = await prisma.car.findUnique({
    where: { id: carId },
  });

  if (!car) {
    return {
      isAvailable: false,
      carId,
      reason: "Vehicle not found",
    };
  }

  if (!car.isPublished) {
    return {
      isAvailable: false,
      carId,
      reason: "Vehicle is not currently published for rental",
    };
  }

  if (car.operationalStatus !== "AVAILABLE" && car.operationalStatus !== "RENTED") {
    return {
      isAvailable: false,
      carId,
      reason: `Vehicle operational status is ${car.operationalStatus}`,
    };
  }

  // 2. Fetch business settings for default buffer & blocking statuses if not passed
  let bufferHours = options?.bufferHours;
  let blockingStatuses = options?.blockingStatuses;

  if (bufferHours === undefined || !blockingStatuses) {
    const settings = await prisma.businessSettings.findFirst();
    if (bufferHours === undefined) {
      bufferHours = settings?.turnaroundBufferHours ?? 2;
    }
    if (!blockingStatuses) {
      const parsedStatuses = (settings?.blockingStatuses ?? "PENDING,CONFIRMED,ACTIVE")
        .split(",")
        .map((s) => s.trim() as BookingStatus);
      blockingStatuses = parsedStatuses;
    }
  }

  const bufferMs = bufferHours * 60 * 60 * 1000;
  // Buffer interval: existing buffer expands existing return time by bufferMs
  // Overlap condition with buffer:
  // existing.pickup < req.return + buffer AND existing.return + buffer > req.pickup
  const bufferedReqPickup = new Date(pickup.getTime() - bufferMs);
  const bufferedReqReturn = new Date(returnDate.getTime() + bufferMs);

  // 3. Query overlapping bookings
  const conflictingBooking = await prisma.booking.findFirst({
    where: {
      carId,
      id: options?.excludeBookingId ? { not: options.excludeBookingId } : undefined,
      status: { in: blockingStatuses },
      pickupDateTime: { lt: bufferedReqReturn },
      returnDateTime: { gt: bufferedReqPickup },
    },
    select: {
      id: true,
      bookingReference: true,
      pickupDateTime: true,
      returnDateTime: true,
      status: true,
    },
  });

  if (conflictingBooking) {
    return {
      isAvailable: false,
      carId,
      conflictingBookingReference: conflictingBooking.bookingReference,
      reason: `Vehicle is already reserved from ${new Date(conflictingBooking.pickupDateTime).toLocaleString()} to ${new Date(conflictingBooking.returnDateTime).toLocaleString()}`,
    };
  }

  // 4. Query maintenance conflicts
  const conflictingMaintenance = await prisma.maintenanceRecord.findFirst({
    where: {
      carId,
      status: { in: ["SCHEDULED", "IN_PROGRESS"] },
      startDateTime: { lt: returnDate },
      OR: [
        { endDateTime: null },
        { endDateTime: { gt: pickup } },
      ],
    },
    select: {
      id: true,
      description: true,
      startDateTime: true,
      endDateTime: true,
    },
  });

  if (conflictingMaintenance) {
    return {
      isAvailable: false,
      carId,
      conflictingMaintenanceId: conflictingMaintenance.id,
      reason: `Vehicle has scheduled maintenance: ${conflictingMaintenance.description}`,
    };
  }

  return {
    isAvailable: true,
    carId,
  };
}

export interface CreateBookingInput {
  carId: string;
  pickupDateTime: string | Date;
  returnDateTime: string | Date;
  pickupLocation: string;
  returnLocation: string;
  fullName: string;
  phone: string;
  email: string;
  address?: string;
  nationalIdOrPassport?: string;
  customerNotes?: string;
  extras?: Array<{ extraId: string; quantity: number }>;
  userId?: string; // staff user who created if manual
}

/**
 * Concurrency-safe reservation creation using PostgreSQL row locking inside an interactive transaction.
 */
export async function createBookingSafe(input: CreateBookingInput) {
  const pickup = new Date(input.pickupDateTime);
  const returnDate = new Date(input.returnDateTime);

  if (returnDate.getTime() <= pickup.getTime()) {
    throw new Error("Return date must be strictly after pickup date");
  }

  const days = calculateRentalDays(pickup, returnDate);

  return await prisma.$transaction(async (tx) => {
    // 1. Explicit row-level lock on the target car to serialize concurrent requests for this car
    const lockedCarRows = await tx.$queryRawUnsafe<Array<{ id: string; isPublished: boolean; operationalStatus: string; dailyRate: any; weeklyRate: any; monthlyRate: any; currency: string }>>(
      `SELECT "id", "isPublished", "operationalStatus", "dailyRate", "weeklyRate", "monthlyRate", "currency" FROM "Car" WHERE "id" = $1 FOR UPDATE`,
      input.carId
    );

    if (!lockedCarRows || lockedCarRows.length === 0) {
      throw new CarNotRentableError("Vehicle not found");
    }

    const car = lockedCarRows[0];
    if (!car.isPublished || (car.operationalStatus !== "AVAILABLE" && car.operationalStatus !== "RENTED")) {
      throw new CarNotRentableError(`Vehicle is not available for booking (Status: ${car.operationalStatus})`);
    }

    // 2. Load business settings
    const settings = await tx.businessSettings.findFirst();
    const bufferHours = settings?.turnaroundBufferHours ?? 2;
    const blockingStatuses = (settings?.blockingStatuses ?? "PENDING,CONFIRMED,ACTIVE")
      .split(",")
      .map((s) => s.trim() as BookingStatus);

    const bufferMs = bufferHours * 60 * 60 * 1000;
    const bufferedReqPickup = new Date(pickup.getTime() - bufferMs);
    const bufferedReqReturn = new Date(returnDate.getTime() + bufferMs);

    // 3. Conflict query while holding row lock
    const conflictingBooking = await tx.booking.findFirst({
      where: {
        carId: input.carId,
        status: { in: blockingStatuses },
        pickupDateTime: { lt: bufferedReqReturn },
        returnDateTime: { gt: bufferedReqPickup },
      },
    });

    if (conflictingBooking) {
      throw new BookingConflictError(
        "Another reservation was just made for this vehicle during the selected time period.",
        conflictingBooking.id
      );
    }

    // 4. Maintenance conflict query
    const conflictingMaintenance = await tx.maintenanceRecord.findFirst({
      where: {
        carId: input.carId,
        status: { in: ["SCHEDULED", "IN_PROGRESS"] },
        startDateTime: { lt: returnDate },
        OR: [
          { endDateTime: null },
          { endDateTime: { gt: pickup } },
        ],
      },
    });

    if (conflictingMaintenance) {
      throw new BookingConflictError(
        `Vehicle is scheduled for maintenance: ${conflictingMaintenance.description}`
      );
    }

    // 5. Fetch selected extras from database
    let resolvedExtras: ExtraInput[] = [];
    if (input.extras && input.extras.length > 0) {
      const extraIds = input.extras.map((e) => e.extraId);
      const dbExtras = await tx.rentalExtra.findMany({
        where: { id: { in: extraIds }, isActive: true },
      });

      resolvedExtras = dbExtras.map((dbE) => {
        const item = input.extras?.find((e) => e.extraId === dbE.id);
        return {
          id: dbE.id,
          name: dbE.name,
          price: dbE.price,
          priceType: dbE.priceType as "PER_DAY" | "FLAT",
          quantity: item?.quantity ?? 1,
        };
      });
    }

    // 6. Calculate prices
    const pricing = calculateBookingPrice(
      {
        dailyRate: car.dailyRate,
        weeklyRate: car.weeklyRate,
        monthlyRate: car.monthlyRate,
        currency: car.currency,
      },
      days,
      resolvedExtras,
      car.currency
    );

    // 7. Find or create Customer record
    let customer = await tx.customer.findFirst({
      where: {
        OR: [{ email: input.email.toLowerCase().trim() }, { phone: input.phone.trim() }],
      },
    });

    if (!customer) {
      customer = await tx.customer.create({
        data: {
          fullName: input.fullName.trim(),
          email: input.email.toLowerCase().trim(),
          phone: input.phone.trim(),
          address: input.address?.trim() || null,
          drivingLicenceDetails: input.nationalIdOrPassport?.trim() || null,
        },
      });
    } else {
      // Update customer details if provided
      customer = await tx.customer.update({
        where: { id: customer.id },
        data: {
          fullName: input.fullName.trim(),
          address: input.address?.trim() || customer.address,
          drivingLicenceDetails: input.nationalIdOrPassport?.trim() || customer.drivingLicenceDetails,
        },
      });
    }

    // 8. Generate non-guessable booking reference
    const bookingReference = generateBookingReference();

    // 9. Create booking
    const booking = await tx.booking.create({
      data: {
        bookingReference,
        customerId: customer.id,
        carId: input.carId,
        pickupDateTime: pickup,
        returnDateTime: returnDate,
        pickupLocation: input.pickupLocation,
        returnLocation: input.returnLocation,
        status: "PENDING",
        rentalPrice: pricing.rentalPrice,
        extrasTotal: pricing.extrasTotal,
        discount: 0,
        depositAmount: pricing.depositAmount,
        totalAmount: pricing.totalAmount,
        amountPaid: 0,
        currency: car.currency,
        customerNotes: input.customerNotes?.trim() || null,
        extras: {
          create: pricing.extrasBreakdown.map((extra) => ({
            extraId: extra.id,
            nameSnapshot: extra.name,
            priceSnapshot: extra.price,
            quantity: extra.quantity,
          })),
        },
        auditLogs: {
          create: {
            userId: input.userId || null,
            action: "BOOKING_CREATED",
            fromStatus: null,
            toStatus: "PENDING",
            details: `Booking created by ${input.fullName}. Duration: ${days} days. Total: ${pricing.totalAmount} ${car.currency}.`,
          },
        },
      },
      include: {
        car: true,
        customer: true,
        extras: true,
      },
    });

    return booking;
  });
}
