import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}

export function StatCard({ label, value, sub, accent }: StatCardProps) {
  return (
    <div className={cn(
      "rounded-xl border p-5",
      accent
        ? "bg-zinc-900 border-zinc-700 text-white"
        : "bg-white border-zinc-200"
    )}>
      <p className={cn("text-sm mb-1", accent ? "text-zinc-400" : "text-zinc-500")}>
        {label}
      </p>
      <p className={cn(
        "text-2xl font-bold tracking-tight",
        accent ? "text-white" : "text-zinc-900"
      )}>
        {value}
      </p>
      {sub && (
        <p className={cn("text-xs mt-1", accent ? "text-zinc-500" : "text-zinc-400")}>
          {sub}
        </p>
      )}
    </div>
  );
}
