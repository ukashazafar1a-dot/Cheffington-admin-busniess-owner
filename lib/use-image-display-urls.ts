"use client";

import { useEffect, useState } from "react";
import { APIClient } from "@/lib/api-client";

export function useImageDisplayUrls(urls: string[]) {
  const [displayByStored, setDisplayByStored] = useState<Record<string, string>>(
    {}
  );

  // Stable dependency — callers often pass a new array literal each render.
  const key = (urls || []).filter(Boolean).join("\n");

  useEffect(() => {
    const list = key ? key.split("\n").filter(Boolean) : [];
    if (list.length === 0) {
      // Avoid setState when already empty (prevents update-depth loops).
      setDisplayByStored((prev) =>
        Object.keys(prev).length === 0 ? prev : {}
      );
      return;
    }

    let cancelled = false;

    APIClient.resolveImageDisplayUrls(list)
      .then((resolved) => {
        if (cancelled) return;
        const next: Record<string, string> = {};
        for (const item of resolved) {
          next[item.stored] = item.display;
        }
        setDisplayByStored(next);
      })
      .catch(() => {
        if (!cancelled) {
          setDisplayByStored((prev) =>
            Object.keys(prev).length === 0 ? prev : {}
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [key]);

  const displayUrl = (stored: string) => displayByStored[stored] || stored;

  const setDisplayUrl = (stored: string, display: string) => {
    setDisplayByStored((prev) => ({ ...prev, [stored]: display }));
  };

  return { displayUrl, setDisplayUrl };
}
