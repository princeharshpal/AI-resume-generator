"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";

const settingsSchema = z.object({
  threshold: z.coerce
    .number()
    .min(1, "Threshold must be at least 1%")
    .max(100, "Threshold cannot exceed 100%"),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export default function SettingsForm() {
  const { isLoggedIn, openAuthModal } = useAuth();
  const [selectedDepth, setSelectedDepth] = useState("strict");
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      threshold: 80,
    },
  });

  const onSubmit = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!isLoggedIn) {
    return (
      <div className="p-8 rounded-2xl border border-border bg-card shadow-sm max-w-md mx-auto text-center space-y-4 my-8">
        <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <Lock className="size-6" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          Sign In to Manage Settings
        </h2>
        <p className="text-xs text-muted-foreground">
          Sign in to customize your ATS scoring threshold and AI model
          preferences.
        </p>
        <Button onClick={() => openAuthModal()} className="font-bold w-full">
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground block">
            Target ATS Scoring Threshold
          </label>
          <p className="text-xs text-muted-foreground">
            Resumes scoring above this threshold are marked as &ldquo;Ready to
            Submit&rdquo;.
          </p>
          <div className="flex items-center gap-4 pt-1">
            <Input
              type="number"
              className="w-28 font-mono"
              {...register("threshold")}
            />
            <span className="text-xs text-muted-foreground">
              % minimum match recommended
            </span>
          </div>
          {errors.threshold && (
            <p className="text-xs text-rose-500 font-medium">
              {errors.threshold.message}
            </p>
          )}
        </div>

        <Separator />

        <div className="space-y-2">
          <label className="text-sm font-bold text-foreground block">
            AI Model Optimization Depth
          </label>
          <p className="text-xs text-muted-foreground">
            Select depth of semantic matching and industry-specific buzzword
            analysis.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div
              onClick={() => setSelectedDepth("strict")}
              className={`p-3.5 rounded-xl cursor-pointer text-left transition-all ${
                selectedDepth === "strict"
                  ? "border-2 border-primary bg-primary/5"
                  : "border border-border hover:border-primary/50"
              }`}
            >
              <div className="text-xs font-bold text-foreground">
                Strict ATS Filter
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                Focus on exact keyword frequency
              </div>
            </div>

            <div
              onClick={() => setSelectedDepth("semantic")}
              className={`p-3.5 rounded-xl cursor-pointer text-left transition-all ${
                selectedDepth === "semantic"
                  ? "border-2 border-primary bg-primary/5"
                  : "border border-border hover:border-primary/50"
              }`}
            >
              <div className="text-xs font-bold text-foreground">
                Semantic Match
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                Matches concepts & synonyms
              </div>
            </div>

            <div
              onClick={() => setSelectedDepth("executive")}
              className={`p-3.5 rounded-xl cursor-pointer text-left transition-all ${
                selectedDepth === "executive"
                  ? "border-2 border-primary bg-primary/5"
                  : "border border-border hover:border-primary/50"
              }`}
            >
              <div className="text-xs font-bold text-foreground">
                Executive Balance
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                Balanced for human recruiter review
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between pt-2">
          {saved ? (
            <span className="text-xs text-emerald-500 font-semibold">
              Preferences saved successfully!
            </span>
          ) : (
            <span />
          )}
          <div className="flex gap-3">
            <Link href="/">
              <Button variant="outline" size="sm" type="button">
                Cancel
              </Button>
            </Link>
            <Button size="sm" type="submit">
              Save Preferences
            </Button>
          </div>
        </div>
      </Card>
    </form>
  );
}
