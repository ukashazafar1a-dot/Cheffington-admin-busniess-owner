"use client";

import type { RestaurantFormData } from "@/lib/types";
import { useImageDisplayUrls } from "@/lib/use-image-display-urls";
import { RestaurantImageUpload } from "./restaurant-image-upload";

type Props = {
  form: RestaurantFormData;
  restaurantId?: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  onImagesChange: (images: string[]) => void;
};

export function RestaurantSidebarFields({
  form,
  restaurantId,
  onChange,
  onImagesChange,
}: Props) {
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

  const removeHeroImage = (index: number) => {
    onImagesChange((form.images ?? []).filter((_, i) => i !== index));
  };

  const { displayUrl, setDisplayUrl } = useImageDisplayUrls(form.images ?? []);
  const canUpload = Boolean(restaurantId && form.name?.trim());

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
      {field("addressLine1", "Address line 1")}
      {field("addressLine2", "Address line 2")}
      <div className="grid grid-cols-2 gap-4">
        {field("city", "City")}
        {field("state", "State")}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {field("zipCode", "Zip code")}
        {field("country", "Country")}
      </div>

      <div className="mb-4">
        <label className="text-sm font-medium block mb-2">Hero photos</label>

        {!restaurantId && (
          <p className="text-sm text-gray-500 mb-2">
            Save the restaurant first, then add photos on the edit page.
          </p>
        )}

        {restaurantId && !form.name?.trim() && (
          <p className="text-sm text-amber-700 mb-2">
            Enter a restaurant name before uploading photos.
          </p>
        )}

        {canUpload && (
          <RestaurantImageUpload
            restaurantId={restaurantId!}
            restaurantName={form.name.trim()}
            kind="hero"
            label="+ Upload hero photo"
            onUploaded={(publicUrl, previewUrl) => {
              setDisplayUrl(publicUrl, previewUrl);
              onImagesChange([...(form.images ?? []), publicUrl]);
            }}
          />
        )}

        {(form.images ?? []).map((url, index) => (
          <div key={`${url}-${index}`} className="flex gap-2 mb-3 items-start">
            <div className="w-20 h-20 shrink-0 rounded overflow-hidden bg-gray-100 border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayUrl(url)}
                alt={`Hero ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-600 break-all">{url}</p>
            </div>
            <button
              type="button"
              onClick={() => removeHeroImage(index)}
              className="px-2 text-red-600 shrink-0"
              aria-label="Remove photo"
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
