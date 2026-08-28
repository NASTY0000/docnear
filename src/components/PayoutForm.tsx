"use client";

import { useActionState } from "react";
import { payoutAction } from "@/app/actions/wallet";

type State = { error?: string; ok?: boolean } | null;

export function PayoutForm({ availableNaira }: { availableNaira: number }) {
  const [state, action, pending] = useActionState(payoutAction, null as State);
  return (
    <form action={action} className="card mt-4 space-y-3 p-5">
      <h2 className="font-display text-xl">Demo payout</h2>
      <p className="text-sm text-ink-700 dark:text-tide-300">
        Moves available balance to paid out. No real bank transfer.
      </p>
      <label className="label" htmlFor="amountNaira">Amount (NGN)</label>
      <input
        className="input"
        id="amountNaira"
        name="amountNaira"
        type="number"
        min={1}
        max={availableNaira}
        defaultValue={availableNaira > 0 ? availableNaira : 0}
      />
      <button className="btn-primary" disabled={pending || availableNaira <= 0} type="submit">
        {pending ? "Paying out…" : "Payout now (demo)"}
      </button>
      {state?.error ? <p className="text-sm text-coral-700">{state.error}</p> : null}
      {state?.ok ? <p className="text-sm text-emerald-700">Payout recorded on the ledger.</p> : null}
    </form>
  );
}
