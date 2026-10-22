"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { User, AuthContextType } from "@/types";
import { refreshTokenApi, logoutApi } from "@/services/apiServices";

export type { User };

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(
    null,
  );

  useEffect(() => {
    const saved = localStorage.getItem("smartresume_user");
    if (saved) {
      try {
        const parsedUser = JSON.parse(saved);
        setUser(parsedUser);

        refreshTokenApi()
          .then((res) => {
            if (res?.user) {
              const updatedUser = {
                ...parsedUser,
                ...res.user,
              };
              setUser(updatedUser);
              localStorage.setItem(
                "smartresume_user",
                JSON.stringify(updatedUser),
              );
            }
          })
          .catch(() => {});
      } catch {
        localStorage.removeItem("smartresume_user");
      }
    }

    const handleSessionExpired = async () => {
      try {
        await logoutApi();
      } catch {}
      if (typeof document !== "undefined") {
        document.cookie =
          "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie =
          "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      }
      setUser(null);
      localStorage.removeItem("smartresume_user");
    };

    window.addEventListener("auth:session-expired", handleSessionExpired);
    return () => {
      window.removeEventListener("auth:session-expired", handleSessionExpired);
    };
  }, []);

  const setAuthenticatedUser = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem("smartresume_user", JSON.stringify(newUser));
    setIsAuthModalOpen(false);

    if (pendingCallback) {
      pendingCallback();
      setPendingCallback(null);
    }
  };

  const login = (
    emailOrUser: string | User = "harsh@example.com",
    name = "Harsh Pal",
  ) => {
    if (typeof emailOrUser === "object" && emailOrUser !== null) {
      setAuthenticatedUser(emailOrUser);
      return;
    }

    const newUser: User = {
      name,
      email: emailOrUser,
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    };
    setAuthenticatedUser(newUser);
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch {}
    if (typeof document !== "undefined") {
      document.cookie =
        "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie =
        "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
    setUser(null);
    localStorage.removeItem("smartresume_user");
  };

  const openAuthModal = (callback?: () => void) => {
    if (callback) {
      setPendingCallback(() => callback);
    } else {
      setPendingCallback(null);
    }
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setPendingCallback(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        login,
        setAuthenticatedUser,
        logout,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
