"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { APIClient } from "@/lib/api-client";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(
    () => String(searchParams.get("token") || "").trim(),
    [searchParams]
  );

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("This reset link is missing a token. Request a new link from the login page.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await APIClient.ownerResetPassword(token, password);
      setSuccess(res.message || "Password updated. You can sign in now.");
      window.setTimeout(() => router.replace("/login"), 1500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to reset password"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff1e1] flex items-center justify-center px-4">
      <div className="w-full max-w-md p-8 border-2 border-black rounded-lg bg-white">
        <h1 className="text-3xl font-bold mb-2">Reset password</h1>
        <p className="text-gray-600 mb-8">
          Choose a new password for your business owner account.
        </p>
        {!token ? (
          <p className="text-red-600 text-sm mb-4">
            This page needs a valid reset link from your email.
          </p>
        ) : null}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">New password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
              minLength={6}
              disabled={isSubmitting || Boolean(success) || !token}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Confirm new password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
              minLength={6}
              disabled={isSubmitting || Boolean(success) || !token}
              autoComplete="new-password"
            />
          </div>
          {error ? <p className="text-red-600 text-sm">{error}</p> : null}
          {success ? <p className="text-green-700 text-sm">{success}</p> : null}
          <button
            type="submit"
            disabled={isSubmitting || Boolean(success) || !token}
            className="w-full bg-[#ff8400] text-black font-semibold py-2 rounded hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Update password"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          <Link href="/login" className="font-medium text-[#ff8400] hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fff1e1] flex items-center justify-center px-4">
          <div className="w-full max-w-md p-8 border-2 border-black rounded-lg bg-white text-center">
            <p className="text-gray-500 text-sm">Loading...</p>
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
