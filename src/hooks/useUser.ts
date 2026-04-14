import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { AuthUser } from "@supabase/supabase-js";

export function useUser() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
  }, []);

  return { user, loading };
}