"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Placed on the home page (/).
 * - If returning from OAuth (accessToken in URL params), stores tokens and
 *   decides whether to show onboarding or go straight home.
 * - If logged in but not yet onboarded, redirects to /onboarding.
 * - Auth guard (no token → /login) is handled by MainLayoutShell.
 */
export default function OnboardingGuard() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");

    if (accessToken && refreshToken) {
      // Returning from Google OAuth — save tokens and clean URL
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      window.history.replaceState(null, "", window.location.pathname);

      const onboarded = localStorage.getItem("eventio-onboarded");
      if (!onboarded) {
        router.replace("/onboarding");
      }
      return;
    }

    // Logged-in user who hasn't completed onboarding yet
    const token = localStorage.getItem("accessToken");
    if (token && !localStorage.getItem("eventio-onboarded")) {
      router.replace("/onboarding");
    }
  }, [router]);

  return null;
}
