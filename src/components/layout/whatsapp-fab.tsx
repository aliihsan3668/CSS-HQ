"use client";

import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function WhatsAppFab() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <Link
      href="https://wa.me/923085202620?text=Hi%20CSS%20HQ,%20I%20have%20a%20question%20about%20the%20notes."
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className={`fixed bottom-5 right-5 z-30 size-14 rounded-full bg-[#25D366] hover:bg-[#1ebe5b] text-white grid place-items-center shadow-lg transition-all hover:scale-110 ${
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <MessageCircle className="size-7" fill="currentColor" stroke="white" strokeWidth={1.5} />
      <span className="absolute -top-1 -right-1 size-3.5 rounded-full bg-red-500 border-2 border-white animate-pulse" />
    </Link>
  );
}
