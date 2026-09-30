"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Clock, Download, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

const initialHistory = [
  {
    id: 1,
    role: "Full Stack Developer",
    company: "Stripe Inc.",
    score: 78,
    date: "Today, 1:15 PM",
    resume: "my_latest_resume.pdf",
    status: "Needs Work",
    skills: ["Node.js", "TypeScript", "PostgreSQL"],
  },
  {
    id: 2,
    role: "Senior Frontend Engineer",
    company: "Vercel",
    score: 92,
    date: "Yesterday, 4:40 PM",
    resume: "frontend_lead_2026.pdf",
    status: "Strong Match",
    skills: ["Next.js", "React 19", "TailwindCSS"],
  },
  {
    id: 3,
    role: "Backend Architect",
    company: "Amazon AWS",
    score: 64,
    date: "3 days ago",
    resume: "backend_cv_v3.pdf",
    status: "Action Required",
    skills: ["Java", "Distributed Systems", "SQL"],
  },
];

export default function HistoryList() {
  const { isLoggedIn, openAuthModal } = useAuth();
  const [historyList] = useState(initialHistory);

  if (!isLoggedIn) {
    return (
      <div className="p-8 rounded-2xl border border-border bg-card shadow-sm max-w-md mx-auto text-center space-y-4 my-8">
        <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <Lock className="size-6" />
        </div>
        <h2 className="text-xl font-bold text-foreground">
          Sign In to View History
        </h2>
        <p className="text-xs text-muted-foreground">
          Sign in to access your saved resume scans, score evaluations, and ATS
          tailoring reports.
        </p>
        <Button onClick={() => openAuthModal()} className="font-bold w-full">
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {historyList.map((item) => (
        <Card
          key={item.id}
          className="p-5 border border-border/80 hover:border-primary/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-4">
            <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
              {item.score}%
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-foreground">
                  {item.role}
                </h4>
                <span className="text-xs text-muted-foreground">
                  • {item.company}
                </span>
                <Badge
                  variant={item.score >= 80 ? "default" : "secondary"}
                  className="text-[10px] py-0 px-2"
                >
                  {item.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-3">
                <span>File: {item.resume}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3" /> {item.date}
                </span>
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {item.skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-mono"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <Link href="/">
              <Button variant="outline" size="sm" className="text-xs">
                Load Scan
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground"
            >
              <Download className="size-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
