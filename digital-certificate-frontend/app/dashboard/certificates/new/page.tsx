"use client";

import { useState } from "react";
import Link from "next/link";
import { api, formatDate, type Certificate } from "@/lib/api";

interface QrData {
  certId: string;
  verifyUrl: string;
  dataUrl: string;
}

const inputClass =
  "mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200";

export default function IssueCertificatePage() {
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [courseName, setCourseName] = useState("");
  const [description, setDescription] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [issued, setIssued] = useState<Certificate | null>(null);
  const [qr, setQr] = useState<QrData | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await api<{ certificate: Certificate }>("/api/certificates", {
        method: "POST",
        body: {
          studentName,
          studentEmail: studentEmail || undefined,
          courseName,
          description: description || undefined,
          issueDate: issueDate || undefined,
          expiryDate: expiryDate || undefined,
        },
      });
      setIssued(data.certificate);
      try {
        setQr(await api<QrData>(`/api/certificates/${data.certificate.id}/qr`));
      } catch {
        // QR is nice-to-have; the certificate itself was created fine.
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setStudentName("");
    setStudentEmail("");
    setCourseName("");
    setDescription("");
    setIssueDate("");
    setExpiryDate("");
    setIssued(null);
    setQr(null);
    setError(null);
  }

  if (issued) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-lg font-bold text-emerald-700">
            Certificate issued 🎉
          </p>
          <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Certificate ID
              </dt>
              <dd className="mt-0.5 font-mono text-sm text-slate-900">
                {issued.certId}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Student
              </dt>
              <dd className="mt-0.5 text-sm text-slate-900">{issued.studentName}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Course
              </dt>
              <dd className="mt-0.5 text-sm text-slate-900">{issued.courseName}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Issue date
              </dt>
              <dd className="mt-0.5 text-sm text-slate-900">
                {formatDate(issued.issueDate)}
              </dd>
            </div>
          </dl>
          {qr && (
            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qr.dataUrl}
                alt={`QR code for ${qr.certId}`}
                className="mx-auto h-48 w-48"
              />
              <p className="mt-2 text-xs text-slate-500">
                Share this QR code — scanning it opens the public verification
                page.
              </p>
            </div>
          )}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={reset}
              className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
            >
              Issue another
            </button>
            <Link
              href="/dashboard/certificates"
              className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              View all certificates
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <div>
          <label htmlFor="studentName" className="block text-sm font-medium text-slate-700">
            Student name *
          </label>
          <input
            id="studentName"
            type="text"
            required
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="studentEmail" className="block text-sm font-medium text-slate-700">
            Student email
          </label>
          <input
            id="studentEmail"
            type="email"
            value={studentEmail}
            onChange={(e) => setStudentEmail(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="courseName" className="block text-sm font-medium text-slate-700">
            Course name *
          </label>
          <input
            id="courseName"
            type="text"
            required
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="issueDate" className="block text-sm font-medium text-slate-700">
              Issue date
            </label>
            <input
              id="issueDate"
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-slate-400">Defaults to today.</p>
          </div>
          <div>
            <label htmlFor="expiryDate" className="block text-sm font-medium text-slate-700">
              Expiry date
            </label>
            <input
              id="expiryDate"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-slate-400">
              Leave empty for no expiry.
            </p>
          </div>
        </div>
        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:opacity-60"
        >
          {loading ? "Issuing…" : "Issue Certificate"}
        </button>
      </form>
    </div>
  );
}
