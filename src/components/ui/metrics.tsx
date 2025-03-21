import { cn } from "@/lib/utils";

export function OverallMetric({
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
        "bg-gradient-to-tr from-sky-400 to-red-300 hover:opacity-90 hover:transition-opacity p-2 m-2 px-4 rounded-full shadow-md flex flex-col justify-center items-center",
        className,
      )}
    >
      <h3 className="text-xs font-bold text-center text-slate-800">{label}</h3>
      <p className="text-xs font-bold text-center text-primary">{metric}</p>
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
        "bg-gradient-to-b from-teal-200 to-emerald-600 from-30% hover:opacity-90 hover:transition-opacity p-2 px-4 m-2 rounded-full shadow-md flex flex-col justify-center items-center",
        className,
      )}
    >
      <h3 className="text-xs font-bold text-center text-slate-800">{label}</h3>
      <p className="text-xs font-bold text-center text-primary">{metric}</p>
    </div>
  );
}
