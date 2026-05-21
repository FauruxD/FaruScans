import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { NormalizedComic } from "@/types/comic";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Extract the manga slug from various API detail link formats.
 * e.g. "/detail-komik/bocchi-the-rock" => "bocchi-the-rock"
 * e.g. "https://komiku.org/manga/bocchi-the-rock/" => "bocchi-the-rock"
 */
export function extractSlugFromDetailLink(link?: string | null): string {
  if (!link) return "";
  const cleanLink = decodeURIComponent(String(link)).trim();
  const apiMatch = cleanLink.match(/\/detail-komik\/([^/?#]+)/);
  if (apiMatch?.[1]) return safeSegment(apiMatch[1]);
  const mangaMatch = cleanLink.match(/\/manga\/([^/?#]+)/);
  if (mangaMatch?.[1]) return safeSegment(mangaMatch[1]);
  const segments = cleanLink.split(/[/?#]/)[0]?.split("/").filter(Boolean) || [];
  return safeSegment(segments[segments.length - 1] || "");
}

/**
 * Extract chapter number/slug from various API chapter link formats.
 * e.g. "/baca-chapter/bocchi-the-rock/82" => "82"
 */
export function extractChapterFromApiLink(link?: string | null): string {
  if (!link) return "";
  const cleanLink = decodeURIComponent(String(link)).trim();
  const apiMatch = cleanLink.match(/\/baca-chapter\/[^/]+\/([^/?#]+)/);
  if (apiMatch?.[1]) return safeSegment(apiMatch[1]);
  const chapterMatch = cleanLink.match(/chapter-([\d.]+)/i);
  if (chapterMatch?.[1]) return safeSegment(chapterMatch[1]);
  const segments = cleanLink.split(/[/?#]/)[0]?.split("/").filter(Boolean) || [];
  return safeSegment(segments[segments.length - 1] || "");
}

/**
 * Extract manga slug from a chapter API link.
 * e.g. "/baca-chapter/bocchi-the-rock/82" => "bocchi-the-rock"
 */
export function extractSlugFromChapterLink(link?: string | null): string {
  if (!link) return "";
  const cleanLink = decodeURIComponent(String(link)).trim();
  const apiMatch = cleanLink.match(/\/baca-chapter\/([^/]+)/);
  if (apiMatch?.[1]) return safeSegment(apiMatch[1]);
  const chapterMatch = cleanLink.match(/\/([^/?#]+)-chapter-[\d.]+/i);
  if (chapterMatch?.[1]) return safeSegment(chapterMatch[1]);
  return "";
}

export function safeSegment(value?: string | null): string {
  return String(value || "")
    .replace(/^\/+|\/+$/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .slice(0, 160);
}

export function textFallback(value?: string | null, fallback = "Tidak tersedia"): string {
  return String(value || "").trim() || fallback;
}

export function toArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

/**
 * Normalize varied comic item shapes from different endpoints
 * into a single NormalizedComic for consistent card rendering.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeComicItem(item: any): NormalizedComic {
  const slug =
    item?.slug ||
    item?.mangaSlug ||
    extractSlugFromDetailLink(
      item?.apiDetailLink ||
        item?.apiMangaLink ||
        item?.detailUrl ||
        item?.href ||
        item?.url ||
        item?.originalLink
    ) ||
    "";

  const thumbnail = item?.thumbnail || item?.image || item?.cover || "";
  const type = item?.type || item?.info?.["Jenis Komik"] || item?.["Jenis Komik"] || "";
  const genre = Array.isArray(item?.genres)
    ? item.genres.filter(Boolean).slice(0, 3).join(", ")
    : item?.genre || item?.genres || "";
  const latestChapterTitle =
    item?.latestChapterTitle ||
    item?.latestChapter?.chapter ||
    item?.latestChapter?.title ||
    item?.latestChapter ||
    item?.chapters?.latest?.chapter ||
    "";
  const latestChapterSlug =
    extractChapterFromApiLink(
      item?.apiChapterLink ||
        item?.latestChapter?.url ||
        item?.latestChapter?.apiLink ||
        item?.chapters?.latest?.apiLink
    ) || "";

  const updateTime = item?.updateTime || item?.stats || item?.additionalInfo || "";
  const views = item?.readers || item?.views || "";
  const description = item?.description || item?.synopsis || "";

  return {
    title: item?.title || item?.name || "Judul tidak tersedia",
    slug: safeSegment(slug),
    thumbnail,
    type,
    genre,
    updateTime,
    latestChapterTitle,
    latestChapterSlug,
    isColored: item?.isColored ?? false,
    views,
    description,
  };
}
