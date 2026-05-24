export type ReactionType = "like" | "love" | "laugh" | "wow" | "sad";
export type CommentTargetType = "comic" | "chapter";

export type CommentTarget = {
  targetType: CommentTargetType;
  comicSlug: string;
  chapterSlug?: string;
};

export type Profile = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string | null;
};

export type Comment = {
  id: string;
  comic_slug: string;
  chapter_slug: string | null;
  target_type: CommentTargetType;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string | null;
};

export type Reaction = {
  id: string;
  comic_slug: string;
  chapter_slug: string | null;
  target_type: CommentTargetType;
  user_id: string;
  reaction_type: ReactionType;
  created_at: string | null;
};

export type Bookmark = {
  id: string;
  user_id: string;
  comic_slug: string;
  title: string;
  cover: string | null;
  type: string | null;
  genre: string | null;
  latest_chapter_title: string | null;
  latest_chapter_slug: string | null;
  created_at: string | null;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          username?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string | null;
        };
        Update: Partial<Omit<Profile, "id" | "created_at">>;
        Relationships: [];
      };
      comments: {
        Row: Comment;
        Insert: {
          id?: string;
          comic_slug: string;
          chapter_slug?: string | null;
          target_type?: CommentTargetType;
          user_id: string;
          content: string;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          content?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      reactions: {
        Row: Reaction;
        Insert: {
          id?: string;
          comic_slug: string;
          chapter_slug?: string | null;
          target_type?: CommentTargetType;
          user_id: string;
          reaction_type: ReactionType;
          created_at?: string | null;
        };
        Update: {
          reaction_type?: ReactionType;
        };
        Relationships: [];
      };
      bookmarks: {
        Row: Bookmark;
        Insert: {
          id?: string;
          user_id: string;
          comic_slug: string;
          title: string;
          cover?: string | null;
          type?: string | null;
          genre?: string | null;
          latest_chapter_title?: string | null;
          latest_chapter_slug?: string | null;
          created_at?: string | null;
        };
        Update: {
          title?: string;
          cover?: string | null;
          type?: string | null;
          genre?: string | null;
          latest_chapter_title?: string | null;
          latest_chapter_slug?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
