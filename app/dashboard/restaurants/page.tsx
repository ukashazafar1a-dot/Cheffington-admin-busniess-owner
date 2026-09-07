"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { APIClient } from "@/lib/api-client";
import type { Restaurant } from "@/lib/types";

function statusBadge(status: Restaurant["status"]) {
  const styles: Record<string, string> = {
    published: "bg-green-100 text-green-800",
    draft: "bg-yellow-100 text-yellow-800",
    pending_review: "bg-orange-100 text-orange-800",
    rejected: "bg-red-100 text-red-800",
    archived: "bg-gray-100 text-gray-700",
  };
  const labels: Record<string, string> = {
    published: "Approved · Published",
    draft: "Draft",
    pending_review: "Awaiting admin review",
    rejected: "Rejected",
    archived: "Archived",
  };
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-700"}`}
    >
      {labels[status] || status}
    </span>
  );
}

function statusHelp(status: Restaurant["status"]) {
  if (status === "pending_review") {
    return "Not on the public site yet. Cheffington admin will review this listing.";
  }
  if (status === "published") {
    return "Live on the public Cheffington site.";
  }
  if (status === "rejected") {
    return "Update details and submit for review again from the edit page.";
  }
  if (status === "draft") {
    return "Saved as draft — submit for review when ready.";
  }
  if (status === "archived") {
    return "Archived — not shown publicly.";
  }
  return "";
}

function RestaurantsPageContent() {
  const searchParams = useSearchParams();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSubmittedBanner, setShowSubmittedBanner] = useState(false);

  const load = async () => {
    try {
      const res = await APIClient.listRestaurants();
      setRestaurants(res.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (searchParams.get("submitted") === "1") {
      setShowSubmittedBanner(true);
      window.history.replaceState({}, "", "/dashboard/restaurants");
    }
  }, [searchParams]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this restaurant?")) return;
    try {
      await APIClient.deleteRestaurant(id);
      setRestaurants((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  };

  if (loading) return <p>Loading restaurants...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">My Restaurants</h1>
          <p className="text-sm text-gray-600 mt-1">
            Track each listing’s review status here after you create or update
            it.
          </p>
        </div>
        <Link
          href="/dashboard/restaurants/new"
          className="bg-[#ff8400] text-black font-semibold px-4 py-2 rounded"
        >
          Add restaurant
        </Link>
      </div>

      {showSubmittedBanner ? (
        <div className="mb-6 rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-950">
          <p className="font-semibold">Listing submitted for review</p>
          <p className="mt-1">
            Your restaurant is awaiting Cheffington admin approval. It will stay
            off the public site until it is approved and published. You will get
            an email when it is approved.
          </p>
        </div>
      ) : null}

      {restaurants.length === 0 ? (
        <p className="text-gray-600">No restaurants yet. Add your first one.</p>
      ) : (
        <ul className="space-y-4">
          {restaurants.map((r) => {
            const location = [r.city, r.state, r.country]
              .filter(Boolean)
              .join(", ");
            const help = statusHelp(r.status);
            return (
              <li
                key={r._id}
                className="border border-gray-200 rounded-lg p-4 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start"
              >
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-lg">{r.name}</h2>
                    {statusBadge(r.status)}
                  </div>
                  {location ? (
                    <p className="text-sm text-gray-600">{location}</p>
                  ) : null}
                  {r.cuisine ? (
                    <p className="text-sm text-gray-600">Cuisine: {r.cuisine}</p>
                  ) : null}
                  {help ? (
                    <p className="text-sm text-gray-500">{help}</p>
                  ) : null}
                  {r.status === "rejected" && r.listingReviewNote ? (
                    <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded px-3 py-2">
                      Admin note: {r.listingReviewNote}
                    </p>
                  ) : null}
                </div>
                <div className="flex gap-3 shrink-0">
                  <Link
                    href={`/dashboard/restaurants/${r._id}/edit`}
                    className="text-blue-600 text-sm font-medium"
                  >
                    View / Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(r._id)}
                    className="text-red-600 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function RestaurantsPage() {
  return (
    <Suspense fallback={<p>Loading restaurants...</p>}>
      <RestaurantsPageContent />
    </Suspense>
  );
}
