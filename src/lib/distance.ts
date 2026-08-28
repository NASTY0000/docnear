const EARTH_KM = 6371;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

export function sortByDistance<T>(
  items: T[],
  origin: { lat: number; lng: number },
  loc: (item: T) => { lat: number; lng: number },
): Array<T & { distanceKm: number }> {
  return items
    .map((item) => {
      const p = loc(item);
      return { ...item, distanceKm: haversineKm(origin.lat, origin.lng, p.lat, p.lng) };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

export function mapsNavigateUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export function geoUrl(lat: number, lng: number): string {
  return `geo:${lat},${lng}?q=${lat},${lng}`;
}

export function osmEmbedUrl(lat: number, lng: number, delta = 0.02): string {
  const minLng = lng - delta;
  const minLat = lat - delta;
  const maxLng = lng + delta;
  const maxLat = lat + delta;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${minLng}%2C${minLat}%2C${maxLng}%2C${maxLat}&layer=mapnik&marker=${lat}%2C${lng}`;
}
