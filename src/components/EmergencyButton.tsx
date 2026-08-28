import Link from "next/link";

export function EmergencyButton({ href = "/emergency", block = false }: { href?: string; block?: boolean }) {
  return (
    <Link href={href} className={`btn-emergency ${block ? "w-full py-4 text-base" : ""}`}>
      <span aria-hidden>⚠</span>
      Emergency — nearby hospitals
    </Link>
  );
}
