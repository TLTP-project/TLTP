"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck, XCircle, AlertTriangle } from "lucide-react";
import { mockReports } from "@/features/reports";
import { resolveReport, moderatePost } from "@/features/moderation";
import { mockDatabase } from "@/lib/db";
import type { Report, ReportStatus } from "@/types";

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [activeTab, setActiveTab] = useState<ReportStatus | "all">("all");

  const filteredReports = reports.filter(
    (r) => activeTab === "all" || r.status === activeTab
  );

  async function handleTakeAction(
    reportId: string,
    postId: string,
    action: "hide" | "delete" | "dismiss"
  ) {
    if (action === "hide" || action === "delete") {
      await moderatePost({
        adminId: "admin-system",
        postId,
        action,
        note: `Actioned via report ${reportId}`,
      });

      await resolveReport({
        adminId: "admin-system",
        reportId,
        status: "actioned",
        actionTaken: action === "hide" ? "Đã tạm ẩn bài viết" : "Đã xóa bài viết",
      });
    } else {
      await resolveReport({
        adminId: "admin-system",
        reportId,
        status: "dismissed",
        actionTaken: "Bác bỏ báo cáo (nội dung hợp lệ)",
      });
    }

    setReports([...mockReports]);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-6">
      <div className="flex items-center justify-between border-b border-stone-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-900 mb-1 border border-amber-200">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
            Trang quản trị viên (Admin)
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">
            Xử lý báo cáo vi phạm
          </h1>
        </div>

        <Link
          href="/admin/moderation"
          className="rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50"
        >
          Bảng kiểm duyệt nội dung
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-stone-200 pb-1">
        {(["all", "pending", "actioned", "dismissed"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
              activeTab === tab
                ? "bg-stone-900 text-white"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            {tab === "all" ? "Tất cả" : tab === "pending" ? "Đang chờ" : tab === "actioned" ? "Đã xử lý" : "Đã bác bỏ"}
          </button>
        ))}
      </div>

      {/* Report Items */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="rounded-3xl border border-stone-200 bg-white p-12 text-center text-xs text-stone-400">
            Không có báo cáo nào trong danh mục này.
          </div>
        ) : (
          filteredReports.map((report) => {
            const targetPost = mockDatabase.posts.find((p) => p.id === report.post_id);
            const isPending = report.status === "pending";

            return (
              <div
                key={report.id}
                className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-stone-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-800">
                      Mã báo cáo: {report.id}
                    </span>
                    <span className="text-stone-300">•</span>
                    <span className="rounded bg-rose-50 px-2 py-0.5 font-semibold text-rose-700">
                      Lý do: {report.reason}
                    </span>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      report.status === "pending"
                        ? "bg-amber-100 text-amber-800"
                        : report.status === "actioned"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-stone-100 text-stone-700"
                    }`}
                  >
                    {report.status}
                  </span>
                </div>

                {report.details && (
                  <p className="text-xs text-stone-600 italic bg-stone-50 p-2.5 rounded-xl">
                    Chi tiết từ người báo cáo: &quot;{report.details}&quot;
                  </p>
                )}

                {/* Target post snippet */}
                {targetPost && (
                  <div className="rounded-xl border border-stone-100 bg-stone-50/70 p-3 text-xs space-y-1">
                    <div className="font-semibold text-stone-700 flex items-center justify-between">
                      <span>Bài viết bị báo cáo (Mã: {targetPost.id}):</span>
                      <span className="text-[11px] text-stone-400">
                        Trạng thái hiện tại: {targetPost.status}
                      </span>
                    </div>
                    <p className="text-stone-800 line-clamp-2">{targetPost.processed_text}</p>
                  </div>
                )}

                {/* Action buttons */}
                {isPending && (
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-stone-100">
                    <button
                      onClick={() =>
                        handleTakeAction(report.id, report.post_id, "dismiss")
                      }
                      className="inline-flex items-center gap-1 rounded-xl border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                    >
                      <XCircle className="h-3.5 w-3.5" /> Bác bỏ báo cáo
                    </button>
                    <button
                      onClick={() => handleTakeAction(report.id, report.post_id, "hide")}
                      className="inline-flex items-center gap-1 rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
                    >
                      <AlertTriangle className="h-3.5 w-3.5" /> Tạm ẩn bài viết
                    </button>
                    <button
                      onClick={() => handleTakeAction(report.id, report.post_id, "delete")}
                      className="inline-flex items-center gap-1 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
                    >
                      Xóa bài viết vĩnh viễn
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
