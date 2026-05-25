"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FooterNav from "@/components/FooterNav";

export default function MainLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.replace("/login");
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) return null;

  return (
    <>
      <div className="min-h-screen bg-background px-4 pt-12 pb-4">{children}</div>
      <FooterNav />
    </>
  );
}
