"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  BookOpen,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: Package },
  { href: "/admin/subjects", label: "Subjects", icon: BookOpen },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r bg-sidebar/60 backdrop-blur-sm">
        <div className="px-5 py-5 border-b">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-xl bg-brand-gradient grid place-items-center shadow-brand">
              <ShieldCheck className="size-5 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-extrabold text-base tracking-tight">
                CSS HQ <span className="text-gradient-brand">Admin</span>
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">
                Control center
              </span>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-5 py-4 border-t">
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            ← Back to site
          </Link>
        </div>
      </aside>

      {/* Mobile horizontal scroll tabs */}
      <nav className="lg:hidden sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b">
        <div className="flex items-center gap-1 overflow-x-auto px-3 py-2 scrollbar-premium">
          <div className="flex items-center gap-2 pr-3 pl-1 mr-1 border-r shrink-0">
            <div className="size-7 rounded-lg bg-brand-gradient grid place-items-center">
              <ShieldCheck className="size-4 text-white" />
            </div>
            <span className="font-bold text-sm">Admin</span>
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors shrink-0",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="size-3.5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
