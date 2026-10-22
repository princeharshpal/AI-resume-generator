import Link from "next/link";
import { Mail, ShieldCheck, Sparkles } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border/70 bg-card/60 backdrop-blur-xs text-muted-foreground text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-1.5 text-center md:text-left">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-foreground font-bold text-base hover:opacity-90 transition-opacity"
          >
            SmartResume<span className="text-primary font-black">AI</span>
          </Link>
          <p className="text-xs text-muted-foreground max-w-sm">
            AI-driven ATS optimization engine to help candidates get shortlisted
            by executive recruiters and hiring managers.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 font-medium">
          <Link href="/" className="hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <Link
            href="/history"
            className="hover:text-foreground transition-colors"
          >
            Scan History
          </Link>
          <a
            href="mailto:support@smartresume.ai"
            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <Mail className="size-3.5" />
            support@smartresume.ai
          </a>
        </div>

        <div className="flex flex-col items-center md:items-end gap-1 text-center md:text-right">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
            <ShieldCheck className="size-3.5" />
            100% Private & ATS Verified
          </div>
          <span className="text-[11px] text-muted-foreground">
            &copy; {currentYear} SmartResume AI. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
