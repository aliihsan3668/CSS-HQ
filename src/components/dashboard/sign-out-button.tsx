"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";
import { useState } from "react";

interface SignOutButtonProps {
  variant?: "ghost" | "outline" | "default";
  size?: "sm" | "default" | "lg" | "icon";
  className?: string;
  label?: string;
  showIcon?: boolean;
}

export function SignOutButton({
  variant = "ghost",
  size = "sm",
  className,
  label = "Sign out",
  showIcon = true,
}: SignOutButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    // signOut handles the redirect to callbackUrl
    await signOut({ callbackUrl: "/" });
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleSignOut}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin mr-1.5" />
      ) : (
        showIcon && <LogOut className="size-4 mr-1.5" />
      )}
      {label}
    </Button>
  );
}
