import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import type { SessionUser } from "@/lib/auth";

export async function resetDb() {
  await prisma.ledgerEntry.deleteMany();
  await prisma.payout.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.message.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.consult.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.doctorProfile.deleteMany();
  await prisma.patientProfile.deleteMany();
  await prisma.hospital.deleteMany();
  await prisma.user.deleteMany();
}

export async function makePatient(email = "patient@test.docnear.ng"): Promise<SessionUser> {
  const hash = await bcrypt.hash("PatientDemo1!", 4);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: hash,
      name: "Test Patient",
      phone: "+2348000000001",
      role: "PATIENT",
      patientProfile: {
        create: {
          lat: 6.6018,
          lng: 3.3515,
          city: "Lagos",
          area: "Ikeja",
          locationLabel: "Ikeja, Lagos",
        },
      },
    },
  });
  return { id: user.id, email: user.email, name: user.name, role: "PATIENT", phone: user.phone };
}

export async function makeDoctor(opts?: {
  email?: string;
  lat?: number;
  lng?: number;
  city?: string;
  area?: string;
  specialty?: string;
  status?: string;
  feeNaira?: number;
}): Promise<SessionUser> {
  const hash = await bcrypt.hash("DoctorDemo1!", 4);
  const user = await prisma.user.create({
    data: {
      email: opts?.email || "doctor@test.docnear.ng",
      passwordHash: hash,
      name: opts?.email?.includes("two") ? "Doctor Two" : "Test Doctor",
      phone: "+2348000000002",
      role: "DOCTOR",
      doctorProfile: {
        create: {
          specialty: opts?.specialty || "General Practice",
          bio: "Test doctor for automated checks on DocNear.",
          yearsExperience: 8,
          consultFeeKobo: (opts?.feeNaira ?? 5000) * 100,
          status: opts?.status || "ONLINE",
          lat: opts?.lat ?? 6.6052,
          lng: opts?.lng ?? 3.3492,
          city: opts?.city || "Lagos",
          area: opts?.area || "Ikeja",
          locationLabel: `${opts?.area || "Ikeja"}, ${opts?.city || "Lagos"}`,
        },
      },
      wallet: { create: {} },
    },
  });
  return { id: user.id, email: user.email, name: user.name, role: "DOCTOR", phone: user.phone };
}

export async function seedHospital() {
  return prisma.hospital.create({
    data: {
      name: "Ikeja Community Hospital",
      type: "General Hospital",
      lat: 6.5989,
      lng: 3.3488,
      city: "Lagos",
      area: "Ikeja",
      address: "22 Test Way, Ikeja",
      phone: "+2342011110102",
      emergencyCapable: true,
      hoursNote: "24-hour casualty",
    },
  });
}
