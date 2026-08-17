"use client";

import { formatDate } from "@/lib/api";
import { useOrg } from "@/lib/org-context";

export default function SettingsPage() {
  const org = useOrg();
  if (!org) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-sm font-semibold text-slate-900">
          Organisation profile
        </h2>
        <dl className="mt-5 space-y-4">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Name
            </dt>
            <dd className="mt-0.5 text-sm text-slate-900">{org.name}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Email
            </dt>
            <dd className="mt-0.5 text-sm text-slate-900">{org.email}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Member since
            </dt>
            <dd className="mt-0.5 text-sm text-slate-900">
              {formatDate(org.createdAt)}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
