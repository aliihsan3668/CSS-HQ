"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const FAQS = [
  {
    q: "How do I access my notes after paying?",
    a: "After your payment is verified (usually within 5–10 minutes during the day), you'll get an email and your notes will be unlocked in your dashboard. Just sign in, click 'My Dashboard', and download/view the PDFs.",
  },
  {
    q: "What payment methods do you accept?",
    a: "JazzCash, EasyPaisa, NayaPay, SadaPay, and Payoneer. Pay to the account number shown at checkout, upload a screenshot/receipt, and we verify it manually. This keeps things safe for both of us.",
  },
  {
    q: "What does '95% exam coverage' actually mean?",
    a: "It means that based on our analysis of past papers from 2016–2025 and the color-coded likelihood system, ~95% of questions that appear in the CSS exam will be covered by the most-likely questions, MCQ banks, and past papers in these notes. We stand behind this — if a major topic is missing, we'll add it for free.",
  },
  {
    q: "Are these notes PDFs or videos?",
    a: "PDFs. Beautifully formatted, color-coded, and organized topic-wise. You can read them on any device, print them, or annotate them. No videos — just focused, high-yield written content.",
  },
  {
    q: "Can I buy just one subject?",
    a: "Yes — every subject is available individually at 1,500 PKR. But bundles save you up to 33%, so most serious aspirants go for a bundle.",
  },
  {
    q: "Do I get free updates?",
    a: "Yes. When the next exam cycle's past papers are added or new questions are identified, you get them for free — for life.",
  },
  {
    q: "What if my payment is rejected?",
    a: "If we can't verify your payment (wrong amount, unclear screenshot, etc.), you'll get an email explaining why. Just reply with the correct details and we'll re-verify. No money is lost — your access is just delayed.",
  },
  {
    q: "Is there a refund policy?",
    a: "Because these are digital products that can be copied once accessed, we can't offer refunds after access is granted. But before access, if your payment is rejected, you get a full refund. We're also reachable on WhatsApp if you have any issue.",
  },
  {
    q: "Who made these notes?",
    a: "Ali Ihsan — a CSS aspirant who walked the same path and built these notes for himself first. After scoring well, he's sharing them with serious aspirants. Reachable directly at +92 308 5202620.",
  },
  {
    q: "Can I share my access with friends?",
    a: "Please don't. Each purchase is for one student. Sharing hurts the creator who spent months building these. If your friends want notes, send them our way — we offer bundle discounts.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="py-20 sm:py-28">
      <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-primary mb-3">
            <HelpCircle className="size-5" />
            <span className="text-sm font-bold uppercase tracking-wider">
              Frequently asked
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Got questions?{" "}
            <span className="text-gradient-brand">We've got answers.</span>
          </h2>
        </div>

        <Accordion type="single" collapsible className="mt-10 space-y-3">
          {FAQS.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="border rounded-xl px-5 bg-card hover:shadow-sm transition-shadow data-[state=open]:shadow-card-hover"
            >
              <AccordionTrigger className="text-left font-semibold hover:no-underline py-5">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
