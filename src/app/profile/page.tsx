import { requirePatient } from "@/lib/auth";
import { getPatientLocation } from "@/lib/location";
import { AppShell } from "@/components/AppShell";
import { LocationPicker } from "@/components/LocationPicker";

export default async function ProfilePage() {
  const user = await requirePatient();
  const loc = await getPatientLocation(user.id);
  return (
    <AppShell user={user}>
      <h1 className="font-display text-3xl">Your location</h1>
      <p className="mt-1 text-sm text-ink-700 dark:text-tide-300">
        Signed in as {user.name} ({user.email}). Nearby doctors are sorted from this pin.
      </p>
      <div className="mt-4">
        <LocationPicker currentLabel={loc?.locationLabel} />
      </div>
    </AppShell>
  );
}
