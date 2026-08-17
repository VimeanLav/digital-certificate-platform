import type { Certificate, Organization } from "../../generated/prisma/client";

export type EffectiveStatus = "VALID" | "EXPIRED" | "REVOKED";

// Revocation always wins; otherwise a certificate past its expiry date is
// EXPIRED even though the stored status is still VALID.
export function effectiveStatus(cert: Certificate): EffectiveStatus {
  if (cert.status === "REVOKED") return "REVOKED";
  if (cert.expiryDate && cert.expiryDate.getTime() < Date.now()) return "EXPIRED";
  return "VALID";
}

export function serializeCertificate(
  cert: Certificate & { organization?: Organization }
) {
  return {
    id: cert.id,
    certId: cert.certId,
    studentName: cert.studentName,
    studentEmail: cert.studentEmail,
    courseName: cert.courseName,
    description: cert.description,
    issueDate: cert.issueDate,
    expiryDate: cert.expiryDate,
    status: effectiveStatus(cert),
    issuedBy: cert.organization?.name,
    createdAt: cert.createdAt,
  };
}
