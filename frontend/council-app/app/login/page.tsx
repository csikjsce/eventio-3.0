"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const access = params.get("accessToken");
    const refresh = params.get("refreshToken");
    if (access && refresh) {
      localStorage.setItem("council_accessToken", access);
      localStorage.setItem("council_refreshToken", refresh);
      window.history.replaceState(null, "", window.location.pathname);
      router.replace("/");
    }
  }, [router]);

  const handleLogin = () => {
    const server = process.env.NEXT_PUBLIC_SERVER_ADDRESS;
    if (server) {
      window.location.href = `${server}/api/v1/auth/google`;
    } else {
      localStorage.setItem("council_accessToken", "dev");
      router.replace("/");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen gap-16 p-8 bg-bg transition-colors">
      <div className="flex flex-col items-center justify-end h-44">
        <Image src="/EventioLogo.svg" alt="Eventio" width={80} height={80} priority />
      </div>

      <div className="flex flex-col items-center text-center gap-1">
        <p className="font-marcellus text-red-500 text-4xl">Eventio</p>
        <p className="text-sm text-muted-tx font-fira">Council Portal · By CSI-KJSCE</p>
      </div>

      <button
        onClick={handleLogin}
        className="flex items-center gap-3 px-6 py-4 border-2 border-sky-500 rounded-2xl text-sky-500 text-base font-fira font-semibold hover:bg-sky-500/10 active:scale-95 transition-all"
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
