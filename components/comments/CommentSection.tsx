"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Comment, CommentTarget, Profile } from "@/types/supabase";
import CommentForm from "./CommentForm";
import CommentItem, { type CommentWithProfile } from "./CommentItem";

export default function CommentSection({
  targetType,
  comicSlug,
  chapterSlug,
}: CommentTarget) {
  const [comments, setComments] = useState<CommentWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadComments() {
    if (!supabase) {
      setLoading(false);
      setError("Supabase belum dikonfigurasi.");
      return;
    }

    try {
      setLoading(true);
      let query = supabase
        .from("comments")
        .select("*")
        .eq("comic_slug", comicSlug)
        .eq("target_type", targetType);

      query =
        targetType === "chapter"
          ? query.eq("chapter_slug", chapterSlug || "")
          : query.is("chapter_slug", null);

      const { data, error: commentsError } = await query.order("created_at", {
        ascending: false,
      });

      if (commentsError) throw commentsError;

      const rows = data || [];
      const userIds = Array.from(new Set(rows.map((item) => item.user_id)));
      let profiles: Profile[] = [];

      if (userIds.length) {
        const { data: profileRows, error: profilesError } = await supabase
          .from("profiles")
          .select("*")
          .in("id", userIds);

        if (profilesError) throw profilesError;
        profiles = profileRows || [];
      }

      const profileMap = new Map(profiles.map((profile) => [profile.id, profile]));
      setComments(
        rows.map((comment) => ({
          ...comment,
          profile: profileMap.get(comment.user_id) || null,
        }))
      );
      setError("");
    } catch (commentError) {
      setError(
        commentError instanceof Error ? commentError.message : "Komentar gagal dimuat."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadComments();
    }, 0);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterSlug, comicSlug, targetType]);

  async function deleteComment(id: string) {
    if (!supabase) return;
    const { error: deleteError } = await supabase.from("comments").delete().eq("id", id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setComments((items) => items.filter((item) => item.id !== id));
  }

  async function updateComment(id: string, content: string) {
    if (!supabase) return;
    const { data, error: updateError } = await supabase
      .from("comments")
      .update({ content, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setComments((items) =>
      items.map((item) =>
        item.id === id
          ? ({ ...item, ...(data as Comment), profile: item.profile } as CommentWithProfile)
          : item
      )
    );
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-900/70 sm:p-5">
      <div className="mb-5">
        <h2 className="font-bold text-zinc-950 dark:text-white">Komentar</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Diskusi publik untuk {targetType === "chapter" ? "chapter ini" : "komik ini"}.
        </p>
      </div>

      <CommentForm
        targetType={targetType}
        comicSlug={comicSlug}
        chapterSlug={chapterSlug}
        onCreated={loadComments}
      />

      {error ? <p className="mt-4 text-sm font-semibold text-red-500">{error}</p> : null}

      <div className="mt-6 space-y-3">
        {loading ? (
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-5 text-sm font-semibold text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
            Memuat komentar...
          </div>
        ) : comments.length ? (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onDelete={deleteComment}
              onUpdate={updateComment}
            />
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-center dark:border-white/15 dark:bg-white/[0.03]">
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Belum ada komentar
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
