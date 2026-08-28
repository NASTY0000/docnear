import { existsSync } from "fs";
import { execSync } from "child_process";
import path from "path";

const dbPath = path.join(process.cwd(), "prisma", "dev.db");

execSync("npx prisma generate", { stdio: "inherit" });

if (!existsSync(dbPath)) {
  console.log("No database found — pushing schema and seeding demo data…");
  execSync("npx prisma db push", { stdio: "inherit" });
  execSync("npx tsx prisma/seed.ts", { stdio: "inherit" });
} else {
  execSync("npx prisma db push", { stdio: "inherit" });
}
