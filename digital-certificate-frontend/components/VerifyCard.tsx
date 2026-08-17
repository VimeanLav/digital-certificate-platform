"use client";

import { useCallback, useEffect, useState } from "react";
import { api, formatDate, type Certificate, type VerifyStatus } from "@/lib/api";
import { CheckCircleIcon, ClockIcon, QrIcon, XCircleIcon } from "./icons";

interface VerifyResult {
  status: VerifyStatus;
  certificate?: Certificate;
}

const resultTheme: Record<
  Exclude<VerifyStatus, "NOT_FOUND">,
  { border: string; bg: string; text: string; title: string; note: string }
> = {
  VALID: {
    border: "border-emerald-200",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    title: "Certificate is valid",
    note: "This certificate was verified successfully and is authentic.",
  },
  EXPIRED: {
    border: "border-amber-200",
    bg: "bg-amber-50",
    text: "text-amber-700",
    title: "Certificate has expired",
    note: "This certificate is authentic but its validity period has ended.",
  },
  REVOKED: {
    border: "border-red-200",
    bg: "bg-red-50",
    text: "text-red-700",
    title: "Certificate revoked",
    note: "This certificate has been revoked by the issuing organisation and is no longer valid.",
  },
};

export default function VerifyCard() {
  const [certId, setCertId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerifyResult | null>(null);

  const verify = useCallback(async (id: string) => {
    const trimmed = id.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await api<VerifyResult>(
        `/api/verify/${encodeURIComponent(trimmed.toUpperCase())}`,
        { auth: false }
      );
      setResult(data);
    } catch (err) {
      const status = (err as { status?: number }).status;
      if (status === 404) {
        setResult({ status: "NOT_FOUND" });
      } else {
        setError((err as Error).message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Support QR-code deep links: /?id=CERT-2026-0001 auto-verifies.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");
    if (id) {
      setCertId(id);
      verify(id);
    }
  }, [verify]);

  const cert = result?.certificate;

  return (
    <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          verify(certId);
        }}
      >
        <label
          htmlFor="certId"
          className="block text-sm font-semibold text-slate-900"
        >
          Certificate ID
        </label>
        <input
          id="certId"
          type="text"
          value={certId}
          onChange={(e) => setCertId(e.target.value)}
          placeholder="e.g. CERT-2026-0001"
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          autoComplete="off"
        />
        <p className="mt-2 text-xs text-slate-500">
          Try: CERT-2026-0001 (valid), CERT-2026-0002 (expired), CERT-2026-0003
          (revoked)
        </p>
        <button
          type="submit"
          disabled={loading || !certId.trim()}
          className="mt-4 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Verifying…" : "Verify Certificate"}
        </button>
      </form>

      {error && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {result?.status === "NOT_FOUND" && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
          <XCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
          <div>
            <p className="text-sm font-semibold text-slate-700">
              No certificate found
            </p>
            <p className="mt-0.5 text-sm text-slate-500">
              We couldn&apos;t find a certificate with that ID. Check the ID and
              try again.
            </p>
          </div>
        </div>
      )}

      {cert && result && result.status !== "NOT_FOUND" && (
        <div
          className={`mt-5 rounded-xl border ${resultTheme[result.status].border} ${resultTheme[result.status].bg} p-5`}
        >
          <div className="flex items-start gap-3">
            {result.status === "VALID" && (
              <CheckCircleIcon className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" />
            )}
            {result.status === "EXPIRED" && (
              <ClockIcon className="mt-0.5 h-6 w-6 shrink-0 text-amber-600" />
            )}
            {result.status === "REVOKED" && (
              <XCircleIcon className="mt-0.5 h-6 w-6 shrink-0 text-red-600" />
            )}
            <div>
              <p
                className={`text-base font-semibold ${resultTheme[result.status].text}`}
              >
                {resultTheme[result.status].title}
              </p>
              <p className="mt-0.5 text-sm text-slate-600">
                {resultTheme[result.status].note}
              </p>
            </div>
          </div>

          <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 border-t border-slate-200/70 pt-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Certificate ID
              </dt>
              <dd className="mt-0.5 font-mono text-sm text-slate-900">
                {cert.certId}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Student
              </dt>
              <dd className="mt-0.5 text-sm text-slate-900">{cert.studentName}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Course
              </dt>
              <dd className="mt-0.5 text-sm text-slate-900">{cert.courseName}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Issued by
              </dt>
              <dd className="mt-0.5 text-sm text-slate-900">
                {cert.issuedBy ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Issue date
              </dt>
              <dd className="mt-0.5 text-sm text-slate-900">
                {formatDate(cert.issueDate)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Expiry date
              </dt>
              <dd className="mt-0.5 text-sm text-slate-900">
                {cert.expiryDate ? formatDate(cert.expiryDate) : "No expiry"}
              </dd>
            </div>
          </dl>
        </div>
      )}

      <div className="mt-6 flex items-center gap-2.5 border-t border-slate-100 pt-5 text-sm text-slate-500">
        <QrIcon className="h-5 w-5 shrink-0 text-slate-400" />
        Or scan a QR code from a certificate to verify automatically
      </div>
    </div>
  );
}
