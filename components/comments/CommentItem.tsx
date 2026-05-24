"use client";

import { Edit3, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { Comment, Profile } from "@/types/supabase";

export type CommentWithProfile = Comment & {
  profile?: Profile | null;
};

export default function CommentItem({
  comment,
  onDelete,
  onUpdate,
}: {
  comment: CommentWithProfile;
  onDelete: (id: string) => void;
  onUpdate: (id: string, content: string) => void;
}) {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.content);
  const owner = user?.id === comment.user_id;
  const displayName =
    comment.profile?.display_name ||
    comment.profile?.username ||
    `User ${comment.user_id.slice(0, 6)}`;

  function saveEdit() {
    const content = draft.trim();
    if (!content) return;
    onUpdate(comment.id, content);
    setEditing(false);
  }

  return (
    <article className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 transition hover:bg-zinc-100 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-zinc-950 dark:text-white">
            {displayName}
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {formatCommentTime(comment.created_at)}
          </p>
        </div>
        {owner ? (
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              onClick={() => setEditing((value) => !value)}
              className="flex size-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-white hover:text-cyan-600 dark:hover:bg-white/10 dark:hover:text-cyan-300"
              aria-label="Edit komentar"
            >
              {editing ? <X className="size-4" /> : <Edit3 className="size-4" />}
            </button>
            <button
              type="button"
              onClick={() => onDelete(comment.id)}
              className="flex size-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-white hover:text-red-600 dark:hover:bg-white/10 dark:hover:text-red-300"
              aria-label="Hapus komentar"
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>

      {editing ? (
        <div className="mt-3 space-y-2">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value.slice(0, 500))}
            maxLength={500}
            className="min-h-24 w-full resize-y rounded-lg border border-zinc-200 bg-white p-3 text-sm text-zinc-950 outline-none transition focus:border-cyan-400 dark:border-white/10 dark:bg-zinc-950/70 dark:text-white"
          />
          <button
            type="button"
            onClick={saveEdit}
            className="rounded-lg bg-cyan-400 px-3 py-2 text-xs font-bold text-zinc-950 transition hover:bg-cyan-300"
          >
            Simpan
          </button>
        </div>
      ) : (
        <p className="mt-3 whitespace-pre-line text-sm leading-6 text-zinc-700 dark:text-zinc-300">
          {comment.content}
        </p>
      )}
    </article>
  );
}

function formatCommentTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Baru saja";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
