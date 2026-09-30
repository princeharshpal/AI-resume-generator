"use client";

import React from "react";
import { AlertCircle, CheckCircle2, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface RadialChartProps {
  score?: number;
  statusText?: string;
  subscores?: {
    keywords: number;
    experience: number;
    formatting: number;
  };
}

export default function RadialChart({
  score = 78,
  statusText = "Needs Work",
  subscores = {
    keywords: 82,
    experience: 74,
    formatting: 91,
  },
}: RadialChartProps) {
  const radius = 92;
  const strokeWidth = 14;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const isGood = score >= 80;
  const isModerate = score >= 65 && score < 80;

  const scoreColor = isGood
    ? "text-emerald-500 stroke-emerald-500"
    : isModerate
      ? "text-amber-500 stroke-amber-500"
      : "text-rose-500 stroke-rose-500";

  return (
    <Card className="flex flex-col h-full border border-border/80 shadow-sm bg-card/70 backdrop-blur-sm overflow-hidden">
      <CardHeader className="items-center pb-2 text-center">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-semibold tracking-wide uppercase text-muted-foreground">
            MATCH SCORE
          </CardTitle>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 dark:text-amber-400">
            ATS V2
          </span>
        </div>
        <CardDescription className="text-xs">
          Match against target Job Description
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col items-center justify-center p-6 pt-2">
        <div className="relative flex items-center justify-center py-2">
          <svg
            height={radius * 2 + strokeWidth}
            width={radius * 2 + strokeWidth}
            className="transform -rotate-90 transition-all duration-1000 ease-out drop-shadow-sm"
          >
            <circle
              stroke="currentColor"
              fill="transparent"
              strokeWidth={strokeWidth}
              className="text-muted/25 dark:text-muted/20"
              r={normalizedRadius}
              cx={radius + strokeWidth / 2}
              cy={radius + strokeWidth / 2}
            />
            <circle
              fill="transparent"
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference} ${circumference}`}
              style={{ strokeDashoffset }}
              strokeLinecap="round"
              className={`${scoreColor} transition-all duration-1000 ease-out`}
              r={normalizedRadius}
              cx={radius + strokeWidth / 2}
              cy={radius + strokeWidth / 2}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none p-6">
            <div className="flex items-baseline justify-center">
              <span className="text-3xl sm:text-4xl font-black tracking-tight text-foreground font-heading">
                {score}
              </span>
              <span className="text-lg sm:text-xl font-bold text-muted-foreground/80 ml-0.5">
                %
              </span>
            </div>

            <div
              className={`mt-2 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold border transition-all ${
                isGood
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                  : isModerate
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-500 border-amber-500/30"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
              }`}
            >
              {isGood ? (
                <CheckCircle2 className="size-3 text-emerald-500 shrink-0" />
              ) : (
                <AlertCircle className="size-3 text-amber-500 shrink-0" />
              )}
              <span>{statusText}</span>
            </div>
          </div>
        </div>

        <div className="w-full border-t border-border/50 my-4" />

        <div className="w-full grid grid-cols-3 gap-2.5 text-center">
          <div className="p-3 rounded-2xl bg-muted/35 dark:bg-muted/20 border border-border/50 shadow-xs flex flex-col items-center justify-center">
            <span className="text-xs text-muted-foreground font-medium">
              Keywords
            </span>
            <span className="text-base sm:text-lg font-black text-foreground mt-0.5">
              {subscores.keywords}%
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-muted/35 dark:bg-muted/20 border border-border/50 shadow-xs flex flex-col items-center justify-center">
            <span className="text-xs text-muted-foreground font-medium">
              Experience
            </span>
            <span className="text-base sm:text-lg font-black text-foreground mt-0.5">
              {subscores.experience}%
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-muted/35 dark:bg-muted/20 border border-border/50 shadow-xs flex flex-col items-center justify-center">
            <span className="text-xs text-muted-foreground font-medium">
              ATS Format
            </span>
            <span className="text-base sm:text-lg font-black text-foreground mt-0.5">
              {subscores.formatting}%
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between text-xs text-muted-foreground pt-1 pb-3 px-4 border-t border-border/40">
        <div className="flex items-center gap-1.5 font-medium">
          <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
          <span>Potential: 94% with tailoring</span>
        </div>
        <span className="text-[11px] text-muted-foreground/80">
          Benchmark: 80%+
        </span>
      </CardFooter>
    </Card>
  );
}
