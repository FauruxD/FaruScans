import SkeletonCard from "./SkeletonCard";

export default function Loading({
  title = "Memuat komik...",
  cards = 12,
}: {
  title?: string;
  cards?: number;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 h-7 w-56 rounded skeleton-shimmer" />
      <p className="sr-only">{title}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: cards }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </div>
  );
}
