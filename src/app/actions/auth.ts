"use server";

import { prisma } from "@/lib/db";
import { loginSchema } from "@/lib/validations/auth";
import { signSessionToken } from "@/lib/auth/jwt";
import { SESSION_COOKIE_NAME, getCurrentUser } from "@/lib/auth/session";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(prevState: any, formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0]?.message || "Invalid input",
      };
    }

    if (!process.env.DATABASE_URL) {
      return {
        success: false,
        error: "Database connection missing. Please configure DATABASE_URL in Vercel Environment Variables.",
      };
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user || !user.isActive) {
      return {
        success: false,
        error: "Invalid email or password",
      };
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return {
        success: false,
        error: "Invalid email or password",
      };
    }

    const token = await signSessionToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    cookies().set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  } catch (err: any) {
    console.error("Login action error:", err);
    return {
      success: false,
      error:
        err?.message?.includes("connect") || err?.code === "P1001"
          ? "Unable to connect to database. Please check DATABASE_URL in Vercel."
          : "An error occurred during authentication. Please check your credentials.",
    };
  }
}

export async function logoutAction() {
  cookies().delete(SESSION_COOKIE_NAME);
  redirect("/admin/login");
}

export async function getSessionUser() {
  return await getCurrentUser();
}
