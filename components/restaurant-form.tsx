"use client";

import { useState } from "react";
import type { ContentSection, Restaurant, RestaurantFormData } from "@/lib/types";
import { RestaurantSidebarFields } from "./restaurant-sidebar-fields";
import { RestaurantContentSectionsEditor } from "./restaurant-content-sections-editor";

const emptyForm: RestaurantFormData = {
  name: "",
  description: "",
  cuisine: "",
  tagline: "",
  phone: "",
  website: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  zipCode: "",
  country: "",
  images: [],
  logoUrl: "",
  contentSections: [],
  status: "pending_review",
};

function preparePayload(form: RestaurantFormData): RestaurantFormData {
  return {
    ...form,
    logoUrl: (form.logoUrl ?? "").trim(),
    images: (form.images ?? []).map((u) => u.trim()).filter(Boolean),
    contentSections: (form.contentSections ?? [])
      .map((s, i) => ({
        heading: s.heading.trim(),
        body: (s.body ?? "").trim(),
        images: (s.images ?? []).map((u) => u.trim()).filter(Boolean),
        order: i,
        ...(s._id ? { _id: s._id } : {}),
      }))
      .filter((s) => s.heading),
  };
}

type Props = {
  initial?: Partial<Restaurant>;
  restaurantId?: string;
  onSubmit: (data: RestaurantFormData) => Promise<void>;
  submitLabel?: string;
};

export function RestaurantForm({
  initial,
  restaurantId,
  onSubmit,
  submitLabel = "Save",
}: Props) {
  const [form, setForm] = useState<RestaurantFormData>({
    ...emptyForm,
    ...initial,
    images: initial?.images ?? [],
    logoUrl: initial?.logoUrl ?? "",
    contentSections: (initial?.contentSections ?? []).map((s, i) => ({
      ...s,
      order: s.order ?? i,
    })),
    status: initial?.status ?? "pending_review",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canPublish =
    Boolean(restaurantId) && initial?.ownerListingApproved !== false;
  const isRejected = form.status === "rejected";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onSubmit(preparePayload(form));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      {isRejected ? (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-950">
          <p className="font-medium">This listing was not approved.</p>
          {initial?.listingReviewNote ? (
            <p className="mt-1">{initial.listingReviewNote}</p>
          ) : null}
          <p className="mt-2">
            Update the details and set status to &quot;Submit for review&quot;
            to send it again.
          </p>
        </div>
      ) : null}
      <RestaurantSidebarFields
        form={form}
        restaurantId={restaurantId}
        canPublish={canPublish}
        onChange={handleChange}
        onImagesChange={(images) => setForm((prev) => ({ ...prev, images }))}
        onLogoChange={(logoUrl) => setForm((prev) => ({ ...prev, logoUrl }))}
      />
      <RestaurantContentSectionsEditor
        sections={form.contentSections ?? []}
        restaurantId={restaurantId}
        restaurantName={form.name?.trim() || ""}
        onChange={(contentSections: ContentSection[]) =>
          setForm((prev) => ({ ...prev, contentSections }))
        }
      />
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="bg-[#ff8400] text-black font-semibold px-6 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
