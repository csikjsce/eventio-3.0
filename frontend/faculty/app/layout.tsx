import type { Metadata } from "next";
import { Fira_Sans, Marcellus } from "next/font/google";
import ThemeProvider, { ThemeScript } from "@/components/ThemeProvider";
import "./globals.css";

const fira = Fira_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
});

const marcellus = Marcellus({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-family-marcellus",
});

export const metadata: Metadata = {
  title: "Eventio — Faculty Portal",
  description: "Review and approve campus events at KJSCE",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fira.variable} ${marcellus.variable} h-full antialiased`}>
      <head><ThemeScript /></head>
      <body className="min-h-full font-sans">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
