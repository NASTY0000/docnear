"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { loginAction } from "@/app/actions/auth";
import { Logo } from "@/components/Logo";

function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next") || "";
  const [state, action, pending] = useActionState(loginAction, null as { error?: string } | null);

  return (
    <form action={action} className="card mx-auto mt-6 max-w-md space-y-4 p-6">
      <input type="hidden" name="next" value={next} />
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input className="input" id="email" name="email" type="email" required defaultValue="ada.okonkwo@docnear.ng" />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input className="input" id="password" name="password" type="password" required defaultValue="PatientDemo1!" />
      </div>
      {state?.error ? <p className="text-sm text-coral-700">{state.error}</p> : null}
      <button className="btn-primary w-full" disabled={pending} type="submit">
        {pending ? "Signing in…" : "Sign in"}
      </button>
      <p className="text-center text-sm">
        New here? <Link className="font-semibold text-tide-700 dark:text-tide-300" href="/register">Create an account</Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link href="/" className="flex items-center gap-2 font-display text-xl">
        <Logo /> DocNear
      </Link>
      <h1 className="mt-8 font-display text-3xl">Sign in</h1>
      <p className="mt-1 text-sm text-ink-700 dark:text-tide-300">
        Demo patient is pre-filled. Doctor: amaka.eze@docnear.ng / DoctorDemo1!
      </p>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
