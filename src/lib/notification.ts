import { toast } from "react-toastify";

export function notifySuccess(message: string) {
  console.log(message);
  toast.success(message);
}

export function notifyInfo(message: string) {
  toast.info(message);
}
