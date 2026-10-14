"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  X,
  Lock,
  Mail,
  User,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { loginApi, registerApi } from "@/services/apiServices";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

const authSchema = z.object({
  name: z.string().optional(),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .toLowerCase(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number",
    ),
});

import type { AuthFormData } from "@/types";

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, setAuthenticatedUser } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  if (!isAuthModalOpen) return null;

  const onSubmit = async (data: AuthFormData) => {
    setApiError(null);
    setSuccessMessage(null);

    if (isSignUp && (!data.name || data.name.trim().length < 3)) {
      setError("name", {
        message: "Name must be at least 3 characters long",
      });
      return;
    }

    setAuthLoading(true);

    try {
      if (isSignUp) {
        await registerApi({
          name: data.name!.trim(),
          email: data.email.trim(),
          password: data.password,
        });

        // Automatically log the user in after successful registration
        const loginRes = await loginApi({
          email: data.email.trim(),
          password: data.password,
        });

        if (loginRes?.user) {
          setAuthenticatedUser({
            id: loginRes.user.id,
            name: loginRes.user.name,
            email: loginRes.user.email,
          });
          reset();
        } else {
          setSuccessMessage("Account created successfully! Please sign in.");
          setIsSignUp(false);
        }
      } else {
        const loginRes = await loginApi({
          email: data.email.trim(),
          password: data.password,
        });

        if (loginRes?.user) {
          setAuthenticatedUser({
            id: loginRes.user.id,
            name: loginRes.user.name,
            email: loginRes.user.email,
          });
          reset();
        } else {
          throw new Error(loginRes?.message || "Login failed");
        }
      }
    } catch (err: unknown) {
      console.error("Auth error:", err);
      const resData =
        err && typeof err === "object" && "response" in err
          ? (
              err as {
                response?: {
                  data?: {
                    message?: string;
                    errors?: { message: string }[];
                  };
                };
              }
            ).response?.data
          : null;

      const message =
        resData?.message ||
        resData?.errors?.[0]?.message ||
        (err instanceof Error ? err.message : "Authentication failed");

      setApiError(message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
    setApiError(null);
    setSuccessMessage(null);
    reset();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-border max-w-md w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Sparkles className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                {isSignUp ? "Create an Account" : "Sign In Required"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {isSignUp
                  ? "Sign up to analyze and optimize your resumes"
                  : "Please log in to analyze and match your resume"}
              </p>
            </div>
          </div>

          <button
            onClick={closeAuthModal}
            className="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {apiError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span className="font-medium">{apiError}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="size-4 shrink-0" />
              <span className="font-medium">{successMessage}</span>
            </div>
          )}

          {isSignUp && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Full Name
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Harsh Pal"
                  className="pl-9"
                  disabled={authLoading}
                  {...register("name")}
                />
                <User className="size-4 text-muted-foreground absolute left-3 top-3 pointer-events-none" />
              </div>
              {errors.name && (
                <p className="text-xs text-rose-500 font-medium">
                  {errors.name.message}
                </p>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Email
            </label>
            <div className="relative">
              <Input
                type="email"
                placeholder="you@example.com"
                className="pl-9"
                disabled={authLoading}
                {...register("email")}
              />
              <Mail className="size-4 text-muted-foreground absolute left-3 top-3 pointer-events-none" />
            </div>
            {errors.email && (
              <p className="text-xs text-rose-500 font-medium">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Password
            </label>
            <div className="relative">
              <Input
                type="password"
                placeholder="••••••••"
                className="pl-9"
                disabled={authLoading}
                {...register("password")}
              />
              <Lock className="size-4 text-muted-foreground absolute left-3 top-3 pointer-events-none" />
            </div>
            {errors.password && (
              <p className="text-xs text-rose-500 font-medium">
                {errors.password.message}
              </p>
            )}
            <p className="text-[11px] text-muted-foreground">
              Must be 6+ chars, with 1 uppercase, 1 lowercase & 1 number
            </p>
          </div>

          <Button
            type="submit"
            disabled={authLoading}
            className="w-full font-bold gap-2 cursor-pointer"
          >
            {authLoading ? (
              <span className="flex items-center gap-2">
                <Spinner className="size-4" />
                <span>
                  {isSignUp ? "Creating account..." : "Signing in..."}
                </span>
              </span>
            ) : (
              <>
                <span>
                  {isSignUp ? "Sign Up & Continue" : "Sign In & Continue"}
                </span>
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground pt-2">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              disabled={authLoading}
              onClick={handleToggleMode}
              className="text-primary font-semibold hover:underline cursor-pointer"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
