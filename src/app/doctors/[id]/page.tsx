import { notFound } from "next/navigation";
import { requirePatient } from "@/lib/auth";
import { getDoctorPublic } from "@/lib/doctors";
import { getPatientLocation } from "@/lib/location";
import { formatNGN } from "@/lib/money";
import { mapsNavigateUrl } from "@/lib/distance";
import { startConsultAction } from "@/app/actions/consults";
import { AppShell } from "@/components/AppShell";
import { Disclaimer } from "@/components/Disclaimer";
import { OsmMap } from "@/components/OsmMap";
import { StatusPill } from "@/components/StatusPill";

export default async function DoctorPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePatient();
  const { id } = await params;
  const loc = await getPatientLocation(user.id);
  let doctor;
  try {
    doctor = await getDoctorPublic(
      id,
      loc?.lat != null && loc?.lng != null ? { lat: loc.lat, lng: loc.lng } : undefined,
    );
  } catch {
    notFound();
  }

  return (
    <AppShell user={user}>
      <Disclaimer />
      <div className="mt-4 card p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl">{doctor.name}</h1>
            <p className="text-tide-700 dark:text-tide-300">{doctor.specialty}</p>
          </div>
          <StatusPill status={doctor.status} />
        </div>
        <p className="mt-4 text-sm leading-relaxed">{doctor.bio}</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink-700/60">Fee</dt>
            <dd className="font-semibold">{formatNGN(doctor.consultFeeKobo)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink-700/60">Experience</dt>
            <dd className="font-semibold">{doctor.yearsExperience} years</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink-700/60">Distance</dt>
            <dd className="font-semibold">{doctor.distanceLabel || "—"}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink-700/60">Rating</dt>
            <dd className="font-semibold">
              {doctor.ratingCount ? `${doctor.ratingAvg.toFixed(1)} ★` : "New"}
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-sm">{doctor.locationLabel}</p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          {doctor.status === "OFFLINE" ? (
            <p className="btn-secondary pointer-events-none opacity-70">This doctor is offline</p>
          ) : (
            <form action={startConsultAction.bind(null, doctor.id)}>
              <button className="btn-primary w-full sm:w-auto" type="submit">
                Start paid advice · {formatNGN(doctor.consultFeeKobo)}
              </button>
            </form>
          )}
          <a className="btn-secondary" href={mapsNavigateUrl(doctor.lat, doctor.lng)} target="_blank" rel="noreferrer">
            Navigate
          </a>
        </div>
      </div>
      <div className="mt-4">
        <OsmMap lat={doctor.lat} lng={doctor.lng} title={doctor.locationLabel} />
      </div>
    </AppShell>
  );
}
