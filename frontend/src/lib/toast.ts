import { toast as hotToast, ToastOptions } from "react-hot-toast";

/**
 * A thin wrapper around react-hot-toast to provide consistent styling
 * and a unified API for the application.
 */
export const toast = {
  success: (message: string, options?: ToastOptions) => {
    return hotToast.success(message, options);
  },
  
  error: (message: string, options?: ToastOptions) => {
    return hotToast.error(message, options);
  },
  
  loading: (message: string) => {
    return hotToast.loading(message);
  },
  
  dismiss: (toastId?: string) => {
    hotToast.dismiss(toastId);
  },
};
