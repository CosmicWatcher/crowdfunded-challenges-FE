import { toast } from "react-toastify";

export function handleError(error: unknown, prefix = "Error") {
  console.error(prefix, error);

  let errorContent = "";
  if (error instanceof Error) errorContent = error.message;
  else errorContent = String(error);

  toast.error(`${prefix}: ${errorContent}`);
}
