import { BookOpen, Calendar, Eye } from "lucide-react";
import Link from "next/link";
import type { ChapterItem } from "@/types/comic";
import { extractChapterFromApiLink } from "@/lib/utils";

export default function ChapterList({
  slug,
  chapters,
}: {
  slug: string;
  chapters: ChapterItem[];
}) {
  if (!chapters.length) return null;

  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-zinc-900/70">
      <div className="border-b border-white/10 px-4 py-3">
        <h2 className="font-bold text-white">Daftar Chapter</h2>
      </div>
      <div className="max-h-[560px] divide-y divide-white/10 overflow-y-auto">
        {chapters.map((chapter, index) => {
          const chapterNumber =
            chapter.chapterNumber || extractChapterFromApiLink(chapter.apiLink);
          const href = chapterNumber
            ? `/baca/${slug}/${chapterNumber}`
            : `/komik/${slug}`;

          return (
            <Link
              key={`${chapter.title}-${chapterNumber}-${index}`}
              href={href}
              className="flex items-center justify-between gap-4 px-4 py-3 transition hover:bg-white/5"
            >
              <div className="min-w-0">
                <p className="flex items-center gap-2 truncate text-sm font-semibold text-zinc-100">
                  <BookOpen className="size-4 shrink-0 text-cyan-300" />
                  {chapter.title || `Chapter ${chapterNumber || index + 1}`}
                </p>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500">
                  {chapter.date ? (
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      {chapter.date}
                    </span>
                  ) : null}
                  {chapter.views ? (
                    <span className="flex items-center gap-1">
                      <Eye className="size-3" />
                      {chapter.views}
                    </span>
                  ) : null}
                </div>
              </div>
              <span className="shrink-0 rounded-md bg-white/5 px-2 py-1 text-xs font-bold text-zinc-300">
                Baca
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
