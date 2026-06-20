import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import type { Role, User } from "@/lib/types";

const sessionCookieName = "fasilitaslapor_session";
const defaultSecret = "development-secret-change-me";

export type SessionUser = User;

type SessionPayload = {
  sub: string;
  name: string;
  email: string;
  role: Role;
};

function sessionSecret() {
  const secret = process.env.AUTH_SECRET || defaultSecret;
  return new TextEncoder().encode(secret);
}

export function normalizeRole(role: string): Role {
  return role === "ADMIN" || role === "admin" ? "admin" : "user";
}

export async function createSessionToken(user: SessionUser) {
  return new SignJWT({ name: user.name, email: user.email, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(sessionSecret());
}

export async function setSessionCookie(user: SessionUser) {
  const token = await createSessionToken(user);
  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(sessionCookieName);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, sessionSecret());
    const session = payload as SessionPayload & { sub?: string };
    if (!session.sub || !session.email || !session.name || !session.role) return null;

    return {
      id: session.sub,
      name: session.name,
      email: session.email,
      role: normalizeRole(session.role)
    };
  } catch {
    return null;
  }
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") throw new Error("FORBIDDEN");
  return user;
}
