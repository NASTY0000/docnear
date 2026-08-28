import { describe, expect, it, beforeEach } from "vitest";
import { createConsult, payConsultDemo } from "@/lib/consults";
import { ForbiddenError } from "@/lib/errors";
import { demoPayout, getWalletForDoctor } from "@/lib/wallet";
import { prisma } from "@/lib/db";
import { makeDoctor, makePatient, resetDb } from "./helpers";

describe("doctor cannot see another doctor's wallet", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("forbids doctor B from reading doctor A wallet or paying it out", async () => {
    const patient = await makePatient();
    const a = await makeDoctor({ email: "a@test.docnear.ng" });
    const b = await makeDoctor({ email: "two.b@test.docnear.ng" });
    const consult = await createConsult(patient, a.id);
    await payConsultDemo(patient, consult.id);

    const mine = await getWalletForDoctor(a, a.id);
    expect(mine.pendingKobo).toBeGreaterThan(0);

    await expect(getWalletForDoctor(b, a.id)).rejects.toBeInstanceOf(ForbiddenError);
    await expect(getWalletForDoctor(patient, a.id)).rejects.toBeInstanceOf(ForbiddenError);
    await expect(demoPayout(patient, 100)).rejects.toBeInstanceOf(ForbiddenError);

    const before = await prisma.wallet.findUnique({ where: { doctorUserId: a.id } });
    await expect(demoPayout(b, 100)).rejects.toThrow();
    const after = await prisma.wallet.findUnique({ where: { doctorUserId: a.id } });
    expect(after?.pendingKobo).toBe(before?.pendingKobo);
    expect(after?.availableKobo).toBe(before?.availableKobo);
    expect(after?.paidOutKobo).toBe(before?.paidOutKobo);
  });
});
