// =============================================================================
// EmptyState Component
// =============================================================================
// A reusable empty state placeholder with icon, title, and description.
// Used when no data is available to display.
// =============================================================================

import { Receipt } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

// ---------------------------------------------
// Component Props
// ---------------------------------------------
interface EmptyStateProps {
  /** Icon to display (defaults to Receipt) */
  icon?: LucideIcon;
  /** Main title text */
  title: string;
  /** Description text */
  description?: string;
  /** Optional action button or content */
  action?: ReactNode;
  /** Additional content below description */
  children?: ReactNode;
}

// =============================================================================
// Main Component
// =============================================================================
export default function EmptyState({
  icon: Icon = Receipt,
  title,
  description,
  action,
  children,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-6">
      {/* Icon Circle */}
      <div className="relative">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
          <Icon className="h-12 w-12 text-muted-foreground" />
        </div>
      </div>

      {/* Text Content */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">{title}</h3>
        {description && (
          <p className="text-muted-foreground max-w-sm">{description}</p>
        )}
      </div>

      {/* Additional Content (e.g., tips, icons) */}
      {children}

      {/* Action Button */}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
