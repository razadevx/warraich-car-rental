import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../src/lib/db";
import { calculateBookingPrice, calculateRentalDays } from "../src/lib/booking-engine/pricing";
import { canTransitionBooking, validateBookingTransition } from "../src/lib/booking-engine/state-machine";
import { checkCarAvailability, createBookingSafe, BookingConflictError } from "../src/lib/booking-engine/availability";

describe("Pricing Engine & Duration Calculations", () => {
  const sampleCar = {
    dailyRate: 10000,
    weeklyRate: 60000, // 10,000 discount over 7 days (8571/day)
    monthlyRate: 210000, // 90,000 discount over 30 days (7000/day)
    currency: "PKR",
  };

  it("calculates billable days correctly for 24h intervals", () => {
    const pickup = new Date("2026-11-01T10:00:00Z");
    const returnSameDay = new Date("2026-11-01T18:00:00Z");
    expect(calculateRentalDays(pickup, returnSameDay)).toBe(1);

    const returnNextDay = new Date("2026-11-02T10:00:00Z");
    expect(calculateRentalDays(pickup, returnNextDay)).toBe(1);

    const return26HoursLater = new Date("2026-11-02T12:00:00Z");
    expect(calculateRentalDays(pickup, return26HoursLater)).toBe(2);
  });

  it("throws error if return date is before or equal to pickup date", () => {
    const pickup = new Date("2026-11-02T10:00:00Z");
    const invalidReturn = new Date("2026-11-01T10:00:00Z");
    expect(() => calculateRentalDays(pickup, invalidReturn)).toThrow();
  });

  it("applies standard daily rate for rentals under 7 days", () => {
    const pricing = calculateBookingPrice(sampleCar, 3, [], "PKR");
    expect(pricing.days).toBe(3);
    expect(pricing.rateApplied).toBe("DAILY");
    expect(pricing.rentalPrice).toBe(30000);
    expect(pricing.totalAmount).toBe(30000);
  });

  it("applies weekly discount rate for rentals between 7 and 29 days", () => {
    const pricing = calculateBookingPrice(sampleCar, 7, [], "PKR");
    expect(pricing.days).toBe(7);
    expect(pricing.rateApplied).toBe("WEEKLY");
    expect(pricing.rentalPrice).toBe(60000); // 60,000 vs 70,000 base daily
  });

  it("applies monthly discount rate for rentals of 30 days or more", () => {
    const pricing = calculateBookingPrice(sampleCar, 30, [], "PKR");
    expect(pricing.days).toBe(30);
    expect(pricing.rateApplied).toBe("MONTHLY");
    expect(pricing.rentalPrice).toBe(210000); // 210,000 vs 300,000 base daily
  });

  it("calculates extras correctly for both per-day and flat rates", () => {
    const extras = [
      { id: "e1", name: "Chauffeur", price: 3000, priceType: "PER_DAY" as const, quantity: 1 },
      { id: "e2", name: "Airport Meet", price: 5000, priceType: "FLAT" as const, quantity: 1 },
    ];
    const pricing = calculateBookingPrice(sampleCar, 4, extras, "PKR");
    // 4 days * 10000 = 40000
    // Chauffeur: 4 * 3000 = 12000
    // Airport Meet: 5000
    // Extras total: 17000
    expect(pricing.rentalPrice).toBe(40000);
    expect(pricing.extrasTotal).toBe(17000);
    expect(pricing.totalAmount).toBe(57000);
  });
});

describe("Booking State Machine Transitions", () => {
  it("allows valid transitions", () => {
    expect(canTransitionBooking("PENDING", "CONFIRMED")).toBe(true);
    expect(canTransitionBooking("PENDING", "CANCELLED")).toBe(true);
    expect(canTransitionBooking("CONFIRMED", "ACTIVE")).toBe(true);
    expect(canTransitionBooking("CONFIRMED", "CANCELLED")).toBe(true);
    expect(canTransitionBooking("ACTIVE", "COMPLETED")).toBe(true);
    expect(canTransitionBooking("ACTIVE", "CANCELLED")).toBe(true);
  });

  it("rejects illegal transitions from terminal states", () => {
    expect(canTransitionBooking("COMPLETED", "ACTIVE")).toBe(false);
    expect(canTransitionBooking("COMPLETED", "PENDING")).toBe(false);
    expect(canTransitionBooking("CANCELLED", "CONFIRMED")).toBe(false);
    expect(() => validateBookingTransition("COMPLETED", "CONFIRMED")).toThrow();
  });
});

