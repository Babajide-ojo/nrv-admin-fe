export interface VerificationRow {
  id: string;
  reference: string;
  tenantName: string;
  email: string;
  verificationType: "standard" | "premium";
  status: "approved" | "rejected" | "pending";
  submittedDate: string;
  createdAt?: string;
}

export const formatVerificationStatusAction = (
  status: VerificationRow["status"],
): string => {
  if (status === "approved") {
    return "Verification approved";
  }
  if (status === "rejected") {
    return "Verification rejected";
  }
  return "Verification submitted";
};

export const mapVerificationToRow = (v: Record<string, unknown>): VerificationRow => {
  const status = (v.status as string)?.toLowerCase();
  const validStatus = ["approved", "rejected", "pending"].includes(status)
    ? status
    : "pending";
  const tier = (v.verificationTier as string)?.toLowerCase();
  const verificationType =
    tier === "premium" || tier === "standard" ? tier : "standard";
  const uniqueId = v.uniqueId != null ? String(v.uniqueId) : null;
  const id = String(v._id ?? v.id ?? "");
  const createdAt = v.createdAt ? String(v.createdAt) : undefined;

  return {
    id,
    reference: uniqueId ? `VRF-${uniqueId}` : id ? id.slice(-6) : "—",
    tenantName: `${v.firstName ?? ""} ${v.lastName ?? ""}`.trim() || "Unknown",
    email: (v.email as string) ?? "",
    verificationType: verificationType as "standard" | "premium",
    status: validStatus as "approved" | "rejected" | "pending",
    submittedDate: createdAt ? new Date(createdAt).toLocaleDateString() : "—",
    createdAt,
  };
};

export const formatRelativeTime = (createdAt?: string): string => {
  if (!createdAt) {
    return "—";
  }
  const then = new Date(createdAt).getTime();
  if (Number.isNaN(then)) {
    return "—";
  }
  const diffMs = then - Date.now();
  const diffSec = Math.round(diffMs / 1000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const absSec = Math.abs(diffSec);
  if (absSec < 60) {
    return rtf.format(diffSec, "second");
  }
  const diffMin = Math.round(diffSec / 60);
  if (Math.abs(diffMin) < 60) {
    return rtf.format(diffMin, "minute");
  }
  const diffHour = Math.round(diffMin / 60);
  if (Math.abs(diffHour) < 24) {
    return rtf.format(diffHour, "hour");
  }
  const diffDay = Math.round(diffHour / 24);
  if (Math.abs(diffDay) < 30) {
    return rtf.format(diffDay, "day");
  }
  const diffMonth = Math.round(diffDay / 30);
  return rtf.format(diffMonth, "month");
};
