import type { Priority } from "@/lib/types";
const C: Record<Priority, string> = { P1: "bg-red-600", P2: "bg-orange-500", P3: "bg-blue-600", P4: "bg-slate-500" };
export function PriorityBadge({ p }: { p: Priority }) {
  return <span className={`${C[p]} text-white text-xs font-bold px-2 py-0.5 rounded`}>{p}</span>;
}
