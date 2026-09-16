"use client";

import { useState } from "react";
import Link from "next/link";
import { APIClient } from "@/lib/api-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);
    try {
      const res = await APIClient.ownerForgotPassword(email);
      setSuccess(
        res.message ||
          "If an approved account exists for that email, a reset link has been sent."
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to send reset email"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff1e1] flex items-center justify-center px-4">
      <div className="w-full max-w-md p-8 border-2 border-black rounded-lg bg-white">
        <h1 className="text-3xl font-bold mb-2">Forgot password</h1>
        <p className="text-gray-600 mb-8">
          Enter the email for your approved business owner account. We&apos;ll
          send a reset link if it matches.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
              disabled={isSubmitting || Boolean(success)}
              autoComplete="email"
            />
          </div>
          {error ? <p className="text-red-600 text-sm">{error}</p> : null}
          {success ? <p className="text-green-700 text-sm">{success}</p> : null}
          <button
            type="submit"
            disabled={isSubmitting || Boolean(success)}
            className="w-full bg-[#ff8400] text-black font-semibold py-2 rounded hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting ? "Sending..." : "Send reset link"}
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
