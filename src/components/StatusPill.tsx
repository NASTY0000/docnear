const STYLES: Record<string, string> = {
  ONLINE: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200",
  BUSY: "bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-200",
  OFFLINE: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  AWAITING_PAYMENT: "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200",
  PAID: "bg-tide-100 text-tide-900 dark:bg-tide-800 dark:text-tide-100",
  IN_PROGRESS: "bg-sky-100 text-sky-900 dark:bg-sky-900/50 dark:text-sky-100",
  COMPLETED: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-100",
  CANCELLED: "bg-rose-100 text-rose-900 dark:bg-rose-900/40 dark:text-rose-100",
};

const LABELS: Record<string, string> = {
  ONLINE: "Available now",
  BUSY: "Busy",
  OFFLINE: "Offline",
  AWAITING_PAYMENT: "Awaiting payment",
  PAID: "Paid",
  IN_PROGRESS: "In session",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span className={`chip ${STYLES[status] || "bg-slate-200 text-slate-700"}`}>
      {LABELS[status] || status}
    </span>
  );
}
