import api from './axios';

export type ActivityReportRow = {
  type: string;
  details: string;
  userId?: string;
  createdAt: string;
};

export const fetchActivityReports = async (
  limit = 100,
): Promise<ActivityReportRow[]> => {
  const response = await api.get(`/activities/admin/reports?limit=${limit}`);
  return response.data?.data ?? [];
};

export const downloadActivityReportsCsv = (rows: ActivityReportRow[]) => {
  const header = ["Event", "Details", "User ID", "When"];
  const lines = rows.map((row) =>
    [
      row.type,
      row.details,
      row.userId ?? "",
      row.createdAt,
    ]
      .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
      .join(","),
  );
  const csv = [header.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `nrv-activity-report-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};
