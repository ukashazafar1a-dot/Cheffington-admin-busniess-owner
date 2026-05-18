"use client";

import { useRouter } from "next/navigation";
import { RestaurantForm } from "@/components/restaurant-form";
import { APIClient } from "@/lib/api-client";

export default function NewRestaurantPage() {
  const router = useRouter();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Add restaurant</h1>
      <RestaurantForm
        submitLabel="Create"
        onSubmit={async (data) => {
          await APIClient.createRestaurant(data);
          router.push("/dashboard/restaurants");
        }}
      />
    </div>
  );
}
