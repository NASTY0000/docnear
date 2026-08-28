import { prisma } from "./db";
import type { SessionUser } from "./auth";
import { DomainError, ForbiddenError } from "./errors";
import { recordConsultPayment, releaseConsultToAvailable } from "./ledger";
import { splitConsultFee } from "./money";

const CHAT_STATUSES = new Set(["PAID", "IN_PROGRESS", "COMPLETED"]);

function assertParticipant(session: SessionUser, consult: { patientUserId: string; doctorUserId: string }) {
  if (session.id !== consult.patientUserId && session.id !== consult.doctorUserId) {
    throw new ForbiddenError("You are not part of this consult");
  }
}

export async function createConsult(patient: SessionUser, doctorUserId: string) {
  if (patient.role !== "PATIENT") {
    throw new ForbiddenError("Only patients can start a paid advice session");
  }
  if (patient.id === doctorUserId) {
    throw new DomainError("You cannot consult yourself");
  }

  const [doctor, patientProfile] = await Promise.all([
    prisma.doctorProfile.findUnique({
      where: { userId: doctorUserId },
      include: { user: true },
    }),
    prisma.patientProfile.findUnique({ where: { userId: patient.id } }),
  ]);
  if (!doctor) throw new DomainError("Doctor not found", 404);
  if (doctor.status === "OFFLINE") {
    throw new DomainError("This doctor is offline. Choose someone available now.");
  }

  const split = splitConsultFee(doctor.consultFeeKobo);

  const consult = await prisma.consult.create({
    data: {
      patientUserId: patient.id,
      doctorUserId,
      status: "AWAITING_PAYMENT",
      feeKobo: split.feeKobo,
      platformFeeKobo: split.platformFeeKobo,
      doctorNetKobo: split.doctorNetKobo,
      patientLat: patientProfile?.lat ?? null,
      patientLng: patientProfile?.lng ?? null,
    },
  });

  return consult;
}

export async function getConsultForUser(session: SessionUser, consultId: string) {
  const consult = await prisma.consult.findUnique({
    where: { id: consultId },
    include: {
      patient: { select: { id: true, name: true, email: true } },
      doctor: {
        select: {
          id: true,
          name: true,
          email: true,
          doctorProfile: true,
        },
      },
      payment: true,
      rating: true,
    },
  });
  if (!consult) throw new DomainError("Consult not found", 404);
  assertParticipant(session, consult);
  return consult;
}

export function canOpenConsultChat(status: string): boolean {
  return CHAT_STATUSES.has(status);
}

export async function payConsultDemo(patient: SessionUser, consultId: string) {
  if (patient.role !== "PATIENT") {
    throw new ForbiddenError("Only the patient can pay for this consult");
  }

  return prisma.$transaction(async (tx) => {
    const consult = await tx.consult.findUnique({ where: { id: consultId } });
    if (!consult) throw new DomainError("Consult not found", 404);
    if (consult.patientUserId !== patient.id) {
      throw new ForbiddenError("You cannot pay for someone else's consult");
    }
    if (consult.status !== "AWAITING_PAYMENT") {
      throw new DomainError("This consult is not awaiting payment");
    }

    const existing = await tx.payment.findUnique({ where: { consultId } });
    if (existing) throw new DomainError("Already paid");

    const reference = `DEMO-${consultId.slice(-8)}-${Date.now()}`;
    await recordConsultPayment(tx, {
      consultId,
      doctorUserId: consult.doctorUserId,
      feeKobo: consult.feeKobo,
      reference,
    });

    const updated = await tx.consult.update({
      where: { id: consultId },
      data: { status: "PAID", paidAt: new Date() },
    });

    const doctor = await tx.doctorProfile.findUnique({ where: { userId: consult.doctorUserId } });
    if (doctor && doctor.status === "ONLINE") {
      await tx.doctorProfile.update({
        where: { userId: consult.doctorUserId },
        data: { status: "BUSY" },
      });
    }

    return updated;
  });
}

export async function listMessages(session: SessionUser, consultId: string) {
  const consult = await prisma.consult.findUnique({ where: { id: consultId } });
  if (!consult) throw new DomainError("Consult not found", 404);
  assertParticipant(session, consult);
  if (!canOpenConsultChat(consult.status)) {
    throw new ForbiddenError("Unpaid consults cannot open chat. Complete demo payment first.");
  }
  return prisma.message.findMany({
    where: { consultId },
    orderBy: { createdAt: "asc" },
    include: { sender: { select: { id: true, name: true, role: true } } },
  });
}

