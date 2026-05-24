"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Placed at the top of the main layout root page.
 * - If returning from OAuth (accessToken in URL params), stores tokens and
 *   decides whether to show onboarding or go straight home.
 * - If first-time visitor with no onboarding flag, redirects to /onboarding.
 */
export default function OnboardingGuard() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");

    if (accessToken && refreshToken) {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      window.history.replaceState(null, "", window.location.pathname);

      const onboarded = localStorage.getItem("eventio-onboarded");
      if (!onboarded) {
        router.replace("/onboarding");
      }
      return;
    }

    const onboarded = localStorage.getItem("eventio-onboarded");
    if (!onboarded) {
      router.replace("/onboarding");
    }
  }, [router]);

  return null;
}
