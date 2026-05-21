import { Flame, Sparkles } from "lucide-react";
import Link from "next/link";
import ComicCard from "@/components/ComicCard";
import ComicGrid from "@/components/ComicGrid";
import EmptyState from "@/components/EmptyState";
import ErrorMessage from "@/components/ErrorMessage";
import GenreChip from "@/components/GenreChip";
import SectionHeader from "@/components/SectionHeader";
import {
  fetchLatestComics,
  fetchPopularComics,
  fetchRecommendations,
  fetchRecommendedGenres,
} from "@/lib/api";
import { normalizeComicItem, safeSegment, toArray } from "@/lib/utils";

export default async function Home() {
  const [latest, popular, recommendations, genres] = await Promise.all([
    fetchLatestComics(),
    fetchPopularComics(),
    fetchRecommendations(),
    fetchRecommendedGenres(),
  ]);

  const latestComics = latest.data.map(normalizeComicItem).filter((item) => item.slug);
  const recommendedComics = recommendations.data
    .map(normalizeComicItem)
    .filter((item) => item.slug);
  const heroComic = latestComics[0];
  const errors = [latest.error, popular.error, recommendations.error, genres.error].filter(Boolean);
  const popularSections = [
    { key: "manga", title: "Manga", items: toArray(popular.data.manga?.items) },
    { key: "manhwa", title: "Manhwa", items: toArray(popular.data.manhwa?.items) },
    { key: "manhua", title: "Manhua", items: toArray(popular.data.manhua?.items) },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="grid gap-6 py-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
        <div className="rounded-lg border border-white/10 bg-zinc-900/70 p-5 sm:p-7">
          <div className="flex items-center gap-2 text-sm font-semibold text-cyan-300">
            <Sparkles className="size-4" aria-hidden="true" />
            Update komik terbaru
          </div>
          <h1 className="mt-4 max-w-2xl text-3xl font-black tracking-tight text-white sm:text-5xl">
            Baca manga, manhwa, dan manhua dengan reader gelap yang enak di mata.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
            Jelajahi katalog Komiku, lanjutkan chapter terbaru, dan temukan genre
            pilihan dari satu tampilan yang ringan untuk mobile.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/pustaka"
              className="rounded-lg bg-cyan-300 px-4 py-3 text-sm font-bold text-zinc-950 transition hover:bg-cyan-200"
            >
              Buka Pustaka
            </Link>
            <Link
              href="/genre"
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Pilih Genre
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">
          {latestComics.slice(0, 4).map((comic, index) => (
            <ComicCard
              key={`${comic.slug}-${index}`}
              comic={comic}
              priority={index === 0}
              className={index === 0 && heroComic ? "sm:col-span-2 lg:col-span-1" : ""}
            />
          ))}
        </div>
      </section>

      {errors.length ? (
        <div className="my-4">
          <ErrorMessage message={errors[0]} />
        </div>
      ) : null}

      <section className="py-8">
        <SectionHeader
          title="Komik terbaru"
          description="Update paling baru dari halaman utama Komiku."
          href="/pustaka"
        />
        <ComicGrid comics={latestComics.slice(0, 18)} emptyTitle="Komik terbaru kosong" />
      </section>

      <section className="py-8">
        <SectionHeader
          title="Komik populer"
          description="Dipisah berdasarkan Manga, Manhwa, dan Manhua."
        />
        <div className="grid gap-6 lg:grid-cols-3">
          {popularSections.map((section) => {
            const comics = section.items.map(normalizeComicItem).filter((item) => item.slug);
            return (
              <div
                key={section.key}
                className="rounded-lg border border-white/10 bg-zinc-900/50 p-4"
              >
                <div className="mb-4 flex items-center gap-2">
                  <Flame className="size-5 text-amber-300" aria-hidden="true" />
                  <h3 className="font-bold text-white">{section.title}</h3>
                </div>
                {comics.length ? (
                  <div className="grid grid-cols-2 gap-3">
                    {comics.slice(0, 6).map((comic, index) => (
                      <ComicCard key={`${comic.slug}-${index}`} comic={comic} />
                    ))}
                  </div>
                ) : (
                  <EmptyState title={`${section.title} belum tersedia`} />
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="py-8">
        <SectionHeader title="Rekomendasi" description="Pilihan komik untuk mulai baca." />
        <ComicGrid comics={recommendedComics.slice(0, 12)} emptyTitle="Rekomendasi kosong" />
      </section>

      <section className="py-8">
        <SectionHeader title="Genre pilihan" href="/genre" />
        {genres.data.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {genres.data.slice(0, 18).map((genre) => {
              const slug =
                safeSegment(genre.slug) ||
                safeSegment(genre.apiGenreLink?.split("/").filter(Boolean).pop());
              return slug ? (
                <GenreChip key={`${slug}-${genre.title}`} title={genre.title || slug} slug={slug} />
              ) : null;
            })}
          </div>
        ) : (
          <EmptyState title="Genre pilihan kosong" />
        )}
      </section>
    </div>
  );
}
