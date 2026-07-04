"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CommentSection from "@/components/comments/CommentSection";
import EmptyState from "@/components/EmptyState";
import ReaderControls from "@/components/ReaderControls";
import ReaderImage from "@/components/ReaderImage";
import ReactionBar from "@/components/reactions/ReactionBar";
import { markChapterAsRead } from "@/lib/reading-history";
import { getReaderNavigation, textFallback } from "@/lib/utils";
import type { ChapterDetail, ReaderControlChapter } from "@/types/comic";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://komiku-rest-api.vercel.app";
const MAX_AUTO_LOADED_CHAPTERS = 5;

type LoadedChapter = {
  chapterSlug: string;
  data: ChapterDetail;
};

export default function InfiniteChapterReader({
  comicSlug,
  initialChapter,
  initialReaderData,
  chapters,
  detailHref,
  comicTitle,
  cover,
}: {
  comicSlug: string;
  initialChapter: string;
  initialReaderData: ChapterDetail;
  chapters: ReaderControlChapter[];
  detailHref: string;
  comicTitle: string;
  cover?: string;
}) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [loadedChapters, setLoadedChapters] = useState<LoadedChapter[]>([
    {
      chapterSlug: initialChapter,
      data: initialReaderData,
    },
  ]);
  const [loadingNext, setLoadingNext] = useState(false);
  const [error, setError] = useState("");
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const loadedChapterKeys = useMemo(
    () => new Set(loadedChapters.map((item) => item.chapterSlug)),
    [loadedChapters]
  );
  const lastChapter = loadedChapters[loadedChapters.length - 1];
  const nextChapter = lastChapter
    ? getReaderNavigation(chapters, lastChapter.chapterSlug).nextChapter
    : null;
  const autoLoadLimitReached =
    loadedChapters.length >= MAX_AUTO_LOADED_CHAPTERS && Boolean(nextChapter);

  const loadNextChapter = useCallback(async (force = false) => {
    const lastLoaded = loadedChapters[loadedChapters.length - 1];
    if (!lastLoaded || loadingNext || (autoLoadLimitReached && !force)) return;

    const next = getReaderNavigation(chapters, lastLoaded.chapterSlug).nextChapter;
    if (!next) {
      setHasReachedEnd(true);
      return;
    }

    if (loadedChapterKeys.has(next)) return;

    try {
      setLoadingNext(true);
      setError("");
      const data = await fetchReaderChapter(comicSlug, next);
      const title = textFallback(data.title, `Chapter ${next}`);

      setLoadedChapters((items) => [
        ...items,
        {
          chapterSlug: next,
          data,
        },
      ]);
      markChapterAsRead({
        comicSlug,
        chapterSlug: next,
        title,
        comicTitle,
        cover,
      });
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Gagal memuat chapter berikutnya."
      );
    } finally {
      setLoadingNext(false);
    }
  }, [
    autoLoadLimitReached,
    chapters,
    comicSlug,
    comicTitle,
    cover,
    loadedChapterKeys,
    loadedChapters,
    loadingNext,
  ]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || autoLoadLimitReached) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadNextChapter();
        }
      },
      { rootMargin: "700px 0px" }
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [autoLoadLimitReached, loadNextChapter]);

  return (
    <div className="space-y-10">
      {loadedChapters.map((chapter, index) => {
        const title = textFallback(chapter.data.title, `Chapter ${chapter.chapterSlug}`);
        const images = (chapter.data.images || []).filter((image) => image.src);
        const navigation = getReaderNavigation(chapters, chapter.chapterSlug);

        return (
          <section
            key={chapter.chapterSlug}
            id={`chapter-${chapter.chapterSlug}`}
            className="scroll-mt-8"
          >
            {index > 0 ? (
              <div className="mx-auto mb-5 max-w-4xl border-y border-zinc-200 bg-white/80 px-4 py-4 text-center backdrop-blur dark:border-white/10 dark:bg-zinc-900/70">
                <p className="text-xs font-semibold uppercase tracking-wide text-cyan-600 dark:text-cyan-300">
                  Chapter berikutnya
                </p>
                <h2 className="mt-1 text-xl font-black text-zinc-950 dark:text-white">
                  {title}
                </h2>
              </div>
            ) : null}

            {images.length ? (
              <div className="space-y-1">
                {images.map((image, imageIndex) => (
                  <ReaderImage
                    key={`${chapter.chapterSlug}-${image.src}-${imageIndex}`}
                    src={image.src || ""}
                    alt={image.alt}
                    index={imageIndex}
                    fallbackSrc={image.fallbackSrc}
                  />
                ))}
              </div>
            ) : (
              <div className="px-4">
                <EmptyState title="Gambar chapter kosong" />
              </div>
            )}

            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
              <ReaderControls
                slug={comicSlug}
                currentChapter={chapter.chapterSlug}
                chapters={chapters}
                prevChapter={navigation.prevChapter || undefined}
                nextChapter={navigation.nextChapter || undefined}
                detailHref={detailHref}
              />
              <section className="mx-auto mt-8 w-full max-w-4xl space-y-6">
                <ReactionBar
                  targetType="chapter"
                  comicSlug={comicSlug}
                  chapterSlug={chapter.chapterSlug}
                />
                <CommentSection
                  targetType="chapter"
                  comicSlug={comicSlug}
                  chapterSlug={chapter.chapterSlug}
                />
              </section>
            </div>
          </section>
        );
      })}

      <div ref={sentinelRef} className="h-12" />

      <div className="mx-auto max-w-4xl px-4 pb-8">
        {loadingNext ? (
          <p className="rounded-xl border border-zinc-200 bg-white/80 px-4 py-4 text-center text-sm font-semibold text-zinc-600 dark:border-white/10 dark:bg-zinc-900/70 dark:text-zinc-300">
            Memuat chapter berikutnya...
          </p>
        ) : error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-center text-sm font-semibold text-red-600 dark:border-red-300/20 dark:bg-red-950/20 dark:text-red-200">
            {error}
          </p>
        ) : autoLoadLimitReached ? (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => loadNextChapter(true)}
              className="rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm font-bold text-zinc-950 transition hover:bg-zinc-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              Muat chapter berikutnya
            </button>
          </div>
        ) : hasReachedEnd ? (
          <p className="rounded-xl border border-zinc-200 bg-white/80 px-4 py-4 text-center text-sm font-semibold text-zinc-600 dark:border-white/10 dark:bg-zinc-900/70 dark:text-zinc-300">
            Kamu sudah sampai chapter terbaru.
          </p>
        ) : null}
      </div>
    </div>
  );
}

async function fetchReaderChapter(comicSlug: string, chapterSlug: string) {
  const response = await fetch(
    `${API_BASE_URL.replace(/\/$/, "")}/baca-chapter/${comicSlug}/${chapterSlug}`
  );

  if (!response.ok) {
    throw new Error(`API merespons ${response.status}`);
  }

  return (await response.json()) as ChapterDetail;
}
