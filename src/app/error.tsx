"use client";

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="font-display text-3xl">Something went wrong</h1>
      <p className="mt-2 text-sm">{error.message || "Please try again."}</p>
      <button className="btn-primary mt-6" type="button" onClick={() => reset()}>
        Try again
      </button>
    </div>
  );
}
