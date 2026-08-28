import { notFound, redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { getConsultForUser } from "@/lib/consults";
import { formatNGN } from "@/lib/money";
import { payConsultAction } from "@/app/actions/consults";
import { AppShell } from "@/components/AppShell";
import { Disclaimer } from "@/components/Disclaimer";

export default async function PayPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireSession();
  const { id } = await params;
  if (user.role !== "PATIENT") redirect(`/consults/${id}`);
  let consult;
  try {
    consult = await getConsultForUser(user, id);
  } catch {
    notFound();
  }
  if (consult.status !== "AWAITING_PAYMENT") {
    redirect(`/consults/${id}`);
  }

  return (
    <AppShell user={user}>
      <Disclaimer />
      <div className="card mx-auto mt-4 max-w-md space-y-4 p-5">
        <p className="chip bg-tide-100 text-tide-900 dark:bg-tide-800 dark:text-tide-100">Demo payment · no live keys</p>
        <h1 className="font-display text-2xl">Pay for advice</h1>
        <p className="text-sm">
          Session with <strong>{consult.doctor.name}</strong> ({consult.doctor.doctorProfile?.specialty}).
        </p>
        <dl className="space-y-1 text-sm">
          <div className="flex justify-between">
            <dt>Consult fee</dt>
            <dd className="font-semibold">{formatNGN(consult.feeKobo)}</dd>
          </div>
          <div className="flex justify-between text-ink-700/70">
            <dt>Platform (15%)</dt>
            <dd>{formatNGN(consult.platformFeeKobo)}</dd>
          </div>
          <div className="flex justify-between text-ink-700/70">
            <dt>Doctor receives after completion</dt>
            <dd>{formatNGN(consult.doctorNetKobo)}</dd>
          </div>
        </dl>
        <form action={payConsultAction.bind(null, consult.id)}>
          <button className="btn-primary w-full py-3" type="submit">
            Pay {formatNGN(consult.feeKobo)} with Demo Pay
          </button>
        </form>
        <p className="text-xs text-ink-700/70">
          This simulates a successful card/transfer. A real ledger entry is written. Chat unlocks only after payment.
        </p>
      </div>
    </AppShell>
  );
}
