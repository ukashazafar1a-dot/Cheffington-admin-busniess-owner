"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { APIClient } from "./api-client";
import type { Owner } from "./types";

interface AuthContextType {
  owner: Owner | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [owner, setOwner] = useState<Owner | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("owner_token");
        if (!token) {
          setOwner(null);
          return;
        }
        const response = await APIClient.getCurrentOwner();
        if (response.success) setOwner(response.owner);
        else {
          localStorage.removeItem("owner_token");
          setOwner(null);
        }
      } catch {
        localStorage.removeItem("owner_token");
        setOwner(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await APIClient.ownerLogin(email, password);
      if (response.success) setOwner(response.owner);
      else throw new Error(response.message || "Login failed");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed";
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setOwner(null);
    APIClient.logout();
  };

  return (
    <AuthContext.Provider
      value={{
        owner,
        isLoading,
        error,
        login,
        logout,
        isAuthenticated: !!owner,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
