import Link from "next/link";
import { requirePatient } from "@/lib/auth";
import { listPatientConsults } from "@/lib/consults";
import { formatNGN } from "@/lib/money";
import { AppShell } from "@/components/AppShell";
import { StatusPill } from "@/components/StatusPill";

export default async function SessionsPage() {
  const user = await requirePatient();
  const consults = await listPatientConsults(user.id);
  return (
    <AppShell user={user}>
      <h1 className="font-display text-3xl">Your sessions</h1>
      <div className="mt-4 grid gap-3">
        {consults.length === 0 ? (
          <p className="text-sm">No consults yet. <Link className="font-semibold text-tide-700" href="/nearby">Find a doctor</Link>.</p>
        ) : (
          consults.map((c) => (
            <Link key={c.id} href={c.status === "AWAITING_PAYMENT" ? `/consults/${c.id}/pay` : `/consults/${c.id}`} className="card block p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{c.doctor.name}</p>
                  <p className="text-sm text-ink-700 dark:text-tide-300">
                    {c.doctor.doctorProfile?.specialty} · {formatNGN(c.feeKobo)}
                  </p>
                </div>
                <StatusPill status={c.status} />
              </div>
            </Link>
          ))
        )}
      </div>
    </AppShell>
  );
}
