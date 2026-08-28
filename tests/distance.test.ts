import { describe, expect, it, beforeEach } from "vitest";
import { haversineKm, sortByDistance } from "@/lib/distance";
import { listNearbyDoctors } from "@/lib/doctors";
import { makeDoctor, makePatient, resetDb } from "./helpers";

describe("distance sort", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("computes Ikeja to VI as farther than Ikeja to nearby Allen", () => {
    const ikeja = { lat: 6.6018, lng: 3.3515 };
    const allen = haversineKm(ikeja.lat, ikeja.lng, 6.6052, 3.3492);
    const vi = haversineKm(ikeja.lat, ikeja.lng, 6.4281, 3.4219);
    const abuja = haversineKm(ikeja.lat, ikeja.lng, 9.0765, 7.4898);
    expect(allen).toBeLessThan(2);
    expect(vi).toBeGreaterThan(allen);
    expect(abuja).toBeGreaterThan(vi);
  });

  it("sorts mixed points by distance", () => {
    const origin = { lat: 6.6018, lng: 3.3515 };
    const sorted = sortByDistance(
      [
        { id: "abuja", lat: 9.0765, lng: 7.4898 },
        { id: "ikeja", lat: 6.6052, lng: 3.3492 },
        { id: "vi", lat: 6.4281, lng: 3.4219 },
      ],
      origin,
      (x) => ({ lat: x.lat, lng: x.lng }),
    );
    expect(sorted.map((s) => s.id)).toEqual(["ikeja", "vi", "abuja"]);
    expect(sorted[0].distanceKm).toBeLessThan(sorted[1].distanceKm);
  });

  it("lists nearby doctors nearest first from Ikeja", async () => {
    await makePatient();
    const near = await makeDoctor({ email: "near@test.docnear.ng", lat: 6.6052, lng: 3.3492 });
    const far = await makeDoctor({
      email: "far@test.docnear.ng",
      lat: 9.0765,
      lng: 7.4898,
      city: "Abuja",
      area: "Wuse",
    });
    const mid = await makeDoctor({
      email: "mid@test.docnear.ng",
      lat: 6.4281,
      lng: 3.4219,
      area: "Victoria Island",
    });
    const list = await listNearbyDoctors({ lat: 6.6018, lng: 3.3515 });
    expect(list.map((d) => d.id)).toEqual([near.id, mid.id, far.id]);
    expect(list[0].distanceKm).toBeLessThan(list[1].distanceKm);
    expect(list[1].distanceKm).toBeLessThan(list[2].distanceKm);
  });
});
