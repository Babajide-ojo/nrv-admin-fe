"use client";

import { useEffect } from "react";
import {
  expireAdminSession,
  isAdminIdleExpired,
  touchAdminActivity,
} from "@/lib/sessionIdle";

const ACTIVITY_EVENTS: Array<keyof WindowEventMap> = [
  "mousedown",
  "keydown",
  "touchstart",
  "scroll",
];

export const useAdminSessionIdleTimeout = (enabled = true) => {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      return;
    }

    touchAdminActivity();

    let throttleUntil = 0;
    const bumpActivity = () => {
      const now = Date.now();
      if (now < throttleUntil) {
        return;
      }
      throttleUntil = now + 1000;
      touchAdminActivity();
    };

    const checkIdle = () => {
      if (isAdminIdleExpired()) {
        expireAdminSession();
      }
    };

    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, bumpActivity, { passive: true });
    });
    document.addEventListener("visibilitychange", checkIdle);
    const intervalId = window.setInterval(checkIdle, 30000);

    return () => {
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, bumpActivity);
      });
      document.removeEventListener("visibilitychange", checkIdle);
      window.clearInterval(intervalId);
    };
  }, [enabled]);
};
