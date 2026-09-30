"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Lock, Mail, User, Sparkles, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const authSchema = z.object({
  name: z.string().optional(),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthFormData = z.infer<typeof authSchema>;

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, login } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);

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

  const onSubmit = (data: AuthFormData) => {
    if (isSignUp && (!data.name || data.name.trim().length < 2)) {
      setError("name", { message: "Name must be at least 2 characters" });
      return;
    }

    login(data.email, data.name || data.email.split("@")[0]);
    reset();
  };

  const handleDemoLogin = () => {
    login("demo.user@example.com", "Demo User");
    reset();
  };

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
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
                  ? "Sign up to analyze your resumes"
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
          {isSignUp && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Name
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Your Name"
                  className="pl-9"
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
                {...register("password")}
              />
              <Lock className="size-4 text-muted-foreground absolute left-3 top-3 pointer-events-none" />
            </div>
            {errors.password && (
              <p className="text-xs text-rose-500 font-medium">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full font-bold gap-2">
            <span>
              {isSignUp ? "Sign Up & Continue" : "Sign In & Continue"}
            </span>
            <ArrowRight className="size-4" />
          </Button>

          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleDemoLogin}
            className="w-full text-xs"
          >
            One-Click Demo Sign In
          </Button>

          <p className="text-center text-xs text-muted-foreground pt-2">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={handleToggleMode}
              className="text-primary font-semibold hover:underline"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
