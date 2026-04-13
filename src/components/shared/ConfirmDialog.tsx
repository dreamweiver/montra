"use client";

// =============================================================================
// ConfirmDialog Component
// =============================================================================
// A reusable confirmation dialog for destructive actions.
// Used for delete confirmations and other important actions.
// =============================================================================

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
import type { ReactNode } from "react";

// ---------------------------------------------
// Component Props
// ---------------------------------------------
interface ConfirmDialogProps {
  /** Trigger element (e.g., delete button) - optional for controlled mode */
  trigger?: ReactNode;
  /** Dialog title */
  title: string;
  /** Dialog description/message */
  description: string;
  /** Confirm button text (default: "Continue") */
  confirmText?: string;
  /** Cancel button text (default: "Cancel") */
  cancelText?: string;
  /** Callback when confirmed */
  onConfirm: () => void | Promise<void>;
  /** Whether the action is destructive (red button) */
  destructive?: boolean;
  /** Loading state disables buttons */
  loading?: boolean;
  /** Open state (controlled) */
  open?: boolean;
  /** Open state change handler (controlled) */
  onOpenChange?: (open: boolean) => void;
}

// =============================================================================
// Main Component
// =============================================================================
export default function ConfirmDialog({
  trigger,
  title,
  description,
  confirmText = "Continue",
  cancelText = "Cancel",
  onConfirm,
  destructive = false,
  loading = false,
  open,
  onOpenChange,
}: ConfirmDialogProps) {
  // ---------------------------------------------
  // Handle Confirm Click
  // ---------------------------------------------
  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className={destructive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
          >
            {loading ? "Processing..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
