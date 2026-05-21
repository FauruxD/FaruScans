"use client";

import ErrorMessage from "@/components/ErrorMessage";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <ErrorMessage message={error.message || "Terjadi kesalahan."} />
      <button
        onClick={() => unstable_retry()}
        className="mt-4 rounded-lg bg-cyan-300 px-4 py-3 text-sm font-bold text-zinc-950"
      >
        Coba lagi
      </button>
    </div>
  );
}
