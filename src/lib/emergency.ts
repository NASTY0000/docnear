import { prisma } from "./db";
import { LAUNCH_CITY } from "./geo";
import { formatDistance, geoUrl, mapsNavigateUrl, sortByDistance } from "./distance";
import { DomainError } from "./errors";

export async function listEmergency(lat: number, lng: number) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new DomainError("A location is required for emergency listings");
  }

  const [hospitals, doctors] = await Promise.all([
    prisma.hospital.findMany({ where: { emergencyCapable: true, city: LAUNCH_CITY } }),
    prisma.doctorProfile.findMany({
      where: { status: "ONLINE", city: LAUNCH_CITY },
      include: { user: { select: { id: true, name: true, phone: true } } },
    }),
  ]);

  const hospitalRows = sortByDistance(hospitals, { lat, lng }, (h) => ({
    lat: h.lat,
    lng: h.lng,
  })).map((h) => ({
    id: h.id,
    name: h.name,
    type: h.type,
    city: h.city,
    area: h.area,
    address: h.address,
    phone: h.phone,
    hoursNote: h.hoursNote,
    lat: h.lat,
    lng: h.lng,
    distanceKm: h.distanceKm,
    distanceLabel: formatDistance(h.distanceKm),
    navigateUrl: mapsNavigateUrl(h.lat, h.lng),
    geoUrl: geoUrl(h.lat, h.lng),
    emergencyCapable: true as const,
  }));

  const doctorRows = sortByDistance(doctors, { lat, lng }, (d) => ({
    lat: d.lat,
    lng: d.lng,
  })).map((d) => ({
    id: d.userId,
    name: d.user.name,
    specialty: d.specialty,
    phone: d.user.phone,
    status: d.status,
    city: d.city,
    area: d.area,
    locationLabel: d.locationLabel,
    lat: d.lat,
    lng: d.lng,
    consultFeeKobo: d.consultFeeKobo,
    distanceKm: d.distanceKm,
    distanceLabel: formatDistance(d.distanceKm),
    navigateUrl: mapsNavigateUrl(d.lat, d.lng),
    geoUrl: geoUrl(d.lat, d.lng),
  }));

  return {
    requiresPayment: false,
    emergencyNumber: "112",
    hospitals: hospitalRows,
    doctors: doctorRows,
  };
}
