import { toast } from "react-toastify";

export function notifySuccess(message: string) {
  console.log(
    `%c ${new Date(Date.now()).toLocaleTimeString()}`,
    "color:CornflowerBlue; font-weight:bold;",
    message,
  );
  toast.success(message);
}

export function notifyInfo(message: string) {
  toast.info(message);
}
