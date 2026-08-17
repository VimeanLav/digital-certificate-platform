// Seeds a demo organiser account and the three sample certificates shown on
// the public verify page. Run with: npm run seed
import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma.js";

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);
  const org = await prisma.organization.upsert({
    where: { email: "admin@techacademy.io" },
    update: {},
    create: {
      name: "TechAcademy Global",
      email: "admin@techacademy.io",
      passwordHash,
    },
  });

  const certificates = [
    {
      certId: "CERT-2026-0001",
      studentName: "Sokha Chan",
      studentEmail: "sokha.chan@example.com",
      courseName: "Full-Stack Web Development",
      description: "Completed the 12-week full-stack program with distinction.",
      issueDate: new Date("2026-03-15"),
      expiryDate: null,
      status: "VALID" as const,
    },
    {
      certId: "CERT-2026-0002",
      studentName: "Dara Kim",
      studentEmail: "dara.kim@example.com",
      courseName: "Data Analytics Fundamentals",
      description: "Completed the data analytics fundamentals course.",
      issueDate: new Date("2024-01-10"),
      expiryDate: new Date("2025-01-10"),
      status: "VALID" as const, // effective status becomes EXPIRED via expiryDate
    },
    {
      certId: "CERT-2026-0003",
      studentName: "Visal Noun",
      studentEmail: "visal.noun@example.com",
      courseName: "UX Design Essentials",
      description: "Completed the UX design essentials course.",
      issueDate: new Date("2026-01-20"),
      expiryDate: null,
      status: "REVOKED" as const,
    },
  ];

  for (const data of certificates) {
    await prisma.certificate.upsert({
      where: { certId: data.certId },
      update: {},
      create: { ...data, organizationId: org.id },
    });
  }

  console.log("Seeded organiser: admin@techacademy.io / password123");
  console.log("Seeded certificates: CERT-2026-0001 (valid), CERT-2026-0002 (expired), CERT-2026-0003 (revoked)");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
