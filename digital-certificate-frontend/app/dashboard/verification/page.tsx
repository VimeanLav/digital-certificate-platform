"use client";

import VerifyCard from "@/components/VerifyCard";

// Same verification tool the public sees, available inside the dashboard.
export default function DashboardVerificationPage() {
  return (
    <div className="flex flex-col items-center py-6">
      <h1 className="text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Verify a Digital Certificate
      </h1>
      <p className="mt-2 max-w-xl text-center text-sm text-slate-500">
        Enter a Certificate ID to instantly verify its authenticity.
      </p>
      <div className="mt-8 flex w-full justify-center">
        <VerifyCard />
      </div>
    </div>
  );
}
