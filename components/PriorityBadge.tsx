import type { Priority } from "@/lib/types";
const C: Record<Priority, string> = { P1: "bg-red-600 text-white", P2: "bg-amber-400 text-slate-900", P3: "bg-blue-600 text-white", P4: "bg-slate-200 text-slate-700" };
export function PriorityBadge({ p }: { p: Priority }) {
  return <span className={`${C[p]} text-xs font-bold px-2 py-0.5 rounded`}>{p}</span>;
}
