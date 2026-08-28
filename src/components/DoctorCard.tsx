import Link from "next/link";
import { formatNGN } from "@/lib/money";
import { mapsNavigateUrl } from "@/lib/distance";
import { StatusPill } from "./StatusPill";

export type DoctorCardData = {
  id: string;
  name: string;
  specialty: string;
  consultFeeKobo: number;
  status: string;
  locationLabel: string;
  distanceLabel?: string | null;
  ratingAvg: number;
  ratingCount: number;
  yearsExperience: number;
  lat: number;
  lng: number;
};

export function DoctorCard({
  doctor,
  href,
  showNavigate = false,
}: {
  doctor: DoctorCardData;
  href?: string;
  showNavigate?: boolean;
}) {
  const inner = (
    <article className="card p-4 hover:border-tide-300 dark:hover:border-tide-600">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg text-tide-950 dark:text-sand-50">{doctor.name}</h3>
          <p className="text-sm text-tide-700 dark:text-tide-300">{doctor.specialty}</p>
        </div>
        <StatusPill status={doctor.status} />
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-700 dark:text-tide-200">
        {doctor.distanceLabel ? <span>{doctor.distanceLabel} away</span> : null}
        <span>{doctor.locationLabel}</span>
        <span>{doctor.yearsExperience} yrs</span>
        <span>
          {doctor.ratingCount > 0
            ? `${doctor.ratingAvg.toFixed(1)} ★ (${doctor.ratingCount})`
            : "New on DocNear"}
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <p className="text-base font-semibold text-tide-900 dark:text-tide-200">
          {formatNGN(doctor.consultFeeKobo)}
          <span className="ml-1 text-xs font-medium text-ink-700/70 dark:text-tide-400">advice session</span>
        </p>
        {showNavigate ? (
          <a
            className="btn-secondary text-xs"
            href={mapsNavigateUrl(doctor.lat, doctor.lng)}
            target="_blank"
            rel="noreferrer"
          >
            Navigate
          </a>
        ) : null}
      </div>
    </article>
  );

  if (!href) return inner;
  return (
    <Link href={href} className="block">
      {inner}
    </Link>
  );
}
