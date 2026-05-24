import type { Metadata } from "next";
import { Fira_Sans, Marcellus } from "next/font/google";
import ThemeProvider, { ThemeScript } from "@/components/ThemeProvider";
import "./globals.css";

const firaSans = Fira_Sans({
  subsets: ["latin"],
  variable: "--font-family-fira",
  weight: ["300", "400", "500", "600", "700"],
});

const marcellus = Marcellus({
  subsets: ["latin"],
  variable: "--font-family-marcellus",
  weight: "400",
});

export const metadata: Metadata = {
  title: "Eventio — Council Portal",
  description: "KJSCE event management for council members",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${firaSans.variable} ${marcellus.variable} h-full antialiased`}>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full font-fira">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
