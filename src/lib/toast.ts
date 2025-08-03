import { toast } from "react-toastify";

export const showSuccess = (msg: string) => {
  toast.success(msg, { position: "top-center" });
};

export const showError = (msg: string) => {
  toast.error(msg, { position: "top-center" });
};
