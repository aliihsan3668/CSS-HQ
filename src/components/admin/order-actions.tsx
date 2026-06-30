"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Loader2, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";

type OrderStatus = "PENDING" | "APPROVED" | "REJECTED";

interface OrderActionsProps {
  orderId: string;
  status: OrderStatus;
  approvedAt?: string | null;
  rejectionReason?: string | null;
}

export function OrderActions({
  orderId,
  status,
  approvedAt,
  rejectionReason,
}: OrderActionsProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");

  async function approve() {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, action: "APPROVE" }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to approve order");
      }
      toast.success("Order approved", {
        description: "Access has been granted and the student has been emailed.",
      });
      router.refresh();
    } catch (e) {
      toast.error("Failed to approve", {
        description: e instanceof Error ? e.message : "Unknown error",
      });
    } finally {
      setBusy(false);
    }
  }

  async function reject() {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          action: "REJECT",
          rejectionReason: reason.trim() || "Payment could not be verified.",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to reject order");
      }
      toast.success("Order rejected", {
        description: "The student has been notified by email.",
      });
      setRejectOpen(false);
      setReason("");
      router.refresh();
    } catch (e) {
      toast.error("Failed to reject", {
        description: e instanceof Error ? e.message : "Unknown error",
      });
    } finally {
      setBusy(false);
    }
  }

  if (status === "APPROVED") {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-900 px-3 py-2.5">
          <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
              Approved
            </span>
            {approvedAt && (
              <span className="text-xs text-emerald-700/80 dark:text-emerald-400/70">
                on {formatDate(approvedAt)}
              </span>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          The student now has access to all subjects in this order. They were notified by email.
        </p>
      </div>
    );
  }

  if (status === "REJECTED") {
    return (
      <div className="space-y-3">
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/40 dark:border-red-900 px-3 py-2.5">
          <XCircle className="size-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-red-800 dark:text-red-300">
              Rejected
            </span>
            {rejectionReason && (
              <span className="text-xs text-red-700/80 dark:text-red-400/70 leading-relaxed">
                {rejectionReason}
              </span>
            )}
          </div>
        </div>
        <Button
          onClick={approve}
          disabled={busy}
          className="w-full bg-brand-gradient hover:opacity-90"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
          Approve anyway
        </Button>
      </div>
    );
  }

  // PENDING
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-900 px-3 py-2.5">
        <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400 shrink-0" />
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">
            Awaiting your review
          </span>
          <span className="text-xs text-amber-700/80 dark:text-amber-400/70">
            Verify the receipt matches the order total before approving.
          </span>
        </div>
      </div>
      <Button
        onClick={approve}
        disabled={busy}
        className="w-full bg-brand-gradient hover:opacity-90"
        size="lg"
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
        Approve &amp; grant access
      </Button>

      <AlertDialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            disabled={busy}
            className={cn(
              "w-full border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800",
              "dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
            )}
          >
            <X className="size-4" />
            Reject order
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject this order?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <span>
                The student will be notified by email. Provide a short reason so they know what to fix.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="reason" className="text-xs">
              Rejection reason (optional)
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Receipt amount does not match. Please resubmit with the correct payment."
              rows={4}
              maxLength={500}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                reject();
              }}
              disabled={busy}
              className="bg-destructive text-white hover:bg-destructive/90 dark:bg-destructive/70"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : null}
              Reject order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
