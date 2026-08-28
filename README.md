# DocNear

Nearby doctors and paid advice for Nigeria.

Nearby doctors, paid medical advice sessions, and emergency navigation for Nigeria / West Africa first (Lagos, Abuja, Port Harcourt). Currency NGN.

DocNear is not an emergency service, not a hospital, and not licensed clinical software. Advice is triage-style consultation only. For emergencies use local emergency services (Nigeria: 112) or go to the nearest emergency-capable hospital.

Hospitals in the directory are fictional demo facilities. They do not represent real hospitals and DocNear does not operate them.

## What it does

1. Patients set a pin or city/area, see nearby doctors sorted by distance, filter by specialty and Available now / Busy / Offline, pick who to talk to, pay a demo fee, chat, then rate.
2. Doctors keep a profile (specialty, bio, years, fee, availability), go online, earn from completed consults, and manage a wallet with a real ledger.
3. Emergency mode is a big red entry. It lists the nearest emergency-capable hospitals and available doctors, with distance, phone, and Navigate links. No payment, no long form.

Not in this product: EHR, prescriptions, insurance, or video.

## Run locally

From /workspace/docnear: install packages, then start the app on port 3004.

The first start generates Prisma, pushes SQLite, and seeds demo data into prisma/dev.db.

Open http://localhost:3004

Tests: vitest via the test script. Reset database with the db:reset script.

No Google Maps API key is required. Nearby is a list plus distance. Maps use OpenStreetMap embeds and Google Maps or geo navigate URLs. Missing keys never block the app.

## Demo logins

Patient (Ikeja, Lagos): ada.okonkwo@docnear.ng  password PatientDemo1!

Patient (Wuse, Abuja): chinedu.bello@docnear.ng  password PatientDemo1!

Doctor (GP, Ikeja, online): amaka.eze@docnear.ng  password DoctorDemo1!

Doctor (Emergency medicine, Maryland): tunde.balogun@docnear.ng  password DoctorDemo1!

Doctor (Family medicine, Wuse, Abuja): zainab.musa@docnear.ng  password DoctorDemo1!

Doctor (Emergency medicine, PH GRA): emeka.nwosu@docnear.ng  password DoctorDemo1!

All other seeded doctors use DoctorDemo1!

## Happy path (Lagos patient)

1. Sign in as Ada.
2. Nearby shows Ikeja doctors first. Dr Amaka Eze is closest and Available now.
3. Open her profile, start paid advice, pay with Demo Pay (no live keys).
4. Chat. Complete the consult. 85 percent of the fee (NGN 4,250 of 5,000) moves from pending to available. Platform keeps 15 percent.
5. Rate the consult.
6. Open Emergency. Ikeja Community Hospital and others appear with Call and Navigate. No payment.

Doctor path: sign in as Amaka, go Available, open the session, complete it, visit Wallet, run a demo payout.

## Money and ledger

Consult fee is set by the doctor in NGN (stored as kobo). On demo payment: cash-in, 15 percent platform fee, doctor net to pending. Chat unlocks only after payment. On complete: pending becomes available. Demo payout moves available to paid out. Every step writes LedgerEntry rows.

## Stack

Next.js App Router, TypeScript, Tailwind CSS, Prisma, SQLite. Port 3004. Sessions: jose. Passwords: bcryptjs.

## Tests

Covers distance sort, unpaid consult cannot open chat, emergency list does not require payment, doctor cannot see another doctor wallet, and auth gates.

See package.json for scripts. Copy env.example if needed. DATABASE_URL is sqlite file ./dev.db under prisma. PLATFORM_FEE_BPS is 1500.
