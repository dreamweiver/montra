"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkBudgetStatus } from "@/actions/budgets";
import { formatCurrency } from "@/lib/utils";
import type { BudgetStatus } from "@/types";

export default function BudgetIndicator() {
  const [status, setStatus] = useState<BudgetStatus | null>(null);
  const [animated, setAnimated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkBudgetStatus().then((result) => {
      if (result.success && result.data?.hasBudget) {
        setStatus(result.data);
        // Trigger animation after mount
        requestAnimationFrame(() => setAnimated(true));
      }
    });
  }, []);

  if (!status) return null;

  const exceeded = status.percentage >= 100;
  const fillWidth = Math.min(status.percentage, 100);

  return (
    <div
      className="flex items-center gap-2 cursor-pointer group"
      onClick={() => router.push("/dashboard/budgets")}
    >
      {/* Tooltip */}
      <div className="absolute top-full mt-1 right-0 hidden group-hover:block z-50">
        <div className="bg-popover text-popover-foreground text-xs rounded-md border shadow-md px-3 py-2 whitespace-nowrap">
          {formatCurrency(status.spent, status.currency)} of {formatCurrency(status.limit, status.currency)} spent
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative w-24 sm:w-32 h-5 bg-muted rounded-full overflow-hidden shadow-inner">
        {/* Filled portion with gradient and shine */}
        <div
          className="h-full rounded-full relative transition-all duration-700 ease-out"
          style={{
            width: animated ? `${fillWidth}%` : "0%",
            background: exceeded
              ? "linear-gradient(90deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)"
              : "linear-gradient(90deg, #22c55e 0%, #16a34a 50%, #15803d 100%)",
          }}
        >
          {/* Shine overlay for fluid look */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.1) 100%)",
            }}
          />
        </div>

        {/* Label inside the bar */}
        <span
          className="absolute inset-0 flex items-center justify-center text-[10px] font-bold tracking-wide"
          style={{
            color: exceeded ? "#dc2626" : (fillWidth > 40 ? "#ffffff" : "var(--foreground)"),
            textShadow: fillWidth > 40 && !exceeded ? "0 1px 2px rgba(0,0,0,0.3)" : "none",
          }}
        >
          {status.percentage}%
        </span>
      </div>
    </div>
  );
}
