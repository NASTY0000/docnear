export const APP_NAME = "DocNear";
export const SESSION_COOKIE = "dn_session";
export const PLATFORM_FEE_BPS = Number(process.env.PLATFORM_FEE_BPS || 1500);
export const CURRENCY = "NGN";
export const COUNTRY = "Nigeria";
export const EMERGENCY_NUMBER_NG = "112";

export const DISCLAIMER =
  "DocNear provides advice and triage-style consultation. It is not a substitute for emergency care and is not licensed clinical software. For emergencies, use local emergency services (Nigeria: 112) or go to the nearest emergency-capable hospital.";

export const ROLES = ["PATIENT", "DOCTOR"] as const;
export type Role = (typeof ROLES)[number];

export const DOCTOR_STATUSES = ["ONLINE", "BUSY", "OFFLINE"] as const;
export type DoctorStatus = (typeof DOCTOR_STATUSES)[number];

export const CONSULT_STATUSES = [
  "AWAITING_PAYMENT",
  "PAID",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
] as const;
export type ConsultStatus = (typeof CONSULT_STATUSES)[number];

export const SPECIALTIES = [
  "General Practice",
  "Family Medicine",
  "Emergency Medicine",
  "Paediatrics",
  "Obstetrics & Gynaecology",
  "Internal Medicine",
  "Cardiology",
  "Dermatology",
  "Psychiatry",
  "Orthopaedics",
] as const;

export const HOSPITAL_TYPES = [
  "General Hospital",
  "Emergency Centre",
  "Specialist Hospital",
  "Community Clinic",
  "Teaching Hospital",
] as const;
