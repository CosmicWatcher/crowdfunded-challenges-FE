import { cn } from "@/lib/utils";

export function OverallMetric({
  metric,
  label,
}: {
  metric: string;
  label: string;
}) {
  return (
    <div className="bg-gradient-to-tr from-sky-400 to-red-300 p-2 m-2 px-4 rounded-full shadow-md flex flex-col justify-center items-center">
      <h3 className="text-xs font-bold text-slate-800">{label}</h3>
      <p className="text-sm font-bold text-primary">{metric}</p>
    </div>
  );
}

export function UserMetric({
  metric,
  label,
  className,
}: {
  metric: string;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        className,
        "bg-gradient-to-b from-teal-200 to-emerald-600 from-30% p-2 px-4 m-2 rounded-full shadow-md flex flex-col justify-center items-center",
      )}
    >
      <h3 className="text-xs font-bold text-center text-slate-800">{label}</h3>
      <p className="text-sm font-bold text-center text-primary">{metric}</p>
    </div>
  );
}
