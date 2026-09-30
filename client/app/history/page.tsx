import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import HistoryList from "@/components/HistoryList";

export const metadata: Metadata = {
  title: "Resume Scan History | SmartResume AI",
  description:
    "View and re-download previously matched resumes and ATS evaluations.",
};

export default function HistoryPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Resume Scan History
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              View and re-download previously matched resumes and ATS
              evaluations
            </p>
          </div>

          <Link href="/">
            <Button size="sm" className="text-xs gap-1.5">
              <Plus className="size-3.5" />
              New Scan
            </Button>
          </Link>
        </div>

        <HistoryList />
      </div>
    </main>
  );
}
