"use server";

import { revalidatePath } from "next/cache";
import { requireDoctor } from "@/lib/auth";
import { errorMessage } from "@/lib/errors";
import { nairaToKobo } from "@/lib/money";
import { demoPayout } from "@/lib/wallet";

export async function payoutAction(_prev: unknown, formData: FormData) {
  try {
    const doctor = await requireDoctor();
    const naira = Number(formData.get("amountNaira") || 0);
    if (!Number.isFinite(naira) || naira <= 0) return { error: "Enter a payout amount in naira." };
    await demoPayout(doctor, nairaToKobo(naira));
    revalidatePath("/doctor/wallet");
    return { ok: true as const };
  } catch (err) {
    return { error: errorMessage(err) };
  }
}
