"use client";

import React, { useState, useId, useRef } from "react";
import Header from "@/components/Header";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import RadialChart from "@/components/RadialChart";
import {
  UploadCloud,
  FileText,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Zap,
  Download,
  Copy,
  Plus,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Trash2,
  SlidersHorizontal,
  Clock,
  Check,
  X,
  Eye,
  ArrowRight,
  Briefcase,
  Layers,
} from "lucide-react";

// Sample Job Description for fast one-click testing
const SAMPLE_JOB_TITLE = "Full Stack Developer";
const SAMPLE_JOB_DESCRIPTION = `We are seeking an experienced Full Stack Developer to join our core engineering team.

Responsibilities:
- Build, optimize, and maintain scalable web services and REST APIs using Node.js, Express, and TypeScript.
- Architect reliable relational databases using PostgreSQL and design performant schemas.
- Collaborate with frontend teams to deliver responsive interfaces with React and Next.js.
- Implement containerization with Docker and deploy services to AWS cloud infrastructure.
- Build automated CI/CD pipelines to ensure seamless delivery and zero-downtime deployments.
- Integrate Redis caching layers for high-throughput microservices.

Requirements:
- 3+ years experience with TypeScript, Node.js, and Express.
- Strong proficiency in PostgreSQL, database indexing, and query optimization.
- Hands-on experience with Docker, AWS (EC2, S3, RDS), and CI/CD workflows.
- Familiarity with Redis in-memory data store is a huge plus.
- Good communication and agile development mindset.`;

