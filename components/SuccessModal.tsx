"use client";

export default function SuccessModal({
  open,
  title,
  description,
  buttonLabel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  buttonLabel: string;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="success-modal-title"
        className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-zinc-900"
      >
        <h2
          id="success-modal-title"
          className="text-xl font-black text-zinc-950 dark:text-white"
        >
          {title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {description}
        </p>
        <button
          type="button"
          onClick={onConfirm}
          className="mt-5 h-11 w-full rounded-lg bg-cyan-400 px-4 text-sm font-bold text-zinc-950 transition hover:bg-cyan-300"
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}
