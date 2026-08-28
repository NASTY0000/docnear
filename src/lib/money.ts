import { PLATFORM_FEE_BPS } from "./constants";

export function nairaToKobo(naira: number): number {
  return Math.round(naira * 100);
}

export function koboToNaira(kobo: number): number {
  return kobo / 100;
}

export function formatNGN(kobo: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(koboToNaira(kobo));
}

export function splitConsultFee(feeKobo: number, feeBps = PLATFORM_FEE_BPS) {
  if (!Number.isInteger(feeKobo) || feeKobo <= 0) {
    throw new Error("Consult fee must be a positive integer in kobo");
  }
  const platformFeeKobo = Math.round((feeKobo * feeBps) / 10000);
  const doctorNetKobo = feeKobo - platformFeeKobo;
  if (doctorNetKobo <= 0) {
    throw new Error("Platform fee cannot consume the full consult fee");
  }
  return { feeKobo, platformFeeKobo, doctorNetKobo, feeBps };
}
