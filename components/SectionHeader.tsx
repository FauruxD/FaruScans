import Link from "next/link";

export default function SectionHeader({
  title,
  description,
  href,
}: {
  title: string;
  description?: string;
  href?: string;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm text-zinc-400">{description}</p>
        ) : null}
      </div>
      {href ? (
        <Link
          href={href}
          className="shrink-0 text-sm font-semibold text-cyan-300 transition hover:text-cyan-100"
        >
          Lihat semua
        </Link>
      ) : null}
    </div>
  );
}
