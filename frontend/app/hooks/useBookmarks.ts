"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "eventio-bookmarks";

function readStorage(): number[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function useBookmarks() {
  const [bookmarked, setBookmarked] = useState<number[]>(readStorage);

  /* Persist every change */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarked));
  }, [bookmarked]);

  const isBookmarked = useCallback(
    (id: number) => bookmarked.includes(id),
    [bookmarked],
  );

  const toggle = useCallback((id: number) => {
    setBookmarked((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id],
    );
  }, []);

  return { bookmarked, isBookmarked, toggle };
}
