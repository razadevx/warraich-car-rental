import { PrismaClient, Role, OperationalStatus, BookingStatus, PaymentMethod, PaymentType, PaymentStatus, ExtraPriceType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Warraich Motors database...");

  // 1. Business Settings
  await prisma.businessSettings.upsert({
    where: { id: 1 },
    update: {
      contactPhone: "0313 6225135",
      contactEmail: "warraichmotorsgujrat@gmail.com",
      address: "Mian, GT Rd, Small Industrial Area, Punjab, Gujrat, 50700",
    },
    create: {
      id: 1,
      companyName: "Warraich Motors Gujrat",
      contactPhone: "0313 6225135",
      contactEmail: "warraichmotorsgujrat@gmail.com",
      address: "Mian, GT Rd, Small Industrial Area, Punjab, Gujrat, 50700",
      currency: "PKR",
      timezone: "Asia/Karachi",
      turnaroundBufferHours: 2,
      blockingStatuses: "PENDING,CONFIRMED,ACTIVE",
      defaultRentalRules: "Minimum driver age is 21. Original CNIC or Passport and valid driving licence are required at pickup. Fuel policy: Same to same.",
      bookingPolicy: "All online bookings require manual staff review and approval. You will receive an SMS and WhatsApp/email upon confirmation.",
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
    // --- SECTION 1: AVAILABLE NOW ---
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
      description: "The gold standard of executive reliability in Punjab. Full options with electric sunroof, cruise control, plush leather seats, paddle shifters, and chilled dual-zone AC.",
      images: [
        "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      registrationNumber: "ISB-24-4412",
      make: "Toyota",
      model: "Fortuner Legender 4x4 Sigma 4",
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
        "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      registrationNumber: "GJT-23-1100",
      make: "Honda",
      model: "Civic RS Turbo 1.5L VTEC",
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
      description: "Sporty, aggressive, and prestigious. Equipped with Honda SENSING driver assist suite, sport pedals, black accented rear spoiler, and 17-inch alloy wheels.",
      images: [
        "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      registrationNumber: "GJT-23-3320",
      make: "Toyota",
      model: "Yaris ATIV X 1.5 CVT",
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
      description: "Nimble, ultra-reliable, and highly economical. Delivers up to 18 km/L, push start, climate control, reverse camera, and flawless comfort.",
      images: [
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      registrationNumber: "GJT-24-1290",
      make: "Suzuki",
      model: "Alto VXR 660cc AGS",
      year: 2024,
      slug: "suzuki-alto-vxr-2024",
      category: "ECONOMY",
      transmission: "AUTOMATIC",
      fuelType: "PETROL",
      seatingCapacity: 4,
      luggageCapacity: 2,
      dailyRate: 4500,
      weeklyRate: 27000,
      monthlyRate: 95000,
      currency: "PKR",
      operationalStatus: OperationalStatus.AVAILABLE,
      isPublished: true,
      description: "Pakistan's #1 favorite city car. Incredible fuel average, ice-cool air conditioning, automatic gear shift, and effortless parking in bustling Gujrat bazaars.",
      images: [
        "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      registrationNumber: "LHR-23-5510",
      make: "Kia",
      model: "Sportage AWD Panoramic",
      year: 2023,
      slug: "kia-sportage-awd-2023",
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
      description: "Premium crossover with electronic panoramic glass roof, intelligent all-wheel drive, power tailgate, wireless charging, and quiet highway cruising.",
      images: [
        "https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=1200&q=80",
      ],
    },

    // --- SECTION 2: AVAILABLE SOON / PRE-BOOK ---
    {
      registrationNumber: "LEA-23-9001",
      make: "Toyota",
      model: "Land Cruiser Prado TX 2.8L",
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
      operationalStatus: OperationalStatus.MAINTENANCE,
      isPublished: true,
      description: "The pinnacle of status and prestige in Gujrat. Toyota Land Cruiser Prado TX with 2.8L turbo diesel engine, sunroof, leather seating, 4WD terrain control, and chauffeur options.",
      images: [
        "https://images.unsplash.com/photo-1594502184342-2e12f877aa73?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80",
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
      operationalStatus: OperationalStatus.MAINTENANCE,
      isPublished: true,
      description: "Futuristic styling with dark chrome grille, HTRAC intelligent AWD, power driver seat, panoramic sunroof, and ultra-smooth suspension.",
      images: [
        "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      registrationNumber: "ISB-23-8822",
      make: "Toyota",
      model: "Hilux Revo Rocco 4x4 2.8L",
      year: 2023,
      slug: "toyota-hilux-revo-rocco-2023",
      category: "SUV",
      transmission: "AUTOMATIC",
      fuelType: "DIESEL",
      seatingCapacity: 5,
      luggageCapacity: 5,
      dailyRate: 24000,
      weeklyRate: 144000,
      monthlyRate: 520000,
      currency: "PKR",
      operationalStatus: OperationalStatus.MAINTENANCE,
      isPublished: true,
      description: "Rugged elegance with aggressive Rocco styling bar, matte black overfenders, 1GD-FTV 2.8L high-torque engine, and heavy-duty 4WD terrain modes.",
      images: [
        "https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      registrationNumber: "RWP-23-6600",
      make: "Toyota",
      model: "Hiace Grand Cabin Executive (14-Seater)",
      year: 2023,
      slug: "toyota-hiace-grand-cabin-2023",
      category: "VAN",
      transmission: "AUTOMATIC",
      fuelType: "DIESEL",
      seatingCapacity: 14,
      luggageCapacity: 8,
      dailyRate: 18000,
      weeklyRate: 108000,
      monthlyRate: 400000,
      currency: "PKR",
      operationalStatus: OperationalStatus.MAINTENANCE,
      isPublished: true,
      description: "High-roof 14-passenger luxury van. Individual reclining high-back seats, separate passenger air conditioning ducts, and cavernous rear luggage hold.",
      images: [
        "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1200&q=80",
      ],
    },

    // --- SECTION 3: CURRENTLY BOOKED ---
    {
      registrationNumber: "LHR-22-0007",
      make: "Toyota",
      model: "Land Cruiser V8 ZX (200 Series)",
      year: 2022,
      slug: "toyota-land-cruiser-v8-zx",
      category: "LUXURY_SUV",
      transmission: "AUTOMATIC",
      fuelType: "PETROL",
      seatingCapacity: 7,
      luggageCapacity: 6,
      dailyRate: 45000,
      weeklyRate: 270000,
      monthlyRate: 980000,
      currency: "PKR",
      operationalStatus: OperationalStatus.RENTED,
      isPublished: true,
      description: "Unrivalled road authority. 4.6L V8 engine, rear entertainment screens, modelista body kit, height control, and ultimate bulletproof prestige.",
      images: [
        "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      registrationNumber: "ISB-23-0001",
      make: "Mercedes-Benz",
      model: "S-Class S400 Executive Saloon",
      year: 2023,
      slug: "mercedes-benz-s-class-s400",
      category: "LUXURY_SEDAN",
      transmission: "AUTOMATIC",
      fuelType: "PETROL",
      seatingCapacity: 4,
      luggageCapacity: 4,
      dailyRate: 55000,
      weeklyRate: 330000,
      monthlyRate: 1200000,
      currency: "PKR",
      operationalStatus: OperationalStatus.RENTED,
      isPublished: true,
      description: "The flagship luxury limousine featured in our company emblem. Obsidian black finish, massage seating, Burmester 3D sound, and presidential chauffeur presence.",
      images: [
        "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80",
      ],
    },
    {
      registrationNumber: "LHR-23-9999",
      make: "Audi",
      model: "A6 1.8 TFSI Matrix LED",
      year: 2023,
      slug: "audi-a6-matrix-led-2023",
      category: "LUXURY_SEDAN",
      transmission: "AUTOMATIC",
      fuelType: "PETROL",
      seatingCapacity: 5,
      luggageCapacity: 4,
      dailyRate: 30000,
      weeklyRate: 180000,
      monthlyRate: 650000,
      currency: "PKR",
      operationalStatus: OperationalStatus.RENTED,
      isPublished: true,
      description: "Progressive luxury sedan with dynamic matrix LED headlights, dual touch MMI displays, Bang & Olufsen audio, and whisper-quiet ride comfort.",
      images: [
        "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1200&q=80",
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
