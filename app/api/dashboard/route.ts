export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/api-utils";

export async function GET() {
  try {
    await requireAdmin();
    const [totalReports, totalValidations, byStatus, byCategory, priorities] = await Promise.all([
      prisma.report.count(),
      prisma.validation.count(),
      prisma.report.groupBy({ by: ["status"], _count: { status: true } }),
      prisma.report.groupBy({ by: ["category"], _count: { category: true } }),
      prisma.report.findMany({
        orderBy: [{ priorityScore: "desc" }, { createdAt: "desc" }],
        take: 10,
        include: { validations: true }
      })
    ]);

    return NextResponse.json({ totalReports, totalValidations, byStatus, byCategory, priorities });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return jsonError("Anda harus login", 401);
    if (error instanceof Error && error.message === "FORBIDDEN") return jsonError("Akses hanya untuk administrator", 403);
    return jsonError(error instanceof Error ? error.message : "Dashboard gagal dimuat");
  }
}
