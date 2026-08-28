"use client";

import { useActionState } from "react";
import { saveDoctorProfileAction } from "@/app/actions/doctor";
import { SPECIALTIES } from "@/lib/constants";
import { LAGOS_PRESETS, LAUNCH_CITY } from "@/lib/geo";

type State = { error?: string; ok?: boolean } | null;

export function DoctorProfileForm({
  defaults,
}: {
  defaults: {
    specialty: string;
    bio: string;
    yearsExperience: number;
    feeNaira: number;
    presetId: string;
    mdcnNumber: string;
  };
}) {
  const [state, action, pending] = useActionState(saveDoctorProfileAction, null as State);
  return (
    <form action={action} className="card mx-auto mt-4 max-w-lg space-y-3 p-5">
      <div>
        <label className="label" htmlFor="specialty">Specialty</label>
        <select className="input" id="specialty" name="specialty" defaultValue={defaults.specialty}>
          {SPECIALTIES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="bio">Bio</label>
        <textarea className="input min-h-28" id="bio" name="bio" required minLength={20} defaultValue={defaults.bio} />
      </div>
      <div>
        <label className="label" htmlFor="yearsExperience">Years of experience</label>
        <input className="input" id="yearsExperience" name="yearsExperience" type="number" min={0} max={60} defaultValue={defaults.yearsExperience} />
      </div>
      <div>
        <label className="label" htmlFor="feeNaira">Consult fee (NGN)</label>
        <input className="input" id="feeNaira" name="feeNaira" type="number" min={1000} defaultValue={defaults.feeNaira} />
      </div>
      <div>
        <label className="label" htmlFor="mdcnNumber">MDCN registration number</label>
        <input className="input" id="mdcnNumber" name="mdcnNumber" required defaultValue={defaults.mdcnNumber} placeholder="e.g. 123456" />
      </div>
      <div>
        <label className="label" htmlFor="presetId">Practice area (Lagos)</label>
        <select className="input" id="presetId" name="presetId" defaultValue={defaults.presetId}>
          {LAGOS_PRESETS.map((a) => (
            <option key={a.id} value={a.id}>{a.label}</option>
          ))}
        </select>
        <p className="mt-1 text-xs text-ink-700/70 dark:text-tide-400">Live in {LAUNCH_CITY}. Other cities next.</p>
      </div>
      {state?.error ? <p className="text-sm text-coral-700">{state.error}</p> : null}
      {state?.ok ? <p className="text-sm text-emerald-700">Saved.</p> : null}
      <button className="btn-primary w-full" disabled={pending} type="submit">
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