export async function sendMessage(session: SessionUser, consultId: string, body: string) {
  const text = body.trim();
  if (!text) throw new DomainError("Message cannot be empty");
  if (text.length > 4000) throw new DomainError("Message is too long");

  return prisma.$transaction(async (tx) => {
    const consult = await tx.consult.findUnique({ where: { id: consultId } });
    if (!consult) throw new DomainError("Consult not found", 404);
    assertParticipant(session, consult);
    if (!canOpenConsultChat(consult.status)) {
      throw new ForbiddenError("Unpaid consults cannot open chat. Complete demo payment first.");
    }
    if (consult.status === "COMPLETED" || consult.status === "CANCELLED") {
      throw new DomainError("This consult is closed");
    }

    if (consult.status === "PAID") {
      await tx.consult.update({
        where: { id: consultId },
        data: { status: "IN_PROGRESS" },
      });
    }

    return tx.message.create({
      data: {
        consultId,
        senderUserId: session.id,
        body: text,
      },
      include: { sender: { select: { id: true, name: true, role: true } } },
    });
  });
}

export async function completeConsult(session: SessionUser, consultId: string) {
  return prisma.$transaction(async (tx) => {
    const consult = await tx.consult.findUnique({ where: { id: consultId } });
    if (!consult) throw new DomainError("Consult not found", 404);
    assertParticipant(session, consult);
    if (consult.status !== "PAID" && consult.status !== "IN_PROGRESS") {
      throw new DomainError("Only an active paid consult can be completed");
    }

    await releaseConsultToAvailable(tx, {
      consultId,
      doctorUserId: consult.doctorUserId,
      doctorNetKobo: consult.doctorNetKobo,
    });

    const updated = await tx.consult.update({
      where: { id: consultId },
      data: { status: "COMPLETED", completedAt: new Date() },
    });

    const stillActive = await tx.consult.count({
      where: {
        doctorUserId: consult.doctorUserId,
        status: { in: ["PAID", "IN_PROGRESS"] },
      },
    });
    if (stillActive === 0) {
      const doctor = await tx.doctorProfile.findUnique({ where: { userId: consult.doctorUserId } });
      if (doctor && doctor.status === "BUSY") {
        await tx.doctorProfile.update({
          where: { userId: consult.doctorUserId },
          data: { status: "ONLINE" },
        });
      }
    }

    return updated;
  });
}

export async function rateConsult(
  patient: SessionUser,
  consultId: string,
  stars: number,
  comment?: string,
) {
  if (patient.role !== "PATIENT") {
    throw new ForbiddenError("Only the patient can rate a consult");
  }
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    throw new DomainError("Rating must be 1 to 5 stars");
  }

  return prisma.$transaction(async (tx) => {
    const consult = await tx.consult.findUnique({ where: { id: consultId } });
    if (!consult) throw new DomainError("Consult not found", 404);
    if (consult.patientUserId !== patient.id) {
      throw new ForbiddenError("You can only rate your own consult");
    }
    if (consult.status !== "COMPLETED") {
      throw new DomainError("Rate after the consult is completed");
    }
    const existing = await tx.rating.findUnique({ where: { consultId } });
    if (existing) throw new DomainError("This consult is already rated");

    const rating = await tx.rating.create({
      data: {
        consultId,
        patientUserId: patient.id,
        doctorUserId: consult.doctorUserId,
        stars,
        comment: comment?.trim() || null,
      },
    });

    const agg = await tx.rating.aggregate({
      where: { doctorUserId: consult.doctorUserId },
      _avg: { stars: true },
      _count: { stars: true },
    });

    await tx.doctorProfile.update({
      where: { userId: consult.doctorUserId },
      data: {
        ratingAvg: agg._avg.stars ?? 0,
        ratingCount: agg._count.stars,
      },
    });

    return rating;
  });
}

export async function listPatientConsults(patientUserId: string) {
  return prisma.consult.findMany({
    where: { patientUserId },
    orderBy: { createdAt: "desc" },
    include: {
      doctor: { select: { id: true, name: true, doctorProfile: true } },
      rating: true,
    },
  });
}

export async function listDoctorConsults(doctorUserId: string) {
  return prisma.consult.findMany({
    where: { doctorUserId },
    orderBy: { createdAt: "desc" },
    include: {
      patient: { select: { id: true, name: true } },
      rating: true,
    },
  });
}
