import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findUnique({
    where: { email: "ada.okonkwo@docnear.ng" },
  });
  if (existing) {
    console.log("Demo data already present — skip seed.");
    return;
  }

  const patientHash = await bcrypt.hash("PatientDemo1!", 10);
  const doctorHash = await bcrypt.hash("DoctorDemo1!", 10);

  const ada = await prisma.user.create({
    data: {
      email: "ada.okonkwo@docnear.ng",
      passwordHash: patientHash,
      name: "Ada Okonkwo",
      phone: "+2348010000001",
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

  await prisma.user.create({
    data: {
      email: "chinedu.bello@docnear.ng",
      passwordHash: patientHash,
      name: "Chinedu Bello",
      phone: "+2348010000002",
      role: "PATIENT",
      patientProfile: {
        create: {
          lat: 9.0765,
          lng: 7.4898,
          city: "Abuja",
          area: "Wuse",
          locationLabel: "Wuse, Abuja",
        },
      },
    },
  });

  const doctors: Array<{
    email: string;
    name: string;
    phone: string;
    specialty: string;
    bio: string;
    years: number;
    feeNaira: number;
    status: string;
    lat: number;
    lng: number;
    city: string;
    area: string;
    label: string;
  }> = [
    {
      email: "amaka.eze@docnear.ng",
      name: "Dr Amaka Eze",
      phone: "+2348021110001",
      specialty: "General Practice",
      bio: "Family doctor based in Ikeja. Same-day advice for fever, infections, blood pressure, and everyday care. Speaks English and Igbo.",
      years: 11,
      feeNaira: 5000,
      status: "ONLINE",
      lat: 6.6052,
      lng: 3.3492,
      city: "Lagos",
      area: "Ikeja",
      label: "Allen Avenue, Ikeja",
    },
    {
      email: "tunde.balogun@docnear.ng",
      name: "Dr Tunde Balogun",
      phone: "+2348021110002",
      specialty: "Emergency Medicine",
      bio: "Emergency physician covering Ikeja and Maryland. Fast triage advice while you travel to a hospital.",
      years: 9,
      feeNaira: 8000,
      status: "ONLINE",
      lat: 6.5721,
      lng: 3.365,
      city: "Lagos",
      area: "Maryland",
      label: "Maryland, Lagos",
    },
    {
      email: "nkechi.okoro@docnear.ng",
      name: "Dr Nkechi Okoro",
      phone: "+2348021110003",
      specialty: "Paediatrics",
      bio: "Children's doctor in Yaba. Cough, rashes, feeding, and vaccination questions for parents.",
      years: 14,
      feeNaira: 7000,
      status: "ONLINE",
      lat: 6.5081,
      lng: 3.377,
      city: "Lagos",
      area: "Yaba",
      label: "Yaba, Lagos",
    },
    {
      email: "fatima.sule@docnear.ng",
      name: "Dr Fatima Sule",
      phone: "+2348021110004",
      specialty: "Obstetrics & Gynaecology",
      bio: "Women's health on Victoria Island. Pregnancy questions, cycle issues, and postnatal advice.",
      years: 16,
      feeNaira: 12000,
      status: "BUSY",
      lat: 6.431,
      lng: 3.4228,
      city: "Lagos",
      area: "Victoria Island",
      label: "Victoria Island, Lagos",
    },
    {
      email: "ibrahim.lawal@docnear.ng",
      name: "Dr Ibrahim Lawal",
      phone: "+2348021110005",
      specialty: "Internal Medicine",
      bio: "Adult medicine in Lekki. Diabetes, hypertension, and follow-up for chronic conditions.",
      years: 13,
      feeNaira: 10000,
      status: "ONLINE",
      lat: 6.4492,
      lng: 3.471,
      city: "Lagos",
      area: "Lekki Phase 1",
      label: "Lekki Phase 1, Lagos",
    },
    {
      email: "yetunde.adebayo@docnear.ng",
      name: "Dr Yetunde Adebayo",
      phone: "+2348021110006",
      specialty: "Dermatology",
      bio: "Skin and hair clinic in Surulere. Acne, rashes, and keloid questions over chat.",
      years: 8,
      feeNaira: 9000,
      status: "OFFLINE",
      lat: 6.4982,
      lng: 3.3541,
      city: "Lagos",
      area: "Surulere",
      label: "Surulere, Lagos",
    },
    {
      email: "chuka.nwafor@docnear.ng",
      name: "Dr Chuka Nwafor",
      phone: "+2348021110007",
      specialty: "Orthopaedics",
      bio: "Bone and joint advice from Lagos Island. Sprains, back pain, and post-injury questions.",
      years: 12,
      feeNaira: 11000,
      status: "ONLINE",
      lat: 6.4558,
      lng: 3.3899,
      city: "Lagos",
      area: "Lagos Island",
      label: "Lagos Island",
    },
    {
      email: "zainab.musa@docnear.ng",
      name: "Dr Zainab Musa",
      phone: "+2348092220001",
      specialty: "Family Medicine",
      bio: "Wuse family doctor. Whole-household advice, malaria, and travel health.",
      years: 10,
      feeNaira: 6000,
      status: "ONLINE",
      lat: 9.0782,
      lng: 7.4911,
      city: "Abuja",
      area: "Wuse",
      label: "Wuse II, Abuja",
    },
    {
      email: "paul.okoye@docnear.ng",
      name: "Dr Paul Okoye",
      phone: "+2348092220002",
      specialty: "Cardiology",
      bio: "Heart specialist in Garki. Chest pain triage, BP, and cholesterol questions.",
      years: 18,
      feeNaira: 15000,
      status: "ONLINE",
      lat: 9.0344,
      lng: 7.4872,
      city: "Abuja",
      area: "Garki",
      label: "Garki, Abuja",
    },
    {
      email: "halima.bello@docnear.ng",
      name: "Dr Halima Bello",
      phone: "+2348092220003",
      specialty: "Psychiatry",
      bio: "Mental health support in Maitama. Anxiety, sleep, and stress — advice only, not crisis care.",
      years: 7,
      feeNaira: 8000,
      status: "BUSY",
      lat: 9.0831,
      lng: 7.4962,
      city: "Abuja",
      area: "Maitama",
      label: "Maitama, Abuja",
    },
    {
      email: "emeka.nwosu@docnear.ng",
      name: "Dr Emeka Nwosu",
      phone: "+2348033330001",
      specialty: "Emergency Medicine",
      bio: "Port Harcourt GRA emergency doctor. Rapid advice while you head to a hospital.",
      years: 11,
      feeNaira: 7500,
      status: "ONLINE",
      lat: 4.8481,
      lng: 7.0152,
      city: "Port Harcourt",
      area: "GRA",
      label: "GRA Phase 2, Port Harcourt",
    },
    {
      email: "blessing.dike@docnear.ng",
      name: "Dr Blessing Dike",
      phone: "+2348033330002",
      specialty: "Paediatrics",
      bio: "Children's doctor in Trans Amadi. Fever, diarrhoea, and newborn questions.",
      years: 9,
      feeNaira: 6500,
      status: "ONLINE",
      lat: 4.817,
      lng: 7.051,
      city: "Port Harcourt",
      area: "Trans Amadi",
      label: "Trans Amadi, Port Harcourt",
    },
  ];

  for (const d of doctors) {
    await prisma.user.create({
      data: {
        email: d.email,
        passwordHash: doctorHash,
        name: d.name,
        phone: d.phone,
        role: "DOCTOR",
        doctorProfile: {
          create: {
            specialty: d.specialty,
            bio: d.bio,
            yearsExperience: d.years,
            consultFeeKobo: d.feeNaira * 100,
            status: d.status,
            lat: d.lat,
            lng: d.lng,
            city: d.city,
            area: d.area,
            locationLabel: d.label,
          },
        },
        wallet: { create: {} },
      },
    });
  }

  const hospitals = [
    {
      name: "Harbourview Medical Centre",
      type: "Emergency Centre",
      lat: 6.4541,
      lng: 3.3947,
      city: "Lagos",
      area: "Lagos Island",
      address: "14 Marina Crescent, Lagos Island",
      phone: "+2342011110101",
      emergencyCapable: true,
      hoursNote: "24-hour emergency desk",
    },
    {
      name: "Ikeja Community Hospital",
      type: "General Hospital",
      lat: 6.5989,
      lng: 3.3488,
      city: "Lagos",
      area: "Ikeja",
      address: "22 Obafemi Awolowo Way, Ikeja",
      phone: "+2342011110102",
      emergencyCapable: true,
      hoursNote: "24-hour casualty",
    },
    {
      name: "Lekki Shoreline Clinic",
      type: "Community Clinic",
      lat: 6.4461,
      lng: 3.4782,
      city: "Lagos",
      area: "Lekki Phase 1",
      address: "8 Admiralty Drive, Lekki Phase 1",
      phone: "+2342011110103",
      emergencyCapable: false,
      hoursNote: "Weekdays 8am–8pm",
    },
    {
      name: "Victoria Pearl Hospital",
      type: "Specialist Hospital",
      lat: 6.4294,
      lng: 3.4241,
      city: "Lagos",
      area: "Victoria Island",
      address: "31 Kofo Abayomi Street, Victoria Island",
      phone: "+2342011110104",
      emergencyCapable: true,
      hoursNote: "24-hour emergency",
    },
    {
      name: "Yaba Greenfield Hospital",
      type: "General Hospital",
      lat: 6.5112,
      lng: 3.3733,
      city: "Lagos",
      area: "Yaba",
      address: "5 Herbert Macaulay Way, Yaba",
      phone: "+2342011110105",
      emergencyCapable: true,
      hoursNote: "24-hour casualty",
    },
    {
      name: "Surulere Nightingale Hospital",
      type: "General Hospital",
      lat: 6.4961,
      lng: 3.3562,
      city: "Lagos",
      area: "Surulere",
      address: "18 Adeniran Ogunsanya, Surulere",
      phone: "+2342011110106",
      emergencyCapable: true,
      hoursNote: "24-hour emergency",
    },
    {
      name: "Wuse Ridge Medical Centre",
      type: "Emergency Centre",
      lat: 9.0771,
      lng: 7.4884,
      city: "Abuja",
      area: "Wuse",
      address: "12 Aminu Kano Crescent, Wuse II",
      phone: "+234921110201",
      emergencyCapable: true,
      hoursNote: "24-hour emergency desk",
    },
    {
      name: "Garki Horizon Hospital",
      type: "Teaching Hospital",
      lat: 9.0318,
      lng: 7.4905,
      city: "Abuja",
      area: "Garki",
      address: "Plot 9, Area 11, Garki",
      phone: "+234921110202",
      emergencyCapable: true,
      hoursNote: "24-hour casualty",
    },
    {
      name: "Garden City Emergency Hospital",
      type: "Emergency Centre",
      lat: 4.8464,
      lng: 7.0121,
      city: "Port Harcourt",
      area: "GRA",
      address: "6 Tombia Street, GRA Phase 2",
      phone: "+234841110301",
      emergencyCapable: true,
      hoursNote: "24-hour emergency",
    },
    {
      name: "Trans-Amadi Care Clinic",
      type: "Community Clinic",
      lat: 4.8144,
      lng: 7.0522,
      city: "Port Harcourt",
      area: "Trans Amadi",
      address: "21 Trans Amadi Industrial Layout",
      phone: "+234841110302",
      emergencyCapable: false,
      hoursNote: "Weekdays 8am–6pm",
    },
  ];

  await prisma.hospital.createMany({ data: hospitals });

  console.log(`Seeded patient ${ada.email} and ${doctors.length} doctors, ${hospitals.length} hospitals.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
