import { toast } from "react-toastify";

export function notifySuccess(message: string) {
  console.log(new Date().toLocaleString(), message);
  toast.success(message);
}

export function notifyInfo(message: string) {
  toast.info(message);
}
