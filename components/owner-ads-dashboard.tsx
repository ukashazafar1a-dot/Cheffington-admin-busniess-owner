"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { APIClient } from "@/lib/api-client";
import type {
  OwnerAdAnalyticsData,
  OwnerAdCampaign,
  OwnerAdRequest,
  OwnerAdvertisingOverview,
} from "@/lib/types";

function toDateInputValue(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function defaultFromInput() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return toDateInputValue(d);
}

function defaultToInput() {
  return toDateInputValue(new Date());
}

function formatCtr(ctr: number) {
  const pct = (Number(ctr) || 0) * 100;
  return `${pct.toFixed(2)}%`;
}

function formatCount(n: number) {
  return new Intl.NumberFormat().format(Number(n) || 0);
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString();
}

function statusBadgeClass(status: string) {
  const styles: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    scheduled: "bg-blue-100 text-blue-800",
    expired: "bg-gray-100 text-gray-700",
    cancelled: "bg-red-100 text-red-800",
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    paid: "bg-green-100 text-green-800",
    unpaid: "bg-yellow-100 text-yellow-800",
    refunded: "bg-gray-100 text-gray-700",
    failed: "bg-red-100 text-red-800",
  };
  return styles[status] || "bg-gray-100 text-gray-700";
}

function StatusPill({ status }: { status?: string | null }) {
  const label = String(status || "unknown");
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusBadgeClass(label)}`}
    >
      {label.replace(/_/g, " ")}
    </span>
  );
}

export default function OwnerAdsDashboard() {
  const [overview, setOverview] = useState<OwnerAdvertisingOverview | null>(
    null
  );
  const [analytics, setAnalytics] = useState<OwnerAdAnalyticsData | null>(null);
  const [from, setFrom] = useState(defaultFromInput);
  const [to, setTo] = useState(defaultToInput);
  const [campaignId, setCampaignId] = useState("");
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [error, setError] = useState("");

  const loadOverview = useCallback(async () => {
    setLoadingOverview(true);
    try {
      const res = await APIClient.getOwnerAdvertising();
      setOverview(res.data);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load your ads"
      );
    } finally {
      setLoadingOverview(false);
    }
  }, []);

  const loadAnalytics = useCallback(async () => {
    setLoadingAnalytics(true);
    setError("");
    try {
      const res = await APIClient.getOwnerAdAnalytics({
        from: from || undefined,
        to: to || undefined,
        campaignId: campaignId || undefined,
      });
      setAnalytics(res.data);
    } catch (err) {
      setAnalytics(null);
      setError(
        err instanceof Error ? err.message : "Failed to load ad analytics"
      );
    } finally {
      setLoadingAnalytics(false);
    }
  }, [from, to, campaignId]);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  const campaigns: OwnerAdCampaign[] = overview?.campaigns || [];
  const requests: OwnerAdRequest[] = overview?.requests || [];
  const summary = analytics?.summary;

  const campaignOptions = useMemo(
    () =>
      campaigns.map((c) => ({
        id: c._id,
        label: `${c.businessName} · ${c.placementKey} (${c.status})`,
      })),
    [campaigns]
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Ads</h1>
        <p className="mt-1 text-sm text-gray-600 max-w-2xl">
          Track ads purchased with your owner email
          {overview?.email ? (
            <>
              {" "}
              (<span className="font-medium text-gray-800">{overview.email}</span>
              )
            </>
          ) : null}
          . Impressions and clicks update as your ads appear on Cheffington.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Impressions</p>
          <p className="text-3xl font-bold mt-2 text-gray-900">
            {loadingAnalytics ? "…" : formatCount(summary?.impressions ?? 0)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Selected date range</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">Clicks</p>
          <p className="text-3xl font-bold mt-2 text-[#ff8400]">
            {loadingAnalytics ? "…" : formatCount(summary?.clicks ?? 0)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Selected date range</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600">CTR</p>
          <p className="text-3xl font-bold mt-2 text-gray-900">
            {loadingAnalytics ? "…" : formatCtr(summary?.ctr ?? 0)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Clicks ÷ impressions</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Analytics filters</h2>
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-gray-600">From</span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded border border-gray-300 px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-gray-600">To</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded border border-gray-300 px-3 py-2"
            />
          </label>
          <label className="text-sm min-w-[220px] flex-1">
            <span className="mb-1 block font-medium text-gray-600">Campaign</span>
            <select
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2"
            >
              <option value="">All my campaigns</option>
              {campaignOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => void loadAnalytics()}
            className="rounded bg-[#ff8400] px-4 py-2 text-sm font-semibold text-black hover:opacity-90"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Performance by campaign
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-6 py-3 font-medium">Campaign</th>
                <th className="px-6 py-3 font-medium">Placement</th>
                <th className="px-6 py-3 font-medium">Region</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Impressions</th>
                <th className="px-6 py-3 font-medium">Clicks</th>
                <th className="px-6 py-3 font-medium">CTR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loadingAnalytics ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Loading analytics…
                  </td>
                </tr>
              ) : (analytics?.byCampaign || []).length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No campaign performance yet for this range.
                  </td>
                </tr>
              ) : (
                analytics?.byCampaign.map((row) => (
                  <tr key={row.campaignId}>
                    <td className="px-6 py-3 font-medium text-gray-900">
                      {row.businessName}
                    </td>
                    <td className="px-6 py-3 text-gray-700">{row.placementKey}</td>
                    <td className="px-6 py-3 text-gray-700">
                      {row.targetRegionKey}
                    </td>
                    <td className="px-6 py-3">
                      <StatusPill status={row.status} />
                    </td>
                    <td className="px-6 py-3">{formatCount(row.impressions)}</td>
                    <td className="px-6 py-3">{formatCount(row.clicks)}</td>
                    <td className="px-6 py-3">{formatCtr(row.ctr)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Daily traffic</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Impressions</th>
                <th className="px-6 py-3 font-medium">Clicks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loadingAnalytics ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                    Loading…
                  </td>
                </tr>
              ) : (analytics?.byDay || []).length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                    No daily events in this range.
                  </td>
                </tr>
              ) : (
                analytics?.byDay.map((row) => (
                  <tr key={row.date}>
                    <td className="px-6 py-3">{row.date}</td>
                    <td className="px-6 py-3">{formatCount(row.impressions)}</td>
                    <td className="px-6 py-3">{formatCount(row.clicks)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Your campaigns</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-6 py-3 font-medium">Business</th>
                <th className="px-6 py-3 font-medium">Placement</th>
                <th className="px-6 py-3 font-medium">Dates</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loadingOverview ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Loading campaigns…
                  </td>
                </tr>
              ) : campaigns.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No live or scheduled campaigns yet. Purchase an ad on
                    Cheffington using this account email to see it here.
                  </td>
                </tr>
              ) : (
                campaigns.map((c) => (
                  <tr key={c._id}>
                    <td className="px-6 py-3 font-medium text-gray-900">
                      {c.businessName}
                    </td>
                    <td className="px-6 py-3 text-gray-700">{c.placementKey}</td>
                    <td className="px-6 py-3 text-gray-700">
                      {formatDate(c.startDate)} – {formatDate(c.endDate)}
                    </td>
                    <td className="px-6 py-3">
                      <StatusPill status={c.status} />
                    </td>
                    <td className="px-6 py-3 capitalize text-gray-700">
                      {c.campaignType}
                      {c.billingMode === "subscription" ? " · subscription" : ""}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Ad requests</h2>
          <p className="text-xs text-gray-500 mt-1">
            Checkout / review history for this email
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-6 py-3 font-medium">Business</th>
                <th className="px-6 py-3 font-medium">Placement</th>
                <th className="px-6 py-3 font-medium">Days</th>
                <th className="px-6 py-3 font-medium">Payment</th>
                <th className="px-6 py-3 font-medium">Review</th>
                <th className="px-6 py-3 font-medium">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loadingOverview ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Loading requests…
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No ad requests found for this email.
                  </td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr key={r._id}>
                    <td className="px-6 py-3 font-medium text-gray-900">
                      {r.businessName}
                    </td>
                    <td className="px-6 py-3 text-gray-700">{r.placementKey}</td>
                    <td className="px-6 py-3 text-gray-700">{r.days}</td>
                    <td className="px-6 py-3">
                      <StatusPill status={r.paymentStatus} />
                    </td>
                    <td className="px-6 py-3">
                      <StatusPill status={r.status} />
                    </td>
                    <td className="px-6 py-3 text-gray-700">
                      {formatDate(r.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
