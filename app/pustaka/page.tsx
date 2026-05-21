import type { Metadata } from "next";
import ComicGrid from "@/components/ComicGrid";
import ErrorMessage from "@/components/ErrorMessage";
import Pagination from "@/components/Pagination";
import SectionHeader from "@/components/SectionHeader";
import { fetchLibraryComics } from "@/lib/api";
import { normalizeComicItem } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pustaka",
};

export default async function PustakaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const params = await searchParams;
  const pageParam = Array.isArray(params.page) ? params.page[0] : params.page;
  const page = Math.max(1, Number(pageParam) || 1);
  const result = await fetchLibraryComics(page);
  const comics = (result.data.results || [])
    .map(normalizeComicItem)
    .filter((comic) => comic.slug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <SectionHeader
        title="Pustaka komik"
        description={`Halaman ${result.data.page || page}`}
      />
      <ErrorMessage message={result.error} />
      <div className="mt-6">
        <ComicGrid comics={comics} emptyTitle="Pustaka kosong" />
      </div>
      <Pagination currentPage={page} basePath="/pustaka" hasNextPage={comics.length >= 10} />
    </div>
  );
}
