import { useEffect } from "react";

import { supabase } from "@/lib/supabase";
import { useRootStore } from "@/stores/root-store";

export const useSupabaseAuthListener = () => {
  const setSession = useRootStore((state) => state.setSession);

  useEffect(() => {
    // Don't call other supabase.auth methods inside this callback, it can deadlock.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [setSession]);
};
