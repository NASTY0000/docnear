import { DISCLAIMER } from "@/lib/constants";

export function Disclaimer({ compact = false }: { compact?: boolean }) {
  return (
    <div className="disclaimer-banner" role="note">
      <p className={compact ? "" : "font-semibold"}>Medical disclaimer</p>
      <p className={compact ? "mt-0.5" : "mt-1"}>{DISCLAIMER}</p>
    </div>
  );
}
