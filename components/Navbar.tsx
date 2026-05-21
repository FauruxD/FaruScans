import { BookOpen, Library, Palette, Tags } from "lucide-react";
import Link from "next/link";
import SearchBar from "./SearchBar";

const navItems = [
  { href: "/pustaka", label: "Pustaka", icon: Library },
  { href: "/genre", label: "Genre", icon: Tags },
  { href: "/berwarna", label: "Berwarna", icon: Palette },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-10 items-center justify-center rounded-lg bg-cyan-400 text-zinc-950">
              <BookOpen className="size-5" aria-hidden="true" />
            </span>
            <span className="text-lg font-bold tracking-tight text-white">
              KomikU
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-zinc-300 transition hover:bg-white/10 hover:text-white"
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </Link>
            ))}
          </nav>
          <div className="hidden w-full max-w-sm md:block">
            <SearchBar />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 md:hidden">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex h-10 items-center justify-center gap-2 rounded-lg bg-white/5 text-xs font-medium text-zinc-300"
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </Link>
          ))}
        </div>
        <div className="md:hidden">
          <SearchBar compact />
        </div>
      </div>
    </header>
  );
}
