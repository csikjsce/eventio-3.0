"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LoginScreen() {
  const router = useRouter();

  const handleGoogleLogin = () => {
    /* In production: redirect to backend OAuth */
    const server = process.env.NEXT_PUBLIC_SERVER_ADDRESS;
    if (server) {
      window.location.href = `${server}/api/v1/auth/google`;
    } else {
      /* Dev fallback — skip auth and mark as onboarded */
      localStorage.setItem("eventio-onboarded", "true");
      router.replace("/");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen gap-16 p-8 bg-background">
      {/* Logo */}
      <div className="flex flex-col w-full items-center justify-end h-44">
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
        <p className="font-marcellus text-primary text-4xl">Eventio</p>
        <p className="text-sm text-mute font-poppins">By CSI-KJSCE</p>
      </div>

      {/* Google sign-in button */}
      <button
        onClick={handleGoogleLogin}
        className="flex items-center gap-3 px-6 py-4 border-2 border-sky-500 rounded-2xl text-sky-500 text-base font-poppins font-semibold active:scale-95 transition-transform"
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
