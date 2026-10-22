import type { Metadata } from "next";
import { Geist, Geist_Mono, Figtree } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";
import { AuthProvider } from "@/context/AuthContext";
import AuthModal from "@/components/AuthModal";
import { Toaster } from "@/components/ui/sonner";

import Footer from "@/components/Footer";

const figtree = Figtree({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SmartResume AI | ATS Resume Scanner & Optimizer",
    template: "%s | SmartResume AI",
  },
  description:
    "Instantly evaluate your ATS score, uncover missing skills, and generate tailored ATS-optimized resumes designed to pass recruiter screens.",
  icons: {
    icon: "/favicon.ico",
  },
  keywords: [
    "ATS resume scanner",
    "resume optimizer",
    "ATS match score",
    "tailored resume builder",
    "job description keyword matcher",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full antialiased font-sans",
        geistSans.variable,
        geistMono.variable,
        figtree.variable,
      )}
    >
      <body className="min-h-full flex flex-col antialiased selection:bg-primary/20 selection:text-primary">
        <AuthProvider>
          <Header />
          <div className="flex-1 bg-gradient-to-b from-background via-background to-muted/20 text-foreground pb-12">
            {children}
          </div>
          <Footer />
          <AuthModal />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
