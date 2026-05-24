"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { CommentTarget, Reaction, ReactionType } from "@/types/supabase";

const reactionOptions: { type: ReactionType; label: string }[] = [
  { type: "like", label: "👍" },
  { type: "love", label: "❤️" },
  { type: "laugh", label: "😂" },
  { type: "wow", label: "😮" },
  { type: "sad", label: "😔" },
];

export default function ReactionBar({
  targetType,
  comicSlug,
  chapterSlug,
}: CommentTarget) {
  const router = useRouter();
  const { user } = useAuth();
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const targetChapterSlug = targetType === "chapter" ? chapterSlug || "" : null;

  async function loadReactions() {
    if (!supabase) return;

    let query = supabase
      .from("reactions")
      .select("*")
      .eq("comic_slug", comicSlug)
      .eq("target_type", targetType);

    query =
      targetType === "chapter"
        ? query.eq("chapter_slug", targetChapterSlug || "")
        : query.is("chapter_slug", null);

    const { data, error: reactionError } = await query;

    if (reactionError) {
      setError(reactionError.message);
      return;
    }

    setError("");
    setReactions(data || []);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadReactions();
    }, 0);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comicSlug, targetChapterSlug, targetType]);

  const counts = useMemo(() => {
    return reactionOptions.reduce<Record<ReactionType, number>>(
      (acc, item) => {
        acc[item.type] = reactions.filter(
          (reaction) => reaction.reaction_type === item.type
        ).length;
        return acc;
      },
      { like: 0, love: 0, laugh: 0, wow: 0, sad: 0 }
    );
  }, [reactions]);

  const userReaction = reactions.find((reaction) => reaction.user_id === user?.id);

  async function toggleReaction(type: ReactionType) {
    if (!supabase) {
      setError("Supabase belum dikonfigurasi.");
      return;
    }

    if (!user) {
      router.push(loginHref(comicSlug, chapterSlug));
      return;
    }

    try {
      setLoading(true);
      setError("");

      if (userReaction?.reaction_type === type) {
        let deleteQuery = supabase
          .from("reactions")
          .delete()
          .eq("comic_slug", comicSlug)
          .eq("target_type", targetType)
          .eq("user_id", user.id);

        deleteQuery =
          targetType === "chapter"
            ? deleteQuery.eq("chapter_slug", targetChapterSlug || "")
            : deleteQuery.is("chapter_slug", null);

        const { error: deleteError } = await deleteQuery;
        if (deleteError) throw deleteError;
      } else if (userReaction) {
        let updateQuery = supabase
          .from("reactions")
          .update({ reaction_type: type })
          .eq("comic_slug", comicSlug)
          .eq("target_type", targetType)
          .eq("user_id", user.id);

        updateQuery =
          targetType === "chapter"
            ? updateQuery.eq("chapter_slug", targetChapterSlug || "")
            : updateQuery.is("chapter_slug", null);

        const { error: updateError } = await updateQuery;
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from("reactions").insert({
          target_type: targetType,
          comic_slug: comicSlug,
          chapter_slug: targetChapterSlug,
          user_id: user.id,
          reaction_type: type,
        });

        if (insertError) throw insertError;
      }

      await loadReactions();
    } catch (reactionError) {
      setError(
        reactionError instanceof Error ? reactionError.message : "Reaction gagal."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-900/70">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-bold text-zinc-950 dark:text-white">Reaction</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Pilih satu reaction untuk {targetType === "chapter" ? "chapter ini" : "komik ini"}.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {reactionOptions.map((item) => {
          const active = userReaction?.reaction_type === item.type;

          return (
            <button
              key={item.type}
              type="button"
              disabled={loading}
              onClick={() => toggleReaction(item.type)}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60",
                active
                  ? "border-cyan-400 bg-cyan-400 text-zinc-950"
                  : "border-zinc-200 bg-white text-zinc-800 hover:border-cyan-400 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:hover:bg-white/10"
              )}
            >
              <span>{item.label}</span>
              <span>{counts[item.type]}</span>
            </button>
          );
        })}
      </div>

      {error ? <p className="mt-3 text-sm font-semibold text-red-500">{error}</p> : null}
    </section>
  );
}

function loginHref(comicSlug: string, chapterSlug?: string) {
  const redirect = chapterSlug
    ? `/baca/${comicSlug}/${chapterSlug}`
    : `/komik/${comicSlug}`;

  return `/login?redirect=${encodeURIComponent(redirect)}`;
}