describe("PostgreSQL Reservation Overlap & Concurrency Tests", () => {
  let testCarId: string;
  const baseDate = new Date("2027-05-10T10:00:00Z");

  beforeAll(async () => {
    // Find or create an isolated test car
    let car = await prisma.car.findFirst({ where: { slug: "test-booking-car" } });
    if (!car) {
      car = await prisma.car.create({
        data: {
          registrationNumber: "TEST-REG-99",
          make: "Toyota",
          model: "Test Yaris",
          year: 2024,
          slug: "test-booking-car",
          category: "ECONOMY",
          transmission: "AUTOMATIC",
          fuelType: "PETROL",
          seatingCapacity: 5,
          luggageCapacity: 2,
          dailyRate: 5000,
          weeklyRate: 30000,
          monthlyRate: 110000,
          currency: "PKR",
          operationalStatus: "AVAILABLE",
          isPublished: true,
          description: "Integration test car",
        },
      });
    }
    testCarId = car.id;

    // Clean up test bookings and maintenance for this car
    await prisma.booking.deleteMany({ where: { carId: testCarId } });
    await prisma.maintenanceRecord.deleteMany({ where: { carId: testCarId } });
  });

  afterAll(async () => {
    await prisma.booking.deleteMany({ where: { carId: testCarId } });
    await prisma.maintenanceRecord.deleteMany({ where: { carId: testCarId } });
    await prisma.$disconnect();
  });

  it("successfully creates a non-conflicting booking", async () => {
    const pickup = new Date("2027-05-10T10:00:00Z");
    const returnDate = new Date("2027-05-14T10:00:00Z");

    const booking = await createBookingSafe({
      carId: testCarId,
      pickupDateTime: pickup,
      returnDateTime: returnDate,
      pickupLocation: "Gujrat Office",
      returnLocation: "Gujrat Office",
      fullName: "Test Customer 1",
      email: "test1@example.com",
      phone: "+923001112233",
    });

    expect(booking).toBeDefined();
    expect(booking.bookingReference).toMatch(/^WM-/);
    expect(booking.status).toBe("PENDING");
  });

  it("detects exact overlapping bookings", async () => {
    const pickup = new Date("2027-05-10T10:00:00Z");
    const returnDate = new Date("2027-05-14T10:00:00Z");

    const availability = await checkCarAvailability(testCarId, pickup, returnDate, { bufferHours: 0 });
    expect(availability.isAvailable).toBe(false);
  });

  it("detects partially overlapping bookings starting before and ending during", async () => {
    const pickup = new Date("2027-05-08T10:00:00Z");
    const returnDate = new Date("2027-05-12T10:00:00Z");

    const availability = await checkCarAvailability(testCarId, pickup, returnDate, { bufferHours: 0 });
    expect(availability.isAvailable).toBe(false);
  });

  it("detects partially overlapping bookings starting during and ending after", async () => {
    const pickup = new Date("2027-05-12T10:00:00Z");
    const returnDate = new Date("2027-05-16T10:00:00Z");

    const availability = await checkCarAvailability(testCarId, pickup, returnDate, { bufferHours: 0 });
    expect(availability.isAvailable).toBe(false);
  });

  it("detects contained bookings within an existing reservation", async () => {
    const pickup = new Date("2027-05-11T10:00:00Z");
    const returnDate = new Date("2027-05-13T10:00:00Z");

    const availability = await checkCarAvailability(testCarId, pickup, returnDate, { bufferHours: 0 });
    expect(availability.isAvailable).toBe(false);
  });

  it("detects enclosing bookings that wrap an existing reservation", async () => {
    const pickup = new Date("2027-05-05T10:00:00Z");
    const returnDate = new Date("2027-05-20T10:00:00Z");

    const availability = await checkCarAvailability(testCarId, pickup, returnDate, { bufferHours: 0 });
    expect(availability.isAvailable).toBe(false);
  });

  it("detects maintenance conflicts", async () => {
    const maintStart = new Date("2027-06-01T08:00:00Z");
    const maintEnd = new Date("2027-06-03T18:00:00Z");

    await prisma.maintenanceRecord.create({
      data: {
        carId: testCarId,
        startDateTime: maintStart,
        endDateTime: maintEnd,
        description: "Scheduled Oil Change & Brake Pad Replacement",
        status: "SCHEDULED",
      },
    });

    const availability = await checkCarAvailability(testCarId, maintStart, maintEnd, { bufferHours: 0 });
    expect(availability.isAvailable).toBe(false);
    expect(availability.reason).toContain("maintenance");
  });

  it("handles concurrent reservation race conditions safely", async () => {
    const racePickup = new Date("2027-07-01T10:00:00Z");
    const raceReturn = new Date("2027-07-05T10:00:00Z");

    // Launch two concurrent requests attempting to book the exact same car and interval
    const results = await Promise.allSettled([
      createBookingSafe({
        carId: testCarId,
        pickupDateTime: racePickup,
        returnDateTime: raceReturn,
        pickupLocation: "Gujrat Office",
        returnLocation: "Gujrat Office",
        fullName: "Race Buyer A",
        email: "raceA@example.com",
        phone: "+923009999001",
      }),
      createBookingSafe({
        carId: testCarId,
        pickupDateTime: racePickup,
        returnDateTime: raceReturn,
        pickupLocation: "Gujrat Office",
        returnLocation: "Gujrat Office",
        fullName: "Race Buyer B",
        email: "raceB@example.com",
        phone: "+923009999002",
      }),
    ]);

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");

    // Exactly one should succeed, and one should fail due to concurrency protection
    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);
  });
});
