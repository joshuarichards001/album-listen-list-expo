import { useEffect } from "react";

import { queryClient } from "@/lib/query-client";
import { supabase } from "@/lib/supabase";
import { useRootStore } from "@/stores/root-store";

export const useSupabaseAuthListener = () => {
  const setSession = useRootStore((state) => state.setSession);

  useEffect(() => {
    // Don't call other supabase.auth methods inside this callback, it can deadlock.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) queryClient.clear();
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [setSession]);
};
