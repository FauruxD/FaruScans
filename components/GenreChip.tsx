import Link from "next/link";

export default function GenreChip({
  title,
  slug,
}: {
  title: string;
  slug: string;
}) {
  return (
    <Link
      href={`/genre/${slug}`}
      className="rounded-lg border border-white/10 bg-zinc-900 px-4 py-3 text-sm font-semibold text-zinc-200 transition hover:border-cyan-300/50 hover:bg-cyan-300 hover:text-zinc-950"
    >
      {title}
    </Link>
  );
}
