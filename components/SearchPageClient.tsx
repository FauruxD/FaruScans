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
const INITIAL_VISIBLE_COUNT = 12;
const VISIBLE_INCREMENT = 12;

type SearchPageResponse = SearchResponse & {
  results?: unknown[];
  hasNextPage?: boolean;
  currentPage?: number;
  page?: number;
  totalPages?: number;
  nextPage?: number;
  nextPageUrl?: string;
};

export default function SearchPageClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery.trim());
  const [results, setResults] = useState<NormalizedComic[]>([]);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canSearch = debouncedQuery.length >= 3;

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

        const items = await fetchSearchResults(debouncedQuery, controller.signal);
        if (controller.signal.aborted) return;

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
    if (!canSearch) return "Ketik minimal 3 karakter untuk mencari komik.";
    if (loading) return "Mencari komik...";
    return `${results.length} komik ditemukan`;
  }, [canSearch, debouncedQuery, loading, results.length]);
  const visibleResults = results.slice(0, visibleCount);
  const hasMore = visibleCount < results.length;

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
              onChange={(event) => {
                setQuery(event.target.value);
                setVisibleCount(INITIAL_VISIBLE_COUNT);
                setResults([]);
                setError(null);
              }}
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
              title="Ketik minimal 3 karakter"
              description="Ketik minimal 3 karakter untuk mencari komik."
            />
          ) : results.length ? (
            <>
              <p className="mb-4 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                Menampilkan {visibleResults.length} dari {results.length} hasil
              </p>
              <ComicGrid comics={visibleResults} />
              {hasMore ? (
                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleCount((count) => count + VISIBLE_INCREMENT)
                    }
                    className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-bold text-zinc-950 transition hover:bg-zinc-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                  >
                    View more
                  </button>
                </div>
              ) : null}
            </>
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

async function fetchSearchResults(keyword: string, signal: AbortSignal) {
  const baseUrl = API_BASE_URL.replace(/\/$/, "");
  const firstUrl = `${baseUrl}/search?q=${encodeURIComponent(keyword)}`;
  const firstPage = await fetchSearchPage(firstUrl, signal);
  const items = getSearchItems(firstPage);
  const totalPages = Number(firstPage.totalPages) || 1;
  const firstPageNumber = Number(firstPage.currentPage || firstPage.page) || 1;
  let currentPage = firstPageNumber;
  let nextPageUrl = firstPage.nextPageUrl;
  let hasNextPage = Boolean(firstPage.hasNextPage || currentPage < totalPages);

  while (hasNextPage && currentPage < 20) {
    const nextPage = Number(firstPage.nextPage || currentPage + 1);
    const nextUrl =
      nextPageUrl ||
      `${baseUrl}/search?q=${encodeURIComponent(keyword)}&page=${nextPage}`;

    try {
      const pageData = await fetchSearchPage(nextUrl, signal);
      const pageItems = getSearchItems(pageData);
      if (!pageItems.length) break;

      items.push(...pageItems);
      currentPage = Number(pageData.currentPage || pageData.page || nextPage);
      nextPageUrl = pageData.nextPageUrl;
      hasNextPage =
        Boolean(pageData.hasNextPage) ||
        currentPage < (Number(pageData.totalPages) || totalPages);
    } catch {
      if (signal.aborted) throw new DOMException("Aborted", "AbortError");
      break;
    }
  }

  return dedupeSearchItems(items);
}

async function fetchSearchPage(url: string, signal: AbortSignal) {
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(`API merespons ${response.status}`);
  }

  return (await response.json()) as SearchPageResponse;
}

function getSearchItems(data: SearchPageResponse): unknown[] {
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.results)) return data.results;
  return [];
}

function dedupeSearchItems(items: unknown[]) {
  const seen = new Set<string>();

  return items.filter((item) => {
    if (!item || typeof item !== "object") return false;
    const record = item as Record<string, unknown>;
    const key = String(
      record.slug ||
        record.mangaSlug ||
        record.apiDetailLink ||
        record.href ||
        record.url ||
        record.title ||
        ""
    ).trim();

    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
