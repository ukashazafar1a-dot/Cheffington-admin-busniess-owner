"use client";

import type { ContentSection } from "@/lib/types";
import { ContentSectionFields } from "./content-section-fields";

type Props = {
  sections: ContentSection[];
  onChange: (sections: ContentSection[]) => void;
};

function normalizeOrder(sections: ContentSection[]) {
  return sections.map((s, i) => ({ ...s, order: i }));
}

export function RestaurantContentSectionsEditor({ sections, onChange }: Props) {
  const addSection = () => {
    onChange(
      normalizeOrder([
        ...sections,
        { heading: "", body: "", images: [], order: sections.length },
      ])
    );
  };

  const updateSection = (index: number, section: ContentSection) => {
    const next = [...sections];
    next[index] = section;
    onChange(normalizeOrder(next));
  };

  const removeSection = (index: number) => {
    onChange(normalizeOrder(sections.filter((_, i) => i !== index)));
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(normalizeOrder(next));
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-bold">Page sections</h2>
          <p className="text-sm text-gray-600">
            Main content: headings, text, and images (shown on the public page).
          </p>
        </div>
        <button
          type="button"
          onClick={addSection}
          className="bg-[#ff8400] text-black font-semibold px-4 py-2 rounded text-sm"
        >
          + Add section
        </button>
      </div>

      {sections.length === 0 ? (
        <p className="text-sm text-gray-500 border border-dashed border-gray-300 rounded p-4">
          No sections yet. Add a section for About, Gallery, Menu, etc.
        </p>
      ) : (
        sections.map((section, index) => (
          <ContentSectionFields
            key={section._id ?? `section-${index}`}
            section={section}
            index={index}
            total={sections.length}
            onChange={updateSection}
            onRemove={removeSection}
            onMoveUp={(i) => move(i, -1)}
            onMoveDown={(i) => move(i, 1)}
          />
        ))
      )}
    </div>
  );
}
