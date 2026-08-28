import { requireDoctor } from "@/lib/auth";
import { getWalletForDoctor } from "@/lib/wallet";
import { formatNGN, koboToNaira } from "@/lib/money";
import { AppShell } from "@/components/AppShell";
import { PayoutForm } from "@/components/PayoutForm";

export default async function WalletPage() {
  const user = await requireDoctor();
  const wallet = await getWalletForDoctor(user, user.id);

  return (
    <AppShell user={user}>
      <h1 className="font-display text-3xl">Wallet</h1>
      <p className="text-sm text-ink-700 dark:text-tide-300">
        15% platform fee is taken at payment. Net sits in pending until the consult is completed.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="card p-4">
          <p className="text-xs uppercase tracking-wide">Completed (lifetime net)</p>
          <p className="font-display text-3xl">{formatNGN(wallet.completedKobo)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs uppercase tracking-wide">Pending</p>
          <p className="font-display text-3xl">{formatNGN(wallet.pendingKobo)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs uppercase tracking-wide">Available</p>
          <p className="font-display text-3xl">{formatNGN(wallet.availableKobo)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs uppercase tracking-wide">Paid out</p>
          <p className="font-display text-3xl">{formatNGN(wallet.paidOutKobo)}</p>
        </div>
      </div>
      <p className="mt-3 text-xs text-ink-700/70">
        Gross billed {formatNGN(wallet.lifetimeGrossKobo)} · platform fees {formatNGN(wallet.lifetimeFeeKobo)} · {wallet.completedConsults} completed consults
      </p>
      <PayoutForm availableNaira={koboToNaira(wallet.availableKobo)} />

      <h2 className="mt-8 font-display text-2xl">Ledger</h2>
      <div className="mt-3 overflow-x-auto card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-tide-100 text-left text-xs uppercase tracking-wide dark:border-tide-800">
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Account</th>
              <th className="px-3 py-2">Dir</th>
              <th className="px-3 py-2">Amount</th>
              <th className="px-3 py-2">Note</th>
            </tr>
          </thead>
          <tbody>
            {wallet.ledger.map((e) => (
              <tr key={e.id} className="border-b border-tide-50 dark:border-tide-900">
                <td className="px-3 py-2">{e.type}</td>
                <td className="px-3 py-2">{e.account}</td>
                <td className="px-3 py-2">{e.direction}</td>
                <td className="px-3 py-2">{formatNGN(e.amountKobo)}</td>
                <td className="px-3 py-2 text-ink-700/80">{e.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
