import { describe, expect, it, beforeEach } from "vitest";
import { listEmergency } from "@/lib/emergency";
import { makeDoctor, resetDb, seedHospital } from "./helpers";
import { prisma } from "@/lib/db";

describe("emergency list does not require payment", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("returns hospitals and navigate links with no payment and no user session", async () => {
    await seedHospital();
    await prisma.hospital.create({
      data: {
        name: "Lekki Shoreline Clinic",
        type: "Community Clinic",
        lat: 6.4461,
        lng: 3.4782,
        city: "Lagos",
        area: "Lekki Phase 1",
        address: "8 Admiralty Drive",
        phone: "+2342011110103",
        emergencyCapable: false,
      },
    });
    await makeDoctor({ email: "er@test.docnear.ng", status: "ONLINE" });
    await makeDoctor({ email: "off@test.docnear.ng", status: "OFFLINE" });

    const paymentsBefore = await prisma.payment.count();
    const data = await listEmergency(6.6018, 3.3515);
    const paymentsAfter = await prisma.payment.count();

    expect(data.requiresPayment).toBe(false);
    expect(paymentsAfter).toBe(paymentsBefore);
    expect(data.hospitals).toHaveLength(1);
    expect(data.hospitals[0].name).toBe("Ikeja Community Hospital");
    expect(data.hospitals[0].navigateUrl).toContain("destination=");
    expect(data.hospitals[0].geoUrl).toMatch(/^geo:/);
    expect(data.hospitals[0].phone).toBeTruthy();
    expect(data.doctors).toHaveLength(1);
    expect(data.doctors[0].navigateUrl).toContain("maps");
  });
});
