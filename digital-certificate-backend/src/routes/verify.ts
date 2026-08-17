import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { serializeCertificate } from "../lib/certificates.js";

const router = Router();

// GET /api/verify/:certId — public, no auth. Students use this.
router.get("/:certId", async (req, res) => {
  const certId = String(req.params.certId).trim().toUpperCase();
  const cert = await prisma.certificate.findUnique({
    where: { certId },
    include: { organization: true },
  });
  if (!cert) {
    res.status(404).json({ status: "NOT_FOUND" });
    return;
  }
  const serialized = serializeCertificate(cert);
  res.json({ status: serialized.status, certificate: serialized });
});

export default router;
