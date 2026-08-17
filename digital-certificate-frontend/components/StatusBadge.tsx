import type { CertStatus } from "@/lib/api";

const styles: Record<CertStatus, string> = {
  VALID: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  EXPIRED: "bg-amber-50 text-amber-700 ring-amber-600/20",
  REVOKED: "bg-red-50 text-red-700 ring-red-600/20",
};

const labels: Record<CertStatus, string> = {
  VALID: "Valid",
  EXPIRED: "Expired",
  REVOKED: "Revoked",
};

export default function StatusBadge({ status }: { status: CertStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
