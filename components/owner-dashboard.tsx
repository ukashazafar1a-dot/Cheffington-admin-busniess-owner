"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { APIClient } from "@/lib/api-client";
import type { OwnerDashboardStats, Restaurant } from "@/lib/types";

function DashboardCard({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}
    >
      {title && (
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>
      )}
      <div className={title ? "p-6" : "p-6"}>{children}</div>
    </div>
  );
}

function StatCard({
  label,
  value,
  subtext,
  accent,
}: {
  label: string;
  value: number | string;
  subtext?: string;
  accent?: "default" | "green" | "yellow" | "gray" | "orange";
}) {
  const valueColor = {
    default: "text-gray-900",
    green: "text-green-600",
    yellow: "text-yellow-600",
    gray: "text-gray-500",
    orange: "text-[#ff8400]",
  }[accent || "default"];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <p className={`text-3xl font-bold mt-2 ${valueColor}`}>{value}</p>
      {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
    </div>
  );
}

function statusBadge(status: Restaurant["status"]) {
  const styles = {
    published: "bg-green-100 text-green-800",
    draft: "bg-yellow-100 text-yellow-800",
    archived: "bg-gray-100 text-gray-700",
  };
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function formatActivityDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString();
}

export function OwnerDashboard() {
  const { owner } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [stats, setStats] = useState<OwnerDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([APIClient.listRestaurants(), APIClient.getDashboardStats()])
      .then(([restaurantsRes, statsRes]) => {
        setRestaurants(restaurantsRes.data || []);
        if (statsRes.success) {
          setStats(statsRes.data);
        }
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load data")
      )
      .finally(() => setLoading(false));
  }, []);

  const restaurantStats = stats?.restaurants ?? {
    total: restaurants.length,
    published: restaurants.filter((r) => r.status === "published").length,
    draft: restaurants.filter((r) => r.status === "draft").length,
    archived: restaurants.filter((r) => r.status === "archived").length,
  };

  const recent = [...restaurants]
    .sort((a, b) => {
      const ta = a.updatedAt || a.createdAt || "";
      const tb = b.updatedAt || b.createdAt || "";
      return tb.localeCompare(ta);
    })
    .slice(0, 5);

  const topListings = (stats?.reviewsByRestaurant ?? []).slice(0, 5);
  const recentActivity = stats?.recentActivity ?? [];

  const ownerDisplayName =
    `${owner?.firstName ?? ""} ${owner?.lastName ?? ""}`.trim() || "Business Owner";
  const ownerInitials = ownerDisplayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ff8400] mx-auto mb-3" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back! Here&apos;s your business overview.
          {owner?.currentRestaurant ? ` · ${owner.currentRestaurant}` : ""}
        </p>
      </div>

      {error && (
        <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Restaurants"
          value={restaurantStats.total}
          subtext={
            restaurantStats.total > 0
              ? `${restaurantStats.published} live on Cheffington`
              : "Add your first listing"
          }
        />
        <StatCard
          label="Published"
          value={restaurantStats.published}
          accent="green"
          subtext="Visible to customers"
        />
        <StatCard
          label="Draft"
          value={restaurantStats.draft}
          accent="yellow"
          subtext="Not yet published"
        />
        <StatCard
          label="Chef reviews"
          value={stats?.totalChefReviews ?? 0}
          accent="orange"
          subtext="Published reviews on your restaurants"
        />
      </div>

      <div className="bg-[#fffaf6] border border-gray-200 rounded-xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-xl font-bold text-[#ff8400]">
              {ownerInitials || "BO"}
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-600">
                Your account
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">
                {ownerDisplayName}
              </h2>
              <span className="inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                Business Owner
              </span>
            </div>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 md:min-w-[24rem]">
            <div className="bg-white border border-gray-100 rounded-lg px-4 py-3">
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Email</dt>
              <dd className="font-semibold text-gray-900 break-all mt-1">{owner?.email || "-"}</dd>
            </div>
            {owner?.currentRestaurant ? (
              <div className="bg-white border border-gray-100 rounded-lg px-4 py-3">
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Business</dt>
                <dd className="font-semibold text-gray-900 mt-1">{owner.currentRestaurant}</dd>
              </div>
            ) : null}
            {(owner?.city || owner?.state) && (
              <div className="bg-white border border-gray-100 rounded-lg px-4 py-3">
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Location</dt>
                <dd className="font-semibold text-gray-900 mt-1">
                  {[owner.city, owner.state].filter(Boolean).join(", ")}
                </dd>
              </div>
            )}
            {owner?.phone ? (
              <div className="bg-white border border-gray-100 rounded-lg px-4 py-3">
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Phone</dt>
                <dd className="font-semibold text-gray-900 mt-1">{owner.phone}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/restaurants/new"
            className="bg-[#ff8400] text-black font-semibold px-5 py-2.5 rounded hover:opacity-90 transition-opacity"
          >
            + Add restaurant
          </Link>
          <Link
            href="/dashboard/restaurants"
            className="border-2 border-black font-semibold px-5 py-2.5 rounded hover:bg-gray-50 transition-colors"
          >
            Manage all restaurants
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardCard title="Top performing listings">
          {topListings.length === 0 ? (
            <p className="text-gray-600 text-sm">
              Publish a restaurant to see performance here.
            </p>
          ) : (
            <div className="space-y-3">
              {topListings.map((item) => (
                <div key={item.restaurantId} className="flex justify-between items-center gap-4">
                  <span className="text-gray-700">{item.name}</span>
                  <span className="font-semibold text-gray-900 shrink-0">
                    {item.reviewCount} review{item.reviewCount === 1 ? "" : "s"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </DashboardCard>

        <DashboardCard title="Recent activity">
          {recentActivity.length === 0 ? (
            <p className="text-sm text-gray-600">No recent activity yet.</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={`${activity.message}-${index}`} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#ff8400] rounded-full mt-1.5 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-700">{activity.message}</p>
                    {activity.date ? (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatActivityDate(activity.date)}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashboardCard>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent restaurants</h2>
          <Link
            href="/dashboard/restaurants"
            className="text-sm font-medium text-[#ff8400] hover:underline"
          >
            View all
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-600 mb-4">You have not added any restaurants yet.</p>
            <Link
              href="/dashboard/restaurants/new"
              className="inline-block bg-[#ff8400] text-black font-semibold px-4 py-2 rounded"
            >
              Add your first restaurant
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {recent.map((r) => (
              <li
                key={r._id}
                className="px-6 py-4 flex flex-wrap items-center justify-between gap-3 hover:bg-gray-50"
              >
                <div>
                  <p className="font-semibold text-gray-900">{r.name}</p>
                  <p className="text-sm text-gray-600">
                    {r.city}, {r.state}
                    {r.cuisine ? ` · ${r.cuisine}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {statusBadge(r.status)}
                  <Link
                    href={`/dashboard/restaurants/${r._id}/edit`}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    Edit
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
