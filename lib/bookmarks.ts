export type BookmarkComic = {
  slug: string;
  title: string;
  cover?: string;
  type?: string;
  genre?: string;
  latestChapter?: {
    title?: string;
    chapterSlug?: string;
  };
  updatedAt?: string;
};

const BOOKMARK_KEY = "faruscan_bookmarks";
const BOOKMARK_EVENT = "faruscan_bookmarks_changed";

export function getBookmarks(): BookmarkComic[] {
  return parseBookmarksSnapshot(getBookmarksSnapshot());
}

export function parseBookmarksSnapshot(snapshot: string): BookmarkComic[] {
  try {
    const parsed = snapshot ? JSON.parse(snapshot) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isBookmarkComic);
  } catch {
    return [];
  }
}

export function getBookmarksSnapshot() {
  if (typeof window === "undefined") return "[]";
  return window.localStorage.getItem(BOOKMARK_KEY) || "[]";
}

export function isBookmarked(slug: string) {
  const normalizedSlug = slug.trim();
  if (!normalizedSlug) return false;
  return getBookmarks().some((item) => item.slug === normalizedSlug);
}

export function addBookmark(comic: BookmarkComic) {
  if (typeof window === "undefined" || !comic.slug) return;

  const bookmarks = getBookmarks();
  const next = [
    sanitizeBookmark(comic),
    ...bookmarks.filter((item) => item.slug !== comic.slug),
  ];
  saveBookmarks(next);
}

export function removeBookmark(slug: string) {
  if (typeof window === "undefined") return;

  const next = getBookmarks().filter((item) => item.slug !== slug);
  saveBookmarks(next);
}

export function toggleBookmark(comic: BookmarkComic) {
  if (isBookmarked(comic.slug)) {
    removeBookmark(comic.slug);
    return false;
  }

  addBookmark(comic);
  return true;
}

export function subscribeBookmarks(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  function onStorage(event: StorageEvent) {
    if (event.key === BOOKMARK_KEY) callback();
  }

  window.addEventListener("storage", onStorage);
  window.addEventListener(BOOKMARK_EVENT, callback);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(BOOKMARK_EVENT, callback);
  };
}

function saveBookmarks(bookmarks: BookmarkComic[]) {
  window.localStorage.setItem(BOOKMARK_KEY, JSON.stringify(bookmarks));
  window.dispatchEvent(new Event(BOOKMARK_EVENT));
}

function sanitizeBookmark(comic: BookmarkComic): BookmarkComic {
  return {
    slug: comic.slug,
    title: comic.title || comic.slug,
    cover: comic.cover,
    type: comic.type,
    genre: comic.genre,
    latestChapter: comic.latestChapter,
    updatedAt: comic.updatedAt,
  };
}

function isBookmarkComic(value: unknown): value is BookmarkComic {
  if (!value || typeof value !== "object") return false;
  const item = value as BookmarkComic;
  return typeof item.slug === "string" && typeof item.title === "string";
}
