"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, LayoutDashboard, History } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";

const navLinks = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/history", label: "History", icon: History },
];

export default function Header() {
  const pathname = usePathname();
  const { user, isLoggedIn, logout, openAuthModal } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-background/85 border-b border-border/70 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center">
          <Link
            href="/"
            className="flex flex-col group transition-transform active:scale-98"
          >
            <span className="text-lg font-bold tracking-tight text-foreground flex items-center gap-1.5">
              SmartResume<span className="text-primary font-black">AI</span>
            </span>
            <span className="text-[10px] -mt-1 font-medium text-muted-foreground tracking-wide uppercase">
              ATS Optimizer
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center justify-center gap-8">
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`text-sm transition-colors hover:text-foreground ${
                  isActive
                    ? "font-semibold text-foreground"
                    : "font-medium text-muted-foreground"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <div className="relative hidden md:block" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="relative rounded-full focus:outline-none"
              >
                <Avatar className="size-9 ring-2 ring-primary/20 ring-offset-2 ring-offset-background transition-transform hover:scale-105 cursor-pointer">
                  <AvatarImage
                    src={user?.avatar}
                    alt={user?.name || "Profile"}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                    {user?.name ? user.name.slice(0, 2).toUpperCase() : "HP"}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-card border border-border shadow-lg py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3.5 py-2 border-b border-border/60">
                    <p className="text-xs font-bold text-foreground truncate">
                      {user?.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-rose-500 hover:bg-rose-500/10 transition-colors text-left font-medium"
                  >
                    <LogOut className="size-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Button
              size="sm"
              onClick={() => openAuthModal()}
              className="text-xs font-semibold px-4 rounded-xl"
            >
              Sign In
            </Button>
          )}

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger
              className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors focus:outline-none cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-72 max-w-[85vw] p-6 flex flex-col justify-between"
            >
              <div className="space-y-6">
                <SheetHeader className="p-0 text-left border-b border-border/60 pb-4">
                  <SheetTitle className="flex flex-col">
                    <span className="text-lg font-bold tracking-tight text-foreground flex items-center gap-1.5">
                      SmartResume
                      <span className="text-primary font-black">AI</span>
                    </span>
                    <span className="text-[10px] -mt-0.5 font-medium text-muted-foreground tracking-wide uppercase">
                      ATS Optimizer
                    </span>
                  </SheetTitle>
                </SheetHeader>

                <nav className="flex flex-col space-y-1">
                  {navLinks.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href;
                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                          isActive
                            ? "bg-primary/10 text-primary font-bold"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground font-medium"
                        }`}
                      >
                        <Icon className="size-4" />
                        {label}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {isLoggedIn ? (
                <div className="pt-4 border-t border-border/60 space-y-4">
                  <div className="flex items-center gap-3 px-1">
                    <div className="relative shrink-0">
                      <Avatar className="size-10 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                        <AvatarImage
                          src={user?.avatar}
                          alt={user?.name || "Profile"}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                          {user?.name
                            ? user.name.slice(0, 2).toUpperCase()
                            : "HP"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs text-rose-500 bg-rose-500/10 hover:bg-rose-500/15 font-medium transition-colors"
                  >
                    <LogOut className="size-4" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-border/60">
                  <Button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal();
                    }}
                    className="w-full rounded-xl text-xs font-semibold"
                  >
                    Sign In
                  </Button>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
