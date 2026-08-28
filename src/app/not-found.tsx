import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="font-display text-3xl">Page not found</h1>
      <p className="mt-2 text-sm">That doctor, consult, or page is not on DocNear.</p>
      <Link href="/" className="btn-primary mt-6 inline-flex">Home</Link>
    </div>
  );
}
