import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Pagination({
  currentPage,
  basePath,
  hasNextPage = true,
  queryMode = true,
}: {
  currentPage: number;
  basePath: string;
  hasNextPage?: boolean;
  queryMode?: boolean;
}) {
  const page = Math.max(1, currentPage);
  const previousHref = queryMode
    ? `${basePath}?page=${page - 1}`
    : `${basePath}/page/${page - 1}`;
  const nextHref = queryMode
    ? `${basePath}?page=${page + 1}`
    : `${basePath}/page/${page + 1}`;

  return (
    <div className="mt-8 flex items-center justify-center gap-3">
      <Link
        href={page > 1 ? previousHref : "#"}
        aria-disabled={page <= 1}
        className={cn(
          "flex h-11 items-center gap-2 rounded-lg border border-white/10 px-4 text-sm font-semibold transition",
          page > 1
            ? "bg-zinc-900 text-zinc-100 hover:border-cyan-300/50"
            : "pointer-events-none bg-zinc-900/40 text-zinc-600"
        )}
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        Previous
      </Link>
      <span className="flex h-11 min-w-12 items-center justify-center rounded-lg bg-cyan-300 px-4 text-sm font-bold text-zinc-950">
        {page}
      </span>
      <Link
        href={hasNextPage ? nextHref : "#"}
        aria-disabled={!hasNextPage}
        className={cn(
          "flex h-11 items-center gap-2 rounded-lg border border-white/10 px-4 text-sm font-semibold transition",
          hasNextPage
            ? "bg-zinc-900 text-zinc-100 hover:border-cyan-300/50"
            : "pointer-events-none bg-zinc-900/40 text-zinc-600"
        )}
      >
        Next
        <ChevronRight className="size-4" aria-hidden="true" />
      </Link>
    </div>
  );
}
