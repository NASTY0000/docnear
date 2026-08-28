"use server";

import { revalidatePath } from "next/cache";
import { requireDoctor } from "@/lib/auth";
import { SPECIALTIES } from "@/lib/constants";
import { errorMessage } from "@/lib/errors";
import { findPreset } from "@/lib/geo";
import { nairaToKobo } from "@/lib/money";
import { updateDoctorProfile, updateDoctorStatus } from "@/lib/doctors";

export async function setAvailabilityAction(status: "ONLINE" | "BUSY" | "OFFLINE") {
  const doctor = await requireDoctor();
  await updateDoctorStatus(doctor.id, status);
  revalidatePath("/doctor/dashboard");
  revalidatePath("/nearby");
  revalidatePath("/emergency");
}

export async function saveDoctorProfileAction(_prev: unknown, formData: FormData) {
  try {
    const doctor = await requireDoctor();
    const specialty = String(formData.get("specialty") || "");
    const bio = String(formData.get("bio") || "");
    const years = Number(formData.get("yearsExperience") || 0);
    const feeNaira = Number(formData.get("feeNaira") || 0);
    const presetId = String(formData.get("presetId") || "");
    if (!SPECIALTIES.includes(specialty as never)) return { error: "Choose a specialty." };
    if (bio.trim().length < 20) return { error: "Bio should be at least 20 characters." };
    if (!Number.isFinite(years) || years < 0 || years > 60) return { error: "Enter years of experience." };
    if (!Number.isFinite(feeNaira) || feeNaira < 1000) return { error: "Fee must be at least ₦1,000." };
    const preset = presetId ? findPreset(presetId) : undefined;
    await updateDoctorProfile(doctor.id, {
      specialty,
      bio: bio.trim(),
      yearsExperience: years,
      consultFeeKobo: nairaToKobo(feeNaira),
      ...(preset
        ? {
            city: preset.city,
            area: preset.area,
            locationLabel: preset.label,
            lat: preset.lat,
            lng: preset.lng,
          }
        : {}),
    });
    revalidatePath("/doctor/profile");
    revalidatePath("/doctor/dashboard");
    return { ok: true as const };
  } catch (err) {
    return { error: errorMessage(err) };
  }
}
