import Link from "next/link";
import { GraduationCap, Mail, Phone, ShieldCheck, MessageCircle } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t bg-secondary/40">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="size-9 rounded-xl bg-brand-gradient grid place-items-center shadow-brand">
                <GraduationCap className="size-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-extrabold text-lg tracking-tight">
                CSS <span className="text-gradient-brand">HQ</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
              Premium, exam-focused notes for the CSS exam. Built by a top scorer
              who walked the same path. 12 subjects, 95% exam coverage, and the
              guaranteed-question system that turns months of prep into weeks.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                <ShieldCheck className="size-3.5" />
                Verified Seller
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-gold/15 text-gold">
                95% Coverage
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Explore</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/subjects" className="hover:text-primary transition-colors">
                  Browse Notes
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="hover:text-primary transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-primary transition-colors">
                  My Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Get Help</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a
                  href="https://wa.me/923085202620"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <MessageCircle className="size-4" />
                  +92 308 5202620
                </a>
              </li>
              <li>
                <a
                  href="mailto:aliihsan.devs@gmail.com"
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <Mail className="size-4" />
                  aliihsan.devs@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {year} CSS HQ. All rights reserved. Built for aspirants, by an aspirant.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link href="/refund-policy" className="hover:text-primary">
              Refund Policy
            </Link>
            <Link href="/terms" className="hover:text-primary">
              Terms
            </Link>
            <span className="hidden sm:inline">Local payments: JazzCash · EasyPaisa · NayaPay · SadaPay · Payoneer</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
