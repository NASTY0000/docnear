import type { SessionUser } from "@/lib/auth";
import { Nav } from "./Nav";

export function AppShell({
  user,
  children,
}: {
  user: SessionUser | null;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <Nav user={user} />
      <main className="mx-auto w-full max-w-5xl px-4 py-6 pb-24">{children}</main>
    </div>
  );
}
