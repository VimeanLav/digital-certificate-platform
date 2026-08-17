"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import { api, formatDate, type Certificate } from "@/lib/api";

interface Stats {
  total: number;
  valid: number;
  expired: number;
  revoked: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Certificate[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api<Stats>("/api/certificates/stats"),
      api<{ certificates: Certificate[] }>("/api/certificates"),
    ])
      .then(([s, c]) => {
        setStats(s);
        setRecent(c.certificates.slice(0, 5));
      })
      .catch((err) => setError((err as Error).message));
  }, []);

  const cards = stats
    ? ([
        { label: "Total Certificates", value: stats.total, accent: "text-slate-900" },
        { label: "Valid", value: stats.valid, accent: "text-emerald-600" },
        { label: "Expired", value: stats.expired, accent: "text-amber-600" },
        { label: "Revoked", value: stats.revoked, accent: "text-red-600" },
      ] as const)
    : null;

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {(cards ?? Array.from({ length: 4 }, () => null)).map((card, i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            {card ? (
              <>
                <p className="text-sm text-slate-500">{card.label}</p>
                <p className={`mt-1 text-3xl font-bold ${card.accent}`}>
                  {card.value}
                </p>
              </>
            ) : (
              <div className="h-14 animate-pulse rounded-lg bg-slate-100" />
            )}
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-900">
            Recent certificates
          </h2>
          <Link
            href="/dashboard/certificates/new"
            className="rounded-xl bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
          >
            + Issue Certificate
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-500">
            No certificates yet. Issue your first one to get started.
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
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recent.map((cert) => (
                  <tr key={cert.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-900">
                      {cert.certId}
                    </td>
                    <td className="px-5 py-3.5 text-slate-900">{cert.studentName}</td>
                    <td className="px-5 py-3.5 text-slate-600">{cert.courseName}</td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {formatDate(cert.issueDate)}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={cert.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
