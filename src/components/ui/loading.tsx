import { LoaderCircle } from "lucide-react";

export function Loading() {
  return (
    <div className="flex justify-center">
      <LoaderCircle className="animate-spin size-10" />
    </div>
  );
}
