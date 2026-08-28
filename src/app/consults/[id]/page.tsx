import { notFound, redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { canOpenConsultChat, getConsultForUser } from "@/lib/consults";
import { completeConsultAction } from "@/app/actions/consults";
import { AppShell } from "@/components/AppShell";
import { ChatPanel } from "@/components/ChatPanel";
import { Disclaimer } from "@/components/Disclaimer";
import { RatingForm } from "@/components/RatingForm";
import { StatusPill } from "@/components/StatusPill";
import { formatNGN } from "@/lib/money";

export default async function ConsultPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireSession();
  const { id } = await params;
  let consult;
  try {
    consult = await getConsultForUser(user, id);
  } catch {
    notFound();
  }

  if (consult.status === "AWAITING_PAYMENT") {
    if (user.role === "PATIENT") redirect(`/consults/${id}/pay`);
    return (
      <AppShell user={user}>
        <Disclaimer />
        <div className="card mt-4 p-5">
          <h1 className="font-display text-2xl">Waiting for payment</h1>
          <p className="mt-2 text-sm">The patient has not paid. Chat stays locked until demo payment succeeds.</p>
        </div>
      </AppShell>
    );
  }

  const closed = consult.status === "COMPLETED" || consult.status === "CANCELLED";
  const other = user.id === consult.patientUserId ? consult.doctor : consult.patient;

  return (
    <AppShell user={user}>
      <Disclaimer />
      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl">Advice session</h1>
          <p className="text-sm text-ink-700 dark:text-tide-300">
            With {other.name} · {formatNGN(consult.feeKobo)}
          </p>
        </div>
        <StatusPill status={consult.status} />
      </div>
      {canOpenConsultChat(consult.status) ? (
        <div className="mt-4">
          <ChatPanel consultId={consult.id} meId={user.id} closed={closed} />
        </div>
      ) : (
        <p className="mt-4 text-sm">Chat is locked until payment.</p>
      )}
      {!closed ? (
        <form className="mt-4" action={completeConsultAction.bind(null, consult.id)}>
          <button className="btn-secondary" type="submit">
            Complete consult
          </button>
        </form>
      ) : null}
      {closed && user.role === "PATIENT" && !consult.rating ? (
        <div className="mt-4">
          <RatingForm consultId={consult.id} />
        </div>
      ) : null}
      {consult.rating ? (
        <p className="mt-4 text-sm">Rated {consult.rating.stars}★{consult.rating.comment ? ` — ${consult.rating.comment}` : ""}</p>
      ) : null}
    </AppShell>
  );
}
