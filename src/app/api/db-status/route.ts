import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const hasDbUrl = !!process.env.DATABASE_URL;
  // Mask connection string password for security
  const maskedUrl = process.env.DATABASE_URL
    ? process.env.DATABASE_URL.replace(/:([^:@]+)@/, ":****@")
    : null;

  if (!hasDbUrl) {
    return NextResponse.json(
      {
        status: "error",
        message: "DATABASE_URL environment variable is missing on Vercel.",
        instructions: [
          "1. Open your Vercel Project Dashboard (warraich-car-rental).",
          "2. Navigate to Settings -> Environment Variables.",
          "3. Add DATABASE_URL with your Neon PostgreSQL connection string.",
          "4. Redeploy your project or trigger a new deployment.",
        ],
      },
      { status: 503 }
    );
  }

  try {
    const [carsCount, usersCount, settings] = await Promise.all([
      prisma.car.count(),
      prisma.user.count(),
      prisma.businessSettings.findFirst(),
    ]);

    return NextResponse.json({
      status: "connected",
      message: "Database connected successfully and tables exist!",
      databaseUrl: maskedUrl,
      stats: {
        cars: carsCount,
        users: usersCount,
        settingsConfigured: !!settings,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: "Connected to database host but failed to query tables.",
        databaseUrl: maskedUrl,
        errorDetail: error.message,
        instructions: [
          "Tables may not be created yet in your Neon database.",
          "Run the following in your local terminal with your Neon connection string in .env:",
          "npx prisma db push",
          "npm run db:seed",
        ],
      },
      { status: 500 }
    );
  }
}
