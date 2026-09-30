import type { Metadata } from "next";
import SettingsForm from "@/components/SettingsForm";

export const metadata: Metadata = {
  title: "ATS Settings & Preferences | SmartResume AI",
  description:
    "Customize keyword extraction strictness, ATS threshold levels, and resume formatting styles.",
};

export default function SettingsPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      <div className="space-y-6">
        <div className="pb-3 border-b border-border/60">
          <h2 className="text-2xl font-bold tracking-tight">
            ATS Settings & Preferences
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Customize keyword extraction strictness, ATS threshold levels, and
            resume formatting styles
          </p>
        </div>

        <SettingsForm />
      </div>
    </main>
  );
}
