import Link from "next/link";
import { requireDoctor } from "@/lib/auth";
import { getDoctorForSession } from "@/lib/doctors";
import { listDoctorConsults } from "@/lib/consults";
import { getWalletForDoctor } from "@/lib/wallet";
import { formatNGN } from "@/lib/money";
import { AppShell } from "@/components/AppShell";
import { AvailabilityToggle } from "@/components/AvailabilityToggle";
import { Disclaimer } from "@/components/Disclaimer";
import { StatusPill } from "@/components/StatusPill";

export default async function DoctorDashboard() {
  const user = await requireDoctor();
  const [profile, consults, wallet] = await Promise.all([
    getDoctorForSession(user),
    listDoctorConsults(user.id),
    getWalletForDoctor(user, user.id),
  ]);
  const active = consults.filter((c) => c.status === "PAID" || c.status === "IN_PROGRESS" || c.status === "AWAITING_PAYMENT");

  return (
    <AppShell user={user}>
      <h1 className="font-display text-3xl">Doctor desk</h1>
      <p className="text-sm text-ink-700 dark:text-tide-300">
        {profile.specialty} · {profile.locationLabel} · {formatNGN(profile.consultFeeKobo)} / session
        {profile.mdcnNumber ? ` · MDCN ${profile.mdcnNumber}` : ""}
      </p>
      <div className="mt-4">
        <Disclaimer compact />
      </div>
      <div className="mt-4">
        <AvailabilityToggle status={profile.status} />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="card p-4">
          <p className="text-xs uppercase tracking-wide text-ink-700/60">Pending</p>
          <p className="font-display text-2xl">{formatNGN(wallet.pendingKobo)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs uppercase tracking-wide text-ink-700/60">Available</p>
          <p className="font-display text-2xl">{formatNGN(wallet.availableKobo)}</p>
        </div>
        <Link href="/doctor/wallet" className="card p-4">
          <p className="text-xs uppercase tracking-wide text-ink-700/60">Completed (net)</p>
          <p className="font-display text-2xl">{formatNGN(wallet.completedKobo)}</p>
        </Link>
      </div>
      <h2 className="mt-8 font-display text-2xl">Consults</h2>
      <div className="mt-3 grid gap-3">
        {consults.length === 0 ? (
          <p className="text-sm">No consults yet. Go online so nearby patients can find you.</p>
        ) : (
          consults.map((c) => (
            <Link key={c.id} href={`/consults/${c.id}`} className="card block p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{c.patient.name}</p>
                  <p className="text-sm text-ink-700 dark:text-tide-300">{formatNGN(c.feeKobo)} · you net {formatNGN(c.doctorNetKobo)}</p>
                </div>
                <StatusPill status={c.status} />
              </div>
            </Link>
          ))
        )}
      </div>
      {active.length > 0 ? (
        <p className="mt-3 text-xs text-ink-700/70">{active.length} open or unpaid consult(s).</p>
      ) : null}
    </AppShell>
  );
}
