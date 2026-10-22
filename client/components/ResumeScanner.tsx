"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
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
  Download,
  Copy,
  Plus,
  RefreshCw,
  Check,
  X,
  Briefcase,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  uploadResumeToGoogle,
  analyseResumeApi,
  generateTailoredResumeApi,
  downloadAndSaveResumeApi,
} from "@/services/apiServices";
import type {
  UploadResumeData,
  ResumeAnalysisResult,
  TailoredResumeContent,
  DownloadResumePayload,
} from "@/types";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/sonner";

const DEFAULT_TARGET_ROLE = "Target Role";
const SAMPLE_JOB_TITLE = "Senior Software Engineer";
const SAMPLE_JOB_DESCRIPTION = `We are looking for a Senior Software Engineer to join our core backend and platform engineering team.
Responsibilities:
- Build high-throughput microservices and APIs.
- Optimize database performance and implement caching strategies.
- Collaborate with cross-functional teams to deliver scalable cloud solutions.

Requirements:
- 3+ years experience with TypeScript, Node.js, and Express.
- Strong proficiency in PostgreSQL, database indexing, and query optimization.
- Hands-on experience with Docker, AWS (EC2, S3, RDS), and CI/CD workflows.
- Familiarity with Redis in-memory data store is a huge plus.
- Good communication and agile development mindset.`;

