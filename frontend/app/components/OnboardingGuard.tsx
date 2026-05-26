"use client";

import { useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { UserDataContext } from "@/contexts/userContext";

/**
 * Placed on the home page (/).
 * - If returning from OAuth (accessToken in URL params), stores tokens and
 *   decides whether to show onboarding or go straight home.
 * - If logged in but not yet onboarded, redirects to /onboarding.
 * - Auth guard (no token → /login) is handled by MainLayoutShell.
 *
 * Onboarding is considered complete when EITHER:
 *   a) localStorage has "eventio-onboarded" = "true"  (set by the onboarding flow or
 *      auto-detected from a complete API profile), OR
 *   b) The /me API returned a user with degree + college already filled in
 *      (auto-stamps localStorage so new devices skip re-onboarding).
 */
export default function OnboardingGuard() {
  const router = useRouter();
  const { userData } = useContext(UserDataContext);

  // Handle OAuth callback tokens that land on /
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
    }
  }, [router]);

  // Once /me resolves, decide if onboarding is needed.
  // userData === null means still loading; undefined or object means resolved.
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return; // auth guard handles this

    const alreadyOnboarded = !!localStorage.getItem("eventio-onboarded");
    if (alreadyOnboarded) return; // nothing to do

    // Still waiting for /me to come back — don't redirect yet
    if (userData === null) return;

    // Profile returned from API — check if it's complete
    const profileComplete = !!(userData?.degree && userData?.college);
    if (profileComplete) {
      // Auto-stamp so future page loads don't re-check
      localStorage.setItem("eventio-onboarded", "true");
    } else {
      router.replace("/onboarding");
    }
  }, [userData, router]);

  return null;
}
