import { prisma } from "./db";
import type { SessionUser } from "./auth";
import { DomainError, ForbiddenError } from "./errors";
import { recordPayout } from "./ledger";

export async function getWalletForDoctor(actor: SessionUser, doctorUserId: string) {
  if (actor.role !== "DOCTOR") {
    throw new ForbiddenError("Only doctors can view wallets");
  }
  if (actor.id !== doctorUserId) {
    throw new ForbiddenError("You cannot view another doctor's wallet");
  }
  const wallet = await prisma.wallet.findUnique({ where: { doctorUserId } });
  if (!wallet) throw new DomainError("Wallet not found", 404);
  const recentPayouts = await prisma.payout.findMany({
    where: { doctorUserId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  const recentLedger = await prisma.ledgerEntry.findMany({
    where: { doctorUserId },
    orderBy: { createdAt: "desc" },
    take: 40,
  });
  const completedConsults = await prisma.consult.count({
    where: { doctorUserId, status: "COMPLETED" },
  });
  return {
    pendingKobo: wallet.pendingKobo,
    availableKobo: wallet.availableKobo,
    paidOutKobo: wallet.paidOutKobo,
    completedKobo: wallet.lifetimeNetKobo,
    lifetimeGrossKobo: wallet.lifetimeGrossKobo,
    lifetimeFeeKobo: wallet.lifetimeFeeKobo,
    completedConsults,
    payouts: recentPayouts,
    ledger: recentLedger,
  };
}

export async function demoPayout(actor: SessionUser, amountKobo: number) {
  if (actor.role !== "DOCTOR") {
    throw new ForbiddenError("Only doctors can request payouts");
  }
  return prisma.$transaction((tx) =>
    recordPayout(tx, { doctorUserId: actor.id, amountKobo }),
  );
}
