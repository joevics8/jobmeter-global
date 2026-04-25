"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowLeft } from "lucide-react";
import { theme } from "@/lib/theme";
import SignInModal from "@/components/SignInModal";

export default function AuthPage() {
  const router = useRouter();
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(true);

  const handleClose = () => {
    router.back();
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: theme.colors.primary.DEFAULT }}
    >
      <div className="w-full max-w-md">
        <button
          onClick={handleClose}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <div className="bg-white rounded-xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to JobMeter
            </h1>
            <p className="text-gray-600">
              Sign in to get personalized job matches
            </p>
          </div>

          <SignInModal
            open={isSignInModalOpen}
            onOpenChange={(open) => {
              setIsSignInModalOpen(open);
              if (!open) {
                handleClose();
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
