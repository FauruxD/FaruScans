import type { NormalizedComic } from "@/types/comic";
import ComicCard from "./ComicCard";
import EmptyState from "./EmptyState";

export default function ComicGrid({
  comics,
  emptyTitle = "Belum ada komik",
}: {
  comics: NormalizedComic[];
  emptyTitle?: string;
}) {
  if (!comics.length) {
    return <EmptyState title={emptyTitle} />;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {comics.map((comic, index) => (
        <ComicCard
          key={`${comic.slug}-${comic.title}-${index}`}
          comic={comic}
          priority={index < 4}
        />
      ))}
    </div>
  );
}
