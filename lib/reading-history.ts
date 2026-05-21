import { safeSegment } from "@/lib/utils";

const READ_CHAPTERS_KEY = "komiku_read_chapters";
const READ_CHAPTERS_EVENT = "faruscan_read_chapters_changed";

export type ReadChapter = {
  comicSlug: string;
  chapterSlug: string;
  title?: string;
  comicTitle?: string;
  cover?: string;
  readAt: number;
};

export type ReadHistoryItem = ReadChapter;

export function getReadChapters(): string[] {
  return getReadChapterItems().map((item) =>
    chapterKey(item.comicSlug, item.chapterSlug)
  );
}

export function getReadChapterItems(): ReadChapter[] {
  return parseReadHistorySnapshot(getReadHistorySnapshot(), { sort: false });
}

export function getReadHistorySnapshot() {
  if (typeof window === "undefined") return "[]";
  return window.localStorage.getItem(READ_CHAPTERS_KEY) || "[]";
}

export function parseReadHistorySnapshot(
  snapshot: string,
  options: { sort?: boolean } = {}
): ReadHistoryItem[] {
  try {
    const parsed = snapshot ? JSON.parse(snapshot) : [];
    if (!Array.isArray(parsed)) return [];

    const history = parsed
      .map(normalizeReadChapter)
      .filter((item): item is ReadHistoryItem => Boolean(item));

    return options.sort === false
      ? history
      : history.sort((a, b) => b.readAt - a.readAt);
  } catch {
    return [];
  }
}

export function getAllReadHistory(): ReadHistoryItem[] {
  return getReadChapterItems().sort((a, b) => b.readAt - a.readAt);
}

export function getReadChaptersByComic(slug: string): ReadHistoryItem[] {
  const comicSlug = safeSegment(slug);
  if (!comicSlug) return [];

  return getReadChapterItems()
    .filter((item) => item.comicSlug === comicSlug)
    .sort((a, b) => b.readAt - a.readAt);
}

export function markChapterAsRead(
  slugOrItem: string | Omit<ReadHistoryItem, "readAt"> & { readAt?: number },
  chapter?: string
) {
  if (typeof window === "undefined") return;

  const input =
    typeof slugOrItem === "string"
      ? { comicSlug: slugOrItem, chapterSlug: chapter || "" }
      : slugOrItem;
  const comicSlug = safeSegment(input.comicSlug);
  const chapterSlug = safeSegment(input.chapterSlug);
  if (!comicSlug || !chapterSlug) return;

  const nextChapter: ReadHistoryItem = {
    comicSlug,
    chapterSlug,
    title: input.title,
    comicTitle: input.comicTitle,
    cover: input.cover,
    readAt: input.readAt || Date.now(),
  };
  const chapters = getReadChapterItems().filter(
    (item) => !(item.comicSlug === comicSlug && item.chapterSlug === chapterSlug)
  );

  saveReadChapters([...chapters, nextChapter]);
}

export function isChapterRead(slug: string, chapter: string) {
  const key = chapterKey(slug, chapter);
  return key ? getReadChapters().includes(key) : false;
}

export function resetReadChaptersForComic(slug: string) {
  if (typeof window === "undefined") return;

  const comicSlug = safeSegment(slug);
  if (!comicSlug) return;

  const filtered = getReadChapterItems().filter(
    (item) => item.comicSlug !== comicSlug
  );
  saveReadChapters(filtered);
}

export function removeReadHistoryItem(comicSlug: string, chapterSlug: string) {
  if (typeof window === "undefined") return;

  const normalizedComic = safeSegment(comicSlug);
  const normalizedChapter = safeSegment(chapterSlug);
  if (!normalizedComic || !normalizedChapter) return;

  const filtered = getReadChapterItems().filter(
    (item) =>
      !(item.comicSlug === normalizedComic && item.chapterSlug === normalizedChapter)
  );
  saveReadChapters(filtered);
}

export function clearAllReadHistory() {
  if (typeof window === "undefined") return;
  saveReadChapters([]);
}

export function chapterKey(slug: string, chapter: string) {
  const comicSlug = safeSegment(slug);
  const chapterSlug = safeSegment(chapter);
  return comicSlug && chapterSlug ? `${comicSlug}/${chapterSlug}` : "";
}

export function subscribeReadChapters(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  function onStorage(event: StorageEvent) {
    if (event.key === READ_CHAPTERS_KEY) callback();
  }

  window.addEventListener("storage", onStorage);
  window.addEventListener(READ_CHAPTERS_EVENT, callback);
  window.addEventListener("focus", callback);
  window.addEventListener("pageshow", callback);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(READ_CHAPTERS_EVENT, callback);
    window.removeEventListener("focus", callback);
    window.removeEventListener("pageshow", callback);
  };
}

function saveReadChapters(chapters: ReadChapter[]) {
  window.localStorage.setItem(READ_CHAPTERS_KEY, JSON.stringify(chapters));
  window.dispatchEvent(new Event(READ_CHAPTERS_EVENT));
}

function normalizeReadChapter(value: unknown): ReadChapter | null {
  if (typeof value === "string") {
    const [comicSlug, chapterSlug] = value.split("/");
    const key = chapterKey(comicSlug, chapterSlug);
    if (!key) return null;

    return {
      comicSlug: safeSegment(comicSlug),
      chapterSlug: safeSegment(chapterSlug),
      readAt: 0,
    };
  }

  if (!value || typeof value !== "object") return null;

  const item = value as Partial<ReadChapter>;
  const comicSlug = safeSegment(item.comicSlug);
  const chapterSlug = safeSegment(item.chapterSlug);
  if (!comicSlug || !chapterSlug) return null;

  return {
    comicSlug,
    chapterSlug,
    title: typeof item.title === "string" ? item.title : undefined,
    comicTitle: typeof item.comicTitle === "string" ? item.comicTitle : undefined,
    cover: typeof item.cover === "string" ? item.cover : undefined,
    readAt: Number(item.readAt) || 0,
  };
}
