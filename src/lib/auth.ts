import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./db";
import { SESSION_COOKIE, type Role } from "./constants";
import { AuthError, ForbiddenError } from "./errors";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  phone: string | null;
};

function secret() {
  const raw =
    process.env.SESSION_SECRET ||
    "docnear-dev-session-secret-change-in-production-2026";
  return new TextEncoder().encode(raw);
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub || typeof payload.email !== "string") return null;
    const role = payload.role as Role;
    if (role !== "PATIENT" && role !== "DOCTOR") return null;
    return {
      id: payload.sub,
      email: payload.email,
      name: String(payload.name ?? ""),
      role,
      phone: payload.phone ? String(payload.phone) : null,
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export function assertRole(session: SessionUser, role: Role): SessionUser {
  if (session.role !== role) {
    throw new ForbiddenError(`${role} access required`);
  }
  return session;
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) throw new AuthError();
  return session;
}

export async function requireRole(role: Role): Promise<SessionUser> {
  const session = await requireSession();
  return assertRole(session, role);
}

export async function requirePatient(): Promise<SessionUser> {
  return requireRole("PATIENT");
}

export async function requireDoctor(): Promise<SessionUser> {
  return requireRole("DOCTOR");
}

export function canAccessPatientApp(role: Role): boolean {
  return role === "PATIENT";
}

export function canAccessDoctorApp(role: Role): boolean {
  return role === "DOCTOR";
}

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function authenticate(email: string, password: string): Promise<SessionUser> {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user) throw new AuthError("Invalid email or password");
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) throw new AuthError("Invalid email or password");
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as Role,
    phone: user.phone,
  };
}
