"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase/client";
import type { CommentTarget } from "@/types/supabase";

export default function CommentForm({
  targetType,
  comicSlug,
  chapterSlug,
  onCreated,
}: {
  targetType: CommentTarget["targetType"];
  comicSlug: string;
  chapterSlug?: string;
  onCreated: () => void;
}) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = content.trim();
    setError("");

    if (!user) return;
    if (!supabase) {
      setError("Supabase belum dikonfigurasi.");
      return;
    }
    if (!text) {
      setError("Komentar tidak boleh kosong.");
      return;
    }

    try {
      setLoading(true);
      const { error: insertError } = await supabase.from("comments").insert({
        target_type: targetType,
        comic_slug: comicSlug,
        chapter_slug: targetType === "chapter" ? chapterSlug || null : null,
        user_id: user.id,
        content: text,
      });

      if (insertError) throw insertError;

      setContent("");
      onCreated();
    } catch (commentError) {
      setError(
        commentError instanceof Error ? commentError.message : "Komentar gagal dikirim."
      );
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-4 py-5 text-sm text-zinc-600 dark:border-white/15 dark:bg-white/[0.03] dark:text-zinc-400">
        <Link href={loginHref(comicSlug, chapterSlug)} className="font-bold text-cyan-600 dark:text-cyan-300">
          Login
        </Link>{" "}
        untuk menulis komentar.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value.slice(0, 500))}
        maxLength={500}
        placeholder="Tulis komentar..."
        className="min-h-28 w-full resize-y rounded-lg border border-zinc-200 bg-white p-3 text-sm text-zinc-950 outline-none transition focus:border-cyan-400 dark:border-white/10 dark:bg-zinc-950/70 dark:text-white"
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-semibold text-zinc-500">
          {content.length}/500 karakter
        </span>
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-bold text-zinc-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Mengirim..." : "Kirim komentar"}
        </button>
      </div>
      {error ? <p className="text-sm font-semibold text-red-500">{error}</p> : null}
    </form>
  );
}

function loginHref(comicSlug: string, chapterSlug?: string) {
  const redirect = chapterSlug
    ? `/baca/${comicSlug}/${chapterSlug}`
    : `/komik/${comicSlug}`;

  return `/login?redirect=${encodeURIComponent(redirect)}`;
}
