export const ADMIN_SESSION_IDLE_MS = 30 * 60 * 1000;
export const ADMIN_LAST_ACTIVE_KEY = "nrv-admin-frontend-last-active";

export const touchAdminActivity = () => {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(ADMIN_LAST_ACTIVE_KEY, String(Date.now()));
};

export const isAdminIdleExpired = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }
  const raw = localStorage.getItem(ADMIN_LAST_ACTIVE_KEY);
  if (!raw) {
    return false;
  }
  const lastActive = Number(raw);
  if (!Number.isFinite(lastActive)) {
    return false;
  }
  return Date.now() - lastActive > ADMIN_SESSION_IDLE_MS;
};

export const expireAdminSession = () => {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem(ADMIN_LAST_ACTIVE_KEY);
  window.location.href =
    "/login?reason=" +
    encodeURIComponent(
      "Your session expired due to inactivity. Please sign in again.",
    );
};
