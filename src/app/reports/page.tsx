"use client";

import { useEffect, useState } from "react";
import AdminSidebarLayout from "@/components/layout/AdminSidebarLayout";
import { Button } from "@/components/ui/button";
import {
  downloadActivityReportsCsv,
  fetchActivityReports,
  type ActivityReportRow,
} from "@/lib/api/activity-reports";

export default function ReportsPage() {
  const [rows, setRows] = useState<ActivityReportRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchActivityReports(100);
        setRows(data);
      } catch {
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  return (
    <AdminSidebarLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System reports</h1>
            <p className="text-sm text-gray-600 mt-1">
              Recent platform activity across users, verifications, and listings.
            </p>
          </div>
          <Button
            type="button"
            disabled={loading || rows.length === 0}
            onClick={() => downloadActivityReportsCsv(rows)}
          >
            Download CSV
          </Button>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          {loading ? (
            <p className="p-6 text-sm text-gray-500">Loading reports…</p>
          ) : rows.length === 0 ? (
            <p className="p-6 text-sm text-gray-500">No activity reports yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-left text-gray-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Event</th>
                    <th className="px-4 py-3 font-medium">Details</th>
                    <th className="px-4 py-3 font-medium">User ID</th>
                    <th className="px-4 py-3 font-medium">When</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={`${row.createdAt}-${index}`} className="border-t">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {row.type}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{row.details}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {row.userId || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {new Date(row.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminSidebarLayout>
  );
}
