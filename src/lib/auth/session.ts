import { cookies } from "next/headers";
import { verifySessionToken } from "./jwt";
import { SessionUser } from "@/types";

export const SESSION_COOKIE_NAME = "wm_staff_session";

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  return await verifySessionToken(token);
}

export async function requireAuth(allowedRoles: Array<"ADMIN" | "STAFF"> = ["ADMIN", "STAFF"]): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized: Authentication required");
  }

  if (!allowedRoles.includes(user.role)) {
    throw new Error("Forbidden: Insufficient permissions for this action");
  }

  return user;
}
