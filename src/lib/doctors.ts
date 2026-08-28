import { prisma } from "./db";
import { formatDistance, sortByDistance } from "./distance";
import { DomainError } from "./errors";
import type { SessionUser } from "./auth";

export type NearbyFilters = {
  lat: number;
  lng: number;
  specialty?: string;
  availability?: "ONLINE" | "BUSY" | "OFFLINE" | "ALL";
};

export async function listNearbyDoctors(filters: NearbyFilters) {
  if (!Number.isFinite(filters.lat) || !Number.isFinite(filters.lng)) {
    throw new DomainError("A valid location is required to find nearby doctors");
  }

  const where: {
    specialty?: string;
    status?: string;
  } = {};
  if (filters.specialty && filters.specialty !== "ALL") {
    where.specialty = filters.specialty;
  }
  if (filters.availability && filters.availability !== "ALL") {
    where.status = filters.availability;
  }

  const rows = await prisma.doctorProfile.findMany({
    where,
    include: { user: { select: { id: true, name: true, phone: true } } },
  });

  return sortByDistance(rows, { lat: filters.lat, lng: filters.lng }, (d) => ({
    lat: d.lat,
    lng: d.lng,
  })).map((d) => ({
    id: d.userId,
    profileId: d.id,
    name: d.user.name,
    phone: d.user.phone,
    specialty: d.specialty,
    bio: d.bio,
    yearsExperience: d.yearsExperience,
    consultFeeKobo: d.consultFeeKobo,
    status: d.status,
    city: d.city,
    area: d.area,
    locationLabel: d.locationLabel,
    lat: d.lat,
    lng: d.lng,
    ratingAvg: d.ratingAvg,
    ratingCount: d.ratingCount,
    distanceKm: d.distanceKm,
    distanceLabel: formatDistance(d.distanceKm),
  }));
}

export async function getDoctorPublic(userId: string, origin?: { lat: number; lng: number }) {
  const profile = await prisma.doctorProfile.findUnique({
    where: { userId },
    include: { user: { select: { id: true, name: true, phone: true } } },
  });
  if (!profile) throw new DomainError("Doctor not found", 404);
  const distanceKm = origin
    ? sortByDistance([profile], origin, (d) => ({ lat: d.lat, lng: d.lng }))[0].distanceKm
    : null;
  return {
    id: profile.userId,
    name: profile.user.name,
    phone: profile.user.phone,
    specialty: profile.specialty,
    bio: profile.bio,
    yearsExperience: profile.yearsExperience,
    consultFeeKobo: profile.consultFeeKobo,
    status: profile.status,
    city: profile.city,
    area: profile.area,
    locationLabel: profile.locationLabel,
    lat: profile.lat,
    lng: profile.lng,
    ratingAvg: profile.ratingAvg,
    ratingCount: profile.ratingCount,
    distanceKm,
    distanceLabel: distanceKm == null ? null : formatDistance(distanceKm),
  };
}

export async function getDoctorForSession(session: SessionUser) {
  if (session.role !== "DOCTOR") {
    throw new DomainError("Doctor profile required", 403);
  }
  const profile = await prisma.doctorProfile.findUnique({
    where: { userId: session.id },
  });
  if (!profile) throw new DomainError("Doctor profile missing", 404);
  return profile;
}

export async function updateDoctorStatus(doctorUserId: string, status: "ONLINE" | "BUSY" | "OFFLINE") {
  return prisma.doctorProfile.update({
    where: { userId: doctorUserId },
    data: { status },
  });
}

export async function updateDoctorProfile(
  doctorUserId: string,
  data: {
    specialty?: string;
    bio?: string;
    yearsExperience?: number;
    consultFeeKobo?: number;
    city?: string;
    area?: string;
    locationLabel?: string;
    lat?: number;
    lng?: number;
  },
) {
  return prisma.doctorProfile.update({
    where: { userId: doctorUserId },
    data,
  });
}
