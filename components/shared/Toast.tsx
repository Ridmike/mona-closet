// components/shared/Toast.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import type { ToastMessage } from "@/types";

// ── Context ────────────────────────────────────────────────────────────────────

interface ToastContextValue {
  toast: (message: string, type?: ToastMessage["type"]) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback((message: string, type: ToastMessage["type"] = "info") => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = (id: string) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast stack */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ── Toast Item ────────────────────────────────────────────────────────────────

const toastConfig: Record<
  ToastMessage["type"],
  { bg: string; icon: string; border: string }
> = {
  success: { bg: "bg-emerald-50",  icon: "✓", border: "border-emerald-300" },
  error:   { bg: "bg-red-50",      icon: "✕", border: "border-red-300" },
  warning: { bg: "bg-amber-50",    icon: "⚠", border: "border-amber-300" },
  info:    { bg: "bg-brand-mist",  icon: "ℹ", border: "border-brand-blush" },
};

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: () => void;
}) {
  const cfg = toastConfig[toast.type];

  return (
    <div
      className={cn(
        "pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-card shadow-card border",
        "min-w-[260px] max-w-xs animate-in slide-in-from-right-4 fade-in duration-300",
        cfg.bg,
        cfg.border
      )}
      role="status"
    >
      <span className="text-sm mt-0.5 shrink-0">{cfg.icon}</span>
      <p className="text-sm font-body text-brand-charcoal flex-1">{toast.message}</p>
      <button
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="text-brand-charcoal/40 hover:text-brand-charcoal transition-colors shrink-0 text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}
