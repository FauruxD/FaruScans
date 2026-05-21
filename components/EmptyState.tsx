import { SearchX } from "lucide-react";

export default function EmptyState({
  title = "Tidak ada data",
  description = "Coba kata kunci lain atau buka halaman lain.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-white/15 bg-zinc-900/50 p-8 text-center">
      <SearchX className="mx-auto size-10 text-zinc-500" aria-hidden="true" />
      <h3 className="mt-3 text-base font-semibold text-zinc-100">{title}</h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-zinc-400">
        {description}
      </p>
    </div>
  );
}
