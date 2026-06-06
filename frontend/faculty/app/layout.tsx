import type { Metadata } from "next";
import { Fira_Sans } from "next/font/google";
import ThemeProvider, { ThemeScript } from "@/components/ThemeProvider";
import "./globals.css";

const fira = Fira_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Eventio — Faculty Portal",
  description: "Review and approve campus events at KJSCE",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fira.variable} h-full antialiased`}>
      <head><ThemeScript /></head>
      <body className="min-h-full font-sans">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
