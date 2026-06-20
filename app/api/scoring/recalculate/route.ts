export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/api-utils";
import { calculateServerPriority } from "@/lib/server-scoring";

export async function POST() {
  try {
    await requireAdmin();
    const weights = await prisma.priorityWeight.findFirst({ orderBy: { createdAt: "desc" } });
    if (!weights) return jsonError("Konfigurasi bobot priority scoring belum tersedia", 404);

    const reports = await prisma.report.findMany({ include: { validations: true } });
    const updated = await Promise.all(
      reports.map((report) =>
        prisma.report.update({
          where: { id: report.id },
          data: { priorityScore: calculateServerPriority(report, weights) }
        })
      )
    );

    return NextResponse.json({ updated: updated.length });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return jsonError("Anda harus login", 401);
    if (error instanceof Error && error.message === "FORBIDDEN") return jsonError("Akses hanya untuk administrator", 403);
    return jsonError(error instanceof Error ? error.message : "Priority scoring gagal dihitung ulang");
  }
}
