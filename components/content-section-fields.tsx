"use client";

import type { ContentSection } from "@/lib/types";

type Props = {
  section: ContentSection;
  index: number;
  total: number;
  onChange: (index: number, section: ContentSection) => void;
  onRemove: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
};

export function ContentSectionFields({
  section,
  index,
  total,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: Props) {
  const update = (patch: Partial<ContentSection>) => {
    onChange(index, { ...section, ...patch });
  };

  const addImage = () => {
    update({ images: [...(section.images ?? []), ""] });
  };

  const updateImage = (imageIndex: number, value: string) => {
    const images = [...(section.images ?? [])];
    images[imageIndex] = value;
    update({ images });
  };

  const removeImage = (imageIndex: number) => {
    const images = (section.images ?? []).filter((_, i) => i !== imageIndex);
    update({ images });
  };

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
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium">Section images (URLs)</label>
          <button
            type="button"
            onClick={addImage}
            className="text-xs text-[#ff8400] font-semibold"
          >
            + Add image URL
          </button>
        </div>
        {(section.images ?? []).map((url, imageIndex) => (
          <div key={imageIndex} className="flex gap-2 mb-2">
            <input
              type="url"
              value={url}
              onChange={(e) => updateImage(imageIndex, e.target.value)}
              placeholder="https://example.com/photo.jpg"
              className="flex-1 border border-gray-300 rounded px-3 py-2 bg-white text-sm"
            />
            <button
              type="button"
              onClick={() => removeImage(imageIndex)}
              className="px-2 text-red-600 text-sm"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
