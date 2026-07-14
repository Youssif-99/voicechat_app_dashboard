"use client";

import { useFormStatus } from "react-dom";

const VARIANTS: Record<string, string> = {
  success: "bg-success/10 text-success border-success/30 hover:bg-success/20",
  danger: "bg-danger/10 text-danger border-danger/30 hover:bg-danger/20",
  neutral: "bg-base-surface2 text-text-primary border-base-border hover:bg-base-border",
  gold: "bg-gold/10 text-gold border-gold/30 hover:bg-gold/20",
};

export function ActionButton({
  children,
  variant = "neutral",
  confirmMessage,
}: {
  children: React.ReactNode;
  variant?: keyof typeof VARIANTS;
  confirmMessage?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (confirmMessage && !confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
      className={`text-xs font-medium border rounded-lg px-3 py-1.5 transition disabled:opacity-50 ${VARIANTS[variant]}`}
    >
      {pending ? "..." : children}
    </button>
  );
}
