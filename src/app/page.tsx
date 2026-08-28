import Link from "next/link";
import { getSession } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { Disclaimer } from "@/components/Disclaimer";
import { EmergencyButton } from "@/components/EmergencyButton";

export default async function HomePage() {
  const user = await getSession();
  return (
    <AppShell user={user}>
      <section className="grid gap-8 py-6 md:grid-cols-2 md:items-center">
        <div>
          <p className="chip bg-tide-100 text-tide-900 dark:bg-tide-800 dark:text-tide-100">
            Live in Lagos · Abuja and Port Harcourt next
          </p>
          <h1 className="mt-4 font-display text-4xl leading-tight text-tide-950 dark:text-sand-50 sm:text-5xl">
            A nearby doctor, in minutes. Not a waiting room.
          </h1>
          <p className="mt-4 max-w-md text-base text-ink-700 dark:text-tide-200">
            Patients pick who they talk to — by distance, availability, and fee. Doctors earn from paid
            advice sessions. In a true emergency, skip payment and navigate to the nearest hospital.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <EmergencyButton block />
            <Link href={user ? (user.role === "DOCTOR" ? "/doctor/dashboard" : "/nearby") : "/register"} className="btn-primary py-4">
              {user ? "Continue" : "See doctors near you"}
            </Link>
          </div>
          <p className="mt-3 text-xs text-ink-700/70 dark:text-tide-400">Currency NGN. Pay-per-session in NGN. Payments still in demo until Paystack is wired.</p>
        </div>
        <div className="card space-y-4 p-5">
          <h2 className="font-display text-2xl">How it works</h2>
          <ol className="space-y-3 text-sm">
            <li><strong>1. Pin your location.</strong> City/area or GPS. We sort by distance — no paid map key required.</li>
            <li><strong>2. Choose a doctor.</strong> Filter specialty. See Available now, Busy, or Offline, plus the consult fee.</li>
            <li><strong>3. Pay for advice.</strong> Pay for that doctor. Chat opens. When you complete, the doctor is credited minus 15%.</li>
          </ol>
          <Disclaimer compact />
        </div>
      </section>
      <section className="mt-4 grid gap-4 sm:grid-cols-3">
        {[
          { t: "Patients", d: "Reach a doctor fast. You choose who to talk to from people actually near you." },
          { t: "Doctors", d: "Go online, take advice sessions, set your fee, go online, and earn from sessions you actually take." },
          { t: "Emergencies", d: "One tap. Nearest emergency-capable hospitals and available doctors. Navigate. No payment." },
        ].map((x) => (
          <div key={x.t} className="card p-4">
            <h3 className="font-display text-lg">{x.t}</h3>
            <p className="mt-1 text-sm text-ink-700 dark:text-tide-300">{x.d}</p>
          </div>
        ))}
      </section>
    </AppShell>
  );
}
