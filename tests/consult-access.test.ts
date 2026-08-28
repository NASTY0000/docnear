import { describe, expect, it, beforeEach } from "vitest";
import {
  canOpenConsultChat,
  completeConsult,
  createConsult,
  listMessages,
  payConsultDemo,
  sendMessage,
} from "@/lib/consults";
import { prisma } from "@/lib/db";
import { ForbiddenError } from "@/lib/errors";
import { makeDoctor, makePatient, resetDb } from "./helpers";

describe("unpaid consult cannot open chat", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("blocks messages until demo payment, then credits doctor on complete", async () => {
    const patient = await makePatient();
    const doctor = await makeDoctor();
    const consult = await createConsult(patient, doctor.id);
    expect(consult.status).toBe("AWAITING_PAYMENT");
    expect(canOpenConsultChat(consult.status)).toBe(false);

    await expect(listMessages(patient, consult.id)).rejects.toBeInstanceOf(ForbiddenError);
    await expect(sendMessage(patient, consult.id, "hello doctor")).rejects.toBeInstanceOf(ForbiddenError);
    await expect(listMessages(doctor, consult.id)).rejects.toBeInstanceOf(ForbiddenError);

    const paid = await payConsultDemo(patient, consult.id);
    expect(paid.status).toBe("PAID");
    expect(canOpenConsultChat(paid.status)).toBe(true);

    const msgs = await listMessages(patient, consult.id);
    expect(msgs).toEqual([]);
    const sent = await sendMessage(patient, consult.id, "I have a fever since last night.");
    expect(sent.body).toContain("fever");

    const walletPending = await prisma.wallet.findUnique({ where: { doctorUserId: doctor.id } });
    expect(walletPending?.pendingKobo).toBe(consult.doctorNetKobo);
    expect(walletPending?.availableKobo).toBe(0);
    expect(walletPending?.lifetimeFeeKobo).toBe(consult.platformFeeKobo);
    expect(consult.platformFeeKobo).toBe(Math.round(consult.feeKobo * 0.15));

    await completeConsult(patient, consult.id);
    const walletDone = await prisma.wallet.findUnique({ where: { doctorUserId: doctor.id } });
    expect(walletDone?.pendingKobo).toBe(0);
    expect(walletDone?.availableKobo).toBe(consult.doctorNetKobo);

    const ledger = await prisma.ledgerEntry.findMany({ where: { consultId: consult.id } });
    expect(ledger.some((e) => e.type === "PATIENT_PAYMENT")).toBe(true);
    expect(ledger.some((e) => e.type === "PLATFORM_FEE")).toBe(true);
    expect(ledger.some((e) => e.account === "doctor_available")).toBe(true);
  });
});
