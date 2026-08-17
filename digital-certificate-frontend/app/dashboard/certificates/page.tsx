"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import { QrIcon } from "@/components/icons";
import { api, formatDate, type Certificate } from "@/lib/api";

interface QrData {
  certId: string;
  verifyUrl: string;
  dataUrl: string;
}

export default function CertificatesPage() {
  const [certs, setCerts] = useState<Certificate[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [qr, setQr] = useState<QrData | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    api<{ certificates: Certificate[] }>("/api/certificates")
      .then((data) => setCerts(data.certificates))
      .catch((err) => setError((err as Error).message));
  }, []);

  useEffect(load, [load]);

  async function revoke(cert: Certificate) {
    if (
      !window.confirm(
        `Revoke ${cert.certId} (${cert.studentName})? This cannot be undone.`
      )
    )
      return;
    setBusyId(cert.id);
    try {
      await api(`/api/certificates/${cert.id}/revoke`, { method: "POST" });
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function showQr(cert: Certificate) {
    setBusyId(cert.id);
    try {
      setQr(await api<QrData>(`/api/certificates/${cert.id}/qr`));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {certs ? `${certs.length} certificate${certs.length === 1 ? "" : "s"}` : "Loading…"}
        </p>
        <Link
          href="/dashboard/certificates/new"
          className="rounded-xl bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
        >
          + Issue Certificate
        </Link>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {!certs ? (
          <p className="px-5 py-8 text-center text-sm text-slate-500">Loading…</p>
        ) : certs.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-500">
            No certificates yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate-500">
                <tr className="border-b border-slate-100">
                  <th className="px-5 py-3 font-medium">Certificate ID</th>
                  <th className="px-5 py-3 font-medium">Student</th>
                  <th className="px-5 py-3 font-medium">Course</th>
                  <th className="px-5 py-3 font-medium">Issued</th>
                  <th className="px-5 py-3 font-medium">Expiry</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {certs.map((cert) => (
                  <tr key={cert.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-900">
                      {cert.certId}
                    </td>
                    <td className="px-5 py-3.5 text-slate-900">{cert.studentName}</td>
                    <td className="px-5 py-3.5 text-slate-600">{cert.courseName}</td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {formatDate(cert.issueDate)}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {cert.expiryDate ? formatDate(cert.expiryDate) : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={cert.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => showQr(cert)}
                          disabled={busyId === cert.id}
                          title="Show QR code"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                        >
                          <QrIcon className="h-4 w-4" /> QR
                        </button>
                        {cert.status !== "REVOKED" && (
                          <button
                            onClick={() => revoke(cert)}
                            disabled={busyId === cert.id}
                            className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {qr && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4"
          onClick={() => setQr(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-sm font-semibold text-slate-900">
              QR code for {qr.certId}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Scanning opens the public verification page for this certificate.
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qr.dataUrl}
              alt={`QR code for ${qr.certId}`}
              className="mx-auto mt-4 h-56 w-56"
            />
            <p className="mt-2 break-all font-mono text-[11px] text-slate-400">
              {qr.verifyUrl}
            </p>
            <button
              onClick={() => setQr(null)}
              className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
