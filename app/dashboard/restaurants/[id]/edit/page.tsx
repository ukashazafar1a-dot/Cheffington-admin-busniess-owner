"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RestaurantForm } from "@/components/restaurant-form";
import { APIClient } from "@/lib/api-client";
import type { Restaurant } from "@/lib/types";

export default function EditRestaurantPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    APIClient.getRestaurant(id)
      .then((res) => setRestaurant(res.data))
      .catch(() => alert("Restaurant not found"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!restaurant) return <p>Not found</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit restaurant</h1>
      <RestaurantForm
        initial={restaurant}
        restaurantId={id}
        submitLabel="Update"
        onSubmit={async (data) => {
          await APIClient.updateRestaurant(id, data);
          router.push("/dashboard/restaurants");
        }}
      />
    </div>
  );
}
