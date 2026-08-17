import { Router } from "express";
import QRCode from "qrcode";
import { prisma } from "../lib/prisma.js";
import { effectiveStatus, serializeCertificate } from "../lib/certificates.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

// Certificate IDs look like CERT-2026-0001, numbered sequentially per year.
async function nextCertId(): Promise<string> {
  const prefix = `CERT-${new Date().getFullYear()}-`;
  const count = await prisma.certificate.count({
    where: { certId: { startsWith: prefix } },
  });
  return `${prefix}${String(count + 1).padStart(4, "0")}`;
}

// GET /api/certificates — list this organisation's certificates
router.get("/", async (req: AuthRequest, res) => {
  const certs = await prisma.certificate.findMany({
    where: { organizationId: req.orgId! },
    orderBy: { createdAt: "desc" },
    include: { organization: true },
  });
  res.json({ certificates: certs.map(serializeCertificate) });
});

// GET /api/certificates/stats — dashboard counters
router.get("/stats", async (req: AuthRequest, res) => {
  const certs = await prisma.certificate.findMany({
    where: { organizationId: req.orgId! },
  });
  const stats = { total: certs.length, valid: 0, expired: 0, revoked: 0 };
  for (const cert of certs) {
    const status = effectiveStatus(cert);
    if (status === "VALID") stats.valid++;
    else if (status === "EXPIRED") stats.expired++;
    else stats.revoked++;
  }
  res.json(stats);
});

// POST /api/certificates — issue a new certificate
router.post("/", async (req: AuthRequest, res) => {
  const { studentName, studentEmail, courseName, description, issueDate, expiryDate } =
    req.body ?? {};
  if (!studentName || !courseName) {
    res.status(400).json({ error: "studentName and courseName are required" });
    return;
  }

  // Retry a couple of times in case two certificates are issued at the same
  // moment and race for the same sequential ID.
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const cert = await prisma.certificate.create({
        data: {
          certId: await nextCertId(),
          studentName,
          studentEmail: studentEmail || null,
          courseName,
          description: description || null,
          issueDate: issueDate ? new Date(issueDate) : new Date(),
          expiryDate: expiryDate ? new Date(expiryDate) : null,
          organizationId: req.orgId!,
        },
        include: { organization: true },
      });
      res.status(201).json({ certificate: serializeCertificate(cert) });
      return;
    } catch (err) {
      if ((err as { code?: string })?.code === "P2002" && attempt < 2) continue;
      throw err;
    }
  }
});

// POST /api/certificates/:id/revoke
router.post("/:id/revoke", async (req: AuthRequest, res) => {
  const cert = await prisma.certificate.findFirst({
    where: { id: String(req.params.id), organizationId: req.orgId! },
  });
  if (!cert) {
    res.status(404).json({ error: "Certificate not found" });
    return;
  }
  const updated = await prisma.certificate.update({
    where: { id: cert.id },
    data: { status: "REVOKED" },
    include: { organization: true },
  });
  res.json({ certificate: serializeCertificate(updated) });
});

// GET /api/certificates/:id/qr — QR code that links to the public verify page
router.get("/:id/qr", async (req: AuthRequest, res) => {
  const cert = await prisma.certificate.findFirst({
    where: { id: String(req.params.id), organizationId: req.orgId! },
  });
  if (!cert) {
    res.status(404).json({ error: "Certificate not found" });
    return;
  }
  const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";
  const verifyUrl = `${frontendUrl}/?id=${encodeURIComponent(cert.certId)}`;
  const dataUrl = await QRCode.toDataURL(verifyUrl, { width: 320, margin: 2 });
  res.json({ certId: cert.certId, verifyUrl, dataUrl });
});

export default router;
