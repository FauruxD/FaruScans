import { BookOpen, Clock, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { NormalizedComic } from "@/types/comic";
import { cn } from "@/lib/utils";

export default function ComicCard({
  comic,
  priority = false,
  className,
}: {
  comic: NormalizedComic;
  priority?: boolean;
  className?: string;
}) {
  const href = comic.slug ? `/komik/${comic.slug}` : "/pustaka";

  return (
    <Link
      href={href}
      className={cn(
        "group block overflow-hidden rounded-lg border border-white/10 bg-zinc-900/70 transition hover:-translate-y-1 hover:border-cyan-300/50 hover:bg-zinc-900",
        className
      )}
    >
      <div className="relative aspect-[3/4.25] overflow-hidden bg-zinc-800">
        {comic.thumbnail ? (
          <Image
            src={comic.thumbnail}
            alt={comic.title}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 180px"
            className="object-cover transition duration-500 group-hover:scale-105"
            priority={priority}
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-zinc-800 text-zinc-500">
            <BookOpen className="size-8" aria-hidden="true" />
          </div>
        )}
        {comic.type ? (
          <span className="absolute left-2 top-2 rounded-md bg-zinc-950/85 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-200">
            {comic.type}
          </span>
        ) : null}
      </div>
      <div className="space-y-2 p-3">
        <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-zinc-100">
          {comic.title}
        </h3>
        {comic.genre ? (
          <p className="line-clamp-1 text-xs text-cyan-200/80">{comic.genre}</p>
        ) : null}
        <div className="space-y-1 text-xs text-zinc-400">
          {comic.latestChapterTitle ? (
            <p className="line-clamp-1 font-medium text-zinc-300">
              {comic.latestChapterTitle}
            </p>
          ) : null}
          {comic.updateTime ? (
            <p className="flex items-center gap-1">
              <Clock className="size-3" aria-hidden="true" />
              <span className="line-clamp-1">{comic.updateTime}</span>
            </p>
          ) : comic.views ? (
            <p className="flex items-center gap-1">
              <Eye className="size-3" aria-hidden="true" />
              <span className="line-clamp-1">{comic.views}</span>
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
