import { toast } from "react-toastify";

export function handleError(
  error: unknown,
  prefix = "Error",
  toastId:
    | string
    | undefined = `${String(error)}-${Math.ceil(Date.now() / 10000)}`, // prevent duplicates within a 10 sec window
) {
  console.error(prefix, error);

  let errorContent = "";
  if (error instanceof Error) errorContent = error.message;
  else errorContent = String(error);

  toast.error(`${prefix}: ${errorContent}`, { autoClose: 20000, toastId });
}
