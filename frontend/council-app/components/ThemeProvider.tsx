"use client";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";
interface ThemeCtx { theme: Theme; toggle: () => void }

const Ctx = createContext<ThemeCtx>({ theme: "dark", toggle: () => {} });
export const useTheme = () => useContext(Ctx);

/** Inline script injected into <head> — runs before React hydrates.
 *  Reads localStorage and applies the dark class synchronously. */
export function ThemeScript() {
  const code = `(function(){
    try {
      var saved = localStorage.getItem('council-theme');
      var sys = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'dark';
      var theme = saved || sys;
      if (theme === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    } catch(e){}
  })();`;
  // dangerouslySetInnerHTML is intentional — this runs before hydration
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  /* Derive initial state from what ThemeScript already applied to <html> */
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  });

  /* Keep state in sync if something external changes the class */
  useEffect(() => {
    const obs = new MutationObserver(() => {
      setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    localStorage.setItem("council-theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
    setTheme(next);
  }

  return <Ctx.Provider value={{ theme, toggle }}>{children}</Ctx.Provider>;
}
