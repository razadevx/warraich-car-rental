import { PrismaClient, Role, OperationalStatus, BookingStatus, PaymentMethod, PaymentType, PaymentStatus, ExtraPriceType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Warraich Motors database...");

  // 1. Business Settings
  await prisma.businessSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      companyName: "Warraich Motors Gujrat",
      contactPhone: "+92 300 1234567",
      contactEmail: "info@warraichmotors.pk",
      address: "GT Road, Gujrat, Punjab, Pakistan",
      currency: "PKR",
      timezone: "Asia/Karachi",
      turnaroundBufferHours: 2,
      blockingStatuses: "PENDING,CONFIRMED,ACTIVE",
      defaultRentalRules: "Minimum driver age is 21. Original CNIC or Passport and valid driving licence are required at pickup. Fuel policy: Same to same.",
      bookingPolicy: "All online bookings require manual staff review and approval. You will receive an SMS and email upon confirmation.",
      cancellationPolicy: "Free cancellation up to 24 hours prior to scheduled pickup time.",
    },
  });

  // 2. Staff and Admin Users
  const adminPasswordHash = await bcrypt.hash("Admin@12345", 10);
  const staffPasswordHash = await bcrypt.hash("Staff@12345", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@warraichmotors.pk" },
    update: { passwordHash: adminPasswordHash },
    create: {
      name: "Tariq Warraich (Admin)",
      email: "admin@warraichmotors.pk",
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: "staff@warraichmotors.pk" },
    update: { passwordHash: staffPasswordHash },
    create: {
      name: "Hamza Malik (Fleet Staff)",
      email: "staff@warraichmotors.pk",
      passwordHash: staffPasswordHash,
      role: Role.STAFF,
      isActive: true,
    },
  });

  console.log("✅ Admin & Staff users seeded (admin@warraichmotors.pk / Admin@12345)");

  // 3. Rental Extras & Packages
  const extrasData = [
    {
      name: "Chauffeur Driven (Professional Uniformed Driver)",
      description: "Experienced, verified professional driver for 12 hours daily within city/intercity.",
      price: 3500,
      priceType: ExtraPriceType.PER_DAY,
    },
    {
      name: "Full Comprehensive Damage Waiver (Zero Deductible)",
      description: "Full insurance waiver against minor accidental scratches and damages.",
      price: 2000,
      priceType: ExtraPriceType.PER_DAY,
    },
    {
      name: "Child Safety Seat (ISOFIX)",
      description: "ECE R44/04 certified safety booster or rear/forward baby seat.",
      price: 800,
      priceType: ExtraPriceType.PER_DAY,
    },
    {
      name: "Airport Meet & Greet (Islamabad/Lahore/Sialkot)",
      description: "Direct handover and drop-off service at international terminals.",
      price: 5000,
      priceType: ExtraPriceType.FLAT,
    },
    {
      name: "High-Speed 4G Mobile Wi-Fi Hotspot",
      description: "Portable 4G LTE Wi-Fi router with unlimited high-speed data.",
      price: 600,
      priceType: ExtraPriceType.PER_DAY,
    },
  ];

  for (const extra of extrasData) {
    const existing = await prisma.rentalExtra.findFirst({ where: { name: extra.name } });
    if (!existing) {
      await prisma.rentalExtra.create({ data: extra });
    }
  }

  // 4. Fleet Vehicles
  const fleetData = [
    {
      registrationNumber: "LEA-23-9001",
      make: "Toyota",
      model: "Land Cruiser Prado TX",
      year: 2023,
      slug: "toyota-prado-tx-2023",
      category: "LUXURY_SUV",
      transmission: "AUTOMATIC",
      fuelType: "DIESEL",
      seatingCapacity: 7,
      luggageCapacity: 5,
      dailyRate: 35000,
      weeklyRate: 210000,
      monthlyRate: 750000,
      currency: "PKR",
      operationalStatus: OperationalStatus.AVAILABLE,
      isPublished: true,
      description: "The pinnacle of comfort and prestige. Toyota Land Cruiser Prado TX with 2.8L turbo diesel engine, sunroof, leather seating, 4WD terrain control, and premium climate controls.",
      images: [
        "https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      registrationNumber: "ISB-24-4412",
      make: "Toyota",
      model: "Fortuner Legender 4x4",
      year: 2024,
      slug: "toyota-fortuner-legender-2024",
      category: "SUV",
      transmission: "AUTOMATIC",
      fuelType: "DIESEL",
      seatingCapacity: 7,
      luggageCapacity: 4,
      dailyRate: 25000,
      weeklyRate: 150000,
      monthlyRate: 550000,
      currency: "PKR",
      operationalStatus: OperationalStatus.AVAILABLE,
      isPublished: true,
      description: "The muscular Fortuner Legender with bold front fascia, dual-tone roof, bi-beam LED headlights, JBL sound system, and rugged 4x4 off-road capability.",
      images: [
        "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      registrationNumber: "GJT-23-1100",
      make: "Honda",
      model: "Civic RS Turbo 1.5L",
      year: 2023,
      slug: "honda-civic-rs-turbo-2023",
      category: "SEDAN",
      transmission: "AUTOMATIC",
      fuelType: "PETROL",
      seatingCapacity: 5,
      luggageCapacity: 3,
      dailyRate: 15000,
      weeklyRate: 90000,
      monthlyRate: 320000,
      currency: "PKR",
      operationalStatus: OperationalStatus.AVAILABLE,
      isPublished: true,
      description: "Sporty, elegant, and thrilling. Honda Civic RS Turbo comes equipped with Honda SENSING safety suite, sport pedals, black accented spoilers, and responsive CVT transmission.",
      images: [
        "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      registrationNumber: "GJT-24-5588",
      make: "Toyota",
      model: "Corolla Altis Grande 1.8",
      year: 2024,
      slug: "toyota-corolla-altis-grande-2024",
      category: "SEDAN",
      transmission: "AUTOMATIC",
      fuelType: "PETROL",
      seatingCapacity: 5,
      luggageCapacity: 3,
      dailyRate: 12000,
      weeklyRate: 72000,
      monthlyRate: 260000,
      currency: "PKR",
      operationalStatus: OperationalStatus.AVAILABLE,
      isPublished: true,
      description: "The gold standard of reliability on Pakistani roads. Full options with sunroof, cruise control, leather interior, paddle shifters, and exceptional air conditioning.",
      images: [
        "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      registrationNumber: "LHR-23-7721",
      make: "Hyundai",
      model: "Tucson AWD Ultimate",
      year: 2023,
      slug: "hyundai-tucson-awd-2023",
      category: "CROSSOVER",
      transmission: "AUTOMATIC",
      fuelType: "PETROL",
      seatingCapacity: 5,
      luggageCapacity: 4,
      dailyRate: 16000,
      weeklyRate: 96000,
      monthlyRate: 350000,
      currency: "PKR",
      operationalStatus: OperationalStatus.AVAILABLE,
      isPublished: true,
      description: "Modern, high-riding crossover with panoramic sunroof, HTRAC all-wheel drive, smart tailgate, wireless charging, and plush ride quality.",
      images: [
        "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      registrationNumber: "GJT-23-3320",
      make: "Toyota",
      model: "Yaris ATIV X 1.5",
      year: 2023,
      slug: "toyota-yaris-ativ-x-2023",
      category: "ECONOMY",
      transmission: "AUTOMATIC",
      fuelType: "PETROL",
      seatingCapacity: 5,
      luggageCapacity: 2,
      dailyRate: 8000,
      weeklyRate: 48000,
      monthlyRate: 180000,
      currency: "PKR",
      operationalStatus: OperationalStatus.AVAILABLE,
      isPublished: true,
      description: "Economic, nimble, and highly efficient for city commutes and family visits. Features push start, automatic climate control, and superior fuel economy.",
      images: [
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      registrationNumber: "RWP-22-6600",
      make: "Toyota",
      model: "Hiace Grand Cabin Executive",
      year: 2022,
      slug: "toyota-hiace-grand-cabin-2022",
      category: "VAN",
      transmission: "MANUAL",
      fuelType: "DIESEL",
      seatingCapacity: 14,
      luggageCapacity: 8,
      dailyRate: 18000,
      weeklyRate: 108000,
      monthlyRate: 400000,
      currency: "PKR",
      operationalStatus: OperationalStatus.AVAILABLE,
      isPublished: true,
      description: "Perfect for large family weddings, northern area tours, and VIP delegations. 14 comfortable reclining seats with dual AC vents and abundant luggage room.",
      images: [
        "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80",
      ],
    },
  ];

  for (const carItem of fleetData) {
    const { images, ...carProps } = carItem;
    const car = await prisma.car.upsert({
      where: { slug: carProps.slug },
      update: carProps,
      create: carProps,
    });

    // Seed images
    for (let i = 0; i < images.length; i++) {
      const existingImage = await prisma.carImage.findFirst({
        where: { carId: car.id, sortOrder: i },
      });
      if (!existingImage) {
        await prisma.carImage.create({
          data: {
            carId: car.id,
            imageUrl: images[i],
            altText: `${car.make} ${car.model} view ${i + 1}`,
            sortOrder: i,
          },
        });
      }
    }
  }

  console.log("✅ Fleet seeded (7 high-demand vehicles with photos and rates)");

  // 5. Demo Customers & Initial Bookings
  const demoCustomer1 = await prisma.customer.upsert({
    where: { id: "demo-cust-1" },
    update: {},
    create: {
      id: "demo-cust-1",
      fullName: "Chaudhry Bilal Warraich",
      phone: "+92 301 7788990",
      email: "bilal.warraich@example.com",
      address: "Rehman Shaheed Road, Gujrat",
      drivingLicenceDetails: "DL-GJT-99882",
      internalNotes: "VIP client. Prefers chauffeur-driven vehicles. Prompt payer.",
    },
  });

  const demoCustomer2 = await prisma.customer.upsert({
    where: { id: "demo-cust-2" },
    update: {},
    create: {
      id: "demo-cust-2",
      fullName: "Dr. Ayesha Siddiqa",
      phone: "+92 321 4455667",
      email: "ayesha.siddiqa@example.com",
      address: "Court Road, Gujrat",
      drivingLicenceDetails: "DL-LHR-55441",
      internalNotes: "Visiting consultant. Rents monthly sedans.",
    },
  });

  const corolla = await prisma.car.findUnique({ where: { slug: "toyota-corolla-altis-grande-2024" } });
  const prado = await prisma.car.findUnique({ where: { slug: "toyota-prado-tx-2023" } });

  if (corolla) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const fourDaysLater = new Date(tomorrow);
    fourDaysLater.setDate(tomorrow.getDate() + 3);
    fourDaysLater.setHours(18, 0, 0, 0);

    const existingBooking = await prisma.booking.findFirst({
      where: { bookingReference: "WM-DEMO01" },
    });

    if (!existingBooking) {
      const b = await prisma.booking.create({
        data: {
          bookingReference: "WM-DEMO01",
          customerId: demoCustomer1.id,
          carId: corolla.id,
          pickupDateTime: tomorrow,
          returnDateTime: fourDaysLater,
          pickupLocation: "Warraich Motors Office, GT Road Gujrat",
          returnLocation: "Warraich Motors Office, GT Road Gujrat",
          status: BookingStatus.CONFIRMED,
          rentalPrice: 36000,
          extrasTotal: 10500,
          discount: 0,
          depositAmount: 10000,
          totalAmount: 46500,
          amountPaid: 46500,
          currency: "PKR",
          customerNotes: "Requires car washed and fuel tank full upon pickup.",
          internalNotes: "Advance payment received via Bank Alfalah transfer.",
          payments: {
            create: {
              amount: 46500,
              currency: "PKR",
              paymentMethod: PaymentMethod.BANK_TRANSFER,
              paymentType: PaymentType.RENTAL,
              status: PaymentStatus.COMPLETED,
              transactionReference: "ALFALAH-TX-889912",
              notes: "Full payment received in advance",
            },
          },
          auditLogs: {
            create: {
              userId: admin.id,
              action: "CONFIRMED",
              fromStatus: BookingStatus.PENDING,
              toStatus: BookingStatus.CONFIRMED,
              details: "Manual approval given after bank transfer verification.",
            },
          },
        },
      });
    }
  }

  if (prado) {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(9, 0, 0, 0);

    const tenDaysLater = new Date(nextWeek);
    tenDaysLater.setDate(nextWeek.getDate() + 4);
    tenDaysLater.setHours(20, 0, 0, 0);

    const existingPending = await prisma.booking.findFirst({
      where: { bookingReference: "WM-DEMO02" },
    });

    if (!existingPending) {
      await prisma.booking.create({
        data: {
          bookingReference: "WM-DEMO02",
          customerId: demoCustomer2.id,
          carId: prado.id,
          pickupDateTime: nextWeek,
          returnDateTime: tenDaysLater,
          pickupLocation: "Islamabad International Airport Terminal 1",
          returnLocation: "Warraich Motors Office, Gujrat",
          status: BookingStatus.PENDING,
          rentalPrice: 140000,
          extrasTotal: 5000,
          discount: 0,
          depositAmount: 28000,
          totalAmount: 145000,
          amountPaid: 0,
          currency: "PKR",
          customerNotes: "Airport pickup requested. Arriving on flight PK-788.",
          internalNotes: "Pending staff review of driving license and flight itinerary.",
          auditLogs: {
            create: {
              action: "CREATED",
              toStatus: BookingStatus.PENDING,
              details: "Submitted via website booking engine.",
            },
          },
        },
      });
    }
  }

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