export default function Page() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<"dashboard" | "history" | "settings">("dashboard");

  // Step 1: Resume Upload State
  const [resumeFile, setResumeFile] = useState<{
    name: string;
    size: string;
  } | null>({
    name: "my_latest_resume.pdf",
    size: "1.8 MB",
  });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 2: Job Description State
  const [jobTitle, setJobTitle] = useState("Full Stack Developer");
  const [jobDescription, setJobDescription] = useState(SAMPLE_JOB_DESCRIPTION);

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisCompleted, setAnalysisCompleted] = useState(true);
  const [scanStepMessage, setScanStepMessage] = useState("");

  // Skills State
  const [matchingSkills, setMatchingSkills] = useState<string[]>([
    "TypeScript",
    "Node.js",
    "PostgreSQL",
    "Express",
    "REST APIs",
    "React",
    "Git",
  ]);

  const [missingSkills, setMissingSkills] = useState<string[]>([
    "Docker",
    "Redis",
    "AWS",
    "CI/CD Pipelines",
    "Kubernetes",
  ]);

  // Modal / Resume Preview State
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Dynamic Word Count Calculation
  const wordCount = jobDescription
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  // File Handlers
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
        setResumeFile({
          name: file.name,
          size: `${sizeMb} MB`,
        });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setResumeFile({
        name: file.name,
        size: `${sizeMb} MB`,
      });
    }
  };

  // Trigger Simulated AI Analysis
  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setScanStepMessage("Extracting resume skills & experience...");

    setTimeout(() => {
      setScanStepMessage("Parsing job requirements & weighting ATS keywords...");
    }, 800);

    setTimeout(() => {
      setScanStepMessage("Calculating ATS semantic match & gap analysis...");
    }, 1500);

    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisCompleted(true);
      setScanStepMessage("");
      // Smoothly scroll down to results
      const resultsElement = document.getElementById("analysis-results");
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: "smooth" });
      }
    }, 2200);
  };

  // Add missing skill into matching
  const handleAddSkill = (skill: string) => {
    setMissingSkills((prev) => prev.filter((s) => s !== skill));
    setMatchingSkills((prev) => [...prev, skill]);
  };

  // Copy helper
  const handleCopyTailored = () => {
    navigator.clipboard.writeText(`• Architected and deployed containerized Node.js & TypeScript microservices using Docker, streamlining CI/CD pipelines and cutting release cycle by 35%.
• Integrated Redis caching layers with PostgreSQL database to handle 10,000+ req/sec with sub-50ms latency.
• Provisioned cloud infrastructure on AWS (EC2, S3) with zero downtime deployments.`);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  // Download helper
  const handleDownloadPdf = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 text-foreground pb-20">
      {/* Top Navbar */}
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* =========================================================================
            DASHBOARD VIEW (Main App Workflow)
           ========================================================================= */}
        {activeTab === "dashboard" && (
          <>
            {/* Hero Header matching design */}
            <div className="mb-10 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-4">
                <Sparkles className="size-3.5" />
                AI ATS Resume Scanner v2.0
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground max-w-3xl leading-tight font-heading">
                Tailor Your Resume for Your Dream Job.
              </h1>

              <p className="text-muted-foreground text-base sm:text-lg mt-3 max-w-2xl font-normal leading-relaxed">
                Get instant ATS score, missing skills analysis, and a customized resume.
              </p>
            </div>

            {/* Step 1 & Step 2 Card Container */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              {/* ================= STEP 1: Upload Current Resume ================= */}
              <Card className="flex flex-col border border-border/80 shadow-sm bg-card hover:shadow-md transition-shadow">
                <CardHeader className="pb-3 border-b border-border/40">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <span className="flex items-center justify-center size-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        1
                      </span>
                      STEP 1: Upload Current Resume
                    </CardTitle>
                    <Badge variant="outline" className="text-xs font-medium">
                      PDF Only
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    Upload your existing resume to compare against job criteria
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 p-5 flex flex-col justify-between gap-4">
                  {/* Dropzone Area */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleFileDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[220px] ${
                      isDragging
                        ? "border-primary bg-primary/5 scale-[0.99]"
                        : "border-border hover:border-primary/50 hover:bg-muted/30"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={handleFileChange}
                    />

                    <div className="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3 shadow-xs">
                      <UploadCloud className="size-7" />
                    </div>

                    <h4 className="text-sm font-bold text-foreground">
                      Drag & drop your PDF here
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      or <span className="text-primary font-semibold underline underline-offset-2">Browse File</span> from your computer
                    </p>
                    <p className="text-[11px] text-muted-foreground/80 mt-2 font-mono">
                      (Only .pdf, max 5MB)
                    </p>
                  </div>

                  {/* Selected File Display matching wireframe */}
                  {resumeFile ? (
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/50 border border-border/80 text-sm">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="size-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                          <FileCheck className="size-5" />
                        </div>
                        <div className="flex flex-col min-w-0 text-left">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-foreground truncate">
                              Selected: <span className="text-primary">{resumeFile.name}</span>
                            </span>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-emerald-500/30 text-emerald-600 bg-emerald-500/5">
                              Ready
                            </Badge>
                          </div>
                          <span className="text-[11px] text-muted-foreground">
                            {resumeFile.size} • PDF Document
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setResumeFile(null);
                        }}
                        title="Remove file"
                        className="text-muted-foreground hover:text-destructive shrink-0"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground text-center py-2 italic">
                      No resume selected yet. Please upload a PDF to continue.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* ================= STEP 2: Paste Job Description ================= */}
              <Card className="flex flex-col border border-border/80 shadow-sm bg-card hover:shadow-md transition-shadow">
                <CardHeader className="pb-3 border-b border-border/40">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <span className="flex items-center justify-center size-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        2
                      </span>
                      STEP 2: Paste Job Description
                    </CardTitle>
                    <button
                      type="button"
                      onClick={() => {
                        setJobTitle(SAMPLE_JOB_TITLE);
                        setJobDescription(SAMPLE_JOB_DESCRIPTION);
                      }}
                      className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
                    >
                      <Sparkles className="size-3" />
                      Load Sample JD
                    </button>
                  </div>
                  <CardDescription className="text-xs">
                    Paste the target role details to extract keywords and ATS requirements
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 p-5 flex flex-col gap-3">
                  {/* Job Title Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                      <span>Job Title</span>
                      <span className="text-[11px] text-muted-foreground font-normal">
                        e.g., Full Stack Developer
                      </span>
                    </label>
                    <div className="relative">
                      <Input
                        type="text"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="Job Title: Full Stack Developer"
                        className="font-medium pr-10"
                      />
                      <Briefcase className="size-4 text-muted-foreground absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  {/* Job Description Textarea */}
                  <div className="space-y-1.5 flex-1 flex flex-col">
                    <label className="text-xs font-semibold text-foreground">
                      Job Description & Requirements
                    </label>
                    <Textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the full job description here including requirements, qualifications, and skills..."
                      className="min-h-[160px] flex-1 text-xs leading-relaxed font-sans"
                      rows={9}
                    />
                  </div>

                  {/* Word Count Indicator matching wireframe */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <FileText className="size-3.5" />
                      Word count: <strong className="text-foreground">{wordCount} words</strong>
                    </span>
                    <span
                      className={`text-[11px] font-medium ${
                        wordCount >= 100
                          ? "text-emerald-500"
                          : "text-amber-500"
                      }`}
                    >
                      {wordCount >= 100 ? "✓ Sufficient detail for ATS" : "⚠️ Recommended > 100 words"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ================= PRIMARY ACTION BUTTON ================= */}
            <div className="my-10 text-center flex flex-col items-center justify-center">
              <Button
                size="lg"
                onClick={handleAnalyze}
                disabled={isAnalyzing || !resumeFile || !jobDescription.trim()}
                className="group relative px-8 py-6 rounded-2xl text-base font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-98 transition-all overflow-hidden"
              >
                {isAnalyzing ? (
                  <span className="flex items-center gap-3">
                    <RefreshCw className="size-5 animate-spin text-amber-300" />
                    Analyzing & Matching Resume...
                  </span>
                ) : (
                  <span className="flex items-center gap-2.5">
                    <Zap className="size-5 fill-amber-300 text-amber-300 group-hover:scale-110 transition-transform" />
                    Analyze & Match Resume
                  </span>
                )}
              </Button>

              {/* Progress status ticker when scanning */}
              {isAnalyzing && (
                <div className="mt-4 flex items-center gap-2 text-xs font-medium text-muted-foreground animate-pulse">
                  <Sparkles className="size-3.5 text-primary" />
                  <span>{scanStepMessage}</span>
                </div>
              )}
            </div>

            <Separator className="my-10" />

            {/* =========================================================================
                ANALYSIS RESULTS SECTION (Visible after AI call completes)
               ========================================================================= */}
            {analysisCompleted && (
              <section id="analysis-results" className="scroll-mt-24 space-y-6">
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2 font-heading">
                      ANALYSIS RESULTS
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        Scan Complete
                      </span>
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Visible after AI call completes • Tailored specifically for <strong>{jobTitle || "Target Role"}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAnalyze}
                      className="text-xs gap-1.5"
                    >
                      <RefreshCw className="size-3.5" />
                      Re-Scan
                    </Button>
                  </div>
                </div>

                {/* Top Row: Match Score Radial Gauge & Key Insights */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  {/* Radial Gauge Card (4 cols) */}
                  <div className="lg:col-span-4">
                    <RadialChart
                      score={78}
                      statusText="Needs Work"
                      subscores={{
                        keywords: 82,
                        experience: 74,
                        formatting: 91,
                      }}
                    />
                  </div>

                  {/* Key Insights & Summary Card (8 cols) */}
                  <Card className="lg:col-span-8 flex flex-col border border-border/80 shadow-sm bg-card">
                    <CardHeader className="pb-3 border-b border-border/40">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                          <FileText className="size-4 text-primary" />
                          KEY INSIGHTS & SUMMARY
                        </CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          AI Executive Review
                        </Badge>
                      </div>
                      <CardDescription className="text-xs">
                        High-level diagnostic of candidate strengths and critical qualification gaps
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="flex-1 p-6 flex flex-col justify-between gap-5">
                      {/* Quote from wireframe */}
                      <blockquote className="p-4 rounded-xl bg-muted/40 border-l-4 border-amber-500 text-sm font-medium italic text-foreground leading-relaxed">
                        &ldquo;Your backend and Node.js expertise aligns well with the role, but cloud deployment and CI/CD skills are missing.&rdquo;
                      </blockquote>

                      {/* Detailed bullets */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-2.5">
                          <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-foreground block">
                              Core Backend Alignment
                            </span>
                            <span className="text-muted-foreground">
                              Strong TypeScript, Node.js, and PostgreSQL matching 100% of the primary backend requirements.
                            </span>
                          </div>
                        </div>

                        <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 flex items-start gap-2.5">
                          <AlertCircle className="size-4 text-rose-500 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-foreground block">
                              Cloud & DevOps Missing
                            </span>
                            <span className="text-muted-foreground">
                              AWS, Docker, and CI/CD pipelines are mandatory in the JD but absent from current resume bullets.
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground flex items-center gap-2 pt-2 border-t border-border/40">
                        <Sparkles className="size-3.5 text-amber-500" />
                        <span>
                          <strong>ATS Recommendation:</strong> Adding 3 tailored accomplishment statements will lift your score from <strong>78%</strong> to <strong>94%</strong>.
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Bottom Row: Matching Skills (Green) & Missing Skills (Red) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Matching Skills Found */}
                  <Card className="border border-emerald-500/30 bg-card shadow-sm">
                    <CardHeader className="pb-3 border-b border-border/40">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                          <span className="size-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          🟢 MATCHING SKILLS FOUND (Green Badges)
                        </CardTitle>
                        <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-600 bg-emerald-500/10">
                          {matchingSkills.length} Found
                        </Badge>
                      </div>
                      <CardDescription className="text-xs">
                        Skills extracted from your resume that directly match the job description
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="p-5">
                      <div className="flex flex-wrap gap-2">
                        {matchingSkills.map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 shadow-2xs hover:bg-emerald-500/15 transition-colors"
                          >
                            <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                            {skill}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Missing / Recommended Skills */}
                  <Card className="border border-rose-500/30 bg-card shadow-sm">
                    <CardHeader className="pb-3 border-b border-border/40">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                          <span className="size-2.5 rounded-full bg-rose-500"></span>
                          🔴 MISSING / RECOMMENDED (Red/Gray)
                        </CardTitle>
                        <Badge variant="outline" className="text-xs border-rose-500/30 text-rose-600 bg-rose-500/10">
                          {missingSkills.length} Critical
                        </Badge>
                      </div>
                      <CardDescription className="text-xs">
                        Keywords in the job description not detected in your resume (Click + to include)
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="p-5">
                      <div className="flex flex-wrap gap-2">
                        {missingSkills.map((skill) => (
                          <button
                            key={skill}
                            onClick={() => handleAddSkill(skill)}
                            title={`Click to incorporate ${skill} into your tailored resume`}
                            className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/25 transition-all active:scale-95"
                          >
                            <span className="size-1.5 rounded-full bg-rose-500 group-hover:hidden"></span>
                            <Plus className="size-3 hidden group-hover:inline-block" />
                            {skill}
                            <span className="text-[10px] opacity-60 font-mono">+Add</span>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* ================= ACTION CENTER ================= */}
                <Card className="border-2 border-primary/30 shadow-md bg-gradient-to-r from-card via-card to-primary/5">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-bold flex items-center gap-2">
                        <Sparkles className="size-4 text-primary" />
                        ACTION CENTER:
                      </CardTitle>
                      <Badge variant="default" className="text-xs font-medium">
                        Instant Export
                      </Badge>
                    </div>
                    <CardDescription className="text-xs">
                      Transform your resume with tailored bullet points designed to pass ATS screening
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-5 pt-1 flex flex-col sm:flex-row items-center gap-4">
                    {/* Primary Button 1: Generate ATS-Optimized Resume */}
                    <Button
                      size="lg"
                      onClick={() => setShowResumeModal(true)}
                      className="w-full sm:w-auto flex-1 h-12 rounded-xl text-sm font-bold gap-2.5 shadow-sm hover:shadow-md transition-all"
                    >
                      <FileText className="size-4" />
                      Generate ATS-Optimized Resume
                    </Button>

                    {/* Primary Button 2: Download Tailored PDF */}
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={handleDownloadPdf}
                      className="w-full sm:w-auto flex-1 h-12 rounded-xl text-sm font-bold gap-2.5 border-primary/30 hover:bg-primary/5 transition-all"
                    >
                      <Download className="size-4 text-primary" />
                      {downloadSuccess ? "Downloaded Tailored PDF ✓" : "Download Tailored PDF"}
                    </Button>

                    {/* Secondary Action: Copy Text */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyTailored}
                      className="w-full sm:w-auto h-12 px-4 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground"
                    >
                      {copiedNotification ? (
                        <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                          <Check className="size-3.5" /> Copied!
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Copy className="size-3.5" /> Copy Bullets
                        </span>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </section>
            )}
          </>
        )}

        {/* =========================================================================
            HISTORY VIEW (Past Resumes & Scans)
           ========================================================================= */}
        {activeTab === "history" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Resume Scan History</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  View and re-download previously matched resumes and ATS evaluations
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab("dashboard")}
                className="text-xs gap-1.5"
              >
                <Plus className="size-3.5" />
                New Scan
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {[
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
              ].map((item) => (
                <Card key={item.id} className="p-5 border border-border/80 hover:border-primary/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="size-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                      {item.score}%
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-foreground">{item.role}</h4>
                        <span className="text-xs text-muted-foreground">• {item.company}</span>
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
                      <div className="flex gap-1.5 mt-2">
                        {item.skills.map((s) => (
                          <span key={s} className="text-[10px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-mono">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setActiveTab("dashboard");
                        setJobTitle(item.role);
                      }}
                      className="text-xs"
                    >
                      Load Scan
                    </Button>
                    <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                      <Download className="size-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            SETTINGS VIEW (ATS Engine Configuration)
           ========================================================================= */}
        {activeTab === "settings" && (
          <div className="space-y-6 max-w-3xl">
            <div className="pb-3 border-b border-border/60">
              <h2 className="text-2xl font-bold tracking-tight">ATS Settings & Preferences</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Customize keyword extraction strictness, ATS threshold levels, and resume formatting styles
              </p>
            </div>

            <Card className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground block">
                  Target ATS Scoring Threshold
                </label>
                <p className="text-xs text-muted-foreground">
                  Resumes scoring above this threshold are marked as &ldquo;Ready to Submit&rdquo;.
                </p>
                <div className="flex items-center gap-4 pt-1">
                  <Input type="number" defaultValue="80" className="w-28 font-mono" />
                  <span className="text-xs text-muted-foreground">% minimum match recommended</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground block">
                  AI Model Optimization Depth
                </label>
                <p className="text-xs text-muted-foreground">
                  Select depth of semantic matching and industry-specific buzzword analysis.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl border-2 border-primary bg-primary/5 cursor-pointer text-left">
                    <div className="text-xs font-bold text-foreground">Strict ATS Filter</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">Focus on exact keyword frequency</div>
                  </div>
                  <div className="p-3.5 rounded-xl border border-border hover:border-primary/50 cursor-pointer text-left">
                    <div className="text-xs font-bold text-foreground">Semantic Match</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">Matches concepts & synonyms</div>
                  </div>
                  <div className="p-3.5 rounded-xl border border-border hover:border-primary/50 cursor-pointer text-left">
                    <div className="text-xs font-bold text-foreground">Executive Balance</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">Balanced for human recruiter review</div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" size="sm" onClick={() => setActiveTab("dashboard")}>
                  Cancel
                </Button>
                <Button size="sm" onClick={() => setActiveTab("dashboard")}>
                  Save Preferences
                </Button>
              </div>
            </Card>
          </div>
        )}
      </main>

      {/* =========================================================================
          ATS OPTIMIZED RESUME MODAL / PREVIEW
         ========================================================================= */}
      {showResumeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border max-w-3xl w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Sparkles className="size-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    ATS-Optimized Resume Preview
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Tailored specifically for <strong>{jobTitle}</strong> • Projected Score: <span className="text-emerald-500 font-bold">94%</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowResumeModal(false)}
                className="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              {/* Professional Summary tailored */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <FileText className="size-3.5" /> Tailored Professional Summary
                </h4>
                <div className="p-4 rounded-xl bg-muted/40 border border-border/80 text-xs leading-relaxed text-foreground">
                  Results-oriented <strong>Full Stack Developer</strong> with 4+ years of hands-on experience architecting scalable distributed systems using <strong>Node.js</strong>, <strong>Express</strong>, and <strong>TypeScript</strong>. Proven track record managing relational <strong>PostgreSQL</strong> databases, implementing <strong>Docker</strong> containerization, and establishing robust <strong>CI/CD pipelines</strong> on <strong>AWS</strong>. Adept at leveraging <strong>Redis</strong> caching layers to optimize application response times by over 40%.
                </div>
              </div>

              {/* Work Experience Bullet Points with Diff Highlights */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                  Optimized Experience Bullets (Keywords Injected)
                </h4>

                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-foreground leading-relaxed">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
                      + Added Missing Keywords (Docker & CI/CD):
                    </span>
                    &bull; Spearheaded migration of core backend microservices to <strong>Docker</strong> containers and integrated automated <strong>CI/CD pipelines</strong>, cutting release deployment cycles by 35%.
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-foreground leading-relaxed">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
                      + Added Missing Keywords (Redis & PostgreSQL):
                    </span>
                    &bull; Implemented <strong>Redis</strong> distributed caching layer alongside <strong>PostgreSQL</strong> query optimization, serving 10M+ daily requests with sub-50ms latency.
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-foreground leading-relaxed">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
                      + Added Missing Keywords (AWS Infrastructure):
                    </span>
                    &bull; Architected and monitored cloud infrastructure on <strong>AWS (EC2, S3)</strong> with auto-scaling policies, ensuring 99.98% service uptime.
                  </div>
                </div>
              </div>

              {/* Skills section preview */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Updated Technical Skills Matrix
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "TypeScript",
                    "Node.js",
                    "PostgreSQL",
                    "Express",
                    "React",
                    "Docker",
                    "Redis",
                    "AWS",
                    "CI/CD Pipelines",
                    "REST APIs",
                    "Git",
                  ].map((sk) => (
                    <span
                      key={sk}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-muted text-foreground border border-border/80"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="px-6 py-4 border-t border-border bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">
                Ready to submit to recruiters and job portals
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyTailored}
                  className="flex-1 sm:flex-none text-xs gap-1.5"
                >
                  <Copy className="size-3.5" />
                  {copiedNotification ? "Copied!" : "Copy Text"}
                </Button>

                <Button
                  size="sm"
                  onClick={() => {
                    handleDownloadPdf();
                    setShowResumeModal(false);
                  }}
                  className="flex-1 sm:flex-none text-xs gap-1.5"
                >
                  <Download className="size-3.5" />
                  Download PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
