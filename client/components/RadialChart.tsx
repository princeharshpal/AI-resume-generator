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
import { Badge } from "@/components/ui/badge";

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
  // SVG circular gauge calculation
  const radius = 64;
  const strokeWidth = 12;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Determine color theme based on score
  const isGood = score >= 80;
  const isModerate = score >= 65 && score < 80;

  const scoreColor = isGood
    ? "text-emerald-500 stroke-emerald-500"
    : isModerate
      ? "text-amber-500 stroke-amber-500"
      : "text-rose-500 stroke-rose-500";

  const badgeVariant = isGood
    ? "default"
    : isModerate
      ? "secondary"
      : "destructive";

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

      <CardContent className="flex-1 flex flex-col items-center justify-center py-3">
        {/* Radial Gauge */}
        <div className="relative flex items-center justify-center">
          <svg
            height={radius * 2 + strokeWidth}
            width={radius * 2 + strokeWidth}
            className="transform -rotate-90 transition-all duration-1000 ease-out drop-shadow-sm"
          >
            {/* Background Track */}
            <circle
              stroke="currentColor"
              fill="transparent"
              strokeWidth={strokeWidth}
              className="text-muted/40 dark:text-muted/20"
              r={normalizedRadius}
              cx={radius + strokeWidth / 2}
              cy={radius + strokeWidth / 2}
            />
            {/* Active Gauge Progress */}
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

          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-4xl font-extrabold tracking-tight font-heading">
              {score}
              <span className="text-xl font-bold text-muted-foreground">%</span>
            </span>
            <Badge
              variant={badgeVariant}
              className={`mt-1 text-xs font-semibold px-2.5 py-0.5 ${
                isModerate
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                  : ""
              }`}
            >
              {isModerate ? (
                <AlertCircle className="w-3 h-3 mr-1 text-amber-500" />
              ) : (
                <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />
              )}
              {statusText}
            </Badge>
          </div>
        </div>

        {/* Sub-scores breakdown */}
        <div className="w-full mt-5 grid grid-cols-3 gap-2 pt-4 border-t border-border/60 text-center">
          <div className="px-1 py-1 rounded-lg bg-muted/40">
            <div className="text-[11px] text-muted-foreground font-medium">
              Keywords
            </div>
            <div className="text-sm font-bold text-foreground">
              {subscores.keywords}%
            </div>
          </div>
          <div className="px-1 py-1 rounded-lg bg-muted/40">
            <div className="text-[11px] text-muted-foreground font-medium">
              Experience
            </div>
            <div className="text-sm font-bold text-foreground">
              {subscores.experience}%
            </div>
          </div>
          <div className="px-1 py-1 rounded-lg bg-muted/40">
            <div className="text-[11px] text-muted-foreground font-medium">
              ATS Format
            </div>
            <div className="text-sm font-bold text-foreground">
              {subscores.formatting}%
            </div>
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
