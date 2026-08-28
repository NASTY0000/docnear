import type { Prisma, PrismaClient } from "@prisma/client";
import { DomainError } from "./errors";
import { splitConsultFee } from "./money";

type Db = PrismaClient | Prisma.TransactionClient;

export async function recordConsultPayment(
  db: Db,
  args: {
    consultId: string;
    doctorUserId: string;
    feeKobo: number;
    reference: string;
  },
) {
  const split = splitConsultFee(args.feeKobo);
  const wallet = await db.wallet.findUnique({ where: { doctorUserId: args.doctorUserId } });
  if (!wallet) throw new DomainError("Doctor wallet missing");

  await db.payment.create({
    data: {
      consultId: args.consultId,
      amountKobo: split.feeKobo,
      method: "DEMO",
      reference: args.reference,
      status: "SUCCESS",
    },
  });

  await db.wallet.update({
    where: { doctorUserId: args.doctorUserId },
    data: {
      pendingKobo: { increment: split.doctorNetKobo },
      lifetimeGrossKobo: { increment: split.feeKobo },
      lifetimeNetKobo: { increment: split.doctorNetKobo },
      lifetimeFeeKobo: { increment: split.platformFeeKobo },
    },
  });

  const common = {
    doctorUserId: args.doctorUserId,
    consultId: args.consultId,
  };

  await db.ledgerEntry.createMany({
    data: [
      {
        ...common,
        type: "PATIENT_PAYMENT",
        account: "platform_cash",
        direction: "CREDIT",
        amountKobo: split.feeKobo,
        description: "Demo patient payment received",
      },
      {
        ...common,
        type: "PLATFORM_FEE",
        account: "platform_revenue",
        direction: "CREDIT",
        amountKobo: split.platformFeeKobo,
        description: "Platform fee 15%",
      },
      {
        ...common,
        type: "DOCTOR_CREDIT_PENDING",
        account: "doctor_pending",
        direction: "CREDIT",
        amountKobo: split.doctorNetKobo,
        description: "Doctor net credited to pending",
      },
    ],
  });

  return split;
}

export async function releaseConsultToAvailable(
  db: Db,
  args: { consultId: string; doctorUserId: string; doctorNetKobo: number },
) {
  const wallet = await db.wallet.findUnique({ where: { doctorUserId: args.doctorUserId } });
  if (!wallet) throw new DomainError("Doctor wallet missing");
  if (wallet.pendingKobo < args.doctorNetKobo) {
    throw new DomainError("Insufficient pending balance to release consult");
  }

  await db.wallet.update({
    where: { doctorUserId: args.doctorUserId },
    data: {
      pendingKobo: { decrement: args.doctorNetKobo },
      availableKobo: { increment: args.doctorNetKobo },
    },
  });

  await db.ledgerEntry.createMany({
    data: [
      {
        doctorUserId: args.doctorUserId,
        consultId: args.consultId,
        type: "DOCTOR_RELEASE_PENDING",
        account: "doctor_pending",
        direction: "DEBIT",
        amountKobo: args.doctorNetKobo,
        description: "Move completed consult out of pending",
      },
      {
        doctorUserId: args.doctorUserId,
        consultId: args.consultId,
        type: "DOCTOR_RELEASE_AVAILABLE",
        account: "doctor_available",
        direction: "CREDIT",
        amountKobo: args.doctorNetKobo,
        description: "Completed consult available for payout",
      },
    ],
  });
}

export async function recordPayout(
  db: Db,
  args: { doctorUserId: string; amountKobo: number },
) {
  if (!Number.isInteger(args.amountKobo) || args.amountKobo <= 0) {
    throw new DomainError("Payout amount must be a positive integer in kobo");
  }
  const wallet = await db.wallet.findUnique({ where: { doctorUserId: args.doctorUserId } });
  if (!wallet) throw new DomainError("Doctor wallet missing");
  if (wallet.availableKobo < args.amountKobo) {
    throw new DomainError("Insufficient available balance");
  }

  const payout = await db.payout.create({
    data: {
      doctorUserId: args.doctorUserId,
      amountKobo: args.amountKobo,
      status: "DEMO_COMPLETED",
    },
  });

  await db.wallet.update({
    where: { doctorUserId: args.doctorUserId },
    data: {
      availableKobo: { decrement: args.amountKobo },
      paidOutKobo: { increment: args.amountKobo },
    },
  });

  await db.ledgerEntry.createMany({
    data: [
      {
        doctorUserId: args.doctorUserId,
        payoutId: payout.id,
        type: "PAYOUT",
        account: "doctor_available",
        direction: "DEBIT",
        amountKobo: args.amountKobo,
        description: "Demo payout from available balance",
      },
      {
        doctorUserId: args.doctorUserId,
        payoutId: payout.id,
        type: "PAYOUT",
        account: "doctor_paid_out",
        direction: "CREDIT",
        amountKobo: args.amountKobo,
        description: "Demo payout completed",
      },
    ],
  });

  return payout;
}
