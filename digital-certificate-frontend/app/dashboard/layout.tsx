"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import {
  BellIcon,
  CheckBadgeIcon,
  CogIcon,
  DocumentIcon,
  HomeIcon,
  LogoutIcon,
  PlusIcon,
  SearchIcon,
} from "@/components/icons";
import { api, clearToken, getToken, type Organization } from "@/lib/api";
import { OrgContext } from "@/lib/org-context";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: HomeIcon, exact: true },
  { href: "/dashboard/certificates", label: "Certificates", icon: DocumentIcon, exact: true },
  { href: "/dashboard/certificates/new", label: "Issue Certificate", icon: PlusIcon, exact: false },
  { href: "/dashboard/verification", label: "Verification", icon: CheckBadgeIcon, exact: false },
  { href: "/dashboard/settings", label: "Settings", icon: CogIcon, exact: false },
];

const titles: Array<[string, string]> = [
  ["/dashboard/certificates/new", "Issue Certificate"],
  ["/dashboard/certificates", "Certificates"],
  ["/dashboard/verification", "Verify Certificate"],
  ["/dashboard/settings", "Settings"],
  ["/dashboard", "Dashboard"],
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [org, setOrg] = useState<Organization | null>(null);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    api<{ organization: Organization }>("/api/auth/me")
      .then((data) => setOrg(data.organization))
      .catch(() => {
        clearToken();
        router.replace("/login");
      });
  }, [router]);

  function logout() {
    clearToken();
    router.replace("/");
  }

  if (!org) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        Loading…
      </div>
    );
  }

  const initials = org.name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const title = titles.find(([prefix]) => pathname.startsWith(prefix))?.[1] ?? "Dashboard";

  return (
    <OrgContext.Provider value={org}>
      <div className="flex min-h-screen bg-slate-50">
        <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-5 py-4">
            <Link href="/dashboard">
              <Logo />
            </Link>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4">
            {nav.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-slate-100 px-4 py-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                {initials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {org.name}
                </p>
                <p className="truncate text-xs text-slate-500">{org.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <LogoutIcon className="h-5 w-5" />
              Logout
            </button>
          </div>
        </aside>

        <div className="ml-64 flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3.5">
            <h1 className="text-lg font-bold text-slate-900">{title}</h1>
            <div className="flex items-center gap-4">
              <div className="relative hidden sm:block">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  placeholder="Search…"
                  className="w-56 rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <button className="relative text-slate-500 hover:text-slate-700">
                <BellIcon className="h-5 w-5" />
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-indigo-500" />
              </button>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                {initials}
              </span>
            </div>
          </header>
          <main className="flex-1 px-6 py-6">{children}</main>
        </div>
      </div>
    </OrgContext.Provider>
  );
}
