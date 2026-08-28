"use client";

import { useActionState } from "react";
import { rateConsultAction } from "@/app/actions/consults";

type State = { error?: string; ok?: boolean } | null;

export function RatingForm({ consultId }: { consultId: string }) {
  const [state, action, pending] = useActionState(rateConsultAction, null as State);
  if (state?.ok) {
    return <p className="text-sm font-medium text-emerald-700">Thank you. Your rating is saved.</p>;
  }
  return (
    <form action={action} className="card space-y-3 p-4">
      <input type="hidden" name="consultId" value={consultId} />
      <h3 className="font-display text-lg">Rate this consult</h3>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className="flex cursor-pointer items-center gap-1 text-sm">
            <input type="radio" name="stars" value={n} defaultChecked={n === 5} />
            {n}★
          </label>
        ))}
      </div>
      <textarea className="input min-h-20" name="comment" placeholder="Optional comment" maxLength={500} />
      <button className="btn-primary" disabled={pending} type="submit">
        {pending ? "Saving…" : "Submit rating"}
      </button>
      {state?.error ? <p className="text-sm text-coral-700">{state.error}</p> : null}
    </form>
  );
}
