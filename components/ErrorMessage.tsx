import { AlertTriangle } from "lucide-react";

export default function ErrorMessage({
  message = "Data belum bisa dimuat.",
}: {
  message?: string | null;
}) {
  if (!message) return null;

  return (
    <div className="rounded-lg border border-red-400/30 bg-red-950/30 p-4 text-sm text-red-100">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-300" />
        <p>{message}</p>
      </div>
    </div>
  );
}
