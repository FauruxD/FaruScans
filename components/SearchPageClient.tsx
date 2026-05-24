"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import ComicGrid from "@/components/ComicGrid";
import EmptyState from "@/components/EmptyState";
import ErrorMessage from "@/components/ErrorMessage";
import SectionHeader from "@/components/SectionHeader";
import { normalizeComicItem } from "@/lib/utils";
import type { NormalizedComic, SearchResponse } from "@/types/comic";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://komiku-rest-api.vercel.app";

export default function SearchPageClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery.trim());
  const [results, setResults] = useState<NormalizedComic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canSearch = debouncedQuery.length >= 2;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 400);

    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (debouncedQuery) {
      params.set("q", debouncedQuery);
    } else {
      params.delete("q");
    }

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(nextUrl, { scroll: false });
    // searchParams is intentionally excluded to avoid replacing the URL twice
    // after router.replace updates the current query string.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, pathname, router]);

  useEffect(() => {
    if (!canSearch) {
      return;
    }

    const controller = new AbortController();

    async function search() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${API_BASE_URL.replace(/\/$/, "")}/search?q=${encodeURIComponent(
            debouncedQuery
          )}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`API merespons ${response.status}`);
        }

        const data = (await response.json()) as SearchResponse;
        const items = Array.isArray(data.data) ? data.data : [];
        const comics = items
          .map(normalizeComicItem)
          .filter((comic) => comic.slug);

        setResults(comics);
      } catch (searchError) {
        if (
          searchError instanceof DOMException &&
          searchError.name === "AbortError"
        ) {
          return;
        }

        setError(
          searchError instanceof Error
            ? searchError.message
            : "Gagal mencari komik."
        );
        setResults([]);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    search();

    return () => controller.abort();
  }, [canSearch, debouncedQuery]);

  const headerDescription = useMemo(() => {
    if (!debouncedQuery) return "Masukkan judul manga, manhwa, atau manhua.";
    if (!canSearch) return "Ketik minimal 2 karakter.";
    if (loading) return "Mencari komik...";
    return `${results.length} komik ditemukan`;
  }, [canSearch, debouncedQuery, loading, results.length]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900/60 sm:p-5">
        <SectionHeader
          title={debouncedQuery ? `Hasil: ${debouncedQuery}` : "Cari komik"}
          description={headerDescription}
        />

        <div className="mb-6 max-w-xl">
          <div className="relative w-full">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari judul komik..."
              className="h-11 w-full rounded-lg border border-zinc-200 bg-white pl-10 pr-4 text-sm text-zinc-950 outline-none transition focus:border-cyan-500/70 focus:bg-white focus:ring-2 focus:ring-cyan-400/15 dark:border-white/10 dark:bg-zinc-950/70 dark:text-zinc-100 dark:focus:bg-zinc-950"
            />
          </div>
        </div>

        <ErrorMessage message={canSearch ? error : null} />

        <div className="mt-6">
          {canSearch && loading ? (
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-6 text-sm font-semibold text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
              Mencari komik...
            </div>
          ) : !debouncedQuery ? (
            <EmptyState
              title="Belum ada kata kunci"
              description="Ketik judul komik di kolom pencarian."
            />
          ) : !canSearch ? (
            <EmptyState
              title="Ketik minimal 2 karakter"
              description="Hasil akan muncul otomatis setelah keyword cukup panjang."
            />
          ) : results.length ? (
            <ComicGrid comics={results} />
          ) : (
            <EmptyState
              title="Tidak ada hasil"
              description="Coba kata kunci yang lebih pendek atau judul lain."
            />
          )}
        </div>
      </section>
    </div>
  );
}
