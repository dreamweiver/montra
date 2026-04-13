// =============================================================================
// LoadingOverlay Component
// =============================================================================
// A reusable loading overlay with animated icon and bouncing dots.
// Used to indicate async operations are in progress.
// =============================================================================

import { Wallet, Loader2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ---------------------------------------------
// Component Props
// ---------------------------------------------
interface LoadingOverlayProps {
  /** Text to display while loading */
  message?: string;
  /** Custom icon to display (defaults to Wallet) */
  icon?: LucideIcon;
  /** Use simple spinner instead of animated icon */
  simple?: boolean;
}

// =============================================================================
// Main Component
// =============================================================================
export default function LoadingOverlay({
  message = "Loading...",
  icon: Icon = Wallet,
  simple = false,
}: LoadingOverlayProps) {
  // ---------------------------------------------
  // Simple Spinner Variant
  // ---------------------------------------------
  if (simple) {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
    );
  }

  // ---------------------------------------------
  // Full Animated Variant
  // ---------------------------------------------
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6">
        {/* Animated icon with ping effect */}
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Icon className="h-10 w-10 text-primary animate-pulse" />
          </div>
        </div>

        {/* Loading text with bouncing dots */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-lg font-medium">{message}</p>
          <div className="flex gap-1">
            <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
            <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
            <span className="h-2 w-2 rounded-full bg-primary animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  );
}
