"use client";

import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Profile } from "@/types/supabase";

type AuthState = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      if (!supabase) {
        if (!active) return;
        setLoading(false);
        return;
      }

      const { data } = await supabase.auth.getUser();
      if (!active) return;

      setUser(data.user);
      if (data.user) {
        await loadProfile(data.user.id, active);
      } else {
        setProfile(null);
      }

      if (active) setLoading(false);
    }

    async function loadProfile(userId: string, isActive: boolean) {
      if (!supabase) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (isActive) setProfile(data);
    }

    loadSession();

    const subscription = supabase?.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await loadProfile(session.user.id, true);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      active = false;
      subscription?.data.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  return { user, profile, loading, signOut };
}
