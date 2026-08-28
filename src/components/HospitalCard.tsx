import { geoUrl, mapsNavigateUrl } from "@/lib/distance";

export type HospitalCardData = {
  name: string;
  type: string;
  address: string;
  phone: string;
  city: string;
  area: string;
  distanceLabel?: string;
  hoursNote?: string | null;
  lat: number;
  lng: number;
  emergencyCapable: boolean;
};

export function HospitalCard({ hospital }: { hospital: HospitalCardData }) {
  return (
    <article className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg text-tide-950 dark:text-sand-50">{hospital.name}</h3>
          <p className="text-sm text-tide-700 dark:text-tide-300">
            {hospital.type} · {hospital.area}, {hospital.city}
          </p>
        </div>
        {hospital.emergencyCapable ? (
          <span className="chip bg-coral-100 text-coral-800 dark:bg-coral-800/40 dark:text-coral-100">
            Emergency
          </span>
        ) : (
          <span className="chip bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200">Clinic</span>
        )}
      </div>
      <p className="mt-2 text-sm text-ink-700 dark:text-tide-200">{hospital.address}</p>
      {hospital.distanceLabel ? (
        <p className="mt-1 text-sm font-medium">{hospital.distanceLabel} away</p>
      ) : null}
      {hospital.hoursNote ? (
        <p className="mt-1 text-xs text-ink-700/80 dark:text-tide-300">{hospital.hoursNote}</p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <a className="btn-primary" href={`tel:${hospital.phone}`}>
          Call {hospital.phone}
        </a>
        <a
          className="btn-emergency"
          href={mapsNavigateUrl(hospital.lat, hospital.lng)}
          target="_blank"
          rel="noreferrer"
        >
          Navigate
        </a>
        <a className="btn-secondary" href={geoUrl(hospital.lat, hospital.lng)}>
          Open in maps
        </a>
      </div>
    </article>
  );
}
