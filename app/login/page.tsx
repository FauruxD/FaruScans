"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const timeout = createAuthTimeout();
    try {
      if (!supabase) throw new Error("Supabase belum dikonfigurasi.");

      await Promise.race([
        (async () => {
          const { error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (loginError) throw loginError;
        })(),
        timeout,
      ]);

      setLoading(false);
      router.push(redirectTo);
      router.refresh();
    } catch (loginError) {
      console.error("Login error:", loginError);
      setError(loginError instanceof Error ? loginError.message : "Login gagal.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-10">
      <section className="w-full rounded-xl border border-zinc-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-900/70">
        <h1 className="text-2xl font-black text-zinc-950 dark:text-white">Login</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Masuk untuk memberi reaction dan komentar.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="mt-2 h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-cyan-400 dark:border-white/10 dark:bg-zinc-950 dark:text-white"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="mt-2 h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-cyan-400 dark:border-white/10 dark:bg-zinc-950 dark:text-white"
            />
          </label>

          {error ? <p className="text-sm font-semibold text-red-500">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-lg bg-cyan-400 px-4 text-sm font-bold text-zinc-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Masuk..." : "Login"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Belum punya akun?{" "}
          <Link href="/register" className="font-bold text-cyan-600 dark:text-cyan-300">
            Register
          </Link>
        </p>
      </section>
    </div>
  );
}

function createAuthTimeout() {
  return new Promise<never>((_, reject) => {
    window.setTimeout(() => {
      reject(new Error("Request timeout. Coba lagi."));
    }, 15_000);
  });
}
