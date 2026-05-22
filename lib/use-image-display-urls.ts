"use client";

import { useEffect, useState } from "react";
import { APIClient } from "@/lib/api-client";

export function useImageDisplayUrls(urls: string[]) {
  const [displayByStored, setDisplayByStored] = useState<Record<string, string>>(
    {}
  );

  const key = urls.filter(Boolean).join("\n");

  useEffect(() => {
    const list = urls.filter(Boolean);
    if (list.length === 0) {
      setDisplayByStored({});
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
        if (!cancelled) setDisplayByStored({});
      });

    return () => {
      cancelled = true;
    };
  }, [key, urls]);

  const displayUrl = (stored: string) => displayByStored[stored] || stored;

  const setDisplayUrl = (stored: string, display: string) => {
    setDisplayByStored((prev) => ({ ...prev, [stored]: display }));
  };

  return { displayUrl, setDisplayUrl };
}
