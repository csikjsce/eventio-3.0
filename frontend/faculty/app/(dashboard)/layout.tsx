"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import MobileHeader from "@/components/MobileHeader";
import Loader from "@/components/Loader";
import { DataProvider } from "@/contexts/DataContext";
import { fetchMe } from "@/lib/api";

const ALLOWED = new Set(["FACULTY", "PRINCIPAL"]);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady]       = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("faculty_accessToken");
    if (!token) {
      router.replace("/login");
      return;
    }

    fetchMe()
      .then((user) => {
        if (!ALLOWED.has(user.role)) {
          localStorage.removeItem("faculty_accessToken");
          localStorage.removeItem("faculty_refreshToken");
          router.replace("/login");
          return;
        }
        setReady(true);
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  if (!ready) return <Loader />;

  return (
    <DataProvider>
      <div className="flex min-h-screen bg-background">
        <div className="hidden lg:flex lg:fixed lg:inset-y-0 lg:w-64 lg:z-30">
          <Sidebar />
        </div>

        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <div className="relative z-10 h-full"><Sidebar onClose={() => setSidebarOpen(false)} /></div>
          </div>
        )}

        <div className="flex flex-col flex-1 lg:ml-64 min-h-screen">
          <MobileHeader onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </DataProvider>
  );
}
