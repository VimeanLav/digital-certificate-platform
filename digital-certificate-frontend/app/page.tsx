import Link from "next/link";
import Logo from "@/components/Logo";
import VerifyCard from "@/components/VerifyCard";

// Public landing page. Students land here and can verify a certificate
// immediately — no account or login required.
export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-500 sm:inline">
              Public Certificate Verification
            </span>
            <Link
              href="/login"
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Organiser Login
            </Link>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center px-4 py-12 sm:py-16">
        <h1 className="text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Verify a Digital Certificate
        </h1>
        <p className="mt-3 max-w-xl text-center text-slate-500">
          Enter a Certificate ID to instantly verify its authenticity.
        </p>
        <div className="mt-10 flex w-full justify-center">
          <VerifyCard />
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-5">
        <p className="text-center text-xs text-slate-400">
          CertChain — trusted digital certificate verification
        </p>
      </footer>
    </div>
  );
}
