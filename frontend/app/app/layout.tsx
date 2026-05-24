import type { Metadata } from "next";
import { Fira_Sans, Marcellus, Poppins } from "next/font/google";
import "./globals.css";
import AppProviders from "@/providers/app-providers";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-family-poppins",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const firaSans = Fira_Sans({
  subsets: ["latin"],
  variable: "--font-family-fira",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const marcellus = Marcellus({
  subsets: ["latin"],
  variable: "--font-family-marcellus",
  weight: "400",
});

export const metadata: Metadata = {
  title: "Eventio",
  description: "KJSCE campus events — student portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${firaSans.variable} ${marcellus.variable} h-full antialiased`}
    >
      <head>
        {/* Apply saved theme before first paint — prevents flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('eventio-theme')||'dark';if(t!=='system')document.documentElement.classList.add(t);})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
