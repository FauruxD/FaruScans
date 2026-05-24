import { supabase } from "@/lib/supabase/client";
import type { Bookmark } from "@/types/supabase";

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

const BOOKMARK_EVENT = "faruscan_bookmarks_changed";

export async function getBookmarks(userId: string): Promise<BookmarkComic[]> {
  if (!supabase || !userId) return [];

  const { data, error } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).map(mapBookmarkRow);
}

export async function isBookmarked(userId: string, slug: string) {
  if (!supabase || !userId || !slug) return false;

  const { data, error } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", userId)
    .eq("comic_slug", slug)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

export async function addBookmark(userId: string, comic: BookmarkComic) {
  if (!supabase || !userId || !comic.slug) return;

  const payload = toBookmarkPayload(userId, comic);
  const { error } = await supabase
    .from("bookmarks")
    .upsert(payload, { onConflict: "user_id,comic_slug" });

  if (error) throw error;
  notifyBookmarksChanged();
}

export async function removeBookmark(userId: string, slug: string) {
  if (!supabase || !userId || !slug) return;

  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("user_id", userId)
    .eq("comic_slug", slug);

  if (error) throw error;
  notifyBookmarksChanged();
}

export async function toggleBookmark(userId: string, comic: BookmarkComic) {
  const saved = await isBookmarked(userId, comic.slug);

  if (saved) {
    await removeBookmark(userId, comic.slug);
    return false;
  }

  await addBookmark(userId, comic);
  return true;
}

export function subscribeBookmarks(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  window.addEventListener(BOOKMARK_EVENT, callback);

  return () => {
    window.removeEventListener(BOOKMARK_EVENT, callback);
  };
}

function notifyBookmarksChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(BOOKMARK_EVENT));
}

function mapBookmarkRow(row: Bookmark): BookmarkComic {
  return {
    slug: row.comic_slug,
    title: row.title,
    cover: row.cover || undefined,
    type: row.type || undefined,
    genre: row.genre || undefined,
    latestChapter: row.latest_chapter_slug
      ? {
          title: row.latest_chapter_title || `Chapter ${row.latest_chapter_slug}`,
          chapterSlug: row.latest_chapter_slug,
        }
      : undefined,
  };
}

function toBookmarkPayload(userId: string, comic: BookmarkComic) {
  return {
    user_id: userId,
    comic_slug: comic.slug,
    title: comic.title || comic.slug,
    cover: comic.cover || null,
    type: comic.type || null,
    genre: comic.genre || null,
    latest_chapter_title: comic.latestChapter?.title || null,
    latest_chapter_slug: comic.latestChapter?.chapterSlug || null,
  };
}
