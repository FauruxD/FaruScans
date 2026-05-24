"use client";

import {
  Bookmark as BookmarkIcon,
  Compass,
  Flame,
  Home,
  Library,
  LogIn,
  LogOut,
  Search,
  UserCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import ConfirmModal from "./ConfirmModal";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/",
    label: "Home",
    icon: Home,
    isActive: (pathname: string) => pathname === "/",
  },
  {
    href: "/pustaka",
    label: "Comics",
    icon: Compass,
    isActive: (pathname: string) => pathname.startsWith("/pustaka"),
  },
  {
    href: "/popular",
    label: "Popular",
    icon: Flame,
    isActive: (pathname: string) => pathname.startsWith("/popular"),
  },
  {
    href: "/library",
    label: "Library",
    icon: Library,
    isActive: (pathname: string) => pathname.startsWith("/library"),
  },
  {
    href: "/bookmarks",
    label: "Bookmark",
    icon: BookmarkIcon,
    isActive: (pathname: string) => pathname.startsWith("/bookmarks"),
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading, signOut } = useAuth();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const isReaderPage = pathname.startsWith("/baca/");
  const displayName =
    profile?.display_name || profile?.username || user?.email?.split("@")[0] || "User";

  async function confirmLogout() {
    await signOut();
    setLogoutOpen(false);
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <ConfirmModal
        open={logoutOpen}
        title="Keluar dari akun?"
        description="Kamu akan keluar dari FaruScan."
        cancelText="Batal"
        confirmText="Logout"
        confirmVariant="danger"
        onCancel={() => setLogoutOpen(false)}
        onConfirm={confirmLogout}
      />
      <header
        className={cn(
          "border-b border-zinc-200 bg-white/95 backdrop-blur-xl dark:border-cyan-500/10 dark:bg-slate-950/95",
          isReaderPage ? "relative" : "sticky top-0 z-50"
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-[72px] lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <Image
              src="/faruscan-logo.png"
              alt="FaruScan Logo"
              width={42}
              height={42}
              priority
              className="h-10 w-10 object-contain"
            />
            <span className="text-xl font-black tracking-tight text-zinc-950 dark:text-white">
              FaruScan
            </span>
          </Link>

          <nav className="hidden h-full items-center gap-2 md:flex">
            {navItems.map(({ href, label, icon: Icon, isActive }) => {
              const active = isActive(pathname);

              return (
                <Link
                  key={`${label}-${href}`}
                  href={href}
                  className={cn(
                    "relative flex h-full items-center gap-2 px-3 text-sm font-semibold transition",
                    active
                      ? "text-cyan-600 dark:text-white"
                      : "text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  <span>{label}</span>
                  <span
                    className={cn(
                      "absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-cyan-400 transition-opacity",
                      active ? "opacity-100" : "opacity-0"
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/search"
              aria-label="Cari komik"
              className="flex size-11 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-100 text-zinc-700 transition hover:bg-zinc-200 dark:border-cyan-500/10 dark:bg-slate-900 dark:text-zinc-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <Search className="size-5" aria-hidden="true" />
            </Link>
            <ThemeToggle />
            {!loading && user ? (
              <>
                <button
                  type="button"
                  onClick={() => setLogoutOpen(true)}
                  className="flex size-11 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-100 text-zinc-700 transition hover:bg-zinc-200 dark:border-cyan-500/10 dark:bg-slate-900 dark:text-zinc-300 dark:hover:bg-slate-800 sm:hidden"
                  aria-label="Logout"
                >
                  <LogOut className="size-5" aria-hidden="true" />
                </button>
                <div className="hidden items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-100 px-2 py-1.5 text-zinc-800 dark:border-cyan-500/10 dark:bg-slate-900 dark:text-zinc-200 sm:flex">
                  <UserCircle className="size-5 text-cyan-500" aria-hidden="true" />
                  <span className="max-w-24 truncate text-xs font-bold">
                    {displayName}
                  </span>
                  <button
                    type="button"
                    onClick={() => setLogoutOpen(true)}
                    className="flex size-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-200 hover:text-zinc-950 dark:hover:bg-white/10 dark:hover:text-white"
                    aria-label="Logout"
                  >
                    <LogOut className="size-4" aria-hidden="true" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  aria-label="Login"
                  className="flex size-11 items-center justify-center rounded-xl bg-cyan-400 text-zinc-950 transition hover:bg-cyan-300 sm:hidden"
                >
                  <LogIn className="size-5" aria-hidden="true" />
                </Link>
                <Link
                  href="/login"
                  className="hidden h-11 items-center gap-2 rounded-xl bg-cyan-400 px-4 text-sm font-bold text-zinc-950 transition hover:bg-cyan-300 sm:flex"
                >
                  <LogIn className="size-4" aria-hidden="true" />
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {!isReaderPage ? (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-white/90 px-2 py-2 backdrop-blur dark:border-white/10 dark:bg-slate-950/90 md:hidden">
          <div className="mx-auto flex max-w-md items-center justify-between gap-1">
            {navItems.map(({ href, label, icon: Icon, isActive }) => {
              const active = isActive(pathname);

              return (
                <Link
                  key={`mobile-${label}-${href}`}
                  href={href}
                  className={cn(
                    "flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs font-semibold transition",
                    active
                      ? "bg-cyan-400/10 text-cyan-500 dark:text-cyan-400"
                      : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-white/5"
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                  <span className="max-w-full truncate">{label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      ) : null}
    </>
  );
}
