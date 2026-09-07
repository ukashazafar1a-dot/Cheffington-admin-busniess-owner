"use client";

import type { RestaurantFormData } from "@/lib/types";
import { useImageDisplayUrls } from "@/lib/use-image-display-urls";
import { RestaurantImageUpload } from "./restaurant-image-upload";

type Props = {
  form: RestaurantFormData;
  restaurantId?: string;
  canPublish?: boolean;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  onImagesChange: (images: string[]) => void;
  onLogoChange: (logoUrl: string) => void;
};

export function RestaurantSidebarFields({
  form,
  restaurantId,
  canPublish = false,
  onChange,
  onImagesChange,
  onLogoChange,
}: Props) {
  type SidebarFieldKey = Exclude<
    keyof RestaurantFormData,
    "images" | "contentSections" | "status" | "logoUrl"
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

  const { displayUrl, setDisplayUrl } = useImageDisplayUrls([
    ...(form.images ?? []),
    ...(form.logoUrl ? [form.logoUrl] : []),
  ]);
  const canUpload = Boolean(restaurantId && form.name?.trim());
  const logoUrl = (form.logoUrl ?? "").trim();

  return (
    <div className="mb-8 pb-8 border-b border-gray-200">
      <h2 className="text-lg font-bold mb-1">Listing details</h2>
      <p className="text-sm text-gray-600 mb-4">
        Sidebar info and hero: name, contact, address, logo, and top photos.
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
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Cuisine type</label>
        <input
          name="cuisine"
          value={String(form.cuisine ?? "")}
          onChange={onChange}
          placeholder="Italian, Mexican, …"
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Tagline (optional)
        </label>
        <input
          name="tagline"
          value={String(form.tagline ?? "")}
          onChange={onChange}
          placeholder="Short slogan — not the cuisine type"
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>
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
        <label className="text-sm font-medium block mb-2">
          Logo / profile photo
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Circular photo shown next to the restaurant name on the public page.
        </p>

        {!restaurantId && (
          <p className="text-sm text-gray-500 mb-2">
            Save the restaurant first, then add a logo on the edit page.
          </p>
        )}

        {restaurantId && !form.name?.trim() && (
          <p className="text-sm text-amber-700 mb-2">
            Enter a restaurant name before uploading a logo.
          </p>
        )}

        {canUpload && !logoUrl && (
          <RestaurantImageUpload
            restaurantId={restaurantId!}
            restaurantName={form.name.trim()}
            kind="logo"
            label="+ Upload logo"
            onUploaded={(publicUrl, previewUrl) => {
              setDisplayUrl(publicUrl, previewUrl);
              onLogoChange(publicUrl);
            }}
          />
        )}

        {logoUrl ? (
          <div className="flex gap-2 mb-3 items-start">
            <div className="w-20 h-20 shrink-0 rounded-full overflow-hidden bg-gray-100 border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayUrl(logoUrl)}
                alt="Restaurant logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              {canUpload ? (
                <RestaurantImageUpload
                  restaurantId={restaurantId!}
                  restaurantName={form.name.trim()}
                  kind="logo"
                  label="+ Replace logo"
                  onUploaded={(publicUrl, previewUrl) => {
                    setDisplayUrl(publicUrl, previewUrl);
                    onLogoChange(publicUrl);
                  }}
                />
              ) : null}
              <button
                type="button"
                onClick={() => onLogoChange("")}
                className="text-xs text-red-600 font-semibold"
              >
                Remove logo
              </button>
            </div>
          </div>
        ) : null}
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
        {form.status === "pending_review" ? (
          <>
            <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
              Awaiting admin review
            </div>
            <p className="mt-1 text-xs text-gray-600">
              {restaurantId
                ? "Cheffington admin must approve before this listing can go live on the public site."
                : "After you save, this listing stays off the public site until Cheffington admin approves it."}
            </p>
          </>
        ) : (
          <>
            <select
              name="status"
              value={form.status}
              onChange={onChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              {form.status === "rejected" ? (
                <>
                  <option value="rejected">Rejected</option>
                  <option value="pending_review">Submit for review</option>
                </>
              ) : null}
              {canPublish ? (
                <>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </>
              ) : null}
              {!canPublish &&
              form.status !== "rejected" &&
              form.status !== "pending_review" ? (
                <option value="draft">Draft</option>
              ) : null}
            </select>
            {!canPublish && form.status === "rejected" ? (
              <p className="mt-1 text-xs text-gray-600">
                Choose &quot;Submit for review&quot; after fixing details to send
                it back to admin.
              </p>
            ) : null}
            {canPublish ? (
              <p className="mt-1 text-xs text-gray-600">
                Approved listings can be published, saved as draft, or archived.
              </p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
