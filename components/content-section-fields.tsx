"use client";

import type { ContentSection } from "@/lib/types";
import { useImageDisplayUrls } from "@/lib/use-image-display-urls";
import { RestaurantImageUpload } from "./restaurant-image-upload";

type Props = {
  section: ContentSection;
  index: number;
  total: number;
  restaurantId?: string;
  restaurantName: string;
  onChange: (index: number, section: ContentSection) => void;
  onRemove: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
};

export function ContentSectionFields({
  section,
  index,
  total,
  restaurantId,
  restaurantName,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: Props) {
  const update = (patch: Partial<ContentSection>) => {
    onChange(index, { ...section, ...patch });
  };

  const removeImage = (imageIndex: number) => {
    const images = (section.images ?? []).filter((_, i) => i !== imageIndex);
    update({ images });
  };

  const { displayUrl, setDisplayUrl } = useImageDisplayUrls(section.images ?? []);
  const canUpload = Boolean(restaurantId && restaurantName.trim());

  return (
    <div className="border border-gray-300 rounded-lg p-4 mb-4 bg-gray-50">
      <div className="flex justify-between items-center mb-3">
        <span className="font-semibold text-sm">Section {index + 1}</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onMoveUp(index)}
            disabled={index === 0}
            className="text-xs px-2 py-1 border rounded disabled:opacity-40"
          >
            Up
          </button>
          <button
            type="button"
            onClick={() => onMoveDown(index)}
            disabled={index === total - 1}
            className="text-xs px-2 py-1 border rounded disabled:opacity-40"
          >
            Down
          </button>
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-xs px-2 py-1 border border-red-300 text-red-600 rounded"
          >
            Remove
          </button>
        </div>
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Heading *</label>
        <input
          value={section.heading}
          onChange={(e) => update({ heading: e.target.value })}
          required
          className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
        />
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Text</label>
        <textarea
          value={section.body ?? ""}
          onChange={(e) => update({ body: e.target.value })}
          rows={4}
          className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-2">Section images</label>

        {canUpload && (
          <RestaurantImageUpload
            restaurantId={restaurantId!}
            restaurantName={restaurantName}
            kind="section"
            label="+ Upload section image"
            onUploaded={(publicUrl, previewUrl) => {
              setDisplayUrl(publicUrl, previewUrl);
              update({ images: [...(section.images ?? []), publicUrl] });
            }}
          />
        )}

        {(section.images ?? []).map((url, imageIndex) => (
          <div
            key={`${url}-${imageIndex}`}
            className="flex gap-2 mb-3 items-start"
          >
            <div className="w-20 h-20 shrink-0 rounded overflow-hidden bg-gray-100 border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayUrl(url)}
                alt={`Section ${index + 1} image ${imageIndex + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-600 break-all">{url}</p>
            </div>
            <button
              type="button"
              onClick={() => removeImage(imageIndex)}
              className="px-2 text-red-600 text-sm shrink-0"
              aria-label="Remove image"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
