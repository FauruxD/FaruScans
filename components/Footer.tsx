import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-zinc-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>KomikU reader, dibangun dengan Next.js dan Komiku REST API.</p>
        <div className="flex gap-4">
          <Link className="hover:text-zinc-200" href="/pustaka">
            Pustaka
          </Link>
          <Link className="hover:text-zinc-200" href="/genre">
            Genre
          </Link>
          <Link className="hover:text-zinc-200" href="/berwarna">
            Berwarna
          </Link>
        </div>
      </div>
    </footer>
  );
}
