"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { registerAction } from "@/app/actions/auth";
import { Logo } from "@/components/Logo";
import { SPECIALTIES } from "@/lib/constants";
import { AREA_PRESETS, LAGOS_PRESETS, LAUNCH_CITY } from "@/lib/geo";

export default function RegisterPage() {
  const [role, setRole] = useState<"PATIENT" | "DOCTOR">("PATIENT");
  const [state, action, pending] = useActionState(registerAction, null as { error?: string } | null);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link href="/" className="flex items-center gap-2 font-display text-xl">
        <Logo /> DocNear
      </Link>
      <h1 className="mt-8 font-display text-3xl">Create your account</h1>
      <form action={action} className="card mx-auto mt-6 max-w-md space-y-4 p-6">
        <div className="grid grid-cols-2 gap-2">
          <button type="button" className={role === "PATIENT" ? "btn-primary" : "btn-secondary"} onClick={() => setRole("PATIENT")}>
            I need a doctor
          </button>
          <button type="button" className={role === "DOCTOR" ? "btn-primary" : "btn-secondary"} onClick={() => setRole("DOCTOR")}>
            I am a doctor
          </button>
        </div>
        <input type="hidden" name="role" value={role} />
        <div>
          <label className="label" htmlFor="name">Full name</label>
          <input className="input" id="name" name="name" required />
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input className="input" id="email" name="email" type="email" required />
        </div>
        <div>
          <label className="label" htmlFor="phone">Phone</label>
          <input className="input" id="phone" name="phone" placeholder="+234…" />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input className="input" id="password" name="password" type="password" minLength={8} required />
        </div>
        <div>
          <label className="label" htmlFor="presetId">{role === "DOCTOR" ? "Practice area (Lagos)" : "Your area (optional)"}</label>
          <select className="input" id="presetId" name="presetId" required={role === "DOCTOR"} defaultValue={role === "DOCTOR" ? "lagos-ikeja" : ""}>
            {role === "PATIENT" ? <option value="">Set later</option> : null}
            {(role === "DOCTOR" ? LAGOS_PRESETS : AREA_PRESETS).map((a) => (
              <option key={a.id} value={a.id}>{a.label}</option>
            ))}
          </select>
        </div>
        {role === "DOCTOR" ? (
          <>
            <div>
              <label className="label" htmlFor="specialty">Specialty</label>
              <select className="input" id="specialty" name="specialty" defaultValue="General Practice">
                {SPECIALTIES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="yearsExperience">Years of experience</label>
              <input className="input" id="yearsExperience" name="yearsExperience" type="number" min={0} max={60} defaultValue={5} />
            </div>
            <div>
              <label className="label" htmlFor="feeNaira">Consult fee (NGN)</label>
              <input className="input" id="feeNaira" name="feeNaira" type="number" min={1000} defaultValue={5000} />
            </div>
            <p className="text-xs text-ink-700/70 dark:text-tide-400">DocNear is live in {LAUNCH_CITY}. Abuja and Port Harcourt are next.</p>
            <div>
              <label className="label" htmlFor="mdcnNumber">MDCN registration number</label>
              <input className="input" id="mdcnNumber" name="mdcnNumber" required placeholder="e.g. 123456" autoComplete="off" />
              <p className="mt-1 text-xs text-ink-700/70 dark:text-tide-400">We collect this now. Full licence checks come next.</p>
            </div>
            <div>
              <label className="label" htmlFor="bio">Bio</label>
              <textarea className="input min-h-24" id="bio" name="bio" placeholder="Who you help, and from where." />
            </div>
          </>
        ) : null}
        {state?.error ? <p className="text-sm text-coral-700">{state.error}</p> : null}
        <button className="btn-primary w-full" disabled={pending} type="submit">
          {pending ? "Creating…" : "Create account"}
        </button>
        <p className="text-center text-sm">
          Already have an account? <Link className="font-semibold text-tide-700" href="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
