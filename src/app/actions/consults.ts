"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requirePatient, requireSession } from "@/lib/auth";
import {
  completeConsult,
  createConsult,
  payConsultDemo,
  rateConsult,
  sendMessage,
} from "@/lib/consults";
import { errorMessage } from "@/lib/errors";

export async function startConsultAction(doctorUserId: string) {
  const patient = await requirePatient();
  const consult = await createConsult(patient, doctorUserId);
  redirect(`/consults/${consult.id}/pay`);
}

export async function payConsultAction(consultId: string) {
  const patient = await requirePatient();
  await payConsultDemo(patient, consultId);
  revalidatePath(`/consults/${consultId}`);
  redirect(`/consults/${consultId}`);
}

export async function sendMessageAction(_prev: unknown, formData: FormData) {
  try {
    const session = await requireSession();
    const consultId = String(formData.get("consultId") || "");
    const body = String(formData.get("body") || "");
    await sendMessage(session, consultId, body);
    revalidatePath(`/consults/${consultId}`);
    revalidatePath(`/doctor/consults/${consultId}`);
    return { ok: true as const };
  } catch (err) {
    return { error: errorMessage(err) };
  }
}

export async function completeConsultAction(consultId: string) {
  const session = await requireSession();
  await completeConsult(session, consultId);
  revalidatePath(`/consults/${consultId}`);
  revalidatePath("/doctor/dashboard");
  revalidatePath("/doctor/wallet");
  revalidatePath("/sessions");
}

export async function rateConsultAction(_prev: unknown, formData: FormData) {
  try {
    const patient = await requirePatient();
    const consultId = String(formData.get("consultId") || "");
    const stars = Number(formData.get("stars") || 0);
    const comment = String(formData.get("comment") || "");
    await rateConsult(patient, consultId, stars, comment);
    revalidatePath(`/consults/${consultId}`);
    revalidatePath("/nearby");
    return { ok: true as const };
  } catch (err) {
    return { error: errorMessage(err) };
  }
}
