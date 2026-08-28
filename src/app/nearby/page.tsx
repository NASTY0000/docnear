import Link from "next/link";
import { requirePatient } from "@/lib/auth";
import { SPECIALTIES } from "@/lib/constants";
import { LAUNCH_CITY } from "@/lib/geo";
import { listNearbyDoctors } from "@/lib/doctors";
import { getPatientLocation } from "@/lib/location";
import { AppShell } from "@/components/AppShell";
import { Disclaimer } from "@/components/Disclaimer";
import { DoctorCard } from "@/components/DoctorCard";
import { EmergencyButton } from "@/components/EmergencyButton";
import { LocationPicker } from "@/components/LocationPicker";
import { OsmMap } from "@/components/OsmMap";

export default async function NearbyPage({
  searchParams,
}: {
  searchParams: Promise<{ specialty?: string; availability?: string }>;
}) {
  const user = await requirePatient();
  const q = await searchParams;
  const loc = await getPatientLocation(user.id);
  const specialty = q.specialty || "ALL";
  const availability = (q.availability || "ALL") as "ONLINE" | "BUSY" | "OFFLINE" | "ALL";

  const doctors =
    loc?.lat != null && loc?.lng != null
      ? await listNearbyDoctors({
          lat: loc.lat,
          lng: loc.lng,
          specialty,
          availability,
        })
      : [];

  const qs = (next: Record<string, string>) => {
    const p = new URLSearchParams();
    const spec = next.specialty ?? specialty;
    const av = next.availability ?? availability;
    if (spec && spec !== "ALL") p.set("specialty", spec);
    if (av && av !== "ALL") p.set("availability", av);
    const s = p.toString();
    return s ? `/nearby?${s}` : "/nearby";
  };

  return (
    <AppShell user={user}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl">Doctors near you</h1>
          <p className="text-sm text-ink-700 dark:text-tide-300">
            Sorted by distance · {loc?.locationLabel || "set your location"}
          </p>
        </div>
        <EmergencyButton />
      </div>
      <div className="mt-4">
        <Disclaimer compact />
      </div>

      {loc?.city && loc.city !== LAUNCH_CITY ? (
        <p className="mt-4 rounded-xl border border-coral-200 bg-coral-50 px-3 py-2 text-sm text-coral-900 dark:border-coral-800 dark:bg-coral-950/40 dark:text-coral-100">
          DocNear lists doctors in Lagos first. {loc.city} is next. Emergency 112 still works anywhere.
        </p>
      ) : null}

      {loc?.lat != null && loc?.lng != null ? (
        <div className="mt-4">
          <OsmMap lat={loc.lat} lng={loc.lng} title={`Your area — ${loc.locationLabel}`} />
        </div>
      ) : null}

      <div className="mt-4">
        <LocationPicker currentLabel={loc?.locationLabel} />
      </div>

      {loc?.lat == null ? (
        <p className="mt-6 text-sm">Set a location to see nearby doctors.</p>
      ) : (
        <>
          <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
            <Link href={qs({ specialty: "ALL" })} className={specialty === "ALL" ? "btn-primary text-xs" : "btn-secondary text-xs"}>
              All specialties
            </Link>
            {SPECIALTIES.map((s) => (
              <Link key={s} href={qs({ specialty: s })} className={specialty === s ? "btn-primary text-xs whitespace-nowrap" : "btn-secondary text-xs whitespace-nowrap"}>
                {s}
              </Link>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            {(["ALL", "ONLINE", "BUSY", "OFFLINE"] as const).map((a) => (
              <Link key={a} href={qs({ availability: a })} className={availability === a ? "btn-primary text-xs" : "btn-secondary text-xs"}>
                {a === "ALL" ? "Any status" : a === "ONLINE" ? "Available now" : a === "BUSY" ? "Busy" : "Offline"}
              </Link>
            ))}
          </div>
          <div className="mt-4 grid gap-3">
            {doctors.length === 0 ? (
              <p className="text-sm">No Lagos doctors match those filters. Try Available now or another Lagos area.</p>
            ) : (
              doctors.map((d) => (
                <DoctorCard key={d.id} doctor={d} href={`/doctors/${d.id}`} />
              ))
            )}
          </div>
        </>
      )}
    </AppShell>
  );
}
