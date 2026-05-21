import type { Metadata } from "next";
import EmptyState from "@/components/EmptyState";
import ErrorMessage from "@/components/ErrorMessage";
import GenreChip from "@/components/GenreChip";
import SectionHeader from "@/components/SectionHeader";
import { fetchAllGenres } from "@/lib/api";
import { safeSegment } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Genre",
};

export default async function GenrePage() {
  const result = await fetchAllGenres();
  const genres = result.data
    .map((genre) => ({
      title: genre.title || genre.titleAttr || genre.slug || "Genre",
      slug: safeSegment(genre.slug),
    }))
    .filter((genre) => genre.slug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <SectionHeader title="Semua genre" description={`${genres.length} genre tersedia`} />
      <ErrorMessage message={result.error} />
      {genres.length ? (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {genres.map((genre) => (
            <GenreChip key={genre.slug} title={genre.title} slug={genre.slug} />
          ))}
        </div>
      ) : (
        <EmptyState title="Genre kosong" />
      )}
    </div>
  );
}
