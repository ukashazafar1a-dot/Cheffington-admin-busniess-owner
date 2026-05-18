"use client";

import type { RestaurantFormData } from "@/lib/types";

type Props = {
  form: RestaurantFormData;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  onImagesChange: (images: string[]) => void;
};

export function RestaurantSidebarFields({ form, onChange, onImagesChange }: Props) {
  type SidebarFieldKey = Exclude<
    keyof RestaurantFormData,
    "images" | "contentSections" | "status"
  >;

  const field = (name: SidebarFieldKey, label: string, required = false) => (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        name={name}
        value={String(form[name] ?? "")}
        onChange={onChange}
        required={required}
        className="w-full border border-gray-300 rounded px-3 py-2"
      />
    </div>
  );

  const addHeroImage = () => onImagesChange([...(form.images ?? []), ""]);
  const updateHeroImage = (index: number, value: string) => {
    const images = [...(form.images ?? [])];
    images[index] = value;
    onImagesChange(images);
  };
  const removeHeroImage = (index: number) => {
    onImagesChange((form.images ?? []).filter((_, i) => i !== index));
  };

  return (
    <div className="mb-8 pb-8 border-b border-gray-200">
      <h2 className="text-lg font-bold mb-1">Listing details</h2>
      <p className="text-sm text-gray-600 mb-4">
        Sidebar info and hero: name, contact, address, top photos.
      </p>

      {field("name", "Restaurant name (title)", true)}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Short description (optional — list preview only)
        </label>
        <textarea
          name="description"
          value={form.description ?? ""}
          onChange={onChange}
          rows={2}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>
      {field("cuisine", "Cuisine / tagline")}
      {field("phone", "Phone")}
      {field("website", "Website")}
      {field("addressLine1", "Address line 1", true)}
      {field("addressLine2", "Address line 2")}
      <div className="grid grid-cols-2 gap-4">
        {field("city", "City", true)}
        {field("state", "State", true)}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {field("zipCode", "Zip code", true)}
        {field("country", "Country", true)}
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium">Hero photos (URLs)</label>
          <button
            type="button"
            onClick={addHeroImage}
            className="text-xs text-[#ff8400] font-semibold"
          >
            + Add photo URL
          </button>
        </div>
        {(form.images ?? []).map((url, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="url"
              value={url}
              onChange={(e) => updateHeroImage(index, e.target.value)}
              placeholder="https://example.com/hero.jpg"
              className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => removeHeroImage(index)}
              className="px-2 text-red-600"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Status</label>
        <select
          name="status"
          value={form.status}
          onChange={onChange}
          className="w-full border border-gray-300 rounded px-3 py-2"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>
    </div>
  );
}
