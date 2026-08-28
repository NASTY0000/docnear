import { requireDoctor } from "@/lib/auth";
import { getDoctorForSession } from "@/lib/doctors";
import { AREA_PRESETS } from "@/lib/geo";
import { koboToNaira } from "@/lib/money";
import { AppShell } from "@/components/AppShell";
import { Disclaimer } from "@/components/Disclaimer";
import { DoctorProfileForm } from "@/components/DoctorProfileForm";

export default async function DoctorProfilePage() {
  const user = await requireDoctor();
  const profile = await getDoctorForSession(user);
  const preset =
    AREA_PRESETS.find((a) => a.city === profile.city && a.area === profile.area)?.id ||
    AREA_PRESETS.find((a) => a.city === profile.city)?.id ||
    "lagos-ikeja";

  return (
    <AppShell user={user}>
      <h1 className="font-display text-3xl">Practice profile</h1>
      <p className="text-sm text-ink-700 dark:text-tide-300">{user.name} · {user.email}</p>
      <div className="mt-4">
        <Disclaimer compact />
      </div>
      <DoctorProfileForm
        defaults={{
          specialty: profile.specialty,
          bio: profile.bio,
          yearsExperience: profile.yearsExperience,
          feeNaira: koboToNaira(profile.consultFeeKobo),
          presetId: preset,
        }}
      />
    </AppShell>
  );
}
