"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Clock, Download, Lock, Trash2, ExternalLink, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/context/AuthContext";
import { getResumeHistoryApi, deleteResumeHistoryApi } from "@/services/apiServices";
import type { ResumeHistoryItem } from "@/types";
import { toast } from "@/components/ui/sonner";

export default function HistoryList() {
  const { isLoggedIn, openAuthModal } = useAuth();
  const [historyList, setHistoryList] = useState<ResumeHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchHistory = async () => {
    if (!isLoggedIn) return;
    try {
      setIsLoading(true);
      const res = await getResumeHistoryApi();
      if (res?.success && Array.isArray(res.data)) {
        setHistoryList(res.data);
      } else {
        setHistoryList([]);
      }
    } catch (err) {
      console.error("Failed to fetch resume history:", err);
      setHistoryList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchHistory();
    } else {
      setHistoryList([]);
    }
  }, [isLoggedIn]);

  const handleDelete = async (id: number) => {
    try {
      setDeletingId(id);
      const res = await deleteResumeHistoryApi(id);
      if (res?.success) {
        setHistoryList((prev) => prev.filter((item) => item.id !== id));
        toast.success("Resume removed from history");
      }
    } catch (err) {
      console.error("Failed to delete resume history item:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = (item: ResumeHistoryItem) => {
    if (!item.pdf_url) {
      toast.error("Download link is not available");
      return;
    }
    const link = document.createElement("a");
    link.href = item.pdf_url;
    link.target = "_blank";
    link.download = `${(item.job_title || "Resume").replace(/\s+/g, "_")}_ATS.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Downloading resume...");
  };

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
          Please sign in to view and download your saved ATS resumes.
        </p>
        <Button onClick={() => openAuthModal()} className="font-bold w-full cursor-pointer">
          Sign In
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
        <Spinner className="size-6 text-primary" />
        <p className="text-xs text-muted-foreground">Loading history...</p>
      </div>
    );
  }

  if (historyList.length === 0) {
    return (
      <div className="p-12 rounded-2xl border border-dashed border-border bg-card/40 text-center space-y-3 max-w-md mx-auto my-6">
        <div className="size-12 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto">
          <FileText className="size-6" />
        </div>
        <h3 className="text-base font-bold text-foreground">No History</h3>
        <p className="text-xs text-muted-foreground">
          You haven't generated or scanned any resumes yet.
        </p>
        <Link href="/">
          <Button size="sm" className="font-bold gap-1.5 cursor-pointer mt-1">
            <Plus className="size-3.5" />
            <span>Scan Resume</span>
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {historyList.map((item) => {
        const score = item.match_score || 0;
        const status =
          score >= 85
            ? "Strong Match"
            : score >= 70
              ? "Good Match"
              : "Needs Work";

        const formattedDate = new Date(item.created_at).toLocaleDateString(
          undefined,
          {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          },
        );

        return (
          <Card
            key={item.id}
            className="p-5 border border-border/80 hover:border-primary/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-4">
              <div
                className={`size-12 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                  score >= 80
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                    : score >= 65
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                }`}
              >
                {score}%
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-foreground">
                    {item.job_title}
                  </h4>
                  {item.company_name && (
                    <span className="text-xs text-muted-foreground">
                      • {item.company_name}
                    </span>
                  )}
                  <Badge
                    variant={score >= 80 ? "default" : "secondary"}
                    className="text-[10px] py-0 px-2"
                  >
                    {status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <Clock className="size-3" />
                  <span>{formattedDate}</span>
                  {item.added_skills && item.added_skills.length > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        +{item.added_skills.length} skills added
                      </span>
                    </>
                  )}
                </p>

                {item.added_skills && item.added_skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.added_skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-medium border border-emerald-500/20"
                      >
                        +{skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(item)}
                className="text-xs gap-1.5 cursor-pointer"
              >
                <Download className="size-3.5" />
                <span>Download PDF</span>
              </Button>

              {item.pdf_url && (
                <a
                  href={item.pdf_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex"
                >
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    title="View PDF"
                    className="text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <ExternalLink className="size-4" />
                  </Button>
                </a>
              )}

              <Button
                variant="ghost"
                size="icon-sm"
                disabled={deletingId === item.id}
                onClick={() => handleDelete(item.id)}
                title="Delete"
                className="text-muted-foreground hover:text-destructive cursor-pointer"
              >
                {deletingId === item.id ? (
                  <Spinner className="size-3.5" />
                ) : (
                  <Trash2 className="size-4" />
                )}
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
