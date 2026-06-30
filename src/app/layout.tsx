import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Providers } from "@/app/providers/providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/layout/cart-drawer";
import { WhatsAppFab } from "@/components/layout/whatsapp-fab";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CSS HQ — Premium CSS Exam Notes | 95% Exam Coverage",
  description:
    "Premium, exam-focused notes for the CSS exam. 12 subjects, color-coded most-likely questions, full model answers, MCQ banks, and 2016–2025 past paper analysis. 95% guaranteed coverage.",
  keywords: [
    "CSS exam",
    "CSS notes",
    "CSS preparation",
    "Pakistan CSS",
    "CSS past papers",
    "CSS subjects",
    "CSS MCQs",
    "Civil Service Pakistan",
  ],
  authors: [{ name: "Ali Ihsan" }],
  openGraph: {
    title: "CSS HQ — Premium CSS Exam Notes",
    description:
      "12 subjects. Color-coded most-likely questions. Full answers. MCQ banks. 2016–2025 past papers. 95% exam coverage.",
    siteName: "CSS HQ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CSS HQ — Premium CSS Exam Notes",
    description:
      "12 subjects. Color-coded most-likely questions. Full answers. MCQ banks. 2016–2025 past papers. 95% exam coverage.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        <Providers>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
          <CartDrawer />
          <WhatsAppFab />
          <Toaster />
          <SonnerToaster position="bottom-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
