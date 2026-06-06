"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { fetchMe } from "@/lib/api";

const ALLOWED = new Set(["FACULTY", "PRINCIPAL"]);

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const access  = params.get("accessToken");
    const refresh = params.get("refreshToken");

    if (access && refresh) {
      localStorage.setItem("faculty_accessToken", access);
      localStorage.setItem("faculty_refreshToken", refresh);
      window.history.replaceState(null, "", window.location.pathname);

      fetchMe()
        .then((user) => {
          if (!ALLOWED.has(user.role)) {
            localStorage.removeItem("faculty_accessToken");
            localStorage.removeItem("faculty_refreshToken");
            alert("This portal is for faculty and principal accounts only.");
            return;
          }
          router.replace("/");
        })
        .catch(() => router.replace("/"));
    }
  }, [router]);

  const handleLogin = () => {
    const server = process.env.NEXT_PUBLIC_SERVER_ADDRESS;
    if (server) {
      window.location.href = `${server}/api/v1/auth/google`;
    } else {
      localStorage.setItem("faculty_accessToken", "dev");
      router.replace("/");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen gap-16 p-8 bg-background">
      <Image src="/EventioLogo.svg" alt="Eventio" width={80} height={80} priority />

      <div className="flex flex-col items-center text-center gap-1">
        <p className="text-sky-500 text-4xl font-semibold">Eventio</p>
        <p className="text-sm text-muted-foreground">Faculty & Principal Portal · CSI KJSCE</p>
      </div>

      <button
        onClick={handleLogin}
        className="flex items-center gap-3 px-6 py-4 border-2 border-sky-500 rounded-2xl text-sky-600 dark:text-sky-400 text-base font-semibold hover:bg-sky-500/10 active:scale-95 transition-all"
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
