"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  type BookmarkComic,
  isBookmarked,
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
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const Icon = saved ? BookmarkCheck : Bookmark;

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      if (!user || !comic.slug) {
        setSaved(false);
        return;
      }

      try {
        setSaved(await isBookmarked(user.id, comic.slug));
      } catch {
        setSaved(false);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [comic.slug, user]);

  async function onClick() {
    if (!user) {
      router.push(`/login?redirect=/komik/${comic.slug}`);
      return;
    }

    try {
      setLoading(true);
      const nextSaved = await toggleBookmark(user.id, comic);
      setSaved(nextSaved);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading || authLoading}
      aria-pressed={saved}
      aria-label={saved ? "Hapus bookmark" : "Tambah bookmark"}
      className={cn(
        "flex h-12 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-bold text-zinc-950 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10",
        variant === "icon" && "w-12 px-0"
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
      {variant === "button" ? (
        <span>{loading ? "Menyimpan..." : saved ? "Tersimpan" : "Tambah Bookmark"}</span>
      ) : null}
    </button>
  );
}
