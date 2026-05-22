"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { owner, isLoading, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const nav = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/restaurants", label: "Restaurants" },
  ];

  const isNavActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 bg-[#fff1e1] border-r border-black p-4 flex flex-col">
        <h1 className="font-bold text-lg mb-6">Owner Dashboard</h1>
        <p className="text-sm mb-6 text-gray-700">
          {owner?.firstName} {owner?.lastName}
        </p>
        <nav className="flex flex-col gap-2 flex-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 rounded ${
                isNavActive(item.href)
                  ? "bg-[#ff8400] text-white"
                  : "hover:bg-[#ff8200]/30"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full mt-4 px-3 py-2 rounded border border-red-300 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
        >
          Logout
        </button>
      </aside>
      <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-end items-center shrink-0">
          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2 rounded border border-red-300 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors"
          >
            Logout
          </button>
        </header>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
