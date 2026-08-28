"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  authenticate,
  clearSessionCookie,
  createSessionToken,
  hashPassword,
  setSessionCookie,
} from "@/lib/auth";
import { findPreset, isLaunchCity, isValidMdcn, normalizeMdcn } from "@/lib/geo";
import { SPECIALTIES } from "@/lib/constants";
import { errorMessage } from "@/lib/errors";
import { nairaToKobo } from "@/lib/money";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  next: z.string().optional(),
});

export async function loginAction(_prev: unknown, formData: FormData) {
  try {
    const parsed = loginSchema.parse({
      email: String(formData.get("email") || ""),
      password: String(formData.get("password") || ""),
      next: String(formData.get("next") || ""),
    });
    const user = await authenticate(parsed.email, parsed.password);
    const token = await createSessionToken(user);
    await setSessionCookie(token);
    const next =
      parsed.next && parsed.next.startsWith("/") && !parsed.next.startsWith("//")
        ? parsed.next
        : user.role === "DOCTOR"
          ? "/doctor/dashboard"
          : "/nearby";
    redirect(next);
  } catch (err) {
    if (typeof err === "object" && err && "digest" in err) throw err;
    return { error: errorMessage(err) };
  }
}

const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  phone: z.string().min(7).max(20).optional().or(z.literal("")),
  password: z.string().min(8).max(80),
  role: z.enum(["PATIENT", "DOCTOR"]),
  presetId: z.string().optional(),
  specialty: z.string().optional(),
  bio: z.string().optional(),
  yearsExperience: z.string().optional(),
  feeNaira: z.string().optional(),
  mdcnNumber: z.string().optional(),
});

export async function registerAction(_prev: unknown, formData: FormData) {
  try {
    const parsed = registerSchema.parse({
      name: String(formData.get("name") || ""),
      email: String(formData.get("email") || "").toLowerCase().trim(),
      phone: String(formData.get("phone") || ""),
      password: String(formData.get("password") || ""),
      role: String(formData.get("role") || "PATIENT"),
      presetId: String(formData.get("presetId") || ""),
      specialty: String(formData.get("specialty") || ""),
      bio: String(formData.get("bio") || ""),
      yearsExperience: String(formData.get("yearsExperience") || ""),
      feeNaira: String(formData.get("feeNaira") || ""),
      mdcnNumber: String(formData.get("mdcnNumber") || ""),
    });

    const exists = await prisma.user.findUnique({ where: { email: parsed.email } });
    if (exists) return { error: "An account with that email already exists." };

    const passwordHash = await hashPassword(parsed.password);
    const preset = parsed.presetId ? findPreset(parsed.presetId) : undefined;

    if (parsed.role === "DOCTOR") {
      if (!preset) return { error: "Choose your practice area." };
      if (!isLaunchCity(preset.city)) {
        return { error: "Doctor signup is Lagos-only for now. Abuja and Port Harcourt are next." };
      }
      if (!isValidMdcn(parsed.mdcnNumber || "")) {
        return { error: "Enter a valid MDCN registration number." };
      }
      if (!parsed.specialty || !SPECIALTIES.includes(parsed.specialty as never)) {
        return { error: "Choose a specialty." };
      }
      const years = Number(parsed.yearsExperience || 1);
      const fee = Number(parsed.feeNaira || 5000);
      if (!Number.isFinite(years) || years < 0 || years > 60) {
        return { error: "Enter years of experience." };
      }
      if (!Number.isFinite(fee) || fee < 1000) {
        return { error: "Consult fee must be at least ₦1,000." };
      }

      const user = await prisma.user.create({
        data: {
          email: parsed.email,
          passwordHash,
          name: parsed.name,
          phone: parsed.phone || null,
          role: "DOCTOR",
          doctorProfile: {
            create: {
              specialty: parsed.specialty,
              bio: parsed.bio || `${parsed.specialty} doctor in ${preset.label}.`,
              yearsExperience: years,
              consultFeeKobo: nairaToKobo(fee),
              status: "OFFLINE",
              lat: preset.lat,
              lng: preset.lng,
              city: preset.city,
              area: preset.area,
              locationLabel: preset.label,
              mdcnNumber: normalizeMdcn(parsed.mdcnNumber || ""),
            },
          },
          wallet: { create: {} },
        },
      });
      const token = await createSessionToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: "DOCTOR",
        phone: user.phone,
      });
      await setSessionCookie(token);
      redirect("/doctor/dashboard");
    }

    const user = await prisma.user.create({
      data: {
        email: parsed.email,
        passwordHash,
        name: parsed.name,
        phone: parsed.phone || null,
        role: "PATIENT",
        patientProfile: {
          create: preset
            ? {
                lat: preset.lat,
                lng: preset.lng,
                city: preset.city,
                area: preset.area,
                locationLabel: preset.label,
              }
            : {},
        },
      },
    });
    const token = await createSessionToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: "PATIENT",
      phone: user.phone,
    });
    await setSessionCookie(token);
    redirect(preset ? "/nearby" : "/profile");
  } catch (err) {
    if (typeof err === "object" && err && "digest" in err) throw err;
    return { error: errorMessage(err) };
  }
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/");
}
