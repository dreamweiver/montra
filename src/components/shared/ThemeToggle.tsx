"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

const emptySubscribe = () => () => {};

export default function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  if (!mounted) {
    return (
      <Button variant="outline" size="sm" className="h-9" disabled>
        <Sun className="h-4 w-4" />
        Light
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded-md border px-3 h-9 text-sm font-medium cursor-pointer transition-colors"
      style={
        isDark
          ? { backgroundColor: "#ffffff", color: "#000000", borderColor: "#d1d5db" }
          : { backgroundColor: "#111827", color: "#ffffff", borderColor: "#374151" }
      }
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      {isDark ? "Light" : "Dark"}
    </button>
  );
}
