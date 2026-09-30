import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import ResumeScanner from "@/components/ResumeScanner";

export const metadata: Metadata = {
  title: "AI ATS Resume Scanner & Tailor | SmartResume AI",
  description:
    "Get instant ATS score, missing skills analysis, and a customized resume for your dream job.",
};

export default function Page() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      <div className="mb-10 text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-4">
          <Sparkles className="size-3.5" />
          AI ATS Resume Scanner v2.0
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground max-w-3xl leading-tight font-heading">
          Tailor Your Resume for Your Dream Job.
        </h1>

        <p className="text-muted-foreground text-base sm:text-lg mt-3 max-w-2xl font-normal leading-relaxed">
          Get instant ATS score, missing skills analysis, and a customized
          resume.
        </p>
      </div>

      <ResumeScanner />
    </main>
  );
}
