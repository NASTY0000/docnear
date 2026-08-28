export type AreaPreset = {
  id: string;
  city: string;
  area: string;
  label: string;
  lat: number;
  lng: number;
};

export const AREA_PRESETS: AreaPreset[] = [
  { id: "lagos-ikeja", city: "Lagos", area: "Ikeja", label: "Ikeja, Lagos", lat: 6.6018, lng: 3.3515 },
  { id: "lagos-vi", city: "Lagos", area: "Victoria Island", label: "Victoria Island, Lagos", lat: 6.4281, lng: 3.4219 },
  { id: "lagos-lekki", city: "Lagos", area: "Lekki Phase 1", label: "Lekki Phase 1, Lagos", lat: 6.4474, lng: 3.4735 },
  { id: "lagos-island", city: "Lagos", area: "Lagos Island", label: "Lagos Island", lat: 6.4549, lng: 3.401 },
  { id: "lagos-yaba", city: "Lagos", area: "Yaba", label: "Yaba, Lagos", lat: 6.5095, lng: 3.3711 },
  { id: "lagos-surulere", city: "Lagos", area: "Surulere", label: "Surulere, Lagos", lat: 6.5, lng: 3.35 },
  { id: "lagos-ajah", city: "Lagos", area: "Ajah", label: "Ajah, Lagos", lat: 6.4698, lng: 3.5646 },
  { id: "lagos-maryland", city: "Lagos", area: "Maryland", label: "Maryland, Lagos", lat: 6.5703, lng: 3.3673 },
  { id: "abuja-wuse", city: "Abuja", area: "Wuse", label: "Wuse, Abuja", lat: 9.0765, lng: 7.4898 },
  { id: "abuja-garki", city: "Abuja", area: "Garki", label: "Garki, Abuja", lat: 9.033, lng: 7.489 },
  { id: "abuja-maitama", city: "Abuja", area: "Maitama", label: "Maitama, Abuja", lat: 9.082, lng: 7.495 },
  { id: "ph-gra", city: "Port Harcourt", area: "GRA", label: "GRA, Port Harcourt", lat: 4.8472, lng: 7.0134 },
  { id: "ph-transamadi", city: "Port Harcourt", area: "Trans Amadi", label: "Trans Amadi, Port Harcourt", lat: 4.8156, lng: 7.0498 },
];

export const CITIES = ["Lagos", "Abuja", "Port Harcourt"] as const;

export function findPreset(id: string): AreaPreset | undefined {
  return AREA_PRESETS.find((a) => a.id === id);
}

export function nearestPreset(lat: number, lng: number): AreaPreset {
  let best = AREA_PRESETS[0];
  let bestD = Number.POSITIVE_INFINITY;
  for (const a of AREA_PRESETS) {
    const dLat = a.lat - lat;
    const dLng = a.lng - lng;
    const d = dLat * dLat + dLng * dLng;
    if (d < bestD) {
      bestD = d;
      best = a;
    }
  }
  return best;
}
