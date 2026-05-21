"use client";

import { useEffect } from "react";
import { markChapterAsRead } from "@/lib/reading-history";

export default function ReadChapterMarker({
  slug,
  chapter,
  title,
  comicTitle,
  cover,
}: {
  slug: string;
  chapter: string;
  title?: string;
  comicTitle?: string;
  cover?: string;
}) {
  useEffect(() => {
    markChapterAsRead({
      comicSlug: slug,
      chapterSlug: chapter,
      title,
      comicTitle,
      cover,
    });
  }, [chapter, comicTitle, cover, slug, title]);

  return null;
}
