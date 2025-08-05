"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const ToastProvider = React.createContext<{
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
}>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
})

interface Toast {
  id: string
  title: string
  description?: string
  variant?: "default" | "destructive"
}

export function ToastProviderComponent({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const addToast = React.useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { ...toast, id }])

    // Auto remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastProvider.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "bg-white border rounded-lg shadow-lg p-4 min-w-[300px] animate-in slide-in-from-right-full",
              toast.variant === "destructive" && "border-red-200 bg-red-50",
            )}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4
                  className={cn(
                    "font-medium text-sm",
                    toast.variant === "destructive" ? "text-red-900" : "text-gray-900",
                  )}
                >
                  {toast.title}
                </h4>
                {toast.description && (
                  <p className={cn("text-sm mt-1", toast.variant === "destructive" ? "text-red-700" : "text-gray-600")}>
                    {toast.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className={cn(
                  "ml-2 p-1 rounded-md hover:bg-gray-100 transition-colors",
                  toast.variant === "destructive" && "hover:bg-red-100",
                )}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastProvider.Provider>
  )
}

export const useToast = () => {
  const context = React.useContext(ToastProvider)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return {
    toast: context.addToast,
    dismiss: context.removeToast,
  }
}
