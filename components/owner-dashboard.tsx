"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "@/lib/auth-context";
import { APIClient } from "@/lib/api-client";
import type { Restaurant } from "@/lib/types";

/** Placeholder chart data — wire to analytics API later */
const viewsInquiriesData = [
  { month: "Jan", views: 420, inquiries: 28 },
  { month: "Feb", views: 380, inquiries: 22 },
  { month: "Mar", views: 510, inquiries: 35 },
  { month: "Apr", views: 470, inquiries: 31 },
  { month: "May", views: 590, inquiries: 42 },
  { month: "Jun", views: 640, inquiries: 48 },
];

const reservationsByDay = [
  { day: "Mon", reservations: 8 },
  { day: "Tue", reservations: 12 },
  { day: "Wed", reservations: 10 },
  { day: "Thu", reservations: 14 },
  { day: "Fri", reservations: 22 },
  { day: "Sat", reservations: 26 },
  { day: "Sun", reservations: 18 },
];

const recentActivityMock = [
  "Listing views increased 12% this week",
  "New inquiry received for your published restaurant",
  "Profile updated successfully",
];

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

export function OwnerDashboard() {
  const { owner } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    APIClient.listRestaurants()
      .then((res) => setRestaurants(res.data || []))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load data")
      )
      .finally(() => setLoading(false));
  }, []);

  const published = restaurants.filter((r) => r.status === "published").length;
  const draft = restaurants.filter((r) => r.status === "draft").length;
  const archived = restaurants.filter((r) => r.status === "archived").length;
  const recent = [...restaurants]
    .sort((a, b) => {
      const ta = a.updatedAt || a.createdAt || "";
      const tb = b.updatedAt || b.createdAt || "";
      return tb.localeCompare(ta);
    })
    .slice(0, 5);

  const topListings = [...restaurants]
    .filter((r) => r.status === "published")
    .slice(0, 3)
    .map((r, i) => ({
      name: r.name,
      views: [320, 285, 256][i] ?? 200,
    }));

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
          value={restaurants.length}
          subtext={
            restaurants.length > 0 ? `${published} live on Cheffington` : "Add your first listing"
          }
        />
        <StatCard label="Published" value={published} accent="green" subtext="Visible to customers" />
        <StatCard label="Draft" value={draft} accent="yellow" subtext="Not yet published" />
        <StatCard
          label="Profile views"
          value="2.4K"
          accent="orange"
          subtext="+18% this month (demo)"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCard title="Views & inquiries trend">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={viewsInquiriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="views"
                stroke="#ff8400"
                strokeWidth={2}
                name="Profile views"
              />
              <Line
                type="monotone"
                dataKey="inquiries"
                stroke="#16a34a"
                strokeWidth={2}
                name="Inquiries"
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-400 mt-3">Sample data — connect analytics later</p>
        </DashboardCard>

        <DashboardCard title="Reservations by day">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reservationsByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="reservations" fill="#ff8400" radius={[8, 8, 0, 0]} name="Reservations" />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-400 mt-3">Sample data — connect bookings later</p>
        </DashboardCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
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

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your account</h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-gray-500">Name</dt>
              <dd className="font-medium text-gray-900">
                {owner?.firstName} {owner?.lastName}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Email</dt>
              <dd className="font-medium text-gray-900 break-all">{owner?.email}</dd>
            </div>
            {owner?.currentRestaurant && (
              <div>
                <dt className="text-gray-500">Business</dt>
                <dd className="font-medium text-gray-900">{owner.currentRestaurant}</dd>
              </div>
            )}
            <div>
              <dt className="text-gray-500">Role</dt>
              <dd>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  Business Owner
                </span>
              </dd>
            </div>
          </dl>
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
                <div key={item.name} className="flex justify-between items-center">
                  <span className="text-gray-700">{item.name}</span>
                  <span className="font-semibold text-gray-900">{item.views} views</span>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-400 mt-4">Sample metrics — demo UI</p>
        </DashboardCard>

        <DashboardCard title="Recent activity">
          <div className="space-y-3">
            {recentActivityMock.map((activity, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-[#ff8400] rounded-full mt-1.5 shrink-0" />
                <p className="text-sm text-gray-700">{activity}</p>
              </div>
            ))}
          </div>
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

