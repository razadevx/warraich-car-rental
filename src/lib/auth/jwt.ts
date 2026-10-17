import { SignJWT, jwtVerify } from "jose";
import { SessionUser } from "@/types";

const secretKey = process.env.JWT_SECRET || "fallback-secret-warraich-motors-gujrat-2026-key";
const encodedKey = new TextEncoder().encode(secretKey);

export async function signSessionToken(payload: SessionUser): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    });

    return {
      id: payload.id as string,
      name: payload.name as string,
      email: payload.email as string,
      role: payload.role as "ADMIN" | "STAFF",
    };
  } catch {
    return null;
  }
}
