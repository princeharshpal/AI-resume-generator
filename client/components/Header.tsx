"use client";

import React from "react";
import Link from "next/link";
import { 
  Sparkles, 
  History, 
  Settings, 
  LayoutDashboard, 
  FileCheck, 
  ChevronDown,
  User,
  ShieldCheck,
  Bell
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  activeTab?: string;
  onTabChange?: (tab: "dashboard" | "history" | "settings") => void;
}

export default function Header({
  activeTab = "dashboard",
  onTabChange = () => {},
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-background/80 border-b border-border/70 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 group transition-transform active:scale-98"
          >
            <div className="size-9 rounded-xl bg-gradient-to-tr from-primary to-primary/70 flex items-center justify-center text-primary-foreground shadow-sm shadow-primary/20 group-hover:shadow-md group-hover:shadow-primary/30 transition-all">
              <Sparkles className="size-5 text-amber-300 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-foreground flex items-center gap-1.5">
                SmartResume<span className="text-primary font-black">AI</span>
              </span>
              <span className="text-[10px] -mt-1 font-medium text-muted-foreground tracking-wide uppercase">
                ATS Optimizer
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 ml-4 bg-muted/40 p-1 rounded-xl border border-border/50">
            <button
              onClick={() => onTabChange("dashboard")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "dashboard"
                  ? "bg-background text-foreground shadow-xs border border-border/80"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
            >
              <LayoutDashboard className="size-3.5" />
              Dashboard
            </button>

            <button
              onClick={() => onTabChange("history")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
                activeTab === "history"
                  ? "bg-background text-foreground shadow-xs border border-border/80"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
            >
              <History className="size-3.5" />
              History
              <span className="size-1.5 rounded-full bg-emerald-500 absolute top-2 right-2"></span>
            </button>

            <button
              onClick={() => onTabChange("settings")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "settings"
                  ? "bg-background text-foreground shadow-xs border border-border/80"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
            >
              <Settings className="size-3.5" />
              Settings
            </button>
          </nav>
        </div>

        {/* Right Section: Pro status, Notifications & User Profile */}
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium text-xs"
          >
            <ShieldCheck className="size-3.5 text-emerald-500" />
            ATS Pro v2.4
          </Badge>

          {/* User Profile */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-border/60">
            <div className="relative">
              <Avatar className="size-9 ring-2 ring-primary/20 ring-offset-2 ring-offset-background transition-transform hover:scale-105">
                <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Harsh Pal" />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                  HP
                </AvatarFallback>
              </Avatar>
              <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-background"></span>
            </div>

            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-bold leading-tight text-foreground">
                Harsh Pal
              </span>
              <span className="text-[11px] text-muted-foreground leading-none">
                harsh@example.com
              </span>
            </div>

            <ChevronDown className="size-3.5 text-muted-foreground hidden sm:block" />
          </div>
        </div>
      </div>
    </header>
  );
}
