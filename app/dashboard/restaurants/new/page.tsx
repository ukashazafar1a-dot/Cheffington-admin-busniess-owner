"use client";

import { useRef, useState } from "react";
import { RestaurantForm } from "@/components/restaurant-form";
import { APIClient } from "@/lib/api-client";

export default function NewRestaurantPage() {
  const submittingRef = useRef(false);
  const [showSubmittedModal, setShowSubmittedModal] = useState(false);
  const [createdName, setCreatedName] = useState("");

  const goToDashboard = () => {
    setShowSubmittedModal(false);
    // Hard navigation so we leave this page even if client router is busy
    window.location.assign("/dashboard");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Add restaurant</h1>
      <p className="text-sm text-gray-600 mb-4">
        After you create the listing it is sent for Cheffington admin review.
        Photos can be added on the edit page after create.
      </p>
      <RestaurantForm
        submitLabel="Create"
        onSubmit={async (data) => {
          if (submittingRef.current) {
            throw new Error(
              "Please wait — your listing is already being created."
            );
          }
          submittingRef.current = true;
          try {
            await APIClient.createRestaurant(data);
            setCreatedName(String(data.name || "").trim());
            setShowSubmittedModal(true);
            // Keep lock until user leaves this page (avoids double create)
          } catch (err) {
            submittingRef.current = false;
            throw err;
          }
        }}
      />

      {showSubmittedModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="restaurant-submitted-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <p className="text-xs font-bold uppercase tracking-wide text-[#ff8400]">
              Awaiting admin review
            </p>
            <h2
              id="restaurant-submitted-title"
              className="mt-2 text-xl font-bold text-gray-900"
            >
              {createdName
                ? `"${createdName}" was submitted`
                : "Restaurant submitted"}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-700">
              Your restaurant listing has been sent for Cheffington admin
              approval. It will stay off the public site until an admin
              approves and publishes it.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-gray-700">
              You can track status anytime under{" "}
              <span className="font-medium">My Restaurants</span>. You will also
              get an email when it is approved.
            </p>
            <button
              type="button"
              onClick={goToDashboard}
              className="mt-6 w-full rounded bg-[#ff8400] px-4 py-2.5 font-semibold text-black"
            >
              Go to dashboard
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
