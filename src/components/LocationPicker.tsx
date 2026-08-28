"use client";

import { useActionState, useState } from "react";
import { saveLocationAction } from "@/app/actions/location";
import { AREA_PRESETS, CITIES, LAUNCH_CITY } from "@/lib/geo";

type State = { error?: string; ok?: boolean } | null;

export function LocationPicker({
  currentLabel,
}: {
  currentLabel?: string | null;
}) {
  const [state, action, pending] = useActionState(saveLocationAction, null as State);
  const [city, setCity] = useState("Lagos");
  const [pin, setPin] = useState<{ lat: string; lng: string }>({ lat: "", lng: "" });
  const areas = AREA_PRESETS.filter((a) => a.city === city);

  function useDevice() {
    if (!navigator.geolocation) {
      alert("Geolocation is not available on this device.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPin({
          lat: pos.coords.latitude.toFixed(5),
          lng: pos.coords.longitude.toFixed(5),
        });
      },
      () => alert("Could not read your location. Pick a city/area instead."),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  return (
    <div className="card p-4 space-y-4">
      <div>
        <h2 className="font-display text-xl">Your location</h2>
        <p className="text-sm text-ink-700 dark:text-tide-300">
          {currentLabel ? `Currently: ${currentLabel}` : "Set a pin or choose a Lagos area to see nearby doctors."}
        </p>
        {city !== LAUNCH_CITY ? (
          <p className="mt-2 text-sm text-coral-800 dark:text-coral-200">DocNear lists doctors in Lagos first. You can still pin {city} for later.</p>
        ) : null}
      </div>
      <form action={action} className="space-y-3">
        <div>
          <label className="label" htmlFor="city">City</label>
          <select id="city" className="input" value={city} onChange={(e) => setCity(e.target.value)}>
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c === LAUNCH_CITY ? c : `${c} (coming next)`}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="presetId">Area</label>
          <select key={city} id="presetId" name="presetId" className="input" defaultValue={areas[0]?.id}>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>
        </div>
        <button className="btn-primary w-full" type="submit" disabled={pending}>
          {pending ? "Saving…" : "Use this area"}
        </button>
      </form>
      <div className="border-t border-tide-100 pt-3 dark:border-tide-800">
        <p className="label">Or drop a pin</p>
        <form action={action} className="grid grid-cols-2 gap-2">
          <input className="input" name="lat" placeholder="Latitude" value={pin.lat} onChange={(e) => setPin({ ...pin, lat: e.target.value })} />
          <input className="input" name="lng" placeholder="Longitude" value={pin.lng} onChange={(e) => setPin({ ...pin, lng: e.target.value })} />
          <button type="button" className="btn-secondary col-span-2" onClick={useDevice}>
            Use my current location
          </button>
          <button className="btn-primary col-span-2" type="submit" disabled={pending}>
            Save pin
          </button>
        </form>
      </div>
      {state?.error ? <p className="text-sm text-coral-700">{state.error}</p> : null}
      {state?.ok ? <p className="text-sm text-emerald-700">Location saved.</p> : null}
    </div>
  );
}
