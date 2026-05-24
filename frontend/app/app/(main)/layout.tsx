import MainLayoutShell from "@/components/layouts/MainLayoutShell";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayoutShell>{children}</MainLayoutShell>;
}
