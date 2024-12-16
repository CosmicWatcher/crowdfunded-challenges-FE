import { toast } from "react-toastify";

export function handleError(
  error: unknown,
  prefix = "Error",
  log = true,
  toastId = `${String(error)}-${Math.ceil(Date.now() / 10000)}`, // prevent duplicates within a 10 sec window
) {
  if (log) console.error(new Date().toLocaleString(), prefix, error);

  let errorContent = "";
  if (error instanceof Error) errorContent = error.message;
  else errorContent = String(error);

  toast.error(`${prefix}: ${errorContent}`, { autoClose: 15000, toastId });
}
