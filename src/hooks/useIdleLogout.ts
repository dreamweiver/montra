import { useEffect, useRef, useCallback } from "react";

const ACTIVITY_EVENTS = ["mousedown", "keydown", "touchstart", "scroll"] as const;

export function useIdleLogout(timeoutMs: number, onLogout: () => void) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(onLogout, timeoutMs);
  }, [onLogout, timeoutMs]);

  useEffect(() => {
    resetTimer();

    const handler = () => resetTimer();
    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, handler, { passive: true });
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, handler);
      }
    };
  }, [resetTimer]);
}
