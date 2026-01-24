"use client";

import { useEffect, useState, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

interface ToastMessage {
  id: number;
  type: "success" | "error" | "info";
  message: string;
}

// Global toast state
let toastId = 0;
let addToastHandler: ((toast: Omit<ToastMessage, "id">) => void) | null = null;

export function Toaster() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: Omit<ToastMessage, "id">) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { ...toast, id }]);

    // Auto remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Register the handler
  useEffect(() => {
    addToastHandler = addToast;
    return () => {
      addToastHandler = null;
    };
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 p-4 rounded-xl shadow-lg border animate-slide-in-right ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : toast.type === "error"
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-blue-50 border-blue-200 text-blue-800"
          }`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {toast.type === "success" && <CheckCircle className="w-5 h-5 text-emerald-500" />}
            {toast.type === "error" && <AlertCircle className="w-5 h-5 text-red-500" />}
            {toast.type === "info" && <Info className="w-5 h-5 text-blue-500" />}
          </div>
          <p className="flex-1 text-sm font-medium">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 p-0.5 rounded-md hover:bg-black/5 transition-colors"
          >
            <X className="w-4 h-4 opacity-60" />
          </button>
        </div>
      ))}
    </div>
  );
}

// Toast API
export const toast = {
  success: (message: string) => {
    if (addToastHandler) {
      addToastHandler({ type: "success", message });
    } else {
      console.log("Toast Success:", message);
    }
  },
  error: (message: string) => {
    if (addToastHandler) {
      addToastHandler({ type: "error", message });
    } else {
      console.error("Toast Error:", message);
    }
  },
  info: (message: string) => {
    if (addToastHandler) {
      addToastHandler({ type: "info", message });
    } else {
      console.log("Toast Info:", message);
    }
  },
};
