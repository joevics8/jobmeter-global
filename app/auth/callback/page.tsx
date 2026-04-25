"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // With implicit flow, Supabase automatically parses the hash fragment
    // (#access_token=...) because detectSessionInUrl: true is set in supabase.ts.
    // We just need to wait for the SIGNED_IN event, then redirect.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          subscription.unsubscribe();

          const { data: onboarding } = await supabase
            .from("onboarding_data")
            .select("user_id")
            .eq("user_id", session.user.id)
            .single();

          router.replace(onboarding ? "/jobs" : "/onboarding");
        }
      }
    );

    // Safety fallback: if no SIGNED_IN fires within 5s, go to login
    const timeout = setTimeout(() => {
      subscription.unsubscribe();
      router.replace("/login");
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4" />
        <p className="text-slate-600">Signing you in...</p>
      </div>
    </div>
  );
}