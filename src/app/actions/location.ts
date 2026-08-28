"use server";

import { revalidatePath } from "next/cache";
import { requirePatient } from "@/lib/auth";
import { errorMessage } from "@/lib/errors";
import { setPatientLocation } from "@/lib/location";

export async function saveLocationAction(_prev: unknown, formData: FormData) {
  try {
    const patient = await requirePatient();
    const presetId = String(formData.get("presetId") || "");
    const latRaw = String(formData.get("lat") || "");
    const lngRaw = String(formData.get("lng") || "");
    await setPatientLocation(patient, {
      presetId: presetId || undefined,
      lat: latRaw ? Number(latRaw) : undefined,
      lng: lngRaw ? Number(lngRaw) : undefined,
    });
    revalidatePath("/nearby");
    revalidatePath("/profile");
    revalidatePath("/emergency");
    return { ok: true as const };
  } catch (err) {
    return { error: errorMessage(err) };
  }
}
