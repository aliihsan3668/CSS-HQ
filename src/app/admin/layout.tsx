import { notFound } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, ExternalLink, Mail } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { AdminNav } from "@/components/admin/admin-nav";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin · CSS HQ",
  description: "Admin control center for CSS HQ.",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") notFound();

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Admin top bar (sticky) */}
      <div className="sticky top-16 z-20 border-b bg-sidebar/80 backdrop-blur-md">
        <div className="flex h-12 items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <ShieldCheck className="size-4 text-primary shrink-0" />
            <span className="text-sm font-semibold truncate">CSS HQ Admin</span>
            <span className="hidden sm:inline text-xs text-muted-foreground truncate">
              · signed in as {user.email}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <Mail className="size-3.5" />
              My dashboard
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              <ExternalLink className="size-3.5" />
              Back to site
            </Link>
          </div>
        </div>
      </div>

      {/* Admin body: sidebar + main */}
      <div className="flex-1 flex">
        <AdminNav />
        <div className="flex-1 min-w-0">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
