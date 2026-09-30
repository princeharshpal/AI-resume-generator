import type { Metadata } from "next";
import { Geist, Geist_Mono, Figtree } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";
import { AuthProvider } from "@/context/AuthContext";
import AuthModal from "@/components/AuthModal";

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
  title: "SmartResume AI - Tailor Your Resume for Your Dream Job",
  description:
    "Get instant ATS score, missing skills analysis, and a customized resume for full stack developer roles.",
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
          <div className="flex-1 bg-gradient-to-b from-background via-background to-muted/20 text-foreground pb-20">
            {children}
          </div>
          <AuthModal />
        </AuthProvider>
      </body>
    </html>
  );
}
