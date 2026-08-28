import { osmEmbedUrl } from "@/lib/distance";

export function OsmMap({ lat, lng, title }: { lat: number; lng: number; title?: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-tide-100 dark:border-tide-800">
      {title ? (
        <p className="bg-tide-50 px-3 py-2 text-xs font-medium text-tide-800 dark:bg-tide-900 dark:text-tide-200">
          {title} — OpenStreetMap, no API key
        </p>
      ) : null}
      <iframe
        title={title || "Map"}
        className="h-56 w-full"
        src={osmEmbedUrl(lat, lng)}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