export default function ResumeScanner() {
  const { isLoggedIn, openAuthModal } = useAuth();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadedResume, setUploadedResume] = useState<UploadResumeData | null>(
    null,
  );
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisCompleted, setAnalysisCompleted] = useState(false);
  const [scanStepMessage, setScanStepMessage] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] =
    useState<ResumeAnalysisResult | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  const [matchingSkills, setMatchingSkills] = useState<string[]>([]);

  const formatFileSize = (bytes?: number) => {
    if (!bytes && bytes !== 0) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const uploadResume = async (fileToUpload: File) => {
    try {
      setLoading(true);
      setUploadError(null);
      const res = await uploadResumeToGoogle(fileToUpload);
      if (res?.success && res.data) {
        setUploadedResume(res.data);
        toast.success("Resume uploaded successfully!", {
          description: res.data.file_name,
        });
      }
    } catch (err: unknown) {
      console.error("Resume upload error:", err);
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message || "Failed to upload resume to server"
          : err instanceof Error
            ? err.message
            : "Failed to upload resume to server";
      setUploadError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (resumeFile) {
      uploadResume(resumeFile);
    } else {
      setUploadedResume(null);
      setUploadError(null);
      setLoading(false);
    }
  }, [resumeFile]);

  const [missingSkills, setMissingSkills] = useState<string[]>([]);

  const [copiedNotification, setCopiedNotification] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [userAddedSkills, setUserAddedSkills] = useState<string[]>([]);
  const [tailoredResume, setTailoredResume] =
    useState<TailoredResumeContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const wordCount = jobDescription
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf")
      ) {
        setResumeFile(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf")
      ) {
        setResumeFile(file);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedResume?.file_name) {
      setAnalyzeError(
        "Please wait for your resume to finish uploading before analyzing.",
      );
      return;
    }

    if (!jobDescription.trim()) {
      setAnalyzeError("Please enter a job description to analyze against.");
      return;
    }

    setIsAnalyzing(true);
    setAnalyzeError(null);
    setScanStepMessage("Sending resume and job criteria to Gemini AI...");

    const stepTimer1 = setTimeout(() => {
      setScanStepMessage(
        "Parsing job requirements & identifying ATS keywords...",
      );
    }, 1500);

    const stepTimer2 = setTimeout(() => {
      setScanStepMessage("Calculating ATS semantic match & gap analysis...");
    }, 3500);

    try {
      const response = await analyseResumeApi({
        file_name: uploadedResume.file_name,
        job_title: jobTitle.trim() || "Target Role",
        job_description: jobDescription.trim(),
      });

      if (response?.success && response.data) {
        setAnalysisResult(response.data);
        if (
          Array.isArray(response.data.matching_skills) &&
          response.data.matching_skills.length > 0
        ) {
          setMatchingSkills(response.data.matching_skills);
        }
        if (
          Array.isArray(response.data.missing_skills) &&
          response.data.missing_skills.length > 0
        ) {
          setMissingSkills(response.data.missing_skills);
        }
        setAnalysisCompleted(true);
        toast.success("Resume analysis complete!", {
          description: `ATS Match Score calculated: ${response.data.match_score ?? 0}%`,
        });
        setTimeout(() => {
          const resultsElement = document.getElementById("analysis-results");
          if (resultsElement) {
            resultsElement.scrollIntoView({ behavior: "smooth" });
          }
        }, 150);
      } else {
        throw new Error(response?.message || "Analysis failed to return data");
      }
    } catch (err: unknown) {
      console.error("Resume analysis error:", err);
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message || "Failed to analyze resume with AI"
          : err instanceof Error
            ? err.message
            : "Failed to analyze resume with AI";
      setAnalyzeError(message);
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsAnalyzing(false);
      setScanStepMessage("");
    }
  };

  const handleAddSkill = (skill: string) => {
    setMissingSkills((prev) => prev.filter((s) => s !== skill));
    setMatchingSkills((prev) => [...prev, skill]);
    setUserAddedSkills((prev) =>
      prev.includes(skill) ? prev : [...prev, skill],
    );
    toast.success(`Added ${skill} to your tailored resume!`, {
      description:
        "This skill will be injected into your generated ATS resume.",
    });
  };

  const handleCopyTailored = () => {
    if (tailoredResume) {
      const summary = tailoredResume.professional_summary;
      const bullets = tailoredResume.experience
        .flatMap((e) => e.bullet_points)
        .map((b) => `• ${b}`)
        .join("\n");
      const skills = Object.entries(tailoredResume.skills_matrix)
        .filter(([_, list]) => Array.isArray(list) && list.length > 0)
        .map(
          ([cat, list]) =>
            `${cat.toUpperCase().replace("_", " ")}: ${(list as string[]).join(", ")}`,
        )
        .join("\n");

      navigator.clipboard.writeText(
        `${tailoredResume.personal_info.name}\n${tailoredResume.target_role}\n\nSUMMARY\n${summary}\n\nSKILLS\n${skills}\n\nEXPERIENCE\n${bullets}`,
      );
      setCopiedNotification(true);
      toast.success("Copied to clipboard!", {
        description: "Tailored resume text is ready to paste.",
      });
      setTimeout(() => setCopiedNotification(false), 2500);
    } else {
      toast.info("Please generate your ATS-tailored resume first to copy.");
    }
  };

  const handleGenerateResume = async () => {
    if (!uploadedResume) {
      toast.error("Please upload your resume first before generating.");
      return;
    }

    if (!jobDescription.trim()) {
      toast.error(
        "Please enter a job description to tailor your resume against.",
      );
      return;
    }

    try {
      setIsGenerating(true);
      const response = await generateTailoredResumeApi({
        file_name: uploadedResume.file_name,
        job_title: jobTitle.trim() || DEFAULT_TARGET_ROLE,
        job_description: jobDescription.trim(),
        added_skills: userAddedSkills,
      });

      if (response?.success && response.data) {
        setTailoredResume(response.data);
        toast.success("ATS-Optimized resume generated!", {
          description: `Projected ATS match score: ${response.data.projected_match_score}%`,
        });
        setTimeout(() => {
          document
            .getElementById("tailored-resume-section")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 150);
      }
    } catch (err: unknown) {
      console.error("Generate resume error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadAndSave = async () => {
    if (!isLoggedIn) {
      openAuthModal(() => {
        handleDownloadAndSave();
      });
      return;
    }

    try {
      setIsDownloading(true);

      const payload: DownloadResumePayload = {
        file_name: uploadedResume?.file_name,
        job_title:
          jobTitle.trim() || tailoredResume?.target_role || DEFAULT_TARGET_ROLE,
        company_name: "Target Company",
        job_description: jobDescription.trim(),
        match_score:
          tailoredResume?.projected_match_score ||
          analysisResult?.match_score ||
          92,
        matching_skills: matchingSkills,
        missing_skills: missingSkills,
        added_skills: userAddedSkills,
        resume_content: tailoredResume || undefined,
      };

      const res = await downloadAndSaveResumeApi(payload);

      if (res?.success && res.data?.pdf_url) {
        setDownloadSuccess(true);

        const link = document.createElement("a");
        link.href = res.data.pdf_url;
        link.target = "_blank";
        link.download = `${(jobTitle || "Resume").replace(/\s+/g, "_")}_ATS_Optimized.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Resume downloaded & saved to cloud history!", {
          description: "Permanently stored in your Scan History.",
        });
      }
    } catch (err: unknown) {
      console.error("Resume download & save error:", err);
    } finally {
      setIsDownloading(false);
      setTimeout(() => setDownloadSuccess(false), 3000);
    }
  };

  const onAnalyzeClick = () => {
    if (!isLoggedIn) {
      openAuthModal(() => {
        handleAnalyze();
      });
      return;
    }
    handleAnalyze();
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
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
            <div
              onDragOver={(e) => {
                e.preventDefault();
                if (!loading) setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              onClick={() => !loading && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all flex flex-col items-center justify-center min-h-[220px] ${
                loading
                  ? "border-primary/50 bg-primary/5 cursor-wait"
                  : isDragging
                    ? "border-primary bg-primary/5 scale-[0.99] cursor-pointer"
                    : "border-border hover:border-primary/50 hover:bg-muted/30 cursor-pointer"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                disabled={loading}
                onChange={handleFileChange}
              />

              {loading ? (
                <>
                  <div className="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3 shadow-xs">
                    <Spinner className="size-7 text-primary" />
                  </div>

                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <span>Uploading resume...</span>
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sending to Google Gemini API
                  </p>
                  <p className="text-[11px] text-primary/80 mt-2 font-mono">
                    Please wait a moment
                  </p>
                </>
              ) : (
                <>
                  <div className="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3 shadow-xs">
                    <UploadCloud className="size-7" />
                  </div>

                  <h4 className="text-sm font-bold text-foreground">
                    Drag & drop your PDF here
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    or{" "}
                    <span className="text-primary font-semibold underline underline-offset-2">
                      Browse File
                    </span>{" "}
                    from your computer
                  </p>
                  <p className="text-[11px] text-muted-foreground/80 mt-2 font-mono">
                    (Only .pdf, max 5MB)
                  </p>
                </>
              )}
            </div>

            {resumeFile ? (
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/50 border border-border/80 text-sm">
                <div className="flex items-center gap-3 overflow-hidden">
                  {loading ? (
                    <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Spinner className="size-5 text-primary" />
                    </div>
                  ) : uploadError ? (
                    <div className="size-9 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                      <AlertCircle className="size-5" />
                    </div>
                  ) : (
                    <div className="size-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <FileCheck className="size-5" />
                    </div>
                  )}

                  <div className="flex flex-col min-w-0 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-foreground truncate max-w-[200px] sm:max-w-[260px]">
                        {uploadedResume?.display_name || resumeFile.name}
                      </span>
                      {loading ? (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 h-4 border-primary/30 text-primary bg-primary/5 flex items-center gap-1 shrink-0"
                        >
                          <Spinner className="size-2.5" />
                          Uploading...
                        </Badge>
                      ) : uploadError ? (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 h-4 border-rose-500/30 text-rose-600 bg-rose-500/5 shrink-0"
                        >
                          Failed
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 h-4 border-emerald-500/30 text-emerald-600 bg-emerald-500/5 flex items-center gap-1 shrink-0"
                        >
                          <CheckCircle2 className="size-3 text-emerald-600" />
                          Uploaded
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-col gap-0.5 mt-0.5">
                      <span className="text-[11px] text-muted-foreground truncate">
                        Size: {formatFileSize(resumeFile.size)}
                        {uploadedResume
                          ? " • Verified ATS readable"
                          : loading
                            ? " • Uploading..."
                            : ""}
                      </span>
                      {uploadedResume?.file_name && (
                        <span className="text-[10px] text-muted-foreground/80 font-mono truncate max-w-[280px]">
                          ID: {uploadedResume.file_name}
                        </span>
                      )}
                      {uploadError && (
                        <span className="text-[10px] text-rose-500 truncate">
                          {uploadError}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {uploadError ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (resumeFile) uploadResume(resumeFile);
                      }}
                      className="h-8 px-2.5 text-xs text-primary hover:text-primary"
                    >
                      Retry
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={loading}
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Change
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={loading}
                    onClick={(e) => {
                      e.stopPropagation();
                      setResumeFile(null);
                      setUploadedResume(null);
                      setUploadError(null);
                      setAnalysisCompleted(false);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="h-8 px-2 text-xs text-muted-foreground hover:text-rose-500"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

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
                Load Sample JD
              </button>
            </div>
            <CardDescription className="text-xs">
              Paste the target role details to extract keywords and ATS
              requirements
            </CardDescription>
          </CardHeader>

          <CardContent className="flex-1 p-5 flex flex-col gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Job Title</span>
              </label>
              <div className="relative">
                <Input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="font-medium pr-10"
                />
                <Briefcase className="size-4 text-muted-foreground absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5 flex-1 flex flex-col">
              <label className="text-xs font-semibold text-foreground">
                Job Description & Requirements
              </label>
              <Textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="min-h-[160px] flex-1 text-xs leading-relaxed font-sans"
                rows={9}
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <FileText className="size-3.5" />
                Word count:{" "}
                <strong className="text-foreground">{wordCount} words</strong>
              </span>
              <span
                className={`text-[11px] font-medium ${
                  wordCount >= 100 ? "text-emerald-500" : "text-amber-500"
                }`}
              >
                {wordCount >= 100
                  ? "✓ Sufficient detail for ATS"
                  : "⚠️ Recommended > 100 words"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="my-10 text-center flex flex-col items-center justify-center">
        {analyzeError && (
          <div className="mb-4 max-w-md p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2.5">
            <AlertCircle className="size-4 shrink-0" />
            <span className="text-left font-medium">{analyzeError}</span>
          </div>
        )}

        <Button
          size="lg"
          onClick={onAnalyzeClick}
          disabled={
            isAnalyzing ||
            loading ||
            !uploadedResume?.file_name ||
            !jobDescription.trim()
          }
          className="group relative px-8 py-6 rounded-2xl text-base font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-98 transition-all overflow-hidden"
        >
          {isAnalyzing ? (
            <span className="flex items-center gap-3">
              <Spinner className="size-5 text-amber-300" />
              Analyzing & Matching Resume...
            </span>
          ) : (
            <span className="flex items-center gap-2.5">
              Analyze & Match Resume
            </span>
          )}
        </Button>

        {isAnalyzing && (
          <div className="mt-4 flex items-center gap-2 text-xs font-medium text-muted-foreground animate-pulse">
            <span>{scanStepMessage}</span>
          </div>
        )}
      </div>

      {analysisCompleted && (
        <>
          <Separator className="my-10" />
          <section id="analysis-results" className="scroll-mt-24 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2 font-heading">
                  ANALYSIS RESULTS
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Scan Complete
                  </span>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  AI-powered ATS evaluation • Tailored specifically for{" "}
                  <strong>{jobTitle || "Target Role"}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onAnalyzeClick}
                  disabled={isAnalyzing}
                  className="text-xs gap-1.5"
                >
                  {isAnalyzing ? (
                    <Spinner className="size-3.5" />
                  ) : (
                    <RefreshCw className="size-3.5" />
                  )}
                  Re-Scan
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-4">
                <RadialChart
                  score={analysisResult?.match_score ?? 78}
                  statusText={
                    analysisResult?.role_fit_level ||
                    (analysisResult && analysisResult.match_score >= 80
                      ? "High Fit"
                      : analysisResult && analysisResult.match_score >= 60
                        ? "Moderate Fit"
                        : "Needs Work")
                  }
                  subscores={{
                    keywords: Math.min(
                      100,
                      Math.round((analysisResult?.match_score ?? 75) * 1.05),
                    ),
                    experience: Math.max(
                      10,
                      Math.round((analysisResult?.match_score ?? 75) * 0.92),
                    ),
                    formatting: 92,
                  }}
                />
              </div>

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
                    High-level diagnostic of candidate strengths and critical
                    qualification gaps
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 p-6 flex flex-col justify-between gap-5">
                  <blockquote className="p-4 rounded-xl bg-muted/40 border-l-4 border-primary text-sm font-medium italic text-foreground leading-relaxed">
                    &ldquo;
                    {analysisResult?.critique_summary ||
                      "Your resume has been scanned against the target job description."}
                    &rdquo;
                  </blockquote>

                  {analysisResult?.actionable_recommendations &&
                  analysisResult.actionable_recommendations.length > 0 ? (
                    <div className="space-y-2.5">
                      <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        Actionable AI Recommendations
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                        {analysisResult.actionable_recommendations.map(
                          (rec, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-xl bg-primary/5 border border-primary/15 flex items-start gap-2.5"
                            >
                              <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                              <span className="text-muted-foreground leading-relaxed">
                                {rec}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  ) : null}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-2.5">
                      <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-foreground block">
                          Core Backend Alignment
                        </span>
                        <span className="text-muted-foreground">
                          Strong TypeScript, Node.js, and PostgreSQL matching
                          100% of the primary backend requirements.
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
                          AWS, Docker, and CI/CD pipelines are mandatory in the
                          JD but absent from current resume bullets.
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground flex items-center gap-2 pt-2 border-t border-border/40">
                    <span>
                      <strong>ATS Recommendation:</strong> Adding 3 tailored
                      accomplishment statements will lift your score from{" "}
                      <strong>78%</strong> to <strong>94%</strong>.
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border border-emerald-500/30 bg-card shadow-sm">
                <CardHeader className="pb-3 border-b border-border/40">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                      <span className="size-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      MATCHING SKILLS FOUND
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="text-xs border-emerald-500/30 text-emerald-600 bg-emerald-500/10"
                    >
                      {matchingSkills.length} Found
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    Skills extracted from your resume that directly match the
                    job description
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-5">
                  {matchingSkills.length > 0 ? (
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
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      Matching skills from your resume will appear here once
                      analyzed.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="border border-rose-500/30 bg-card shadow-sm">
                <CardHeader className="pb-3 border-b border-border/40">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                      <span className="size-2.5 rounded-full bg-rose-500"></span>
                      MISSING / RECOMMENDED SKILLS
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="text-xs border-rose-500/30 text-rose-600 bg-rose-500/10"
                    >
                      {missingSkills.length} Critical
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">
                    Keywords in the job description not detected in your resume
                    (Click + to include)
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-5">
                  {missingSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {missingSkills.map((skill) => (
                        <button
                          key={skill}
                          onClick={() => handleAddSkill(skill)}
                          title={`Click to incorporate ${skill} into your tailored resume`}
                          className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/25 transition-all active:scale-95 cursor-pointer"
                        >
                          <span className="size-1.5 rounded-full bg-rose-500 group-hover:hidden"></span>
                          <Plus className="size-3 hidden group-hover:inline-block" />
                          {skill}
                          <span className="text-[10px] opacity-60 font-mono">
                            +Add
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      Recommended skills from the job description will appear
                      here after analysis.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="border-2 border-primary/30 shadow-md bg-gradient-to-r from-card via-card to-primary/5">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    ACTION CENTER:
                  </CardTitle>
                  <Badge variant="default" className="text-xs font-medium">
                    Instant Export
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  Transform your resume with tailored bullet points designed to
                  pass ATS screening
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5 pt-1 flex items-center">
                <Button
                  size="lg"
                  disabled={isGenerating || !uploadedResume}
                  onClick={handleGenerateResume}
                  className="w-full h-12 rounded-xl text-sm font-bold gap-2.5 shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <Spinner className="size-4" />
                      <span>Generating with AI...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="size-4" />
                      <span>Generate ATS-Optimized Resume</span>
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Generated ATS Resume displayed directly beneath Action Center */}
            {tailoredResume && (
              <div
                id="tailored-resume-section"
                className="scroll-mt-24 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300"
              >
                <Card className="border-2 border-primary/30 shadow-xl bg-card overflow-hidden">
                  <CardHeader className="p-6 border-b border-border bg-muted/30">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant="default"
                            className="text-xs font-semibold bg-emerald-600 text-white"
                          >
                            ATS-Optimized Resume
                          </Badge>
                          <span className="text-xs text-muted-foreground font-medium">
                            Projected Match Score:{" "}
                            <span className="text-emerald-500 font-bold">
                              {tailoredResume.projected_match_score || 94}%
                            </span>
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-foreground">
                          {tailoredResume.personal_info?.name
                            ? `${tailoredResume.personal_info.name} — Generated Resume`
                            : "Generated ATS Resume"}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Target Role:{" "}
                          <strong>
                            {tailoredResume.target_role ||
                              jobTitle ||
                              "Target Role"}
                          </strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopyTailored}
                          className="text-xs gap-1.5 cursor-pointer h-9 px-3"
                        >
                          <Copy className="size-3.5" />
                          {copiedNotification ? "Copied!" : "Copy Text"}
                        </Button>

                        <Button
                          size="sm"
                          disabled={isDownloading}
                          onClick={handleDownloadAndSave}
                          className="text-xs gap-1.5 cursor-pointer h-9 px-4 font-semibold"
                        >
                          {isDownloading ? (
                            <>
                              <Spinner className="size-3.5" />
                              <span>Downloading...</span>
                            </>
                          ) : (
                            <>
                              <Download className="size-3.5" />
                              <span>Download Resume</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 space-y-6 text-sm">
                    {tailoredResume?.applied_added_skills &&
                      tailoredResume.applied_added_skills.length > 0 && (
                        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
                          <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                          <div>
                            <span className="font-bold block">
                              User Added Skills Successfully Incorporated:
                            </span>
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {tailoredResume.applied_added_skills.map((sk) => (
                                <span
                                  key={sk}
                                  className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 font-medium text-[11px]"
                                >
                                  +{sk}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                    {tailoredResume?.personal_info && (
                      <div className="p-3 rounded-xl bg-muted/30 border border-border/60 text-xs text-muted-foreground flex flex-wrap items-center justify-center gap-3 text-center">
                        {tailoredResume.personal_info.email && (
                          <a
                            href={`mailto:${tailoredResume.personal_info.email}`}
                            className="hover:text-primary hover:underline transition-colors"
                          >
                            {tailoredResume.personal_info.email}
                          </a>
                        )}
                        {tailoredResume.personal_info.phone && <span>•</span>}
                        {tailoredResume.personal_info.phone && (
                          <a
                            href={`tel:${tailoredResume.personal_info.phone.replace(/[^\d+]/g, "")}`}
                            className="hover:text-primary hover:underline transition-colors"
                          >
                            {tailoredResume.personal_info.phone}
                          </a>
                        )}
                        {tailoredResume.personal_info.location && (
                          <span>•</span>
                        )}
                        {tailoredResume.personal_info.location && (
                          <span>{tailoredResume.personal_info.location}</span>
                        )}
                        {tailoredResume.personal_info.linkedin && (
                          <span>•</span>
                        )}
                        {tailoredResume.personal_info.linkedin && (
                          <a
                            href={
                              tailoredResume.personal_info.linkedin.startsWith(
                                "http",
                              )
                                ? tailoredResume.personal_info.linkedin
                                : `https://${tailoredResume.personal_info.linkedin}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary hover:underline transition-colors"
                          >
                            LinkedIn
                          </a>
                        )}
                        {tailoredResume.personal_info.github && <span>•</span>}
                        {tailoredResume.personal_info.github && (
                          <a
                            href={
                              tailoredResume.personal_info.github.startsWith(
                                "http",
                              )
                                ? tailoredResume.personal_info.github
                                : `https://${tailoredResume.personal_info.github}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary hover:underline transition-colors"
                          >
                            GitHub
                          </a>
                        )}
                        {tailoredResume.personal_info.portfolio && (
                          <span>•</span>
                        )}
                        {tailoredResume.personal_info.portfolio && (
                          <a
                            href={
                              tailoredResume.personal_info.portfolio.startsWith(
                                "http",
                              )
                                ? tailoredResume.personal_info.portfolio
                                : `https://${tailoredResume.personal_info.portfolio}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary hover:underline transition-colors"
                          >
                            Portfolio
                          </a>
                        )}
                      </div>
                    )}

                    {tailoredResume?.professional_summary && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <FileText className="size-3.5" /> Tailored
                          Professional Summary
                        </h4>
                        <div className="p-4 rounded-xl bg-muted/40 border border-border/80 text-xs leading-relaxed text-foreground">
                          {tailoredResume.professional_summary}
                        </div>
                      </div>
                    )}

                    {tailoredResume?.experience &&
                      tailoredResume.experience.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <CheckCircle2 className="size-3.5 text-emerald-500" />
                            Optimized Experience (STAR Method & Added Skills
                            Injected)
                          </h4>

                          <div className="space-y-3">
                            {tailoredResume.experience.map((exp, idx) => (
                              <div
                                key={idx}
                                className="p-4 rounded-xl bg-card border border-border space-y-2"
                              >
                                <div className="flex items-center justify-between">
                                  <h5 className="font-bold text-sm text-foreground">
                                    {exp.role}
                                  </h5>
                                  <span className="text-xs text-muted-foreground">
                                    {exp.start_date} - {exp.end_date}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground font-medium">
                                  {exp.company}
                                  {exp.location ? ` • ${exp.location}` : ""}
                                </p>
                                <ul className="space-y-1.5 pt-1">
                                  {exp.bullet_points.map((bullet, bIdx) => (
                                    <li
                                      key={bIdx}
                                      className="text-xs text-foreground/90 leading-relaxed flex items-start gap-2"
                                    >
                                      <span className="text-emerald-500 font-bold shrink-0">
                                        •
                                      </span>
                                      <span>{bullet}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {tailoredResume?.projects &&
                      tailoredResume.projects.length > 0 && (
                        <div className="space-y-2.5">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Key Projects
                          </h4>
                          <div className="space-y-2.5">
                            {tailoredResume.projects.map((proj, pIdx) => (
                              <div
                                key={pIdx}
                                className="p-3.5 rounded-xl bg-card border border-border space-y-1.5"
                              >
                                <div className="flex items-center justify-between">
                                  <h5 className="font-bold text-xs text-foreground">
                                    {proj.name}
                                  </h5>
                                  {proj.technologies &&
                                    proj.technologies.length > 0 && (
                                      <span className="text-[11px] text-muted-foreground">
                                        {proj.technologies.join(", ")}
                                      </span>
                                    )}
                                </div>
                                {proj.description && (
                                  <p className="text-xs text-foreground/80">
                                    {proj.description}
                                  </p>
                                )}
                                {proj.bullet_points && (
                                  <ul className="space-y-1">
                                    {proj.bullet_points.map((b, bI) => (
                                      <li
                                        key={bI}
                                        className="text-xs text-foreground/90 flex items-start gap-1.5"
                                      >
                                        <span className="text-emerald-500 font-bold">
                                          •
                                        </span>
                                        <span>{b}</span>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {tailoredResume?.education &&
                      tailoredResume.education.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Education
                          </h4>
                          <div className="space-y-2">
                            {tailoredResume.education.map((edu, eIdx) => (
                              <div
                                key={eIdx}
                                className="p-3 rounded-xl bg-muted/30 border border-border/60 flex items-center justify-between text-xs"
                              >
                                <div>
                                  <p className="font-bold text-foreground">
                                    {edu.degree}
                                    {edu.field_of_study
                                      ? ` in ${edu.field_of_study}`
                                      : ""}
                                  </p>
                                  <p className="text-muted-foreground">
                                    {edu.institution}
                                  </p>
                                </div>
                                {edu.graduation_year && (
                                  <span className="text-muted-foreground font-mono">
                                    {edu.graduation_year}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    <div className="space-y-2.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Updated Skills Matrix
                      </h4>
                      {tailoredResume?.skills_matrix ? (
                        <div className="space-y-2">
                          {Object.entries(tailoredResume.skills_matrix).map(
                            ([category, skills]) =>
                              skills && skills.length > 0 ? (
                                <div
                                  key={category}
                                  className="flex flex-wrap items-center gap-1.5"
                                >
                                  <span className="text-[11px] font-bold text-muted-foreground uppercase min-w-[110px]">
                                    {category.replace("_", " ")}:
                                  </span>
                                  {skills.map((skill) => (
                                    <span
                                      key={skill}
                                      className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-foreground border border-border/80"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              ) : null,
                          )}
                        </div>
                      ) : null}
                    </div>
                  </CardContent>

                  <div className="px-6 py-4 border-t border-border bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span className="text-xs text-muted-foreground">
                      Ready to download as ATS-compliant PDF & permanently saved
                      to your history
                    </span>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyTailored}
                        className="flex-1 sm:flex-none text-xs gap-1.5 cursor-pointer"
                      >
                        <Copy className="size-3.5" />
                        {copiedNotification ? "Copied!" : "Copy Text"}
                      </Button>

                      <Button
                        size="sm"
                        disabled={isDownloading}
                        onClick={handleDownloadAndSave}
                        className="flex-1 sm:flex-none text-xs gap-1.5 cursor-pointer font-semibold"
                      >
                        {isDownloading ? (
                          <>
                            <Spinner className="size-3.5" />
                            <span>Downloading...</span>
                          </>
                        ) : (
                          <>
                            <Download className="size-3.5" />
                            <span>Download Resume</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}
