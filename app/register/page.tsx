"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import SuccessModal from "@/components/SuccessModal";
import { supabase } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccessOpen(false);

    if (!supabase) {
      setError("Supabase belum dikonfigurasi.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const cleanedUsername = username.trim().toLowerCase();
      const name = displayName.trim() || cleanedUsername || email.split("@")[0];
      const { data, error: registerError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: cleanedUsername,
            display_name: name,
          },
        },
      });

      if (registerError) throw registerError;

      if (process.env.NODE_ENV === "development") {
        console.log("signup data", data);
      }

      if (data.user) {
        const { error: profileError } = await supabase.from("profiles").upsert({
          id: data.user.id,
          username: cleanedUsername || null,
          display_name: name,
          avatar_url: null,
        });

        if (process.env.NODE_ENV === "development") {
          console.log("profile error", profileError);
        }

        if (profileError) throw profileError;
      }

      await supabase.auth.signOut();
      setLoading(false);
      router.refresh();
      setSuccessOpen(true);
    } catch (registerError) {
      setError(
        registerError instanceof Error ? registerError.message : "Registrasi gagal."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SuccessModal
        open={successOpen}
        title="Registrasi berhasil"
        description="Akun kamu berhasil dibuat. Silakan login untuk melanjutkan."
        buttonLabel="Login sekarang"
        onConfirm={() => router.push("/login")}
      />
      <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-10">
        <section className="w-full rounded-xl border border-zinc-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-900/70">
        <h1 className="text-2xl font-black text-zinc-950 dark:text-white">
          Register
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Buat akun FaruScan untuk komentar dan reaction.
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
              minLength={6}
              required
              className="mt-2 h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-cyan-400 dark:border-white/10 dark:bg-zinc-950 dark:text-white"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Username
            </span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="faru_reader"
              className="mt-2 h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-cyan-400 dark:border-white/10 dark:bg-zinc-950 dark:text-white"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Display name
            </span>
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Nama tampil"
              className="mt-2 h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition focus:border-cyan-400 dark:border-white/10 dark:bg-zinc-950 dark:text-white"
            />
          </label>

          {error ? <p className="text-sm font-semibold text-red-500">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-lg bg-cyan-400 px-4 text-sm font-bold text-zinc-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Mendaftarkan..." : "Register"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-bold text-cyan-600 dark:text-cyan-300">
            Login
          </Link>
        </p>
      </section>
    </div>
    </>
  );
}
