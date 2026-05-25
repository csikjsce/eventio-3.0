"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import MobileHeader from "@/components/MobileHeader";
import { DataProvider } from "@/contexts/DataContext";
import Loader from "@/components/Loader";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("council_accessToken");
    if (!token) router.replace("/login");
    else setReady(true);
  }, [router]);

  if (!ready) return <Loader />;

  return (
    <DataProvider>
      <div className="flex min-h-screen bg-bg transition-colors duration-200">
        {/* Desktop sidebar — always visible */}
        <div className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 lg:z-30">
          <Sidebar />
        </div>

        {/* Mobile sidebar — overlay drawer */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <div className="relative z-10 h-full">
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex flex-col flex-1 lg:ml-64 min-h-screen">
          {/* Mobile top header */}
          <div className="lg:hidden sticky top-0 z-20">
            <MobileHeader onMenuClick={() => setSidebarOpen(true)} />
          </div>
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </DataProvider>
  );
}
