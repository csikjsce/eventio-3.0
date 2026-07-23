"use client";

import Image from "next/image";
import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserDataContext } from "@/contexts/userContext";
import { fetchMe } from "@/lib/api";

function isProfileComplete(user: { degree?: unknown; college?: unknown } | null) {
  return !!(user?.degree && user?.college);
}

export default function LoginScreen() {
  const router = useRouter();
  const { userData, setUserData } = useContext(UserDataContext);

  // Parse OAuth callback tokens that land on /login?accessToken=...&refreshToken=...
  useEffect(() => {
    let cancelled = false;

    async function handleOAuthCallback() {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    const nextPath = params.get("next");

    // If there's a ?next= param, stash it before the OAuth redirect wipes search params
    if (nextPath) {
      sessionStorage.setItem("login_redirect", nextPath);
    }

    if (accessToken && refreshToken) {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      // Clean the URL
      window.history.replaceState(null, "", window.location.pathname);

      const redirect = sessionStorage.getItem("login_redirect");
      sessionStorage.removeItem("login_redirect");

      if (redirect) {
        router.replace(redirect);
        return;
      }

      const user = userData ?? (await fetchMe());
      if (cancelled) return;

      setUserData?.(user);

      if (isProfileComplete(user)) {
        localStorage.setItem("eventio-onboarded", "true");
        router.replace("/");
      } else {
        localStorage.removeItem("eventio-onboarded");
        router.replace("/onboarding");
      }
    }
    }

    handleOAuthCallback().catch(() => {
      if (!cancelled) router.replace("/onboarding");
    });

    return () => {
      cancelled = true;
    };
  }, [router, setUserData, userData]);

  const handleGoogleLogin = () => {
    const server = process.env.NEXT_PUBLIC_SERVER_ADDRESS;
    if (server) {
      window.location.href = `${server}/api/v1/auth/google`;
    } else {
      // Dev fallback — skip auth
      localStorage.setItem("eventio-onboarded", "true");
      const redirect = sessionStorage.getItem("login_redirect");
      sessionStorage.removeItem("login_redirect");
      router.replace(redirect ?? "/");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen gap-16 p-4 bg-background">
      {/* Logo */}
      <div className="flex flex-col w-full h-44 items-center justify-end">
        <Image
          src="/EventioLogo.svg"
          alt="Eventio"
          width={80}
          height={80}
          priority
        />
      </div>

      {/* Title */}
      <div className="flex flex-col items-center text-center gap-1">
        <p className="font-marcellus text-primary text-3xl">Eventio</p>
        <p className="text-sm text-foreground font-poppins">By CSI-KJSCE</p>
      </div>

      {/* Google sign-in button */}
      <button
        onClick={handleGoogleLogin}
        className="flex items-center gap-3 p-4 outline outline-sky-500 rounded-xl text-sky-500 text-xl font-bold active:scale-95 transition-transform"
      >
        <Image
          src="https://docs.material-tailwind.com/icons/google.svg"
          alt="Google"
          width={24}
          height={24}
          unoptimized
        />
        Continue with Google
      </button>
    </div>
  );
}
