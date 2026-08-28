import { getSession } from "@/lib/auth";
import { listEmergency } from "@/lib/emergency";
import { getPatientLocation } from "@/lib/location";
import { AREA_PRESETS } from "@/lib/geo";
import { AppShell } from "@/components/AppShell";
import { Disclaimer } from "@/components/Disclaimer";
import { DoctorCard } from "@/components/DoctorCard";
import { HospitalCard } from "@/components/HospitalCard";
import { LocationPicker } from "@/components/LocationPicker";
import { OsmMap } from "@/components/OsmMap";

export default async function EmergencyPage({
  searchParams,
}: {
  searchParams: Promise<{ lat?: string; lng?: string; preset?: string }>;
}) {
  const user = await getSession();
  const q = await searchParams;
  const loc = user?.role === "PATIENT" ? await getPatientLocation(user.id) : null;
  const preset = AREA_PRESETS.find((a) => a.id === q.preset);
  const lat = Number(q.lat) || preset?.lat || loc?.lat || 6.6018;
  const lng = Number(q.lng) || preset?.lng || loc?.lng || 3.3515;
  const data = await listEmergency(lat, lng);
  const originLabel = preset?.label || loc?.locationLabel || "Ikeja, Lagos (default)";

  return (
    <AppShell user={user}>
      <div className="rounded-2xl bg-coral-600 px-4 py-5 text-white shadow-lift">
        <p className="text-xs font-semibold uppercase tracking-wider">Emergency mode · no payment</p>
        <h1 className="font-display text-3xl">Get to care now</h1>
        <p className="mt-1 text-sm text-white/90">
          Nigeria emergency number <a className="underline" href="tel:112">112</a>. This list is free.
          DocNear is not an ambulance service.
        </p>
      </div>
      <div className="mt-4">
        <Disclaimer />
      </div>
      <div className="mt-4">
        <OsmMap lat={lat} lng={lng} title={`Searching from ${originLabel}`} />
      </div>
      {user?.role === "PATIENT" ? (
        <div className="mt-4">
          <LocationPicker currentLabel={loc?.locationLabel} />
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          {AREA_PRESETS.map((a) => (
            <a key={a.id} href={`/emergency?preset=${a.id}`} className="btn-secondary text-xs">
              {a.label}
            </a>
          ))}
        </div>
      )}

      <h2 className="mt-8 font-display text-2xl">Nearest emergency-capable hospitals</h2>
      <p className="text-sm text-ink-700 dark:text-tide-300">Fictional directory for this demo. Call and navigate — no consult fee.</p>
      <div className="mt-3 grid gap-3">
        {data.hospitals.map((h) => (
          <HospitalCard key={h.id} hospital={h} />
        ))}
      </div>

      <h2 className="mt-8 font-display text-2xl">Available doctors nearby</h2>
      <p className="text-sm text-ink-700 dark:text-tide-300">
        Shown so you can find someone close. Emergency mode does not require payment to see this list.
      </p>
      <div className="mt-3 grid gap-3">
        {data.doctors.length === 0 ? (
          <p className="text-sm">No doctors are marked available right now. Go to a hospital.</p>
        ) : (
          data.doctors.map((d) => (
            <DoctorCard
              key={d.id}
              showNavigate
              doctor={{
                id: d.id,
                name: d.name,
                specialty: d.specialty,
                consultFeeKobo: d.consultFeeKobo,
                status: d.status,
                locationLabel: d.locationLabel,
                distanceLabel: d.distanceLabel,
                ratingAvg: 0,
                ratingCount: 0,
                yearsExperience: 0,
                lat: d.lat,
                lng: d.lng,
              }}
            />
          ))
        )}
      </div>
    </AppShell>
  );
}
