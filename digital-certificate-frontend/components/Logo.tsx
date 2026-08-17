import { LinkIcon } from "./icons";

export default function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  const box = size === "lg" ? "h-11 w-11 rounded-2xl" : "h-9 w-9 rounded-xl";
  const icon = size === "lg" ? "h-5 w-5" : "h-4 w-4";
  const text = size === "lg" ? "text-2xl" : "text-xl";
  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        className={`${box} inline-flex items-center justify-center bg-indigo-600 text-white shadow-sm`}
      >
        <LinkIcon className={icon} />
      </span>
      <span className={`${text} font-bold tracking-tight text-slate-900`}>
        CertChain
      </span>
    </span>
  );
}
