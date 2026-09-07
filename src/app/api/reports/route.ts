import { NextRequest, NextResponse } from "next/server";
import { submitReport, getReports } from "@/features/reports";
import { getCurrentDevUser } from "@/features/auth";
import type { ReportStatus } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const user = getCurrentDevUser();
    const body = await request.json();

    const result = await submitReport(user.id, body);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      report: result.report,
      message: "Cảm ơn bạn đã báo cáo. Ban quản trị sẽ rà soát nội dung này.",
    });
  } catch (error) {
    console.error("API /api/reports POST error:", error);
    return NextResponse.json({ error: "Lỗi xử lý báo cáo" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as ReportStatus | null;

  const reports = await getReports(status || undefined);
  return NextResponse.json({ reports });
}
