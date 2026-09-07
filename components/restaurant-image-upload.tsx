"use client";

import { useRef, useState } from "react";
import { APIClient, MAX_IMAGE_UPLOAD_BYTES } from "@/lib/api-client";

const IMAGE_UPLOAD_SPECS: Record<"hero" | "section" | "logo", string> = {
  hero: "JPEG, PNG, or WebP · max 5 MB · recommended 1600×900 px (16:9)",
  section: "JPEG, PNG, or WebP · max 5 MB · recommended 1200×800 px",
  logo: "JPEG, PNG, or WebP · max 5 MB · recommended 400×400 px (square)",
};

type Props = {
  restaurantId: string;
  restaurantName: string;
  kind: "hero" | "section" | "logo";
  onUploaded: (publicUrl: string, displayUrl: string) => void;
  disabled?: boolean;
  label?: string;
};

export function RestaurantImageUpload({
  restaurantId,
  restaurantName,
  kind,
  onUploaded,
  disabled = false,
  label = "Upload image",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file: File | undefined) => {
    if (!file || disabled) return;

    setError("");

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Use JPEG, PNG, or WebP only.");
      return;
    }

    if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
      setError("Image must be 5 MB or smaller.");
      return;
    }

    setLoading(true);
    try {
      const uploaded = await APIClient.uploadRestaurantImageFile(file, {
        restaurantId,
        restaurantName,
        kind,
      });

      onUploaded(uploaded.publicUrl, uploaded.displayUrl);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        disabled={disabled || loading}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => inputRef.current?.click()}
        className="text-xs text-[#ff8400] font-semibold disabled:opacity-50"
      >
        {loading ? "Uploading..." : label}
      </button>
      <p className="mt-1 text-xs leading-relaxed text-gray-500">
        {IMAGE_UPLOAD_SPECS[kind]}
      </p>
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  );
}
