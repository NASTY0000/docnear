import { describe, expect, it, beforeEach } from "vitest";
import {
  assertRole,
  authenticate,
  canAccessDoctorApp,
  canAccessPatientApp,
  createSessionToken,
  hashPassword,
  verifyPassword,
  verifySessionToken,
} from "@/lib/auth";
import { AuthError, ForbiddenError } from "@/lib/errors";
import { createConsult } from "@/lib/consults";
import { makeDoctor, makePatient, resetDb } from "./helpers";

describe("auth gates", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("hashes and verifies passwords", async () => {
    const hash = await hashPassword("PatientDemo1!");
    expect(hash).not.toBe("PatientDemo1!");
    expect(await verifyPassword("PatientDemo1!", hash)).toBe(true);
    expect(await verifyPassword("nope", hash)).toBe(false);
  });

  it("issues a verifiable session token", async () => {
    const patient = await makePatient();
    const token = await createSessionToken(patient);
    const session = await verifySessionToken(token);
    expect(session?.id).toBe(patient.id);
    expect(session?.role).toBe("PATIENT");
    expect(await verifySessionToken("not-a-token")).toBeNull();
  });

  it("authenticates credentials and rejects bad passwords", async () => {
    await makePatient("ada.okonkwo@docnear.ng");
    const user = await authenticate("ada.okonkwo@docnear.ng", "PatientDemo1!");
    expect(user.role).toBe("PATIENT");
    await expect(authenticate("ada.okonkwo@docnear.ng", "wrong")).rejects.toBeInstanceOf(AuthError);
  });

  it("keeps patient and doctor apps gated by role", async () => {
    expect(canAccessPatientApp("PATIENT")).toBe(true);
    expect(canAccessDoctorApp("PATIENT")).toBe(false);
    expect(canAccessDoctorApp("DOCTOR")).toBe(true);
    expect(canAccessPatientApp("DOCTOR")).toBe(false);

    const patient = await makePatient();
    const doctor = await makeDoctor();
    expect(assertRole(patient, "PATIENT").id).toBe(patient.id);
    expect(() => assertRole(doctor, "PATIENT")).toThrow(ForbiddenError);
    expect(() => assertRole(patient, "DOCTOR")).toThrow(ForbiddenError);

    await expect(createConsult(doctor, patient.id)).rejects.toBeInstanceOf(ForbiddenError);
  });
});
