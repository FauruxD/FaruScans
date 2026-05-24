"use client";

import { cn } from "@/lib/utils";

export default function ConfirmModal({
  open,
  title,
  description,
  cancelText = "Batal",
  confirmText = "OK",
  confirmVariant = "default",
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  cancelText?: string;
  confirmText?: string;
  confirmVariant?: "default" | "danger";
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-zinc-900"
      >
        <h2
          id="confirm-modal-title"
          className="text-xl font-black text-zinc-950 dark:text-white"
        >
          {title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {description}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="h-11 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-bold text-zinc-700 transition hover:bg-zinc-100 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={cn(
              "h-11 rounded-lg px-4 text-sm font-bold transition",
              confirmVariant === "danger"
                ? "bg-red-500 text-white hover:bg-red-400"
                : "bg-cyan-400 text-zinc-950 hover:bg-cyan-300"
            )}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
