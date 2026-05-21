"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { useSyncExternalStore } from "react";
import {
  type BookmarkComic,
  getBookmarks,
  getBookmarksSnapshot,
  subscribeBookmarks,
  toggleBookmark,
} from "@/lib/bookmarks";
import { cn } from "@/lib/utils";

export default function BookmarkButton({
  comic,
  variant = "button",
}: {
  comic: BookmarkComic;
  variant?: "icon" | "button";
}) {
  useSyncExternalStore(
    subscribeBookmarks,
    getBookmarksSnapshot,
    () => "[]"
  );
  const saved = getBookmarks().some((item) => item.slug === comic.slug);
  const Icon = saved ? BookmarkCheck : Bookmark;

  function onClick() {
    toggleBookmark(comic);
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-label={saved ? "Hapus bookmark" : "Tambah bookmark"}
      className={cn(
        "flex h-12 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-bold text-zinc-950 transition hover:bg-zinc-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10",
        variant === "icon" && "w-12 px-0"
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
      {variant === "button" ? (
        <span>{saved ? "Tersimpan" : "Tambah Bookmark"}</span>
      ) : null}
    </button>
  );
}
