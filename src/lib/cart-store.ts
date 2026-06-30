"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  type: "subject" | "bundle";
  id: string; // subject slug or bundle type
  title: string;
  pricePkr: number;
  subjectSlugs?: string[]; // for bundles — the subjects included
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  add: (item: CartItem) => void;
  remove: (id: string) => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  total: () => number;
  has: (id: string) => boolean;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      add: (item) => {
        const items = get().items;
        if (items.some((i) => i.id === item.id)) return;
        set({ items: [...items, item], isOpen: true });
      },
      remove: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      clear: () => set({ items: [] }),
      setOpen: (open) => set({ isOpen: open }),
      toggle: () => set({ isOpen: !get().isOpen }),
      total: () => get().items.reduce((sum, i) => sum + i.pricePkr, 0),
      has: (id) => get().items.some((i) => i.id === id),
    }),
    { name: "css-hq-cart" }
  )
);

// Bundle helpers
export const BUNDLE_IDS = {
  compulsory: "bundle-compulsory",
  optional: "bundle-optional",
  full: "bundle-full",
  launch: "bundle-launch",
} as const;
