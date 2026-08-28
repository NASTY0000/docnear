import { prisma } from "./db";
import type { SessionUser } from "./auth";
import { DomainError, ForbiddenError } from "./errors";
import { findPreset, nearestPreset } from "./geo";

export async function getPatientLocation(userId: string) {
  return prisma.patientProfile.findUnique({ where: { userId } });
}

export async function setPatientLocation(
  patient: SessionUser,
  input: { presetId?: string; lat?: number; lng?: number; city?: string; area?: string },
) {
  if (patient.role !== "PATIENT") {
    throw new ForbiddenError("Only patients set a care location here");
  }

  let lat = input.lat;
  let lng = input.lng;
  let city = input.city;
  let area = input.area;
  let locationLabel = city && area ? `${area}, ${city}` : city ?? null;

  if (input.presetId) {
    const preset = findPreset(input.presetId);
    if (!preset) throw new DomainError("Unknown area");
    lat = preset.lat;
    lng = preset.lng;
    city = preset.city;
    area = preset.area;
    locationLabel = preset.label;
  } else if (typeof lat === "number" && typeof lng === "number" && Number.isFinite(lat) && Number.isFinite(lng)) {
    const nearest = nearestPreset(lat, lng);
    city = city || nearest.city;
    area = area || nearest.area;
    locationLabel = locationLabel || `${area}, ${city}`;
  } else {
    throw new DomainError("Choose a city/area or drop a pin with latitude and longitude");
  }

  return prisma.patientProfile.upsert({
    where: { userId: patient.id },
    create: {
      userId: patient.id,
      lat,
      lng,
      city,
      area,
      locationLabel,
    },
    update: { lat, lng, city, area, locationLabel },
  });
}
