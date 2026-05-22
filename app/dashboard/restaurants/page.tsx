"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { APIClient } from "@/lib/api-client";
import type { Restaurant } from "@/lib/types";

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Restaurants</h1>
        <Link
          href="/dashboard/restaurants/new"
          className="bg-[#ff8400] text-black font-semibold px-4 py-2 rounded"
        >
          Add restaurant
        </Link>
      </div>

      {restaurants.length === 0 ? (
        <p className="text-gray-600">No restaurants yet. Add your first one.</p>
      ) : (
        <ul className="space-y-4">
          {restaurants.map((r) => (
            <li
              key={r._id}
              className="border border-gray-200 rounded-lg p-4 flex justify-between items-start"
            >
              <div>
                <h2 className="font-semibold text-lg">{r.name}</h2>
                <p className="text-sm text-gray-600">
                  {r.city}, {r.state} - {r.status}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/dashboard/restaurants/${r._id}/edit`}
                  className="text-blue-600 text-sm"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(r._id)}
                  className="text-red-600 text-sm"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
