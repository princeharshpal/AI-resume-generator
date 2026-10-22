import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="size-20 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
          <FileQuestion className="size-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Error 404
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Page Not Found
          </h1>
          <p className="text-sm text-muted-foreground">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="pt-2">
          <Link href="/">
            <Button className="h-11 px-6 rounded-xl text-sm font-semibold gap-2">
              <ArrowLeft className="size-4" />
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
