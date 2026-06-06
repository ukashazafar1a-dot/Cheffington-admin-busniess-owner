"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ReviewsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/review-moderation");
  }, [router]);

  return (
    <p className="text-gray-600">Redirecting to Review Moderation...</p>
  );
}
