import Link from "next/link";
import type { SessionUser } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import { EmergencyButton } from "./EmergencyButton";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

export function Nav({ user }: { user: SessionUser | null }) {
  const home = !user ? "/" : user.role === "DOCTOR" ? "/doctor/dashboard" : "/nearby";
  return (
    <header className="sticky top-0 z-30 border-b border-tide-100/80 bg-sand-50/80 backdrop-blur dark:border-tide-800 dark:bg-tide-950/80">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
        <Link href={home} className="flex items-center gap-2 font-display text-lg font-semibold text-tide-900 dark:text-sand-50">
          <Logo className="h-8 w-8" />
          DocNear
        </Link>
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <EmergencyButton />
          <ThemeToggle />
          {user ? (
            <>
              {user.role === "PATIENT" ? (
                <>
                  <Link href="/nearby" className="btn-ghost hidden sm:inline-flex">Nearby</Link>
                  <Link href="/sessions" className="btn-ghost hidden sm:inline-flex">Sessions</Link>
                  <Link href="/profile" className="btn-ghost hidden sm:inline-flex">Location</Link>
                </>
              ) : (
                <>
                  <Link href="/doctor/dashboard" className="btn-ghost hidden sm:inline-flex">Desk</Link>
                  <Link href="/doctor/wallet" className="btn-ghost hidden sm:inline-flex">Wallet</Link>
                  <Link href="/doctor/profile" className="btn-ghost hidden sm:inline-flex">Profile</Link>
                </>
              )}
              <form action={logoutAction}>
                <button className="btn-secondary" type="submit">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost">Sign in</Link>
              <Link href="/register" className="btn-primary">Get started</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
