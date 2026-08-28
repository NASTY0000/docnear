import { setAvailabilityAction } from "@/app/actions/doctor";
import { StatusPill } from "./StatusPill";

export function AvailabilityToggle({ status }: { status: string }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl">Go online</h2>
          <p className="text-sm text-ink-700 dark:text-tide-300">Patients nearby only see you when you are available.</p>
        </div>
        <StatusPill status={status} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <form action={setAvailabilityAction.bind(null, "ONLINE")}>
          <button className="btn-primary w-full" type="submit">Available</button>
        </form>
        <form action={setAvailabilityAction.bind(null, "BUSY")}>
          <button className="btn-secondary w-full" type="submit">Busy</button>
        </form>
        <form action={setAvailabilityAction.bind(null, "OFFLINE")}>
          <button className="btn-secondary w-full" type="submit">Offline</button>
        </form>
      </div>
    </div>
  );
}
