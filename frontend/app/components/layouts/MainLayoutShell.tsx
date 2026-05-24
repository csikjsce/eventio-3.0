"use client";

import FooterNav from "@/components/FooterNav";

export default function MainLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="min-h-screen bg-background px-4 pt-12 pb-4">{children}</div>
      <FooterNav />
    </>
  );
}
